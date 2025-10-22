/**
 * Analytics & Tracking System
 * Comprehensive analytics for game modes, payments, and user behavior
 */

import { GameMode } from "@/types/gameMode";
import { GameState } from "@/types/game";

// ============================================================================
// ANALYTICS TYPES
// ============================================================================

export interface GameSession {
  sessionId: string;
  userId: string;
  gameMode: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  status: "completed" | "abandoned" | "crashed";
  score: number;
  level: number;
  moves: number;
  continuesUsed: number;
  continueCost: number;
  revenue: number;
  accuracy: number;
  perfectGame: boolean;
  hintsUsed: number;
  undoCount: number;
  deviceInfo: DeviceInfo;
  userAgent: string;
}

export interface PaymentTransaction {
  transactionId: string;
  userId: string;
  gameMode: string;
  amount: number;
  currency: string;
  status: "success" | "failed" | "cancelled";
  timestamp: number;
  paymentMethod: string;
  continueCount: number;
  level: number;
  score: number;
}

export interface UserStats {
  userId: string;
  totalSessions: number;
  totalScore: number;
  highScore: number;
  averageScore: number;
  totalTimePlayed: number;
  favoriteMode: string;
  totalContinues: number;
  totalSpent: number;
  achievements: string[];
  lastPlayed: number;
  streak: number;
  longestStreak: number;
}

export interface ModeAnalytics {
  modeId: string;
  totalSessions: number;
  totalScore: number;
  averageScore: number;
  averageTime: number;
  winRate: number;
  continueRate: number;
  revenue: number;
  popularity: number;
  difficulty: number;
  lastUpdated: number;
}

export interface DeviceInfo {
  platform: string;
  browser: string;
  screenSize: string;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

export interface AnalyticsEvent {
  eventType: string;
  userId: string;
  sessionId: string;
  timestamp: number;
  data: Record<string, unknown>;
}

// ============================================================================
// ANALYTICS MANAGER
// ============================================================================

export class AnalyticsManager {
  private sessionId: string;
  private userId: string;
  private currentSession: GameSession | null = null;
  private events: AnalyticsEvent[] = [];
  private isEnabled: boolean;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.userId = this.getUserId();
    this.isEnabled = this.isAnalyticsEnabled();
  }

  /**
   * Start tracking a new game session
   */
  startGameSession(gameMode: GameMode, gameState: GameState): void {
    if (!this.isEnabled) return;

    this.currentSession = {
      sessionId: this.sessionId,
      userId: this.userId,
      gameMode: gameMode.id,
      startTime: Date.now(),
      status: "completed",
      score: gameState.score,
      level: gameState.level,
      moves: gameState.moveCount,
      continuesUsed: gameState.continueCount,
      continueCost: gameMode.continueCost,
      revenue: 0,
      accuracy: 0,
      perfectGame: false,
      hintsUsed: 0,
      undoCount: 0,
      deviceInfo: this.getDeviceInfo(),
      userAgent: navigator.userAgent,
    };

    this.trackEvent("game_started", {
      mode: gameMode.id,
      level: gameState.level,
      boardSize: `${gameState.config.width}x${gameState.config.height}`,
      mineCount: gameState.config.mines,
    });

    console.log("📊 Game session started:", this.currentSession);
  }

  /**
   * End the current game session
   */
  endGameSession(
    gameState: GameState,
    status: "completed" | "abandoned" | "crashed" = "completed"
  ): void {
    if (!this.isEnabled || !this.currentSession) return;

    const endTime = Date.now();
    const duration = endTime - this.currentSession.startTime;

    this.currentSession = {
      ...this.currentSession,
      endTime,
      duration,
      status,
      score: gameState.score,
      level: gameState.level,
      moves: gameState.moveCount,
      continuesUsed: gameState.continueCount,
      revenue: this.calculateRevenue(),
      accuracy: this.calculateAccuracy(gameState),
      perfectGame: this.isPerfectGame(gameState),
    };

    this.trackEvent("game_ended", {
      mode: this.currentSession.gameMode,
      status,
      score: this.currentSession.score,
      duration,
      moves: this.currentSession.moves,
      continues: this.currentSession.continuesUsed,
      revenue: this.currentSession.revenue,
    });

    // Store session data
    this.storeSession(this.currentSession);

    console.log("📊 Game session ended:", this.currentSession);

    // Reset for next session
    this.currentSession = null;
    this.sessionId = this.generateSessionId();
  }

  /**
   * Track a payment transaction
   */
  trackPayment(transaction: PaymentTransaction): void {
    if (!this.isEnabled) return;

    this.trackEvent("payment_completed", {
      transactionId: transaction.transactionId,
      amount: transaction.amount,
      currency: transaction.currency,
      mode: transaction.gameMode,
      continueCount: transaction.continueCount,
      level: transaction.level,
    });

    // Store payment data
    this.storePayment(transaction);

    console.log("💳 Payment tracked:", transaction);
  }

