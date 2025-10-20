/**
 * Main Minesweeper game component
 * Integrates all game components and manages game flow
 */

'use client';

import { useState, useMemo, useEffect } from 'react';
import { useMinesweeper } from '@/hooks/useMinesweeper';
import { GameBoard } from './GameBoard';
import { GameHeader } from './GameHeader';
import { GameOverModal } from './GameOverModal';
import { DifficultyLevel } from '@/types/game';
import { useGameStateAudio, useDynamicMusic, useUISounds } from '@/hooks/useAudio';
import { AudioSettings, CompactAudioControls } from '@/components/audio/AudioSettings';
import { AudioLoadingIndicator } from '@/components/audio/AudioLoadingIndicator';

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

  // Audio hooks
  const { playVictorySound, playDefeatSound, startGameplayMusic, playMenuMusic } = useGameStateAudio();
  const { playDifficultyChange } = useUISounds();

  // Dynamic music based on game state
  useDynamicMusic({
    status: gameState.status,
    flagCount: gameState.flagCount,
    mineCount: gameState.config.mines,
    revealedCount: gameState.revealedCount,
    totalCells: gameState.config.width * gameState.config.height,
  });

  // Calculate remaining mines
  const remainingMines = useMemo(() => {
    return gameState.config.mines - gameState.flagCount;
  }, [gameState.config.mines, gameState.flagCount]);

  // Play menu music after first interaction (prevents blocking)
  useEffect(() => {
    // Don't play music on mount - wait for user to start playing
    // Music will start when game begins
  }, [playMenuMusic]);

  // Handle game status changes
  useEffect(() => {
    if (gameState.status === 'won') {
      playVictorySound();
    } else if (gameState.status === 'lost') {
      playDefeatSound();
    } else if (gameState.status === 'playing' && !gameState.firstClick) {
      // Start gameplay music when first move is made
      startGameplayMusic();
    }
  }, [gameState.status, gameState.firstClick, playVictorySound, playDefeatSound, startGameplayMusic]);

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
    playDifficultyChange();
  };

  const handleReset = () => {
    resetGame();
    setShowModal(false);
    playMenuMusic();
  };

  return (
    <div className="flex flex-col items-center gap-6 p-4 w-full max-w-7xl mx-auto">
      {/* Audio Loading Indicator */}
      <AudioLoadingIndicator />

      {/* Audio Controls */}
      <div className="fixed top-4 right-4 z-50 flex gap-2">
        <CompactAudioControls />
        <AudioSettings />
      </div>

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

      {/* Mission Briefing */}
      <div className="bg-gradient-to-br from-mi-black/95 to-mi-black/80 rounded-lg p-6 shadow-2xl max-w-2xl w-full border border-mi-red/30">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-2 h-2 bg-mi-red rounded-full animate-pulse" />
          <h3
            className="font-bold text-xl uppercase tracking-wide text-mi-cyber-green"
            style={{ fontFamily: "'Bebas Neue', Impact, sans-serif" }}
          >
            Mission Briefing
          </h3>
        </div>
        <p className="text-sm text-mi-yellow mb-4 italic">
          &ldquo;Agent, your mission is to locate and defuse all explosive devices. Proceed with extreme caution...&rdquo;
        </p>
        <ul className="text-sm text-mi-electric-blue space-y-2">
          <li className="flex items-start gap-2">
            <span className="text-mi-cyber-green">▸</span>
            <span><strong className="text-white">Click</strong> to reveal sectors</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-mi-cyber-green">▸</span>
            <span><strong className="text-white">Right-click</strong> or <strong className="text-white">long-press</strong> to mark threats</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-mi-cyber-green">▸</span>
            <span>Numbers indicate <strong className="text-white">proximity to explosives</strong></span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-mi-cyber-green">▸</span>
            <span><strong className="text-white">Neutralize all threats</strong> to complete the mission!</span>
          </li>
        </ul>
        <div className="mt-4 pt-4 border-t border-mi-red/20 text-center">
          <p className="text-xs text-mi-orange/70 italic">
            This message will self-destruct... just kidding. Good luck, Agent.
          </p>
        </div>
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
