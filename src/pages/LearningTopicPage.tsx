import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Clock,
  BookOpen,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Code2,
  Terminal,
  ExternalLink,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { LEARNING_MODULES } from '@/data/learningModules';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export const LearningTopicPage: React.FC = () => {
  const { topicId } = useParams<{ topicId: string }>();
  const navigate = useNavigate();

  // Find topic across modules
  let topic: any = null;
  let currentModule: any = null;

  for (const mod of LEARNING_MODULES) {
    const found = mod.topics.find(t => t.id === topicId);
    if (found) {
      topic = found;
      currentModule = mod;
      break;
    }
  }

  // Quiz state: stores selected option index for each question id
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [submittedQuiz, setSubmittedQuiz] = useState<boolean>(false);

  if (!topic) {
    return (
      <div className="py-24 text-center space-y-4">
        <h2 className="text-lg font-bold text-slate-100">Topic Not Found</h2>
        <Button variant="secondary" onClick={() => navigate('/learning')}>
          Return to Learning Hub
        </Button>
      </div>
    );
  }

  const handleSelectOption = (questionId: string, optionIdx: number) => {
    if (submittedQuiz) return;
    setSelectedAnswers(prev => ({ ...prev, [questionId]: optionIdx }));
  };

  const handleRunInPlayground = () => {
    if (!topic.codeExample) return;
    navigate('/playground', {
      state: {
        sql: topic.codeExample.code,
        dataset: 'sales',
      },
    });
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto animate-fade-in pb-12">
      {/* Navigation Breadcrumb & Back */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={() => navigate('/learning')}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-cyan-400 font-mono transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Module 0{currentModule.number}
        </button>

        <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
          <Clock className="w-3 h-3 text-cyan-400" /> {topic.readTimeMinutes} min study time
        </span>
      </div>

      {/* Title & Definition Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Badge variant="cyan" size="sm">
            Module 0{currentModule.number}: {currentModule.title}
          </Badge>
          <Badge variant="purple" size="sm">
            {topic.badge}
          </Badge>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-100">
          {topic.title}
        </h1>
        <p className="text-sm text-slate-300 leading-relaxed">{topic.summary}</p>
      </div>

      {/* Core Definition Card */}
      <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-800/40 text-xs sm:text-sm text-cyan-200 leading-relaxed font-sans">
        <strong className="text-cyan-300 block mb-1 font-mono uppercase text-xs">Formal Academic Definition</strong>
        {topic.definition}
      </div>

      {/* Detailed Explanation */}
      <Card className="space-y-3">
        <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-cyan-400" />
          Technical Explanation &amp; Mechanics
        </h3>
        <div className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap font-sans">
          {topic.explanation}
        </div>
      </Card>

      {/* Architecture Diagram if available */}
      {topic.architectureDiagram && (
        <Card className="space-y-3">
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Code2 className="w-4 h-4 text-cyan-400" />
            System Architecture Diagram
          </h3>
          <pre className="p-4 rounded-xl bg-navy-950 border border-slate-800 text-cyan-300 font-mono text-xs overflow-x-auto leading-relaxed">
            {topic.architectureDiagram}
          </pre>
        </Card>
      )}

      {/* How it Works Step-by-Step */}
      <Card className="space-y-3">
        <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-blue-400" />
          How It Works (Step-by-Step Execution Lifecycle)
        </h3>
        <ol className="space-y-2 list-decimal list-inside text-xs text-slate-300 leading-relaxed font-sans">
          {topic.howItWorks.map((step: string, idx: number) => (
            <li key={idx} className="pl-1">
              {step}
            </li>
          ))}
        </ol>
      </Card>

      {/* Advantages vs Limitations Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="space-y-2 border-emerald-900/30 bg-emerald-950/10">
          <h4 className="text-xs font-bold font-mono uppercase text-emerald-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" /> Architectural Advantages
          </h4>
          <ul className="space-y-1.5 text-xs text-slate-300 list-disc list-inside">
            {topic.advantages.map((adv: string, i: number) => (
              <li key={i}>{adv}</li>
            ))}
          </ul>
        </Card>

        <Card className="space-y-2 border-rose-900/30 bg-rose-950/10">
          <h4 className="text-xs font-bold font-mono uppercase text-rose-400 flex items-center gap-1.5">
            <XCircle className="w-4 h-4" /> Limitations &amp; Trade-offs
          </h4>
          <ul className="space-y-1.5 text-xs text-slate-300 list-disc list-inside">
            {topic.limitations.map((lim: string, i: number) => (
              <li key={i}>{lim}</li>
            ))}
          </ul>
        </Card>
      </div>

      {/* Real-World Industry Applications */}
      <Card className="space-y-3">
        <h3 className="text-base font-bold text-slate-100">Real-World Industry Applications</h3>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-300">
          {topic.realWorldApplications.map((app: string, idx: number) => (
            <li key={idx} className="p-2.5 rounded-lg bg-navy-950 border border-slate-800 flex items-start gap-2">
              <span className="text-cyan-400 font-bold">•</span>
              <span>{app}</span>
            </li>
          ))}
        </ul>
      </Card>

      {/* Related Code Example */}
      {topic.codeExample && (
        <Card className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyan-400" />
              Related Code / Analytical Query Example
            </h3>
            {topic.codeExample.language === 'sql' && (
              <Button size="sm" variant="primary" onClick={handleRunInPlayground}>
                Run in SQL Playground
              </Button>
            )}
          </div>
          <p className="text-xs text-slate-400">{topic.codeExample.description}</p>
          <pre className="p-4 rounded-xl bg-navy-950 border border-slate-800 text-cyan-300 font-mono text-xs overflow-x-auto whitespace-pre-wrap">
            {topic.codeExample.code}
          </pre>
        </Card>
      )}

      {/* Knowledge-Check Interactive Quiz */}
      <Card className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-amber-400" />
            Knowledge-Check Assessment ({topic.quiz.length} Questions)
          </h3>
          <span className="text-xs font-mono text-slate-400">Immediate Feedback</span>
        </div>

        <div className="space-y-6 pt-2">
          {topic.quiz.map((q: any, qIdx: number) => {
            const chosen = selectedAnswers[q.id];
            const isAnswered = chosen !== undefined;
            const isCorrect = chosen === q.correctAnswerIndex;

            return (
              <div key={q.id} className="p-4 rounded-xl bg-navy-950 border border-slate-800 space-y-3">
                <div className="font-semibold text-xs text-slate-200">
                  {qIdx + 1}. {q.question}
                </div>

                <div className="space-y-2">
                  {q.options.map((opt: string, optIdx: number) => {
                    const isSelectedOpt = chosen === optIdx;
                    let optStyle = 'bg-navy-900 border-slate-800 text-slate-300 hover:border-slate-700';

                    if (submittedQuiz) {
                      if (optIdx === q.correctAnswerIndex) {
                        optStyle = 'bg-emerald-950/40 border-emerald-500 text-emerald-200';
                      } else if (isSelectedOpt) {
                        optStyle = 'bg-rose-950/40 border-rose-500 text-rose-200';
                      }
                    } else if (isSelectedOpt) {
                      optStyle = 'bg-cyan-950/40 border-cyan-400 text-cyan-200';
                    }

                    return (
                      <button
                        key={optIdx}
                        onClick={() => handleSelectOption(q.id, optIdx)}
                        className={`w-full text-left p-2.5 rounded-lg border text-xs font-mono transition-all flex items-center justify-between cursor-pointer ${optStyle}`}
                      >
                        <span>{opt}</span>
                        {submittedQuiz && optIdx === q.correctAnswerIndex && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {submittedQuiz && (
                  <div className={`p-2.5 rounded-lg text-xs font-mono ${isCorrect ? 'bg-emerald-950/20 text-emerald-300' : 'bg-rose-950/20 text-rose-300'}`}>
                    <strong>Explanation:</strong> {q.explanation}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="pt-2 flex justify-end">
          <Button
            variant="primary"
            size="md"
            onClick={() => setSubmittedQuiz(true)}
            disabled={Object.keys(selectedAnswers).length === 0}
          >
            Submit Answers &amp; Check Score
          </Button>
        </div>
      </Card>
    </div>
  );
};
