import React, { useState, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Download,
  Copy,
  Check,
} from 'lucide-react';
import { QueryResult } from '@/types';
import { Button } from '@/components/ui/Button';
import { formatNumber, formatDate } from '@/utils/formatters';
import { exportToCsv } from '@/utils/csvExport';

interface ResultTableProps {
  result: QueryResult;
}

export const ResultTable: React.FC<ResultTableProps> = ({ result }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [copiedCell, setCopiedCell] = useState<string | null>(null);

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      if (sortDirection === 'asc') setSortDirection('desc');
      else {
        setSortColumn(null);
        setSortDirection('asc');
      }
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  const sortedRows = useMemo(() => {
    if (!sortColumn) return result.rows;
    return [...result.rows].sort((a, b) => {
      const valA = a[sortColumn];
      const valB = b[sortColumn];

      if (valA === valB) return 0;
      if (valA === null || valA === undefined) return 1;
      if (valB === null || valB === undefined) return -1;

      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortDirection === 'asc' ? valA - valB : valB - valA;
      }

      const strA = String(valA);
      const strB = String(valB);
      return sortDirection === 'asc' ? strA.localeCompare(strB) : strB.localeCompare(strA);
    });
  }, [result.rows, sortColumn, sortDirection]);

  const totalPages = Math.max(1, Math.ceil(sortedRows.length / pageSize));
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedRows.slice(start, start + pageSize);
  }, [sortedRows, currentPage, pageSize]);

  const handleCopyCell = (val: any, cellKey: string) => {
    const text = val === null || val === undefined ? 'NULL' : String(val);
    navigator.clipboard.writeText(text);
    setCopiedCell(cellKey);
    setTimeout(() => setCopiedCell(null), 1500);
  };

  const handleExport = () => {
    exportToCsv('query_results', result.columns, result.rows);
  };

  if (!result.columns.length || !result.rows.length) {
    return (
      <div className="py-12 text-center text-slate-400 font-mono text-xs">
        Query completed successfully with 0 rows returned.
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-3">
      {/* Table Actions Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="text-slate-400 font-mono flex items-center gap-2">
          <span>Showing {Math.min((currentPage - 1) * pageSize + 1, result.totalRows)} - {Math.min(currentPage * pageSize, result.totalRows)} of {result.totalRows} rows</span>
          {result.executionTimeMs > 0 && (
            <span className="text-cyan-400">({result.executionTimeMs} ms)</span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-slate-400 font-mono">
            <span>Per page:</span>
            <select
              value={pageSize}
              onChange={e => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-navy-900 border border-slate-800 rounded px-2 py-1 text-slate-200 text-xs focus:outline-none"
            >
              {[10, 15, 25, 50, 100].map(size => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={handleExport}
            leftIcon={<Download className="w-3.5 h-3.5 text-cyan-400" />}
          >
            Export CSV
          </Button>
        </div>
      </div>

      {/* Table Grid */}
      <div className="border border-slate-800/80 rounded-xl overflow-x-auto bg-navy-950/60 shadow-inner">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-navy-900/90 border-b border-slate-800 text-slate-300 font-mono select-none">
              <th className="py-2.5 px-3 w-12 text-slate-400 text-center border-r border-slate-800/50">#</th>
              {result.columns.map(col => {
                const isSorted = sortColumn === col;
                const colType = result.columnTypes[col] || 'VARCHAR';
                return (
                  <th
                    key={col}
                    onClick={() => handleSort(col)}
                    className="py-2.5 px-3 cursor-pointer hover:bg-slate-800/60 transition-colors border-r border-slate-800/50"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <span className="font-semibold text-slate-200">{col}</span>
                        <span className="block text-[10px] text-slate-400 font-normal">{colType}</span>
                      </div>
                      <span className="text-slate-400">
                        {isSorted ? (
                          sortDirection === 'asc' ? (
                            <ArrowUp className="w-3.5 h-3.5 text-cyan-400" />
                          ) : (
                            <ArrowDown className="w-3.5 h-3.5 text-cyan-400" />
                          )
                        ) : (
                          <ArrowUpDown className="w-3 h-3 text-slate-400 hover:text-slate-400" />
                        )}
                      </span>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50 font-mono text-slate-200">
            {paginatedRows.map((row, rowIdx) => {
              const actualRowIndex = (currentPage - 1) * pageSize + rowIdx + 1;
              return (
                <tr key={rowIdx} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-2 px-3 text-center text-slate-400 bg-navy-950/40 border-r border-slate-800/50 select-none text-[11px]">
                    {actualRowIndex}
                  </td>
                  {result.columns.map((col, colIdx) => {
                    const val = row[col];
                    const cellKey = `${actualRowIndex}_${colIdx}`;
                    const isCopied = copiedCell === cellKey;
                    const isNull = val === null || val === undefined;

                    return (
                      <td
                        key={colIdx}
                        onClick={() => handleCopyCell(val, cellKey)}
                        className="py-2 px-3 border-r border-slate-800/40 truncate max-w-xs hover:bg-cyan-950/20 cursor-pointer relative group transition-colors"
                        title="Click to copy cell value"
                      >
                        <div className="flex items-center justify-between gap-1.5">
                          {isNull ? (
                            <span className="text-slate-400 italic">NULL</span>
                          ) : typeof val === 'number' ? (
                            <span className="text-emerald-300">{formatNumber(val)}</span>
                          ) : typeof val === 'boolean' ? (
                            <span className={val ? 'text-cyan-300' : 'text-rose-300'}>
                              {val ? 'TRUE' : 'FALSE'}
                            </span>
                          ) : (
                            <span className="text-slate-200">{String(val)}</span>
                          )}

                          <span className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 shrink-0">
                            {isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          </span>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-xs font-mono text-slate-400 pt-1">
          <span>Page {currentPage} of {totalPages}</span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:pointer-events-none"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:pointer-events-none"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 text-slate-200">{currentPage}</span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:pointer-events-none"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:pointer-events-none"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
