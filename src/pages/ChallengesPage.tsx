import React, { useState } from 'react';
import {
  Trophy,
  CheckCircle2,
  Clock,
  Filter,
  Search,
  ChevronRight,
  Sparkles,
  Layers,
  Award,
} from 'lucide-react';
import { SQL_CHALLENGES } from '@/data/challenges';
import { ChallengeWorkspace } from '@/components/challenges/ChallengeWorkspace';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { StorageService } from '@/services/persistence/storage';
import { SqlChallenge } from '@/types';

export const ChallengesPage: React.FC = () => {
  const [selectedChallengeId, setSelectedChallengeId] = useState<string>(SQL_CHALLENGES[0].id);
  const [difficultyFilter, setDifficultyFilter] = useState<string>('All');
  const [search, setSearch] = useState<string>('');
  const [progressKey, setProgressKey] = useState<number>(0);

  const progress = StorageService.getChallengeProgress();

  const totalScore = Object.values(progress).reduce(
    (acc, p) => acc + (p.completed ? p.scoreEarned : 0),
    0
  );

  const completedCount = Object.values(progress).filter(p => p.completed).length;

  const filteredChallenges = SQL_CHALLENGES.filter(ch => {
    const matchesSearch =
      ch.title.toLowerCase().includes(search.toLowerCase()) ||
      ch.objective.toLowerCase().includes(search.toLowerCase()) ||
      ch.category.toLowerCase().includes(search.toLowerCase());

    const matchesDifficulty = difficultyFilter === 'All' || ch.difficulty === difficultyFilter;
    return matchesSearch && matchesDifficulty;
  });

  const activeChallenge =
    SQL_CHALLENGES.find(c => c.id === selectedChallengeId) || SQL_CHALLENGES[0];

  const handleNextChallenge = () => {
    const currentIndex = SQL_CHALLENGES.findIndex(c => c.id === selectedChallengeId);
    if (currentIndex < SQL_CHALLENGES.length - 1) {
      setSelectedChallengeId(SQL_CHALLENGES[currentIndex + 1].id);
    }
  };

  const handleChallengeCompleted = () => {
    setProgressKey(prev => prev + 1);
  };

  const difficultyColors = {
    Beginner: 'success',
    Intermediate: 'warning',
    Advanced: 'danger',
  } as const;

  return (
    <div className="space-y-6 animate-fade-in" key={progressKey}>
      {/* Gamified Header Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-navy-900 via-indigo-950/40 to-navy-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <Badge variant="cyan" size="sm">
              26 Practical Coding Challenges
            </Badge>
            <Badge variant="purple" size="sm">
              Automated DuckDB Verifier
            </Badge>
          </div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            Big Data SQL Coding Challenges
          </h2>
          <p className="text-xs text-slate-400 max-w-xl">
            Solve real analytical problems. Your SQL is executed and verified in real-time against oracle reference queries computed by the database engine.
          </p>
        </div>

        {/* Score & Progress Tracker */}
        <div className="flex items-center gap-4 bg-navy-950/80 border border-slate-800 rounded-xl p-3 shrink-0">
          <div className="text-right">
            <div className="text-[10px] text-slate-400 uppercase font-mono">Mastery Score</div>
            <div className="text-lg font-bold text-amber-400 font-mono flex items-center justify-end gap-1">
              <Award className="w-4 h-4" /> {totalScore} pts
            </div>
          </div>
          <div className="h-8 w-[1px] bg-slate-800" />
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-mono">Completed</div>
            <div className="text-lg font-bold text-emerald-400 font-mono">
              {completedCount} / {SQL_CHALLENGES.length}
            </div>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout: Challenges Selector & Active Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Challenge List (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          {/* Search & Filter */}
          <div className="space-y-2 p-3 rounded-xl bg-navy-900 border border-slate-800 text-xs">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search challenges..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-navy-950 border border-slate-800 rounded-lg pl-8 pr-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>

            <div className="flex items-center justify-between gap-2">
              <span className="text-slate-400 font-mono text-[11px]">Level:</span>
              <select
                value={difficultyFilter}
                onChange={e => setDifficultyFilter(e.target.value)}
                className="bg-navy-950 border border-slate-800 rounded px-2 py-1 text-slate-200 text-[11px] font-mono focus:outline-none"
              >
                <option value="All">All ({SQL_CHALLENGES.length})</option>
                <option value="Beginner">Beginner (8)</option>
                <option value="Intermediate">Intermediate (10)</option>
                <option value="Advanced">Advanced (8)</option>
              </select>
            </div>
          </div>

          {/* List of challenge items */}
          <div className="space-y-2 max-h-[750px] overflow-y-auto pr-1">
            {filteredChallenges.map((ch, idx) => {
              const isSelected = ch.id === activeChallenge.id;
              const isCompleted = !!progress[ch.id]?.completed;

              return (
                <button
                  key={ch.id}
                  onClick={() => setSelectedChallengeId(ch.id)}
                  className={`w-full p-3 rounded-xl border text-left transition-all flex items-start justify-between gap-3 cursor-pointer ${
                    isSelected
                      ? 'bg-cyan-950/40 border-cyan-400 shadow-md shadow-cyan-950/30'
                      : 'bg-navy-900/80 hover:bg-slate-800/60 border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono text-slate-400">#{idx + 1}</span>
                      <Badge variant={difficultyColors[ch.difficulty]} size="sm">
                        {ch.difficulty}
                      </Badge>
                      <span className="text-[10px] font-mono text-cyan-400">+{ch.score}p</span>
                    </div>
                    <div className="font-semibold text-xs text-slate-100 line-clamp-1">
                      {ch.title}
                    </div>
                    <div className="text-[10px] font-mono text-slate-400">
                      Table: {ch.dataset} | {ch.category}
                    </div>
                  </div>

                  <div className="shrink-0 pt-1">
                    {isCompleted ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Challenge Workspace (8 cols) */}
        <div className="lg:col-span-8">
          <ChallengeWorkspace
            challenge={activeChallenge}
            onCompleted={handleChallengeCompleted}
            onNextChallenge={handleNextChallenge}
          />
        </div>
      </div>
    </div>
  );
};
