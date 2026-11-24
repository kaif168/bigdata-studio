import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Database,
  Upload,
  Search,
  Table,
  Terminal,
  Trash2,
  FileSpreadsheet,
  FileCode,
  Info,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { useDatabase } from '@/context/DatabaseContext';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { TableSchema } from '@/types';
import { formatNumber } from '@/utils/formatters';

export const DataExplorerPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    availableTables,
    activeTable,
    setActiveTable,
    importCsv,
    importJson,
    dropTable,
    executeQuery,
  } = useDatabase();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTableData, setSelectedTableData] = useState<any[]>([]);
  const [isLoadingPreview, setIsLoadingPreview] = useState<boolean>(false);

  // File Upload Modal State
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
  const [uploadTableName, setUploadTableName] = useState<string>('');
  const [uploadFileType, setUploadFileType] = useState<'csv' | 'json'>('csv');
  const [uploadFileContent, setUploadFileContent] = useState<string>('');
  const [uploadFileName, setUploadFileName] = useState<string>('');
  const [isImporting, setIsImporting] = useState<boolean>(false);
  const [importError, setImportError] = useState<string | null>(null);

  // Delete confirmation modal
  const [tableToDelete, setTableToDelete] = useState<string | null>(null);

  const filteredTables = availableTables.filter(t =>
    t.tableName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const currentSchema = availableTables.find(t => t.tableName === activeTable);

  // Load preview rows whenever active table changes
  useEffect(() => {
    let isCancelled = false;
    const loadPreview = async () => {
      if (!activeTable) return;
      setIsLoadingPreview(true);
      try {
        const res = await executeQuery(`SELECT * FROM "${activeTable}" LIMIT 15;`, activeTable);
        if (!isCancelled) {
          setSelectedTableData(res.rows);
        }
      } catch (err) {
        console.warn('Could not load table preview:', err);
      } finally {
        if (!isCancelled) setIsLoadingPreview(false);
      }
    };

    loadPreview();
    return () => {
      isCancelled = true;
    };
  }, [activeTable]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      setImportError('File size exceeds the 15MB browser in-memory threshold.');
      return;
    }

    setUploadFileName(file.name);
    const inferredName = file.name.split('.')[0].replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase();
    setUploadTableName(inferredName);

    const isJson = file.name.endsWith('.json');
    setUploadFileType(isJson ? 'json' : 'csv');

    const reader = new FileReader();
    reader.onload = ev => {
      const content = ev.target?.result as string;
      setUploadFileContent(content);
      setImportError(null);
    };
    reader.onerror = () => {
      setImportError('Failed to read file from disk.');
    };
    reader.readAsText(file);
  };

  const handleConfirmImport = async () => {
    if (!uploadTableName.trim() || !uploadFileContent) {
      setImportError('Please specify table name and select a valid file.');
      return;
    }

    setIsImporting(true);
    setImportError(null);
    try {
      if (uploadFileType === 'csv') {
        await importCsv(uploadTableName.trim(), uploadFileContent);
      } else {
        await importJson(uploadTableName.trim(), uploadFileContent);
      }
      setIsImportModalOpen(false);
      setUploadFileContent('');
      setUploadFileName('');
      setUploadTableName('');
    } catch (err: any) {
      setImportError(err.message || 'Import failed. Check data formatting.');
    } finally {
      setIsImporting(false);
    }
  };

  const handleDeleteTable = async () => {
    if (!tableToDelete) return;
    try {
      await dropTable(tableToDelete);
      setTableToDelete(null);
    } catch (err: any) {
      console.error('Failed to drop table:', err);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-navy-900 border border-slate-800">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Database className="w-4 h-4 text-cyan-400" />
            Dataset Management &amp; Ingestion Hub
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            6 pre-seeded demonstration schemas plus custom CSV/JSON files parsed directly into in-browser DuckDB tables.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => setIsImportModalOpen(true)}
          leftIcon={<Upload className="w-4 h-4" />}
          className="bg-cyan-600 hover:bg-cyan-500 text-white font-semibold shrink-0"
        >
          Import Custom CSV / JSON
        </Button>
      </div>

      {/* Storage Limitation Note */}
      <div className="p-3 rounded-lg bg-navy-950/60 border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between font-mono">
        <span className="flex items-center gap-2">
          <Info className="w-3.5 h-3.5 text-cyan-400" />
          Datasets are stored in WebAssembly memory and synchronized with IndexedDB/LocalStorage. Recommended maximum file size is 15MB for responsive in-browser analytical performance.
        </span>
        <span className="text-cyan-400 hidden md:inline">Demonstration Datasets are Synthetic</span>
      </div>

      {/* Dataset Grid Search & Selector */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search datasets..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-navy-900 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>
          <span className="text-xs font-mono text-slate-400">
            {filteredTables.length} datasets available
          </span>
        </div>

        {/* Dataset Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredTables.map(t => {
            const isCurrent = t.tableName === activeTable;
            return (
              <div
                key={t.tableName}
                onClick={() => setActiveTable(t.tableName)}
                className={`p-4 rounded-xl border transition-all cursor-pointer relative group ${
                  isCurrent
                    ? 'bg-cyan-950/30 border-cyan-500/80 shadow-lg shadow-cyan-950/20 ring-1 ring-cyan-500/30'
                    : 'bg-navy-900/80 hover:bg-slate-800/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg ${isCurrent ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-800 text-slate-400'}`}>
                      <Database className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-100 font-mono">{t.tableName}</h4>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {t.columns.length} columns | {formatNumber(t.rowCount, 0)} rows
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {t.isCustom && (
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          setTableToDelete(t.tableName);
                        }}
                        className="p-1.5 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                        title="Drop custom dataset"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <Badge variant={t.isCustom ? 'purple' : 'cyan'} size="sm">
                      {t.isCustom ? 'User Data' : 'Synthetic'}
                    </Badge>
                  </div>
                </div>

                <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                  {t.description}
                </p>

                <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-800/60 text-[11px] font-mono">
                  <span className={isCurrent ? 'text-cyan-400 font-semibold' : 'text-slate-400'}>
                    {isCurrent ? '● Active in Playground' : 'Click to select'}
                  </span>
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      setActiveTable(t.tableName);
                      navigate('/playground');
                    }}
                    className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
                  >
                    Query <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Table Detail & Live Preview */}
      {currentSchema && (
        <Card className="space-y-4">
          <CardHeader
            title={`Table Details: ${currentSchema.tableName}`}
            subtitle={`${currentSchema.rowCount} rows across ${currentSchema.columns.length} columns.`}
            icon={<Table className="w-5 h-5 text-cyan-400" />}
            action={
              <Button
                size="sm"
                variant="primary"
                onClick={() => navigate('/playground')}
                leftIcon={<Terminal className="w-3.5 h-3.5" />}
              >
                Query in SQL Playground
              </Button>
            }
          />

          {/* Schema Columns Table */}
          <div>
            <h4 className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">Column Data Types &amp; Nullability</h4>
            <div className="border border-slate-800 rounded-xl overflow-x-auto bg-navy-950/60">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-navy-900 border-b border-slate-800 text-slate-400">
                  <tr>
                    <th className="py-2 px-3">Column Name</th>
                    <th className="py-2 px-3">Data Type</th>
                    <th className="py-2 px-3">Nullable</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40 text-slate-200">
                  {currentSchema.columns.map((c, i) => (
                    <tr key={i} className="hover:bg-slate-800/30">
                      <td className="py-2 px-3 font-semibold text-slate-100">{c.name}</td>
                      <td className="py-2 px-3 text-cyan-300">{c.type}</td>
                      <td className="py-2 px-3 text-slate-400">{c.nullable ? 'YES' : 'NO'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Sample Data Preview */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-mono text-slate-400 uppercase tracking-wider">Sample Data Preview (First 15 Rows)</h4>
              <span className="text-[11px] font-mono text-cyan-400">SELECT * FROM {currentSchema.tableName} LIMIT 15</span>
            </div>
            {isLoadingPreview ? (
              <div className="py-12 text-center text-xs font-mono text-slate-400 flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                Reading rows from DuckDB...
              </div>
            ) : selectedTableData.length > 0 ? (
              <div className="border border-slate-800 rounded-xl overflow-x-auto bg-navy-950/60 max-h-72">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-navy-900 border-b border-slate-800 text-slate-400 sticky top-0">
                    <tr>
                      <th className="py-2 px-3 w-10 text-center text-slate-400">#</th>
                      {currentSchema.columns.map(c => (
                        <th key={c.name} className="py-2 px-3 whitespace-nowrap">{c.name}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40 text-slate-300">
                    {selectedTableData.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/40">
                        <td className="py-1.5 px-3 text-center text-slate-400 text-[11px]">{idx + 1}</td>
                        {currentSchema.columns.map(c => (
                          <td key={c.name} className="py-1.5 px-3 truncate max-w-xs">
                            {row[c.name] !== null && row[c.name] !== undefined ? String(row[c.name]) : <span className="text-slate-400 italic">NULL</span>}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-12 text-center text-xs font-mono text-slate-400">
                No rows available to preview.
              </div>
            )}
          </div>
        </Card>
      )}

      {/* CSV / JSON Import Modal */}
      <Modal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        title="Import Custom Dataset into DuckDB-Wasm"
        maxWidth="lg"
        footer={
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setIsImportModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleConfirmImport}
              isLoading={isImporting}
              disabled={!uploadFileContent || !uploadTableName.trim()}
              leftIcon={<Upload className="w-4 h-4" />}
            >
              Parse &amp; Register Table
            </Button>
          </div>
        }
      >
        <div className="space-y-4 text-xs font-mono">
          <p className="text-slate-300 leading-relaxed font-sans">
            Upload your CSV or JSON file. DuckDB will automatically infer schemas, types, and register the dataset as a genuine queryable table.
          </p>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Target Table Name</label>
            <input
              type="text"
              value={uploadTableName}
              onChange={e => setUploadTableName(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_'))}
              placeholder="e.g., custom_sales_2024"
              className="w-full bg-navy-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Select File (.csv or .json)</label>
            <div className="border-2 border-dashed border-slate-800 hover:border-cyan-500/60 rounded-xl p-6 text-center cursor-pointer bg-navy-950/40 transition-colors">
              <input
                type="file"
                accept=".csv, .json"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload-input"
              />
              <label htmlFor="file-upload-input" className="cursor-pointer space-y-2 block">
                <Upload className="w-8 h-8 text-cyan-400 mx-auto" />
                <div className="font-semibold text-slate-200">
                  {uploadFileName ? uploadFileName : 'Click to browse or drop file here'}
                </div>
                <div className="text-[11px] text-slate-400">Max size: 15MB</div>
              </label>
            </div>
          </div>

          {importError && (
            <div className="p-3 rounded-lg bg-rose-950/30 border border-rose-800 text-rose-300 text-xs">
              {importError}
            </div>
          )}
        </div>
      </Modal>

      {/* Drop Table Confirmation Modal */}
      <Modal
        isOpen={!!tableToDelete}
        onClose={() => setTableToDelete(null)}
        title="Confirm Table Deletion"
        footer={
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setTableToDelete(null)}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" onClick={handleDeleteTable}>
              Delete Table
            </Button>
          </div>
        }
      >
        <p className="text-xs text-slate-300 leading-relaxed font-mono">
          Are you sure you want to drop the table <strong className="text-rose-400">{tableToDelete}</strong> from DuckDB memory and local storage? This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
};
