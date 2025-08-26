import { z } from 'zod';

export const FieldTypeSchema = z.enum(['date', 'number', 'dimension']);

export const FieldProfileSchema = z.object({
  name: z.string(),
  originalName: z.string(),
  type: FieldTypeSchema,
  nullRatio: z.number(),
  distinctCount: z.number(),
  sampleValues: z.array(z.string()),
  min: z.number().optional(),
  max: z.number().optional(),
  mean: z.number().optional(),
  median: z.number().optional(),
  minDate: z.string().optional(),
  maxDate: z.string().optional(),
});

export const MeasureOperationSchema = z.enum(['sum', 'avg', 'min', 'max', 'count', 'countDistinct', 'median']);

export const MeasureSchema = z.object({
  field: z.string(),
  op: MeasureOperationSchema,
});

export const DateBucketSchema = z.enum(['day', 'week', 'month', 'quarter', 'year']);

export const ChartTypeSchema = z.enum(['line', 'bar', 'pie', 'table']);

export const GlobalFiltersStateSchema = z.object({
  date: z.object({
    field: z.string(),
    from: z.string().optional(),
    to: z.string().optional(),
  }).optional(),
  categories: z.record(z.array(z.string())).optional(),
  numbers: z.record(z.object({
    min: z.number().optional(),
    max: z.number().optional(),
  })).optional(),
});

export const ChartConfigSchema = z.object({
  id: z.string(),
  title: z.string(),
  type: ChartTypeSchema,
  xField: z.string().optional(),
  xBucket: DateBucketSchema.optional(),
  yMeasures: z.array(MeasureSchema).optional(),
  seriesField: z.string().optional(),
  filters: GlobalFiltersStateSchema.optional(),
  sort: z.object({
    by: z.enum(['x', 'y', 'series']),
    dir: z.enum(['asc', 'desc']),
  }).optional(),
});

export const KpiConfigSchema = z.object({
  id: z.string(),
  title: z.string(),
  measure: MeasureSchema,
  filters: GlobalFiltersStateSchema.optional(),
  showComparison: z.boolean().optional(),
  comparisonPeriod: z.enum(['previous_period', 'previous_year']).optional(),
});

export const ComputedFieldSchema = z.object({
  name: z.string(),
  expression: z.string(),
  type: FieldTypeSchema,
});

export const DashboardLayoutSchema = z.object({
  i: z.string(),
  x: z.number(),
  y: z.number(),
  w: z.number(),
  h: z.number(),
});

export const DashboardConfigSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  datasetId: z.string().optional(),
  datasetMeta: z.object({
    name: z.string(),
    hash: z.string(),
    rowCount: z.number(),
  }).optional(),
  fieldProfiles: z.array(FieldProfileSchema),
  charts: z.array(ChartConfigSchema),
  kpis: z.array(KpiConfigSchema),
  globalFilters: GlobalFiltersStateSchema,
  computedFields: z.array(ComputedFieldSchema),
  layout: z.array(DashboardLayoutSchema),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const AggregateRequestSchema = z.object({
  datasetId: z.string(),
  measures: z.array(MeasureSchema),
  dimensions: z.array(z.string()).optional(),
  date: z.object({
    field: z.string(),
    bucket: DateBucketSchema,
  }).optional(),
  filters: GlobalFiltersStateSchema.optional(),
  limit: z.number().optional(),
  orderBy: z.array(z.object({
    field: z.string(),
    dir: z.enum(['asc', 'desc']),
  })).optional(),
});

export const UserRegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const UserLoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const CreateDatasetSchema = z.object({
  name: z.string().optional(),
});

export const CreateDashboardSchema = z.object({
  name: z.string(),
  config: DashboardConfigSchema,
});

export const UpdateDashboardSchema = z.object({
  name: z.string().optional(),
  config: DashboardConfigSchema.optional(),
});
