/**
 * Game Mode Configurations
 * Defines all available game modes with Mission Impossible theming
 */

import { GameMode } from "@/types/gameMode";

// ============================================================================
// TIME-BASED MODES
// ============================================================================

export const TIME_ATTACK_MODE: GameMode = {
  id: "time-attack",
  name: "Mission: Time Attack",
  category: "time-based",
  description: "Defuse all bombs before time runs out!",
  icon: "⏱️💣",
  config: {
    boardSize: { width: 16, height: 16 },
    mineCount: 40,
    timeLimit: 300, // 5 minutes
    specialRules: ["timer-countdown", "time-pressure-visuals"],
  },
  rules: {
    allowFlags: true,
    revealOnMineClick: true,
    numberVisibility: "always",
    firstClickSafe: true,
    cascadeReveal: true,
    customLoseCondition: (state) =>
      (state.timeRemaining !== undefined && state.timeRemaining <= 0) ||
      state.hitMine,
  },
  scoring: {
    basePoints: 1000,
    timeBonus: (timeRemaining) => timeRemaining * 10,
    accuracyBonus: (accuracy) => accuracy * 500,
  },
  continueAllowed: true,
  continueCost: 100,
  enabled: true,
};

export const SPEED_RUN_MODE: GameMode = {
  id: "speed-run",
  name: "Operation: Speed Run",
  category: "time-based",
  description: "Complete standard missions as fast as possible!",
  icon: "🏃‍♂️💨",
  config: {
    boardSize: { width: 16, height: 16 },
    mineCount: 40,
    specialRules: ["global-leaderboard", "replay-recording"],
  },
  rules: {
    allowFlags: true,
    revealOnMineClick: true,
    numberVisibility: "always",
    firstClickSafe: true,
    cascadeReveal: true,
  },
  scoring: {
    basePoints: 0,
    timeScore: (completionTime) => Math.max(0, 100000 - completionTime * 100),
  },
  continueAllowed: false,
  continueCost: 0,
  enabled: true,
};

export const TIMED_ROUNDS_MODE: GameMode = {
  id: "timed-rounds",
  name: "Rapid Deployment",
  category: "time-based",
  description: "Multiple quick missions in succession!",
  icon: "🔄⚡",
  config: {
    boardSize: { width: 8, height: 8 },
    mineCount: 10,
    timeLimit: 60,
    specialRules: ["multi-round", "score-accumulation"],
  },
  rules: {
    allowFlags: true,
    revealOnMineClick: true, // Changed to true - hitting a mine ends the game
    numberVisibility: "always",
    firstClickSafe: true,
    cascadeReveal: true,
  },
  scoring: {
    roundBonus: 500,
    speedMultiplier: (roundNumber) => 1 + roundNumber * 0.5,
    comboMultiplier: (streak) => 1 + streak * 0.25,
  },
  continueAllowed: true,
  continueCost: 50,
  enabled: true,
};

// ============================================================================
// DIFFICULTY PROGRESSION MODES
// ============================================================================

export const ENDLESS_MODE: GameMode = {
  id: "endless",
  name: "Infinite Protocol",
  category: "difficulty",
  description: "Missions get harder with each success!",
  icon: "♾️📈",
  config: {
    boardSize: "dynamic",
    mineCount: "dynamic",
    specialRules: ["progressive-difficulty", "endless-gameplay"],
    difficultyProgression: {
      startLevel: 1,
      maxLevel: null,
      progression: (level) => ({
        width: Math.min(8 + level * 2, 30),
        height: Math.min(8 + level * 2, 20),
        mines: Math.floor(10 + level * 5 * Math.pow(1.2, level)),
      }),
    },
  },
  rules: {
    allowFlags: true,
    revealOnMineClick: true,
    numberVisibility: "always",
    firstClickSafe: true,
    cascadeReveal: true,
  },
  scoring: {
    levelMultiplier: (level) => level * 1000,
    streakBonus: (consecutiveWins) => consecutiveWins * 500,
  },
  continueAllowed: true,
  continueCost: 150,
  enabled: true,
};

export const SURVIVAL_MODE: GameMode = {
  id: "survival",
  name: "Pressure Chamber",
  category: "difficulty",
  description: "Time decreases, pressure increases!",
  icon: "🎯💀",
  config: {
    boardSize: { width: 16, height: 16 },
    mineCount: "dynamic",
    timeLimit: 180,
    specialRules: ["decreasing-time", "increasing-difficulty"],
    difficultyProgression: {
      startLevel: 1,
      maxLevel: 20,
      progression: (level) => ({
        timeLimit: Math.max(30, 180 - level * 10),
        mines: 30 + level * 3,
        requiredAccuracy: 0.7 + level * 0.02,
      }),
    },
  },
  rules: {
    allowFlags: true,
    revealOnMineClick: true,
    numberVisibility: "always",
    firstClickSafe: true,
    cascadeReveal: true,
  },
  scoring: {
    survivalBonus: (level, timeLeft) => level * 1000 + timeLeft * 10,
  },
  continueAllowed: true,
  continueCost: 200,
  enabled: true,
};

