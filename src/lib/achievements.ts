/**
 * Achievement System
 * Comprehensive achievement tracking and rewards
 */

import { GameMode } from "@/types/gameMode";
import { GameState } from "@/types/game";

// ============================================================================
// ACHIEVEMENT TYPES
// ============================================================================

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: "score" | "time" | "streak" | "mode" | "special" | "payment";
  rarity: "common" | "uncommon" | "rare" | "epic" | "legendary";
  points: number;
  condition: AchievementCondition;
  unlockedAt?: number;
  progress?: number;
  maxProgress?: number;
  hidden?: boolean;
  secret?: boolean;
}

export interface AchievementCondition {
  type:
    | "score"
    | "time"
    | "streak"
    | "mode_completion"
    | "continues"
    | "perfect_game"
    | "speed"
    | "custom";
  value?: number;
  mode?: string;
  operator?: "gte" | "lte" | "eq" | "gt" | "lt";
  customCheck?: (gameState: GameState, mode: GameMode) => boolean;
}

export interface UserAchievement {
  achievementId: string;
  unlockedAt: number;
  progress: number;
  maxProgress: number;
  isUnlocked: boolean;
}

export interface AchievementProgress {
  achievementId: string;
  current: number;
  target: number;
  percentage: number;
  isUnlocked: boolean;
}

// ============================================================================
// ACHIEVEMENT DEFINITIONS
// ============================================================================

