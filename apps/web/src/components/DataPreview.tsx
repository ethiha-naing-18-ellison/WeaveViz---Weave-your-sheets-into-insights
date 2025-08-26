import React, { useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useDataStore } from '@/store/useDataStore';
import type { ColDef } from 'ag-grid-community';

export function DataPreview() {
  const { rawRows, fieldProfiles } = useDataStore();

  const columnDefs: ColDef[] = useMemo(() => {
    if (rawRows.length === 0) return [];

    // Get all field names from the first row
    const fields = Object.keys(rawRows[0] || {});
    
    return fields.map(field => {
      const profile = fieldProfiles.find(p => p.name === field);
      
      return {
        field,
        headerName: profile?.originalName || field,
        sortable: true,
        filter: true,
        resizable: true,
        minWidth: 120,
        cellDataType: profile?.type === 'number' ? 'number' : 
                     profile?.type === 'date' ? 'date' : 'text',
      };
    });
  }, [rawRows, fieldProfiles]);

  const rowData = useMemo(() => {
    // Show first 1000 rows for performance
    return rawRows.slice(0, 1000);
  }, [rawRows]);

  const defaultColDef: ColDef = {
    flex: 1,
    minWidth: 100,
    filter: true,
    sortable: true,
    resizable: true,
  };

  if (rawRows.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">No data to preview</p>
        </CardContent>
      </Card>
    );
  }

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
            <CardTitle className="text-2xl">{columnDefs.length}</CardTitle>
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

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Data Preview</CardTitle>
          <CardDescription>
            {rawRows.length > 1000 
              ? `Showing first 1,000 rows of ${rawRows.length.toLocaleString()} total rows`
              : `Showing all ${rawRows.length.toLocaleString()} rows`
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[600px] w-full">
            <div className="ag-theme-alpine h-full w-full">
              <AgGridReact
                columnDefs={columnDefs}
                rowData={rowData}
                defaultColDef={defaultColDef}
                pagination={true}
                paginationPageSize={50}
                suppressCellFocus={true}
                enableCellTextSelection={true}
                animateRows={true}
                headerHeight={40}
                rowHeight={35}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
