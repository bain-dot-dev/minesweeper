/**
 * Analytics & Tracking System
 * Comprehensive analytics for game modes, user behavior, and revenue tracking
 */

import { GameState } from "@/types/game";
import { GameMode } from "@/types/gameMode";

// ============================================================================
// ANALYTICS TYPES
// ============================================================================

export interface GameSession {
  sessionId: string;
  userId: string;
  gameMode: string;
  startTime: number;
  endTime: number | null;
  duration: number;
  outcome: "won" | "lost" | "abandoned";
  finalScore: number;
  level: number;
  continueCount: number;
  continueCost: number;
  totalRevenue: number;
  moveCount: number;
  flagCount: number;
  accuracy: number;
  timestamp: number;
}

export interface ModeAnalytics {
  modeId: string;
  userId: string;
  sessions: number;
  totalScore: number;
  highScore: number;
  averageTime: number;
  fastestTime: number;
  winRate: number;
  totalGames: number;
  wins: number;
  losses: number;
  continuesUsed: number;
  revenueGenerated: number;
  averageContinuesPerSession: number;
  lastPlayed: Date;
  firstPlayed: Date;
}

export interface UserAnalytics {
  userId: string;
  totalSessions: number;
  totalPlayTime: number;
  totalScore: number;
  highestScore: number;
  favoriteMode: string;
  totalRevenue: number;
  lifetimeWins: number;
  lifetimeLosses: number;
  averageAccuracy: number;
  modesPlayed: string[];
  achievements: string[];
  lastActive: Date;
  accountCreated: Date;
}

export interface RevenueAnalytics {
  totalRevenue: number;
  revenueByMode: Record<string, number>;
  revenueByDay: Record<string, number>;
  averageRevenuePerUser: number;
  topSpendingUsers: Array<{ userId: string; amount: number }>;
  continueConversionRate: number;
  averageContinuesPerSession: number;
}

export interface PerformanceMetrics {
  averageLoadTime: number;
  averageFPS: number;
  memoryUsage: number;
  crashRate: number;
  errorRate: number;
  apiLatency: number;
}

export interface AnalyticsEvent {
  type: AnalyticsEventType;
  userId: string;
  sessionId: string;
  timestamp: number;
  data: Record<string, unknown>;
}

export type AnalyticsEventType =
  | "game_started"
  | "game_ended"
  | "game_won"
  | "game_lost"
  | "game_abandoned"
  | "continue_offered"
  | "continue_accepted"
  | "continue_declined"
  | "payment_initiated"
  | "payment_completed"
  | "payment_failed"
  | "mode_selected"
  | "level_completed"
  | "achievement_unlocked"
  | "error_occurred"
  | "performance_issue";

// ============================================================================
// ANALYTICS TRACKER
// ============================================================================

export class AnalyticsTracker {
  private events: AnalyticsEvent[] = [];
  private sessions: Map<string, GameSession> = new Map();
  private modeAnalytics: Map<string, ModeAnalytics> = new Map();
  private userAnalytics: Map<string, UserAnalytics> = new Map();
  private isEnabled: boolean = true;
  private batchSize: number = 50;
  private flushInterval: number = 30000; // 30 seconds
  private flushTimer: NodeJS.Timeout | null = null;

  constructor(config?: { enabled?: boolean; batchSize?: number; flushInterval?: number }) {
    this.isEnabled = config?.enabled ?? true;
    this.batchSize = config?.batchSize ?? 50;
    this.flushInterval = config?.flushInterval ?? 30000;

    if (this.isEnabled) {
      this.startAutoFlush();
    }
  }

  /**
   * Track analytics event
   */
  trackEvent(type: AnalyticsEventType, userId: string, sessionId: string, data: Record<string, unknown> = {}): void {
    if (!this.isEnabled) return;

    const event: AnalyticsEvent = {
      type,
      userId,
      sessionId,
      timestamp: Date.now(),
      data,
    };

    this.events.push(event);
    console.log(`📊 Analytics Event: ${type}`, data);

    // Auto-flush if batch size reached
    if (this.events.length >= this.batchSize) {
      this.flush();
    }
  }

  /**
   * Start game session tracking
   */
  startGameSession(userId: string, gameMode: string): string {
    const sessionId = this.generateSessionId();
    const session: GameSession = {
      sessionId,
      userId,
      gameMode,
      startTime: Date.now(),
      endTime: null,
      duration: 0,
      outcome: "abandoned",
      finalScore: 0,
      level: 1,
      continueCount: 0,
      continueCost: 0,
      totalRevenue: 0,
      moveCount: 0,
      flagCount: 0,
      accuracy: 0,
      timestamp: Date.now(),
    };

    this.sessions.set(sessionId, session);
    this.trackEvent("game_started", userId, sessionId, { gameMode });

    return sessionId;
  }

