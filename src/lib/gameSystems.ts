/**
 * Game Systems Integration
 * Central hub for all game systems and features
 */

import { GameMode } from "@/types/gameMode";
import { GameState } from "@/types/game";

// Import all system managers
import { analyticsManager } from "./analytics";
import { achievementManager } from "./achievements";
import { dailyChallengeManager } from "./dailyChallenges";
import {
  leaderboardManager,
  socialSharingManager,
  friendSystemManager,
  challengeSystemManager,
} from "./socialFeatures";
import { performanceOptimizer } from "./performanceOptimizer";
import { specialEventsManager, abTestingManager } from "./specialEvents";
import { continuePaymentManager } from "./paymentManager";

// ============================================================================
// GAME SYSTEMS MANAGER
// ============================================================================

export class GameSystemsManager {
  public analytics = analyticsManager;
  public achievements = achievementManager;
  public dailyChallenges = dailyChallengeManager;
  public leaderboard = leaderboardManager;
  public socialSharing = socialSharingManager;
  public friends = friendSystemManager;
  public challenges = challengeSystemManager;
  public performance = performanceOptimizer;
  public specialEvents = specialEventsManager;
  public abTesting = abTestingManager;
  public payment = continuePaymentManager;

  constructor() {
    // Initialize all systems
  }

  /**
   * Initialize all game systems
   */
  initialize(): void {
    console.log("🎮 Initializing game systems...");

    // Start performance monitoring
    this.performance.applyOptimizations();

    // Update active events
    this.specialEvents.getActiveEvents();

    // Update daily challenges
    this.dailyChallenges.getTodaysChallenges();

    console.log("✅ All game systems initialized");
  }

  /**
   * Handle game start
   */
  onGameStart(gameMode: GameMode, gameState: GameState): void {
    // Start analytics session
    analyticsManager.startGameSession(gameMode, gameState);

    // Track mode selection
    analyticsManager.trackModeSelection(gameMode);

    // Apply event features
    const modifiedMode = specialEventsManager.applyEventFeatures(gameMode);
    console.log("Applied event features to mode:", modifiedMode.id);

    // Check for A/B test variants
    const continueButtonTest = abTestingManager.getUserVariant(
      "continue_button_color"
    );
    if (continueButtonTest) {
      console.log("🧪 A/B test active:", continueButtonTest.name);
    }

    console.log("🎮 Game started:", gameMode.name);
  }

  /**
   * Handle game end
   */
  onGameEnd(gameState: GameState, gameMode: GameMode, gameTime?: number): void {
    // End analytics session
    analyticsManager.endGameSession(gameState, "completed");

    // Check achievements
    const unlockedAchievements = achievementManager.checkAchievements(
      gameState,
      gameMode,
      gameTime
    );
    if (unlockedAchievements.length > 0) {
      console.log(
        "🏆 Achievements unlocked:",
        unlockedAchievements.map((a) => a.name)
      );

      // Track achievement unlocks
      unlockedAchievements.forEach((achievement) => {
        analyticsManager.trackAchievement(achievement.id, gameState);
      });
    }

    // Check daily challenges
    const completedChallenges = dailyChallengeManager.checkChallengeProgress(
      gameState,
      gameMode,
      gameTime
    );
    if (completedChallenges.length > 0) {
      console.log(
        "🎯 Daily challenges completed:",
        completedChallenges.map((c) => c.name)
      );
    }

    // Submit score to leaderboard
    if (gameState.status === "won") {
      leaderboardManager.submitScore(
        gameMode.id,
        gameState.score,
        gameState.level,
        gameTime || 0
      );
    }

    // Record A/B test conversions
    if (gameState.continueCount > 0) {
      abTestingManager.recordConversion(
        "continue_pricing",
        gameState.continueCount
      );
    }

    console.log("🎮 Game ended:", gameState.status);
  }

  /**
   * Handle continue usage
   */
  onContinue(gameMode: GameMode, gameState: GameState, cost: number): void {
    // Track continue usage
    analyticsManager.trackContinue(gameMode, gameState, cost);

    // Record A/B test conversion
    abTestingManager.recordConversion("continue_pricing", cost);

    console.log("🔄 Continue used:", cost, "WLD");
  }

  /**
   * Handle hint usage
   */
  onHintUsed(hintType: string, gameState: GameState): void {
    analyticsManager.trackHintUsed(hintType, gameState);
    console.log("💡 Hint used:", hintType);
  }

