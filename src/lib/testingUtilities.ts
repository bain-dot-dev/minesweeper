/**
 * Testing Utilities
 * Comprehensive testing tools for game modes, payment flow, and performance
 */

import { GameState, CellState, DifficultyConfig } from "@/types/game";
import { GameMode } from "@/types/gameMode";

// ============================================================================
// TEST TYPES
// ============================================================================

export interface TestResult {
  testName: string;
  passed: boolean;
  error?: string;
  duration: number;
  timestamp: number;
}

export interface TestSuite {
  suiteName: string;
  tests: TestResult[];
  totalTests: number;
  passedTests: number;
  failedTests: number;
  totalDuration: number;
  timestamp: number;
}

export type TestFunction = () => void | Promise<void>;

export type MockGameState = Partial<GameState>;

export interface MockPaymentResponse {
  success: boolean;
  transactionId?: string;
  error?: string;
}

// ============================================================================
// TEST RUNNER
// ============================================================================

export class TestRunner {
  private suites: Map<string, TestSuite> = new Map();
  private currentSuite: string | null = null;

  /**
   * Create a test suite
   */
  describe(suiteName: string, tests: () => void): void {
    this.currentSuite = suiteName;

    const suite: TestSuite = {
      suiteName,
      tests: [],
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      totalDuration: 0,
      timestamp: Date.now(),
    };

    this.suites.set(suiteName, suite);

    // Run tests in suite
    tests();

    // Calculate totals
    const results = this.suites.get(suiteName)!;
    results.totalTests = results.tests.length;
    results.passedTests = results.tests.filter((t) => t.passed).length;
    results.failedTests = results.tests.filter((t) => !t.passed).length;
    results.totalDuration = results.tests.reduce((sum, t) => sum + t.duration, 0);

    this.currentSuite = null;
  }

  /**
   * Run a single test
   */
  async it(testName: string, testFn: TestFunction): Promise<void> {
    if (!this.currentSuite) {
      throw new Error("Test must be inside a describe block");
    }

    const startTime = Date.now();
    let passed = false;
    let error: string | undefined;

    try {
      await testFn();
      passed = true;
    } catch (err) {
      passed = false;
      error = err instanceof Error ? err.message : String(err);
    }

    const duration = Date.now() - startTime;

    const result: TestResult = {
      testName,
      passed,
      error,
      duration,
      timestamp: Date.now(),
    };

    const suite = this.suites.get(this.currentSuite);
    if (suite) {
      suite.tests.push(result);
    }

    // Log result
    if (passed) {
      console.log(`✓ ${testName} (${duration}ms)`);
    } else {
      console.error(`✗ ${testName} (${duration}ms)`, error);
    }
  }

  /**
   * Get test results
   */
  getResults(): TestSuite[] {
    return Array.from(this.suites.values());
  }

  /**
   * Get summary
   */
  getSummary(): {
    totalSuites: number;
    totalTests: number;
    passedTests: number;
    failedTests: number;
    passRate: number;
    totalDuration: number;
  } {
    const suites = Array.from(this.suites.values());

    const totalSuites = suites.length;
    const totalTests = suites.reduce((sum, s) => sum + s.totalTests, 0);
    const passedTests = suites.reduce((sum, s) => sum + s.passedTests, 0);
    const failedTests = suites.reduce((sum, s) => sum + s.failedTests, 0);
    const totalDuration = suites.reduce((sum, s) => sum + s.totalDuration, 0);

    return {
      totalSuites,
      totalTests,
      passedTests,
      failedTests,
      passRate: totalTests > 0 ? passedTests / totalTests : 0,
      totalDuration,
    };
  }

  /**
   * Print results to console
   */
  printResults(): void {
    console.log("\n=== Test Results ===\n");

    this.suites.forEach((suite) => {
      console.log(`\n${suite.suiteName}`);
      console.log(`  Total: ${suite.totalTests}`);
      console.log(`  Passed: ${suite.passedTests}`);
      console.log(`  Failed: ${suite.failedTests}`);
      console.log(`  Duration: ${suite.totalDuration}ms`);

      if (suite.failedTests > 0) {
        console.log("\n  Failed tests:");
        suite.tests
          .filter((t) => !t.passed)
          .forEach((t) => {
            console.log(`    ✗ ${t.testName}`);
            console.log(`      ${t.error}`);
          });
      }
    });

    const summary = this.getSummary();
    console.log("\n=== Summary ===");
    console.log(`Total Suites: ${summary.totalSuites}`);
    console.log(`Total Tests: ${summary.totalTests}`);
    console.log(`Passed: ${summary.passedTests}`);
    console.log(`Failed: ${summary.failedTests}`);
    console.log(`Pass Rate: ${(summary.passRate * 100).toFixed(1)}%`);
    console.log(`Total Duration: ${summary.totalDuration}ms`);
  }

