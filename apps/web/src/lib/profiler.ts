import { isValid, parseISO, parse } from 'date-fns';
import type { DataRow, FieldProfile, FieldType } from '@weaveviz/shared';

// Common date formats to try
const DATE_FORMATS = [
  'yyyy-MM-dd',
  'dd/MM/yyyy',
  'MM/dd/yyyy',
  'dd-MM-yyyy',
  'MM-dd-yyyy',
  'yyyy/MM/dd',
  'dd.MM.yyyy',
  'yyyy-MM-dd HH:mm:ss',
  'dd/MM/yyyy HH:mm:ss',
  'MM/dd/yyyy HH:mm:ss',
];

function tryParseDate(value: any): Date | null {
  if (!value || value === '') return null;
  
  const str = String(value).trim();
  
  // Try ISO format first
  try {
    const isoDate = parseISO(str);
    if (isValid(isoDate)) return isoDate;
  } catch {
    // Continue to other formats
  }
  
  // Try other formats
  for (const format of DATE_FORMATS) {
    try {
      const parsedDate = parse(str, format, new Date());
      if (isValid(parsedDate)) return parsedDate;
    } catch {
      // Continue to next format
    }
  }
  
  return null;
}

function tryParseNumber(value: any): number | null {
  if (value === null || value === undefined || value === '') return null;
  
  const str = String(value).trim();
  
  // Remove common number formatting
  const cleaned = str
    .replace(/,/g, '') // Remove thousands separators
    .replace(/[%$€£¥]/g, ''); // Remove currency symbols and percent
  
  const num = Number(cleaned);
  return !isNaN(num) && isFinite(num) ? num : null;
}

function inferFieldType(values: any[]): FieldType {
  const nonNullValues = values.filter(v => v !== null && v !== undefined && v !== '');
  
  if (nonNullValues.length === 0) return 'dimension';
  
  let dateCount = 0;
  let numberCount = 0;
  
  for (const value of nonNullValues) {
    if (tryParseDate(value)) {
      dateCount++;
    } else if (tryParseNumber(value) !== null) {
      numberCount++;
    }
  }
  
  const dateRatio = dateCount / nonNullValues.length;
  const numberRatio = numberCount / nonNullValues.length;
  
  // 80% threshold for type inference
  if (dateRatio >= 0.8) return 'date';
  if (numberRatio >= 0.8) return 'number';
  
  return 'dimension';
}

function calculateStats(values: any[], type: FieldType): Partial<FieldProfile> {
  const nonNullValues = values.filter(v => v !== null && v !== undefined && v !== '');
  const nullRatio = (values.length - nonNullValues.length) / values.length;
  
  // Get unique values for sampling
  const uniqueValues = Array.from(new Set(nonNullValues.map(v => String(v))));
  const sampleValues = uniqueValues.slice(0, 10); // Sample first 10 unique values
  const distinctCount = uniqueValues.length;
  
  const stats: Partial<FieldProfile> = {
    nullRatio,
    distinctCount,
    sampleValues,
  };
  
  if (type === 'number') {
    const numbers = nonNullValues
      .map(v => tryParseNumber(v))
      .filter((n): n is number => n !== null);
    
    if (numbers.length > 0) {
      numbers.sort((a, b) => a - b);
      stats.min = numbers[0];
      stats.max = numbers[numbers.length - 1];
      stats.mean = numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
      
      // Calculate median
      const mid = Math.floor(numbers.length / 2);
      stats.median = numbers.length % 2 === 0 
        ? (numbers[mid - 1] + numbers[mid]) / 2 
        : numbers[mid];
    }
  } else if (type === 'date') {
    const dates = nonNullValues
      .map(v => tryParseDate(v))
      .filter((d): d is Date => d !== null);
    
    if (dates.length > 0) {
      dates.sort((a, b) => a.getTime() - b.getTime());
      stats.minDate = dates[0].toISOString();
      stats.maxDate = dates[dates.length - 1].toISOString();
    }
  }
  
  return stats;
}

export function profileData(rows: DataRow[]): FieldProfile[] {
  if (rows.length === 0) return [];
  
  // Get all field names from the first few rows to handle sparse data
  const fieldNames = new Set<string>();
  const sampleSize = Math.min(100, rows.length);
  
  for (let i = 0; i < sampleSize; i++) {
    Object.keys(rows[i] || {}).forEach(key => fieldNames.add(key));
  }
  
  const profiles: FieldProfile[] = [];
  
  for (const fieldName of fieldNames) {
    // Extract values for this field
    const values = rows.map(row => row[fieldName]);
    
    // Infer type
    const type = inferFieldType(values);
    
    // Calculate statistics
    const stats = calculateStats(values, type);
    
    const profile: FieldProfile = {
      name: fieldName,
      originalName: fieldName, // TODO: Map back to original name if we have the mapping
      type,
      nullRatio: stats.nullRatio || 0,
      distinctCount: stats.distinctCount || 0,
      sampleValues: stats.sampleValues || [],
      ...stats,
    };
    
    profiles.push(profile);
  }
  
  // Sort profiles: dates first, then numbers, then dimensions
  profiles.sort((a, b) => {
    const typeOrder = { date: 0, number: 1, dimension: 2 };
    const aOrder = typeOrder[a.type];
    const bOrder = typeOrder[b.type];
    
    if (aOrder !== bOrder) {
      return aOrder - bOrder;
    }
    
    return a.name.localeCompare(b.name);
  });
  
  return profiles;
}

// Worker message for heavy profiling
export interface ProfileWorkerMessage {
  type: 'profile';
  data: DataRow[];
}

export interface ProfileWorkerResponse {
  type: 'success' | 'error';
  profiles?: FieldProfile[];
  error?: string;
}

// For use in web worker
if (typeof self !== 'undefined' && 'postMessage' in self) {
  self.addEventListener('message', (event: MessageEvent<ProfileWorkerMessage>) => {
    try {
      const { type, data } = event.data;
      
      if (type === 'profile') {
        const profiles = profileData(data);
        
        (self as any).postMessage({
          type: 'success',
          profiles
        } as ProfileWorkerResponse);
      }
    } catch (error) {
      (self as any).postMessage({
        type: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      } as ProfileWorkerResponse);
    }
  });
}
