import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, Save, Download, Database, Menu, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FileDropZone } from '@/components/FileDropZone';
import { DataPreview } from '@/components/DataPreview';
import { SimpleDataPreview } from '@/components/SimpleDataPreview';
import { FieldProfiler } from '@/components/FieldProfiler';
import { ChartBuilder } from '@/components/ChartBuilder';
import { KpiBuilder } from '@/components/KpiBuilder';
import { DashboardPreview } from '@/components/DashboardPreview';
import { Footer } from '@/components/Footer';
import { useDataStore } from '@/store/useDataStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useDashboardStore } from '@/store/useDashboardStore';

export function DashboardBuilder() {
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const { rawRows, fieldProfiles, fileName } = useDataStore();
  const [activeTab, setActiveTab] = useState<'upload' | 'preview' | 'profile' | 'build'>('upload');
  const [showBuilders, setShowBuilders] = useState(true);

  const hasData = rawRows.length > 0;
  const hasProfiles = fieldProfiles.length > 0;



  // Auto-advance through tabs as data is processed (but allow manual navigation)
  React.useEffect(() => {
    // Only auto-advance if user hasn't manually navigated
    if (hasData && activeTab === 'upload') {
      setActiveTab('preview');
    }
    // Don't auto-advance from preview to profile - let user choose
  }, [hasData]); // Remove activeTab dependency to prevent forced navigation

  const handleFileProcessed = () => {
    setActiveTab('preview');
  };

  const generateAutoDashboard = () => {
    const { addKpi, addChart, reset } = useDashboardStore.getState();
    
    // Clear existing dashboard
    reset();
    
    // Auto-generate KPIs based on data analysis
    const numberFields = fieldProfiles.filter(f => f.type === 'number');
    const dimensionFields = fieldProfiles.filter(f => f.type === 'dimension');
    const dateFields = fieldProfiles.filter(f => f.type === 'date');
    
         // Create comprehensive KPIs
     const kpiFields = numberFields.slice(0, 6); // Create up to 6 KPIs
     kpiFields.forEach((field, index) => {
       const aggregation = getKPIAggregation(field.originalName);
       const kpiConfig = {
         id: `auto_kpi_${index}`,
         title: getKPITitle(field.originalName),
         measure: {
           field: field.name,
           op: aggregation,
         },
       };
       addKpi(kpiConfig);
     });
    
    // Create comprehensive charts based on data structure
    let chartIndex = 0;
    
    // 1. Main Revenue/Value analysis by category (Bar Chart)
    const revenueField = numberFields.find(f => 
      f.originalName.toLowerCase().includes('revenue') || 
      f.originalName.toLowerCase().includes('sales') ||
      f.originalName.toLowerCase().includes('amount')
    );
    
    const categoryField = dimensionFields.find(f => 
      f.originalName.toLowerCase().includes('category') ||
      f.originalName.toLowerCase().includes('region') ||
      f.originalName.toLowerCase().includes('product')
    );
    
    if (revenueField && categoryField) {
      addChart({
        id: `auto_chart_${chartIndex++}`,
        title: `${revenueField.originalName} by ${categoryField.originalName}`,
        chartType: 'bar',
        field: revenueField.name,
        categoryField: categoryField.name,
        aggregation: 'sum',
      });
    }
    
         // 2. Distribution chart (Donut Chart) - like the donut charts in your reference
     if (categoryField && revenueField) {
       addChart({
         id: `auto_chart_${chartIndex++}`,
         title: `${revenueField.originalName} Distribution`,
         chartType: 'donut',
         field: revenueField.name,
         categoryField: categoryField.name,
         aggregation: 'sum',
       });
     }
    
         // 3. Time series analysis (Area Chart) - like the trend charts in your reference
     const dateField = dateFields[0];
     if (dateField && revenueField) {
       addChart({
         id: `auto_chart_${chartIndex++}`,
         title: `${revenueField.originalName} Trend Over Time`,
         chartType: 'area',
         field: revenueField.name,
         categoryField: dateField.name,
         aggregation: 'sum',
       });
     }
    
    // 4. Quantity analysis (Bar Chart)
    const quantityField = numberFields.find(f => 
      f.originalName.toLowerCase().includes('quantity') ||
      f.originalName.toLowerCase().includes('count') ||
      f.originalName.toLowerCase().includes('units')
    );
    
    if (quantityField && categoryField) {
      addChart({
        id: `auto_chart_${chartIndex++}`,
        title: `${quantityField.originalName} by ${categoryField.originalName}`,
        chartType: 'bar',
        field: quantityField.name,
        categoryField: categoryField.name,
        aggregation: 'sum',
      });
    }
    
    // 5. Channel/Region analysis (Bar Chart)
    const channelField = dimensionFields.find(f => 
      f.originalName.toLowerCase().includes('channel') ||
      f.originalName.toLowerCase().includes('region') ||
      f.originalName.toLowerCase().includes('area')
    );
    
    if (channelField && revenueField && channelField.name !== categoryField?.name) {
      addChart({
        id: `auto_chart_${chartIndex++}`,
        title: `${revenueField.originalName} by ${channelField.originalName}`,
        chartType: 'bar',
        field: revenueField.name,
        categoryField: channelField.name,
        aggregation: 'sum',
      });
    }
    
    // 6. Price analysis (Bar Chart)
    const priceField = numberFields.find(f => 
      f.originalName.toLowerCase().includes('price') ||
      f.originalName.toLowerCase().includes('cost')
    );
    
    if (priceField && categoryField) {
      addChart({
        id: `auto_chart_${chartIndex++}`,
        title: `Average ${priceField.originalName} by ${categoryField.originalName}`,
        chartType: 'bar',
        field: priceField.name,
        categoryField: categoryField.name,
        aggregation: 'average',
      });
    }
    
    // 7. Discount analysis (Bar Chart)
    const discountField = numberFields.find(f => 
      f.originalName.toLowerCase().includes('discount')
    );
    
    if (discountField && categoryField) {
      addChart({
        id: `auto_chart_${chartIndex++}`,
        title: `Average ${discountField.originalName} by ${categoryField.originalName}`,
        chartType: 'bar',
        field: discountField.name,
        categoryField: categoryField.name,
        aggregation: 'average',
      });
    }
    
         // 8. Customer analysis (Radar Chart) - if customer fields exist
     const customerField = dimensionFields.find(f => 
       f.originalName.toLowerCase().includes('customer') ||
       f.originalName.toLowerCase().includes('client')
     );
     
     if (customerField && revenueField) {
       addChart({
         id: `auto_chart_${chartIndex++}`,
         title: `Top Customers by ${revenueField.originalName}`,
         chartType: 'radar',
         field: revenueField.name,
         categoryField: customerField.name,
         aggregation: 'sum',
       });
     }

     // 9. Scatter plot analysis (Price vs Quantity correlation)
     const priceFieldForScatter = numberFields.find(f => 
       f.originalName.toLowerCase().includes('price') ||
       f.originalName.toLowerCase().includes('cost')
     );
     
     if (priceFieldForScatter && quantityField) {
       addChart({
         id: `auto_chart_${chartIndex++}`,
         title: `${priceFieldForScatter.originalName} vs ${quantityField.originalName} Correlation`,
         chartType: 'scatter',
         field: quantityField.name,
         categoryField: priceFieldForScatter.name,
         aggregation: 'sum',
       });
     }
    
    // Show success message
    console.log('Auto dashboard generated successfully! 🎉');
    alert('Beautiful dashboard created automatically! 🎉\n\nYour dashboard now includes:\n• Multiple KPIs with key metrics\n• Revenue analysis charts\n• Distribution visualizations\n• Time series trends\n• Performance comparisons\n\nClick "Hide Builders" to focus on your dashboard view!');
  };

  const getKPITitle = (fieldName: string): string => {
    const lowerName = fieldName.toLowerCase();
    if (lowerName.includes('revenue')) return 'Total Revenue';
    if (lowerName.includes('sales')) return 'Total Sales';
    if (lowerName.includes('quantity')) return 'Total Quantity';
    if (lowerName.includes('amount')) return 'Total Amount';
    if (lowerName.includes('price')) return 'Average Price';
    if (lowerName.includes('discount')) return 'Average Discount';
    if (lowerName.includes('unit')) return 'Total Units';
    if (lowerName.includes('count')) return 'Total Count';
    if (lowerName.includes('cost')) return 'Total Cost';
    if (lowerName.includes('profit')) return 'Total Profit';
    if (lowerName.includes('margin')) return 'Total Margin';
    return `Total ${fieldName}`;
  };

  const getKPIAggregation = (fieldName: string): string => {
    const lowerName = fieldName.toLowerCase();
    if (lowerName.includes('price') || lowerName.includes('discount')) return 'average';
    return 'sum';
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'upload':
        return (
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">
                {hasData ? 'Upload New Data' : 'Welcome to WeaveViz'}
              </h2>
              <p className="text-lg text-muted-foreground">
                {hasData 
                  ? 'Upload a new CSV or Excel file to replace the current data'
                  : 'Upload your CSV or Excel file to start building interactive dashboards'
                }
              </p>
              {hasData && (
                <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Current file: <strong>{fileName}</strong> ({rawRows.length.toLocaleString()} rows)
                  </p>
                </div>
              )}
            </div>
            <FileDropZone onFileProcessed={handleFileProcessed} />
          </div>
        );

      case 'preview':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Data Preview</h2>
                <p className="text-muted-foreground">
                  Review your uploaded data ({rawRows.length.toLocaleString()} rows)
                </p>
              </div>
              <div className="flex space-x-2">
                <Button 
                  variant="outline"
                  onClick={() => setActiveTab('upload')}
                >
                  Back to Upload
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setActiveTab('profile')}
                >
                  Continue to Profiling
                </Button>
              </div>
            </div>
            <DataPreview />
          </div>
        );

      case 'profile':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Field Profiling</h2>
                <p className="text-muted-foreground">
                  Review detected data types and field statistics
                </p>
              </div>
              <div className="flex space-x-2">
                <Button 
                  variant="outline"
                  onClick={() => setActiveTab('preview')}
                >
                  Back to Preview
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setActiveTab('build')}
                >
                  Start Building Dashboard
                </Button>
              </div>
            </div>
            <FieldProfiler />
          </div>
        );

      case 'build':
        return (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Dashboard Builder</h2>
                <p className="text-muted-foreground">
                  Create charts and KPIs from your data
                </p>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" onClick={() => setActiveTab('profile')}>
                  Back to Profiling
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowBuilders(!showBuilders)}
                >
                  {showBuilders ? 'Hide Builders' : 'Show Builders'}
                </Button>
                <Button 
                  variant="outline"
                  onClick={generateAutoDashboard}
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Auto Dashboard
                </Button>
                <Button>
                  <Save className="w-4 h-4 mr-2" />
                  Save Dashboard
                </Button>
              </div>
            </div>
            
            {/* Live Dashboard Preview */}
            <DashboardPreview />
            
            {/* Builders Section */}
            {showBuilders && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* KPI Builder */}
                <div>
                  <KpiBuilder />
                </div>
                
                {/* Chart Builder */}
                <div>
                  <ChartBuilder />
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <img src="/logo.png" alt="WeaveViz Logo" className="w-8 h-8" />
              <h1 className="text-2xl font-bold text-primary">WeaveViz</h1>
            </div>
            <nav className="flex space-x-4">
              <Button variant="ghost" className="bg-muted">
                Dashboard
              </Button>
              <Button
                variant="ghost"
                onClick={() => navigate('/datasets')}
              >
                <Database className="w-4 h-4 mr-2" />
                Datasets
              </Button>
            </nav>
          </div>
          <div className="flex items-center space-x-2">
            {fileName && (
              <span className="text-sm text-muted-foreground">
                {fileName}
              </span>
            )}
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" onClick={logout}>
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="border-b">
        <div className="container mx-auto px-4">
          <nav className="flex space-x-8">
            {[
              { id: 'upload', label: 'Upload', disabled: false },
              { id: 'preview', label: 'Preview', disabled: !hasData },
              { id: 'profile', label: 'Profile', disabled: !hasData },
              { id: 'build', label: 'Build', disabled: !hasProfiles },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  if (!tab.disabled) {
                    setActiveTab(tab.id as any);
                  }
                }}
                disabled={tab.disabled}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : tab.disabled
                    ? 'border-transparent text-muted-foreground/50 cursor-not-allowed'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {renderTabContent()}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