  /**
   * End game session tracking
   */
  endGameSession(sessionId: string, gameState: GameState, outcome: "won" | "lost" | "abandoned"): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    session.endTime = Date.now();
    session.duration = session.endTime - session.startTime;
    session.outcome = outcome;
    session.finalScore = gameState.score;
    session.level = gameState.level;
    session.continueCount = gameState.continueCount;
    session.moveCount = gameState.moveCount;
    session.flagCount = gameState.flagCount;
    session.accuracy = this.calculateAccuracy(gameState);
    session.totalRevenue = session.continueCount * session.continueCost;

    // Track end event
    this.trackEvent(outcome === "won" ? "game_won" : outcome === "lost" ? "game_lost" : "game_abandoned", session.userId, sessionId, {
      duration: session.duration,
      score: session.finalScore,
      level: session.level,
      continueCount: session.continueCount,
    });

    // Update mode analytics
    this.updateModeAnalytics(session);

    // Update user analytics
    this.updateUserAnalytics(session);
  }

  /**
   * Track continue offer
   */
  trackContinueOffer(userId: string, sessionId: string, cost: number): void {
    this.trackEvent("continue_offered", userId, sessionId, { cost });
  }

  /**
   * Track continue acceptance
   */
  trackContinueAccepted(userId: string, sessionId: string, cost: number): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.continueCount++;
      session.continueCost = cost;
      session.totalRevenue += cost;
    }

    this.trackEvent("continue_accepted", userId, sessionId, { cost, count: session?.continueCount });
  }

  /**
   * Track continue decline
   */
  trackContinueDeclined(userId: string, sessionId: string, cost: number): void {
    this.trackEvent("continue_declined", userId, sessionId, { cost });
  }

  /**
   * Track payment flow
   */
  trackPaymentInitiated(userId: string, sessionId: string, amount: number): void {
    this.trackEvent("payment_initiated", userId, sessionId, { amount });
  }

  trackPaymentCompleted(userId: string, sessionId: string, amount: number, transactionId: string): void {
    this.trackEvent("payment_completed", userId, sessionId, { amount, transactionId });
  }

  trackPaymentFailed(userId: string, sessionId: string, amount: number, error: string): void {
    this.trackEvent("payment_failed", userId, sessionId, { amount, error });
  }

  /**
   * Track mode selection
   */
  trackModeSelected(userId: string, modeId: string): void {
    this.trackEvent("mode_selected", userId, "", { modeId });
  }

  /**
   * Track level completion
   */
  trackLevelCompleted(userId: string, sessionId: string, level: number, score: number, time: number): void {
    this.trackEvent("level_completed", userId, sessionId, { level, score, time });
  }

  /**
   * Track achievement unlock
   */
  trackAchievementUnlocked(userId: string, achievementId: string): void {
    this.trackEvent("achievement_unlocked", userId, "", { achievementId });
  }

  /**
   * Track errors
   */
  trackError(userId: string, sessionId: string, error: Error, context?: Record<string, unknown>): void {
    this.trackEvent("error_occurred", userId, sessionId, {
      error: error.message,
      stack: error.stack,
      ...context,
    });
  }

  /**
   * Track performance issues
   */
  trackPerformanceIssue(userId: string, sessionId: string, metric: string, value: number): void {
    this.trackEvent("performance_issue", userId, sessionId, { metric, value });
  }

  /**
   * Get mode analytics
   */
  getModeAnalytics(modeId: string, userId?: string): ModeAnalytics | null {
    const key = userId ? `${modeId}:${userId}` : modeId;
    return this.modeAnalytics.get(key) || null;
  }

  /**
   * Get user analytics
   */
  getUserAnalytics(userId: string): UserAnalytics | null {
    return this.userAnalytics.get(userId) || null;
  }

  /**
   * Get revenue analytics
   */
  getRevenueAnalytics(): RevenueAnalytics {
    let totalRevenue = 0;
    const revenueByMode: Record<string, number> = {};
    const revenueByDay: Record<string, number> = {};
    const userRevenue: Map<string, number> = new Map();

    this.sessions.forEach((session) => {
      totalRevenue += session.totalRevenue;

      // By mode
      revenueByMode[session.gameMode] = (revenueByMode[session.gameMode] || 0) + session.totalRevenue;

      // By day
      const day = new Date(session.startTime).toISOString().split("T")[0];
      revenueByDay[day] = (revenueByDay[day] || 0) + session.totalRevenue;

      // By user
      const currentUserRevenue = userRevenue.get(session.userId) || 0;
      userRevenue.set(session.userId, currentUserRevenue + session.totalRevenue);
    });

    const topSpendingUsers = Array.from(userRevenue.entries())
      .map(([userId, amount]) => ({ userId, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 10);

    const totalContinueOffers = this.events.filter((e) => e.type === "continue_offered").length;
    const totalContinueAccepted = this.events.filter((e) => e.type === "continue_accepted").length;
    const continueConversionRate = totalContinueOffers > 0 ? totalContinueAccepted / totalContinueOffers : 0;

    const totalContinues = Array.from(this.sessions.values()).reduce((sum, s) => sum + s.continueCount, 0);
    const averageContinuesPerSession = this.sessions.size > 0 ? totalContinues / this.sessions.size : 0;

    return {
      totalRevenue,
      revenueByMode,
      revenueByDay,
      averageRevenuePerUser: userRevenue.size > 0 ? totalRevenue / userRevenue.size : 0,
      topSpendingUsers,
      continueConversionRate,
      averageContinuesPerSession,
    };
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics(): PerformanceMetrics {
    // This would be populated from real performance monitoring
    return {
      averageLoadTime: 0,
      averageFPS: 60,
      memoryUsage: 0,
      crashRate: 0,
      errorRate: 0,
      apiLatency: 0,
    };
  }

  /**
   * Get all events
   */
  getEvents(filter?: { type?: AnalyticsEventType; userId?: string; sessionId?: string }): AnalyticsEvent[] {
    let events = this.events;

    if (filter) {
      events = events.filter((event) => {
        if (filter.type && event.type !== filter.type) return false;
        if (filter.userId && event.userId !== filter.userId) return false;
        if (filter.sessionId && event.sessionId !== filter.sessionId) return false;
        return true;
      });
    }

    return [...events];
  }

  /**
   * Flush events to analytics service
   */
  async flush(): Promise<void> {
    if (this.events.length === 0) return;

    console.log(`📤 Flushing ${this.events.length} analytics events...`);

    // In production, send to analytics service
    // await this.sendToAnalyticsService(this.events);

    // For now, log and clear
    this.events = [];
  }

  /**
   * Clear all analytics data
   */
  clear(): void {
    this.events = [];
    this.sessions.clear();
    this.modeAnalytics.clear();
    this.userAnalytics.clear();
  }

  /**
   * Enable/disable analytics
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;

    if (enabled) {
      this.startAutoFlush();
    } else {
      this.stopAutoFlush();
    }
  }

  /**
   * Export analytics data
   */
  exportData(): {
    events: AnalyticsEvent[];
    sessions: GameSession[];
    modeAnalytics: ModeAnalytics[];
    userAnalytics: UserAnalytics[];
  } {
    return {
      events: [...this.events],
      sessions: Array.from(this.sessions.values()),
      modeAnalytics: Array.from(this.modeAnalytics.values()),
      userAnalytics: Array.from(this.userAnalytics.values()),
    };
  }

  /**
   * Import analytics data
   */
  importData(data: {
    events?: AnalyticsEvent[];
    sessions?: GameSession[];
    modeAnalytics?: ModeAnalytics[];
    userAnalytics?: UserAnalytics[];
  }): void {
    if (data.events) this.events = data.events;
    if (data.sessions) {
      this.sessions.clear();
      data.sessions.forEach((session) => this.sessions.set(session.sessionId, session));
    }
    if (data.modeAnalytics) {
      this.modeAnalytics.clear();
      data.modeAnalytics.forEach((analytics) => this.modeAnalytics.set(analytics.modeId, analytics));
    }
    if (data.userAnalytics) {
      this.userAnalytics.clear();
      data.userAnalytics.forEach((analytics) => this.userAnalytics.set(analytics.userId, analytics));
    }
  }

  /**
   * Private helper methods
   */

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }

  private calculateAccuracy(gameState: GameState): number {
    const totalCells = gameState.config.width * gameState.config.height;
    const correctReveals = gameState.revealedCount - (gameState.hitMine ? 1 : 0);
    return totalCells > 0 ? correctReveals / totalCells : 0;
  }

  private updateModeAnalytics(session: GameSession): void {
    const key = `${session.gameMode}:${session.userId}`;
    let analytics = this.modeAnalytics.get(key);

    if (!analytics) {
      analytics = {
        modeId: session.gameMode,
        userId: session.userId,
        sessions: 0,
        totalScore: 0,
        highScore: 0,
        averageTime: 0,
        fastestTime: Infinity,
        winRate: 0,
        totalGames: 0,
        wins: 0,
        losses: 0,
        continuesUsed: 0,
        revenueGenerated: 0,
        averageContinuesPerSession: 0,
        lastPlayed: new Date(),
        firstPlayed: new Date(),
      };
    }

    analytics.sessions++;
    analytics.totalGames++;
    analytics.totalScore += session.finalScore;
    analytics.highScore = Math.max(analytics.highScore, session.finalScore);
    analytics.averageTime = (analytics.averageTime * (analytics.sessions - 1) + session.duration) / analytics.sessions;
    analytics.fastestTime = Math.min(analytics.fastestTime, session.duration);
    analytics.continuesUsed += session.continueCount;
    analytics.revenueGenerated += session.totalRevenue;
    analytics.lastPlayed = new Date();

    if (session.outcome === "won") {
      analytics.wins++;
    } else if (session.outcome === "lost") {
      analytics.losses++;
    }

    analytics.winRate = analytics.totalGames > 0 ? analytics.wins / analytics.totalGames : 0;
    analytics.averageContinuesPerSession = analytics.sessions > 0 ? analytics.continuesUsed / analytics.sessions : 0;

    this.modeAnalytics.set(key, analytics);
  }

  private updateUserAnalytics(session: GameSession): void {
    let analytics = this.userAnalytics.get(session.userId);

    if (!analytics) {
      analytics = {
        userId: session.userId,
        totalSessions: 0,
        totalPlayTime: 0,
        totalScore: 0,
        highestScore: 0,
        favoriteMode: session.gameMode,
        totalRevenue: 0,
        lifetimeWins: 0,
        lifetimeLosses: 0,
        averageAccuracy: 0,
        modesPlayed: [],
        achievements: [],
        lastActive: new Date(),
        accountCreated: new Date(),
      };
    }

    analytics.totalSessions++;
    analytics.totalPlayTime += session.duration;
    analytics.totalScore += session.finalScore;
    analytics.highestScore = Math.max(analytics.highestScore, session.finalScore);
    analytics.totalRevenue += session.totalRevenue;
    analytics.lastActive = new Date();

    if (!analytics.modesPlayed.includes(session.gameMode)) {
      analytics.modesPlayed.push(session.gameMode);
    }

    if (session.outcome === "won") {
      analytics.lifetimeWins++;
    } else if (session.outcome === "lost") {
      analytics.lifetimeLosses++;
    }

    analytics.averageAccuracy = (analytics.averageAccuracy * (analytics.totalSessions - 1) + session.accuracy) / analytics.totalSessions;

    this.userAnalytics.set(session.userId, analytics);
  }

  private startAutoFlush(): void {
    if (this.flushTimer) return;

    this.flushTimer = setInterval(() => {
      this.flush();
    }, this.flushInterval);
  }

  private stopAutoFlush(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let analyticsInstance: AnalyticsTracker | null = null;

export function getAnalyticsTracker(): AnalyticsTracker {
  if (!analyticsInstance) {
    analyticsInstance = new AnalyticsTracker({
      enabled: typeof window !== "undefined" && process.env.NODE_ENV === "production",
      batchSize: 50,
      flushInterval: 30000,
    });
  }
  return analyticsInstance;
}

export function createAnalyticsTracker(config?: Parameters<typeof AnalyticsTracker.prototype.constructor>[0]): AnalyticsTracker {
  return new AnalyticsTracker(config);
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Format analytics data for display
 */
export function formatAnalyticsData(analytics: ModeAnalytics): Record<string, string> {
  return {
    Sessions: analytics.sessions.toString(),
    "Win Rate": `${(analytics.winRate * 100).toFixed(1)}%`,
    "High Score": analytics.highScore.toLocaleString(),
    "Avg Time": `${(analytics.averageTime / 1000).toFixed(1)}s`,
    "Fastest Time": analytics.fastestTime !== Infinity ? `${(analytics.fastestTime / 1000).toFixed(1)}s` : "N/A",
    "Continues Used": analytics.continuesUsed.toString(),
    Revenue: `$${analytics.revenueGenerated.toFixed(2)}`,
  };
}

/**
 * Calculate analytics summary
 */
export function calculateAnalyticsSummary(sessions: GameSession[]): {
  totalSessions: number;
  totalRevenue: number;
  averageScore: number;
  winRate: number;
  averageDuration: number;
  continueConversionRate: number;
} {
  const totalSessions = sessions.length;
  const totalRevenue = sessions.reduce((sum, s) => sum + s.totalRevenue, 0);
  const totalScore = sessions.reduce((sum, s) => sum + s.finalScore, 0);
  const wins = sessions.filter((s) => s.outcome === "won").length;
  const totalDuration = sessions.reduce((sum, s) => sum + s.duration, 0);
  const continuesSessions = sessions.filter((s) => s.continueCount > 0).length;

  return {
    totalSessions,
    totalRevenue,
    averageScore: totalSessions > 0 ? totalScore / totalSessions : 0,
    winRate: totalSessions > 0 ? wins / totalSessions : 0,
    averageDuration: totalSessions > 0 ? totalDuration / totalSessions : 0,
    continueConversionRate: totalSessions > 0 ? continuesSessions / totalSessions : 0,
  };
}
