import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Terminal,
  Database,
  BarChart3,
  BookOpen,
  GraduationCap,
  Trophy,
  Cpu,
  History,
  BookmarkCheck,
  Settings,
  Info,
  Server,
  Sparkles,
  X,
} from 'lucide-react';
import { clsx } from 'clsx';
import { useDatabase } from '@/context/DatabaseContext';

interface SidebarProps {
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

interface NavItem {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const navSections: { sectionTitle: string; items: NavItem[] }[] = [
  {
    sectionTitle: 'Core Workspace',
    items: [
      { name: 'Overview', path: '/', icon: LayoutDashboard },
      { name: 'SQL Playground', path: '/playground', icon: Terminal, badge: 'DuckDB' },
      { name: 'Data Explorer', path: '/explorer', icon: Database },
      { name: 'Visual Analytics', path: '/analytics', icon: BarChart3 },
    ],
  },
  {
    sectionTitle: 'Academic & Learning',
    items: [
      { name: 'Query Library', path: '/library', icon: BookOpen, badge: '32' },
      { name: 'Learning Hub', path: '/learning', icon: GraduationCap },
      { name: 'Practical Challenges', path: '/challenges', icon: Trophy, badge: '26' },
      { name: 'MapReduce Simulator', path: '/mapreduce', icon: Cpu, badge: 'Live' },
    ],
  },
  {
    sectionTitle: 'Management & Meta',
    items: [
      { name: 'Query History', path: '/history', icon: History },
      { name: 'Saved Queries', path: '/saved', icon: BookmarkCheck },
      { name: 'Settings', path: '/settings', icon: Settings },
      { name: 'About Project', path: '/about', icon: Info },
    ],
  },
];

export const Sidebar: React.FC<SidebarProps> = ({ isOpenMobile = false, onCloseMobile }) => {
  const { engineStatus, availableTables } = useDatabase();

  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={clsx(
          'fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-navy-950 border-r border-slate-800/80 flex flex-col transition-transform duration-200 ease-in-out select-none',
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-800/80 bg-navy-900/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-violet-600 p-0.5 shadow-md shadow-cyan-900/40">
              <div className="w-full h-full bg-navy-950 rounded-[10px] flex items-center justify-center">
                <Server className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm tracking-tight text-slate-100">BigData</span>
                <span className="font-bold text-sm tracking-tight text-cyan-400">Studio</span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono tracking-wider uppercase">Analytics Lab</p>
            </div>
          </div>

          {/* Close button on mobile */}
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 lg:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {navSections.map(section => (
            <div key={section.sectionTitle} className="space-y-1">
              <div className="px-3 pb-1 text-[10px] font-semibold tracking-wider text-slate-400 uppercase font-mono">
                {section.sectionTitle}
              </div>
              {section.items.map(item => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={onCloseMobile}
                    className={({ isActive }) =>
                      clsx(
                        'flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all group',
                        isActive
                          ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/10 text-cyan-300 font-semibold border-l-2 border-cyan-400 shadow-sm'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                      )
                    }
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4 transition-transform group-hover:scale-110" />
                      <span>{item.name}</span>
                    </div>
                    {item.badge && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full font-mono bg-slate-800 text-slate-400 border border-slate-700/60 group-hover:border-cyan-500/40">
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </div>

        {/* Engine Status Banner in Footer */}
        <div className="p-3 border-t border-slate-800/80 bg-navy-900/40">
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span
                  className={clsx(
                    'w-2 h-2 rounded-full',
                    engineStatus === 'ready' && 'bg-emerald-400 shadow-sm shadow-emerald-400/80 animate-pulse',
                    engineStatus === 'loading' && 'bg-amber-400 animate-ping',
                    engineStatus === 'error' && 'bg-rose-500',
                    engineStatus === 'uninitialized' && 'bg-slate-500'
                  )}
                />
                <span className="text-[11px] font-semibold text-slate-200">DuckDB-Wasm</span>
              </div>
              <span className="text-[10px] text-cyan-400 font-mono capitalize">{engineStatus}</span>
            </div>
            <div className="text-[10px] text-slate-400 flex items-center justify-between font-mono">
              <span>Tables: {availableTables.length}</span>
              <span className="flex items-center gap-1 text-slate-400">
                <Sparkles className="w-2.5 h-2.5 text-cyan-400" /> In-Browser
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
