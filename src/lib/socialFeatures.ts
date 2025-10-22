/**
 * Social Features System
 * Social sharing, leaderboards, and community features
 */

import { GameMode } from "@/types/gameMode";
import { GameState } from "@/types/game";

// ============================================================================
// SOCIAL TYPES
// ============================================================================

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  score: number;
  mode: string;
  level: number;
  time: number;
  timestamp: number;
  avatar?: string;
  country?: string;
  isCurrentUser?: boolean;
}

export interface SocialShare {
  type: "score" | "achievement" | "streak" | "challenge" | "custom";
  title: string;
  description: string;
  image?: string;
  url?: string;
  data: Record<string, unknown>;
}

export interface Friend {
  userId: string;
  username: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen: number;
  currentMode?: string;
  highScore?: number;
  level?: number;
}

export interface Challenge {
  id: string;
  fromUserId: string;
  toUserId: string;
  mode: string;
  target: "score" | "time" | "completion";
  value: number;
  expiresAt: number;
  status: "pending" | "accepted" | "completed" | "expired";
  winner?: string;
  createdAt: number;
}

export interface SocialStats {
  totalFriends: number;
  onlineFriends: number;
  challengesSent: number;
  challengesWon: number;
  challengesLost: number;
  sharesCount: number;
  leaderboardRank: number;
  globalRank: number;
}

// ============================================================================
// LEADERBOARD MANAGER
// ============================================================================

export class LeaderboardManager {
  private leaderboards: Map<string, LeaderboardEntry[]> = new Map();
  private userId: string;

  constructor() {
    this.userId = this.getUserId();
    this.initializeLeaderboards();
  }

  /**
   * Submit a score to the leaderboard
   */
  submitScore(
    mode: string,
    score: number,
    level: number,
    time: number,
    username?: string
  ): LeaderboardEntry {
    const entry: LeaderboardEntry = {
      rank: 0, // Will be calculated
      userId: this.userId,
      username: username || this.getUsername(),
      score,
      mode,
      level,
      time,
      timestamp: Date.now(),
      isCurrentUser: true,
    };

    // Get or create leaderboard for this mode
    let leaderboard = this.leaderboards.get(mode) || [];
    
    // Add new entry
    leaderboard.push(entry);
    
    // Sort by score (descending)
    leaderboard.sort((a, b) => b.score - a.score);
    
    // Update ranks
    leaderboard.forEach((entry, index) => {
      entry.rank = index + 1;
    });
    
    // Keep only top 100 entries
    leaderboard = leaderboard.slice(0, 100);
    
    // Save leaderboard
    this.leaderboards.set(mode, leaderboard);
    this.saveLeaderboard(mode);
    
    // Find the submitted entry
    const submittedEntry = leaderboard.find(e => e.userId === this.userId && e.timestamp === entry.timestamp);
    
    console.log("🏆 Score submitted to leaderboard:", submittedEntry);
    return submittedEntry || entry;
  }

  /**
   * Get leaderboard for a specific mode
   */
  getLeaderboard(mode: string, limit: number = 10): LeaderboardEntry[] {
    const leaderboard = this.leaderboards.get(mode) || [];
    return leaderboard.slice(0, limit);
  }

  /**
   * Get global leaderboard (all modes combined)
   */
  getGlobalLeaderboard(limit: number = 10): LeaderboardEntry[] {
    const allEntries: LeaderboardEntry[] = [];
    
    for (const leaderboard of this.leaderboards.values()) {
      allEntries.push(...leaderboard);
    }
    
    // Sort by score and take top entries
    allEntries.sort((a, b) => b.score - a.score);
    return allEntries.slice(0, limit);
  }

  /**
   * Get user's rank in a specific mode
   */
  getUserRank(mode: string, userId?: string): number {
    const leaderboard = this.leaderboards.get(mode) || [];
    const targetUserId = userId || this.userId;
    
    const entry = leaderboard.find(e => e.userId === targetUserId);
    return entry ? entry.rank : 0;
  }

  /**
   * Get user's best score for a mode
   */
  getUserBestScore(mode: string, userId?: string): LeaderboardEntry | null {
    const leaderboard = this.leaderboards.get(mode) || [];
    const targetUserId = userId || this.userId;
    
    return leaderboard.find(e => e.userId === targetUserId) || null;
  }

