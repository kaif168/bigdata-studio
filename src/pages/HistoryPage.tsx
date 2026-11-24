import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  History,
  Search,
  Play,
  Copy,
  Check,
  Trash2,
  Clock,
  CheckCircle2,
  AlertCircle,
  Database,
  Filter,
} from 'lucide-react';
import { StorageService } from '@/services/persistence/storage';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { QueryHistoryItem } from '@/types';
import { formatDate, formatDuration } from '@/utils/formatters';
import { useDatabase } from '@/context/DatabaseContext';

export const HistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { setActiveTable } = useDatabase();

  const [history, setHistory] = useState<QueryHistoryItem[]>(() =>
    StorageService.getQueryHistory()
  );
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'success' | 'error'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState<boolean>(false);

  const filtered = history.filter(item => {
    const matchesSearch =
      item.sql.toLowerCase().includes(search.toLowerCase()) ||
      item.dataset.toLowerCase().includes(search.toLowerCase()) ||
      (item.error && item.error.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCopy = (id: string, sql: string) => {
    navigator.clipboard.writeText(sql);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleRunAgain = (item: QueryHistoryItem) => {
    setActiveTable(item.dataset);
    navigate('/playground', {
      state: {
        sql: item.sql,
        dataset: item.dataset,
      },
    });
  };

  const handleDeleteItem = (id: string) => {
    StorageService.deleteQueryHistoryItem(id);
    setHistory(StorageService.getQueryHistory());
  };

  const handleClearAll = () => {
    StorageService.clearQueryHistory();
    setHistory([]);
    setIsClearConfirmOpen(false);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      {/* Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-navy-900 to-purple-950/40 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <History className="w-5 h-5 text-cyan-400" />
            SQL Execution History &amp; Audit Trail
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Persisted execution log recording queries, dataset contexts, latencies, and output counts.
          </p>
        </div>

        {history.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsClearConfirmOpen(true)}
            leftIcon={<Trash2 className="w-3.5 h-3.5 text-rose-400" />}
          >
            Clear History
          </Button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-navy-900 border border-slate-800 text-xs">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search query log..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-navy-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-mono">Status:</span>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as any)}
            className="bg-navy-950 border border-slate-800 rounded px-2.5 py-1 text-slate-200 font-mono focus:outline-none"
          >
            <option value="all">All Statuses ({history.length})</option>
            <option value="success">Successful</option>
            <option value="error">Failed / Error</option>
          </select>
        </div>
      </div>

      {/* Log list */}
      <div className="space-y-3">
        {filtered.length > 0 ? (
          filtered.map(item => (
            <Card key={item.id} className="p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                <div className="flex items-center gap-2">
                  {item.status === 'success' ? (
                    <span className="flex items-center gap-1 text-emerald-400 font-bold">
                      <CheckCircle2 className="w-4 h-4" /> SUCCESS
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-rose-400 font-bold">
                      <AlertCircle className="w-4 h-4" /> ERROR
                    </span>
                  )}
                  <span className="text-slate-400">•</span>
                  <span className="text-cyan-400 flex items-center gap-1">
                    <Database className="w-3 h-3" /> {item.dataset}
                  </span>
                  <span className="text-slate-400">•</span>
                  <span className="text-slate-400">
                    {formatDuration(item.executionTimeMs)}
                  </span>
                  {item.rowCount !== undefined && (
                    <>
                      <span className="text-slate-400">•</span>
                      <span className="text-slate-300">{item.rowCount} rows</span>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-3 text-slate-400 text-[11px]">
                  <span>{formatDate(item.timestamp)}</span>
                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    className="hover:text-rose-400 transition-colors p-1"
                    title="Delete history item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* SQL Snippet */}
              <div className="p-3 rounded-lg bg-navy-950 border border-slate-800 font-mono text-xs text-cyan-300 whitespace-pre-wrap max-h-32 overflow-y-auto">
                {item.sql}
              </div>

              {item.error && (
                <div className="p-2.5 rounded-lg bg-rose-950/20 border border-rose-800/40 text-rose-300 text-xs font-mono">
                  <strong>Error:</strong> {item.error}
                </div>
              )}

              {/* Actions Footer */}
              <div className="flex items-center justify-end gap-2 pt-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleCopy(item.id, item.sql)}
                  leftIcon={copiedId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                >
                  {copiedId === item.id ? 'Copied' : 'Copy SQL'}
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleRunAgain(item)}
                  leftIcon={<Play className="w-3.5 h-3.5 text-cyan-400 fill-current" />}
                >
                  Run Query Again
                </Button>
              </div>
            </Card>
          ))
        ) : (
          <div className="py-20 text-center text-slate-400 text-xs font-mono">
            {history.length === 0
              ? 'No queries executed yet. Run queries in the SQL Playground to view history here.'
              : 'No queries match your search filter.'}
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={isClearConfirmOpen}
        onClose={() => setIsClearConfirmOpen(false)}
        title="Clear Query History"
        footer={
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setIsClearConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" onClick={handleClearAll}>
              Confirm Clear
            </Button>
          </div>
        }
      >
        <p className="text-xs text-slate-300 font-mono leading-relaxed">
          Are you sure you want to permanently clear all stored query history? This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
};
