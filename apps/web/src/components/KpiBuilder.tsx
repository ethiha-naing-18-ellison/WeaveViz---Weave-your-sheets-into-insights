import React, { useState } from 'react';
import { Plus, TrendingUp, Calculator } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useDataStore } from '@/store/useDataStore';
import { useDashboardStore } from '@/store/useDashboardStore';
import type { KpiConfig, MeasureOperation } from '@weaveviz/shared';

interface KpiBuilderProps {
  className?: string;
}

const operations: { op: MeasureOperation; label: string; description: string }[] = [
  { op: 'sum', label: 'Sum', description: 'Total of all values' },
  { op: 'avg', label: 'Average', description: 'Mean of all values' },
  { op: 'count', label: 'Count', description: 'Number of records' },
  { op: 'min', label: 'Minimum', description: 'Smallest value' },
  { op: 'max', label: 'Maximum', description: 'Largest value' },
  { op: 'countDistinct', label: 'Unique Count', description: 'Number of unique values' },
];

export function KpiBuilder({ className }: KpiBuilderProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [kpiTitle, setKpiTitle] = useState('');
  const [selectedField, setSelectedField] = useState('');
  const [selectedOperation, setSelectedOperation] = useState<MeasureOperation>('sum');

  const { fieldProfiles, rawRows } = useDataStore();
  const { kpis, addKpi } = useDashboardStore();

  // Get numeric fields for KPIs
  const numberFields = fieldProfiles.filter(f => f.type === 'number');
  const allFields = fieldProfiles; // For count operations

  const calculateKpiValue = (field: string, operation: MeasureOperation): number => {
    const values = rawRows.map(row => row[field]).filter(v => v !== null && v !== undefined);
    
    switch (operation) {
      case 'sum':
        return values.reduce((sum, val) => sum + Number(val), 0);
      case 'avg':
        return values.length ? values.reduce((sum, val) => sum + Number(val), 0) / values.length : 0;
      case 'count':
        return rawRows.length;
      case 'countDistinct':
        return new Set(values).size;
      case 'min':
        return Math.min(...values.map(Number));
      case 'max':
        return Math.max(...values.map(Number));
      default:
        return 0;
    }
  };

  const handleCreateKpi = () => {
    if (!kpiTitle || !selectedField) return;

    const newKpi: KpiConfig = {
      id: `kpi_${Date.now()}`,
      title: kpiTitle,
      measure: {
        field: selectedField,
        op: selectedOperation,
      },
    };

    addKpi(newKpi);
    
    // Reset form
    setKpiTitle('');
    setSelectedField('');
    setSelectedOperation('sum');
    setIsDialogOpen(false);
  };

  const formatKpiValue = (value: number, operation: MeasureOperation): string => {
    if (operation === 'count' || operation === 'countDistinct') {
      return value.toLocaleString();
    }
    if (operation === 'avg') {
      return value.toFixed(2);
    }
    return value.toLocaleString();
  };

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold">Key Performance Indicators</h3>
          <p className="text-sm text-muted-foreground">
            Track important metrics from your data
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add KPI
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New KPI</DialogTitle>
              <DialogDescription>
                Define a key performance indicator to track
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">KPI Title</label>
                <Input
                  placeholder="e.g., Total Revenue, Order Count..."
                  value={kpiTitle}
                  onChange={(e) => setKpiTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Operation</label>
                <select
                  className="w-full p-2 border border-input rounded-md bg-background"
                  value={selectedOperation}
                  onChange={(e) => setSelectedOperation(e.target.value as MeasureOperation)}
                >
                  {operations.map((op) => (
                    <option key={op.op} value={op.op}>
                      {op.label} - {op.description}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Field</label>
                <select
                  className="w-full p-2 border border-input rounded-md bg-background"
                  value={selectedField}
                  onChange={(e) => setSelectedField(e.target.value)}
                >
                  <option value="">Select field...</option>
                  {(selectedOperation === 'count' || selectedOperation === 'countDistinct' 
                    ? allFields 
                    : numberFields
                  ).map((field) => (
                    <option key={field.name} value={field.name}>
                      {field.originalName}
                    </option>
                  ))}
                </select>
              </div>

              {selectedField && (
                <div className="p-3 bg-muted rounded-lg">
                  <div className="text-sm text-muted-foreground">Preview Value:</div>
                  <div className="text-2xl font-bold text-primary">
                    {formatKpiValue(
                      calculateKpiValue(selectedField, selectedOperation), 
                      selectedOperation
                    )}
                  </div>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleCreateKpi}
                disabled={!kpiTitle || !selectedField}
              >
                Create KPI
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* KPIs List */}
      <div className="space-y-4">
        {kpis.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <TrendingUp className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No KPIs Yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first KPI to track important metrics
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First KPI
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {kpis.map((kpi) => (
              <Card key={kpi.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <Calculator className="w-5 h-5 text-primary" />
                  </div>
                  <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary mb-1">
                    {formatKpiValue(
                      calculateKpiValue(kpi.measure.field, kpi.measure.op),
                      kpi.measure.op
                    )}
                  </div>
                  <CardDescription className="text-xs">
                    {operations.find(op => op.op === kpi.measure.op)?.label} of{' '}
                    {fieldProfiles.find(f => f.name === kpi.measure.field)?.originalName}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