  /**
   * Track a continue usage
   */
  trackContinue(gameMode: GameMode, gameState: GameState, cost: number): void {
    if (!this.isEnabled) return;

    this.trackEvent("continue_used", {
      mode: gameMode.id,
      cost,
      continueCount: gameState.continueCount,
      level: gameState.level,
      score: gameState.score,
    });

    if (this.currentSession) {
      this.currentSession.continuesUsed++;
      this.currentSession.revenue += cost;
    }

    console.log("🔄 Continue tracked:", { mode: gameMode.id, cost });
  }

  /**
   * Track mode selection
   */
  trackModeSelection(gameMode: GameMode): void {
    if (!this.isEnabled) return;

    this.trackEvent("mode_selected", {
      mode: gameMode.id,
      category: gameMode.category,
      continueCost: gameMode.continueCost,
    });

    console.log("🎮 Mode selection tracked:", gameMode.id);
  }

  /**
   * Track hint usage
   */
  trackHintUsed(hintType: string, gameState: GameState): void {
    if (!this.isEnabled) return;

    this.trackEvent("hint_used", {
      hintType,
      mode: gameState.gameMode,
      level: gameState.level,
      score: gameState.score,
    });

    if (this.currentSession) {
      this.currentSession.hintsUsed++;
    }

    console.log("💡 Hint usage tracked:", hintType);
  }

  /**
   * Track undo usage
   */
  trackUndo(gameState: GameState): void {
    if (!this.isEnabled) return;

    this.trackEvent("undo_used", {
      mode: gameState.gameMode,
      level: gameState.level,
      score: gameState.score,
    });

    if (this.currentSession) {
      this.currentSession.undoCount++;
    }

    console.log("↩️ Undo tracked");
  }

  /**
   * Track achievement unlock
   */
  trackAchievement(achievementId: string, gameState: GameState): void {
    if (!this.isEnabled) return;

    this.trackEvent("achievement_unlocked", {
      achievementId,
      mode: gameState.gameMode,
      level: gameState.level,
      score: gameState.score,
    });

    console.log("🏆 Achievement tracked:", achievementId);
  }

  /**
   * Get user statistics
   */
  getUserStats(): UserStats | null {
    if (!this.isEnabled) return null;

    const stats = localStorage.getItem(`analytics_user_${this.userId}`);
    return stats ? JSON.parse(stats) : null;
  }

  /**
   * Get mode analytics
   */
  getModeAnalytics(modeId: string): ModeAnalytics | null {
    if (!this.isEnabled) return null;

    const analytics = localStorage.getItem(`analytics_mode_${modeId}`);
    return analytics ? JSON.parse(analytics) : null;
  }

  /**
   * Get all analytics data
   */
  getAllAnalytics(): {
    sessions: GameSession[];
    payments: PaymentTransaction[];
    events: AnalyticsEvent[];
  } {
    if (!this.isEnabled) return { sessions: [], payments: [], events: [] };

    const sessions = this.getStoredSessions();
    const payments = this.getStoredPayments();
    const events = this.events;

    return { sessions, payments, events };
  }

  /**
   * Export analytics data
   */
  exportAnalytics(): string {
    const data = this.getAllAnalytics();
    return JSON.stringify(data, null, 2);
  }

  /**
   * Clear analytics data
   */
  clearAnalytics(): void {
    if (!this.isEnabled) return;

    // Clear localStorage
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith("analytics_")) {
        localStorage.removeItem(key);
      }
    });

    // Clear memory
    this.events = [];
    this.currentSession = null;

    console.log("🗑️ Analytics data cleared");
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getUserId(): string {
    let userId = localStorage.getItem("analytics_user_id");
    if (!userId) {
      userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem("analytics_user_id", userId);
    }
    return userId;
  }

  private isAnalyticsEnabled(): boolean {
    return process.env.NODE_ENV === "development" || 
           localStorage.getItem("analytics_enabled") === "true";
  }

  private getDeviceInfo(): DeviceInfo {
    const userAgent = navigator.userAgent;
    const screenWidth = window.screen.width;
    const screenHeight = window.screen.height;

    return {
      platform: this.getPlatform(userAgent),
      browser: this.getBrowser(userAgent),
      screenSize: `${screenWidth}x${screenHeight}`,
      isMobile: /Mobile|Android|iPhone|iPad/.test(userAgent),
      isTablet: /iPad|Tablet/.test(userAgent),
      isDesktop: !/Mobile|Android|iPhone|iPad|Tablet/.test(userAgent),
    };
  }

  private getPlatform(userAgent: string): string {
    if (/Windows/.test(userAgent)) return "Windows";
    if (/Mac/.test(userAgent)) return "macOS";
    if (/Linux/.test(userAgent)) return "Linux";
    if (/Android/.test(userAgent)) return "Android";
    if (/iPhone|iPad/.test(userAgent)) return "iOS";
    return "Unknown";
  }

  private getBrowser(userAgent: string): string {
    if (/Chrome/.test(userAgent)) return "Chrome";
    if (/Firefox/.test(userAgent)) return "Firefox";
    if (/Safari/.test(userAgent)) return "Safari";
    if (/Edge/.test(userAgent)) return "Edge";
    return "Unknown";
  }

  private trackEvent(eventType: string, data: Record<string, unknown>): void {
    const event: AnalyticsEvent = {
      eventType,
      userId: this.userId,
      sessionId: this.sessionId,
      timestamp: Date.now(),
      data,
    };

    this.events.push(event);

    // Keep only last 1000 events in memory
    if (this.events.length > 1000) {
      this.events = this.events.slice(-1000);
    }
  }

  private calculateRevenue(): number {
    if (!this.currentSession) return 0;
    return this.currentSession.continuesUsed * this.currentSession.continueCost;
  }

  private calculateAccuracy(gameState: GameState): number {
    if (gameState.flagCount === 0) return 1.0;
    // Simplified accuracy calculation
    return Math.min(1.0, gameState.revealedCount / (gameState.config.width * gameState.config.height));
  }

  private isPerfectGame(gameState: GameState): boolean {
    return gameState.continueCount === 0 && gameState.status === "won";
  }

  private storeSession(session: GameSession): void {
    const sessions = this.getStoredSessions();
    sessions.push(session);
    
    // Keep only last 100 sessions
    if (sessions.length > 100) {
      sessions.splice(0, sessions.length - 100);
    }
    
    localStorage.setItem("analytics_sessions", JSON.stringify(sessions));
  }

  private storePayment(payment: PaymentTransaction): void {
    const payments = this.getStoredPayments();
    payments.push(payment);
    
    // Keep only last 50 payments
    if (payments.length > 50) {
      payments.splice(0, payments.length - 50);
    }
    
    localStorage.setItem("analytics_payments", JSON.stringify(payments));
  }

  private getStoredSessions(): GameSession[] {
    const data = localStorage.getItem("analytics_sessions");
    return data ? JSON.parse(data) : [];
  }

  private getStoredPayments(): PaymentTransaction[] {
    const data = localStorage.getItem("analytics_payments");
    return data ? JSON.parse(data) : [];
  }
}

