import React, { useRef } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import { Play, RotateCcw, Trash2, BookmarkPlus, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useTheme } from '@/context/ThemeContext';
import { StorageService } from '@/services/persistence/storage';

interface SqlEditorProps {
  value: string;
  onChange: (value: string) => void;
  onExecute: () => void;
  onResetExample: () => void;
  onSaveQuery: () => void;
  isExecuting?: boolean;
  activeDataset?: string;
}

export const SqlEditor: React.FC<SqlEditorProps> = ({
  value,
  onChange,
  onExecute,
  onResetExample,
  onSaveQuery,
  isExecuting = false,
  activeDataset,
}) => {
  const { theme } = useTheme();
  const editorRef = useRef<any>(null);
  const prefs = StorageService.getPreferences();

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;

    // Add Ctrl+Enter / Cmd+Enter run shortcut
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      onExecute();
    });

    // Configure SQL language options
    monaco.languages.registerCompletionItemProvider('sql', {
      provideCompletionItems: (model: any, position: any) => {
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn,
        };

        const keywords = [
          'SELECT', 'FROM', 'WHERE', 'GROUP BY', 'HAVING', 'ORDER BY',
          'LIMIT', 'JOIN', 'LEFT JOIN', 'INNER JOIN', 'ON', 'AS',
          'COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'ROUND', 'DISTINCT',
          'WITH', 'OVER', 'PARTITION BY', 'ROW_NUMBER', 'DENSE_RANK',
          'RANK', 'NTILE', 'LAG', 'LEAD', 'CASE', 'WHEN', 'THEN',
          'ELSE', 'END', 'CAST', 'COALESCE', 'NULLIF', 'DESC', 'ASC',
          'sales', 'students', 'web_events', 'sensor_readings',
          'retail_transactions', 'employees'
        ];

        const suggestions = keywords.map(kw => ({
          label: kw,
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: kw,
          range,
        }));

        return { suggestions };
      },
    });
  };

  const handleFormatSql = () => {
    if (!value) return;
    // Clean indentation and standard uppercase SQL keywords
    const formatted = value
      .replace(/\b(select|from|where|group by|having|order by|limit|join|left join|inner join|with|as|case|when|then|else|end|distinct)\b/gi, match => match.toUpperCase())
      .trim();
    onChange(formatted);
  };

  const handleClear = () => {
    onChange('');
  };

  return (
    <div className="flex flex-col bg-navy-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
      {/* Editor Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-navy-950/70 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="primary"
            onClick={onExecute}
            isLoading={isExecuting}
            leftIcon={<Play className="w-3.5 h-3.5 fill-current" />}
            className="bg-cyan-600 hover:bg-cyan-500 text-white font-semibold"
          >
            Run Query
          </Button>

          <Button
            size="sm"
            variant="secondary"
            onClick={handleFormatSql}
            leftIcon={<Sparkles className="w-3.5 h-3.5 text-cyan-400" />}
            title="Auto-format SQL keywords"
          >
            Format
          </Button>

          <Button
            size="sm"
            variant="secondary"
            onClick={onSaveQuery}
            leftIcon={<BookmarkPlus className="w-3.5 h-3.5 text-blue-400" />}
            title="Save this query to your local repository"
          >
            Save Query
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={onResetExample}
            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
            title="Load initial dataset query example"
          >
            Reset Example
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={handleClear}
            leftIcon={<Trash2 className="w-3.5 h-3.5 text-slate-400 hover:text-rose-400" />}
            title="Clear SQL Editor"
          >
            Clear
          </Button>

          <div className="hidden sm:flex items-center gap-1.5 pl-2 border-l border-slate-800 text-[11px] font-mono text-slate-400">
            <span>Shortcut:</span>
            <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-cyan-300">
              Ctrl+Enter
            </kbd>
          </div>
        </div>
      </div>

      {/* Monaco Editor Container */}
      <div className="h-64 sm:h-72 w-full relative">
        {isExecuting && (
          <div className="absolute top-2 right-2 z-10 flex items-center gap-2 px-2.5 py-1 rounded bg-cyan-950/80 border border-cyan-800 text-cyan-300 text-xs font-mono backdrop-blur-sm">
            <Loader2 className="w-3 h-3 animate-spin" />
            Executing in DuckDB...
          </div>
        )}
        <Editor
          height="100%"
          language="sql"
          theme={theme === 'dark' ? 'vs-dark' : 'light'}
          value={value}
          onChange={val => onChange(val || '')}
          onMount={handleEditorDidMount}
          options={{
            fontSize: prefs.editorFontSize || 14,
            wordWrap: prefs.editorWordWrap ? 'on' : 'off',
            minimap: { enabled: false },
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            lineHeight: 22,
            fontFamily: 'JetBrains Mono, Fira Code, Consolas, monospace',
            padding: { top: 12, bottom: 12 },
            renderLineHighlight: 'all',
          }}
        />
      </div>
    </div>
  );
};
