/**
 * Game header component - displays timer, mine counter, and difficulty selector
 */

'use client';

import { DifficultyLevel } from '@/types/game';
import { formatTime, cn } from '@/lib/utils';
import { Timer, Bookmark, Sparks } from 'iconoir-react';

interface GameHeaderProps {
  elapsed: number;
  remainingMines: number;
  difficulty: DifficultyLevel;
  onDifficultyChange: (difficulty: DifficultyLevel) => void;
  onReset: () => void;
  className?: string;
}

export function GameHeader({
  elapsed,
  remainingMines,
  difficulty,
  onDifficultyChange,
  onReset,
  className,
}: GameHeaderProps) {
  const difficulties: DifficultyLevel[] = ['easy', 'medium', 'hard'];
  const isCritical = remainingMines < 0 || elapsed > 600000; // 10 minutes

  return (
    <div className={cn('flex flex-col gap-4 w-full max-w-4xl', className)}>
      {/* Mission HUD */}
      <div className="mission-hud grid grid-cols-3 items-center gap-6">
        {/* Timer Display */}
        <div className="flex flex-col items-start gap-1">
          <span className="text-xs text-mi-cyber-green uppercase tracking-wider opacity-70">
            Mission Time
          </span>
          <div className={cn(
            'mission-timer flex items-center gap-2',
            isCritical && 'critical'
          )}>
            <Timer className="w-5 h-5" />
            <span className="text-2xl font-mono font-bold tabular-nums">
              {formatTime(elapsed)}
            </span>
          </div>
        </div>

        {/* Reset/Mission Control Button */}
        <button
          onClick={onReset}
          className="flex flex-col items-center justify-center gap-1 p-3 bg-gradient-to-br from-mi-red to-mi-orange hover:from-mi-orange hover:to-mi-yellow rounded-lg transition-all duration-200 active:scale-95 shadow-lg group"
          aria-label="Reset mission"
        >
          <Sparks className="w-8 h-8 text-white group-hover:animate-pulse" />
          <span className="text-xs font-bold text-white uppercase tracking-wide">
            New Mission
          </span>
        </button>

        {/* Bomb Counter */}
        <div className="flex flex-col items-end gap-1">
          <span className="text-xs text-mi-yellow uppercase tracking-wider opacity-70">
            Threats Remaining
          </span>
          <div className="bomb-counter flex items-center gap-2">
            <Bookmark className="w-5 h-5" />
            <span className="count text-2xl font-bold tabular-nums">
              {remainingMines.toString().padStart(2, '0')}
            </span>
          </div>
        </div>
      </div>

      {/* Mission Difficulty Selector */}
      <div className="flex gap-2 bg-gradient-to-r from-mi-black/90 to-mi-black/70 rounded-lg p-2 border border-mi-electric-blue/30">
        <span className="flex items-center px-3 text-xs font-bold text-mi-electric-blue uppercase tracking-wider">
          Difficulty:
        </span>
        {difficulties.map((diff) => (
          <button
            key={diff}
            onClick={() => onDifficultyChange(diff)}
            className={cn(
              'flex-1 py-2 px-4 rounded-md font-bold text-sm uppercase tracking-wide transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-mi-electric-blue',
              difficulty === diff
                ? 'bg-gradient-to-r from-mi-red to-mi-orange text-white shadow-lg scale-105'
                : 'bg-mi-black/50 text-mi-cyber-green hover:bg-mi-black hover:text-mi-yellow border border-mi-cyber-green/30'
            )}
          >
            {diff}
          </button>
        ))}
      </div>
    </div>
  );
}
