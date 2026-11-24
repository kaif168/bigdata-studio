import React, { useState, useEffect, useMemo } from 'react';
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
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import {
  BarChart3,
  LineChart as LineIcon,
  PieChart as PieIcon,
  AreaChart as AreaIcon,
  ScatterChart as ScatterIcon,
  Download,
  RefreshCw,
  Sparkles,
  Database,
  Filter,
} from 'lucide-react';
import { useDatabase } from '@/context/DatabaseContext';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader } from '@/components/ui/Card';
import { formatNumber } from '@/utils/formatters';
import { exportToCsv } from '@/utils/csvExport';

const PALETTE = ['#00f0ff', '#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#06b6d4', '#6366f1'];

export const VisualAnalyticsBuilder: React.FC = () => {
  const { availableTables, activeTable, setActiveTable, executeQuery } = useDatabase();

  const [selectedTable, setSelectedTable] = useState<string>(activeTable || 'sales');
  const [chartType, setChartType] = useState<'bar' | 'hbar' | 'line' | 'area' | 'pie' | 'scatter'>('bar');
  const [aggFunc, setAggFunc] = useState<'SUM' | 'AVG' | 'COUNT' | 'MIN' | 'MAX'>('SUM');
  const [chartTitle, setChartTitle] = useState<string>('Analytics Visualization');
  const [limit, setLimit] = useState<number>(20);

  const [xCol, setXCol] = useState<string>('');
  const [yCol, setYCol] = useState<string>('');
  const [chartData, setChartData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const tableSchema = availableTables.find(t => t.tableName === selectedTable);

  // Classify columns into categorical and numeric
  const { categoricalCols, numericCols } = useMemo(() => {
    if (!tableSchema) return { categoricalCols: [], numericCols: [] };
    const cat: string[] = [];
    const num: string[] = [];

    tableSchema.columns.forEach(col => {
      const type = col.type.toUpperCase();
      if (
        type.includes('INT') ||
        type.includes('DOUBLE') ||
        type.includes('FLOAT') ||
        type.includes('DECIMAL') ||
        type.includes('NUMERIC') ||
        type.includes('BIGINT')
      ) {
        num.push(col.name);
      } else {
        cat.push(col.name);
      }
    });

    return {
      categoricalCols: cat.length ? cat : tableSchema.columns.map(c => c.name),
      numericCols: num.length ? num : tableSchema.columns.map(c => c.name),
    };
  }, [tableSchema]);

  // Set default axes on table change
  useEffect(() => {
    if (categoricalCols.length > 0) {
      setXCol(categoricalCols[0]);
    }
    if (numericCols.length > 0) {
      setYCol(numericCols[0]);
    }
    setChartTitle(`${selectedTable.toUpperCase()} Aggregation by Category`);
  }, [selectedTable, categoricalCols, numericCols]);

  // Query DuckDB to generate the aggregated chart data
  const loadChartData = async () => {
    if (!selectedTable || !xCol) return;
    setIsLoading(true);
    setErrorMsg(null);

    let sql = '';
    if (chartType === 'scatter' && yCol) {
      sql = `SELECT "${xCol}" AS x, "${yCol}" AS y FROM "${selectedTable}" WHERE "${xCol}" IS NOT NULL AND "${yCol}" IS NOT NULL LIMIT ${limit};`;
    } else if (aggFunc === 'COUNT') {
      sql = `SELECT "${xCol}" AS label, COUNT(*) AS val FROM "${selectedTable}" WHERE "${xCol}" IS NOT NULL GROUP BY "${xCol}" ORDER BY val DESC LIMIT ${limit};`;
    } else if (yCol) {
      sql = `SELECT "${xCol}" AS label, ROUND(${aggFunc}("${yCol}"), 2) AS val FROM "${selectedTable}" WHERE "${xCol}" IS NOT NULL AND "${yCol}" IS NOT NULL GROUP BY "${xCol}" ORDER BY val DESC LIMIT ${limit};`;
    } else {
      sql = `SELECT "${xCol}" AS label, COUNT(*) AS val FROM "${selectedTable}" WHERE "${xCol}" IS NOT NULL GROUP BY "${xCol}" ORDER BY val DESC LIMIT ${limit};`;
    }

    try {
      const res = await executeQuery(sql, selectedTable);
      setChartData(res.rows);
    } catch (err: any) {
      console.error('Visual analytics query failed:', err);
      setErrorMsg(err.message || 'Failed to aggregate data for chart.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (xCol) {
      loadChartData();
    }
  }, [selectedTable, xCol, yCol, aggFunc, chartType, limit]);

  const handleExportData = () => {
    if (!chartData.length) return;
    const cols = Object.keys(chartData[0]);
    exportToCsv(`${selectedTable}_chart_data`, cols, chartData);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Control Configuration Panel */}
      <Card>
        <CardHeader
          title="Interactive Visual Analytics Builder"
          subtitle="Build custom dynamic charts powered by real-time DuckDB SQL aggregations."
          icon={<BarChart3 className="w-5 h-5 text-cyan-400" />}
          action={
            <Button
              size="sm"
              variant="outline"
              onClick={handleExportData}
              disabled={!chartData.length}
              leftIcon={<Download className="w-3.5 h-3.5 text-cyan-400" />}
            >
              Export Chart Data
            </Button>
          }
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2 text-xs">
          {/* Table select */}
          <div className="space-y-1.5">
            <label className="text-slate-400 font-mono">Dataset Table</label>
            <select
              value={selectedTable}
              onChange={e => {
                setSelectedTable(e.target.value);
                setActiveTable(e.target.value);
              }}
              className="w-full bg-navy-950 border border-slate-800 rounded-lg p-2 text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
            >
              {availableTables.map(t => (
                <option key={t.tableName} value={t.tableName}>
                  {t.tableName} ({t.rowCount} rows)
                </option>
              ))}
            </select>
          </div>

          {/* Chart type select */}
          <div className="space-y-1.5">
            <label className="text-slate-400 font-mono">Chart Format</label>
            <select
              value={chartType}
              onChange={e => setChartType(e.target.value as any)}
              className="w-full bg-navy-950 border border-slate-800 rounded-lg p-2 text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
            >
              <option value="bar">Vertical Bar Chart</option>
              <option value="hbar">Horizontal Bar Chart</option>
              <option value="line">Line Trend Chart</option>
              <option value="area">Area Volume Chart</option>
              <option value="pie">Pie Proportions</option>
              <option value="scatter">Scatter Plot</option>
            </select>
          </div>

          {/* X Axis */}
          <div className="space-y-1.5">
            <label className="text-slate-400 font-mono">Category (X-Axis)</label>
            <select
              value={xCol}
              onChange={e => setXCol(e.target.value)}
              className="w-full bg-navy-950 border border-slate-800 rounded-lg p-2 text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
            >
              {tableSchema?.columns.map(c => (
                <option key={c.name} value={c.name}>
                  {c.name} ({c.type})
                </option>
              ))}
            </select>
          </div>

          {/* Y Axis / Measure */}
          <div className="space-y-1.5">
            <label className="text-slate-400 font-mono">Measure (Y-Axis)</label>
            <select
              value={yCol}
              onChange={e => setYCol(e.target.value)}
              className="w-full bg-navy-950 border border-slate-800 rounded-lg p-2 text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
            >
              {numericCols.map(col => (
                <option key={col} value={col}>
                  {col} (numeric)
                </option>
              ))}
            </select>
          </div>

          {/* Aggregation */}
          <div className="space-y-1.5">
            <label className="text-slate-400 font-mono">Aggregation</label>
            <select
              value={aggFunc}
              onChange={e => setAggFunc(e.target.value as any)}
              className="w-full bg-navy-950 border border-slate-800 rounded-lg p-2 text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
            >
              <option value="SUM">SUM</option>
              <option value="AVG">AVG (Mean)</option>
              <option value="COUNT">COUNT</option>
              <option value="MIN">MIN</option>
              <option value="MAX">MAX</option>
            </select>
          </div>
        </div>

        {/* Chart Title & Refresh */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800/80 mt-4 text-xs">
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <span className="text-slate-400 font-mono shrink-0">Chart Title:</span>
            <input
              type="text"
              value={chartTitle}
              onChange={e => setChartTitle(e.target.value)}
              className="w-full bg-navy-950 border border-slate-800 rounded px-2.5 py-1 text-slate-100 font-semibold focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex items-center gap-3">
            <Button
              size="sm"
              variant="secondary"
              onClick={loadChartData}
              isLoading={isLoading}
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            >
              Refresh
            </Button>
          </div>
        </div>
      </Card>

      {/* Chart Canvas Card */}
      <Card>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-slate-100 text-base">{chartTitle}</h4>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Live DuckDB query: {aggFunc}({yCol || '*'}) grouped by {xCol} on table &quot;{selectedTable}&quot;
            </p>
          </div>
          <span className="text-xs font-mono text-cyan-400 bg-cyan-950/40 border border-cyan-800/40 px-2 py-1 rounded">
            {chartData.length} Data Points
          </span>
        </div>

        {errorMsg ? (
          <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-800 text-rose-300 text-xs font-mono">
            {errorMsg}
          </div>
        ) : !chartData.length ? (
          <div className="py-24 text-center text-slate-400 text-xs font-mono">
            {isLoading ? 'Running query against DuckDB-Wasm...' : 'No data returned for current selection.'}
          </div>
        ) : (
          <div className="h-96 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'bar' ? (
                <BarChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis
                    dataKey="label"
                    stroke="#94a3b8"
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                    angle={-25}
                    textAnchor="end"
                  />
                  <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }}
                    formatter={(val: any) => [formatNumber(Number(val)), `${aggFunc} (${yCol || 'Count'})`]}
                  />
                  <Bar dataKey="val" fill="#00f0ff" radius={[4, 4, 0, 0]} />
                </BarChart>
              ) : chartType === 'hbar' ? (
                <BarChart layout="vertical" data={chartData} margin={{ top: 10, right: 30, left: 60, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis type="number" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <YAxis type="category" dataKey="label" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} width={80} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }}
                    formatter={(val: any) => [formatNumber(Number(val)), `${aggFunc} (${yCol || 'Count'})`]}
                  />
                  <Bar dataKey="val" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                </BarChart>
              ) : chartType === 'line' ? (
                <LineChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="label" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} angle={-25} textAnchor="end" />
                  <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }}
                    formatter={(val: any) => [formatNumber(Number(val)), `${aggFunc} (${yCol || 'Count'})`]}
                  />
                  <Line type="monotone" dataKey="val" stroke="#00f0ff" strokeWidth={2.5} dot={{ r: 4, fill: '#00f0ff' }} />
                </LineChart>
              ) : chartType === 'area' ? (
                <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="label" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} angle={-25} textAnchor="end" />
                  <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }}
                    formatter={(val: any) => [formatNumber(Number(val)), `${aggFunc} (${yCol || 'Count'})`]}
                  />
                  <Area type="monotone" dataKey="val" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.25} />
                </AreaChart>
              ) : chartType === 'pie' ? (
                <PieChart>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }}
                    formatter={(val: any) => [formatNumber(Number(val)), `${aggFunc} (${yCol || 'Count'})`]}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }} />
                  <Pie
                    data={chartData.slice(0, 8)}
                    dataKey="val"
                    nameKey="label"
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    label
                  >
                    {chartData.slice(0, 8).map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PALETTE[index % PALETTE.length]} />
                    ))}
                  </Pie>
                </PieChart>
              ) : (
                <ScatterChart margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="x" name={xCol} stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <YAxis dataKey="y" name={yCol} stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <Tooltip
                    cursor={{ strokeDasharray: '3 3' }}
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }}
                  />
                  <Scatter name="Readings" data={chartData} fill="#00f0ff" />
                </ScatterChart>
              )}
            </ResponsiveContainer>
          </div>
        )}
      </Card>
    </div>
  );
};
