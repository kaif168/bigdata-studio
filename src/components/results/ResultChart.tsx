import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { BarChart3, LineChart as LineIcon, PieChart as PieIcon, AreaChart as AreaIcon } from 'lucide-react';
import { QueryResult } from '@/types';
import { formatNumber } from '@/utils/formatters';

interface ResultChartProps {
  result: QueryResult;
}

const CHART_COLORS = [
  '#00f0ff', '#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#06b6d4', '#6366f1'
];

export const ResultChart: React.FC<ResultChartProps> = ({ result }) => {
  const [chartType, setChartType] = useState<'bar' | 'line' | 'area' | 'pie'>('bar');

  // Auto-detect categorical and numeric columns
  const { categoricalCols, numericCols } = useMemo(() => {
    if (!result.rows.length) return { categoricalCols: [], numericCols: [] };

    const firstRow = result.rows[0];
    const cat: string[] = [];
    const num: string[] = [];

    result.columns.forEach(col => {
      const val = firstRow[col];
      if (typeof val === 'number') {
        num.push(col);
      } else {
        cat.push(col);
      }
    });

    return {
      categoricalCols: cat.length ? cat : result.columns.slice(0, 1),
      numericCols: num.length ? num : result.columns.slice(1),
    };
  }, [result]);

  const [xKey, setXKey] = useState<string>(() => categoricalCols[0] || result.columns[0] || '');
  const [yKey, setYKey] = useState<string>(() => numericCols[0] || result.columns[1] || '');

  // Keep keys in sync if columns change
  React.useEffect(() => {
    if (categoricalCols.length && !categoricalCols.includes(xKey)) {
      setXKey(categoricalCols[0]);
    }
    if (numericCols.length && !numericCols.includes(yKey)) {
      setYKey(numericCols[0] || result.columns[0]);
    }
  }, [categoricalCols, numericCols]);

  const chartData = useMemo(() => {
    return result.rows.slice(0, 30).map(row => ({
      name: String(row[xKey] ?? ''),
      value: typeof row[yKey] === 'number' ? row[yKey] : Number(row[yKey]) || 0,
    }));
  }, [result.rows, xKey, yKey]);

  if (!result.rows.length || !result.columns.length) {
    return (
      <div className="py-12 text-center text-slate-400 font-mono text-xs">
        Execute a query returning rows to generate a visual chart.
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-4">
      {/* Chart Config Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-navy-950/60 p-3 rounded-xl border border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-mono">Chart:</span>
          <div className="flex items-center gap-1 bg-navy-900 border border-slate-800 rounded-lg p-0.5">
            <button
              onClick={() => setChartType('bar')}
              className={`p-1.5 rounded ${chartType === 'bar' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
              title="Bar Chart"
            >
              <BarChart3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setChartType('line')}
              className={`p-1.5 rounded ${chartType === 'line' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
              title="Line Chart"
            >
              <LineIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setChartType('area')}
              className={`p-1.5 rounded ${chartType === 'area' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
              title="Area Chart"
            >
              <AreaIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setChartType('pie')}
              className={`p-1.5 rounded ${chartType === 'pie' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
              title="Pie Chart"
            >
              <PieIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-mono">X Axis:</span>
            <select
              value={xKey}
              onChange={e => setXKey(e.target.value)}
              className="bg-navy-900 border border-slate-800 rounded px-2 py-1 text-slate-200 text-xs font-mono focus:outline-none"
            >
              {result.columns.map(col => (
                <option key={col} value={col}>
                  {col}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-mono">Y Metric:</span>
            <select
              value={yKey}
              onChange={e => setYKey(e.target.value)}
              className="bg-navy-900 border border-slate-800 rounded px-2 py-1 text-slate-200 text-xs font-mono focus:outline-none"
            >
              {result.columns.map(col => (
                <option key={col} value={col}>
                  {col}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'bar' ? (
            <BarChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc', fontSize: '12px' }}
                formatter={(val: any) => [formatNumber(Number(val)), yKey]}
              />
              <Bar dataKey="value" fill="#00f0ff" radius={[4, 4, 0, 0]} />
            </BarChart>
          ) : chartType === 'line' ? (
            <LineChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc', fontSize: '12px' }}
                formatter={(val: any) => [formatNumber(Number(val)), yKey]}
              />
              <Line type="monotone" dataKey="value" stroke="#00f0ff" strokeWidth={2.5} dot={{ r: 4, fill: '#00f0ff' }} />
            </LineChart>
          ) : chartType === 'area' ? (
            <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc', fontSize: '12px' }}
                formatter={(val: any) => [formatNumber(Number(val)), yKey]}
              />
              <Area type="monotone" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.25} />
            </AreaChart>
          ) : (
            <PieChart>
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc', fontSize: '12px' }}
                formatter={(val: any) => [formatNumber(Number(val)), yKey]}
              />
              <Legend wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
              <Pie
                data={chartData.slice(0, 8)}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={95}
                label
              >
                {chartData.slice(0, 8).map((_, index) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};