export const ACHIEVEMENTS: Achievement[] = [
  // Score Achievements
  {
    id: "first_score",
    name: "First Steps",
    description: "Score your first points",
    icon: "🎯",
    category: "score",
    rarity: "common",
    points: 10,
    condition: { type: "score", value: 1, operator: "gte" },
  },
  {
    id: "score_1000",
    name: "Thousand Points",
    description: "Score 1,000 points in a single game",
    icon: "💯",
    category: "score",
    rarity: "uncommon",
    points: 25,
    condition: { type: "score", value: 1000, operator: "gte" },
  },
  {
    id: "score_5000",
    name: "High Roller",
    description: "Score 5,000 points in a single game",
    icon: "🎲",
    category: "score",
    rarity: "rare",
    points: 50,
    condition: { type: "score", value: 5000, operator: "gte" },
  },
  {
    id: "score_10000",
    name: "Score Master",
    description: "Score 10,000 points in a single game",
    icon: "👑",
    category: "score",
    rarity: "epic",
    points: 100,
    condition: { type: "score", value: 10000, operator: "gte" },
  },
  {
    id: "score_50000",
    name: "Legendary Scorer",
    description: "Score 50,000 points in a single game",
    icon: "🌟",
    category: "score",
    rarity: "legendary",
    points: 250,
    condition: { type: "score", value: 50000, operator: "gte" },
  },

  // Time Achievements
  {
    id: "speed_demon",
    name: "Speed Demon",
    description: "Complete a game in under 30 seconds",
    icon: "⚡",
    category: "time",
    rarity: "rare",
    points: 75,
    condition: { type: "time", value: 30, operator: "lte" },
  },
  {
    id: "lightning_fast",
    name: "Lightning Fast",
    description: "Complete a game in under 15 seconds",
    icon: "⚡⚡",
    category: "time",
    rarity: "epic",
    points: 150,
    condition: { type: "time", value: 15, operator: "lte" },
  },
  {
    id: "time_master",
    name: "Time Master",
    description: "Complete 10 games in under 60 seconds each",
    icon: "⏰",
    category: "time",
    rarity: "rare",
    points: 100,
    condition: {
      type: "custom",
      customCheck: () => {
        // This would need to track across multiple games
        return false; // Placeholder
      },
    },
  },

  // Streak Achievements
  {
    id: "win_streak_3",
    name: "Getting Started",
    description: "Win 3 games in a row",
    icon: "🔥",
    category: "streak",
    rarity: "common",
    points: 20,
    condition: { type: "streak", value: 3, operator: "gte" },
  },
  {
    id: "win_streak_10",
    name: "On Fire",
    description: "Win 10 games in a row",
    icon: "🔥🔥",
    category: "streak",
    rarity: "uncommon",
    points: 50,
    condition: { type: "streak", value: 10, operator: "gte" },
  },
  {
    id: "win_streak_25",
    name: "Unstoppable",
    description: "Win 25 games in a row",
    icon: "🔥🔥🔥",
    category: "streak",
    rarity: "rare",
    points: 100,
    condition: { type: "streak", value: 25, operator: "gte" },
  },
  {
    id: "win_streak_50",
    name: "Legendary Streak",
    description: "Win 50 games in a row",
    icon: "🔥🔥🔥🔥",
    category: "streak",
    rarity: "legendary",
    points: 300,
    condition: { type: "streak", value: 50, operator: "gte" },
  },

  // Mode Achievements
  {
    id: "mode_master",
    name: "Mode Master",
    description: "Complete a game in all available modes",
    icon: "🎮",
    category: "mode",
    rarity: "epic",
    points: 200,
    condition: {
      type: "custom",
      customCheck: () => {
        // This would need to track across all modes
        return false; // Placeholder
      },
    },
  },
  {
    id: "time_attack_expert",
    name: "Time Attack Expert",
    description: "Complete 5 Time Attack games",
    icon: "⏱️",
    category: "mode",
    rarity: "uncommon",
    points: 40,
    condition: { type: "mode_completion", mode: "time-attack", value: 5 },
  },
  {
    id: "endless_champion",
    name: "Endless Champion",
    description: "Reach level 10 in Endless mode",
    icon: "♾️",
    category: "mode",
    rarity: "rare",
    points: 80,
    condition: {
      type: "custom",
      customCheck: (state, mode) => {
        return mode.id === "endless" && state.level >= 10;
      },
    },
  },
  {
    id: "hardcore_warrior",
    name: "Hardcore Warrior",
    description: "Complete a Hardcore mode game",
    icon: "💀",
    category: "mode",
    rarity: "epic",
    points: 150,
    condition: { type: "mode_completion", mode: "hardcore", value: 1 },
  },
  {
    id: "blind_master",
    name: "Blind Master",
    description: "Complete 3 Blind mode games",
    icon: "🕶️",
    category: "mode",
    rarity: "rare",
    points: 100,
    condition: { type: "mode_completion", mode: "blind", value: 3 },
  },

  // Perfect Game Achievements
  {
    id: "perfect_game",
    name: "Perfect Game",
    description: "Complete a game without using continues",
    icon: "✨",
    category: "special",
    rarity: "uncommon",
    points: 30,
    condition: { type: "perfect_game", value: 1 },
  },
  {
    id: "perfect_streak",
    name: "Perfect Streak",
    description: "Complete 5 games in a row without continues",
    icon: "✨✨",
    category: "special",
    rarity: "rare",
    points: 75,
    condition: {
      type: "custom",
      customCheck: () => {
        // This would need to track across multiple games
        return false; // Placeholder
      },
    },
  },

  // Payment Achievements
  {
    id: "first_continue",
    name: "Second Chance",
    description: "Use your first continue",
    icon: "💳",
    category: "payment",
    rarity: "common",
    points: 15,
    condition: { type: "continues", value: 1, operator: "gte" },
  },
  {
    id: "big_spender",
    name: "Big Spender",
    description: "Spend 1000 WLD on continues",
    icon: "💰",
    category: "payment",
    rarity: "rare",
    points: 100,
    condition: {
      type: "custom",
      customCheck: () => {
        // This would need to track total spending
        return false; // Placeholder
      },
    },
  },

  // Secret Achievements
  {
    id: "secret_easter_egg",
    name: "Easter Egg Hunter",
    description: "Find the secret easter egg",
    icon: "🥚",
    category: "special",
    rarity: "legendary",
    points: 500,
    condition: {
      type: "custom",
      customCheck: () => {
        // Secret condition - maybe clicking a specific pattern
        return false; // Placeholder
      },
    },
    secret: true,
    hidden: true,
  },
  {
    id: "midnight_gamer",
    name: "Midnight Gamer",
    description: "Play a game between midnight and 3 AM",
    icon: "🌙",
    category: "special",
    rarity: "uncommon",
    points: 25,
    condition: {
      type: "custom",
      customCheck: () => {
        const hour = new Date().getHours();
        return hour >= 0 && hour < 3;
      },
    },
    secret: true,
  },
];

// ============================================================================
// ACHIEVEMENT MANAGER
// ============================================================================