  /**
   * Get leaderboard statistics
   */
  getLeaderboardStats(mode: string): {
    totalEntries: number;
    averageScore: number;
    highestScore: number;
    lowestScore: number;
    userRank: number;
    userScore: number;
  } {
    const leaderboard = this.leaderboards.get(mode) || [];
    const totalEntries = leaderboard.length;
    
    if (totalEntries === 0) {
      return {
        totalEntries: 0,
        averageScore: 0,
        highestScore: 0,
        lowestScore: 0,
        userRank: 0,
        userScore: 0,
      };
    }
    
    const scores = leaderboard.map(e => e.score);
    const averageScore = scores.reduce((sum, score) => sum + score, 0) / totalEntries;
    const highestScore = Math.max(...scores);
    const lowestScore = Math.min(...scores);
    
    const userEntry = leaderboard.find(e => e.userId === this.userId);
    const userRank = userEntry ? userEntry.rank : 0;
    const userScore = userEntry ? userEntry.score : 0;
    
    return {
      totalEntries,
      averageScore: Math.round(averageScore),
      highestScore,
      lowestScore,
      userRank,
      userScore,
    };
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  private getUserId(): string {
    let userId = localStorage.getItem("social_user_id");
    if (!userId) {
      userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem("social_user_id", userId);
    }
    return userId;
  }

  private getUsername(): string {
    return localStorage.getItem("social_username") || "Anonymous Player";
  }

  private initializeLeaderboards(): void {
    // Load existing leaderboards from localStorage
    const modes = ["classic", "time-attack", "endless", "hardcore", "blind", "memory"];
    
    for (const mode of modes) {
      const data = localStorage.getItem(`leaderboard_${mode}`);
      if (data) {
        this.leaderboards.set(mode, JSON.parse(data));
      }
    }
  }

  private saveLeaderboard(mode: string): void {
    const leaderboard = this.leaderboards.get(mode);
    if (leaderboard) {
      localStorage.setItem(`leaderboard_${mode}`, JSON.stringify(leaderboard));
    }
  }
}

// ============================================================================
// SOCIAL SHARING MANAGER
// ============================================================================

export class SocialSharingManager {
  private baseUrl: string;

  constructor() {
    this.baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  }

  /**
   * Share a score
   */
  shareScore(gameState: GameState, gameMode: GameMode, time: number): SocialShare {
    const share: SocialShare = {
      type: "score",
      title: `I just scored ${gameState.score.toLocaleString()} points in ${gameMode.name}!`,
      description: `Can you beat my score of ${gameState.score.toLocaleString()} points in ${gameMode.name}?`,
      data: {
        score: gameState.score,
        mode: gameMode.id,
        level: gameState.level,
        time,
        timestamp: Date.now(),
      },
    };

    this.executeShare(share);
    return share;
  }

  /**
   * Share an achievement
   */
  shareAchievement(achievementId: string, achievementName: string, points: number): SocialShare {
    const share: SocialShare = {
      type: "achievement",
      title: `I just unlocked the "${achievementName}" achievement!`,
      description: `Earned ${points} points for unlocking "${achievementName}". Can you unlock it too?`,
      data: {
        achievementId,
        achievementName,
        points,
        timestamp: Date.now(),
      },
    };

    this.executeShare(share);
    return share;
  }

  /**
   * Share a streak
   */
  shareStreak(streak: number, mode: string): SocialShare {
    const share: SocialShare = {
      type: "streak",
      title: `I'm on a ${streak} game winning streak!`,
      description: `I've won ${streak} games in a row in ${mode}. Think you can break my streak?`,
      data: {
        streak,
        mode,
        timestamp: Date.now(),
      },
    };

    this.executeShare(share);
    return share;
  }

  /**
   * Share a daily challenge completion
   */
  shareChallenge(challengeName: string, reward: number): SocialShare {
    const share: SocialShare = {
      type: "challenge",
      title: `I completed the "${challengeName}" daily challenge!`,
      description: `Earned ${reward} points for completing today's challenge. Can you complete it too?`,
      data: {
        challengeName,
        reward,
        timestamp: Date.now(),
      },
    };

    this.executeShare(share);
    return share;
  }

  /**
   * Share custom content
   */
  shareCustom(title: string, description: string, data: Record<string, unknown>): SocialShare {
    const share: SocialShare = {
      type: "custom",
      title,
      description,
      data,
    };

    this.executeShare(share);
    return share;
  }

