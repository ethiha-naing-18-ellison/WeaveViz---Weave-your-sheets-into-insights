import React, { useState } from 'react';
import { Plus, BarChart3, LineChart, PieChart, Table, AreaChart, ScatterChart, Radar } from 'lucide-react';
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
import type { ChartConfig, ChartType, FieldProfile } from '@weaveviz/shared';

interface ChartBuilderProps {
  className?: string;
}

const chartTypes: { type: ChartType; icon: React.ReactNode; label: string; description: string }[] = [
  {
    type: 'bar',
    icon: <BarChart3 className="w-6 h-6" />,
    label: 'Bar Chart',
    description: 'Compare values across categories'
  },
  {
    type: 'line',
    icon: <LineChart className="w-6 h-6" />,
    label: 'Line Chart',
    description: 'Show trends over time'
  },
  {
    type: 'area',
    icon: <AreaChart className="w-6 h-6" />,
    label: 'Area Chart',
    description: 'Show trends with filled areas'
  },
  {
    type: 'pie',
    icon: <PieChart className="w-6 h-6" />,
    label: 'Pie Chart',
    description: 'Show proportions and percentages'
  },
  {
    type: 'donut',
    icon: <PieChart className="w-6 h-6" />,
    label: 'Donut Chart',
    description: 'Show proportions with center space'
  },
  {
    type: 'scatter',
    icon: <ScatterChart className="w-6 h-6" />,
    label: 'Scatter Plot',
    description: 'Show correlation between variables'
  },
  {
    type: 'radar',
    icon: <Radar className="w-6 h-6" />,
    label: 'Radar Chart',
    description: 'Compare multiple variables'
  },
  {
    type: 'table',
    icon: <Table className="w-6 h-6" />,
    label: 'Data Table',
    description: 'Display raw data in table format'
  }
];

export function ChartBuilder({ className }: ChartBuilderProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<ChartType>('bar');
  const [chartTitle, setChartTitle] = useState('');
  const [selectedXField, setSelectedXField] = useState('');
  const [selectedYField, setSelectedYField] = useState('');

  const { fieldProfiles } = useDataStore();
  const { charts, addChart } = useDashboardStore();

  // Get available fields by type
  const dimensionFields = fieldProfiles.filter(f => f.type === 'dimension');
  const numberFields = fieldProfiles.filter(f => f.type === 'number');
  const dateFields = fieldProfiles.filter(f => f.type === 'date');

  const handleCreateChart = () => {
    if (!chartTitle || !selectedXField) return;

    const newChart = {
      id: `chart_${Date.now()}`,
      title: chartTitle,
      chartType: selectedType,
      field: selectedYField || selectedXField, // Value field
      categoryField: selectedYField ? selectedXField : undefined, // Category field
      aggregation: 'sum' as const,
    };

    addChart(newChart);
    
    // Reset form
    setChartTitle('');
    setSelectedXField('');
    setSelectedYField('');
    setIsDialogOpen(false);
  };

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold">Charts</h3>
          <p className="text-sm text-muted-foreground">
            Create visualizations from your data
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Chart
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Chart</DialogTitle>
              <DialogDescription>
                Choose a chart type and configure your visualization. For best results, select a category field (like Product_Category, Region) and a value field (like Revenue, Quantity).
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Chart Type Selection */}
              <div>
                <label className="text-sm font-medium mb-3 block">Chart Type</label>
                <div className="grid grid-cols-2 gap-3">
                  {chartTypes.map((chart) => (
                    <button
                      key={chart.type}
                      onClick={() => setSelectedType(chart.type)}
                      className={`p-4 border rounded-lg text-left transition-colors ${
                        selectedType === chart.type
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`${selectedType === chart.type ? 'text-primary' : 'text-muted-foreground'}`}>
                          {chart.icon}
                        </div>
                        <div>
                          <div className="font-medium">{chart.label}</div>
                          <div className="text-xs text-muted-foreground">{chart.description}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Chart Configuration */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Chart Title</label>
                  <Input
                    placeholder="Enter chart title..."
                    value={chartTitle}
                    onChange={(e) => setChartTitle(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Category Field (Group By)
                  </label>
                  <select
                    className="w-full p-2 border border-input rounded-md bg-background"
                    value={selectedXField}
                    onChange={(e) => setSelectedXField(e.target.value)}
                  >
                    <option value="">Select category field (e.g., Product_Category, Region)...</option>
                    <optgroup label="Text Fields">
                      {dimensionFields.map((field) => (
                        <option key={field.name} value={field.name}>
                          {field.originalName}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Date Fields">
                      {dateFields.map((field) => (
                        <option key={field.name} value={field.name}>
                          {field.originalName}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>

                {selectedType !== 'table' && (
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Value Field (What to measure)
                    </label>
                    <select
                      className="w-full p-2 border border-input rounded-md bg-background"
                      value={selectedYField}
                      onChange={(e) => setSelectedYField(e.target.value)}
                    >
                      <option value="">Select value field (e.g., Revenue, Quantity)...</option>
                      {numberFields.map((field) => (
                        <option key={field.name} value={field.name}>
                          {field.originalName}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleCreateChart}
                disabled={!chartTitle || !selectedXField || (selectedType !== 'table' && !selectedYField)}
              >
                Create Chart
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Charts List */}
      <div className="space-y-4">
        {charts.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <BarChart3 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Charts Yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first chart to start building your dashboard
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Chart
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {charts.map((chart) => (
              <Card key={chart.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {chartTypes.find(t => t.type === chart.type)?.icon}
                      <CardTitle className="text-base">{chart.title}</CardTitle>
                    </div>
                  </div>
                  <CardDescription className="capitalize">
                    {chart.type} chart
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">X-Axis: </span>
                      <span>{fieldProfiles.find(f => f.name === chart.xField)?.originalName}</span>
                    </div>
                    {chart.yMeasures && chart.yMeasures.length > 0 && (
                      <div>
                        <span className="text-muted-foreground">Y-Axis: </span>
                        <span>
                          {fieldProfiles.find(f => f.name === chart.yMeasures![0].field)?.originalName} 
                          ({chart.yMeasures[0].op})
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
