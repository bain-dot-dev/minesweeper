/**
 * Special Events & A/B Testing System
 * Dynamic events, A/B testing, and seasonal content
 */

import { GameMode } from "@/types/gameMode";
import { GameState } from "@/types/game";

// ============================================================================
// EVENT TYPES
// ============================================================================

export interface SpecialEvent {
  id: string;
  name: string;
  description: string;
  type: "seasonal" | "limited_time" | "community" | "celebration" | "test";
  startDate: number;
  endDate: number;
  isActive: boolean;
  rewards: EventReward[];
  conditions: EventCondition[];
  visualTheme: EventTheme;
  features: EventFeature[];
}

export interface EventReward {
  type: "points" | "coins" | "unlock" | "badge" | "discount";
  amount: number;
  item?: string;
  description: string;
  rarity: "common" | "uncommon" | "rare" | "epic" | "legendary";
}

export interface EventCondition {
  type: "score" | "time" | "streak" | "mode" | "payment" | "social" | "custom";
  value: number;
  operator: "gte" | "lte" | "eq" | "gt" | "lt";
  mode?: string;
  customCheck?: (gameState: GameState, mode: GameMode) => boolean;
}

export interface EventTheme {
  primaryColor: string;
  secondaryColor: string;
  backgroundImage?: string;
  particleEffect?: string;
  music?: string;
  soundEffects?: string[];
}

export interface EventFeature {
  id: string;
  name: string;
  description: string;
  type: "visual" | "audio" | "gameplay" | "ui" | "social";
  enabled: boolean;
  config: Record<string, unknown>;
}

export interface ABTest {
  id: string;
  name: string;
  description: string;
  variants: ABTestVariant[];
  startDate: number;
  endDate: number;
  isActive: boolean;
  targetAudience: string[];
  successMetrics: string[];
  results: ABTestResults;
}

export interface ABTestVariant {
  id: string;
  name: string;
  description: string;
  weight: number; // 0-1, determines probability of assignment
  config: Record<string, unknown>;
  users: string[];
}

export interface ABTestResults {
  totalUsers: number;
  variantResults: Map<string, ABTestVariantResult>;
  winningVariant?: string;
  confidence: number;
  statisticalSignificance: boolean;
}

export interface ABTestVariantResult {
  variantId: string;
  users: number;
  conversions: number;
  conversionRate: number;
  averageValue: number;
  totalValue: number;
}

// ============================================================================
// SPECIAL EVENTS MANAGER
// ============================================================================

export class SpecialEventsManager {
  private events: Map<string, SpecialEvent> = new Map();
  private activeEvents: SpecialEvent[] = [];
  private userId: string;

  constructor() {
    this.userId = this.getUserId();
    this.initializeEvents();
    this.updateActiveEvents();
  }

  /**
   * Get all active events
   */
  getActiveEvents(): SpecialEvent[] {
    return this.activeEvents;
  }

  /**
   * Get event by ID
   */
  getEvent(eventId: string): SpecialEvent | null {
    return this.events.get(eventId) || null;
  }

  /**
   * Check if user qualifies for event rewards
   */
  checkEventRewards(gameState: GameState, gameMode: GameMode): EventReward[] {
    const earnedRewards: EventReward[] = [];

    for (const event of this.activeEvents) {
      for (const condition of event.conditions) {
        if (this.checkEventCondition(condition, gameState, gameMode)) {
          // User qualifies for this event's rewards
          earnedRewards.push(...event.rewards);
          break; // Only give rewards once per event
        }
      }
    }

    return earnedRewards;
  }

  /**
   * Apply event features to game
   */
  applyEventFeatures(gameMode: GameMode): GameMode {
    let modifiedMode = { ...gameMode };

    for (const event of this.activeEvents) {
      for (const feature of event.features) {
        if (feature.enabled) {
          modifiedMode = this.applyEventFeature(modifiedMode, feature);
        }
      }
    }

    return modifiedMode;
  }

  /**
   * Get event theme for UI
   */
  getEventTheme(): EventTheme | null {
    const activeEvent = this.activeEvents.find(event => event.visualTheme);
    return activeEvent?.visualTheme || null;
  }

  /**
   * Update active events based on current time
   */
  updateActiveEvents(): void {
    const now = Date.now();
    this.activeEvents = Array.from(this.events.values()).filter(event => 
      event.isActive && 
      event.startDate <= now && 
      event.endDate > now
    );

    console.log(`🎉 Active events: ${this.activeEvents.length}`);
  }