  /**
   * Execute the share action
   */
  private executeShare(share: SocialShare): void {
    if (typeof window === 'undefined') return;

    // Create share URL
    const shareUrl = `${this.baseUrl}/share?data=${encodeURIComponent(JSON.stringify(share.data))}`;
    
    // Try to use Web Share API if available
    if (navigator.share) {
      navigator.share({
        title: share.title,
        text: share.description,
        url: shareUrl,
      }).catch(error => {
        console.log('Error sharing:', error);
        this.fallbackShare(share, shareUrl);
      });
    } else {
      this.fallbackShare(share, shareUrl);
    }
  }

  /**
   * Fallback sharing method
   */
  private fallbackShare(share: SocialShare, url: string): void {
    // Copy to clipboard
    const text = `${share.title}\n\n${share.description}\n\n${url}`;
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        console.log('Share text copied to clipboard');
        // You could show a toast notification here
      });
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      console.log('Share text copied to clipboard (fallback)');
    }
  }
}

// ============================================================================
// FRIEND SYSTEM MANAGER
// ============================================================================

export class FriendSystemManager {
  private friends: Map<string, Friend> = new Map();
  private userId: string;

  constructor() {
    this.userId = this.getUserId();
    this.loadFriends();
  }

  /**
   * Add a friend
   */
  addFriend(userId: string, username: string, avatar?: string): Friend {
    const friend: Friend = {
      userId,
      username,
      avatar,
      isOnline: false,
      lastSeen: Date.now(),
    };

    this.friends.set(userId, friend);
    this.saveFriends();
    
    console.log("👥 Friend added:", friend);
    return friend;
  }

  /**
   * Remove a friend
   */
  removeFriend(userId: string): boolean {
    const removed = this.friends.delete(userId);
    if (removed) {
      this.saveFriends();
      console.log("👥 Friend removed:", userId);
    }
    return removed;
  }

  /**
   * Get all friends
   */
  getFriends(): Friend[] {
    return Array.from(this.friends.values());
  }

  /**
   * Get online friends
   */
  getOnlineFriends(): Friend[] {
    return this.getFriends().filter(friend => friend.isOnline);
  }

  /**
   * Update friend status
   */
  updateFriendStatus(userId: string, isOnline: boolean, currentMode?: string): void {
    const friend = this.friends.get(userId);
    if (friend) {
      friend.isOnline = isOnline;
      friend.lastSeen = Date.now();
      if (currentMode) {
        friend.currentMode = currentMode;
      }
      this.saveFriends();
    }
  }

  /**
   * Get friend by ID
   */
  getFriend(userId: string): Friend | null {
    return this.friends.get(userId) || null;
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  private getUserId(): string {
    let userId = localStorage.getItem("social_user_id");
    if (!userId) {
      userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem("social_user_id", userId);
    }
    return userId;
  }

  private loadFriends(): void {
    const data = localStorage.getItem(`friends_${this.userId}`);
    if (data) {
      const friends = JSON.parse(data);
      this.friends = new Map(friends);
    }
  }

  private saveFriends(): void {
    const data = Array.from(this.friends.entries());
    localStorage.setItem(`friends_${this.userId}`, JSON.stringify(data));
  }
}

// ============================================================================
// CHALLENGE SYSTEM MANAGER
// ============================================================================

export class ChallengeSystemManager {
  private challenges: Map<string, Challenge> = new Map();
  private userId: string;

  constructor() {
    this.userId = this.getUserId();
    this.loadChallenges();
  }

