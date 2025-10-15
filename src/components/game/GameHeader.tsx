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

  return (
    <div className={cn('flex flex-col gap-4 w-full max-w-2xl', className)}>
      {/* Stats Display */}
      <div className="flex items-center justify-between gap-4 bg-white rounded-lg p-4 shadow-md">
        {/* Timer */}
        <div className="flex items-center gap-2">
          <Timer className="w-5 h-5 text-primary" />
          <span className="text-lg font-mono font-bold">{formatTime(elapsed)}</span>
        </div>

        {/* Reset Button */}
        <button
          onClick={onReset}
          className="flex items-center justify-center w-12 h-12 bg-primary hover:bg-primary/90 text-white rounded-full transition-all duration-200 active:scale-95 shadow-md"
          aria-label="Reset game"
        >
          <Sparks className="w-6 h-6" />
        </button>

        {/* Mine Counter */}
        <div className="flex items-center gap-2">
          <Bookmark className="w-5 h-5 text-warning" />
          <span className="text-lg font-mono font-bold">{remainingMines}</span>
        </div>
      </div>

      {/* Difficulty Selector */}
      <div className="flex gap-2 bg-white rounded-lg p-2 shadow-md">
        {difficulties.map((diff) => (
          <button
            key={diff}
            onClick={() => onDifficultyChange(diff)}
            className={cn(
              'flex-1 py-2 px-4 rounded-md font-medium text-sm transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-primary',
              difficulty === diff
                ? 'bg-primary text-white shadow-md'
                : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
            )}
          >
            {diff.charAt(0).toUpperCase() + diff.slice(1)}
          </button>
        ))}
      </div>
    </div>
  );
}
