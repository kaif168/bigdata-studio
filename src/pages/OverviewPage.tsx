import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Database,
  Terminal,
  BarChart3,
  Trophy,
  Cpu,
  Clock,
  CheckCircle2,
  Layers,
  ArrowUpRight,
  TrendingUp,
  Sparkles,
  BookOpen,
  Play,
  RotateCw,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { useDatabase } from '@/context/DatabaseContext';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { StorageService } from '@/services/persistence/storage';
import { formatNumber, formatDuration } from '@/utils/formatters';

export const OverviewPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    availableTables,
    activeTable,
    setActiveTable,
    totalQueriesExecuted,
    successfulQueriesCount,
    lastExecutionDuration,
    executeQuery,
  } = useDatabase();

  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [timelineData, setTimelineData] = useState<any[]>([]);
  const [isLoadingVisuals, setIsLoadingVisuals] = useState<boolean>(false);

  const history = StorageService.getQueryHistory().slice(0, 5);
  const challengeProgress = StorageService.getChallengeProgress();
  const completedChallengesCount = Object.values(challengeProgress).filter(p => p.completed).length;

  const currentTableSchema = availableTables.find(t => t.tableName === activeTable);

  const totalRecords = useMemo(() => {
    return availableTables.reduce((acc, t) => acc + (t.rowCount || 0), 0);
  }, [availableTables]);

  const numericColumnsCount = useMemo(() => {
    if (!currentTableSchema) return 0;
    return currentTableSchema.columns.filter(c => {
      const type = c.type.toUpperCase();
      return (
        type.includes('INT') ||
        type.includes('DOUBLE') ||
        type.includes('FLOAT') ||
        type.includes('DECIMAL') ||
        type.includes('NUMERIC') ||
        type.includes('BIGINT')
      );
    }).length;
  }, [currentTableSchema]);

  // Load real overview aggregations based on active table
  useEffect(() => {
    let isCancelled = false;

    const loadMetrics = async () => {
      setIsLoadingVisuals(true);
      try {
        if (activeTable === 'sales') {
          const catRes = await executeQuery(
            `SELECT category AS label, ROUND(SUM(amount), 2) AS value FROM sales GROUP BY category ORDER BY value DESC LIMIT 6;`,
            'sales'
          );
          const timeRes = await executeQuery(
            `SELECT strftime(CAST(order_date AS DATE), '%Y-%m') AS date_month, ROUND(SUM(amount), 2) AS monthly_rev FROM sales GROUP BY 1 ORDER BY 1 ASC LIMIT 12;`,
            'sales'
          );
          if (!isCancelled) {
            setCategoryData(catRes.rows);
            setTimelineData(timeRes.rows);
          }
        } else if (activeTable === 'students') {
          const deptRes = await executeQuery(
            `SELECT department AS label, ROUND(AVG(exam_score), 1) AS value FROM students GROUP BY department ORDER BY value DESC;`,
            'students'
          );
          const semRes = await executeQuery(
            `SELECT 'Sem ' || CAST(semester AS VARCHAR) AS date_month, ROUND(AVG(attendance_percentage), 1) AS monthly_rev FROM students GROUP BY semester ORDER BY semester ASC;`,
            'students'
          );
          if (!isCancelled) {
            setCategoryData(deptRes.rows);
            setTimelineData(semRes.rows);
          }
        } else if (activeTable === 'web_events') {
          const evtRes = await executeQuery(
            `SELECT event_type AS label, COUNT(*) AS value FROM web_events GROUP BY event_type ORDER BY value DESC;`,
            'web_events'
          );
          const devRes = await executeQuery(
            `SELECT device_type AS date_month, ROUND(AVG(session_duration), 1) AS monthly_rev FROM web_events GROUP BY device_type ORDER BY monthly_rev DESC;`,
            'web_events'
          );
          if (!isCancelled) {
            setCategoryData(evtRes.rows);
            setTimelineData(devRes.rows);
          }
        } else {
          // Generic query for any selected table
          if (currentTableSchema && currentTableSchema.columns.length >= 2) {
            const firstCol = currentTableSchema.columns[0].name;
            const res = await executeQuery(
              `SELECT CAST("${firstCol}" AS VARCHAR) AS label, COUNT(*) AS value FROM "${activeTable}" GROUP BY 1 ORDER BY value DESC LIMIT 6;`,
              activeTable
            );
            if (!isCancelled) {
              setCategoryData(res.rows);
              setTimelineData([]);
            }
          }
        }
      } catch (err) {
        console.warn('Could not load overview charts:', err);
      } finally {
        if (!isCancelled) setIsLoadingVisuals(false);
      }
    };

    if (activeTable && availableTables.length > 0) {
      loadMetrics();
    }

    return () => {
      isCancelled = true;
    };
  }, [activeTable, availableTables.length]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-navy-900 via-navy-900 to-blue-950/60 border border-slate-800 p-6 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <Badge variant="cyan" size="sm">
                Academic Big Data Lab
              </Badge>
              <Badge variant="purple" size="sm">
                DuckDB-Wasm Engine
              </Badge>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-100">
              BigData Studio — Interactive SQL &amp; Big Data Analytics Lab
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Explore in-browser analytical SQL powered by DuckDB-Wasm, execute aggregations over multi-domain datasets, visualize distributions, simulate MapReduce pipelines, and verify database challenges.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="primary"
              size="md"
              onClick={() => navigate('/playground')}
              leftIcon={<Terminal className="w-4 h-4" />}
            >
              Open SQL Playground
            </Button>
            <Button
              variant="secondary"
              size="md"
              onClick={() => navigate('/challenges')}
              leftIcon={<Trophy className="w-4 h-4 text-amber-400" />}
            >
              Solve Challenges
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
        <Card className="p-4">
          <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between">
            <span>Total Records</span>
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-lg font-bold text-slate-100 mt-2 font-mono">
            {formatNumber(totalRecords, 0)}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Across all tables</div>
        </Card>

        <Card className="p-4">
          <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between">
            <span>Active Dataset</span>
            <Database className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="text-lg font-bold text-cyan-300 mt-2 font-mono truncate">
            {activeTable}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            {currentTableSchema?.rowCount || 0} rows
          </div>
        </Card>

        <Card className="p-4">
          <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between">
            <span>Available Tables</span>
            <Database className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <div className="text-lg font-bold text-slate-100 mt-2 font-mono">
            {availableTables.length}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Ready in memory</div>
        </Card>

        <Card className="p-4">
          <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between">
            <span>Numeric Cols</span>
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-lg font-bold text-slate-100 mt-2 font-mono">
            {numericColumnsCount}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">In active table</div>
        </Card>

        <Card className="p-4">
          <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between">
            <span>Queries Executed</span>
            <Terminal className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="text-lg font-bold text-slate-100 mt-2 font-mono">
            {totalQueriesExecuted}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">In current session</div>
        </Card>

        <Card className="p-4">
          <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between">
            <span>Successful SQL</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-lg font-bold text-emerald-400 mt-2 font-mono">
            {successfulQueriesCount}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Valid executions</div>
        </Card>

        <Card className="p-4">
          <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between">
            <span>Last Duration</span>
            <Clock className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-lg font-bold text-amber-300 mt-2 font-mono">
            {formatDuration(lastExecutionDuration)}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Engine latency</div>
        </Card>
      </div>

      {/* Real Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown Chart */}
        <Card>
          <CardHeader
            title={`Top Categories in ${activeTable.toUpperCase()}`}
            subtitle="Real-time DuckDB GROUP BY aggregation over the currently selected table."
            icon={<BarChart3 className="w-5 h-5 text-cyan-400" />}
          />
          <div className="h-64 w-full pt-2">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} margin={{ top: 10, right: 20, left: 0, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis
                    dataKey="label"
                    stroke="#94a3b8"
                    tick={{ fill: '#94a3b8', fontSize: 10 }}
                    angle={-20}
                    textAnchor="end"
                  />
                  <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc', fontSize: '11px' }}
                    formatter={(val: any) => [formatNumber(Number(val)), 'Total Value']}
                  />
                  <Bar dataKey="value" fill="#00f0ff" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs font-mono text-slate-400">
                {isLoadingVisuals ? 'Calculating DuckDB aggregation...' : 'No categorical chart available for this table.'}
              </div>
            )}
          </div>
        </Card>

        {/* Timeline Chart */}
        <Card>
          <CardHeader
            title={`Trend Series Analysis (${activeTable})`}
            subtitle="Chronological aggregate distribution derived from underlying table timestamps."
            icon={<TrendingUp className="w-5 h-5 text-blue-400" />}
          />
          <div className="h-64 w-full pt-2">
            {timelineData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timelineData} margin={{ top: 10, right: 20, left: 0, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis
                    dataKey="date_month"
                    stroke="#94a3b8"
                    tick={{ fill: '#94a3b8', fontSize: 10 }}
                    angle={-20}
                    textAnchor="end"
                  />
                  <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc', fontSize: '11px' }}
                    formatter={(val: any) => [formatNumber(Number(val)), 'Metric Aggregate']}
                  />
                  <Area type="monotone" dataKey="monthly_rev" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.25} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs font-mono text-slate-400">
                {isLoadingVisuals ? 'Calculating time-series trends...' : 'No chronological dates identified for this table.'}
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Bottom Grid: Quick Actions, Recent Queries & Learning Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions & Suggestions */}
        <Card className="space-y-4">
          <CardHeader
            title="Quick Workflows"
            subtitle="Rapid jump-start into analytics features."
            icon={<Sparkles className="w-5 h-5 text-amber-400" />}
          />
          <div className="space-y-2">
            <button
              onClick={() => navigate('/playground')}
              className="w-full p-3 rounded-lg bg-navy-950 hover:bg-slate-800/80 border border-slate-800 text-left transition-colors flex items-center justify-between group"
            >
              <div>
                <div className="text-xs font-semibold text-slate-200 group-hover:text-cyan-300">
                  Execute Analytical Query
                </div>
                <div className="text-[11px] text-slate-400">Run SQL with Monaco and DuckDB</div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-cyan-400" />
            </button>

            <button
              onClick={() => navigate('/explorer')}
              className="w-full p-3 rounded-lg bg-navy-950 hover:bg-slate-800/80 border border-slate-800 text-left transition-colors flex items-center justify-between group"
            >
              <div>
                <div className="text-xs font-semibold text-slate-200 group-hover:text-cyan-300">
                  Import Custom CSV / JSON
                </div>
                <div className="text-[11px] text-slate-400">Upload and query your own dataset</div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-cyan-400" />
            </button>

            <button
              onClick={() => navigate('/mapreduce')}
              className="w-full p-3 rounded-lg bg-navy-950 hover:bg-slate-800/80 border border-slate-800 text-left transition-colors flex items-center justify-between group"
            >
              <div>
                <div className="text-xs font-semibold text-slate-200 group-hover:text-cyan-300">
                  Simulate MapReduce Stages
                </div>
                <div className="text-[11px] text-slate-400">Visualize Split, Map, Shuffle &amp; Reduce</div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-cyan-400" />
            </button>
          </div>
        </Card>

        {/* Recent SQL Activity */}
        <Card className="space-y-4">
          <CardHeader
            title="Recent SQL Executions"
            subtitle="Queries run in this browser session."
            icon={<Clock className="w-5 h-5 text-purple-400" />}
            action={
              <Link to="/history" className="text-xs font-mono text-cyan-400 hover:underline">
                View All
              </Link>
            }
          />
          {history.length > 0 ? (
            <div className="space-y-2">
              {history.map(item => (
                <div key={item.id} className="p-2.5 rounded-lg bg-navy-950 border border-slate-800 text-xs font-mono">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-cyan-400 font-bold uppercase">{item.dataset}</span>
                    <span className={item.status === 'success' ? 'text-emerald-400 text-[10px]' : 'text-rose-400 text-[10px]'}>
                      {item.status} ({item.executionTimeMs} ms)
                    </span>
                  </div>
                  <div className="text-slate-300 truncate text-[11px]">{item.sql}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-slate-400 text-xs font-mono">
              No queries executed yet. Launch the SQL Playground to begin!
            </div>
          )}
        </Card>

        {/* Academic Learning Progress */}
        <Card className="space-y-4">
          <CardHeader
            title="Academic Progress"
            subtitle="Curriculum mastery & practical challenges."
            icon={<Trophy className="w-5 h-5 text-amber-400" />}
          />
          <div className="space-y-3 text-xs">
            <div>
              <div className="flex items-center justify-between text-slate-300 mb-1.5 font-mono">
                <span>Practical Challenges</span>
                <span className="text-amber-400 font-bold">{completedChallengesCount} / 26</span>
              </div>
              <div className="w-full bg-navy-950 rounded-full h-2 overflow-hidden border border-slate-800">
                <div
                  className="bg-amber-400 h-full rounded-full transition-all"
                  style={{ width: `${Math.round((completedChallengesCount / 26) * 100)}%` }}
                />
              </div>
            </div>

            <div className="p-3 rounded-lg bg-navy-950 border border-slate-800 space-y-1">
              <div className="font-semibold text-slate-200">Big Data Curriculum Modules</div>
              <p className="text-[11px] text-slate-400">
                5 comprehensive modules covering Hadoop, Spark, NoSQL, and Big Data Engineering.
              </p>
              <div className="pt-2">
                <Button size="sm" variant="outline" onClick={() => navigate('/learning')}>
                  Browse Learning Hub
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