export class AchievementManager {
  private userAchievements: Map<string, UserAchievement> = new Map();
  private userId: string;

  constructor() {
    this.userId = this.getUserId();
    this.loadUserAchievements();
  }

  /**
   * Check and unlock achievements based on game state
   */
  checkAchievements(
    gameState: GameState,
    gameMode: GameMode,
    gameTime?: number
  ): Achievement[] {
    const unlockedAchievements: Achievement[] = [];

    for (const achievement of ACHIEVEMENTS) {
      if (this.isAchievementUnlocked(achievement.id)) {
        continue; // Already unlocked
      }

      if (
        this.checkAchievementCondition(
          achievement,
          gameState,
          gameMode,
          gameTime
        )
      ) {
        this.unlockAchievement(achievement);
        unlockedAchievements.push(achievement);
      }
    }

    return unlockedAchievements;
  }

  /**
   * Get user's achievement progress
   */
  getAchievementProgress(
    achievementId: string,
    gameState?: GameState,
    gameMode?: GameMode
  ): AchievementProgress | null {
    const achievement = ACHIEVEMENTS.find((a) => a.id === achievementId);
    if (!achievement) return null;

    const userAchievement = this.userAchievements.get(achievementId);
    const isUnlocked = !!userAchievement?.isUnlocked;

    if (isUnlocked) {
      return {
        achievementId,
        current: achievement.maxProgress || 1,
        target: achievement.maxProgress || 1,
        percentage: 100,
        isUnlocked: true,
      };
    }

    // Calculate progress for unlocked achievements
    const current =
      gameState && gameMode ? this.calculateAchievementProgress() : 0;
    const target = achievement.maxProgress || 1;
    const percentage = Math.min(100, Math.round((current / target) * 100));

    return {
      achievementId,
      current,
      target,
      percentage,
      isUnlocked: false,
    };
  }

  /**
   * Get all user achievements
   */
  getUserAchievements(): UserAchievement[] {
    return Array.from(this.userAchievements.values());
  }

  /**
   * Get unlocked achievements
   */
  getUnlockedAchievements(): Achievement[] {
    const unlockedIds = Array.from(this.userAchievements.values())
      .filter((ua) => ua.isUnlocked)
      .map((ua) => ua.achievementId);

    return ACHIEVEMENTS.filter((a) => unlockedIds.includes(a.id));
  }

  /**
   * Get achievements by category
   */
  getAchievementsByCategory(category: string): Achievement[] {
    return ACHIEVEMENTS.filter((a) => a.category === category);
  }

  /**
   * Get achievements by rarity
   */
  getAchievementsByRarity(rarity: string): Achievement[] {
    return ACHIEVEMENTS.filter((a) => a.rarity === rarity);
  }

  /**
   * Get total achievement points
   */
  getTotalPoints(): number {
    return this.getUnlockedAchievements().reduce(
      (total, achievement) => total + achievement.points,
      0
    );
  }