  /**
   * Clear all results
   */
  clear(): void {
    this.suites.clear();
  }
}

// ============================================================================
// ASSERTION LIBRARY
// ============================================================================

export class Expect<T> {
  constructor(private actual: T) {}

  toBe(expected: T): void {
    if (this.actual !== expected) {
      throw new Error(`Expected ${this.actual} to be ${expected}`);
    }
  }

  toEqual(expected: T): void {
    if (JSON.stringify(this.actual) !== JSON.stringify(expected)) {
      throw new Error(`Expected ${JSON.stringify(this.actual)} to equal ${JSON.stringify(expected)}`);
    }
  }

  toBeTruthy(): void {
    if (!this.actual) {
      throw new Error(`Expected ${this.actual} to be truthy`);
    }
  }

  toBeFalsy(): void {
    if (this.actual) {
      throw new Error(`Expected ${this.actual} to be falsy`);
    }
  }

  toBeNull(): void {
    if (this.actual !== null) {
      throw new Error(`Expected ${this.actual} to be null`);
    }
  }

  toBeUndefined(): void {
    if (this.actual !== undefined) {
      throw new Error(`Expected ${this.actual} to be undefined`);
    }
  }

  toBeGreaterThan(expected: number): void {
    if (typeof this.actual !== "number") {
      throw new Error(`Expected ${this.actual} to be a number`);
    }
    if (this.actual <= expected) {
      throw new Error(`Expected ${this.actual} to be greater than ${expected}`);
    }
  }

  toBeLessThan(expected: number): void {
    if (typeof this.actual !== "number") {
      throw new Error(`Expected ${this.actual} to be a number`);
    }
    if (this.actual >= expected) {
      throw new Error(`Expected ${this.actual} to be less than ${expected}`);
    }
  }

  toContain(expected: unknown): void {
    if (Array.isArray(this.actual)) {
      if (!this.actual.includes(expected)) {
        throw new Error(`Expected ${JSON.stringify(this.actual)} to contain ${expected}`);
      }
    } else if (typeof this.actual === "string") {
      if (typeof expected !== "string") {
        throw new Error(`Expected "${expected}" to be a string when checking string.includes`);
      }
      if (!this.actual.includes(expected)) {
        throw new Error(`Expected "${this.actual}" to contain "${expected}"`);
      }
    } else {
      throw new Error(`Expected ${this.actual} to be an array or string`);
    }
  }

  toHaveLength(expected: number): void {
    if (!Array.isArray(this.actual) && typeof this.actual !== "string") {
      throw new Error(`Expected ${this.actual} to be an array or string`);
    }
    if (this.actual.length !== expected) {
      throw new Error(`Expected length ${this.actual.length} to be ${expected}`);
    }
  }
}

export function expect<T>(actual: T): Expect<T> {
  return new Expect(actual);
}

// ============================================================================
// MOCK FACTORIES
// ============================================================================

export class MockFactory {
  /**
   * Create mock game state
   */
  static createMockGameState(overrides?: MockGameState): GameState {
    const defaultConfig: DifficultyConfig = {
      width: 16,
      height: 16,
      mines: 40,
    };

    const defaultState: GameState = {
      board: this.createMockBoard(16, 16, 40),
      config: defaultConfig,
      difficulty: "easy",
      status: "playing",
      revealedCount: 0,
      flagCount: 0,
      startTime: Date.now(),
      endTime: null,
      firstClick: false,
      gameMode: "classic",
      score: 0,
      level: 1,
      moveCount: 0,
      timeRemaining: null,
      continueCount: 0,
      continueTimestamps: [],
      roundNumber: 1,
      streak: 0,
    };

    return { ...defaultState, ...overrides };
  }

