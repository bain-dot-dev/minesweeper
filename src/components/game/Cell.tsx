/**
 * Individual cell component for the Minesweeper game
 * Handles display and interactions for each cell
 */

'use client';

import { CellState } from '@/types/game';
import { cn } from '@/lib/utils';
import { NUMBER_COLORS } from '@/lib/constants';
import { Bookmark } from 'iconoir-react';
import { BombIcon } from './BombIcon';
import { memo } from 'react';

interface CellProps {
  cell: CellState;
  onClick: (x: number, y: number) => void;
  onRightClick: (x: number, y: number) => void;
  onLongPress?: (x: number, y: number) => void;
  gameOver: boolean;
}

/**
 * Cell component - Memoized for performance
 */
export const Cell = memo(function Cell({
  cell,
  onClick,
  onRightClick,
  onLongPress,
  gameOver,
}: CellProps) {
  const { x, y, isRevealed, isFlagged, isMine, adjacentMines } = cell;

  // Determine threat level based on adjacent mines
  const getThreatLevel = (): string => {
    if (isRevealed || isMine) return '';
    if (adjacentMines === 0) return 'safe';
    if (adjacentMines <= 2) return 'low';
    if (adjacentMines <= 4) return 'medium';
    if (adjacentMines <= 6) return 'high';
    return 'critical';
  };

  const threatLevel = getThreatLevel();

  // Handle click events
  const handleClick = () => {
    if (!gameOver && !isRevealed && !isFlagged) {
      onClick(x, y);
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!gameOver && !isRevealed) {
      onRightClick(x, y);
    }
  };

  // Touch handlers for mobile
  const handleTouchStart = () => {
    const touchStartTime = Date.now();
    const touchTimer = setTimeout(() => {
      if (onLongPress && !gameOver && !isRevealed) {
        onLongPress(x, y);
      }
    }, 500); // 500ms long press

    const handleTouchEnd = () => {
      clearTimeout(touchTimer);
      if (Date.now() - touchStartTime < 500) {
        handleClick();
      }
      document.removeEventListener('touchend', handleTouchEnd);
    };

    document.addEventListener('touchend', handleTouchEnd);
  };

  // Cell content rendering
  const renderContent = () => {
    if (!isRevealed && isFlagged) {
      return <Bookmark className="w-4 h-4 text-warning animate-flag-place" />;
    }

    if (!isRevealed) {
      return null;
    }

    if (isMine) {
      return <BombIcon className="w-6 h-6" isExploding={gameOver} />;
    }

    if (adjacentMines > 0) {
      return (
        <span
          className="font-bold text-base leading-none"
          style={{
            color: NUMBER_COLORS[adjacentMines],
            fontFamily: "'Share Tech Mono', monospace",
            textShadow: `0 0 3px ${NUMBER_COLORS[adjacentMines]}40`
          }}
        >
          {adjacentMines}
        </span>
      );
    }

    return null;
  };

  return (
    <button
      className={cn(
        'mission-cell aspect-square flex items-center justify-center transition-all duration-150',
        'focus:outline-none focus:ring-2 focus:ring-primary',
        'min-w-[32px] min-h-[32px]',
        isRevealed && 'revealed',
        isFlagged && !isRevealed && 'flagged',
        isRevealed && isMine && gameOver && 'exploded',
        !isRevealed && !isFlagged && threatLevel && `threat-${threatLevel}`
      )}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      onTouchStart={handleTouchStart}
      aria-label={`Cell ${x}, ${y}${threatLevel ? `, Threat: ${threatLevel}` : ''}`}
      disabled={gameOver || isRevealed}
    >
      {/* Threat Level Badge */}
      {!isRevealed && !isFlagged && threatLevel && adjacentMines > 0 && (
        <div className={cn('threat-badge', threatLevel)} />
      )}
      {renderContent()}
    </button>
  );
});