  /**
   * Create a new special event
   */
  createEvent(event: Omit<SpecialEvent, 'id'>): string {
    const eventId = `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newEvent: SpecialEvent = {
      ...event,
      id: eventId,
    };

    this.events.set(eventId, newEvent);
    this.updateActiveEvents();
    
    console.log("🎉 New event created:", eventId);
    return eventId;
  }

  /**
   * Update an existing event
   */
  updateEvent(eventId: string, updates: Partial<SpecialEvent>): boolean {
    const event = this.events.get(eventId);
    if (!event) return false;

    const updatedEvent = { ...event, ...updates };
    this.events.set(eventId, updatedEvent);
    this.updateActiveEvents();
    
    console.log("🎉 Event updated:", eventId);
    return true;
  }

  /**
   * Delete an event
   */
  deleteEvent(eventId: string): boolean {
    const deleted = this.events.delete(eventId);
    if (deleted) {
      this.updateActiveEvents();
      console.log("🎉 Event deleted:", eventId);
    }
    return deleted;
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  private getUserId(): string {
    let userId = localStorage.getItem("events_user_id");
    if (!userId) {
      userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem("events_user_id", userId);
    }
    return userId;
  }

  private initializeEvents(): void {
    // Create some default events
    this.createEvent({
      name: "New Year Celebration",
      description: "Start the year with bonus points and special rewards!",
      type: "seasonal",
      startDate: new Date('2025-01-01').getTime(),
      endDate: new Date('2025-01-31').getTime(),
      isActive: true,
      rewards: [
        {
          type: "points",
          amount: 1000,
          description: "New Year bonus points",
          rarity: "common",
        },
        {
          type: "unlock",
          amount: 1,
          item: "new_year_theme",
          description: "Unlock New Year theme",
          rarity: "rare",
        },
      ],
      conditions: [
        {
          type: "score",
          value: 1000,
          operator: "gte",
        },
      ],
      visualTheme: {
        primaryColor: "#FFD700",
        secondaryColor: "#FF6B6B",
        backgroundImage: "new_year_bg.jpg",
        particleEffect: "confetti",
        music: "new_year_theme.mp3",
      },
      features: [
        {
          id: "bonus_points",
          name: "Bonus Points",
          description: "Double points for all games",
          type: "gameplay",
          enabled: true,
          config: { multiplier: 2 },
        },
      ],
    });

    this.createEvent({
      name: "Valentine's Day Special",
      description: "Share the love with special Valentine's Day rewards!",
      type: "seasonal",
      startDate: new Date('2025-02-14').getTime(),
      endDate: new Date('2025-02-14').getTime() + (24 * 60 * 60 * 1000),
      isActive: true,
      rewards: [
        {
          type: "badge",
          amount: 1,
          item: "valentine_badge",
          description: "Valentine's Day badge",
          rarity: "uncommon",
        },
      ],
      conditions: [
        {
          type: "social",
          value: 1,
          operator: "gte",
        },
      ],
      visualTheme: {
        primaryColor: "#FF69B4",
        secondaryColor: "#FFB6C1",
        particleEffect: "hearts",
      },
      features: [
        {
          id: "heart_particles",
          name: "Heart Particles",
          description: "Heart particle effects",
          type: "visual",
          enabled: true,
          config: { particleCount: 50 },
        },
      ],
    });
  }

  private checkEventCondition(
    condition: EventCondition,
    gameState: GameState,
    gameMode: GameMode
  ): boolean {
    switch (condition.type) {
      case "score":
        return this.compareValues(gameState.score, condition.value, condition.operator);
      case "time":
        // This would need time tracking
        return false;
      case "streak":
        return this.compareValues(gameState.streak, condition.value, condition.operator);
      case "mode":
        return condition.mode === gameMode.id;
      case "payment":
        return this.compareValues(gameState.continueCount, condition.value, condition.operator);
      case "social":
        // This would need social feature integration
        return false;
      case "custom":
        return condition.customCheck ? condition.customCheck(gameState, gameMode) : false;
      default:
        return false;
    }
  }

  private applyEventFeature(gameMode: GameMode, feature: EventFeature): GameMode {
    // Apply feature-specific modifications to game mode
    switch (feature.type) {
      case "gameplay":
        if (feature.id === "bonus_points" && feature.config.multiplier) {
          // Modify scoring system
          const modifiedScoring = { ...gameMode.scoring };
          if (modifiedScoring.basePoints && typeof feature.config.multiplier === 'number') {
            modifiedScoring.basePoints = modifiedScoring.basePoints * feature.config.multiplier;
          }
          return { ...gameMode, scoring: modifiedScoring };
        }
        break;
      case "visual":
        // Apply visual modifications
        break;
      case "audio":
        // Apply audio modifications
        break;
      case "ui":
        // Apply UI modifications
        break;
      case "social":
        // Apply social modifications
        break;
    }

    return gameMode;
  }

  private compareValues(current: number, target: number, operator: string): boolean {
    switch (operator) {
      case "gte": return current >= target;
      case "lte": return current <= target;
      case "eq": return current === target;
      case "gt": return current > target;
      case "lt": return current < target;
      default: return false;
    }
  }
}

// ============================================================================
// A/B TESTING MANAGER
// ============================================================================

export class ABTestingManager {
  private tests: Map<string, ABTest> = new Map();
  private userAssignments: Map<string, string> = new Map();
  private userId: string;

  constructor() {
    this.userId = this.getUserId();
    this.initializeTests();
  }

  /**
   * Get user's variant for a test
   */
  getUserVariant(testId: string): ABTestVariant | null {
    const test = this.tests.get(testId);
    if (!test || !test.isActive) return null;

    // Check if user already has an assignment
    const assignmentKey = `${testId}_${this.userId}`;
    const existingAssignment = this.userAssignments.get(assignmentKey);
    if (existingAssignment) {
      return test.variants.find(v => v.id === existingAssignment) || null;
    }

    // Assign user to a variant based on weights
    const variant = this.assignUserToVariant(test);
    if (variant) {
      this.userAssignments.set(assignmentKey, variant.id);
      variant.users.push(this.userId);
      this.saveUserAssignments();
    }

    return variant;
  }

  /**
   * Record a conversion for the current user's variant
   */
  recordConversion(testId: string, value: number = 1): void {
    const test = this.tests.get(testId);
    if (!test) return;

    const assignmentKey = `${testId}_${this.userId}`;
    const variantId = this.userAssignments.get(assignmentKey);
    if (!variantId) return;

    const variant = test.variants.find(v => v.id === variantId);
    if (!variant) return;

    // Record conversion
    if (!test.results.variantResults.has(variantId)) {
      test.results.variantResults.set(variantId, {
        variantId,
        users: 0,
        conversions: 0,
        conversionRate: 0,
        averageValue: 0,
        totalValue: 0,
      });
    }

    const result = test.results.variantResults.get(variantId)!;
    result.conversions++;
    result.totalValue += value;
    result.averageValue = result.totalValue / result.conversions;
    result.conversionRate = result.conversions / result.users;

    this.updateTestResults(test);
    console.log(`📊 Conversion recorded for test ${testId}, variant ${variantId}`);
  }

  /**
   * Get test results
   */
  getTestResults(testId: string): ABTestResults | null {
    const test = this.tests.get(testId);
    return test ? test.results : null;
  }

  /**
   * Get all active tests
   */
  getActiveTests(): ABTest[] {
    const now = Date.now();
    return Array.from(this.tests.values()).filter(test => 
      test.isActive && 
      test.startDate <= now && 
      test.endDate > now
    );
  }

  /**
   * Create a new A/B test
   */
  createTest(test: Omit<ABTest, 'id' | 'results'>): string {
    const testId = `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newTest: ABTest = {
      ...test,
      id: testId,
      results: {
        totalUsers: 0,
        variantResults: new Map(),
        confidence: 0,
        statisticalSignificance: false,
      },
    };

    this.tests.set(testId, newTest);
    console.log("🧪 New A/B test created:", testId);
    return testId;
  }

