import React, { useState } from 'react';
import {
  Table,
  BarChart3,
  FileCode2,
  Database,
  AlertCircle,
  Clock,
  Rows3,
  Columns3,
  CheckCircle2,
} from 'lucide-react';
import { QueryResult, TableSchema } from '@/types';
import { ResultTable } from './ResultTable';
import { ResultChart } from './ResultChart';
import { Tabs } from '@/components/ui/Tabs';
import { Badge } from '@/components/ui/Badge';
import { formatDuration } from '@/utils/formatters';

interface ResultWorkspaceProps {
  result: QueryResult | null;
  error?: string | null;
  activeTableSchema?: TableSchema | null;
}

export const ResultWorkspace: React.FC<ResultWorkspaceProps> = ({
  result,
  error,
  activeTableSchema,
}) => {
  const [activeTab, setActiveTab] = useState<string>('results');

  // If there is an error, switch to error tab automatically
  React.useEffect(() => {
    if (error) {
      setActiveTab('error');
    } else if (result && activeTab === 'error') {
      setActiveTab('results');
    }
  }, [error, result]);

  const tabs = [
    {
      id: 'results',
      label: 'Results',
      icon: <Table className="w-3.5 h-3.5" />,
      count: result ? result.totalRows : undefined,
    },
    {
      id: 'chart',
      label: 'Chart',
      icon: <BarChart3 className="w-3.5 h-3.5" />,
    },
    {
      id: 'details',
      label: 'Query Details',
      icon: <FileCode2 className="w-3.5 h-3.5" />,
    },
    {
      id: 'schema',
      label: 'Schema',
      icon: <Database className="w-3.5 h-3.5" />,
      count: activeTableSchema ? activeTableSchema.columns.length : undefined,
    },
  ];

  if (error) {
    tabs.push({
      id: 'error',
      label: 'Error Details',
      icon: <AlertCircle className="w-3.5 h-3.5 text-rose-400" />,
      count: undefined,
    });
  }

  return (
    <div className="bg-navy-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl flex flex-col">
      {/* Workspace Header & Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2 bg-navy-950/70 border-b border-slate-800">
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

        <div className="flex items-center gap-3 text-xs font-mono">
          {error ? (
            <Badge variant="danger" size="sm">
              Execution Error
            </Badge>
          ) : result ? (
            <>
              <div className="flex items-center gap-1.5 text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Success</span>
              </div>
              <div className="flex items-center gap-1 text-slate-400">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span>{formatDuration(result.executionTimeMs)}</span>
              </div>
              <div className="flex items-center gap-1 text-slate-400">
                <Rows3 className="w-3.5 h-3.5 text-blue-400" />
                <span>{result.totalRows} rows</span>
              </div>
              <div className="flex items-center gap-1 text-slate-400">
                <Columns3 className="w-3.5 h-3.5 text-purple-400" />
                <span>{result.columns.length} cols</span>
              </div>
            </>
          ) : (
            <span className="text-slate-400">Ready to execute SQL</span>
          )}
        </div>
      </div>

      {/* Tab Panels */}
      <div className="p-4 min-h-[260px]">
        {activeTab === 'results' && (
          result ? (
            <ResultTable result={result} />
          ) : (
            <div className="py-16 text-center text-slate-400 text-xs font-mono">
              Write SQL query above and click &quot;Run Query&quot; or press <kbd className="text-cyan-300">Ctrl+Enter</kbd> to see returned rows.
            </div>
          )
        )}

        {activeTab === 'chart' && (
          result ? (
            <ResultChart result={result} />
          ) : (
            <div className="py-16 text-center text-slate-400 text-xs font-mono">
              Execute a query to unlock interactive chart rendering.
            </div>
          )
        )}

        {activeTab === 'details' && (
          result ? (
            <div className="space-y-4 text-xs font-mono">
              <div className="p-3 rounded-lg bg-navy-950 border border-slate-800">
                <div className="text-slate-400 mb-1">Executed SQL:</div>
                <pre className="text-cyan-300 whitespace-pre-wrap">{result.sql}</pre>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-lg bg-navy-950 border border-slate-800">
                  <div className="text-slate-400">Execution Time</div>
                  <div className="text-sm font-semibold text-slate-100 mt-1">{result.executionTimeMs} ms</div>
                </div>
                <div className="p-3 rounded-lg bg-navy-950 border border-slate-800">
                  <div className="text-slate-400">Returned Rows</div>
                  <div className="text-sm font-semibold text-slate-100 mt-1">{result.totalRows}</div>
                </div>
                <div className="p-3 rounded-lg bg-navy-950 border border-slate-800">
                  <div className="text-slate-400">Column Count</div>
                  <div className="text-sm font-semibold text-slate-100 mt-1">{result.columns.length}</div>
                </div>
                <div className="p-3 rounded-lg bg-navy-950 border border-slate-800">
                  <div className="text-slate-400">Engine Type</div>
                  <div className="text-sm font-semibold text-cyan-400 mt-1">DuckDB Wasm</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-16 text-center text-slate-400 text-xs font-mono">
              No query executed in this session yet.
            </div>
          )
        )}

        {activeTab === 'schema' && (
          activeTableSchema ? (
            <div className="space-y-3">
              <div className="text-xs font-mono text-slate-400">
                Schema for table: <span className="text-cyan-400 font-bold">{activeTableSchema.tableName}</span> ({activeTableSchema.rowCount} rows)
              </div>
              <div className="border border-slate-800 rounded-lg overflow-hidden bg-navy-950/60">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-navy-900 border-b border-slate-800 text-slate-400">
                    <tr>
                      <th className="py-2 px-3">Column Name</th>
                      <th className="py-2 px-3">Data Type</th>
                      <th className="py-2 px-3">Nullable</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40 text-slate-200">
                    {activeTableSchema.columns.map((col, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/30">
                        <td className="py-2 px-3 font-semibold text-slate-100">{col.name}</td>
                        <td className="py-2 px-3 text-cyan-300">{col.type}</td>
                        <td className="py-2 px-3 text-slate-400">{col.nullable ? 'YES' : 'NO'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="py-16 text-center text-slate-400 text-xs font-mono">
              No schema available for the current selection.
            </div>
          )
        )}

        {activeTab === 'error' && error && (
          <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-800/60 text-xs space-y-2 font-mono">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>DuckDB Syntax or Runtime Error</span>
            </div>
            <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{error}</p>
            <div className="pt-2 text-slate-400 text-[11px]">
              Tip: Verify table and column spellings against the <span className="text-cyan-300">Schema</span> tab, or check clauses order: SELECT -&gt; FROM -&gt; WHERE -&gt; GROUP BY -&gt; HAVING -&gt; ORDER BY -&gt; LIMIT.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
