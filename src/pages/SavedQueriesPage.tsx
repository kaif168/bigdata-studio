import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookmarkCheck,
  Search,
  Play,
  Copy,
  Check,
  Trash2,
  Edit2,
  Database,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { StorageService } from '@/services/persistence/storage';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { SavedQuery } from '@/types';
import { formatDate } from '@/utils/formatters';
import { useDatabase } from '@/context/DatabaseContext';

export const SavedQueriesPage: React.FC = () => {
  const navigate = useNavigate();
  const { setActiveTable } = useDatabase();

  const [savedQueries, setSavedQueries] = useState<SavedQuery[]>(() =>
    StorageService.getSavedQueries()
  );
  const [search, setSearch] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Edit / Rename modal
  const [editingQuery, setEditingQuery] = useState<SavedQuery | null>(null);
  const [editTitle, setEditTitle] = useState<string>('');
  const [editDesc, setEditDesc] = useState<string>('');

  const filtered = savedQueries.filter(q =>
    q.title.toLowerCase().includes(search.toLowerCase()) ||
    q.sql.toLowerCase().includes(search.toLowerCase()) ||
    (q.description && q.description.toLowerCase().includes(search.toLowerCase())) ||
    q.dataset.toLowerCase().includes(search.toLowerCase())
  );

  const handleCopy = (id: string, sql: string) => {
    navigator.clipboard.writeText(sql);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleRun = (q: SavedQuery) => {
    setActiveTable(q.dataset);
    navigate('/playground', {
      state: {
        sql: q.sql,
        dataset: q.dataset,
      },
    });
  };

  const handleDelete = (id: string) => {
    StorageService.deleteSavedQuery(id);
    setSavedQueries(StorageService.getSavedQueries());
  };

  const handleOpenEdit = (q: SavedQuery) => {
    setEditingQuery(q);
    setEditTitle(q.title);
    setEditDesc(q.description || '');
  };

  const handleSaveEdit = () => {
    if (!editingQuery || !editTitle.trim()) return;
    StorageService.updateSavedQuery(editingQuery.id, {
      title: editTitle.trim(),
      description: editDesc.trim() || undefined,
    });
    setSavedQueries(StorageService.getSavedQueries());
    setEditingQuery(null);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      {/* Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-navy-900 to-blue-950/40 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <BookmarkCheck className="w-5 h-5 text-cyan-400" />
            Saved Query Repository
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Bookmarked analytical snippets and custom queries persisted across browser sessions.
          </p>
        </div>

        <span className="text-xs font-mono text-cyan-400 bg-cyan-950/40 border border-cyan-800/40 px-3 py-1.5 rounded-lg">
          {savedQueries.length} Saved Snippets
        </span>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
        <input
          type="text"
          placeholder="Search saved queries by title, description, or SQL..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-navy-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
        />
      </div>

      {/* Saved Queries List */}
      <div className="space-y-4">
        {filtered.length > 0 ? (
          filtered.map(item => (
            <Card key={item.id} className="space-y-3">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-bold text-slate-100">{item.title}</span>
                    <Badge variant="cyan" size="sm">
                      <Database className="w-2.5 h-2.5" /> {item.dataset}
                    </Badge>
                  </div>
                  {item.description && (
                    <p className="text-xs text-slate-400 leading-relaxed">{item.description}</p>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                  <span className="flex items-center gap-1 text-[11px]">
                    <Calendar className="w-3 h-3 text-cyan-400" /> {formatDate(item.updatedAt)}
                  </span>
                  <button
                    onClick={() => handleOpenEdit(item)}
                    className="p-1 hover:text-cyan-400 transition-colors"
                    title="Edit Query metadata"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1 hover:text-rose-400 transition-colors"
                    title="Delete Saved Query"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* SQL Snippet */}
              <div className="p-3 rounded-lg bg-navy-950 border border-slate-800 font-mono text-xs text-cyan-300 whitespace-pre-wrap max-h-36 overflow-y-auto">
                {item.sql}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-800/60">
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
                  variant="primary"
                  onClick={() => handleRun(item)}
                  leftIcon={<Play className="w-3.5 h-3.5 fill-current" />}
                >
                  Execute in Playground
                </Button>
              </div>
            </Card>
          ))
        ) : (
          <div className="py-20 text-center text-slate-400 text-xs font-mono">
            {savedQueries.length === 0
              ? 'No saved queries yet. Use the "Save Query" button in the SQL Playground to store snippets.'
              : 'No saved queries match your search criteria.'}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={!!editingQuery}
        onClose={() => setEditingQuery(null)}
        title="Edit Saved Query Metadata"
        footer={
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setEditingQuery(null)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSaveEdit}>
              Save Changes
            </Button>
          </div>
        }
      >
        <div className="space-y-4 text-xs font-mono">
          <div>
            <label className="block text-slate-300 mb-1">Title</label>
            <input
              type="text"
              value={editTitle}
              onChange={e => setEditTitle(e.target.value)}
              className="w-full bg-navy-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 mb-1">Description</label>
            <textarea
              rows={3}
              value={editDesc}
              onChange={e => setEditDesc(e.target.value)}
              className="w-full bg-navy-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};
