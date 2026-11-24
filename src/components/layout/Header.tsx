import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  Menu,
  Sun,
  Moon,
  HelpCircle,
  Database,
  ChevronRight,
  Server,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { useDatabase } from '@/context/DatabaseContext';
import { useTheme } from '@/context/ThemeContext';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

interface HeaderProps {
  onOpenMobileMenu: () => void;
}

const routeTitles: Record<string, { title: string; category: string }> = {
  '/': { title: 'Overview Dashboard', category: 'Analytics' },
  '/playground': { title: 'SQL Playground', category: 'Execution' },
  '/explorer': { title: 'Dataset Explorer', category: 'Data Management' },
  '/analytics': { title: 'Dynamic Visual Analytics', category: 'Visualization' },
  '/library': { title: 'Query Library', category: 'Academic Reference' },
  '/learning': { title: 'Big Data Learning Hub', category: 'Curriculum' },
  '/challenges': { title: 'Practical SQL Challenges', category: 'Skill Verification' },
  '/mapreduce': { title: 'MapReduce Simulator', category: 'Distributed Computing' },
  '/history': { title: 'Query History', category: 'Audit Log' },
  '/saved': { title: 'Saved Queries', category: 'Repository' },
  '/settings': { title: 'System Settings', category: 'Configuration' },
  '/about': { title: 'About BigData Studio', category: 'Project Overview' },
};

export const Header: React.FC<HeaderProps> = ({ onOpenMobileMenu }) => {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { engineStatus, availableTables, activeTable, setActiveTable } = useDatabase();
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const currentRouteInfo = routeTitles[location.pathname] || {
    title: 'BigData Studio',
    category: 'Lab',
  };

  return (
    <>
      <header className="h-16 px-4 lg:px-6 bg-navy-950/90 border-b border-slate-800/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between gap-4">
        {/* Left: Mobile hamburger & breadcrumbs */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileMenu}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 lg:hidden"
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400">
              <Link to="/" className="hover:text-cyan-400 transition-colors">
                Studio
              </Link>
              <ChevronRight className="w-3 h-3 text-slate-400" />
              <span>{currentRouteInfo.category}</span>
            </div>
            <h1 className="text-sm lg:text-base font-semibold text-slate-100 tracking-tight">
              {currentRouteInfo.title}
            </h1>
          </div>
        </div>

        {/* Right: Dataset selector, Engine indicator, Theme, Help */}
        <div className="flex items-center gap-2.5 lg:gap-3">
          {/* Active Dataset Selector Dropdown */}
          <div className="flex items-center gap-2 bg-navy-900 border border-slate-800 rounded-lg px-2.5 py-1.5 shadow-sm">
            <Database className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <select
              value={activeTable}
              onChange={e => setActiveTable(e.target.value)}
              className="bg-transparent text-xs font-mono text-slate-200 focus:outline-none cursor-pointer pr-1"
            >
              {availableTables.map(t => (
                <option key={t.tableName} value={t.tableName} className="bg-navy-900 text-slate-200">
                  {t.tableName} ({t.rowCount} rows)
                </option>
              ))}
            </select>
          </div>

          {/* Engine status pill */}
          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-navy-900 border border-slate-800 text-xs font-mono">
            {engineStatus === 'ready' && (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/80 animate-pulse" />
                <span className="text-slate-300">DuckDB Wasm</span>
              </>
            )}
            {engineStatus === 'loading' && (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
                <span className="text-amber-300">Initializing...</span>
              </>
            )}
            {engineStatus === 'error' && (
              <>
                <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                <span className="text-rose-300">Engine Error</span>
              </>
            )}
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
          </button>

          {/* Help Button */}
          <button
            onClick={() => setIsHelpOpen(true)}
            className="p-2 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-colors"
            title="Help & Quick Reference"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Help Modal */}
      <Modal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
        title="BigData Studio Quick Reference & Architecture Guide"
        maxWidth="2xl"
        footer={<Button onClick={() => setIsHelpOpen(false)}>Close Guide</Button>}
      >
        <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
          <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-800/40 text-cyan-200">
            <h4 className="font-semibold text-sm mb-1 text-cyan-300 flex items-center gap-2">
              <Server className="w-4 h-4" /> Genuine DuckDB-Wasm Execution
            </h4>
            <p>
              BigData Studio executes real analytical SQL queries entirely in your browser using compiled WebAssembly.
              Zero remote database calls or API keys are required.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
              <h5 className="font-semibold text-slate-100 mb-1">Keyboard Shortcuts</h5>
              <ul className="space-y-1 font-mono text-[11px] text-slate-400">
                <li><kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300">Ctrl + Enter</kbd> : Execute SQL</li>
                <li><kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300">Cmd + Enter</kbd> : Execute SQL (Mac)</li>
              </ul>
            </div>
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
              <h5 className="font-semibold text-slate-100 mb-1">Included Tables</h5>
              <p className="text-slate-400 text-[11px]">
                <code>sales</code>, <code>students</code>, <code>web_events</code>, <code>sensor_readings</code>, <code>retail_transactions</code>, <code>employees</code>.
              </p>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
            <h5 className="font-semibold text-slate-100 mb-1">Supported SQL Capabilities</h5>
            <p className="text-slate-400 text-[11px]">
              Full ANSI SQL support: SELECT, WHERE, ORDER BY, GROUP BY, HAVING, INNER/LEFT/FULL JOIN, CTEs (WITH clauses), Window functions (ROW_NUMBER, DENSE_RANK, NTILE, LAG/LEAD), subqueries, and analytical aggregations.
            </p>
          </div>
        </div>
      </Modal>
    </>
  );
};
