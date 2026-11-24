import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Trophy,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  Play,
  RotateCcw,
  Sparkles,
  ChevronRight,
  BookOpen,
} from 'lucide-react';
import { SqlChallenge } from '@/types';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { SqlEditor } from '@/components/sql-editor/SqlEditor';
import { ResultWorkspace } from '@/components/results/ResultWorkspace';
import { ChallengeEvaluator, EvaluationResult } from '@/services/challenges/evaluator';
import { StorageService } from '@/services/persistence/storage';
import { useDatabase } from '@/context/DatabaseContext';

interface ChallengeWorkspaceProps {
  challenge: SqlChallenge;
  onCompleted?: () => void;
  onNextChallenge?: () => void;
}

export const ChallengeWorkspace: React.FC<ChallengeWorkspaceProps> = ({
  challenge,
  onCompleted,
  onNextChallenge,
}) => {
  const { setActiveTable, executeQuery } = useDatabase();
  const [userSql, setUserSql] = useState<string>(challenge.initialSql);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [evalResult, setEvalResult] = useState<EvaluationResult | null>(null);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [showExplanation, setShowExplanation] = useState<boolean>(false);

  const savedProgress = StorageService.getChallengeProgress();
  const isAlreadyCompleted = !!savedProgress[challenge.id]?.completed;

  // Sync active dataset
  React.useEffect(() => {
    setActiveTable(challenge.dataset);
    setUserSql(challenge.initialSql);
    setEvalResult(null);
    setShowHint(false);
    setShowExplanation(false);
  }, [challenge]);

  const handleRunOnly = async () => {
    try {
      setIsEvaluating(true);
      const res = await executeQuery(userSql, challenge.dataset);
      setEvalResult({
        passed: false,
        message: 'Query executed. Click "Check Answer" to submit and evaluate against test oracle.',
        userResult: res,
      });
    } catch (err: any) {
      setEvalResult({
        passed: false,
        message: err.message || 'SQL Execution Error',
      });
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleCheckAnswer = async () => {
    setIsEvaluating(true);
    try {
      const evaluation = await ChallengeEvaluator.evaluate(challenge, userSql);
      setEvalResult(evaluation);

      if (evaluation.passed) {
        // Trigger celebratory confetti
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });

        StorageService.saveChallengeProgress({
          challengeId: challenge.id,
          completed: true,
          completedAt: Date.now(),
          userSql,
          scoreEarned: challenge.score,
        });

        if (onCompleted) onCompleted();
      }
    } catch (err: any) {
      setEvalResult({
        passed: false,
        message: `Evaluation failure: ${err.message || String(err)}`,
      });
    } finally {
      setIsEvaluating(false);
    }
  };

  const difficultyColors = {
    Beginner: 'success',
    Intermediate: 'warning',
    Advanced: 'danger',
  } as const;

  return (
    <div className="space-y-6">
      {/* Problem Specification Card */}
      <Card>
        <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <Badge variant={difficultyColors[challenge.difficulty]} size="md">
              {challenge.difficulty}
            </Badge>
            <Badge variant="cyan" size="md">
              {challenge.category}
            </Badge>
            <Badge variant="outline" size="md">
              Dataset: {challenge.dataset}
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400">Score:</span>
            <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-mono font-bold flex items-center gap-1">
              <Trophy className="w-3.5 h-3.5" /> +{challenge.score} pts
            </span>

            {isAlreadyCompleted && (
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-mono font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Completed
              </span>
            )}
          </div>
        </div>

        <h2 className="text-lg font-bold text-slate-100">{challenge.title}</h2>
        <p className="text-xs text-slate-300 mt-2 leading-relaxed whitespace-pre-wrap">
          {challenge.problemStatement}
        </p>

        {/* Hint and Solution toggles */}
        <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-slate-800/80 mt-4 text-xs">
          <button
            onClick={() => setShowHint(prev => !prev)}
            className="flex items-center gap-1.5 text-amber-400 hover:text-amber-300 transition-colors font-mono cursor-pointer"
          >
            <Lightbulb className="w-3.5 h-3.5" />
            <span>{showHint ? 'Hide Hint' : 'Show Hint'}</span>
          </button>

          <button
            onClick={() => setShowExplanation(prev => !prev)}
            className="flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 transition-colors font-mono cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>{showExplanation ? 'Hide Solution & Notes' : 'Show Solution & Notes'}</span>
          </button>
        </div>

        {showHint && (
          <div className="mt-3 p-3 rounded-lg bg-amber-950/20 border border-amber-800/40 text-amber-200 text-xs leading-relaxed font-mono">
            <strong>Hint:</strong> {challenge.hint}
          </div>
        )}

        {showExplanation && (
          <div className="mt-3 p-3 rounded-lg bg-cyan-950/20 border border-cyan-800/40 text-cyan-200 text-xs leading-relaxed font-mono space-y-2">
            <div><strong>Reference Solution SQL:</strong></div>
            <pre className="p-2 rounded bg-navy-950 text-cyan-300 overflow-x-auto text-[11px]">{challenge.solutionSql}</pre>
            <div><strong>Explanation:</strong> {challenge.explanation}</div>
          </div>
        )}
      </Card>

      {/* SQL Editor */}
      <div className="space-y-3">
        <SqlEditor
          value={userSql}
          onChange={setUserSql}
          onExecute={handleRunOnly}
          onResetExample={() => setUserSql(challenge.initialSql)}
          onSaveQuery={() => {}}
          isExecuting={isEvaluating}
          activeDataset={challenge.dataset}
        />

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setUserSql(challenge.initialSql)}
            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
          >
            Reset Starter SQL
          </Button>

          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              size="md"
              onClick={handleRunOnly}
              isLoading={isEvaluating}
              leftIcon={<Play className="w-4 h-4 text-cyan-400" />}
            >
              Test Run
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={handleCheckAnswer}
              isLoading={isEvaluating}
              leftIcon={<Sparkles className="w-4 h-4" />}
              className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold"
            >
              Check Answer
            </Button>
            {onNextChallenge && (
              <Button
                variant="outline"
                size="md"
                onClick={onNextChallenge}
                rightIcon={<ChevronRight className="w-4 h-4" />}
              >
                Next Challenge
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Evaluation Results Feedback */}
      {evalResult && (
        <div
          className={`p-4 rounded-xl border font-mono text-xs space-y-2 ${
            evalResult.passed
              ? 'bg-emerald-950/30 border-emerald-600/60 text-emerald-200'
              : 'bg-rose-950/30 border-rose-600/60 text-rose-200'
          }`}
        >
          <div className="flex items-center gap-2 font-bold text-sm">
            {evalResult.passed ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>Challenge Solved Successfully! (+{challenge.score} points)</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-5 h-5 text-rose-400" />
                <span>Verification Not Passed</span>
              </>
            )}
          </div>
          <p className="leading-relaxed">{evalResult.message}</p>
          {evalResult.discrepancy && (
            <div className="text-[11px] text-slate-300 bg-navy-950/60 p-2 rounded border border-slate-800">
              Details: {evalResult.discrepancy}
            </div>
          )}
        </div>
      )}

      {/* Query Results Workspace */}
      <ResultWorkspace
        result={evalResult?.userResult || null}
        error={evalResult && !evalResult.passed && !evalResult.userResult ? evalResult.message : null}
      />
    </div>
  );
};
