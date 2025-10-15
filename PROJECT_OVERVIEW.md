# Minesweeper Mini App Development with World ID Integration

## Project Overview

You are tasked with creating a fully-featured Minesweeper game as a World Mini App using React 19.0.0, Next.js 15.2.3, and integrating World ID Kit and Mini Kit. The game should be mobile-responsive, feature-rich, and provide an excellent user experience with smooth animations and a cohesive design theme.

## Phase 1: Codebase Analysis and Setup

### 1.1 Initial Setup Review

First, analyze the existing codebase created from:

```bash
npx @worldcoin/create-mini-app@latest my-first-mini-app
```

Please examine:

- Project structure and file organization
- Existing dependencies and configurations
- World Mini Kit integration points
- Available hooks and utilities from Mini Kit
- TypeScript configurations
- Tailwind CSS setup (if present)

### 1.2 World ID Integration Analysis

Review the World ID documentation and identify:

- Authentication flow requirements
- Available verification methods
- User session management
- Privacy-preserving features
- Integration points with the Mini App framework

## Phase 2: Game Architecture Design

### 2.1 Core Game Components Structure

Design and implement the following component hierarchy:

```
- GameContainer (main wrapper with World ID auth)
  - GameHeader (timer, mine counter, difficulty selector, user info)
  - GameBoard (the main game grid)
    - Cell (individual cell component)
  - GameControls (reset, settings, leaderboard)
  - GameOverModal (win/lose states)
  - LeaderboardModal (World ID verified scores)
```

### 2.2 State Management

Implement comprehensive state management for:

- Game state (playing, won, lost, paused)
- Board state (2D array of cell objects)
- Cell state (revealed, flagged, mine, number)
- Timer state
- User authentication state (World ID)
- Difficulty settings
- Game statistics

## Phase 3: Minesweeper Game Implementation

### 3.1 Core Game Mechanics

Implement these essential features:

```typescript
// Cell State Interface
interface CellState {
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  adjacentMines: number;
  x: number;
  y: number;
}

// Game Configuration
const DIFFICULTY_CONFIGS = {
  easy: { width: 8, height: 8, mines: 10 },
  medium: { width: 16, height: 16, mines: 40 },
  hard: { width: 30, height: 16, mines: 99 },
};
```

Key mechanics to implement:

1. **Safe First Click**: Ensure first click never hits a mine
2. **Mine Placement**: Random distribution after first click
3. **Adjacent Mine Calculation**: Count mines in all 8 directions
4. **Recursive Reveal**: Auto-reveal empty cells and their neighbors
5. **Flagging System**: Right-click or long-press for mobile
6. **Win/Loss Detection**: Check after each move
7. **Timer**: Start on first click, stop on game end

### 3.2 Mobile Responsiveness

Implement touch controls:

- Tap to reveal
- Long press to flag
- Pinch to zoom (for larger boards)
- Responsive grid sizing
- Touch-friendly button sizes (minimum 44x44px)

## Phase 4: UI/UX Design Implementation

### 4.1 Design Theme

Create a modern, cohesive design with:

**Color Palette** (suggested - customize as needed):

```css
:root {
  --primary: #6366f1; /* Indigo - main brand color */
  --secondary: #8b5cf6; /* Purple - accent */
  --success: #10b981; /* Green - safe cells */
  --danger: #ef4444; /* Red - mines */
  --warning: #f59e0b; /* Amber - flags */
  --neutral-100: #f3f4f6; /* Light gray - unrevealed cells */
  --neutral-800: #1f2937; /* Dark gray - text */
  --gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
```

### 4.2 Animations

Implement smooth animations for:

```css
/* Cell reveal animation */
@keyframes cellReveal {
  from {
    transform: scale(0.8) rotateY(180deg);
    opacity: 0;
  }
  to {
    transform: scale(1) rotateY(0);
    opacity: 1;
  }
}

/* Mine explosion animation */
@keyframes mineExplode {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.3);
    background-color: #ef4444;
  }
  100% {
    transform: scale(1);
  }
}

/* Flag placement animation */
@keyframes flagPlace {
  0% {
    transform: translateY(-10px) rotate(-15deg);
  }
  50% {
    transform: translateY(0) rotate(15deg);
  }
  100% {
    transform: translateY(0) rotate(0);
  }
}
```

Additional animations:

- Smooth hover effects on cells
- Number fade-in when revealed
- Victory celebration animation
- Particle effects for mine explosions
- Smooth transitions for difficulty changes

### 4.3 Visual Components

Design elements:

- Glass morphism effects for modals
- Subtle shadows and gradients
- Custom mine and flag icons (SVG)
- Number styling with distinct colors (1=blue, 2=green, 3=red, etc.)
- Progress indicators
- Loading states

## Phase 5: World ID Integration Features

### 5.1 Authentication Flow

