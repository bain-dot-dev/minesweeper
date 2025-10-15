/**
 * Game constants and configuration
 */

// Cell number colors - classic Minesweeper styling
export const NUMBER_COLORS: Record<number, string> = {
  1: '#0000FF', // Blue
  2: '#008000', // Green
  3: '#FF0000', // Red
  4: '#000080', // Dark Blue
  5: '#800000', // Maroon
  6: '#008080', // Teal
  7: '#000000', // Black
  8: '#808080', // Gray
};

// Direction offsets for adjacent cells (8 directions)
export const DIRECTIONS: [number, number][] = [
  [-1, -1], [-1, 0], [-1, 1],
  [0, -1],           [0, 1],
  [1, -1],  [1, 0],  [1, 1],
];

// Local storage keys
export const STORAGE_KEYS = {
  STATS: 'minesweeper_stats',
  SETTINGS: 'minesweeper_settings',
  LEADERBOARD: 'minesweeper_leaderboard',
} as const;

// Timer constants
export const TIMER_UPDATE_INTERVAL = 100; // ms

// Animation durations
export const ANIMATION_DURATIONS = {
  CELL_REVEAL: 150,
  FLAG_PLACE: 200,
  MINE_EXPLODE: 300,
  CASCADE_DELAY: 30,
} as const;

// Touch gesture constants
export const TOUCH_CONSTANTS = {
  LONG_PRESS_DURATION: 500, // ms
  MIN_CELL_SIZE: 44, // px - minimum touch target size
} as const;
