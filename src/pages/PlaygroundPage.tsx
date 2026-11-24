import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Terminal, Database, BookOpen, BookmarkCheck, Check } from 'lucide-react';
import { useDatabase } from '@/context/DatabaseContext';
import { SqlEditor } from '@/components/sql-editor/SqlEditor';
import { ResultWorkspace } from '@/components/results/ResultWorkspace';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { StorageService } from '@/services/persistence/storage';
import { QueryResult } from '@/types';

const STARTER_QUERIES: Record<string, string> = {
  sales: `SELECT 
    category,
    COUNT(*) AS total_orders,
    ROUND(SUM(amount), 2) AS total_revenue,
    ROUND(AVG(amount), 2) AS avg_order_value
FROM sales
GROUP BY category
ORDER BY total_revenue DESC;`,
  students: `SELECT 
    department,
    COUNT(*) AS student_count,
    ROUND(AVG(attendance_percentage), 1) AS avg_attendance,
    ROUND(AVG(exam_score), 1) AS avg_exam_score
FROM students
GROUP BY department
ORDER BY avg_exam_score DESC;`,
  web_events: `SELECT 
    event_type,
    device_type,
    COUNT(*) AS event_count,
    ROUND(AVG(session_duration), 1) AS avg_session_sec
FROM web_events
GROUP BY event_type, device_type
ORDER BY event_count DESC
LIMIT 12;`,
  sensor_readings: `SELECT 
    location,
    status,
    COUNT(*) AS readings_count,
    ROUND(AVG(temperature), 2) AS avg_temperature,
    ROUND(MAX(temperature), 2) AS peak_temperature
FROM sensor_readings
GROUP BY location, status
ORDER BY peak_temperature DESC;`,
  retail_transactions: `SELECT 
    store_city,
    customer_segment,
    COUNT(*) AS txn_count,
    ROUND(SUM(net_amount), 2) AS city_gross_revenue
FROM retail_transactions
GROUP BY store_city, customer_segment
ORDER BY city_gross_revenue DESC
LIMIT 15;`,
  employees: `SELECT 
    department,
    role,
    COUNT(*) AS headcount,
    ROUND(AVG(salary), 0) AS avg_salary
FROM employees
GROUP BY department, role
ORDER BY avg_salary DESC
LIMIT 15;`,
};