  /**
   * Send a challenge to a friend
   */
  sendChallenge(
    toUserId: string,
    mode: string,
    target: "score" | "time" | "completion",
    value: number,
    expiresInHours: number = 24
  ): Challenge {
    const challenge: Challenge = {
      id: `challenge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      fromUserId: this.userId,
      toUserId,
      mode,
      target,
      value,
      expiresAt: Date.now() + (expiresInHours * 60 * 60 * 1000),
      status: "pending",
      createdAt: Date.now(),
    };

    this.challenges.set(challenge.id, challenge);
    this.saveChallenges();
    
    console.log("🎯 Challenge sent:", challenge);
    return challenge;
  }

  /**
   * Accept a challenge
   */
  acceptChallenge(challengeId: string): boolean {
    const challenge = this.challenges.get(challengeId);
    if (challenge && challenge.status === "pending") {
      challenge.status = "accepted";
      this.saveChallenges();
      console.log("✅ Challenge accepted:", challengeId);
      return true;
    }
    return false;
  }

  /**
   * Complete a challenge
   */
  completeChallenge(challengeId: string, winner: string): boolean {
    const challenge = this.challenges.get(challengeId);
    if (challenge && challenge.status === "accepted") {
      challenge.status = "completed";
      challenge.winner = winner;
      this.saveChallenges();
      console.log("🏆 Challenge completed:", challengeId, "Winner:", winner);
      return true;
    }
    return false;
  }

  /**
   * Get challenges for user
   */
  getChallengesForUser(userId?: string): Challenge[] {
    const targetUserId = userId || this.userId;
    return Array.from(this.challenges.values()).filter(
      challenge => challenge.fromUserId === targetUserId || challenge.toUserId === targetUserId
    );
  }

  /**
   * Get pending challenges
   */
  getPendingChallenges(): Challenge[] {
    return this.getChallengesForUser().filter(challenge => challenge.status === "pending");
  }

  /**
   * Get active challenges
   */
  getActiveChallenges(): Challenge[] {
    return this.getChallengesForUser().filter(challenge => challenge.status === "accepted");
  }

  /**
   * Get completed challenges
   */
  getCompletedChallenges(): Challenge[] {
    return this.getChallengesForUser().filter(challenge => challenge.status === "completed");
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  private getUserId(): string {
    let userId = localStorage.getItem("social_user_id");
    if (!userId) {
      userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem("social_user_id", userId);
    }
    return userId;
  }

  private loadChallenges(): void {
    const data = localStorage.getItem(`challenges_${this.userId}`);
    if (data) {
      const challenges = JSON.parse(data);
      this.challenges = new Map(challenges);
    }
  }

  private saveChallenges(): void {
    const data = Array.from(this.challenges.entries());
    localStorage.setItem(`challenges_${this.userId}`, JSON.stringify(data));
  }
}

// ============================================================================
// SOCIAL FEATURES HOOKS
// ============================================================================

/**
 * React hook for social features
 */
export function useSocialFeatures() {
  const leaderboardManager = new LeaderboardManager();
  const sharingManager = new SocialSharingManager();
  const friendManager = new FriendSystemManager();
  const challengeManager = new ChallengeSystemManager();

  return {
    // Leaderboard
    submitScore: leaderboardManager.submitScore.bind(leaderboardManager),
    getLeaderboard: leaderboardManager.getLeaderboard.bind(leaderboardManager),
    getGlobalLeaderboard: leaderboardManager.getGlobalLeaderboard.bind(leaderboardManager),
    getUserRank: leaderboardManager.getUserRank.bind(leaderboardManager),
    getUserBestScore: leaderboardManager.getUserBestScore.bind(leaderboardManager),
    getLeaderboardStats: leaderboardManager.getLeaderboardStats.bind(leaderboardManager),

    // Sharing
    shareScore: sharingManager.shareScore.bind(sharingManager),
    shareAchievement: sharingManager.shareAchievement.bind(sharingManager),
    shareStreak: sharingManager.shareStreak.bind(sharingManager),
    shareChallenge: sharingManager.shareChallenge.bind(sharingManager),
    shareCustom: sharingManager.shareCustom.bind(sharingManager),

    // Friends
    addFriend: friendManager.addFriend.bind(friendManager),
    removeFriend: friendManager.removeFriend.bind(friendManager),
    getFriends: friendManager.getFriends.bind(friendManager),
    getOnlineFriends: friendManager.getOnlineFriends.bind(friendManager),
    updateFriendStatus: friendManager.updateFriendStatus.bind(friendManager),
    getFriend: friendManager.getFriend.bind(friendManager),

    // Challenges
    sendChallenge: challengeManager.sendChallenge.bind(challengeManager),
    acceptChallenge: challengeManager.acceptChallenge.bind(challengeManager),
    completeChallenge: challengeManager.completeChallenge.bind(challengeManager),
    getChallengesForUser: challengeManager.getChallengesForUser.bind(challengeManager),
    getPendingChallenges: challengeManager.getPendingChallenges.bind(challengeManager),
    getActiveChallenges: challengeManager.getActiveChallenges.bind(challengeManager),
    getCompletedChallenges: challengeManager.getCompletedChallenges.bind(challengeManager),
  };
}

// Singleton instances
export const leaderboardManager = new LeaderboardManager();
export const socialSharingManager = new SocialSharingManager();
export const friendSystemManager = new FriendSystemManager();
export const challengeSystemManager = new ChallengeSystemManager();
