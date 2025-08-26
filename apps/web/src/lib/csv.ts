import type { DataRow } from '@weaveviz/shared';

export interface ParseResult {
  data: DataRow[];
  fileName: string;
  fileSize: number;
}

export interface ParseProgress {
  progress: number;
  stage: 'parsing' | 'processing' | 'complete';
}

export class CSVParser {
  private worker: Worker | null = null;

  constructor() {
    this.initWorker();
  }

  private initWorker() {
    try {
      this.worker = new Worker(
        new URL('../workers/parseWorker.ts', import.meta.url),
        { type: 'module' }
      );
    } catch (error) {
      console.warn('Web Worker not available, falling back to main thread parsing');
    }
  }

  async parseFile(
    file: File,
    onProgress?: (progress: ParseProgress) => void
  ): Promise<ParseResult> {
    const isCSV = file.name.toLowerCase().endsWith('.csv');
    const isExcel = file.name.toLowerCase().match(/\.(xlsx?|xls)$/);

    if (!isCSV && !isExcel) {
      throw new Error('Unsupported file type. Please upload a CSV or Excel file.');
    }

    if (file.size > 100 * 1024 * 1024) { // 100MB limit
      throw new Error('File size too large. Please upload a file smaller than 100MB.');
    }

    if (this.worker) {
      return this.parseWithWorker(file, isCSV, onProgress);
    } else {
      return this.parseInMainThread(file, isCSV, onProgress);
    }
  }

  private parseWithWorker(
    file: File,
    isCSV: boolean,
    onProgress?: (progress: ParseProgress) => void
  ): Promise<ParseResult> {
    return new Promise((resolve, reject) => {
      if (!this.worker) {
        reject(new Error('Worker not available'));
        return;
      }

      const handleMessage = (event: MessageEvent) => {
        const { type, data, error, progress } = event.data;

        if (type === 'progress' && onProgress) {
          onProgress({
            progress: progress || 0,
            stage: progress < 100 ? 'parsing' : 'complete'
          });
        } else if (type === 'success') {
          this.worker?.removeEventListener('message', handleMessage);
          resolve({
            data,
            fileName: file.name,
            fileSize: file.size
          });
        } else if (type === 'error') {
          this.worker?.removeEventListener('message', handleMessage);
          reject(new Error(error));
        }
      };

      this.worker.addEventListener('message', handleMessage);
      this.worker.postMessage({
        type: isCSV ? 'parseCSV' : 'parseExcel',
        file
      });
    });
  }

  private async parseInMainThread(
    file: File,
    isCSV: boolean,
    onProgress?: (progress: ParseProgress) => void
  ): Promise<ParseResult> {
    onProgress?.({ progress: 0, stage: 'parsing' });

    // Fallback parsing in main thread (simplified)
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = () => {
        try {
          onProgress?.({ progress: 50, stage: 'processing' });
          
          let data: DataRow[] = [];
          
          if (isCSV) {
            // Simple CSV parsing (not as robust as PapaParse)
            const text = reader.result as string;
            const lines = text.split('\n').filter(line => line.trim());
            
            if (lines.length === 0) {
              resolve({ data: [], fileName: file.name, fileSize: file.size });
              return;
            }

            const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
            
            data = lines.slice(1).map(line => {
              const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
              const row: DataRow = {};
              headers.forEach((header, index) => {
                const normalizedKey = header.toLowerCase().replace(/[^a-z0-9_]/g, '_');
                row[normalizedKey] = values[index] || null;
              });
              return row;
            });
          }
          
          onProgress?.({ progress: 100, stage: 'complete' });
          
          resolve({
            data,
            fileName: file.name,
            fileSize: file.size
          });
        } catch (error) {
          reject(new Error(`Parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      
      reader.readAsText(file);
    });
  }

  destroy() {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
  }
}
