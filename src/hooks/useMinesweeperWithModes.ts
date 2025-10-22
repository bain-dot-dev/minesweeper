/**
 * Enhanced Minesweeper Hook with Game Mode Support
 * Extends the original useMinesweeper with mode-specific features
 */

import { useCallback, useState, useEffect, useRef } from "react";
import { GameState } from "@/types/game";
import { GameMode } from "@/types/gameMode";
import {
  createEmptyBoard,
  placeMines,
  revealAllMines,
  revealCell,
  toggleFlag as toggleFlagLogic,
  countFlags,
} from "@/lib/game-logic";
import { useTimer } from "./useTimer";
import { useCellAudio } from "./useAudio";
import { createGameModeManager, GameModeManager } from "@/lib/gameModeManager";
import {
  calculateScore,
  calculateAccuracy,
  isPerfectGame,
  calculateActionScore,
} from "@/lib/scoringSystem";
import { getDefaultGameMode } from "@/lib/gameModeRegistry";

interface UseMinesweeperWithModesReturn {
  gameState: GameState;
  timer: ReturnType<typeof useTimer>;
  modeManager: GameModeManager;
  handleCellClick: (x: number, y: number) => void;
  handleCellRightClick: (x: number, y: number) => void;
  resetGame: () => void;
  changeMode: (mode: GameMode) => void;
  nextLevel: () => void;
  useContinue: () => void;
}

