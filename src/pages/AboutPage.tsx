import React from 'react';
import {
  Info,
  Layers,
  Cpu,
  Database,
  Terminal,
  ShieldCheck,
  CheckCircle2,
  Workflow,
  Sparkles,
  Server,
  User,
} from 'lucide-react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { StorageService } from '@/services/persistence/storage';

export const AboutPage: React.FC = () => {
  const prefs = StorageService.getPreferences();

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-navy-900 via-indigo-950/40 to-navy-900 border border-slate-800 space-y-3">
        <div className="flex items-center gap-2">
          <Badge variant="cyan" size="sm">
            College Academic Project
          </Badge>
          <Badge variant="purple" size="sm">
            Big Data Analytics (CS801)
          </Badge>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-100">
          BigData Studio — Interactive SQL &amp; Big Data Analytics Lab
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
          An enterprise-grade, in-browser big data analytics laboratory and SQL playground uniting real DuckDB-Wasm columnar execution, interactive Recharts visualization, distributed MapReduce simulation, and curriculum-aligned educational modules.
        </p>

        {/* Scholar Metadata Banner */}
        <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center gap-4 text-xs font-mono text-slate-300">
          <span className="flex items-center gap-1.5 text-cyan-300">
            <User className="w-3.5 h-3.5" /> Scholar: {prefs.studentName}
          </span>
          <span>•</span>
          <span className="text-amber-300">Roll No: {prefs.studentRollNumber}</span>
          <span>•</span>
          <span className="text-purple-300">Subject: {prefs.courseTitle}</span>
        </div>
      </div>

      {/* Problem Statement & Solution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="space-y-3">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-400" /> Problem Statement
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Students learning Big Data Analytics frequently encounter substantial friction setting up heavy multi-node distributed clusters (Hadoop HDFS, Spark, YARN, Hive) on standard college laptops. Setting up virtual machines often leads to memory exhaustion, complex network configurations, and prohibitive cloud costs, distracting from mastering core analytical concepts and SQL fundamentals.
          </p>
        </Card>

        <Card className="space-y-3">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" /> Proposed Solution
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            BigData Studio bridges the pedagogical gap by packaging real columnar analytical execution into the browser using DuckDB-Wasm and WebAssembly. It delivers zero-setup, instant execution of complex analytical SQL queries (Window functions, CTEs, multi-table aggregations) alongside step-by-step MapReduce simulations and automated challenge verification.
          </p>
        </Card>
      </div>

      {/* Core Technology Stack */}
      <Card className="space-y-4">
        <CardHeader
          title="Technology Stack &amp; Architectural Components"
          subtitle="Modern web technologies delivering native-like analytical performance."
          icon={<Cpu className="w-5 h-5 text-cyan-400" />}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs font-mono">
          <div className="p-3 rounded-lg bg-navy-950 border border-slate-800 space-y-1">
            <div className="text-cyan-400 font-bold">DuckDB-Wasm</div>
            <div className="text-slate-300 text-[11px]">Columnar analytical SQL execution compiled to WebAssembly.</div>
          </div>
          <div className="p-3 rounded-lg bg-navy-950 border border-slate-800 space-y-1">
            <div className="text-blue-400 font-bold">Monaco Editor</div>
            <div className="text-slate-300 text-[11px]">VS Code editor core with SQL syntax, autocomplete, and shortcuts.</div>
          </div>
          <div className="p-3 rounded-lg bg-navy-950 border border-slate-800 space-y-1">
            <div className="text-purple-400 font-bold">Recharts</div>
            <div className="text-slate-300 text-[11px]">Composable SVG charting library rendering live DuckDB aggregations.</div>
          </div>
          <div className="p-3 rounded-lg bg-navy-950 border border-slate-800 space-y-1">
            <div className="text-amber-400 font-bold">React 19 + TypeScript</div>
            <div className="text-slate-300 text-[11px]">Strongly typed component architecture and state management.</div>
          </div>
          <div className="p-3 rounded-lg bg-navy-950 border border-slate-800 space-y-1">
            <div className="text-emerald-400 font-bold">Tailwind CSS</div>
            <div className="text-slate-300 text-[11px]">Dark navy theme with electric blue accents and responsive grid.</div>
          </div>
          <div className="p-3 rounded-lg bg-navy-950 border border-slate-800 space-y-1">
            <div className="text-rose-400 font-bold">IndexedDB / LocalStorage</div>
            <div className="text-slate-300 text-[11px]">Client-side persistence for queries, progress, and uploaded data.</div>
          </div>
        </div>
      </Card>

      {/* Database Execution Workflow Diagram */}
      <Card className="space-y-3">
        <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
          <Workflow className="w-4 h-4 text-cyan-400" />
          Database Execution Workflow (In-Browser WebAssembly)
        </h3>
        <pre className="p-4 rounded-xl bg-navy-950 border border-slate-800 text-cyan-300 font-mono text-xs overflow-x-auto leading-relaxed">
{`[User SQL Input in Monaco Editor] (e.g. Ctrl + Enter)
            │
            ▼
[DuckDB Service Execution Layer] (src/services/database/duckdb.ts)
            │
            ▼
[Web Worker WebAssembly Virtual Machine] (duckdb-browser-eh.worker.js)
            │
            ├─► Scans In-Memory Columnar Tables (sales, students, etc.)
            ├─► Evaluates Vectorized Operators (Filter, Hash Aggregate, Window)
            └─► Produces Apache Arrow IPC Record Batches
            │
            ▼
[Result Serializer & Type Normalizer] (Arrow Table -> JS Row Objects)
            │
            ├─► Result Workspace (Paginated Table, CSV Export)
            ├─► Interactive Chart Visualizer (Recharts dynamic rendering)
            └─► Challenge Evaluator (Row-by-row comparison against Oracle)`}
        </pre>
      </Card>

      {/* Limitations & Future Enhancements */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="space-y-2">
          <h4 className="text-xs font-bold font-mono uppercase text-amber-400">
            Current Architectural Limitations
          </h4>
          <ul className="space-y-1.5 text-xs text-slate-300 list-disc list-inside leading-relaxed">
            <li>Single-client browser environment bounded by local device RAM (15-50MB optimal threshold).</li>
            <li>No multi-node network cluster distribution (simulated locally for pedagogical purposes).</li>
            <li>Single-statement SQL execution per command cycle for transaction safety.</li>
          </ul>
        </Card>

        <Card className="space-y-2">
          <h4 className="text-xs font-bold font-mono uppercase text-cyan-400">
            Future Scope &amp; Enhancements
          </h4>
          <ul className="space-y-1.5 text-xs text-slate-300 list-disc list-inside leading-relaxed">
            <li>Apache Arrow Parquet drag-and-drop direct byte parsing via DuckDB FileReader.</li>
            <li>Collaborative multi-student SQL sharing via WebRTC peer data channels.</li>
            <li>Integration with browser WebGPU for hardware-accelerated vectorized linear algebra.</li>
          </ul>
        </Card>
      </div>
    </div>
  );
};
