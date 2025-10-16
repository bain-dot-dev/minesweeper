/**
 * Game board component - renders the grid of cells
 */

'use client';

import { CellState } from '@/types/game';
import { Cell } from './Cell';
import { cn } from '@/lib/utils';

interface GameBoardProps {
  board: CellState[][];
  onCellClick: (x: number, y: number) => void;
  onCellRightClick: (x: number, y: number) => void;
  gameOver: boolean;
  className?: string;
}

export function GameBoard({
  board,
  onCellClick,
  onCellRightClick,
  gameOver,
  className,
}: GameBoardProps) {
  const height = board.length;
  const width = board[0]?.length || 0;

  // Calculate responsive cell size
  const getCellSize = () => {
    if (width <= 8) return 'gap-1';
    if (width <= 16) return 'gap-0.5';
    return 'gap-px';
  };

  return (
    <div className={cn('mission-container rounded-lg', className)}>
      <div
        className={cn(
          'game-board inline-grid bg-neutral-800 p-2',
          getCellSize()
        )}
        style={{
          gridTemplateColumns: `repeat(${width}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${height}, minmax(0, 1fr))`,
        }}
      >
        {board.map((row) =>
          row.map((cell) => (
            <Cell
              key={`${cell.x}-${cell.y}`}
              cell={cell}
              onClick={onCellClick}
              onRightClick={onCellRightClick}
              onLongPress={onCellRightClick}
              gameOver={gameOver}
            />
          ))
        )}
      </div>
    </div>
  );
}
