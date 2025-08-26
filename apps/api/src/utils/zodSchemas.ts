// Re-export schemas from shared package
export * from '@weaveviz/shared';

// Additional API-specific schemas
import { z } from 'zod';

export const PaginationSchema = z.object({
  page: z.string().transform(Number).optional().default('1'),
  limit: z.string().transform(Number).optional().default('10'),
});

export const SortSchema = z.object({
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});
