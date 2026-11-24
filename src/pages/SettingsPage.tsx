import React, { useState } from 'react';
import {
  Settings,
  Sun,
  Moon,
  RotateCcw,
  Trash2,
  Check,
  User,
  Sliders,
  Database,
  Monitor,
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { useDatabase } from '@/context/DatabaseContext';
import { StorageService } from '@/services/persistence/storage';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { UserPreferences } from '@/types';

export const SettingsPage: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const { resetEnvironment } = useDatabase();

  const [prefs, setPrefs] = useState<UserPreferences>(() =>
    StorageService.getPreferences()
  );
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState<boolean>(false);
  const [isResetting, setIsResetting] = useState<boolean>(false);

  const handleUpdate = (field: keyof UserPreferences, value: any) => {
    const updated = StorageService.savePreferences({ [field]: value });
    setPrefs(updated);
    if (field === 'theme') {
      setTheme(value);
    }
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 1500);
  };

  const handleConfirmReset = async () => {
    setIsResetting(true);
    try {
      await resetEnvironment();
      StorageService.clearQueryHistory();
      setIsResetConfirmOpen(false);
      alert('Environment successfully reset! Built-in demonstration tables re-seeded.');
    } catch (err: any) {
      alert(`Reset failed: ${err.message || String(err)}`);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      {/* Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-navy-900 to-indigo-950/40 border border-slate-800 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Settings className="w-5 h-5 text-cyan-400" />
            Environment &amp; Application Settings
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Configure visual appearance, Monaco SQL editor font, default page sizes, and local persistence.
          </p>
        </div>
        {saveSuccess && (
          <span className="text-xs font-mono text-emerald-400 flex items-center gap-1 bg-emerald-950/40 border border-emerald-800/40 px-3 py-1.5 rounded-lg">
            <Check className="w-3.5 h-3.5" /> Preferences Saved
          </span>
        )}
      </div>

      {/* Visual Theme Selection */}
      <Card>
        <CardHeader
          title="Theme & Visual Appearance"
          subtitle="Toggle between dark navy analytics mode and high-contrast light mode."
          icon={<Monitor className="w-5 h-5 text-cyan-400" />}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <button
            onClick={() => handleUpdate('theme', 'dark')}
            className={`p-4 rounded-xl border text-left flex items-center justify-between transition-all ${
              theme === 'dark'
                ? 'bg-cyan-950/40 border-cyan-400 ring-1 ring-cyan-400/40'
                : 'bg-navy-950 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center gap-3">
              <Moon className="w-5 h-5 text-cyan-400" />
              <div>
                <div className="text-xs font-bold text-slate-100">Dark Navy (Recommended)</div>
                <div className="text-[11px] text-slate-400">High contrast for SQL analysis &amp; dashboards</div>
              </div>
            </div>
            {theme === 'dark' && <Check className="w-4 h-4 text-cyan-400" />}
          </button>

          <button
            onClick={() => handleUpdate('theme', 'light')}
            className={`p-4 rounded-xl border text-left flex items-center justify-between transition-all ${
              theme === 'light'
                ? 'bg-slate-200 border-cyan-500 ring-1 ring-cyan-500'
                : 'bg-navy-950 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center gap-3">
              <Sun className="w-5 h-5 text-amber-500" />
              <div>
                <div className="text-xs font-bold text-slate-100">Light Studio</div>
                <div className="text-[11px] text-slate-400">Clean daytime presentation theme</div>
              </div>
            </div>
            {theme === 'light' && <Check className="w-4 h-4 text-cyan-600" />}
          </button>
        </div>
      </Card>

      {/* Editor Preferences */}
      <Card>
        <CardHeader
          title="Monaco SQL Editor Configuration"
          subtitle="Customize typography and indentation settings."
          icon={<Sliders className="w-5 h-5 text-blue-400" />}
        />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-xs font-mono">
          <div>
            <label className="block text-slate-300 mb-1.5">Font Size</label>
            <select
              value={prefs.editorFontSize}
              onChange={e => handleUpdate('editorFontSize', Number(e.target.value))}
              className="w-full bg-navy-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none"
            >
              {[12, 13, 14, 15, 16, 18].map(s => (
                <option key={s} value={s}>{s} px</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-300 mb-1.5">Word Wrapping</label>
            <select
              value={prefs.editorWordWrap ? 'true' : 'false'}
              onChange={e => handleUpdate('editorWordWrap', e.target.value === 'true')}
              className="w-full bg-navy-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none"
            >
              <option value="true">Enabled (Wrap lines)</option>
              <option value="false">Disabled (Horizontal scroll)</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-300 mb-1.5">Default Results Page Size</label>
            <select
              value={prefs.resultsPageSize}
              onChange={e => handleUpdate('resultsPageSize', Number(e.target.value))}
              className="w-full bg-navy-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none"
            >
              {[10, 15, 25, 50, 100].map(s => (
                <option key={s} value={s}>{s} rows per page</option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Student & Academic Context */}
      <Card>
        <CardHeader
          title="Academic Scholar Identity"
          subtitle="Configure personal academic metadata for laboratory documentation and reports."
          icon={<User className="w-5 h-5 text-purple-400" />}
        />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-xs font-mono">
          <div>
            <label className="block text-slate-300 mb-1">Student / Scholar Name</label>
            <input
              type="text"
              value={prefs.studentName}
              onChange={e => handleUpdate('studentName', e.target.value)}
              className="w-full bg-navy-950 border border-slate-800 rounded-lg p-2 text-slate-100 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 mb-1">Roll / Student ID</label>
            <input
              type="text"
              value={prefs.studentRollNumber}
              onChange={e => handleUpdate('studentRollNumber', e.target.value)}
              className="w-full bg-navy-950 border border-slate-800 rounded-lg p-2 text-slate-100 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 mb-1">Subject Course Title</label>
            <input
              type="text"
              value={prefs.courseTitle}
              onChange={e => handleUpdate('courseTitle', e.target.value)}
              className="w-full bg-navy-950 border border-slate-800 rounded-lg p-2 text-slate-100 focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>
      </Card>

      {/* Danger Zone: Environment Reset */}
      <Card className="border-rose-900/40 bg-rose-950/10">
        <CardHeader
          title="Database Maintenance & Reset Zone"
          subtitle="Re-seed demo tables and clear stored execution history."
          icon={<Trash2 className="w-5 h-5 text-rose-400" />}
          action={
            <Button
              variant="danger"
              size="sm"
              onClick={() => setIsResetConfirmOpen(true)}
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
            >
              Reset Environment
            </Button>
          }
        />
        <p className="text-xs text-slate-400 leading-relaxed">
          Resetting re-initializes all 6 built-in demonstration tables (sales, students, web_events, sensor_readings, retail_transactions, employees), drops user uploaded tables, and flushes historical execution logs.
        </p>
      </Card>

      {/* Confirmation Modal */}
      <Modal
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        title="Confirm Factory Environment Reset"
        footer={
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setIsResetConfirmOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleConfirmReset}
              isLoading={isResetting}
            >
              Confirm Factory Reset
            </Button>
          </div>
        }
      >
        <p className="text-xs text-slate-300 leading-relaxed font-mono">
          Are you sure you want to perform a complete laboratory environment reset? This will re-seed all built-in database tables to default synthetic records and clear stored history logs.
        </p>
      </Modal>
    </div>
  );
};
