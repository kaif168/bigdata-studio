import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  Layers,
  Server,
  Zap,
  Database,
  Workflow,
  Clock,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';
import { LEARNING_MODULES } from '@/data/learningModules';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Layers,
  Server,
  Zap,
  Database,
  Workflow,
};

export const LearningHubPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedModuleId, setSelectedModuleId] = useState<string>(LEARNING_MODULES[0].id);

  const selectedModule = LEARNING_MODULES.find(m => m.id === selectedModuleId) || LEARNING_MODULES[0];
  const Icon = ICON_MAP[selectedModule.iconName] || Layers;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-navy-900 to-indigo-950/40 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Badge variant="cyan" size="sm">
              College Curriculum Aligned
            </Badge>
            <Badge variant="purple" size="sm">
              Interactive Quizzes Included
            </Badge>
          </div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-cyan-400" />
            Big Data Analytics Learning Hub
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            In-depth academic modules exploring distributed storage, YARN resource management, MapReduce, Apache Spark in-memory architectures, NoSQL stores, and modern ELT pipelines.
          </p>
        </div>
      </div>

      {/* Module Selector Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {LEARNING_MODULES.map(mod => {
          const ModIcon = ICON_MAP[mod.iconName] || Layers;
          const isSelected = mod.id === selectedModuleId;
          return (
            <button
              key={mod.id}
              onClick={() => setSelectedModuleId(mod.id)}
              className={`p-4 rounded-xl border text-left transition-all ${
                isSelected
                  ? 'bg-cyan-950/40 border-cyan-400 shadow-lg shadow-cyan-950/30'
                  : 'bg-navy-900/80 hover:bg-slate-800/60 border-slate-800 text-slate-400'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono text-cyan-400">Module 0{mod.number}</span>
                <ModIcon className={`w-4 h-4 ${isSelected ? 'text-cyan-400' : 'text-slate-400'}`} />
              </div>
              <h3 className="font-semibold text-xs text-slate-100 line-clamp-1">{mod.title}</h3>
              <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{mod.description}</p>
            </button>
          );
        })}
      </div>

      {/* Selected Module Topics List */}
      <Card className="space-y-4">
        <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-mono text-cyan-400">Module 0{selectedModule.number} Curriculum</span>
              <h3 className="text-base font-bold text-slate-100">{selectedModule.title}</h3>
              <p className="text-xs text-slate-400 mt-0.5">{selectedModule.description}</p>
            </div>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {selectedModule.topics.length} In-Depth Topics
          </span>
        </div>

        {/* Topic Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {selectedModule.topics.map(topic => (
            <div
              key={topic.id}
              onClick={() => navigate(`/learning/${topic.id}`)}
              className="p-4 rounded-xl bg-navy-950 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-900/60 transition-all cursor-pointer group flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <Badge variant="cyan" size="sm">
                    {topic.badge}
                  </Badge>
                  <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {topic.readTimeMinutes} min read
                  </span>
                </div>

                <h4 className="text-sm font-bold text-slate-100 group-hover:text-cyan-300 transition-colors">
                  {topic.title}
                </h4>
                <p className="text-xs text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                  {topic.summary}
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-800/60 text-xs font-mono">
                <span className="text-slate-400 flex items-center gap-1">
                  <HelpCircle className="w-3 h-3 text-amber-400" />
                  {topic.quiz.length} Quiz Questions
                </span>
                <span className="text-cyan-400 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                  Read Module Topic <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
