/**
 * Daily Challenges System
 * Rotating daily challenges with rewards
 */

import { GameMode } from "@/types/gameMode";
import { GameState } from "@/types/game";

// ============================================================================
// CHALLENGE TYPES
// ============================================================================

export interface DailyChallenge {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: "score" | "time" | "streak" | "mode" | "special" | "combo";
  difficulty: "easy" | "medium" | "hard" | "expert";
  reward: ChallengeReward;
  condition: ChallengeCondition;
  date: string; // YYYY-MM-DD format
  expiresAt: number;
  isCompleted: boolean;
  progress: number;
  maxProgress: number;
  isActive: boolean;
}

export interface ChallengeCondition {
  type:
    | "score"
    | "time"
    | "streak"
    | "mode_completion"
    | "perfect_game"
    | "speed"
    | "combo";
  value: number;
  mode?: string;
  operator?: "gte" | "lte" | "eq" | "gt" | "lt";
  customCheck?: (gameState: GameState, mode: GameMode) => boolean;
}

export interface ChallengeReward {
  type: "points" | "coins" | "unlock" | "badge";
  amount: number;
  item?: string; // For unlocks and badges
}

export interface ChallengeProgress {
  challengeId: string;
  current: number;
  target: number;
  percentage: number;
  isCompleted: boolean;
  timeRemaining: number;
}

export interface UserChallengeStats {
  totalChallenges: number;
  completedChallenges: number;
  completionRate: number;
  totalRewards: number;
  currentStreak: number;
  longestStreak: number;
  lastCompleted: number;
}

// ============================================================================
// CHALLENGE GENERATOR
// ============================================================================

export class DailyChallengeGenerator {
  private static instance: DailyChallengeGenerator;
  private challenges: DailyChallenge[] = [];
  private currentDate: string;

  constructor() {
    this.currentDate = this.getCurrentDate();
    this.generateDailyChallenges();
  }

  static getInstance(): DailyChallengeGenerator {
    if (!DailyChallengeGenerator.instance) {
      DailyChallengeGenerator.instance = new DailyChallengeGenerator();
    }
    return DailyChallengeGenerator.instance;
  }

  /**
   * Generate daily challenges for the current date
   */
  private generateDailyChallenges(): void {
    const seed = this.getDateSeed(this.currentDate);
    const random = this.seededRandom(seed);

    this.challenges = [
      this.generateScoreChallenge(random),
      this.generateTimeChallenge(random),
      this.generateModeChallenge(random),
      this.generateSpecialChallenge(random),
    ].filter(Boolean) as DailyChallenge[];

    // Mark challenges as active
    this.challenges.forEach((challenge) => {
      challenge.isActive = true;
      challenge.date = this.currentDate;
      challenge.expiresAt = this.getExpirationTime();
    });
  }

  /**
   * Get challenges for a specific date
   */
  getChallengesForDate(date: string): DailyChallenge[] {
    if (date === this.currentDate) {
      return this.challenges;
    }

    // Generate challenges for the requested date
    const seed = this.getDateSeed(date);
    const random = this.seededRandom(seed);

    return [
      this.generateScoreChallenge(random),
      this.generateTimeChallenge(random),
      this.generateModeChallenge(random),
      this.generateSpecialChallenge(random),
    ].filter(Boolean) as DailyChallenge[];
  }

  /**
   * Get today's challenges
   */
  getTodaysChallenges(): DailyChallenge[] {
    return this.challenges;
  }

  /**
   * Get active challenges
   */
  getActiveChallenges(): DailyChallenge[] {
    const now = Date.now();
    return this.challenges.filter(
      (challenge) => challenge.isActive && challenge.expiresAt > now
    );
  }

  // ============================================================================
  // CHALLENGE GENERATORS
  // ============================================================================