  /**
   * End a test and determine winner
   */
  endTest(testId: string): ABTestResults | null {
    const test = this.tests.get(testId);
    if (!test) return null;

    test.isActive = false;
    this.updateTestResults(test);
    
    console.log("🧪 A/B test ended:", testId);
    return test.results;
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  private getUserId(): string {
    let userId = localStorage.getItem("ab_testing_user_id");
    if (!userId) {
      userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem("ab_testing_user_id", userId);
    }
    return userId;
  }

  private initializeTests(): void {
    // Create some default A/B tests
    this.createTest({
      name: "Continue Button Color",
      description: "Test different colors for the continue button",
      variants: [
        {
          id: "control",
          name: "Control (Green)",
          description: "Original green continue button",
          weight: 0.5,
          config: { buttonColor: "#00FF00" },
          users: [],
        },
        {
          id: "variant_a",
          name: "Variant A (Blue)",
          description: "Blue continue button",
          weight: 0.5,
          config: { buttonColor: "#0066FF" },
          users: [],
        },
      ],
      startDate: Date.now(),
      endDate: Date.now() + (30 * 24 * 60 * 60 * 1000), // 30 days
      isActive: true,
      targetAudience: ["all"],
      successMetrics: ["conversion_rate", "revenue"],
    });

    this.createTest({
      name: "Continue Pricing",
      description: "Test different continue pricing strategies",
      variants: [
        {
          id: "control",
          name: "Control (Standard)",
          description: "Standard continue pricing",
          weight: 0.33,
          config: { pricingMultiplier: 1.0 },
          users: [],
        },
        {
          id: "variant_a",
          name: "Variant A (20% Off)",
          description: "20% discount on continues",
          weight: 0.33,
          config: { pricingMultiplier: 0.8 },
          users: [],
        },
        {
          id: "variant_b",
          name: "Variant B (20% More)",
          description: "20% increase in continue pricing",
          weight: 0.34,
          config: { pricingMultiplier: 1.2 },
          users: [],
        },
      ],
      startDate: Date.now(),
      endDate: Date.now() + (14 * 24 * 60 * 60 * 1000), // 14 days
      isActive: true,
      targetAudience: ["all"],
      successMetrics: ["conversion_rate", "revenue", "user_satisfaction"],
    });
  }

  private assignUserToVariant(test: ABTest): ABTestVariant | null {
    const random = Math.random();
    let cumulativeWeight = 0;

    for (const variant of test.variants) {
      cumulativeWeight += variant.weight;
      if (random <= cumulativeWeight) {
        return variant;
      }
    }

    // Fallback to last variant
    return test.variants[test.variants.length - 1] || null;
  }

  private updateTestResults(test: ABTest): void {
    const results = test.results;
    results.totalUsers = test.variants.reduce((sum, variant) => sum + variant.users.length, 0);

    // Calculate statistical significance (simplified)
    const variantResults = Array.from(results.variantResults.values());
    if (variantResults.length >= 2) {
      const control = variantResults[0];
      const variant = variantResults[1];
      
      // Simple statistical significance calculation
      const difference = Math.abs(control.conversionRate - variant.conversionRate);
      const threshold = 0.05; // 5% threshold
      
      results.statisticalSignificance = difference > threshold;
      results.confidence = Math.min(95, difference * 1000);
      
      // Determine winning variant
      if (results.statisticalSignificance) {
        results.winningVariant = control.conversionRate > variant.conversionRate 
          ? control.variantId 
          : variant.variantId;
      }
    }
  }

  private saveUserAssignments(): void {
    const data = Array.from(this.userAssignments.entries());
    localStorage.setItem(`ab_testing_assignments_${this.userId}`, JSON.stringify(data));
  }
}

// ============================================================================
// SPECIAL EVENTS HOOKS
// ============================================================================

/**
 * React hook for special events
 */
export function useSpecialEvents() {
  const eventsManager = new SpecialEventsManager();
  const abTestingManager = new ABTestingManager();

  return {
    // Events
    getActiveEvents: eventsManager.getActiveEvents.bind(eventsManager),
    getEvent: eventsManager.getEvent.bind(eventsManager),
    checkEventRewards: eventsManager.checkEventRewards.bind(eventsManager),
    applyEventFeatures: eventsManager.applyEventFeatures.bind(eventsManager),
    getEventTheme: eventsManager.getEventTheme.bind(eventsManager),
    createEvent: eventsManager.createEvent.bind(eventsManager),
    updateEvent: eventsManager.updateEvent.bind(eventsManager),
    deleteEvent: eventsManager.deleteEvent.bind(eventsManager),

    // A/B Testing
    getUserVariant: abTestingManager.getUserVariant.bind(abTestingManager),
    recordConversion: abTestingManager.recordConversion.bind(abTestingManager),
    getTestResults: abTestingManager.getTestResults.bind(abTestingManager),
    getActiveTests: abTestingManager.getActiveTests.bind(abTestingManager),
    createTest: abTestingManager.createTest.bind(abTestingManager),
    endTest: abTestingManager.endTest.bind(abTestingManager),
  };
}

// Singleton instances
export const specialEventsManager = new SpecialEventsManager();
export const abTestingManager = new ABTestingManager();
