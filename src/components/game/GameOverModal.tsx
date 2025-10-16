/**
 * Game over modal - displays win/lose state and game statistics
 */

'use client';

import { GameStatus } from '@/types/game';
import { formatTime, cn } from '@/lib/utils';
import { Trophy, Xmark, Sparks } from 'iconoir-react';

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
    <div className={cn(
      "fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md animate-fade-in",
      isWin ? "victory-overlay" : "defeat-overlay"
    )}>
      <div
        className={cn(
          'relative w-full max-w-lg rounded-2xl shadow-2xl p-8 animate-scale-in',
          'bg-gradient-to-br from-mi-black/95 to-mi-black/90',
          'border-2',
          isWin ? 'border-mi-cyber-green' : 'border-mi-red'
        )}
      >
        {/* Scanning effect line */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-mi-cyber-green animate-scan" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className={cn(
            "absolute top-4 right-4 p-2 rounded-lg transition-all duration-200",
            "hover:bg-white/10 active:scale-95",
            isWin ? "text-mi-cyber-green" : "text-mi-red"
          )}
          aria-label="Close modal"
        >
          <Xmark className="w-6 h-6" />
        </button>

        {/* Icon */}
        <div
          className={cn(
            'flex items-center justify-center w-24 h-24 rounded-full mx-auto mb-6',
            'border-4 animate-pulse',
            isWin
              ? 'bg-mi-cyber-green/20 border-mi-cyber-green'
              : 'bg-mi-red/20 border-mi-red'
          )}
        >
          {isWin ? (
            <Trophy className="w-12 h-12 text-mi-cyber-green drop-shadow-[0_0_10px_rgba(16,249,112,0.5)]" />
          ) : (
            <Xmark className="w-12 h-12 text-mi-red drop-shadow-[0_0_10px_rgba(220,38,38,0.5)]" />
          )}
        </div>

        {/* Title */}
        <h2
          className={cn(
            'text-4xl font-bold text-center mb-3 uppercase tracking-wider',
            'drop-shadow-[0_0_20px_currentColor]',
            isWin ? 'text-mi-cyber-green' : 'text-mi-red'
          )}
          style={{ fontFamily: "'Bebas Neue', Impact, sans-serif" }}
        >
          {isWin ? 'Mission Accomplished' : 'Mission Failed'}
        </h2>

        {/* Subtitle */}
        <p
          className={cn(
            "text-center mb-8 text-sm uppercase tracking-widest",
            isWin ? "text-mi-yellow" : "text-mi-orange"
          )}
        >
          {isWin
            ? 'All threats have been neutralized'
            : 'Agent down. Requesting immediate extraction'}
        </p>

        {/* Stats Display */}
        <div className="bg-mi-black/50 rounded-lg p-6 mb-8 border border-mi-electric-blue/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-mi-electric-blue text-sm uppercase tracking-wide">
              Mission Duration:
            </span>
            <span
              className="font-mono font-bold text-2xl text-mi-cyber-green tabular-nums"
              style={{ textShadow: '0 0 10px rgba(16,249,112,0.5)' }}
            >
              {formatTime(elapsed)}
            </span>
          </div>
          {isWin && (
            <div className="text-center text-xs text-mi-yellow/70 mt-3 italic">
              &ldquo;This message will self-destruct in 5 seconds...&rdquo;
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          {/* <button
            onClick={onClose}
            className={cn(
              "flex-1 py-3 px-6 rounded-lg font-bold uppercase tracking-wide",
              "transition-all duration-200 active:scale-95",
              "border-2",
              isWin
                ? "border-mi-electric-blue text-mi-electric-blue hover:bg-mi-electric-blue/10"
                : "border-mi-orange text-mi-orange hover:bg-mi-orange/10"
            )}
          >
            Dismiss
          </button> */}
          <button
            onClick={() => {
              onReset();
              onClose();
            }}
            className={cn(
              "flex-1 py-3 px-6 rounded-lg font-bold uppercase tracking-wide",
              "transition-all duration-200 active:scale-95 shadow-lg",
              "bg-gradient-to-r",
              isWin
                ? "from-mi-cyber-green to-mi-electric-blue text-mi-black hover:shadow-mi-cyber-green/50"
                : "from-mi-red to-mi-orange text-white hover:shadow-mi-red/50",
              "flex items-center justify-center gap-2"
            )}
          >
            <Sparks className="w-5 h-5" />
            New Mission
          </button>
        </div>
      </div>
    </div>
  );
}
