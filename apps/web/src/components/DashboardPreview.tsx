import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDashboardStore } from '@/store/useDashboardStore';
import { useDataStore } from '@/store/useDataStore';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, ScatterChart, Scatter,
  ComposedChart, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';

const COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

export function DashboardPreview() {
  const { kpis, charts } = useDashboardStore();
  const { rawRows } = useDataStore();

  const renderKPI = (kpi: any) => {
    // Calculate the KPI value based on the data
    let value = 0;
    let formattedValue = '0';

    // Handle both old and new KPI structures
    const field = kpi.field || kpi.measure?.field;
    const aggregation = kpi.aggregation || kpi.measure?.op;

    if (rawRows.length > 0 && field) {
      switch (aggregation) {
        case 'sum':
          value = rawRows.reduce((sum, row) => {
            const val = parseFloat(row[field]) || 0;
            return sum + val;
          }, 0);
          break;
        case 'average':
          const sum = rawRows.reduce((sum, row) => {
            const val = parseFloat(row[field]) || 0;
            return sum + val;
          }, 0);
          value = sum / rawRows.length;
          break;
        case 'count':
          value = rawRows.length;
          break;
        case 'min':
          value = Math.min(...rawRows.map(row => parseFloat(row[field]) || 0));
          break;
        case 'max':
          value = Math.max(...rawRows.map(row => parseFloat(row[field]) || 0));
          break;
      }

      // Format the value
      if (aggregation === 'count') {
        formattedValue = value.toLocaleString();
      } else {
        formattedValue = value.toLocaleString(undefined, {
          minimumFractionDigits: 0,
          maximumFractionDigits: 2
        });
      }
    }

         return (
       <Card key={kpi.id} className="h-full">
         <CardHeader className="pb-2">
           <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
         </CardHeader>
         <CardContent>
           <div className="text-2xl font-bold text-primary">{formattedValue}</div>
           <p className="text-xs text-muted-foreground mt-1">
             {field} ({aggregation})
           </p>
         </CardContent>
       </Card>
     );
  };

  const renderChart = (chart: any) => {
    if (!chart.field || !chart.chartType || rawRows.length === 0) {
      return (
        <Card key={chart.id} className="h-80">
          <CardContent className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">Configure chart to see preview</p>
          </CardContent>
        </Card>
      );
    }

    // Prepare chart data
    let chartData: any[] = [];

         if (chart.chartType === 'bar' || chart.chartType === 'line' || chart.chartType === 'area') {
       // Group by category field if specified
       if (chart.categoryField) {
         const grouped = rawRows.reduce((acc, row) => {
           const category = row[chart.categoryField] || 'Unknown';
           const value = parseFloat(row[chart.field]) || 0;
           
           if (!acc[category]) {
             acc[category] = { category, value: 0, count: 0 };
           }
           
           acc[category].value += value;
           acc[category].count += 1;
           
           return acc;
         }, {} as Record<string, any>);

         chartData = Object.values(grouped).map(item => ({
           name: item.category,
           value: chart.aggregation === 'average' ? item.value / item.count : item.value
         }));
       } else {
         // Show top 10 values
         const values = rawRows
           .map(row => parseFloat(row[chart.field]) || 0)
           .filter(val => !isNaN(val))
           .sort((a, b) => b - a)
           .slice(0, 10);

         chartData = values.map((value, index) => ({
           name: `Row ${index + 1}`,
           value
         }));
       }
     } else if (chart.chartType === 'pie' || chart.chartType === 'donut') {
       // Group by category field for pie/donut chart
       if (chart.categoryField) {
         const grouped = rawRows.reduce((acc, row) => {
           const category = row[chart.categoryField] || 'Unknown';
           const value = parseFloat(row[chart.field]) || 0;
           
           if (!acc[category]) {
             acc[category] = 0;
           }
           
           acc[category] += value;
           
           return acc;
         }, {} as Record<string, number>);

         chartData = Object.entries(grouped).map(([name, value]) => ({
           name,
           value
         }));
       }
     } else if (chart.chartType === 'scatter') {
       // For scatter plot, we need two numeric fields
       const xField = chart.categoryField || chart.field;
       const yField = chart.field;
       
       chartData = rawRows
         .map(row => ({
           x: parseFloat(row[xField]) || 0,
           y: parseFloat(row[yField]) || 0,
           name: row[xField] || 'Unknown'
         }))
         .filter(point => !isNaN(point.x) && !isNaN(point.y))
         .slice(0, 50); // Limit to 50 points for performance
     } else if (chart.chartType === 'radar') {
       // For radar chart, group by category
       if (chart.categoryField) {
         const grouped = rawRows.reduce((acc, row) => {
           const category = row[chart.categoryField] || 'Unknown';
           const value = parseFloat(row[chart.field]) || 0;
           
           if (!acc[category]) {
             acc[category] = { category, value: 0, count: 0 };
           }
           
           acc[category].value += value;
           acc[category].count += 1;
           
           return acc;
         }, {} as Record<string, any>);

         chartData = Object.values(grouped).map(item => ({
           subject: item.category,
           A: chart.aggregation === 'average' ? item.value / item.count : item.value,
           fullMark: Math.max(...Object.values(grouped).map((g: any) => g.value))
         }));
       }
     }

    const renderChartContent = () => {
      switch (chart.chartType) {
                 case 'bar':
           return (
             <ResponsiveContainer width="100%" height={280}>
               <BarChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 25 }}>
                 <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                 <XAxis 
                   dataKey="name" 
                   fontSize={11}
                   tick={{ fontSize: 10 }}
                   angle={-45}
                   textAnchor="end"
                   height={60}
                 />
                 <YAxis fontSize={11} tick={{ fontSize: 10 }} />
                 <Tooltip 
                   contentStyle={{ 
                     backgroundColor: '#1F2937', 
                     border: '1px solid #374151',
                     borderRadius: '6px',
                     fontSize: '12px'
                   }}
                 />
                 <Bar dataKey="value" fill="#6366F1" radius={[2, 2, 0, 0]} />
               </BarChart>
             </ResponsiveContainer>
           );

                 case 'line':
           return (
             <ResponsiveContainer width="100%" height={280}>
               <LineChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 25 }}>
                 <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                 <XAxis 
                   dataKey="name" 
                   fontSize={11}
                   tick={{ fontSize: 10 }}
                   angle={-45}
                   textAnchor="end"
                   height={60}
                 />
                 <YAxis fontSize={11} tick={{ fontSize: 10 }} />
                 <Tooltip 
                   contentStyle={{ 
                     backgroundColor: '#1F2937', 
                     border: '1px solid #374151',
                     borderRadius: '6px',
                     fontSize: '12px'
                   }}
                 />
                 <Line type="monotone" dataKey="value" stroke="#6366F1" strokeWidth={2} dot={{ fill: '#6366F1', strokeWidth: 2, r: 3 }} />
               </LineChart>
             </ResponsiveContainer>
           );

                 case 'pie':
           return (
             <ResponsiveContainer width="100%" height={280}>
               <PieChart>
                 <Pie
                   data={chartData}
                   cx="50%"
                   cy="50%"
                   labelLine={false}
                   label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                   outerRadius={70}
                   fill="#8884d8"
                   dataKey="value"
                 >
                   {chartData.map((entry, index) => (
                     <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                   ))}
                 </Pie>
                 <Tooltip 
                   contentStyle={{ 
                     backgroundColor: '#1F2937', 
                     border: '1px solid #374151',
                     borderRadius: '6px',
                     fontSize: '12px'
                   }}
                 />
               </PieChart>
             </ResponsiveContainer>
           );

         case 'donut':
           return (
             <ResponsiveContainer width="100%" height={280}>
               <PieChart>
                 <Pie
                   data={chartData}
                   cx="50%"
                   cy="50%"
                   labelLine={false}
                   label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                   outerRadius={70}
                   innerRadius={35}
                   fill="#8884d8"
                   dataKey="value"
                 >
                   {chartData.map((entry, index) => (
                     <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                   ))}
                 </Pie>
                 <Tooltip 
                   contentStyle={{ 
                     backgroundColor: '#1F2937', 
                     border: '1px solid #374151',
                     borderRadius: '6px',
                     fontSize: '12px'
                   }}
                 />
               </PieChart>
             </ResponsiveContainer>
           );

         case 'area':
           return (
             <ResponsiveContainer width="100%" height={280}>
               <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 25 }}>
                 <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                 <XAxis 
                   dataKey="name" 
                   fontSize={11}
                   tick={{ fontSize: 10 }}
                   angle={-45}
                   textAnchor="end"
                   height={60}
                 />
                 <YAxis fontSize={11} tick={{ fontSize: 10 }} />
                 <Tooltip 
                   contentStyle={{ 
                     backgroundColor: '#1F2937', 
                     border: '1px solid #374151',
                     borderRadius: '6px',
                     fontSize: '12px'
                   }}
                 />
                 <Area 
                   type="monotone" 
                   dataKey="value" 
                   stroke="#6366F1" 
                   fill="#6366F1" 
                   fillOpacity={0.3}
                 />
               </AreaChart>
             </ResponsiveContainer>
           );

         case 'scatter':
           return (
             <ResponsiveContainer width="100%" height={280}>
               <ScatterChart margin={{ top: 5, right: 5, left: 5, bottom: 25 }}>
                 <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                 <XAxis 
                   type="number" 
                   dataKey="x" 
                   fontSize={11}
                   tick={{ fontSize: 10 }}
                 />
                 <YAxis 
                   type="number" 
                   dataKey="y" 
                   fontSize={11}
                   tick={{ fontSize: 10 }}
                 />
                 <Tooltip 
                   contentStyle={{ 
                     backgroundColor: '#1F2937', 
                     border: '1px solid #374151',
                     borderRadius: '6px',
                     fontSize: '12px'
                   }}
                 />
                 <Scatter dataKey="y" fill="#6366F1" />
               </ScatterChart>
             </ResponsiveContainer>
           );

         case 'radar':
           return (
             <ResponsiveContainer width="100%" height={280}>
               <RadarChart data={chartData}>
                 <PolarGrid stroke="#374151" />
                 <PolarAngleAxis dataKey="subject" fontSize={10} />
                 <PolarRadiusAxis fontSize={10} />
                 <Radar 
                   name="Value" 
                   dataKey="A" 
                   stroke="#6366F1" 
                   fill="#6366F1" 
                   fillOpacity={0.3}
                 />
                 <Tooltip 
                   contentStyle={{ 
                     backgroundColor: '#1F2937', 
                     border: '1px solid #374151',
                     borderRadius: '6px',
                     fontSize: '12px'
                   }}
                 />
               </RadarChart>
             </ResponsiveContainer>
           );

        default:
          return (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">Unsupported chart type</p>
            </div>
          );
      }
    };

         return (
       <Card key={chart.id} className="h-96">
         <CardHeader className="pb-3">
           <CardTitle className="text-sm font-medium leading-tight">{chart.title}</CardTitle>
         </CardHeader>
         <CardContent className="pt-0">
           {renderChartContent()}
         </CardContent>
       </Card>
     );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold">Dashboard Preview</h3>
          <p className="text-muted-foreground">
            Live preview of your dashboard components
          </p>
        </div>
      </div>

      {/* KPIs Grid */}
      {kpis.length > 0 && (
        <div>
          <h4 className="text-lg font-medium mb-4">Key Performance Indicators</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {kpis.map(renderKPI)}
          </div>
        </div>
      )}

             {/* Charts Grid */}
       {charts.length > 0 && (
         <div>
           <h4 className="text-lg font-medium mb-4">Charts & Visualizations</h4>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {charts.map(renderChart)}
           </div>
         </div>
       )}

      {/* Empty State */}
      {kpis.length === 0 && charts.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-4xl mb-4">📊</div>
            <h4 className="text-lg font-medium mb-2">No Dashboard Components Yet</h4>
            <p className="text-muted-foreground text-center">
              Add KPIs and charts using the builders above to see your dashboard preview here
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
