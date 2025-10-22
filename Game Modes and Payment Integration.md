# Minesweeper Game Modes & World Coin Payment Integration

## Project Overview

Enhance the existing Mission Impossible-themed Minesweeper mini app by implementing multiple game modes and integrating World Coin's payment system for continue functionality when players lose.

## Phase 1: Codebase Analysis

### 1.1 Current Implementation Review

Analyze the existing codebase for:

```typescript
// Identify and document these core systems:
interface ExistingSystems {
  gameEngine: {
    boardGeneration: Function;
    cellRevealLogic: Function;
    winLossDetection: Function;
    flaggingSystem: Function;
    timerSystem: Function;
  };
  stateManagement: {
    gameState: GameState;
    userState: UserState;
    scoreTracking: ScoreSystem;
  };
  worldIntegration: {
    authSystem: WorldIDAuth;
    miniKitHooks: MiniKitHooks;
    userSession: SessionManagement;
  };
  uiComponents: {
    gameBoard: Component;
    menuSystem: Component;
    modals: Component[];
  };
}
```

### 1.2 Refactoring Requirements

Identify areas that need refactoring to support:

- Multiple game mode configurations
- Dynamic rule systems
- Payment integration points
- Game state persistence across continues

## Phase 2: Game Mode Architecture

### 2.1 Core Game Mode System

```typescript
// Base game mode interface
interface GameMode {
  id: string;
  name: string;
  category: "time-based" | "difficulty" | "relaxed" | "challenge" | "creative";
  description: string;
  icon: string; // Mission Impossible themed icons
  config: GameModeConfig;
  rules: GameRules;
  scoring: ScoringSystem;
  continueAllowed: boolean;
  continueCost: number; // in World Coin units
}

interface GameModeConfig {
  boardSize: { width: number; height: number } | "dynamic";
  mineCount: number | "dynamic";
  timeLimit?: number;
  moveLimit?: number;
  specialRules: SpecialRule[];
  difficultyProgression?: DifficultyProgression;
}

interface GameRules {
  allowFlags: boolean;
  revealOnMineClick: boolean;
  numberVisibility: "always" | "conditional" | "hidden";
  firstClickSafe: boolean;
  cascadeReveal: boolean;
  customWinCondition?: (gameState: GameState) => boolean;
  customLoseCondition?: (gameState: GameState) => boolean;
}
```

### 2.2 Game Mode Registry

```typescript
class GameModeRegistry {
  private modes: Map<string, GameMode> = new Map();

  constructor() {
    this.registerAllModes();
  }

  registerMode(mode: GameMode): void {
    this.modes.set(mode.id, mode);
  }

  getMode(id: string): GameMode | undefined {
    return this.modes.get(id);
  }

  getModesByCategory(category: string): GameMode[] {
    return Array.from(this.modes.values()).filter(
      (mode) => mode.category === category
    );
  }
}
```

## Phase 3: Game Modes Implementation

### 3.1 Time-Based Modes

```typescript
// TIME ATTACK MODE
const timeAttackMode: GameMode = {
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
      state.timeElapsed >= state.timeLimit || state.hitMine,
  },
  scoring: {
    basePoints: 1000,
    timeBonus: (timeRemaining) => timeRemaining * 10,
    accuracyBonus: (accuracy) => accuracy * 500,
  },
  continueAllowed: true,
  continueCost: 100, // 100 World Coin units
};

// SPEED RUN MODE
const speedRunMode: GameMode = {
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
    basePoints: 0, // Only time matters
    timeScore: (completionTime) => Math.max(0, 100000 - completionTime * 100),
  },
  continueAllowed: false, // No continues in competitive mode
  continueCost: 0,
};

// TIMED ROUNDS MODE
const timedRoundsMode: GameMode = {
  id: "timed-rounds",
  name: "Rapid Deployment",
  category: "time-based",
  description: "Multiple quick missions in succession!",
  icon: "🔄⚡",
  config: {
    boardSize: { width: 8, height: 8 },
    mineCount: 10,
    timeLimit: 60, // Per round
    specialRules: ["multi-round", "score-accumulation"],
  },
  rules: {
    allowFlags: true,
    revealOnMineClick: false, // Move to next round instead
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
};
```

