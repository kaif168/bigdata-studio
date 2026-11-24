import React from 'react';
import { BarChart3 } from 'lucide-react';
import { VisualAnalyticsBuilder } from '@/components/charts/VisualAnalyticsBuilder';
import { Badge } from '@/components/ui/Badge';

export const VisualAnalyticsPage: React.FC = () => {
  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
      <div className="p-5 rounded-2xl bg-gradient-to-r from-navy-900 to-cyan-950/40 border border-slate-800">
        <div className="flex items-center gap-2 mb-1.5">
          <Badge variant="cyan" size="sm">
            In-Browser BI Builder
          </Badge>
          <Badge variant="purple" size="sm">
            Recharts Vectorized Engine
          </Badge>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-100 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-cyan-400" />
          Dynamic Visual Analytics &amp; Chart Studio
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl leading-relaxed">
          Configure multi-dimensional charts (Bar, Horizontal Bar, Line, Area, Pie, Scatter) directly from database tables. DuckDB compiles and executes live aggregations in WebAssembly to power responsive visual insights.
        </p>
      </div>

      <VisualAnalyticsBuilder />
    </div>
  );
};