  /**
   * Handle undo usage
   */
  onUndo(gameState: GameState): void {
    analyticsManager.trackUndo(gameState);
    console.log("↩️ Undo used");
  }

  /**
   * Handle payment completion
   */
  onPaymentComplete(transaction: {
    id: string;
    amount: number;
    status: string;
    transactionId?: string;
  }): void {
    analyticsManager.trackPayment({
      transactionId: transaction.transactionId || transaction.id,
      userId: "user", // This would come from context
      gameMode: "classic", // This would come from context
      amount: transaction.amount,
      currency: "WLD",
      status: transaction.status as "success" | "failed" | "cancelled",
      timestamp: Date.now(),
      paymentMethod: "worldcoin", // This would come from context
      continueCount: 0,
      level: 1, // This would come from context
      score: 0, // This would come from context
    });
    console.log(
      "💳 Payment completed:",
      transaction.transactionId || transaction.id
    );
  }

  /**
   * Handle social share
   */
  onSocialShare(
    shareType: string,
    data: {
      score?: number;
      mode?: string;
      message?: string;
      gameState?: GameState;
      gameMode?: GameMode;
      time?: number;
      achievementId?: string;
      achievementName?: string;
      points?: number;
      streak?: number;
      challengeName?: string;
      reward?: number;
    }
  ): void {
    switch (shareType) {
      case "score":
        if (data.gameState && data.gameMode) {
          socialSharingManager.shareScore(
            data.gameState,
            data.gameMode,
            data.time || 0
          );
        }
        break;
      case "achievement":
        if (data.achievementId && data.achievementName && data.points) {
          socialSharingManager.shareAchievement(
            data.achievementId,
            data.achievementName,
            data.points
          );
        }
        break;
      case "streak":
        if (data.streak && data.mode) {
          socialSharingManager.shareStreak(data.streak, data.mode);
        }
        break;
      case "challenge":
        if (data.challengeName && data.reward) {
          socialSharingManager.shareChallenge(data.challengeName, data.reward);
        }
        break;
    }

    console.log("📱 Social share:", shareType);
  }

  /**
   * Get comprehensive game statistics
   */
  getGameStatistics(): {
    analytics: ReturnType<typeof analyticsManager.getAllAnalytics>;
    achievements: ReturnType<typeof achievementManager.getAchievementStats>;
    challenges: ReturnType<typeof dailyChallengeManager.getUserChallengeStats>;
    social: ReturnType<typeof leaderboardManager.getLeaderboardStats>;
    performance: ReturnType<
      ReturnType<typeof performanceOptimizer.getMonitor>["getPerformanceReport"]
    >;
    events: ReturnType<typeof specialEventsManager.getActiveEvents>;
  } {
    return {
      analytics: analyticsManager.getAllAnalytics(),
      achievements: achievementManager.getAchievementStats(),
      challenges: dailyChallengeManager.getUserChallengeStats(),
      social: leaderboardManager.getLeaderboardStats("classic"),
      performance: performanceOptimizer.getMonitor().getPerformanceReport(),
      events: specialEventsManager.getActiveEvents(),
    };
  }

  /**
   * Export all game data
   */
  exportGameData(): string {
    const data = {
      analytics: analyticsManager.exportAnalytics(),
      achievements: achievementManager.getUserAchievements(),
      challenges: dailyChallengeManager.getTodaysChallenges(),
      social: {
        friends: friendSystemManager.getFriends(),
        challenges: challengeSystemManager.getChallengesForUser(),
      },
      performance: performanceOptimizer.getMonitor().getPerformanceReport(),
      events: specialEventsManager.getActiveEvents(),
      timestamp: Date.now(),
    };

    return JSON.stringify(data, null, 2);
  }

  /**
   * Clear all game data
   */
  clearGameData(): void {
    analyticsManager.clearAnalytics();
    // Reset achievements
    dailyChallengeManager.resetDailyChallenges();
    performanceOptimizer.getMonitor().clearMetrics();

    console.log("🗑️ All game data cleared");
  }

