import React from 'react';
import { Calendar, Hash, Type, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useDataStore } from '@/store/useDataStore';
import type { FieldProfile, FieldType } from '@weaveviz/shared';

function getTypeIcon(type: FieldType) {
  switch (type) {
    case 'date':
      return <Calendar className="w-4 h-4" />;
    case 'number':
      return <Hash className="w-4 h-4" />;
    case 'dimension':
      return <Type className="w-4 h-4" />;
    default:
      return <Type className="w-4 h-4" />;
  }
}

function getTypeColor(type: FieldType) {
  switch (type) {
    case 'date':
      return 'text-blue-400 bg-blue-500/20';
    case 'number':
      return 'text-green-400 bg-green-500/20';
    case 'dimension':
      return 'text-purple-400 bg-purple-500/20';
    default:
      return 'text-gray-400 bg-gray-500/20';
  }
}

function formatValue(value: any, type: FieldType): string {
  if (value === null || value === undefined) return 'N/A';
  
  if (type === 'number') {
    return typeof value === 'number' ? value.toLocaleString() : String(value);
  }
  
  if (type === 'date') {
    try {
      return new Date(value).toLocaleDateString();
    } catch {
      return String(value);
    }
  }
  
  return String(value);
}

function FieldProfileCard({ profile }: { profile: FieldProfile }) {
  const qualityScore = Math.round((1 - profile.nullRatio) * 100);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={`p-1.5 rounded ${getTypeColor(profile.type)}`}>
              {getTypeIcon(profile.type)}
            </div>
            <div>
              <CardTitle className="text-lg">{profile.originalName || profile.name}</CardTitle>
              <CardDescription className="text-sm capitalize">
                {profile.type} field
              </CardDescription>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Quality</div>
            <div className={`text-lg font-semibold ${
              qualityScore >= 90 ? 'text-green-400' :
              qualityScore >= 70 ? 'text-yellow-400' : 'text-red-400'
            }`}>
              {qualityScore}%
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Basic Stats */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-muted-foreground">Distinct Values:</span>
            <div className="font-medium">{profile.distinctCount.toLocaleString()}</div>
          </div>
          <div>
            <span className="text-muted-foreground">Null Ratio:</span>
            <div className="font-medium">{(profile.nullRatio * 100).toFixed(1)}%</div>
          </div>
        </div>

        {/* Type-specific Stats */}
        {profile.type === 'number' && (
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-muted-foreground flex items-center">
                <TrendingDown className="w-3 h-3 mr-1" />
                Min:
              </span>
              <div className="font-medium">{formatValue(profile.min, 'number')}</div>
            </div>
            <div>
              <span className="text-muted-foreground flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" />
                Max:
              </span>
              <div className="font-medium">{formatValue(profile.max, 'number')}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Mean:</span>
              <div className="font-medium">{formatValue(profile.mean, 'number')}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Median:</span>
              <div className="font-medium">{formatValue(profile.median, 'number')}</div>
            </div>
          </div>
        )}

        {profile.type === 'date' && (
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-muted-foreground">Earliest:</span>
              <div className="font-medium">{formatValue(profile.minDate, 'date')}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Latest:</span>
              <div className="font-medium">{formatValue(profile.maxDate, 'date')}</div>
            </div>
          </div>
        )}

        {/* Sample Values */}
        <div>
          <span className="text-muted-foreground text-sm">Sample Values:</span>
          <div className="mt-1 flex flex-wrap gap-1">
            {profile.sampleValues.slice(0, 5).map((value, index) => (
              <span 
                key={index}
                className="inline-block px-2 py-1 text-xs bg-muted rounded"
              >
                {String(value).length > 15 ? `${String(value).slice(0, 15)}...` : String(value)}
              </span>
            ))}
            {profile.sampleValues.length > 5 && (
              <span className="inline-block px-2 py-1 text-xs text-muted-foreground">
                +{profile.sampleValues.length - 5} more
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function FieldProfiler() {
  const { fieldProfiles, rawRows } = useDataStore();

  if (fieldProfiles.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">No field profiles available</p>
        </CardContent>
      </Card>
    );
  }

  const typeGroups = {
    date: fieldProfiles.filter(p => p.type === 'date'),
    number: fieldProfiles.filter(p => p.type === 'number'),
    dimension: fieldProfiles.filter(p => p.type === 'dimension'),
  };

  return (
    <div className="space-y-6">
      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Summary</CardTitle>
          <CardDescription>
            Analyzed {rawRows.length.toLocaleString()} rows across {fieldProfiles.length} fields
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{typeGroups.date.length}</div>
              <div className="text-sm text-muted-foreground">Date Fields</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{typeGroups.number.length}</div>
              <div className="text-sm text-muted-foreground">Numeric Fields</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">{typeGroups.dimension.length}</div>
              <div className="text-sm text-muted-foreground">Text Fields</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Field Profiles by Type */}
      {Object.entries(typeGroups).map(([type, profiles]) => {
        if (profiles.length === 0) return null;

        return (
          <div key={type}>
            <h3 className="text-xl font-semibold mb-4 capitalize">
              {type} Fields ({profiles.length})
            </h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {profiles.map((profile) => (
                <FieldProfileCard key={profile.name} profile={profile} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