  private generateScoreChallenge(random: () => number): DailyChallenge | null {
    const scoreTargets = [500, 1000, 2000, 5000, 10000];
    const target = scoreTargets[Math.floor(random() * scoreTargets.length)];

    const difficulties = [
      { name: "Score Hunter", icon: "🎯", difficulty: "easy" as const },
      { name: "Point Collector", icon: "💰", difficulty: "medium" as const },
      { name: "Score Master", icon: "👑", difficulty: "hard" as const },
      { name: "Legendary Scorer", icon: "🌟", difficulty: "expert" as const },
    ];

    const difficulty = difficulties[Math.floor(random() * difficulties.length)];

    return {
      id: `score_${this.currentDate}_${target}`,
      name: difficulty.name,
      description: `Score ${target.toLocaleString()} points in any mode`,
      icon: difficulty.icon,
      type: "score",
      difficulty: difficulty.difficulty,
      reward: {
        type: "points",
        amount: target / 10,
      },
      condition: {
        type: "score",
        value: target,
        operator: "gte",
      },
      date: this.currentDate,
      expiresAt: this.getExpirationTime(),
      isCompleted: false,
      progress: 0,
      maxProgress: target,
      isActive: true,
    };
  }

  private generateTimeChallenge(random: () => number): DailyChallenge | null {
    const timeTargets = [30, 60, 120, 300]; // seconds
    const target = timeTargets[Math.floor(random() * timeTargets.length)];

    const difficulties = [
      { name: "Speed Runner", icon: "⚡", difficulty: "easy" as const },
      { name: "Lightning Fast", icon: "⚡⚡", difficulty: "medium" as const },
      { name: "Time Master", icon: "⏰", difficulty: "hard" as const },
      { name: "Chronos", icon: "⏱️", difficulty: "expert" as const },
    ];

    const difficulty = difficulties[Math.floor(random() * difficulties.length)];

    return {
      id: `time_${this.currentDate}_${target}`,
      name: difficulty.name,
      description: `Complete a game in under ${target} seconds`,
      icon: difficulty.icon,
      type: "time",
      difficulty: difficulty.difficulty,
      reward: {
        type: "points",
        amount: (300 - target) * 2,
      },
      condition: {
        type: "time",
        value: target,
        operator: "lte",
      },
      date: this.currentDate,
      expiresAt: this.getExpirationTime(),
      isCompleted: false,
      progress: 0,
      maxProgress: target,
      isActive: true,
    };
  }

  private generateModeChallenge(random: () => number): DailyChallenge | null {
    const modes = [
      { id: "time-attack", name: "Time Attack", icon: "⏱️" },
      { id: "endless", name: "Endless", icon: "♾️" },
      { id: "hardcore", name: "Hardcore", icon: "💀" },
      { id: "blind", name: "Blind", icon: "🕶️" },
      { id: "memory", name: "Memory", icon: "🧠" },
    ];

    const mode = modes[Math.floor(random() * modes.length)];
    const completions = [1, 2, 3, 5];
    const target = completions[Math.floor(random() * completions.length)];

    const difficulties = [
      { name: "Mode Explorer", difficulty: "easy" as const },
      { name: "Mode Specialist", difficulty: "medium" as const },
      { name: "Mode Master", difficulty: "hard" as const },
      { name: "Mode Legend", difficulty: "expert" as const },
    ];

    const difficulty = difficulties[Math.floor(random() * difficulties.length)];

    return {
      id: `mode_${this.currentDate}_${mode.id}`,
      name: `${difficulty.name} - ${mode.name}`,
      description: `Complete ${target} ${mode.name} game${
        target > 1 ? "s" : ""
      }`,
      icon: mode.icon,
      type: "mode",
      difficulty: difficulty.difficulty,
      reward: {
        type: "points",
        amount: target * 50,
      },
      condition: {
        type: "mode_completion",
        value: target,
        mode: mode.id,
      },
      date: this.currentDate,
      expiresAt: this.getExpirationTime(),
      isCompleted: false,
      progress: 0,
      maxProgress: target,
      isActive: true,
    };
  }