  /**
   * Get system health status
   */
  getSystemHealth(): {
    status: "healthy" | "warning" | "critical";
    issues: string[];
    recommendations: string[];
  } {
    const issues: string[] = [];
    const recommendations: string[] = [];

    // Check performance
    const performanceReport = performanceOptimizer
      .getMonitor()
      .getPerformanceReport();
    if (performanceReport.performanceScore < 50) {
      issues.push("Performance is critically low");
      recommendations.push("Enable performance optimizations");
    } else if (performanceReport.performanceScore < 75) {
      issues.push("Performance is below optimal");
      recommendations.push("Consider enabling moderate optimizations");
    }

    // Check memory usage
    if (performanceReport.peakMemoryUsage > 200) {
      issues.push("High memory usage detected");
      recommendations.push("Enable memory management optimizations");
    }

    // Check analytics
    const analytics = analyticsManager.getAllAnalytics();
    if (analytics.sessions.length === 0) {
      issues.push("No analytics data collected");
      recommendations.push("Enable analytics tracking");
    }

    // Determine overall status
    let status: "healthy" | "warning" | "critical" = "healthy";
    if (issues.length > 0) {
      status = issues.some((issue) => issue.includes("critically"))
        ? "critical"
        : "warning";
    }

    return {
      status,
      issues,
      recommendations,
    };
  }
}

// ============================================================================
// GAME SYSTEMS HOOK
// ============================================================================

/**
 * React hook for all game systems
 */
export function useGameSystems() {
  const gameSystems = new GameSystemsManager();

  return {
    // System management
    initialize: gameSystems.initialize.bind(gameSystems),
    getSystemHealth: gameSystems.getSystemHealth.bind(gameSystems),
    getGameStatistics: gameSystems.getGameStatistics.bind(gameSystems),
    exportGameData: gameSystems.exportGameData.bind(gameSystems),
    clearGameData: gameSystems.clearGameData.bind(gameSystems),

    // Game events
    onGameStart: gameSystems.onGameStart.bind(gameSystems),
    onGameEnd: gameSystems.onGameEnd.bind(gameSystems),
    onContinue: gameSystems.onContinue.bind(gameSystems),
    onHintUsed: gameSystems.onHintUsed.bind(gameSystems),
    onUndo: gameSystems.onUndo.bind(gameSystems),
    onPaymentComplete: gameSystems.onPaymentComplete.bind(gameSystems),
    onSocialShare: gameSystems.onSocialShare.bind(gameSystems),

    // Individual system access
    analytics: analyticsManager,
    achievements: achievementManager,
    dailyChallenges: dailyChallengeManager,
    socialFeatures: {
      submitScore: leaderboardManager.submitScore.bind(leaderboardManager),
      getLeaderboardStats:
        leaderboardManager.getLeaderboardStats.bind(leaderboardManager),
      getFriends: friendSystemManager.getFriends.bind(friendSystemManager),
      getChallengesForUser: challengeSystemManager.getChallengesForUser.bind(
        challengeSystemManager
      ),
      shareScore: socialSharingManager.shareScore.bind(socialSharingManager),
      shareAchievement:
        socialSharingManager.shareAchievement.bind(socialSharingManager),
      shareStreak: socialSharingManager.shareStreak.bind(socialSharingManager),
      shareChallenge:
        socialSharingManager.shareChallenge.bind(socialSharingManager),
    },
    performance: performanceOptimizer,
    specialEvents: specialEventsManager,
  };
}

// ============================================================================
// SYSTEM INTEGRATION UTILITIES
// ============================================================================

/**
 * Initialize all game systems on app start
 */
export function initializeGameSystems(): void {
  const gameSystems = new GameSystemsManager();
  gameSystems.initialize();
}

/**
 * Get system status for debugging
 */
export function getSystemStatus(): {
  analytics: boolean;
  achievements: boolean;
  challenges: boolean;
  social: boolean;
  performance: boolean;
  events: boolean;
  payment: boolean;
} {
  return {
    analytics: true, // Always available
    achievements: true, // Always available
    challenges: true, // Always available
    social: true, // Always available
    performance: true, // Always available
    events: true, // Always available
    payment: continuePaymentManager.isPaymentAvailable(),
  };
}

/**
 * Get system version information
 */
export function getSystemVersions(): Record<string, string> {
  return {
    analytics: "1.0.0",
    achievements: "1.0.0",
    challenges: "1.0.0",
    social: "1.0.0",
    performance: "1.0.0",
    events: "1.0.0",
    payment: "1.0.0",
    core: "1.0.0",
  };
}

// Singleton instance
export const gameSystemsManager = new GameSystemsManager();
