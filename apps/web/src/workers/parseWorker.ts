import Papa from 'papaparse';
import * as XLSX from 'xlsx';

export interface ParseWorkerMessage {
  type: 'parseCSV' | 'parseExcel';
  file: File;
  sheetName?: string;
}

export interface ParseWorkerResponse {
  type: 'success' | 'error' | 'progress';
  data?: any[];
  error?: string;
  progress?: number;
}

// Normalize field names
function normalizeFieldName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
}

// Create mapping of normalized to original names
function createFieldMapping(headers: string[]): { normalized: string[]; mapping: Record<string, string> } {
  const mapping: Record<string, string> = {};
  const normalized = headers.map(header => {
    const norm = normalizeFieldName(header);
    mapping[norm] = header;
    return norm;
  });
  return { normalized, mapping };
}

// Parse CSV using PapaParse
function parseCSV(file: File): Promise<any[]> {
  return new Promise((resolve, reject) => {
    let isFirstChunk = true;
    let fieldMapping: Record<string, string> = {};
    let normalizedHeaders: string[] = [];
    const allData: any[] = [];

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      worker: false, // We're already in a worker
      chunk: (results) => {
        if (isFirstChunk) {
          // Set up field mapping on first chunk
          const originalHeaders = results.meta.fields || [];
          const { normalized, mapping } = createFieldMapping(originalHeaders);
          normalizedHeaders = normalized;
          fieldMapping = mapping;
          isFirstChunk = false;
        }

        // Normalize the data
        const normalizedData = results.data.map((row: any) => {
          const normalizedRow: any = {};
          Object.keys(row).forEach(key => {
            const normalizedKey = normalizeFieldName(key);
            normalizedRow[normalizedKey] = row[key];
          });
          return normalizedRow;
        });

        allData.push(...normalizedData);
        
        // Send progress updates
        self.postMessage({
          type: 'progress',
          progress: Math.min((allData.length / 1000) * 10, 90) // Rough progress estimate
        } as ParseWorkerResponse);
      },
      complete: () => {
        resolve(allData);
      },
      error: (error) => {
        reject(new Error(`CSV parsing error: ${error.message}`));
      }
    });
  });
}

// Parse Excel using SheetJS
function parseExcel(file: File, sheetName?: string): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Use specified sheet or first sheet
        const selectedSheetName = sheetName || workbook.SheetNames[0];
        if (!workbook.Sheets[selectedSheetName]) {
          reject(new Error(`Sheet "${selectedSheetName}" not found`));
          return;
        }
        
        const worksheet = workbook.Sheets[selectedSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        if (jsonData.length === 0) {
          resolve([]);
          return;
        }
        
        // Get headers from first row
        const headers = jsonData[0] as string[];
        const { normalized, mapping } = createFieldMapping(headers);
        
        // Convert to objects with normalized keys
        const normalizedData = jsonData.slice(1).map((row: any[]) => {
          const normalizedRow: any = {};
          headers.forEach((header, index) => {
            const normalizedKey = normalizeFieldName(header);
            normalizedRow[normalizedKey] = row[index];
          });
          return normalizedRow;
        }).filter(row => Object.values(row).some(val => val !== null && val !== undefined && val !== ''));
        
        resolve(normalizedData);
      } catch (error) {
        reject(new Error(`Excel parsing error: ${error instanceof Error ? error.message : 'Unknown error'}`));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsArrayBuffer(file);
  });
}

// Worker message handler
self.addEventListener('message', async (event: MessageEvent<ParseWorkerMessage>) => {
  const { type, file, sheetName } = event.data;
  
  try {
    self.postMessage({ type: 'progress', progress: 0 } as ParseWorkerResponse);
    
    let data: any[];
    
    if (type === 'parseCSV') {
      data = await parseCSV(file);
    } else if (type === 'parseExcel') {
      data = await parseExcel(file, sheetName);
    } else {
      throw new Error(`Unknown parse type: ${type}`);
    }
    
    self.postMessage({ 
      type: 'success', 
      data,
      progress: 100 
    } as ParseWorkerResponse);
    
  } catch (error) {
    self.postMessage({ 
      type: 'error', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    } as ParseWorkerResponse);
  }
});