export function useMinesweeperWithModes(
  initialMode?: GameMode
): UseMinesweeperWithModesReturn {
  const mode = initialMode || getDefaultGameMode();
  const [modeManager, setModeManager] = useState<GameModeManager>(() =>
    createGameModeManager(mode)
  );

  const timer = useTimer();
  const { playCellRevealSound, playCellFlagSound } = useCellAudio();

  // Track time remaining for timed modes
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize game state
  const [gameState, setGameState] = useState<GameState>(() => {
    const config = modeManager.getBoardConfig(1);
    return modeManager.initializeGameState({
      board: createEmptyBoard(config.width, config.height),
      streak: 0,
    });
  });

  // Track time remaining for timed modes
  useEffect(() => {
    // Clear any existing interval first
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    if (
      gameState.status === "playing" &&
      modeManager.isTimedMode() &&
      gameState.timeRemaining !== null
    ) {
      console.log("⏱️ Starting countdown timer:", gameState.timeRemaining);

      timerIntervalRef.current = setInterval(() => {
        setGameState((prev) => {
          if (prev.timeRemaining === null) return prev;

          const newTimeRemaining = Math.max(0, prev.timeRemaining - 1);

          // Check if time ran out
          if (newTimeRemaining === 0 && prev.status === "playing") {
            console.log("⏰ TIME'S UP! Game Over!");
            timer.stop();
            return {
              ...prev,
              timeRemaining: 0,
              status: "lost",
              endTime: Date.now(),
            };
          }

          // Log every 10 seconds for debugging
          if (newTimeRemaining % 10 === 0) {
            console.log("⏱️ Time remaining:", newTimeRemaining);
          }

          return {
            ...prev,
            timeRemaining: newTimeRemaining,
          };
        });
      }, 1000);

      return () => {
        if (timerIntervalRef.current) {
          clearInterval(timerIntervalRef.current);
          timerIntervalRef.current = null;
        }
      };
    } else if (gameState.status !== "playing") {
      // Game is not playing, clear the interval
      console.log("⏱️ Game not playing, clearing countdown timer");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState.status, modeManager]);

  // Update when initialMode changes (for difficulty changes)
  useEffect(() => {
    if (initialMode && initialMode.id !== modeManager.getModeId()) {
      console.log("🔄 Mode changed externally, updating...", {
        from: modeManager.getModeId(),
        to: initialMode.id,
        boardSize: initialMode.config.boardSize,
        mineCount: initialMode.config.mineCount,
      });

      const newModeManager = createGameModeManager(initialMode);
      setModeManager(newModeManager);

      const config = newModeManager.getBoardConfig(1);
      console.log("📐 New board config:", config);

      const newState = newModeManager.initializeGameState({
        board: createEmptyBoard(config.width, config.height),
        streak: 0,
      });
      setGameState(newState);

      timer.reset();

      // Clear timer interval
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialMode?.id]);

  // Handle cell left click (reveal)
  const handleCellClick = useCallback(
    (x: number, y: number) => {
      if (gameState.status === "won" || gameState.status === "lost") {
        return;
      }

      const cell = gameState.board[y][x];

      // Can't reveal flagged or already revealed cells
      if (cell.isFlagged || cell.isRevealed) {
        return;
      }

      // Check if cell should be revealed (for blind mode)
      if (!modeManager.shouldRevealCell(cell, gameState)) {
        return;
      }

      setGameState((prev) => {
        let newBoard = prev.board;
        let newRevealedCount = prev.revealedCount;
        let newStatus = prev.status;
        let newFirstClick = prev.firstClick;
        const newMoveCount = prev.moveCount + 1;
        let newScore = prev.score;

        // First click: place mines and start timer
        if (prev.firstClick && modeManager.isFirstClickSafe()) {
          newBoard = placeMines(prev.board, prev.config, { x, y });
          newFirstClick = false;
          timer.start();
          newStatus = "playing";
        }

        const cellToReveal = newBoard[y][x];

        // Hit a mine - check lose condition
        if (cellToReveal.isMine) {
          const hitMine = true;
          const shouldLose = modeManager.checkLoseCondition(prev, hitMine);

          if (shouldLose) {
            newBoard = revealAllMines(newBoard);
            newStatus = "lost";
            timer.stop();

            // Play explosion sound
            playCellRevealSound(cellToReveal);

            return {
              ...prev,
              board: newBoard,
              status: newStatus,
              endTime: Date.now(),
              firstClick: newFirstClick,
              moveCount: newMoveCount,
            };
          }
        }

        // Reveal cell(s)
        const result = revealCell(newBoard, x, y);
        newBoard = result.board;
        newRevealedCount += result.revealedCount;

        // Calculate action score
        const actionScore = calculateActionScore(
          "reveal",
          {
            cellsRevealed: result.revealedCount,
            adjacentMines: cellToReveal.adjacentMines,
          },
          mode.scoring
        );
        newScore += actionScore;

        // Play reveal sound with context
        const totalCells = prev.config.width * prev.config.height;
        playCellRevealSound(cellToReveal, {
          nearBombs: cellToReveal.adjacentMines,
          revealedCells: newRevealedCount,
          totalCells: totalCells,
        });

        // Check win condition
        const updatedState: GameState = {
          ...prev,
          board: newBoard,
          status: newStatus,
          revealedCount: newRevealedCount,
          firstClick: newFirstClick,
          moveCount: newMoveCount,
          score: newScore,
        };

        if (modeManager.checkWinCondition(updatedState)) {
          newStatus = "won";
          timer.stop();

          // Calculate final score
          const timeElapsed = prev.startTime ? Date.now() - prev.startTime : 0;
          const accuracy = calculateAccuracy(updatedState);
          const perfectGame = isPerfectGame(updatedState);

          const finalScore = calculateScore({
            gameState: updatedState,
            gameMode: mode,
            timeElapsed,
            accuracy,
            perfectGame,
          });

          return {
            ...updatedState,
            status: newStatus,
            endTime: Date.now(),
            score: finalScore,
            streak: prev.streak + 1,
          };
        }

        // Check move limit
        if (modeManager.hasMoveLimit() && mode.config.moveLimit) {
          if (newMoveCount >= mode.config.moveLimit) {
            newStatus = "lost";
            timer.stop();
            return {
              ...updatedState,
              status: newStatus,
              endTime: Date.now(),
            };
          }
        }

        return updatedState;
      });
    },
    [
      gameState,
      timer,
      playCellRevealSound,
      modeManager,
      mode,
    ]
  );

  // Handle cell right click (flag)
  const handleCellRightClick = useCallback(
    (x: number, y: number) => {
      if (
        gameState.status === "won" ||
        gameState.status === "lost" ||
        gameState.firstClick
      ) {
        return;
      }

      // Check if flags are allowed
      if (!modeManager.areFlagsAllowed()) {
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

        // Play flag/unflag sound
        const wasFlagged = prev.board[y][x].isFlagged;
        playCellFlagSound(!wasFlagged);

        // Calculate flag score
        const actionScore = calculateActionScore(
          wasFlagged ? "unflag" : "flag",
          {},
          mode.scoring
        );

        return {
          ...prev,
          board: newBoard,
          flagCount: newFlagCount,
          score: prev.score + actionScore,
        };
      });
    },
    [
      gameState.status,
      gameState.board,
      gameState.firstClick,
      playCellFlagSound,
      modeManager,
      mode,
    ]
  );

  // Reset game
  const resetGame = useCallback(() => {
    const config = modeManager.getBoardConfig(gameState.level);

    setGameState({
      ...modeManager.initializeGameState({
        board: createEmptyBoard(config.width, config.height),
        streak: 0, // Reset streak on manual reset
      }),
    });

    timer.reset();

    // Clear timer interval
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  }, [modeManager, gameState.level, timer]);

  // Change game mode
  const changeMode = useCallback(
    (newMode: GameMode) => {
      const newModeManager = createGameModeManager(newMode);
      setModeManager(newModeManager);

      const config = newModeManager.getBoardConfig(1);
      setGameState({
        ...newModeManager.initializeGameState({
          board: createEmptyBoard(config.width, config.height),
          streak: gameState.streak, // Preserve streak across modes
        }),
      });

      timer.reset();

      // Clear timer interval
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    },
    [gameState.streak, timer]
  );

  // Next level (for progressive modes)
  const nextLevel = useCallback(() => {
    if (!modeManager.isProgressiveMode()) {
      console.warn("nextLevel called on non-progressive mode");
      return;
    }

    const nextLevelNum = gameState.level + 1;
    const { config, timeLimit } = modeManager.getNextLevelConfig(
      gameState.level
    );

    setGameState({
      ...modeManager.initializeGameState({
        board: createEmptyBoard(config.width, config.height),
        streak: gameState.streak, // Preserve streak
      }),
      level: nextLevelNum,
      timeRemaining: timeLimit,
      score: gameState.score, // Preserve score
      continueCount: gameState.continueCount, // Preserve continue count
      continueTimestamps: gameState.continueTimestamps, // Preserve timestamps
    });

    timer.reset();
  }, [gameState, modeManager, timer]);

  // Use continue
  const useContinue = useCallback(() => {
    if (!modeManager.canContinue()) {
      console.warn("Continue not allowed for this mode");
      return;
    }

    const continueUpdates = modeManager.applyContinue(gameState);

    setGameState((prev) => ({
      ...prev,
      ...continueUpdates,
    }));

    // Restart timer if needed
    if (gameState.status === "lost") {
      timer.start();
    }
  }, [gameState, modeManager, timer]);

  return {
    gameState,
    timer,
    modeManager,
    handleCellClick,
    handleCellRightClick,
    resetGame,
    changeMode,
    nextLevel,
    useContinue,
  };
}