### 3.2 Difficulty Progression Modes

```typescript
// ENDLESS MODE
const endlessMode: GameMode = {
  id: "endless",
  name: "Infinite Protocol",
  category: "difficulty",
  description: "Missions get harder with each success!",
  icon: "♾️📈",
  config: {
    boardSize: "dynamic",
    mineCount: "dynamic",
    difficultyProgression: {
      startLevel: 1,
      maxLevel: null, // No limit
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
};

// SURVIVAL MODE
const survivalMode: GameMode = {
  id: "survival",
  name: "Pressure Chamber",
  category: "difficulty",
  description: "Time decreases, pressure increases!",
  icon: "🎯💀",
  config: {
    boardSize: { width: 16, height: 16 },
    mineCount: "dynamic",
    timeLimit: 180, // Decreases each level
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
};
```

### 3.3 Relaxed/Learning Modes

```typescript
// ZEN MODE
const zenMode: GameMode = {
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
    revealOnMineClick: false, // Just mark as mistake
    numberVisibility: "always",
    firstClickSafe: true,
    cascadeReveal: true,
  },
  scoring: {
    practicePoints: 0, // No scoring in zen mode
  },
  continueAllowed: false, // No need for continues
  continueCost: 0,
};

// CUSTOM DIFFICULTY
const customMode: GameMode = {
  id: "custom",
  name: "Custom Protocol",
  category: "relaxed",
  description: "Configure your own mission parameters",
  icon: "⚙️🎮",
  config: {
    // These are set by user
    boardSize: "dynamic",
    mineCount: "dynamic",
    timeLimit: undefined,
    specialRules: ["user-configurable"],
  },
  rules: {
    // User configurable
    allowFlags: true,
    revealOnMineClick: true,
    numberVisibility: "always",
    firstClickSafe: true,
    cascadeReveal: true,
  },
  scoring: {
    customFormula: (params) => calculateCustomScore(params),
  },
  continueAllowed: true,
  continueCost: 75,
};
```

### 3.4 Challenge Modes

```typescript
// LIMITED MOVES MODE
const limitedMovesMode: GameMode = {
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
    allowFlags: true, // Flags don't count as moves
    revealOnMineClick: true,
    numberVisibility: "always",
    firstClickSafe: true,
    cascadeReveal: true,
    customLoseCondition: (state) =>
      state.movesUsed >= state.moveLimit || state.hitMine,
  },
  scoring: {
    efficiencyBonus: (movesRemaining) => movesRemaining * 100,
    perfectBonus: 5000, // If completed with optimal moves
  },
  continueAllowed: true,
  continueCost: 125,
};

// HARDCORE MODE
const hardcoreMode: GameMode = {
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
    hardcoreMultiplier: 5, // 5x normal points
    flawlessBonus: 10000,
  },
  continueAllowed: false, // That's the point!
  continueCost: 0,
};

// BLIND MODE
const blindMode: GameMode = {
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
    numberVisibility: "conditional", // Only near flags
    firstClickSafe: true,
    cascadeReveal: false, // Too powerful in blind mode
  },
  scoring: {
    blindBonus: 3000,
    deductionPoints: (correctFlags) => correctFlags * 200,
  },
  continueAllowed: true,
  continueCost: 150,
};
```

### 3.5 Creative Modes

```typescript
// MEMORY MODE
const memoryMode: GameMode = {
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
      revealDuration: 5000, // 5 seconds to memorize
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
};

// PATTERN MODE
const patternMode: GameMode = {
  id: "pattern",
  name: "Geometric Protocol",
  category: "creative",
  description: "Mines follow patterns!",
  icon: "🔷📐",
  config: {
    boardSize: { width: 15, height: 15 },
    mineCount: "pattern-based",
    specialRules: ["pattern-generation", "symmetry-hints"],
  },
  rules: {
    allowFlags: true,
    revealOnMineClick: true,
    numberVisibility: "always",
    firstClickSafe: false, // Patterns are predictable
    cascadeReveal: true,
    customBoardGeneration: generatePatternBoard,
  },
  scoring: {
    patternRecognition: (earlyFlagAccuracy) => earlyFlagAccuracy * 1000,
    symmetryBonus: 2000,
  },
  continueAllowed: true,
  continueCost: 100,
};
```