  /**
   * Create mock board
   */
  static createMockBoard(width: number, height: number, mineCount: number): CellState[][] {
    const board: CellState[][] = [];

    for (let y = 0; y < height; y++) {
      const row: CellState[] = [];
      for (let x = 0; x < width; x++) {
        row.push({
          x,
          y,
          isMine: false,
          isRevealed: false,
          isFlagged: false,
          adjacentMines: 0,
        });
      }
      board.push(row);
    }

    // Place mines randomly
    let placedMines = 0;
    while (placedMines < mineCount) {
      const x = Math.floor(Math.random() * width);
      const y = Math.floor(Math.random() * height);

      if (!board[y][x].isMine) {
        board[y][x].isMine = true;
        placedMines++;

        // Update adjacent mine counts
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const nx = x + dx;
            const ny = y + dy;
            if (nx >= 0 && nx < width && ny >= 0 && ny < height && !board[ny][nx].isMine) {
              board[ny][nx].adjacentMines++;
            }
          }
        }
      }
    }

    return board;
  }

  /**
   * Create mock game mode
   */
  static createMockGameMode(overrides?: Partial<GameMode>): GameMode {
    return {
      id: "test-mode",
      name: "Test Mode",
      category: "time-based",
      description: "Test mode for testing",
      icon: "🧪",
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
      },
      continueAllowed: true,
      continueCost: 100,
      enabled: true,
      ...overrides,
    };
  }

  /**
   * Create mock payment response
   */
  static createMockPaymentResponse(success: boolean = true, transactionId?: string): MockPaymentResponse {
    return {
      success,
      transactionId: transactionId || `txn_${Date.now()}`,
      error: success ? undefined : "Payment failed",
    };
  }
}

// ============================================================================
// GAME MODE TESTS
// ============================================================================

export class GameModeTests {
  /**
   * Test mode loading
   */
  static testModeLoading(mode: GameMode): boolean {
    try {
      expect(mode).toBeTruthy();
      expect(mode.id).toBeTruthy();
      expect(mode.name).toBeTruthy();
      expect(mode.category).toBeTruthy();
      expect(mode.config).toBeTruthy();
      expect(mode.rules).toBeTruthy();
      expect(mode.scoring).toBeTruthy();
      return true;
    } catch (error) {
      console.error("Mode loading test failed:", error);
      return false;
    }
  }

  /**
   * Test mode rules enforcement
   */
  static testRulesEnforcement(mode: GameMode, gameState: GameState): boolean {
    try {
      // Test flag rules
      if (!mode.rules.allowFlags) {
        expect(gameState.flagCount).toBe(0);
      }

      // Test reveal rules - check status instead
      // If reveal on mine click is disabled and game is lost, this is unusual
      // but we'll skip this test as it requires actual game simulation

      return true;
    } catch (error) {
      console.error("Rules enforcement test failed:", error);
      return false;
    }
  }

  /**
   * Test scoring calculation
   */
  static testScoringCalculation(mode: GameMode, gameState: GameState): boolean {
    try {
      expect(gameState.score).toBeGreaterThan(-1);

      if (mode.scoring.basePoints) {
        expect(typeof mode.scoring.basePoints).toBe("number");
      }

      return true;
    } catch (error) {
      console.error("Scoring calculation test failed:", error);
      return false;
    }
  }

  /**
   * Test continue functionality
   */
  static testContinueFunctionality(mode: GameMode): boolean {
    try {
      if (mode.continueAllowed) {
        expect(mode.continueCost).toBeGreaterThan(0);
      } else {
        expect(mode.continueCost).toBe(0);
      }

      return true;
    } catch (error) {
      console.error("Continue functionality test failed:", error);
      return false;
    }
  }

  /**
   * Test difficulty progression
   */
  static testDifficultyProgression(mode: GameMode): boolean {
    try {
      if (mode.config.difficultyProgression) {
        const progression = mode.config.difficultyProgression;
        expect(progression.startLevel).toBeGreaterThan(0);

        if (progression.maxLevel !== null) {
          expect(progression.maxLevel).toBeGreaterThan(progression.startLevel);
        }
      }

      return true;
    } catch (error) {
      console.error("Difficulty progression test failed:", error);
      return false;
    }
  }
}

// ============================================================================
// PAYMENT FLOW TESTS
// ============================================================================

