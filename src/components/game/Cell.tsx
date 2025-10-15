/**
 * Individual cell component for the Minesweeper game
 * Handles display and interactions for each cell
 */

'use client';

import { CellState } from '@/types/game';
import { cn } from '@/lib/utils';
import { NUMBER_COLORS } from '@/lib/constants';
import { Bookmark, Xmark } from 'iconoir-react';
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
      return <Bookmark className="w-4 h-4 text-warning" />;
    }

    if (!isRevealed) {
      return null;
    }

    if (isMine) {
      return <Xmark className="w-5 h-5 text-danger" />;
    }

    if (adjacentMines > 0) {
      return (
        <span
          className="font-bold text-sm"
          style={{ color: NUMBER_COLORS[adjacentMines] }}
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
        'cell aspect-square flex items-center justify-center border transition-all duration-150',
        'focus:outline-none focus:ring-2 focus:ring-primary',
        'min-w-[32px] min-h-[32px]',
        !isRevealed && !gameOver && 'bg-neutral-100 hover:bg-neutral-200 shadow-sm',
        !isRevealed && !gameOver && 'active:scale-95',
        isRevealed && !isMine && 'bg-white',
        isRevealed && isMine && 'bg-danger/10',
        isFlagged && 'bg-warning/20',
        'animate-cell-reveal'
      )}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      onTouchStart={handleTouchStart}
      aria-label={`Cell ${x}, ${y}`}
      disabled={gameOver || isRevealed}
    >
      {renderContent()}
    </button>
  );
});