## Phase 4: Payment Integration (Updated)

### 4.1 Payment System Architecture

```typescript
// Simple payment integration system
interface PaymentSystem {
  provider: "generic" | "worldcoin" | "stripe" | "paypal";
  config: PaymentConfig;
  // Reference materials: World Documentation, World Coin MCP Server, MCP Context 7
}

interface PaymentConfig {
  currency: "WLD" | "USD" | "EUR"; // Support multiple currencies
  continueOptions: ContinueOption[];
  paymentMethods: PaymentMethod[];
  transactionTimeout: number;
  retryAttempts: number;
}

interface ContinueOption {
  gameMode: string;
  baseCost: number;
  dynamicPricing?: (gameState: GameState) => number;
  description: string;
  benefits: string[];
}
```

### 4.2 Payment Flow Implementation

```typescript
class ContinuePaymentManager {
  private paymentClient: PaymentClient;

  constructor() {
    this.paymentClient = new PaymentClient();
    // Reference materials: World Documentation, World Coin MCP Server, MCP Context 7
  }

  async initiateContinuePayment(
    userId: string,
    gameMode: GameMode,
    gameState: GameState
  ): Promise<PaymentResult> {
    try {
      // Calculate dynamic pricing if applicable
      const cost = this.calculateContinueCost(gameMode, gameState);

      // Create payment request
      const paymentRequest: PaymentRequest = {
        userId,
        amount: cost,
        currency: "WLD",
        description: `Continue ${gameMode.name}`,
        metadata: {
          gameMode: gameMode.id,
          level: gameState.level,
          score: gameState.score,
          timestamp: Date.now(),
        },
        callbackUrl: "/api/payment/continue-callback",
      };

      // Initiate payment via payment client
      const payment = await this.paymentClient.pay(paymentRequest);

      // Handle payment UI
      await this.showPaymentModal(payment);

      // Wait for payment confirmation
      const result = await this.waitForPaymentConfirmation(payment.id);

      if (result.status === "success") {
        await this.applyContinue(gameState);
        return { success: true, transactionId: result.transactionId };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error("Payment failed:", error);
      return { success: false, error: error.message };
    }
  }

  private calculateContinueCost(
    gameMode: GameMode,
    gameState: GameState
  ): number {
    let baseCost = gameMode.continueCost;

    // Dynamic pricing based on game state
    if (gameState.continueCount > 0) {
      // Increase cost for multiple continues
      baseCost *= Math.pow(1.5, gameState.continueCount);
    }

    // Level-based pricing for progression modes
    if (gameMode.category === "difficulty" && gameState.level) {
      baseCost += gameState.level * 10;
    }

    // Time-based discount (early continues cost less)
    if (gameState.timeElapsed < 30) {
      baseCost *= 0.8; // 20% discount for quick retries
    }

    return Math.floor(baseCost);
  }

  private async applyContinue(gameState: GameState): Promise<void> {
    // Reset mine that was clicked
    gameState.hitMine = false;
    gameState.gameOver = false;

    // Add continue benefits based on game mode
    if (gameState.gameMode === "limited-moves") {
      gameState.movesRemaining += 10; // Bonus moves
    } else if (gameState.gameMode === "time-attack") {
      gameState.timeRemaining += 60; // Extra minute
    }

    // Track continue usage
    gameState.continueCount++;
    gameState.continueTimestamps.push(Date.now());

    // Apply visual indicator
    await this.showContinueEffect();
  }
}
```

### 4.3 Payment UI Components