// ============================================================================
// RELAXED/LEARNING MODES
// ============================================================================

export const ZEN_MODE: GameMode = {
  id: "zen",
  name: "Training Simulator",
  category: "relaxed",
  description: "Practice without consequences",
  icon: "🧘☮️",
  config: {
    boardSize: { width: 16, height: 16 },
    mineCount: 40,
    specialRules: ["no-game-over", "hint-system", "undo-moves"],
  },
  rules: {
    allowFlags: true,
    revealOnMineClick: false,
    numberVisibility: "always",
    firstClickSafe: true,
    cascadeReveal: true,
  },
  scoring: {
    practicePoints: 0,
  },
  continueAllowed: false,
  continueCost: 0,
  enabled: true,
};

export const CUSTOM_MODE: GameMode = {
  id: "custom",
  name: "Custom Protocol",
  category: "relaxed",
  description: "Configure your own mission parameters",
  icon: "⚙️🎮",
  config: {
    boardSize: "dynamic",
    mineCount: "dynamic",
    timeLimit: undefined,
    specialRules: ["user-configurable"],
  },
  rules: {
    allowFlags: true,
    revealOnMineClick: true,
    numberVisibility: "always",
    firstClickSafe: true,
    cascadeReveal: true,
  },
  scoring: {
    customFormula: (params) => Object.values(params).reduce((a, b) => a + b, 0),
  },
  continueAllowed: true,
  continueCost: 75,
  enabled: true,
};

// ============================================================================
// CHALLENGE MODES
// ============================================================================

export const LIMITED_MOVES_MODE: GameMode = {
  id: "limited-moves",
  name: "Tactical Precision",
  category: "challenge",
  description: "Every click counts!",
  icon: "🎯🔢",
  config: {
    boardSize: { width: 12, height: 12 },
    mineCount: 25,
    moveLimit: 50,
    specialRules: ["move-counter", "efficiency-tracking"],
  },
  rules: {
    allowFlags: true,
    revealOnMineClick: true,
    numberVisibility: "always",
    firstClickSafe: true,
    cascadeReveal: true,
    customLoseCondition: (state) =>
      (state.moveLimit !== undefined &&
        state.movesUsed !== undefined &&
        state.movesUsed >= state.moveLimit) ||
      state.hitMine,
  },
  scoring: {
    efficiencyBonus: (movesRemaining) => movesRemaining * 100,
    perfectBonus: 5000,
  },
  continueAllowed: true,
  continueCost: 125,
  enabled: true,
};

export const HARDCORE_MODE: GameMode = {
  id: "hardcore",
  name: "No Margin for Error",
  category: "challenge",
  description: "One mistake = Mission Failed",
  icon: "💀⚠️",
  config: {
    boardSize: { width: 20, height: 20 },
    mineCount: 80,
    specialRules: ["no-mistakes", "tension-audio", "dramatic-visuals"],
  },
  rules: {
    allowFlags: true,
    revealOnMineClick: true,
    numberVisibility: "always",
    firstClickSafe: true,
    cascadeReveal: true,
  },
  scoring: {
    hardcoreMultiplier: 5,
    flawlessBonus: 10000,
  },
  continueAllowed: false,
  continueCost: 0,
  enabled: true,
};

export const BLIND_MODE: GameMode = {
  id: "blind",
  name: "Dark Operations",
  category: "challenge",
  description: "Numbers only visible near flags",
  icon: "🕶️❓",
  config: {
    boardSize: { width: 10, height: 10 },
    mineCount: 15,
    specialRules: ["limited-visibility", "flag-reveals-numbers"],
  },
  rules: {
    allowFlags: true,
    revealOnMineClick: true,
    numberVisibility: "conditional",
    firstClickSafe: true,
    cascadeReveal: false,
  },
  scoring: {
    blindBonus: 3000,
    deductionPoints: (correctFlags) => correctFlags * 200,
  },
  continueAllowed: true,
  continueCost: 150,
  enabled: true,
};

// ============================================================================
// CREATIVE MODES
// ============================================================================

export const MEMORY_MODE: GameMode = {
  id: "memory",
  name: "Photographic Memory",
  category: "creative",
  description: "Remember before it disappears!",
  icon: "🧠💭",
  config: {
    boardSize: { width: 8, height: 8 },
    mineCount: 12,
    specialRules: ["temporary-reveal", "memory-phase", "recall-phase"],
  },
  rules: {
    allowFlags: true,
    revealOnMineClick: true,
    numberVisibility: "always",
    firstClickSafe: true,
    cascadeReveal: false,
    customGameFlow: {
      phases: ["reveal", "memorize", "play"],
      revealDuration: 5000,
      fadeOutAnimation: true,
    },
  },
  scoring: {
    memoryAccuracy: (correctRecalls) => correctRecalls * 300,
    speedRecallBonus: (timeToComplete) =>
      Math.max(0, 5000 - timeToComplete * 10),
  },
  continueAllowed: true,
  continueCost: 100,
  enabled: true,
};

