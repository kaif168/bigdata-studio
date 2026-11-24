import React, { useState, useMemo } from 'react';
import {
  Play,
  RotateCcw,
  ChevronRight,
  ChevronLeft,
  FastForward,
  Cpu,
  Layers,
  ArrowRight,
  Split,
  Shuffle,
  FileCheck2,
  Info,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { MapReduceEngine, MapReduceExecutionState } from '@/services/mapreduce/simulator';

const STAGES = [
  { id: 1, name: 'Input Text', icon: Layers, desc: 'Raw unstructured input data fed into the processing pipeline.' },
  { id: 2, name: 'Input Splitting', icon: Split, desc: 'Logical splits partitioned across virtual nodes (InputSplits).' },
  { id: 3, name: 'Map Phase', icon: Cpu, desc: 'Parallel Mappers generate intermediate (Key, Value) pairs (word, 1).' },
  { id: 4, name: 'Shuffle & Sort', icon: Shuffle, desc: 'Network routing and grouping all identical keys into value lists (key, [1, 1]).' },
  { id: 5, name: 'Reduce Phase', icon: ArrowRight, desc: 'Reducers aggregate grouped values into consolidated sums.' },
  { id: 6, name: 'Final Output', icon: FileCheck2, desc: 'Sorted final key-frequency pairs written to persistent storage.' },
];

export const MapReduceVisualizer: React.FC = () => {
  const [inputText, setInputText] = useState<string>('big data is big data');
  const [currentStage, setCurrentStage] = useState<number>(1);
  const [numMappers, setNumMappers] = useState<number>(2);
  const [numReducers, setNumReducers] = useState<number>(2);

  const executionState: MapReduceExecutionState = useMemo(() => {
    return MapReduceEngine.simulate(inputText, numMappers, numReducers);
  }, [inputText, numMappers, numReducers]);

  const handleNext = () => {
    if (currentStage < 6) setCurrentStage(prev => prev + 1);
  };

  const handlePrev = () => {
    if (currentStage > 1) setCurrentStage(prev => prev - 1);
  };

  const handleRunAll = () => {
    setCurrentStage(6);
  };

  const handleReset = () => {
    setCurrentStage(1);
    setInputText('big data is big data');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Simulation Notice Card */}
      <div className="p-3.5 rounded-xl bg-cyan-950/20 border border-cyan-800/40 text-xs text-cyan-200 flex items-start gap-3">
        <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-cyan-300">Educational Simulation Note:</strong> This visualizer calculates each phase in-browser to illustrate the foundational Google &amp; Apache Hadoop MapReduce algorithm. It visually traces input splitting, intermediate key-value emission, network shuffling, and reduction.
        </p>
      </div>

      {/* Input & Control Card */}
      <Card>
        <CardHeader
          title="MapReduce Pipeline Configuration"
          subtitle="Customize input text or cluster parameters to observe dynamic key-value transformations."
          icon={<Cpu className="w-5 h-5 text-cyan-400" />}
        />

        <div className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1.5">
              Input Text (Try your own phrases or paragraphs):
            </label>
            <textarea
              rows={2}
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              placeholder="Enter text to tokenize and count..."
              className="w-full bg-navy-950 border border-slate-800 rounded-xl p-3 text-slate-100 font-mono text-xs focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-800/80">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-mono">Virtual Mappers:</span>
                <select
                  value={numMappers}
                  onChange={e => setNumMappers(Number(e.target.value))}
                  className="bg-navy-950 border border-slate-800 rounded px-2.5 py-1 text-slate-200 font-mono"
                >
                  <option value={2}>2 Mappers</option>
                  <option value={3}>3 Mappers</option>
                  <option value={4}>4 Mappers</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-mono">Virtual Reducers:</span>
                <select
                  value={numReducers}
                  onChange={e => setNumReducers(Number(e.target.value))}
                  className="bg-navy-950 border border-slate-800 rounded px-2.5 py-1 text-slate-200 font-mono"
                >
                  <option value={1}>1 Reducer</option>
                  <option value={2}>2 Reducers</option>
                  <option value={3}>3 Reducers</option>
                </select>
              </div>
            </div>

            {/* Stepper Controls */}
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={handlePrev}
                disabled={currentStage <= 1}
                leftIcon={<ChevronLeft className="w-3.5 h-3.5" />}
              >
                Previous
              </Button>
              <Button
                size="sm"
                variant="primary"
                onClick={handleNext}
                disabled={currentStage >= 6}
                rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
              >
                Next Step
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={handleRunAll}
                leftIcon={<FastForward className="w-3.5 h-3.5 text-cyan-400" />}
              >
                Run All
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleReset}
                leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
              >
                Reset
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Progress Steps Timeline */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
        {STAGES.map(stage => {
          const Icon = stage.icon;
          const isDone = stage.id <= currentStage;
          const isCurrent = stage.id === currentStage;
          return (
            <button
              key={stage.id}
              onClick={() => setCurrentStage(stage.id)}
              className={`p-3 rounded-xl border text-left transition-all ${
                isCurrent
                  ? 'bg-cyan-950/40 border-cyan-400 shadow-lg shadow-cyan-950/30'
                  : isDone
                  ? 'bg-navy-900 border-slate-700/80 text-slate-300'
                  : 'bg-navy-950 border-slate-800/60 text-slate-400 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-mono text-cyan-400">Phase 0{stage.id}</span>
                <Icon className={`w-3.5 h-3.5 ${isCurrent ? 'text-cyan-400' : 'text-slate-400'}`} />
              </div>
              <div className="font-semibold text-xs text-slate-100">{stage.name}</div>
            </button>
          );
        })}
      </div>

      {/* Stage Detail Visualizer Display */}
      <Card>
        <div className="mb-4">
          <div className="flex items-center gap-2">
            <Badge variant="cyan" size="sm">
              Stage {currentStage} of 6
            </Badge>
            <h3 className="text-base font-semibold text-slate-100">{STAGES[currentStage - 1].name}</h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">{STAGES[currentStage - 1].desc}</p>
        </div>

        {/* Dynamic Stage Display Panels */}
        <div className="pt-2">
          {/* STAGE 1: Raw Input */}
          {currentStage === 1 && (
            <div className="p-4 rounded-xl bg-navy-950 border border-slate-800 font-mono text-xs space-y-2">
              <div className="text-slate-400 uppercase tracking-wider text-[10px]">HDFS Distributed Input Stream:</div>
              <div className="text-cyan-300 text-sm font-semibold">{inputText || '(empty input)'}</div>
              <div className="text-slate-400 text-[11px] pt-2">
                Total Words: {executionState.allMapPairs.length} | Characters: {inputText.length}
              </div>
            </div>
          )}

          {/* STAGE 2: Splitting */}
          {currentStage === 2 && (
            <div className="space-y-3">
              <div className="text-xs text-slate-400">
                Input string divided into {executionState.splits.length} logical chunks (mimicking 128MB HDFS block partitioning):
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {executionState.splits.map(split => (
                  <div key={split.splitId} className="p-3.5 rounded-xl bg-navy-950 border border-slate-800 font-mono text-xs space-y-1">
                    <div className="text-cyan-400 font-semibold flex items-center justify-between">
                      <span>InputSplit #{split.splitId}</span>
                      <span className="text-[10px] text-slate-400">{split.lines.length} tokens</span>
                    </div>
                    <div className="text-slate-200 bg-navy-900 p-2 rounded border border-slate-800">
                      &quot;{split.text}&quot;
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STAGE 3: Map Phase */}
          {currentStage === 3 && (
            <div className="space-y-3">
              <div className="text-xs text-slate-400">
                Each mapper tokenizes lines into intermediate key-value pairs <code className="text-cyan-300 font-mono">(word, 1)</code>:
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {executionState.mapOutputs.map(mo => (
                  <div key={mo.mapperId} className="p-3.5 rounded-xl bg-navy-950 border border-slate-800 font-mono text-xs">
                    <div className="text-cyan-400 font-semibold mb-2">Mapper #{mo.mapperId} Output:</div>
                    <div className="space-y-1.5 max-h-48 overflow-y-auto">
                      {mo.pairs.map((p, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-navy-900 px-2.5 py-1 rounded border border-slate-800">
                          <span className="text-slate-200">({p.key})</span>
                          <span className="text-emerald-400 font-bold">{p.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STAGE 4: Shuffle & Sort */}
          {currentStage === 4 && (
            <div className="space-y-3">
              <div className="text-xs text-slate-400">
                Network partition routing and alphabetical collation grouping values by identical key:
              </div>
              <div className="border border-slate-800 rounded-xl overflow-hidden bg-navy-950 font-mono text-xs">
                <table className="w-full text-left">
                  <thead className="bg-navy-900 border-b border-slate-800 text-slate-400">
                    <tr>
                      <th className="py-2.5 px-4">Grouped Key</th>
                      <th className="py-2.5 px-4">Collected Values Array</th>
                      <th className="py-2.5 px-4">Assigned Reducer Node</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40 text-slate-200">
                    {executionState.shuffledGroups.map((g, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/30">
                        <td className="py-2.5 px-4 text-cyan-300 font-bold">{g.key}</td>
                        <td className="py-2.5 px-4 text-amber-300">[{g.values.join(', ')}]</td>
                        <td className="py-2.5 px-4 text-purple-300">Reducer #{g.assignedReducerId}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* STAGE 5: Reduce Phase */}
          {currentStage === 5 && (
            <div className="space-y-3">
              <div className="text-xs text-slate-400">
                Reducers iterate over grouped value arrays and calculate cumulative totals:
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {executionState.reducedOutputs.map(ro => (
                  <div key={ro.reducerId} className="p-3.5 rounded-xl bg-navy-950 border border-slate-800 font-mono text-xs">
                    <div className="text-purple-400 font-semibold mb-2">Reducer #{ro.reducerId} Results:</div>
                    <div className="space-y-1.5">
                      {ro.results.map((r, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-navy-900 px-3 py-1.5 rounded border border-slate-800">
                          <span className="text-slate-200">({r.key})</span>
                          <span className="text-emerald-400 font-bold">{r.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STAGE 6: Final Output */}
          {currentStage === 6 && (
            <div className="space-y-3">
              <div className="text-xs text-slate-400">
                Final aggregated output sorted by word frequency:
              </div>
              <div className="border border-slate-800 rounded-xl overflow-hidden bg-navy-950 font-mono text-xs">
                <table className="w-full text-left">
                  <thead className="bg-navy-900 border-b border-slate-800 text-slate-400">
                    <tr>
                      <th className="py-2.5 px-4 w-12 text-center">Rank</th>
                      <th className="py-2.5 px-4">Word / Key</th>
                      <th className="py-2.5 px-4">Final Frequency</th>
                      <th className="py-2.5 px-4">Visual Proportion</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40 text-slate-200">
                    {executionState.finalResults.map((r, idx) => {
                      const maxVal = executionState.finalResults[0]?.value || 1;
                      const pct = Math.round((r.value / maxVal) * 100);
                      return (
                        <tr key={idx} className="hover:bg-slate-800/30">
                          <td className="py-2.5 px-4 text-center text-slate-400">{idx + 1}</td>
                          <td className="py-2.5 px-4 text-cyan-300 font-bold">{r.key}</td>
                          <td className="py-2.5 px-4 text-emerald-400 font-bold">{r.value}</td>
                          <td className="py-2.5 px-4 w-48">
                            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                              <div className="bg-cyan-500 h-full rounded-full" style={{ width: `${pct}%` }} />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