1. Implement World ID sign-in button
2. Handle verification callbacks
3. Store user session securely
4. Display verified user badge

### 5.2 Social Features

Integrate World ID for:

- Verified leaderboards (prevent cheating)
- User profiles with stats
- Achievement system
- Share functionality with verified scores

### 5.3 Privacy Features

Ensure:

- No personal data exposure
- Anonymous gameplay option
- Secure score submission
- Privacy-preserving leaderboards

## Phase 6: Advanced Features

### 6.1 Game Enhancements

- **Custom difficulty**: Let users set custom grid size and mine count
- **Hints system**: Limited hints per game
- **Daily challenges**: Special boards with World ID verification
- **Themes**: Multiple visual themes (classic, modern, dark mode)
- **Sound effects**: Optional audio feedback
- **Haptic feedback**: Vibration on mobile devices

### 6.2 Statistics Tracking

Track and display:

```typescript
interface GameStats {
  gamesPlayed: number;
  gamesWon: number;
  winRate: number;
  bestTime: { easy: number; medium: number; hard: number };
  currentStreak: number;
  longestStreak: number;
  totalMinesFound: number;
  averageTime: number;
}
```

### 6.3 Performance Optimizations

- Use React.memo for cell components
- Implement virtual scrolling for large boards
- Optimize re-renders with useCallback
- Lazy load modals and heavy components
- Implement service worker for offline play

## Phase 7: Testing Requirements

### 7.1 Functionality Tests

Test all game mechanics:

- Mine placement randomness
- First click safety
- Recursive reveal algorithm
- Win/loss conditions
- Timer accuracy
- Flag counting
- Touch controls

### 7.2 Responsive Design Tests

Verify on:

- iPhone SE (375px)
- iPhone 14 Pro (393px)
- iPad (768px)
- Desktop (1920px)

## Phase 8: Documentation

### 8.1 Code Documentation

Document:

- Component props and interfaces
- Complex algorithms (flood fill, mine placement)
- State management patterns
- World ID integration points
- Custom hooks

### 8.2 User Documentation

Create:

- How to play guide
- World ID setup instructions
- Troubleshooting section
- Feature overview

### 8.3 Developer Documentation

Include:

- Setup instructions
- Environment variables
- Deployment guide
- API endpoints (if any)
- Contributing guidelines

## Implementation Priorities

1. **Core Gameplay** (Critical)

   - Basic grid and cell components
   - Mine placement logic
   - Click handlers
   - Win/loss detection

2. **Mobile Responsiveness** (Critical)

   - Touch controls
   - Responsive sizing
   - Mobile-first design

3. **World ID Integration** (Important)

   - Authentication
   - Leaderboards
   - Profile system

4. **Animations & Polish** (Important)

   - Cell animations
   - Smooth transitions
   - Visual feedback

5. **Advanced Features** (Nice-to-have)
   - Themes
   - Sound effects
   - Daily challenges

## File Structure Recommendation

```
src/
├── app/
│   ├── page.tsx (main game page)
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── game/
│   │   ├── GameBoard.tsx
│   │   ├── Cell.tsx
│   │   ├── GameHeader.tsx
│   │   └── GameControls.tsx
│   ├── modals/
│   │   ├── GameOverModal.tsx
│   │   ├── LeaderboardModal.tsx
│   │   └── SettingsModal.tsx
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   └── Modal.tsx
│   └── auth/
│       └── WorldIDAuth.tsx
├── hooks/
│   ├── useGameState.ts
│   ├── useTimer.ts
│   ├── useMinesweeper.ts
│   └── useWorldID.ts
├── lib/
│   ├── game-logic.ts
│   ├── utils.ts
│   └── constants.ts
├── styles/
│   ├── animations.css
│   └── theme.css
└── types/
    └── game.ts
```

## Success Criteria

The final implementation should:

1. ✅ Run smoothly on mobile and desktop
2. ✅ Include all core Minesweeper mechanics
3. ✅ Integrate World ID authentication
4. ✅ Feature smooth animations and transitions
5. ✅ Follow modern UI/UX principles
6. ✅ Be fully documented
7. ✅ Handle edge cases gracefully
8. ✅ Provide excellent user feedback
9. ✅ Load quickly and perform well
10. ✅ Be accessible (WCAG 2.1 AA compliant)

## Development Approach

1. Start by analyzing the template codebase
2. Set up the basic game grid and state management
3. Implement core game logic
4. Add World ID integration
5. Apply styling and animations
6. Test thoroughly on multiple devices
7. Document everything
8. Optimize performance

Please begin by examining the existing codebase structure, then proceed with implementing the game following this specification. Focus on creating clean, maintainable code with clear separation of concerns. Ensure all World ID integrations follow their best practices and security guidelines.

Ask clarifying questions if needed, and provide regular progress updates as you implement each phase.
