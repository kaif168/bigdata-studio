import React from 'react';
import { Cpu, Server, Shuffle, ArrowRight, Layers } from 'lucide-react';
import { MapReduceVisualizer } from '@/components/mapreduce/MapReduceVisualizer';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';

export const MapReducePage: React.FC = () => {
  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      {/* Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-navy-900 via-indigo-950/40 to-navy-900 border border-slate-800">
        <div className="flex items-center gap-2 mb-1.5">
          <Badge variant="cyan" size="sm">
            Distributed Computing Simulator
          </Badge>
          <Badge variant="purple" size="sm">
            Google / Hadoop Algorithm
          </Badge>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-100 flex items-center gap-2">
          <Cpu className="w-5 h-5 text-cyan-400" />
          Interactive MapReduce Execution Simulator
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl leading-relaxed">
          Experience the foundational distributed computing paradigm that enabled Big Data. Step through Input Splitting, Map tokenization, network Shuffle &amp; Sort, and Reducer aggregation dynamically for any user-provided string.
        </p>
      </div>

      {/* Main Interactive Visualizer */}
      <MapReduceVisualizer />

      {/* Theoretical Architecture Deep-Dive */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
        <Card className="space-y-2">
          <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs font-mono">
            <Layers className="w-4 h-4" /> 1. Map Stage
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Mappers process localized InputSplits in parallel. In the classic Word Count implementation, each incoming token emits an intermediate key-value pair <code>(word, 1)</code>.
          </p>
        </Card>

        <Card className="space-y-2">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs font-mono">
            <Shuffle className="w-4 h-4" /> 2. Shuffle &amp; Sort
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            The core engine partitions intermediate keys using a hash function, routes them across cluster nodes, and groups matching keys into an array <code>(word, [1, 1, 1...])</code>.
          </p>
        </Card>

        <Card className="space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs font-mono">
            <ArrowRight className="w-4 h-4" /> 3. Reduce Stage
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Reducers receive all aggregated values for a given key, compute the sum reduction, and write the final output records directly into HDFS storage blocks.
          </p>
        </Card>
      </div>
    </div>
  );
};
