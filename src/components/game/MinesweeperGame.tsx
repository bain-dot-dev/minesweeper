/**
 * Main Minesweeper game component
 * Integrates all game components and manages game flow
 */

"use client";

import { useState, useMemo, useEffect } from "react";
import { useMinesweeper } from "@/hooks/useMinesweeper";
import { useMinesweeperWithModes } from "@/hooks/useMinesweeperWithModes";
import { GameBoard } from "./GameBoard";
import { GameHeader } from "./GameHeader";
import { GameOverModal } from "./GameOverModal";
import { GameModeSelector } from "./GameModeSelector";
import { ContinueModal } from "./ContinueModal";
import { DifficultyLevel } from "@/types/game";
import { GameMode } from "@/types/gameMode";
import { CLASSIC_MODE } from "@/config/gameModes";
import {
  useGameAudio,
  useGameStateAudio,
  useDynamicMusic,
  useUISounds,
} from "@/hooks/useAudio";
import {
  AudioSettings,
  CompactAudioControls,
} from "@/components/audio/AudioSettings";
import { AudioLoadingIndicator } from "@/components/audio/AudioLoadingIndicator";
import { WorldCoinAudioUnlock } from "@/components/audio/WorldCoinAudioUnlock";
import { AudioDebugPanel } from "@/components/audio/AudioDebugPanel";
import { GameStartModal } from "./GameStartModal";
import { useGameSystems } from "@/lib/gameSystems";