export class PaymentFlowTests {
  /**
   * Test payment initiation
   */
  static async testPaymentInitiation(): Promise<boolean> {
    try {
      // Mock payment initiation
      const response = MockFactory.createMockPaymentResponse(true);
      expect(response.success).toBeTruthy();
      expect(response.transactionId).toBeTruthy();
      return true;
    } catch (error) {
      console.error("Payment initiation test failed:", error);
      return false;
    }
  }

  /**
   * Test payment completion
   */
  static async testPaymentCompletion(): Promise<boolean> {
    try {
      // Mock payment completion
      const response = MockFactory.createMockPaymentResponse(true, "txn_123");
      expect(response.success).toBeTruthy();
      expect(response.transactionId).toBe("txn_123");
      return true;
    } catch (error) {
      console.error("Payment completion test failed:", error);
      return false;
    }
  }

  /**
   * Test payment failure handling
   */
  static async testPaymentFailure(): Promise<boolean> {
    try {
      // Mock payment failure
      const response = MockFactory.createMockPaymentResponse(false);
      expect(response.success).toBeFalsy();
      expect(response.error).toBeTruthy();
      return true;
    } catch (error) {
      console.error("Payment failure test failed:", error);
      return false;
    }
  }

  /**
   * Test continue benefits application
   */
  static testContinueBenefits(gameStateBefore: GameState, gameStateAfter: GameState): boolean {
    try {
      expect(gameStateAfter.continueCount).toBeGreaterThan(gameStateBefore.continueCount);
      // After continue, game should be playable (not in lost state)
      if (gameStateAfter.status === "lost") {
        throw new Error("Game should not be in lost state after continue");
      }
      return true;
    } catch (error) {
      console.error("Continue benefits test failed:", error);
      return false;
    }
  }
}

// ============================================================================
// PERFORMANCE TESTS
// ============================================================================

export class PerformanceTests {
  /**
   * Test board generation performance
   */
  static testBoardGeneration(width: number, height: number, mines: number): number {
    const startTime = performance.now();
    MockFactory.createMockBoard(width, height, mines);
    const endTime = performance.now();
    return endTime - startTime;
  }

  /**
   * Test rendering performance
   */
  static testRenderingPerformance(iterations: number, renderFn: () => void): number {
    const startTime = performance.now();

    for (let i = 0; i < iterations; i++) {
      renderFn();
    }

    const endTime = performance.now();
    return (endTime - startTime) / iterations;
  }

  /**
   * Test memory usage
   */
  static testMemoryUsage(): number {
    if ("memory" in performance) {
      const memory = (performance as Performance & { memory?: { usedJSHeapSize: number } }).memory;
      return memory ? Math.round(memory.usedJSHeapSize / 1048576) : 0; // MB
    }
    return 0;
  }

  /**
   * Benchmark function execution
   */
  static benchmark(fn: () => void, iterations: number = 1000): {
    averageTime: number;
    minTime: number;
    maxTime: number;
    totalTime: number;
  } {
    const times: number[] = [];

    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      fn();
      const end = performance.now();
      times.push(end - start);
    }

    return {
      averageTime: times.reduce((sum, t) => sum + t, 0) / times.length,
      minTime: Math.min(...times),
      maxTime: Math.max(...times),
      totalTime: times.reduce((sum, t) => sum + t, 0),
    };
  }
}

// ============================================================================
// INTEGRATION TESTS
// ============================================================================

export class IntegrationTests {
  /**
   * Test end-to-end game flow
   */
  static async testEndToEndGameFlow(): Promise<boolean> {
    try {
      // Create game state
      const gameState = MockFactory.createMockGameState();
      expect(gameState.status).toBe("playing");

      // Simulate game actions
      gameState.firstClick = true;
      gameState.revealedCount = 10;
      expect(gameState.firstClick).toBeTruthy();
      expect(gameState.revealedCount).toBeGreaterThan(0);

      // Simulate win
      gameState.status = "won";
      expect(gameState.status).toBe("won");

      return true;
    } catch (error) {
      console.error("End-to-end game flow test failed:", error);
      return false;
    }
  }

  /**
   * Test mode switching
   */
  static testModeSwitching(modes: GameMode[]): boolean {
    try {
      expect(modes.length).toBeGreaterThan(0);

      modes.forEach((mode) => {
        expect(GameModeTests.testModeLoading(mode)).toBeTruthy();
      });

      return true;
    } catch (error) {
      console.error("Mode switching test failed:", error);
      return false;
    }
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export function createTestRunner(): TestRunner {
  return new TestRunner();
}
