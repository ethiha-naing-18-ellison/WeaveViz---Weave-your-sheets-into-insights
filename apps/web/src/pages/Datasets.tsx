import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Upload, Calendar, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Footer } from '@/components/Footer';
import { useAuthStore } from '@/store/useAuthStore';

export function Datasets() {
  const navigate = useNavigate();
  const { logout } = useAuthStore();

  const mockDatasets = [
    {
      id: '1',
      name: 'Sales Data 2024',
      originalName: 'sales_2024.csv',
      rowCount: 45678,
      createdAt: '2024-01-15T10:30:00Z',
    },
    {
      id: '2',
      name: 'Customer Analytics',
      originalName: 'customers.xlsx',
      rowCount: 12345,
      createdAt: '2024-01-10T14:20:00Z',
    },
  ];

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatRowCount = (count: number) => {
    return count.toLocaleString();
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
              <Button
                variant="ghost"
                onClick={() => navigate('/')}
              >
                Dashboard
              </Button>
              <Button variant="ghost" className="bg-muted">
                Datasets
              </Button>
            </nav>
          </div>
          <Button variant="outline" onClick={logout}>
            Sign Out
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold">Datasets</h2>
            <p className="text-muted-foreground mt-2">
              Manage your uploaded data files and create new dashboards
            </p>
          </div>
          <Button onClick={() => navigate('/')}>
            <Upload className="w-4 h-4 mr-2" />
            Upload New Dataset
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {mockDatasets.map((dataset) => (
            <Card key={dataset.id} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{dataset.name}</CardTitle>
                      <CardDescription className="text-sm">
                        {dataset.originalName}
                      </CardDescription>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Rows:</span>
                    <span className="font-medium">{formatRowCount(dataset.rowCount)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Created:</span>
                    <span className="font-medium flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      {formatDate(dataset.createdAt)}
                    </span>
                  </div>
                  <div className="pt-2">
                    <Button 
                      className="w-full" 
                      size="sm"
                      onClick={() => navigate('/')}
                    >
                      Create Dashboard
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Empty state or new dataset card */}
          <Card className="border-dashed border-2 hover:border-primary/50 transition-colors cursor-pointer">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="p-3 bg-primary/10 rounded-lg mb-4">
                <Upload className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Upload New Dataset</h3>
              <p className="text-sm text-muted-foreground text-center mb-4">
                Upload a CSV or Excel file to start creating dashboards
              </p>
              <Button onClick={() => navigate('/')}>
                Get Started
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