export function MinesweeperGame() {
  const [showModal, setShowModal] = useState(false);
  const [showStartModal, setShowStartModal] = useState(false);
  const [showModeSelector, setShowModeSelector] = useState(false);
  const [showContinueModal, setShowContinueModal] = useState(false);
  const [currentMode, setCurrentMode] = useState<GameMode>(CLASSIC_MODE);
  const [useGameModes, setUseGameModes] = useState(false);

  // Game systems integration
  const gameSystems = useGameSystems();

  // Initialize game systems on component mount
  useEffect(() => {
    gameSystems.initialize();
  }, [gameSystems]);

  // Legacy hook for backward compatibility
  const legacyGame = useMinesweeper("easy");

  // New game mode hook
  const {
    gameState,
    timer,
    modeManager,
    handleCellClick,
    handleCellRightClick,
    resetGame,
    useContinue: continueGame,
  } = useMinesweeperWithModes(currentMode);

  // Initialize main audio system
  const { audioManager } = useGameAudio();

  // Debug audio initialization
  useEffect(() => {
    console.log("🎵 Audio system initialized:", {
      initialized: audioManager.state.initialized,
      loading: audioManager.state.loading,
      error: audioManager.state.error,
      loadedTracks: audioManager.state.loadedTracks.size,
      unlocked: audioManager.isAudioUnlocked(),
      isWorldCoinApp: audioManager.isWorldCoinAppEnvironment(),
    });

    // Test audio immediately
    const testAudio = () => {
      console.log("🔊 Testing audio immediately...");
      audioManager.playSound("menu_click", { volume: 0.5 });
    };

    // Test after a short delay
    setTimeout(testAudio, 1000);
  }, [audioManager]);

  // Audio hooks
  const {
    playVictorySound,
    playDefeatSound,
    startGameplayMusic,
    playMenuMusic,
  } = useGameStateAudio();
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

  // Handle mode selection
  const handleModeSelect = (mode: GameMode) => {
    console.log("🎮 Mode selected:", mode.id);
    setCurrentMode(mode);
    setShowModeSelector(false);
    setUseGameModes(true);

    // Track mode selection in game systems
    gameSystems.analytics.trackModeSelection(mode);
  };

  // Handle continue
  const handleContinue = () => {
    console.log("💳 Using continue for mode:", currentMode.id);
    if (continueGame) {
      continueGame();

      // Track continue usage in game systems
      const cost =
        gameSystems.socialFeatures.getLeaderboardStats(currentMode.id)
          ?.userScore || 0;
      gameSystems.onContinue(currentMode, gameState, cost);
    }
    setShowContinueModal(false);
  };

  // Handle quit
  const handleQuit = () => {
    console.log("🚪 Quitting game");
    setShowContinueModal(false);
    setShowModal(true);
  };

  // Check if this is the first visit or if audio is not unlocked and show start modal
  useEffect(() => {
    const checkModalVisibility = () => {
      const hasSeenBefore = localStorage.getItem("minesweeper-game-start-seen");
      const isAudioUnlocked = audioManager.isAudioUnlocked();

      // Show modal if first visit OR if audio is not unlocked
      if (!hasSeenBefore || !isAudioUnlocked) {
        setShowStartModal(true);
      } else {
        setShowStartModal(false);
      }
    };

    // Check immediately
    checkModalVisibility();

    // Check periodically to handle audio unlock/lock changes
    const interval = setInterval(checkModalVisibility, 1000);

    return () => clearInterval(interval);
  }, [audioManager]);

  // Play menu music after first interaction (prevents blocking)
  useEffect(() => {
    // Don't play music on mount - wait for user to start playing
    // Music will start when game begins
  }, [playMenuMusic]);

  // Move mobile audio controls to header on mobile
  useEffect(() => {
    const moveMobileAudioControls = () => {
      const mobileControls = document.getElementById(
        "mobile-audio-controls-container"
      );
      const targetContainer = document.getElementById("mobile-audio-controls");

      if (mobileControls && targetContainer && window.innerWidth < 768) {
        // Move the controls to the header
        targetContainer.appendChild(mobileControls);
        mobileControls.className = "flex gap-2 items-center";
      } else if (mobileControls && window.innerWidth >= 768) {
        // Move back to original position on desktop
        const gameContainer = document.querySelector(
          ".flex.flex-col.items-center.gap-6.p-4"
        );
        if (gameContainer) {
          gameContainer.insertBefore(mobileControls, gameContainer.firstChild);
          mobileControls.className =
            "md:hidden fixed top-4 right-4 z-50 gap-2 items-center";
        }
      }
    };

    // Move on mount and resize
    moveMobileAudioControls();
    window.addEventListener("resize", moveMobileAudioControls);

    return () => {
      window.removeEventListener("resize", moveMobileAudioControls);
    };
  }, []);

  // Handle game status changes
  useEffect(() => {
    console.log("🎮 Game status changed:", {
      status: gameState.status,
      firstClick: gameState.firstClick,
      audioUnlocked: audioManager.isAudioUnlocked(),
    });

    if (gameState.status === "won") {
      console.log("🎉 Playing victory sound");
      playVictorySound();

      // Track game end in game systems
      gameSystems.onGameEnd(gameState, currentMode, timer.elapsed);
    } else if (gameState.status === "lost") {
      console.log("💥 Playing defeat sound");
      playDefeatSound();

      // Track game end in game systems
      gameSystems.onGameEnd(gameState, currentMode, timer.elapsed);
    } else if (gameState.status === "playing" && !gameState.firstClick) {
      // Start gameplay music when first move is made
      console.log("🎵 Starting gameplay music");
      startGameplayMusic();

      // Track game start in game systems
      gameSystems.onGameStart(currentMode, gameState);
    }
  }, [
    gameState.status,
    gameState.firstClick,
    playVictorySound,
    playDefeatSound,
    startGameplayMusic,
    audioManager,
    gameSystems,
    currentMode,
    gameState,
    timer.elapsed,
  ]);

  // Show modal when game ends
  const handleGameEnd = () => {
    if (gameState.status === "won" || gameState.status === "lost") {
      // Check if continue is available for lost games
      if (gameState.status === "lost" && modeManager?.canContinue()) {
        setShowContinueModal(true);
      } else {
        setShowModal(true);
      }
    }
  };

  // Watch for game end
  if (
    (gameState.status === "won" || gameState.status === "lost") &&
    !showModal &&
    !showContinueModal
  ) {
    handleGameEnd();
  }

  const handleDifficultyChange = (difficulty: DifficultyLevel) => {
    console.log("🎛️ Difficulty changed:", difficulty);
    if (useGameModes) {
      // Convert difficulty to game mode
      const modeMap: Record<string, string> = {
        easy: "classic",
        medium: "time-attack",
        hard: "hardcore",
      };
      const modeId = modeMap[difficulty] || "classic";
      // This would need to be implemented to find mode by ID
      console.log("🎮 Would switch to mode:", modeId);
    } else {
      legacyGame.changeDifficulty(difficulty);
    }
    setShowModal(false);
    playDifficultyChange();
  };

  const handleReset = () => {
    console.log("🔄 Game reset");
    resetGame();
    setShowModal(false);
    setShowContinueModal(false);
    // Don't show start modal on reset - only on first visit
    playMenuMusic();
  };

  const handleShowModeSelector = () => {
    setShowModeSelector(true);
  };

  const handleStartGame = () => {
    console.log("🚀 Game started");
    setShowStartModal(false);
    // Start gameplay music when game begins (audio should be unlocked by now)
    startGameplayMusic();
  };

  const handleDismissStartModal = () => {
    setShowStartModal(false);
  };

  return (
    <div className="flex flex-col items-center gap-6 p-4 w-full max-w-7xl mx-auto">
      {/* Audio Loading Indicator */}
      <AudioLoadingIndicator />

      {/* Audio Controls - Desktop */}
      <div className="sm:hidden flex fixed top-4 right-4 z-50 gap-2 items-center">
        <CompactAudioControls />
        <AudioSettings />
      </div>

      {/* Audio Controls - Mobile */}
      <div
        className="md:hidden fixed top-4 right-4 z-50 gap-2 items-center"
        id="mobile-audio-controls-container"
      >
        <CompactAudioControls />
        <AudioSettings />
      </div>

      {/* Game Start Modal */}
      <GameStartModal
        isVisible={showStartModal}
        onStart={handleStartGame}
        onDismiss={handleDismissStartModal}
      />

      {/* Game Mode Selector */}
      {showModeSelector && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-6xl">
            <GameModeSelector
              onSelectMode={handleModeSelect}
              currentMode={currentMode.id}
              onClose={() => setShowModeSelector(false)}
            />
          </div>
        </div>
      )}

      {/* Continue Modal */}
      <ContinueModal
        isOpen={showContinueModal}
        gameMode={currentMode}
        gameState={gameState}
        onContinue={handleContinue}
        onQuit={handleQuit}
        onClose={() => setShowContinueModal(false)}
      />

      {/* World Coin App Audio Unlock */}
      <WorldCoinAudioUnlock />

      {/* Audio Debug Panel */}
      <AudioDebugPanel />

      {/* Manual Audio Test Buttons */}
      <div className="fixed bottom-4 left-4 z-50 space-y-2">
        <button
          onClick={() => {
            console.log("🔊 Manual audio test clicked");
            audioManager.playSound("menu_click", { volume: 0.7 });
          }}
          className="block px-4 py-2 bg-mi-cyber-green text-black font-bold rounded-lg hover:bg-mi-electric-blue transition-colors"
        >
          Test Audio
        </button>

        <button
          onClick={() => {
            console.log("🔊 Direct audio test");
            const audio = new Audio("/audio/sfx/ui/click_tactical.mp3");
            audio.volume = 0.7;
            audio.addEventListener("error", (e) => {
              console.error("❌ Direct audio error:", e);
            });
            audio.addEventListener("canplay", () => {
              console.log("✅ Direct audio can play");
            });
            audio
              .play()
              .then(() => {
                console.log("✅ Direct audio played");
              })
              .catch((error) => {
                console.error("❌ Direct audio play failed:", error);
              });
          }}
          className="block px-4 py-2 bg-mi-orange text-black font-bold rounded-lg hover:bg-mi-yellow transition-colors"
        >
          Direct Test
        </button>
      </div>

      {/* Game Header */}
      <GameHeader
        elapsed={timer.elapsed}
        remainingMines={remainingMines}
        difficulty={gameState.difficulty}
        onDifficultyChange={handleDifficultyChange}
        onReset={handleReset}
      />

      {/* Game Mode Toggle Button */}
      <div className="flex gap-4 items-center">
        <button
          onClick={handleShowModeSelector}
          className="px-4 py-2 bg-mi-cyber-green text-black font-semibold rounded-lg hover:bg-mi-electric-blue transition-colors"
        >
          🎮 Game Modes
        </button>

        {useGameModes && (
          <div className="text-sm text-gray-300">
            Mode:{" "}
            <span className="text-mi-cyber-green font-semibold">
              {currentMode.name}
            </span>
            {gameState.score > 0 && (
              <span className="ml-2">
                Score:{" "}
                <span className="text-mi-electric-blue">{gameState.score}</span>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Game Systems Debug Panel */}
      {process.env.NODE_ENV === "development" && (
        <div className="bg-mi-dark-blue/50 border border-mi-cyber-green/30 rounded-lg p-4 text-xs text-gray-300 max-w-4xl w-full">
          <h3 className="text-mi-cyber-green font-semibold mb-2">
            🎮 Game Systems Status
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-mi-electric-blue font-medium">Analytics</div>
              <div>
                Sessions:{" "}
                {gameSystems.analytics.getAllAnalytics().sessions.length}
              </div>
              <div>
                Events: {gameSystems.analytics.getAllAnalytics().events.length}
              </div>
            </div>
            <div>
              <div className="text-mi-electric-blue font-medium">
                Achievements
              </div>
              <div>
                Unlocked:{" "}
                {gameSystems.achievements.getUnlockedAchievements().length}
              </div>
              <div>Points: {gameSystems.achievements.getTotalPoints()}</div>
            </div>
            <div>
              <div className="text-mi-electric-blue font-medium">
                Challenges
              </div>
              <div>
                Today:{" "}
                {gameSystems.dailyChallenges.getTodaysChallenges().length}
              </div>
              <div>
                Completed:{" "}
                {
                  gameSystems.dailyChallenges.getUserChallengeStats()
                    .completedChallenges
                }
              </div>
            </div>
            <div>
              <div className="text-mi-electric-blue font-medium">
                Performance
              </div>
              <div>
                Score:{" "}
                {
                  gameSystems.performance.getMonitor().getPerformanceReport()
                    .performanceScore
                }
                /100
              </div>
              <div>
                FPS:{" "}
                {gameSystems.performance
                  .getMonitor()
                  .getPerformanceReport()
                  .averageFPS.toFixed(1)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Game Board */}
      <div className="overflow-x-auto w-full flex justify-center">
        <GameBoard
          board={gameState.board}
          onCellClick={handleCellClick}
          onCellRightClick={handleCellRightClick}
          gameOver={gameState.status === "won" || gameState.status === "lost"}
        />
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
