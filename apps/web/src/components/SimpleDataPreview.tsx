import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useDataStore } from '@/store/useDataStore';

export function SimpleDataPreview() {
  const { rawRows, fieldProfiles, isProcessing, error } = useDataStore();

  console.log('SimpleDataPreview state:', {
    rowCount: rawRows.length,
    profileCount: fieldProfiles.length,
    isProcessing,
    error,
    sampleRow: rawRows[0]
  });

  if (error) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-destructive">Error: {error}</p>
        </CardContent>
      </Card>
    );
  }

  if (isProcessing) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">Processing data...</p>
        </CardContent>
      </Card>
    );
  }

  if (rawRows.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">No data to preview</p>
        </CardContent>
      </Card>
    );
  }

  // Get first few rows and columns for simple table
  const displayRows = rawRows.slice(0, 10);
  const columns = Object.keys(rawRows[0] || {}).slice(0, 8); // Show max 8 columns

  return (
    <div className="space-y-4">
      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Rows</CardDescription>
            <CardTitle className="text-2xl">{rawRows.length.toLocaleString()}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Columns</CardDescription>
            <CardTitle className="text-2xl">{columns.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Date Fields</CardDescription>
            <CardTitle className="text-2xl">
              {fieldProfiles.filter(p => p.type === 'date').length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Numeric Fields</CardDescription>
            <CardTitle className="text-2xl">
              {fieldProfiles.filter(p => p.type === 'number').length}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Simple Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Data Preview (Simple Table)</CardTitle>
          <CardDescription>
            Showing first 10 rows and up to 8 columns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  {columns.map((column) => (
                    <th key={column} className="text-left p-2 font-medium">
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {displayRows.map((row, index) => (
                  <tr key={index} className="border-b hover:bg-muted/50">
                    {columns.map((column) => (
                      <td key={column} className="p-2">
                        {String(row[column] || '').slice(0, 50)}
                        {String(row[column] || '').length > 50 ? '...' : ''}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Debug Info */}
      <Card>
        <CardHeader>
          <CardTitle>Debug Info</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div><strong>Raw Rows:</strong> {rawRows.length}</div>
            <div><strong>Field Profiles:</strong> {fieldProfiles.length}</div>
            <div><strong>Is Processing:</strong> {isProcessing ? 'Yes' : 'No'}</div>
            <div><strong>Error:</strong> {error || 'None'}</div>
            {rawRows.length > 0 && (
              <div>
                <strong>Sample Data:</strong>
                <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
                  {JSON.stringify(rawRows[0], null, 2)}
                </pre>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