  /**
   * Get achievement statistics
   */
  getAchievementStats(): {
    total: number;
    unlocked: number;
    percentage: number;
    points: number;
    byCategory: Record<string, number>;
    byRarity: Record<string, number>;
  } {
    const unlocked = this.getUnlockedAchievements();
    const total = ACHIEVEMENTS.length;
    const percentage = Math.round((unlocked.length / total) * 100);
    const points = this.getTotalPoints();

    const byCategory = unlocked.reduce((acc, achievement) => {
      acc[achievement.category] = (acc[achievement.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byRarity = unlocked.reduce((acc, achievement) => {
      acc[achievement.rarity] = (acc[achievement.rarity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total,
      unlocked: unlocked.length,
      percentage,
      points,
      byCategory,
      byRarity,
    };
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  private getUserId(): string {
    let userId = localStorage.getItem("achievement_user_id");
    if (!userId) {
      userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem("achievement_user_id", userId);
    }
    return userId;
  }

  private loadUserAchievements(): void {
    const data = localStorage.getItem(`achievements_${this.userId}`);
    if (data) {
      const achievements = JSON.parse(data);
      this.userAchievements = new Map(achievements);
    }
  }

  private saveUserAchievements(): void {
    const data = Array.from(this.userAchievements.entries());
    localStorage.setItem(`achievements_${this.userId}`, JSON.stringify(data));
  }

  private isAchievementUnlocked(achievementId: string): boolean {
    const userAchievement = this.userAchievements.get(achievementId);
    return userAchievement?.isUnlocked || false;
  }

  private checkAchievementCondition(
    achievement: Achievement,
    gameState: GameState,
    gameMode: GameMode,
    gameTime?: number
  ): boolean {
    const condition = achievement.condition;

    switch (condition.type) {
      case "score":
        return this.checkScoreCondition(gameState.score, condition);
      case "time":
        return (
          gameTime !== undefined && this.checkTimeCondition(gameTime, condition)
        );
      case "streak":
        return this.checkStreakCondition(gameState.streak, condition);
      case "mode_completion":
        return this.checkModeCompletionCondition(gameMode.id, condition);
      case "continues":
        return this.checkContinuesCondition(gameState.continueCount, condition);
      case "perfect_game":
        return gameState.continueCount === 0 && gameState.status === "won";
      case "custom":
        return condition.customCheck
          ? condition.customCheck(gameState, gameMode)
          : false;
      default:
        return false;
    }
  }

  private checkScoreCondition(
    score: number,
    condition: AchievementCondition
  ): boolean {
    if (condition.value === undefined) return false;
    return this.compareValues(
      score,
      condition.value,
      condition.operator || "gte"
    );
  }

  private checkTimeCondition(
    time: number,
    condition: AchievementCondition
  ): boolean {
    if (condition.value === undefined) return false;
    return this.compareValues(
      time,
      condition.value,
      condition.operator || "lte"
    );
  }

  private checkStreakCondition(
    streak: number,
    condition: AchievementCondition
  ): boolean {
    if (condition.value === undefined) return false;
    return this.compareValues(
      streak,
      condition.value,
      condition.operator || "gte"
    );
  }

  private checkModeCompletionCondition(
    modeId: string,
    condition: AchievementCondition
  ): boolean {
    if (condition.mode && condition.mode !== modeId) return false;
    if (condition.value === undefined) return false;

    // This would need to track mode completions across games
    // For now, just check if the mode matches
    return condition.mode === modeId;
  }

  private checkContinuesCondition(
    continues: number,
    condition: AchievementCondition
  ): boolean {
    if (condition.value === undefined) return false;
    return this.compareValues(
      continues,
      condition.value,
      condition.operator || "gte"
    );
  }

  private compareValues(
    current: number,
    target: number,
    operator: string
  ): boolean {
    switch (operator) {
      case "gte":
        return current >= target;
      case "lte":
        return current <= target;
      case "eq":
        return current === target;
      case "gt":
        return current > target;
      case "lt":
        return current < target;
      default:
        return false;
    }
  }

  private calculateAchievementProgress(): number {
    // This would calculate progress for achievements that can be partially completed
    // For now, return 0 for most achievements
    return 0;
  }

  private unlockAchievement(achievement: Achievement): void {
    const userAchievement: UserAchievement = {
      achievementId: achievement.id,
      unlockedAt: Date.now(),
      progress: achievement.maxProgress || 1,
      maxProgress: achievement.maxProgress || 1,
      isUnlocked: true,
    };

    this.userAchievements.set(achievement.id, userAchievement);
    this.saveUserAchievements();

    console.log("🏆 Achievement unlocked:", achievement.name);
  }
}

// ============================================================================
// ACHIEVEMENT HOOKS
// ============================================================================

/**
 * React hook for achievements
 */
export function useAchievements() {
  const achievementManager = new AchievementManager();

  return {
    checkAchievements:
      achievementManager.checkAchievements.bind(achievementManager),
    getAchievementProgress:
      achievementManager.getAchievementProgress.bind(achievementManager),
    getUserAchievements:
      achievementManager.getUserAchievements.bind(achievementManager),
    getUnlockedAchievements:
      achievementManager.getUnlockedAchievements.bind(achievementManager),
    getAchievementsByCategory:
      achievementManager.getAchievementsByCategory.bind(achievementManager),
    getAchievementsByRarity:
      achievementManager.getAchievementsByRarity.bind(achievementManager),
    getTotalPoints: achievementManager.getTotalPoints.bind(achievementManager),
    getAchievementStats:
      achievementManager.getAchievementStats.bind(achievementManager),
  };
}

// Singleton instance
export const achievementManager = new AchievementManager();
