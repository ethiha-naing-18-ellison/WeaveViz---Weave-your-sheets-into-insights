export type FieldType = 'date' | 'number' | 'dimension';

export interface FieldProfile {
  name: string;
  originalName: string;
  type: FieldType;
  nullRatio: number;
  distinctCount: number;
  sampleValues: string[];
  // Numeric stats
  min?: number;
  max?: number;
  mean?: number;
  median?: number;
  // Date stats
  minDate?: string;
  maxDate?: string;
}

export type MeasureOperation = 'sum' | 'avg' | 'min' | 'max' | 'count' | 'countDistinct' | 'median';

export interface Measure {
  field: string;
  op: MeasureOperation;
}

export type DateBucket = 'day' | 'week' | 'month' | 'quarter' | 'year';

export type ChartType = 'line' | 'bar' | 'pie' | 'donut' | 'area' | 'scatter' | 'radar' | 'table';

export interface ChartConfig {
  id: string;
  title: string;
  type: ChartType;
  xField?: string;
  xBucket?: DateBucket;
  yMeasures?: Measure[];
  seriesField?: string;
  filters?: GlobalFiltersState;
  sort?: { by: 'x' | 'y' | 'series'; dir: 'asc' | 'desc' };
}

export interface KpiConfig {
  id: string;
  title: string;
  measure: Measure;
  filters?: GlobalFiltersState;
  showComparison?: boolean;
  comparisonPeriod?: 'previous_period' | 'previous_year';
}

export interface GlobalFiltersState {
  date?: {
    field: string;
    from?: string;
    to?: string;
  };
  categories?: Record<string, string[]>;
  numbers?: Record<string, { min?: number; max?: number }>;
}

export interface ComputedField {
  name: string;
  expression: string;
  type: FieldType;
}

export interface DashboardLayout {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface DashboardConfig {
  id?: string;
  name: string;
  datasetId?: string;
  datasetMeta?: {
    name: string;
    hash: string;
    rowCount: number;
  };
  fieldProfiles: FieldProfile[];
  charts: ChartConfig[];
  kpis: KpiConfig[];
  globalFilters: GlobalFiltersState;
  computedFields: ComputedField[];
  layout: DashboardLayout[];
  createdAt?: string;
  updatedAt?: string;
}

export interface DataRow {
  [key: string]: any;
}

export interface Dataset {
  id: string;
  name: string;
  originalName: string;
  rowCount: number;
  fieldProfiles: FieldProfile[];
  rowsSample: DataRow[];
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  createdAt: string;
}

export interface AggregateRequest {
  datasetId: string;
  measures: Measure[];
  dimensions?: string[];
  date?: { field: string; bucket: DateBucket };
  filters?: GlobalFiltersState;
  limit?: number;
  orderBy?: { field: string; dir: 'asc' | 'desc' }[];
}

export interface AggregateResponseRow {
  [key: string]: any;
}

export interface ApiError {
  errorCode: string;
  message: string;
  details?: any;
}