export const PATTERN_MODE: GameMode = {
  id: "pattern",
  name: "Geometric Protocol",
  category: "creative",
  description: "Mines follow patterns!",
  icon: "🔷📐",
  config: {
    boardSize: { width: 15, height: 15 },
    mineCount: "dynamic",
    specialRules: ["pattern-generation", "symmetry-hints"],
  },
  rules: {
    allowFlags: true,
    revealOnMineClick: true,
    numberVisibility: "always",
    firstClickSafe: false,
    cascadeReveal: true,
  },
  scoring: {
    patternRecognition: (earlyFlagAccuracy) => earlyFlagAccuracy * 1000,
    symmetryBonus: 2000,
  },
  continueAllowed: true,
  continueCost: 100,
  enabled: true,
};

// ============================================================================
// CLASSIC MODE (Default from original game)
// ============================================================================
// RELAXED MODES
// ============================================================================

export const CLASSIC_MODE_EASY: GameMode = {
  id: "classic-easy",
  name: "Classic Mission (Easy)",
  category: "relaxed",
  description: "Original minesweeper experience - Easy difficulty",
  icon: "🎮💎",
  config: {
    boardSize: { width: 8, height: 8 },
    mineCount: 10,
    specialRules: [],
  },
  rules: {
    allowFlags: true,
    revealOnMineClick: true,
    numberVisibility: "always",
    firstClickSafe: true,
    cascadeReveal: true,
  },
  scoring: {
    basePoints: 500,
    timeBonus: (timeRemaining) => timeRemaining * 3,
  },
  continueAllowed: true,
  continueCost: 25,
  enabled: true,
};

export const CLASSIC_MODE_MEDIUM: GameMode = {
  id: "classic-medium",
  name: "Classic Mission (Medium)",
  category: "relaxed",
  description: "Original minesweeper experience - Medium difficulty",
  icon: "🎮💎",
  config: {
    boardSize: { width: 16, height: 16 },
    mineCount: 40,
    specialRules: [],
  },
  rules: {
    allowFlags: true,
    revealOnMineClick: true,
    numberVisibility: "always",
    firstClickSafe: true,
    cascadeReveal: true,
  },
  scoring: {
    basePoints: 1000,
    timeBonus: (timeRemaining) => timeRemaining * 5,
  },
  continueAllowed: true,
  continueCost: 50,
  enabled: true,
};

export const CLASSIC_MODE_HARD: GameMode = {
  id: "classic-hard",
  name: "Classic Mission (Hard)",
  category: "relaxed",
  description: "Original minesweeper experience - Hard difficulty",
  icon: "🎮💎",
  config: {
    boardSize: { width: 30, height: 16 },
    mineCount: 99,
    specialRules: [],
  },
  rules: {
    allowFlags: true,
    revealOnMineClick: true,
    numberVisibility: "always",
    firstClickSafe: true,
    cascadeReveal: true,
  },
  scoring: {
    basePoints: 2000,
    timeBonus: (timeRemaining) => timeRemaining * 10,
  },
  continueAllowed: true,
  continueCost: 100,
  enabled: true,
};

export const CLASSIC_MODE: GameMode = {
  id: "classic",
  name: "Classic Mission",
  category: "relaxed",
  description: "Original minesweeper experience",
  icon: "🎮💎",
  config: {
    boardSize: { width: 16, height: 16 },
    mineCount: 40,
    specialRules: [],
  },
  rules: {
    allowFlags: true,
    revealOnMineClick: true,
    numberVisibility: "always",
    firstClickSafe: true,
    cascadeReveal: true,
  },
  scoring: {
    basePoints: 1000,
    timeBonus: (timeRemaining) => timeRemaining * 5,
  },
  continueAllowed: true,
  continueCost: 50,
  enabled: true,
};

// ============================================================================
// ALL GAME MODES REGISTRY
// ============================================================================

export const ALL_GAME_MODES: GameMode[] = [
  CLASSIC_MODE,
  TIME_ATTACK_MODE,
  SPEED_RUN_MODE,
  TIMED_ROUNDS_MODE,
  ENDLESS_MODE,
  SURVIVAL_MODE,
  ZEN_MODE,
  CUSTOM_MODE,
  LIMITED_MOVES_MODE,
  HARDCORE_MODE,
  BLIND_MODE,
  MEMORY_MODE,
  PATTERN_MODE,
];

// Default mode for initial game state
export const DEFAULT_GAME_MODE = CLASSIC_MODE;