export const PlaygroundPage: React.FC = () => {
  const location = useLocation();
  const {
    activeTable,
    setActiveTable,
    availableTables,
    executeQuery,
    lastQueryResult,
    setLastQueryResult,
  } = useDatabase();

  const [sql, setSql] = useState<string>(() => {
    // If incoming state passed SQL, use it; else use starter query
    if (location.state?.sql) return location.state.sql;
    return STARTER_QUERIES[activeTable] || `SELECT * FROM "${activeTable}" LIMIT 10;`;
  });

  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Save Query Modal state
  const [isSaveModalOpen, setIsSaveModalOpen] = useState<boolean>(false);
  const [saveTitle, setSaveTitle] = useState<string>('');
  const [saveDesc, setSaveDesc] = useState<string>('');
  const [saveSuccessNotice, setSaveSuccessNotice] = useState<boolean>(false);

  // Handle incoming state navigation from Query Library or Challenges
  useEffect(() => {
    if (location.state?.sql) {
      setSql(location.state.sql);
      if (location.state?.dataset) {
        setActiveTable(location.state.dataset);
      }
    }
  }, [location.state]);

  const activeTableSchema = availableTables.find(t => t.tableName === activeTable);

  const handleExecute = async () => {
    setIsExecuting(true);
    setErrorMsg(null);
    try {
      const res = await executeQuery(sql, activeTable);
      setLastQueryResult(res);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error executing SQL query.');
    } finally {
      setIsExecuting(false);
    }
  };

  const handleResetExample = () => {
    const defaultSql = STARTER_QUERIES[activeTable] || `SELECT * FROM "${activeTable}" LIMIT 10;`;
    setSql(defaultSql);
  };

  const handleOpenSaveModal = () => {
    setSaveTitle(`Query on ${activeTable} (${new Date().toLocaleDateString()})`);
    setSaveDesc('');
    setSaveSuccessNotice(false);
    setIsSaveModalOpen(true);
  };

  const handleSaveQuery = () => {
    if (!saveTitle.trim()) return;
    StorageService.saveQuery({
      title: saveTitle.trim(),
      sql,
      dataset: activeTable,
      description: saveDesc.trim() || undefined,
      tags: ['Playground', activeTable],
    });
    setSaveSuccessNotice(true);
    setTimeout(() => {
      setIsSaveModalOpen(false);
      setSaveSuccessNotice(false);
    }, 1200);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Context Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-navy-900 border border-slate-800 text-xs">
        <div className="flex items-center gap-2 text-slate-300">
          <Database className="w-4 h-4 text-cyan-400" />
          <span className="font-semibold text-slate-100">Target Table:</span>
          <select
            value={activeTable}
            onChange={e => {
              const newTable = e.target.value;
              setActiveTable(newTable);
              setSql(STARTER_QUERIES[newTable] || `SELECT * FROM "${newTable}" LIMIT 10;`);
            }}
            className="bg-navy-950 border border-slate-800 rounded px-2.5 py-1 text-cyan-300 font-mono font-semibold focus:outline-none"
          >
            {availableTables.map(t => (
              <option key={t.tableName} value={t.tableName}>
                {t.tableName} ({t.rowCount} rows)
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-mono">Example Presets:</span>
          <select
            onChange={e => {
              if (e.target.value) setSql(e.target.value);
            }}
            className="bg-navy-950 border border-slate-800 rounded px-2.5 py-1 text-slate-200 text-xs focus:outline-none"
            defaultValue=""
          >
            <option value="" disabled>Load SQL Pattern...</option>
            <option value={`SELECT * FROM "${activeTable}" LIMIT 10;`}>Select 10 Sample Rows</option>
            <option value={`SELECT COUNT(*) AS total_rows FROM "${activeTable}";`}>Count Total Cardinality</option>
            {activeTable === 'sales' && (
              <>
                <option value="SELECT category, COUNT(*) AS orders, ROUND(SUM(amount), 2) AS total_revenue FROM sales GROUP BY category ORDER BY total_revenue DESC;">
                  Revenue by Category
                </option>
                <option value="SELECT region, AVG(amount) AS average_order_value FROM sales GROUP BY region ORDER BY average_order_value DESC;">
                  Avg Order Value by Region
                </option>
                <option value="SELECT product_name, SUM(quantity) AS units_sold FROM sales GROUP BY product_name ORDER BY units_sold DESC LIMIT 10;">
                  Top 10 Products by Units Sold
                </option>
              </>
            )}
            {activeTable === 'students' && (
              <option value="SELECT department, ROUND(AVG(exam_score), 2) AS avg_exam FROM students GROUP BY department HAVING AVG(exam_score) > 60 ORDER BY avg_exam DESC;">
                High-Scoring Departments (HAVING)
              </option>
            )}
          </select>
        </div>
      </div>

      {/* Monaco SQL Editor Component */}
      <SqlEditor
        value={sql}
        onChange={setSql}
        onExecute={handleExecute}
        onResetExample={handleResetExample}
        onSaveQuery={handleOpenSaveModal}
        isExecuting={isExecuting}
        activeDataset={activeTable}
      />

      {/* Query Result Workspace Component */}
      <ResultWorkspace
        result={lastQueryResult}
        error={errorMsg}
        activeTableSchema={activeTableSchema}
      />

      {/* Save Query Modal */}
      <Modal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        title="Save Query to Local Repository"
        footer={
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setIsSaveModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSaveQuery}
              disabled={saveSuccessNotice || !saveTitle.trim()}
              leftIcon={saveSuccessNotice ? <Check className="w-4 h-4 text-emerald-400" /> : <BookmarkCheck className="w-4 h-4" />}
            >
              {saveSuccessNotice ? 'Saved!' : 'Save Query'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4 text-xs font-mono">
          <div>
            <label className="block text-slate-300 mb-1">Query Title</label>
            <input
              type="text"
              value={saveTitle}
              onChange={e => setSaveTitle(e.target.value)}
              placeholder="e.g., Regional Sales Breakdown"
              className="w-full bg-navy-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 mb-1">Description (Optional)</label>
            <textarea
              rows={2}
              value={saveDesc}
              onChange={e => setSaveDesc(e.target.value)}
              placeholder="Objective, expected outputs or notes..."
              className="w-full bg-navy-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">SQL Snapshot</label>
            <pre className="p-3 rounded-lg bg-navy-950 border border-slate-800 text-cyan-300 max-h-36 overflow-y-auto whitespace-pre-wrap text-[11px]">
              {sql}
            </pre>
          </div>
        </div>
      </Modal>
    </div>
  );
};
