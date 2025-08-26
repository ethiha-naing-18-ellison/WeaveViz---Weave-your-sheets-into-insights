import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { DataRow, FieldProfile, ComputedField } from '@weaveviz/shared';

interface DataState {
  // Raw data
  rawRows: DataRow[];
  fieldProfiles: FieldProfile[];
  computedFields: ComputedField[];
  
  // Processed data
  filteredRows: DataRow[];
  isProcessing: boolean;
  error: string | null;
  
  // File info
  fileName: string;
  fileSize: number;
  rowCount: number;
  
  // Actions
  setRawData: (rows: DataRow[], fileName: string, fileSize: number) => void;
  setFieldProfiles: (profiles: FieldProfile[]) => void;
  setFilteredRows: (rows: DataRow[]) => void;
  addComputedField: (field: ComputedField) => void;
  removeComputedField: (name: string) => void;
  setProcessing: (processing: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState = {
  rawRows: [],
  fieldProfiles: [],
  computedFields: [],
  filteredRows: [],
  isProcessing: false,
  error: null,
  fileName: '',
  fileSize: 0,
  rowCount: 0,
};

export const useDataStore = create<DataState>()(
  devtools(
    (set, get) => ({
      ...initialState,
      
      setRawData: (rows, fileName, fileSize) => {
        set({
          rawRows: rows,
          filteredRows: rows,
          fileName,
          fileSize,
          rowCount: rows.length,
          error: null,
        });
      },
      
      setFieldProfiles: (profiles) => {
        set({ fieldProfiles: profiles });
      },
      
      setFilteredRows: (rows) => {
        set({ filteredRows: rows });
      },
      
      addComputedField: (field) => {
        const { computedFields } = get();
        const existing = computedFields.find(f => f.name === field.name);
        if (existing) {
          // Update existing
          set({
            computedFields: computedFields.map(f => 
              f.name === field.name ? field : f
            )
          });
        } else {
          // Add new
          set({
            computedFields: [...computedFields, field]
          });
        }
      },
      
      removeComputedField: (name) => {
        const { computedFields } = get();
        set({
          computedFields: computedFields.filter(f => f.name !== name)
        });
      },
      
      setProcessing: (processing) => {
        set({ isProcessing: processing });
      },
      
      setError: (error) => {
        set({ error });
      },
      
      reset: () => {
        set(initialState);
      },
    }),
    { name: 'data-store' }
  )
);
