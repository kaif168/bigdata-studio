import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Search,
  Play,
  Copy,
  Check,
  Filter,
  Layers,
  ArrowUpRight,
  Database,
} from 'lucide-react';
import { QUERY_LIBRARY } from '@/data/queryLibrary';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { QueryExample } from '@/types';
import { useDatabase } from '@/context/DatabaseContext';

export const QueryLibraryPage: React.FC = () => {
  const navigate = useNavigate();
  const { setActiveTable } = useDatabase();

  const [search, setSearch] = useState<string>('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [selectedDataset, setSelectedDataset] = useState<string>('All');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredQueries = QUERY_LIBRARY.filter(q => {
    const matchesSearch =
      q.title.toLowerCase().includes(search.toLowerCase()) ||
      q.objective.toLowerCase().includes(search.toLowerCase()) ||
      q.sql.toLowerCase().includes(search.toLowerCase()) ||
      q.category.toLowerCase().includes(search.toLowerCase());

    const matchesDifficulty = selectedDifficulty === 'All' || q.difficulty === selectedDifficulty;
    const matchesDataset = selectedDataset === 'All' || q.dataset === selectedDataset;

    return matchesSearch && matchesDifficulty && matchesDataset;
  });

  const handleRunQuery = (query: QueryExample) => {
    setActiveTable(query.dataset);
    navigate('/playground', {
      state: {
        sql: query.sql,
        dataset: query.dataset,
      },
    });
  };

  const handleCopy = (id: string, sql: string) => {
    navigator.clipboard.writeText(sql);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const difficultyColors = {
    Beginner: 'success',
    Intermediate: 'warning',
    Advanced: 'danger',
  } as const;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-navy-900 to-blue-950/40 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Badge variant="cyan" size="sm">
              32 Validated Reference Queries
            </Badge>
            <Badge variant="purple" size="sm">
              DuckDB ANSI SQL
            </Badge>
          </div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-cyan-400" />
            Curated SQL Query Library
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Battle-tested analytical SQL patterns ranging from introductory filtering to multi-stage Common Table Expressions and window ranking functions.
          </p>
        </div>

        <div className="text-xs font-mono text-slate-400 shrink-0">
          Showing <span className="text-cyan-400 font-bold">{filteredQueries.length}</span> of {QUERY_LIBRARY.length} queries
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-navy-900 border border-slate-800 text-xs">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search queries by title, SQL keywords, or objective..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-navy-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-mono">Difficulty:</span>
            <select
              value={selectedDifficulty}
              onChange={e => setSelectedDifficulty(e.target.value)}
              className="bg-navy-950 border border-slate-800 rounded px-2.5 py-1 text-slate-200 font-mono focus:outline-none"
            >
              <option value="All">All Levels</option>
              <option value="Beginner">Beginner (10)</option>
              <option value="Intermediate">Intermediate (12)</option>
              <option value="Advanced">Advanced (10)</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-mono">Dataset:</span>
            <select
              value={selectedDataset}
              onChange={e => setSelectedDataset(e.target.value)}
              className="bg-navy-950 border border-slate-800 rounded px-2.5 py-1 text-slate-200 font-mono focus:outline-none"
            >
              <option value="All">All Tables</option>
              <option value="sales">sales</option>
              <option value="students">students</option>
              <option value="web_events">web_events</option>
              <option value="sensor_readings">sensor_readings</option>
              <option value="retail_transactions">retail_transactions</option>
              <option value="employees">employees</option>
            </select>
          </div>
        </div>
      </div>

      {/* Query Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredQueries.map(q => (
          <Card key={q.id} className="flex flex-col justify-between space-y-3">
            <div>
              {/* Header Badges */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <Badge variant={difficultyColors[q.difficulty]} size="sm">
                    {q.difficulty}
                  </Badge>
                  <Badge variant="cyan" size="sm">
                    {q.category}
                  </Badge>
                </div>
                <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                  <Database className="w-3 h-3 text-cyan-400" />
                  {q.dataset}
                </span>
              </div>

              {/* Title & Objective */}
              <h3 className="text-sm font-bold text-slate-100">{q.title}</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">{q.objective}</p>

              {/* SQL Snippet Preview */}
              <div className="mt-3 relative rounded-lg bg-navy-950 border border-slate-800 p-3 group">
                <pre className="text-[11px] font-mono text-cyan-300 overflow-x-auto whitespace-pre-wrap max-h-32">
                  {q.sql}
                </pre>
                <button
                  onClick={() => handleCopy(q.id, q.sql)}
                  className="absolute top-2 right-2 p-1.5 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Copy SQL"
                >
                  {copiedId === q.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Technical Explanation */}
              <div className="mt-3 text-[11px] text-slate-400 space-y-1">
                <div><strong className="text-slate-300">Explanation:</strong> {q.explanation}</div>
                <div><strong className="text-slate-300">Expected Result:</strong> {q.expectedResult}</div>
              </div>
            </div>

            {/* Run Example Button in Footer */}
            <div className="pt-3 border-t border-slate-800/60 flex items-center justify-end">
              <Button
                size="sm"
                variant="primary"
                onClick={() => handleRunQuery(q)}
                leftIcon={<Play className="w-3.5 h-3.5 fill-current" />}
              >
                Run Example in Playground
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