```tsx
// Continue Modal Component
const ContinueModal: React.FC<ContinueModalProps> = ({
  gameMode,
  gameState,
  onContinue,
  onQuit,
}) => {
  const [processing, setProcessing] = useState(false);
  const [cost, setCost] = useState(0);

  useEffect(() => {
    const calculatedCost = calculateContinueCost(gameMode, gameState);
    setCost(calculatedCost);
  }, [gameMode, gameState]);

  const handleContinue = async () => {
    setProcessing(true);

    try {
      const result = await paymentManager.initiateContinuePayment(
        user.id,
        gameMode,
        gameState
      );

      if (result.success) {
        // Animate success
        await showSuccessAnimation();
        onContinue();
      } else {
        showErrorMessage(result.error);
      }
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="continue-modal mi-theme">
      <div className="mission-failed-header">
        <h2>MISSION FAILED</h2>
        <div className="explosion-effect" />
      </div>

      <div className="continue-options">
        <h3>Continue Mission?</h3>

        <div className="cost-display">
          <span className="cost-amount">{cost} WLD</span>
          <span className="cost-label">World Coins</span>
        </div>

        <div className="continue-benefits">
          {getContinueBenefits(gameMode).map((benefit) => (
            <div key={benefit} className="benefit-item">
              <span className="benefit-icon">✓</span>
              <span>{benefit}</span>
            </div>
          ))}
        </div>

        <div className="action-buttons">
          <button
            className="continue-btn primary"
            onClick={handleContinue}
            disabled={processing}
          >
            {processing ? (
              <LoadingSpinner />
            ) : (
              <>
                <PaymentIcon />
                Pay & Continue
              </>
            )}
          </button>

          <button className="quit-btn secondary" onClick={onQuit}>
            End Mission
          </button>
        </div>

        <div className="payment-info">
          <WorldCoinLogo />
          <span>Secure payment via World Coin</span>
        </div>
      </div>
    </div>
  );
};
```

### 4.4 MCP Server Integration

```typescript
// World Coin MCP Client
class WorldCoinMCPClient {
  private serverUrl: string;
  private apiKey: string;

  constructor(config: MCPConfig) {
    this.serverUrl = config.serverUrl;
    this.apiKey = config.apiKey;
  }

  async pay(request: PaymentRequest): Promise<PaymentResponse> {
    const response = await fetch(`${this.serverUrl}/mini-apps/commands/pay`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
        "X-Mini-App-Id": process.env.MINI_APP_ID,
      },
      body: JSON.stringify({
        amount: request.amount,
        currency: request.currency,
        recipient: "game-treasury", // Your game's wallet
        description: request.description,
        metadata: request.metadata,
        callback_url: request.callbackUrl,
        user_id: request.userId,
      }),
    });

    if (!response.ok) {
      throw new Error(`Payment failed: ${response.statusText}`);
    }

    return response.json();
  }

  async verifyPayment(paymentId: string): Promise<PaymentStatus> {
    const response = await fetch(
      `${this.serverUrl}/mini-apps/payments/${paymentId}/status`,
      {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      }
    );

    return response.json();
  }
}
```

## Phase 5: Game Mode Selector UI

### 5.1 Mode Selection Interface

```tsx
const GameModeSelector: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [hoveredMode, setHoveredMode] = useState<string | null>(null);

  const categories = [
    { id: "all", name: "All Missions", icon: "🎮" },
    { id: "time-based", name: "Time Ops", icon: "⏱️" },
    { id: "difficulty", name: "Progressive", icon: "📈" },
    { id: "relaxed", name: "Training", icon: "🎯" },
    { id: "challenge", name: "Elite", icon: "💀" },
    { id: "creative", name: "Special", icon: "🎨" },
  ];

  return (
    <div className="game-mode-selector mi-theme">
      <div className="mode-header">
        <h1 className="mission-title">SELECT YOUR MISSION</h1>
        <div className="scanning-line" />
      </div>

      <div className="category-tabs">
        {categories.map((category) => (
          <button
            key={category.id}
            className={`category-tab ${
              selectedCategory === category.id ? "active" : ""
            }`}
            onClick={() => setSelectedCategory(category.id)}
          >
            <span className="tab-icon">{category.icon}</span>
            <span className="tab-name">{category.name}</span>
          </button>
        ))}
      </div>

      <div className="modes-grid">
        {getFilteredModes(selectedCategory).map((mode) => (
          <ModeCard
            key={mode.id}
            mode={mode}
            onSelect={() => startGame(mode)}
            onHover={() => setHoveredMode(mode.id)}
            isHovered={hoveredMode === mode.id}
          />
        ))}
      </div>

      {hoveredMode && <ModePreview mode={getModeById(hoveredMode)} />}
    </div>
  );
};
```

## Phase 6: Analytics & Tracking

### 6.1 Mode Performance Tracking

