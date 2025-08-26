import React, { useCallback, useState } from 'react';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import { CSVParser, type ParseProgress } from '@/lib/csv';
import { profileData } from '@/lib/profiler';
import { useDataStore } from '@/store/useDataStore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FileDropZoneProps {
  onFileProcessed?: () => void;
  className?: string;
}

export function FileDropZone({ onFileProcessed, className }: FileDropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [progress, setProgress] = useState<ParseProgress | null>(null);
  const { setRawData, setFieldProfiles, setProcessing, setError, isProcessing, error } = useDataStore();

  const parser = React.useMemo(() => new CSVParser(), []);

  // Clean up parser on unmount
  React.useEffect(() => {
    return () => {
      parser.destroy();
    };
  }, [parser]);

  const processFile = useCallback(async (file: File) => {
    try {
      setProcessing(true);
      setError(null);
      setProgress({ progress: 0, stage: 'parsing' });

      // Parse the file
      const result = await parser.parseFile(file, setProgress);
      
      setProgress({ progress: 90, stage: 'processing' });
      
      // Set raw data
      setRawData(result.data, result.fileName, result.fileSize);
      
      // Profile the data
      const profiles = profileData(result.data);
      setFieldProfiles(profiles);
      
      setProgress({ progress: 100, stage: 'complete' });
      
      // Call success callback
      onFileProcessed?.();
      
    } catch (err) {
      console.error('File processing error:', err);
      setError(err instanceof Error ? err.message : 'Failed to process file');
    } finally {
      setProcessing(false);
      setProgress(null);
    }
  }, [parser, setRawData, setFieldProfiles, setProcessing, setError, onFileProcessed]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    const file = files[0];

    if (file) {
      processFile(file);
    }
  }, [processFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  }, [processFile]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Card className={cn('relative', className)}>
      <CardContent className="p-8">
        <div
          className={cn(
            'border-2 border-dashed rounded-lg p-8 text-center transition-colors',
            isDragOver && 'border-primary bg-primary/5',
            !isDragOver && 'border-muted-foreground/25 hover:border-muted-foreground/50'
          )}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          {isProcessing ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center">
                <FileText className="h-12 w-12 text-primary animate-pulse" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Processing File...</h3>
                {progress && (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground capitalize">
                      {progress.stage}: {progress.progress}%
                    </p>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress.progress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : error ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center">
                <AlertCircle className="h-12 w-12 text-destructive" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-destructive">Upload Failed</h3>
                <p className="text-sm text-muted-foreground">{error}</p>
                <Button 
                  variant="outline" 
                  onClick={() => setError(null)}
                  className="mt-4"
                >
                  Try Again
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-center">
                <Upload className="h-12 w-12 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Upload Your Data</h3>
                <p className="text-muted-foreground">
                  Drag and drop your CSV or Excel file here, or click to browse
                </p>
                <p className="text-xs text-muted-foreground">
                  Supports .csv, .xlsx, .xls files up to 100MB
                </p>
              </div>
              <div className="space-y-2">
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload">
                  <Button asChild variant="outline">
                    <span className="cursor-pointer">
                      Choose File
                    </span>
                  </Button>
                </label>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
