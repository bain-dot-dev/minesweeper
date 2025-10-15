/**
 * Main Minesweeper game component
 * Integrates all game components and manages game flow
 */

'use client';

import { useState, useMemo } from 'react';
import { useMinesweeper } from '@/hooks/useMinesweeper';
import { GameBoard } from './GameBoard';
import { GameHeader } from './GameHeader';
import { GameOverModal } from './GameOverModal';
import { DifficultyLevel } from '@/types/game';

export function MinesweeperGame() {
  const [showModal, setShowModal] = useState(false);
  const {
    gameState,
    timer,
    handleCellClick,
    handleCellRightClick,
    resetGame,
    changeDifficulty,
  } = useMinesweeper('easy');

  // Calculate remaining mines
  const remainingMines = useMemo(() => {
    return gameState.config.mines - gameState.flagCount;
  }, [gameState.config.mines, gameState.flagCount]);

  // Show modal when game ends
  const handleGameEnd = () => {
    if (gameState.status === 'won' || gameState.status === 'lost') {
      setShowModal(true);
    }
  };

  // Watch for game end
  if ((gameState.status === 'won' || gameState.status === 'lost') && !showModal) {
    handleGameEnd();
  }

  const handleDifficultyChange = (difficulty: DifficultyLevel) => {
    changeDifficulty(difficulty);
    setShowModal(false);
  };

  const handleReset = () => {
    resetGame();
    setShowModal(false);
  };

  return (
    <div className="flex flex-col items-center gap-6 p-4 w-full max-w-7xl mx-auto">
      {/* Game Header */}
      <GameHeader
        elapsed={timer.elapsed}
        remainingMines={remainingMines}
        difficulty={gameState.difficulty}
        onDifficultyChange={handleDifficultyChange}
        onReset={handleReset}
      />

      {/* Game Board */}
      <div className="overflow-x-auto w-full flex justify-center">
        <GameBoard
          board={gameState.board}
          onCellClick={handleCellClick}
          onCellRightClick={handleCellRightClick}
          gameOver={gameState.status === 'won' || gameState.status === 'lost'}
        />
      </div>

      {/* Instructions */}
      <div className="bg-white rounded-lg p-4 shadow-md max-w-2xl w-full">
        <h3 className="font-semibold text-lg mb-2">How to Play</h3>
        <ul className="text-sm text-neutral-600 space-y-1">
          <li>• <strong>Click</strong> to reveal a cell</li>
          <li>• <strong>Right-click</strong> or <strong>long-press</strong> to flag a mine</li>
          <li>• Numbers show how many mines are adjacent</li>
          <li>• Clear all non-mine cells to win!</li>
        </ul>
      </div>

      {/* Game Over Modal */}
      <GameOverModal
        status={gameState.status}
        elapsed={timer.elapsed}
        onReset={handleReset}
        onClose={() => setShowModal(false)}
        isOpen={showModal}
      />
    </div>
  );
}