// ============================================================================
// ANALYTICS HOOKS
// ============================================================================

/**
 * React hook for analytics
 */
export function useAnalytics() {
  const analytics = new AnalyticsManager();

  return {
    startGameSession: analytics.startGameSession.bind(analytics),
    endGameSession: analytics.endGameSession.bind(analytics),
    trackPayment: analytics.trackPayment.bind(analytics),
    trackContinue: analytics.trackContinue.bind(analytics),
    trackModeSelection: analytics.trackModeSelection.bind(analytics),
    trackHintUsed: analytics.trackHintUsed.bind(analytics),
    trackUndo: analytics.trackUndo.bind(analytics),
    trackAchievement: analytics.trackAchievement.bind(analytics),
    getUserStats: analytics.getUserStats.bind(analytics),
    getModeAnalytics: analytics.getModeAnalytics.bind(analytics),
    getAllAnalytics: analytics.getAllAnalytics.bind(analytics),
    exportAnalytics: analytics.exportAnalytics.bind(analytics),
    clearAnalytics: analytics.clearAnalytics.bind(analytics),
  };
}

// ============================================================================
// ANALYTICS DASHBOARD UTILITIES
// ============================================================================

/**
 * Generate analytics report
 */
export function generateAnalyticsReport(analytics: AnalyticsManager): {
  totalSessions: number;
  totalRevenue: number;
  averageScore: number;
  mostPopularMode: string;
  continueRate: number;
  topPlayers: Array<{ userId: string; score: number }>;
} {
  const data = analytics.getAllAnalytics();
  
  const totalSessions = data.sessions.length;
  const totalRevenue = data.sessions.reduce((sum, session) => sum + session.revenue, 0);
  const averageScore = data.sessions.length > 0 
    ? data.sessions.reduce((sum, session) => sum + session.score, 0) / data.sessions.length 
    : 0;
  
  // Most popular mode
  const modeCounts = data.sessions.reduce((counts, session) => {
    counts[session.gameMode] = (counts[session.gameMode] || 0) + 1;
    return counts;
  }, {} as Record<string, number>);
  
  const mostPopularMode = Object.entries(modeCounts)
    .sort(([,a], [,b]) => b - a)[0]?.[0] || "unknown";
  
  // Continue rate
  const sessionsWithContinues = data.sessions.filter(s => s.continuesUsed > 0).length;
  const continueRate = totalSessions > 0 ? sessionsWithContinues / totalSessions : 0;
  
  // Top players
  const playerScores = data.sessions.reduce((scores, session) => {
    if (!scores[session.userId]) {
      scores[session.userId] = 0;
    }
    scores[session.userId] = Math.max(scores[session.userId], session.score);
    return scores;
  }, {} as Record<string, number>);
  
  const topPlayers = Object.entries(playerScores)
    .map(([userId, score]) => ({ userId, score }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  return {
    totalSessions,
    totalRevenue,
    averageScore: Math.round(averageScore),
    mostPopularMode,
    continueRate: Math.round(continueRate * 100) / 100,
    topPlayers,
  };
}

// Singleton instance
export const analyticsManager = new AnalyticsManager();