import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { 
  ChartConfig, 
  KpiConfig, 
  GlobalFiltersState, 
  DashboardLayout,
  DashboardConfig 
} from '@weaveviz/shared';

interface DashboardState {
  // Dashboard configuration
  dashboardName: string;
  charts: ChartConfig[];
  kpis: KpiConfig[];
  globalFilters: GlobalFiltersState;
  layout: DashboardLayout[];
  
  // UI state
  isEditMode: boolean;
  selectedTileId: string | null;
  
  // Actions
  setDashboardName: (name: string) => void;
  addChart: (chart: ChartConfig) => void;
  updateChart: (id: string, chart: Partial<ChartConfig>) => void;
  removeChart: (id: string) => void;
  addKpi: (kpi: KpiConfig) => void;
  updateKpi: (id: string, kpi: Partial<KpiConfig>) => void;
  removeKpi: (id: string) => void;
  setGlobalFilters: (filters: GlobalFiltersState) => void;
  updateGlobalFilter: (key: keyof GlobalFiltersState, value: any) => void;
  setLayout: (layout: DashboardLayout[]) => void;
  updateLayout: (layout: DashboardLayout[]) => void;
  setEditMode: (editMode: boolean) => void;
  setSelectedTile: (id: string | null) => void;
  loadDashboard: (config: DashboardConfig) => void;
  exportDashboard: () => DashboardConfig;
  reset: () => void;
}

const initialFilters: GlobalFiltersState = {
  date: undefined,
  categories: {},
  numbers: {},
};

const initialState = {
  dashboardName: 'Untitled Dashboard',
  charts: [],
  kpis: [],
  globalFilters: initialFilters,
  layout: [],
  isEditMode: true,
  selectedTileId: null,
};

export const useDashboardStore = create<DashboardState>()(
  devtools(
    (set, get) => ({
      ...initialState,
      
      setDashboardName: (name) => {
        set({ dashboardName: name });
      },
      
      addChart: (chart) => {
        const { charts } = get();
        set({ charts: [...charts, chart] });
      },
      
      updateChart: (id, updates) => {
        const { charts } = get();
        set({
          charts: charts.map(chart => 
            chart.id === id ? { ...chart, ...updates } : chart
          )
        });
      },
      
      removeChart: (id) => {
        const { charts, layout } = get();
        set({
          charts: charts.filter(chart => chart.id !== id),
          layout: layout.filter(item => item.i !== id)
        });
      },
      
      addKpi: (kpi) => {
        const { kpis } = get();
        set({ kpis: [...kpis, kpi] });
      },
      
      updateKpi: (id, updates) => {
        const { kpis } = get();
        set({
          kpis: kpis.map(kpi => 
            kpi.id === id ? { ...kpi, ...updates } : kpi
          )
        });
      },
      
      removeKpi: (id) => {
        const { kpis, layout } = get();
        set({
          kpis: kpis.filter(kpi => kpi.id !== id),
          layout: layout.filter(item => item.i !== id)
        });
      },
      
      setGlobalFilters: (filters) => {
        set({ globalFilters: filters });
      },
      
      updateGlobalFilter: (key, value) => {
        const { globalFilters } = get();
        set({
          globalFilters: { ...globalFilters, [key]: value }
        });
      },
      
      setLayout: (layout) => {
        set({ layout });
      },
      
      updateLayout: (layout) => {
        set({ layout });
      },
      
      setEditMode: (editMode) => {
        set({ isEditMode: editMode });
      },
      
      setSelectedTile: (id) => {
        set({ selectedTileId: id });
      },
      
      loadDashboard: (config) => {
        set({
          dashboardName: config.name,
          charts: config.charts,
          kpis: config.kpis,
          globalFilters: config.globalFilters,
          layout: config.layout,
        });
      },
      
      exportDashboard: () => {
        const state = get();
        return {
          name: state.dashboardName,
          charts: state.charts,
          kpis: state.kpis,
          globalFilters: state.globalFilters,
          layout: state.layout,
          fieldProfiles: [], // Will be filled by calling component
          computedFields: [], // Will be filled by calling component
        };
      },
      
      reset: () => {
        set({
          ...initialState,
          globalFilters: { ...initialFilters }
        });
      },
    }),
    { name: 'dashboard-store' }
  )
);