  private generateSpecialChallenge(
    random: () => number
  ): DailyChallenge | null {
    const specialChallenges = [
      {
        name: "Perfect Game",
        description: "Complete a game without using continues",
        icon: "✨",
        condition: { type: "perfect_game" as const, value: 1 },
        reward: { type: "points" as const, amount: 100 },
        difficulty: "medium" as const,
      },
      {
        name: "Streak Master",
        description: "Win 5 games in a row",
        icon: "🔥",
        condition: {
          type: "streak" as const,
          value: 5,
          operator: "gte" as const,
        },
        reward: { type: "points" as const, amount: 150 },
        difficulty: "hard" as const,
      },
      {
        name: "Speed Demon",
        description: "Complete 3 games in under 60 seconds each",
        icon: "⚡",
        condition: { type: "combo" as const, value: 3 },
        reward: { type: "points" as const, amount: 200 },
        difficulty: "expert" as const,
      },
      {
        name: "Mode Hopper",
        description: "Play 3 different game modes in one day",
        icon: "🎮",
        condition: { type: "combo" as const, value: 3 },
        reward: { type: "points" as const, amount: 75 },
        difficulty: "easy" as const,
      },
    ];

    const challenge =
      specialChallenges[Math.floor(random() * specialChallenges.length)];

    return {
      id: `special_${this.currentDate}_${challenge.name
        .toLowerCase()
        .replace(/\s+/g, "_")}`,
      name: challenge.name,
      description: challenge.description,
      icon: challenge.icon,
      type: "special",
      difficulty: challenge.difficulty,
      reward: challenge.reward,
      condition: challenge.condition,
      date: this.currentDate,
      expiresAt: this.getExpirationTime(),
      isCompleted: false,
      progress: 0,
      maxProgress: challenge.condition.value,
      isActive: true,
    };
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  private getCurrentDate(): string {
    return new Date().toISOString().split("T")[0];
  }

  private getDateSeed(date: string): number {
    // Create a seed based on the date
    const dateObj = new Date(date);
    return dateObj.getTime() % 1000000;
  }

  private seededRandom(seed: number): () => number {
    let currentSeed = seed;
    return () => {
      currentSeed = (currentSeed * 9301 + 49297) % 233280;
      return currentSeed / 233280;
    };
  }

  private getExpirationTime(): number {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow.getTime();
  }
}

// ============================================================================
// DAILY CHALLENGE MANAGER
// ============================================================================

export class DailyChallengeManager {
  private generator: DailyChallengeGenerator;
  private userChallenges: Map<string, DailyChallenge> = new Map();
  private userId: string;

  constructor() {
    this.generator = DailyChallengeGenerator.getInstance();
    this.userId = this.getUserId();
    this.loadUserChallenges();
  }

  /**
   * Get today's challenges
   */
  getTodaysChallenges(): DailyChallenge[] {
    const challenges = this.generator.getTodaysChallenges();

    // Load user progress for each challenge
    return challenges.map((challenge) => {
      const userChallenge = this.userChallenges.get(challenge.id);
      if (userChallenge) {
        return { ...challenge, ...userChallenge };
      }
      return challenge;
    });
  }

  /**
   * Check and update challenge progress
   */
  checkChallengeProgress(
    gameState: GameState,
    gameMode: GameMode,
    gameTime?: number
  ): DailyChallenge[] {
    const completedChallenges: DailyChallenge[] = [];
    const challenges = this.getTodaysChallenges();

    for (const challenge of challenges) {
      if (challenge.isCompleted) continue;

      const progress = this.calculateProgress(
        challenge,
        gameState,
        gameMode,
        gameTime
      );
      const isCompleted = this.checkCompletion(
        challenge,
        gameState,
        gameMode,
        gameTime
      );

      // Update progress
      challenge.progress = progress;
      if (isCompleted) {
        challenge.isCompleted = true;
        completedChallenges.push(challenge);
      }

      // Save updated challenge
      this.userChallenges.set(challenge.id, challenge);
    }

    this.saveUserChallenges();
    return completedChallenges;
  }

  /**
   * Get challenge progress
   */
  getChallengeProgress(challengeId: string): ChallengeProgress | null {
    const challenge = this.userChallenges.get(challengeId);
    if (!challenge) return null;

    const now = Date.now();
    const timeRemaining = Math.max(0, challenge.expiresAt - now);

    return {
      challengeId,
      current: challenge.progress,
      target: challenge.maxProgress,
      percentage: Math.round(
        (challenge.progress / challenge.maxProgress) * 100
      ),
      isCompleted: challenge.isCompleted,
      timeRemaining,
    };
  }

  /**
   * Get user challenge statistics
   */
  getUserChallengeStats(): UserChallengeStats {
    const challenges = Array.from(this.userChallenges.values());
    const completed = challenges.filter((c) => c.isCompleted);
    const total = challenges.length;
    const completionRate = total > 0 ? completed.length / total : 0;
    const totalRewards = completed.reduce((sum, c) => sum + c.reward.amount, 0);

    // Calculate streak (simplified)
    const currentStreak = this.calculateCurrentStreak();
    const longestStreak = this.calculateLongestStreak();

    return {
      totalChallenges: total,
      completedChallenges: completed.length,
      completionRate: Math.round(completionRate * 100) / 100,
      totalRewards,
      currentStreak,
      longestStreak,
      lastCompleted:
        completed.length > 0
          ? Math.max(...completed.map((c) => c.expiresAt))
          : 0,
    };
  }