```typescript
interface ModeAnalytics {
  modeId: string;
  userId: string;
  sessions: number;
  totalScore: number;
  highScore: number;
  averageTime: number;
  winRate: number;
  continuesUsed: number;
  revenueGenerated: number; // From continues
  lastPlayed: Date;
}

class AnalyticsTracker {
  async trackGameSession(session: GameSession): Promise<void> {
    const analytics = {
      mode: session.gameMode,
      userId: session.userId,
      score: session.finalScore,
      duration: session.duration,
      outcome: session.outcome,
      continuesUsed: session.continueCount,
      revenue: session.continueCount * session.continueCost,
      timestamp: Date.now(),
    };

    // Send to analytics service
    await this.sendAnalytics(analytics);

    // Update user stats
    await this.updateUserStats(session.userId, analytics);

    // Update global leaderboards
    if (session.gameMode === "speed-run") {
      await this.updateLeaderboard(session);
    }
  }
}
```

## Phase 7: Testing Checklist

### 7.1 Mode Testing

- [ ] Each mode loads correctly
- [ ] Rules are properly enforced
- [ ] Scoring systems calculate correctly
- [ ] Difficulty progression works
- [ ] Continue functionality works
- [ ] Payment flow completes successfully

### 7.2 Payment Testing

- [ ] World Coin MCP integration connects
- [ ] Payment requests process
- [ ] Transaction verification works
- [ ] Continue benefits apply correctly
- [ ] Failed payments handle gracefully
- [ ] Refund mechanism works (if applicable)

### 7.3 Performance Testing

- [ ] Mode switching is smooth
- [ ] Large boards (Marathon mode) perform well
- [ ] Payment UI is responsive
- [ ] Analytics don't impact gameplay

## Phase 8: Deployment Considerations

### 8.1 Environment Variables

```env
# World Coin MCP Configuration
WORLD_COIN_MCP_SERVER=https://api.world.org/mcp
WORLD_COIN_API_KEY=your_api_key
MINI_APP_ID=your_mini_app_id
GAME_TREASURY_WALLET=your_wallet_address

# Payment Configuration
CONTINUE_BASE_COST=100
PAYMENT_TIMEOUT=30000
MAX_RETRY_ATTEMPTS=3

# Feature Flags
ENABLE_PAYMENT_SYSTEM=true
ENABLE_ANALYTICS=true
ENABLE_LEADERBOARDS=true
```

### 8.2 Security Considerations

- Validate all payment requests server-side
- Implement rate limiting for payment attempts
- Store sensitive payment data encrypted
- Log all transactions for audit trail
- Implement fraud detection for unusual patterns

## Success Criteria

1. ✅ All game modes functional and playable
2. ✅ Payment integration works seamlessly
3. ✅ Continue mechanism provides value to players
4. ✅ UI clearly communicates costs and benefits
5. ✅ Analytics track mode popularity and revenue
6. ✅ Performance remains smooth across all modes
7. ✅ Mobile experience is optimized
8. ✅ World Coin transactions process reliably
9. ✅ Error handling prevents lost payments
10. ✅ Player progression saves correctly

## Implementation Priority

### Week 1: Foundation

1. Analyze current codebase
2. Implement game mode architecture
3. Create mode registry system
4. Build mode selector UI

### Week 2: Core Modes

1. Implement Time-Based modes
2. Implement Difficulty Progression modes
3. Test mode switching and rules

### Week 3: Advanced Modes

1. Implement Challenge modes
2. Implement Creative modes
3. Add Relaxed/Learning modes

### Week 4: Payment Integration

1. Integrate World Coin MCP
2. Implement continue payment flow
3. Create payment UI components
4. Test end-to-end payment flow

### Week 5: Polish & Launch

1. Add analytics tracking
2. Optimize performance
3. Complete testing
4. Deploy to production

## Additional Notes

- Start with a subset of modes (3-5) for initial release
- A/B test different continue prices
- Consider special events with discounted continues
- Implement a first-time free continue to hook players
- Create mode-specific achievements and rewards
- Consider daily challenges using specific modes
- Add social features (share scores, challenge friends)

This implementation will create a comprehensive game mode system with seamless World Coin payment integration for continues, enhancing both gameplay variety and monetization potential.
