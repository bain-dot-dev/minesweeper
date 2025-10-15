/**
 * Game over modal - displays win/lose state and game statistics
 */

'use client';

import { GameStatus } from '@/types/game';
import { formatTime, cn } from '@/lib/utils';
import { Trophy, Xmark, Sparks } from 'iconoir-react';
import { Button } from '@worldcoin/mini-apps-ui-kit-react';

interface GameOverModalProps {
  status: GameStatus;
  elapsed: number;
  onReset: () => void;
  onClose: () => void;
  isOpen: boolean;
}

export function GameOverModal({
  status,
  elapsed,
  onReset,
  onClose,
  isOpen,
}: GameOverModalProps) {
  if (!isOpen || (status !== 'won' && status !== 'lost')) {
    return null;
  }

  const isWin = status === 'won';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div
        className={cn(
          'relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6',
          'animate-scale-in'
        )}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-neutral-100 transition-colors"
          aria-label="Close modal"
        >
          <Xmark className="w-5 h-5" />
        </button>

        {/* Icon */}
        <div
          className={cn(
            'flex items-center justify-center w-20 h-20 rounded-full mx-auto mb-4',
            isWin ? 'bg-success/10' : 'bg-danger/10'
          )}
        >
          {isWin ? (
            <Trophy className="w-10 h-10 text-success" />
          ) : (
            <Xmark className="w-10 h-10 text-danger" />
          )}
        </div>

        {/* Title */}
        <h2
          className={cn(
            'text-3xl font-bold text-center mb-2',
            isWin ? 'text-success' : 'text-danger'
          )}
        >
          {isWin ? 'Victory!' : 'Game Over'}
        </h2>

        {/* Message */}
        <p className="text-center text-neutral-600 mb-6">
          {isWin
            ? 'Congratulations! You successfully cleared all the mines!'
            : 'Better luck next time! Try again to beat your record.'}
        </p>

        {/* Stats */}
        <div className="bg-neutral-50 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-neutral-600">Time:</span>
            <span className="font-mono font-bold text-lg">{formatTime(elapsed)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            onClick={onClose}
            variant="secondary"
            size="lg"
            className="flex-1"
          >
            Close
          </Button>
          <Button
            onClick={() => {
              onReset();
              onClose();
            }}
            variant="primary"
            size="lg"
            className="flex-1"
          >
            <Sparks className="w-5 h-5 mr-2" />
            Play Again
          </Button>
        </div>
      </div>
    </div>
  );
}
