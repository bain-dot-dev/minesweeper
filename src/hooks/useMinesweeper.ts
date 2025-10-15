/**
 * Main hook for Minesweeper game logic
 * Manages game state, board interactions, and game flow
 */

import { useCallback, useState } from 'react';
import {
  DifficultyConfig,
  DifficultyLevel,
  DIFFICULTY_CONFIGS,
  GameState,
} from '@/types/game';
import {
  checkWinCondition,
  countFlags,
  createEmptyBoard,
  placeMines,
  revealAllMines,
  revealCell,
  toggleFlag as toggleFlagLogic,
} from '@/lib/game-logic';
import { useTimer } from './useTimer';

interface UseMinesweeperReturn {
  gameState: GameState;
  timer: ReturnType<typeof useTimer>;
  handleCellClick: (x: number, y: number) => void;
  handleCellRightClick: (x: number, y: number) => void;
  resetGame: () => void;
  changeDifficulty: (difficulty: DifficultyLevel, customConfig?: DifficultyConfig) => void;
}

export function useMinesweeper(
  initialDifficulty: DifficultyLevel = 'easy'
): UseMinesweeperReturn {
  const timer = useTimer();

  // Initialize game state
  const [gameState, setGameState] = useState<GameState>(() => {
    const config = initialDifficulty === 'custom'
      ? DIFFICULTY_CONFIGS.easy
      : DIFFICULTY_CONFIGS[initialDifficulty];
    return {
      board: createEmptyBoard(config.width, config.height),
      status: 'idle',
      difficulty: initialDifficulty,
      config,
      flagCount: 0,
      revealedCount: 0,
      startTime: null,
      endTime: null,
      firstClick: true,
    };
  });

  // Handle cell left click (reveal)
  const handleCellClick = useCallback(
    (x: number, y: number) => {
      if (gameState.status === 'won' || gameState.status === 'lost') {
        return;
      }

      const cell = gameState.board[y][x];

      // Can't reveal flagged or already revealed cells
      if (cell.isFlagged || cell.isRevealed) {
        return;
      }

      setGameState((prev) => {
        let newBoard = prev.board;
        let newRevealedCount = prev.revealedCount;
        let newStatus = prev.status;
        let newFirstClick = prev.firstClick;

        // First click: place mines and start timer
        if (prev.firstClick) {
          newBoard = placeMines(prev.board, prev.config, { x, y });
          newFirstClick = false;
          timer.start();
          newStatus = 'playing';
        }

        const cell = newBoard[y][x];

        // Hit a mine - game over
        if (cell.isMine) {
          newBoard = revealAllMines(newBoard);
          newStatus = 'lost';
          timer.stop();
          return {
            ...prev,
            board: newBoard,
            status: newStatus,
            endTime: Date.now(),
            firstClick: newFirstClick,
          };
        }

        // Reveal cell(s)
        const result = revealCell(newBoard, x, y);
        newBoard = result.board;
        newRevealedCount += result.revealedCount;

        // Check win condition
        const totalCells = prev.config.width * prev.config.height;
        if (checkWinCondition(newBoard, totalCells, prev.config.mines, newRevealedCount)) {
          newStatus = 'won';
          timer.stop();
          return {
            ...prev,
            board: newBoard,
            status: newStatus,
            revealedCount: newRevealedCount,
            endTime: Date.now(),
            firstClick: newFirstClick,
          };
        }

        return {
          ...prev,
          board: newBoard,
          status: newStatus,
          revealedCount: newRevealedCount,
          firstClick: newFirstClick,
        };
      });
    },
    [gameState.status, gameState.board, timer]
  );

  // Handle cell right click (flag)
  const handleCellRightClick = useCallback(
    (x: number, y: number) => {
      if (gameState.status === 'won' || gameState.status === 'lost' || gameState.firstClick) {
        return;
      }

      const cell = gameState.board[y][x];

      // Can't flag revealed cells
      if (cell.isRevealed) {
        return;
      }

      setGameState((prev) => {
        const newBoard = toggleFlagLogic(prev.board, x, y);
        const newFlagCount = countFlags(newBoard);

        return {
          ...prev,
          board: newBoard,
          flagCount: newFlagCount,
        };
      });
    },
    [gameState.status, gameState.board, gameState.firstClick]
  );

  // Reset game
  const resetGame = useCallback(() => {
    const config =
      gameState.difficulty === 'custom'
        ? gameState.config
        : DIFFICULTY_CONFIGS[gameState.difficulty];

    setGameState({
      board: createEmptyBoard(config.width, config.height),
      status: 'idle',
      difficulty: gameState.difficulty,
      config,
      flagCount: 0,
      revealedCount: 0,
      startTime: null,
      endTime: null,
      firstClick: true,
    });

    timer.reset();
  }, [gameState.difficulty, gameState.config, timer]);

  // Change difficulty
  const changeDifficulty = useCallback(
    (difficulty: DifficultyLevel, customConfig?: DifficultyConfig) => {
      const config = difficulty === 'custom' && customConfig
        ? customConfig
        : DIFFICULTY_CONFIGS[difficulty as Exclude<DifficultyLevel, 'custom'>];

      setGameState({
        board: createEmptyBoard(config.width, config.height),
        status: 'idle',
        difficulty,
        config,
        flagCount: 0,
        revealedCount: 0,
        startTime: null,
        endTime: null,
        firstClick: true,
      });

      timer.reset();
    },
    [timer]
  );

  return {
    gameState,
    timer,
    handleCellClick,
    handleCellRightClick,
    resetGame,
    changeDifficulty,
  };
}