  /**
   * Get challenges by difficulty
   */
  getChallengesByDifficulty(difficulty: string): DailyChallenge[] {
    return this.getTodaysChallenges().filter(
      (c) => c.difficulty === difficulty
    );
  }

  /**
   * Get challenges by type
   */
  getChallengesByType(type: string): DailyChallenge[] {
    return this.getTodaysChallenges().filter((c) => c.type === type);
  }

  /**
   * Reset daily challenges (for testing)
   */
  resetDailyChallenges(): void {
    this.userChallenges.clear();
    this.saveUserChallenges();
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  private getUserId(): string {
    let userId = localStorage.getItem("challenge_user_id");
    if (!userId) {
      userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem("challenge_user_id", userId);
    }
    return userId;
  }

  private loadUserChallenges(): void {
    const data = localStorage.getItem(`challenges_${this.userId}`);
    if (data) {
      const challenges = JSON.parse(data);
      this.userChallenges = new Map(challenges);
    }
  }

  private saveUserChallenges(): void {
    const data = Array.from(this.userChallenges.entries());
    localStorage.setItem(`challenges_${this.userId}`, JSON.stringify(data));
  }

  private calculateProgress(
    challenge: DailyChallenge,
    gameState: GameState,
    gameMode: GameMode,
    gameTime?: number
  ): number {
    const condition = challenge.condition;

    switch (condition.type) {
      case "score":
        return Math.min(gameState.score, condition.value);
      case "time":
        return gameTime !== undefined ? Math.min(gameTime, condition.value) : 0;
      case "streak":
        return Math.min(gameState.streak, condition.value);
      case "mode_completion":
        return condition.mode === gameMode.id ? 1 : 0;
      case "perfect_game":
        return gameState.continueCount === 0 && gameState.status === "won"
          ? 1
          : 0;
      case "combo":
        // This would need more complex tracking
        return 0;
      default:
        return 0;
    }
  }

  private checkCompletion(
    challenge: DailyChallenge,
    gameState: GameState,
    gameMode: GameMode,
    gameTime?: number
  ): boolean {
    const condition = challenge.condition;

    switch (condition.type) {
      case "score":
        return gameState.score >= condition.value;
      case "time":
        return gameTime !== undefined && gameTime <= condition.value;
      case "streak":
        return gameState.streak >= condition.value;
      case "mode_completion":
        return condition.mode === gameMode.id;
      case "perfect_game":
        return gameState.continueCount === 0 && gameState.status === "won";
      case "combo":
        // This would need more complex tracking
        return false;
      default:
        return false;
    }
  }

  private calculateCurrentStreak(): number {
    // Simplified streak calculation
    const challenges = Array.from(this.userChallenges.values());
    const completed = challenges.filter((c) => c.isCompleted);
    return completed.length;
  }

  private calculateLongestStreak(): number {
    // Simplified longest streak calculation
    return this.calculateCurrentStreak();
  }
}

// ============================================================================
// CHALLENGE HOOKS
// ============================================================================

/**
 * React hook for daily challenges
 */
export function useDailyChallenges() {
  const challengeManager = new DailyChallengeManager();

  return {
    getTodaysChallenges:
      challengeManager.getTodaysChallenges.bind(challengeManager),
    checkChallengeProgress:
      challengeManager.checkChallengeProgress.bind(challengeManager),
    getChallengeProgress:
      challengeManager.getChallengeProgress.bind(challengeManager),
    getUserChallengeStats:
      challengeManager.getUserChallengeStats.bind(challengeManager),
    getChallengesByDifficulty:
      challengeManager.getChallengesByDifficulty.bind(challengeManager),
    getChallengesByType:
      challengeManager.getChallengesByType.bind(challengeManager),
    resetDailyChallenges:
      challengeManager.resetDailyChallenges.bind(challengeManager),
  };
}

// Singleton instances
export const dailyChallengeGenerator = DailyChallengeGenerator.getInstance();
export const dailyChallengeManager = new DailyChallengeManager();
