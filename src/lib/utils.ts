/**
 * Utility functions for the Minesweeper game
 */

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { GameStats } from '@/types/game';
import { STORAGE_KEYS } from '@/lib/constants';

/**
 * Combines Tailwind CSS classes with proper merging
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Formats time in seconds to MM:SS format
 */
export function formatTime(milliseconds: number): string {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Loads game statistics from local storage
 */
export function loadGameStats(): GameStats {
  if (typeof window === 'undefined') {
    return getDefaultStats();
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEYS.STATS);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load game stats:', error);
  }

  return getDefaultStats();
}

/**
 * Saves game statistics to local storage
 */
export function saveGameStats(stats: GameStats): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));
  } catch (error) {
    console.error('Failed to save game stats:', error);
  }
}

/**
 * Returns default game statistics
 */
function getDefaultStats(): GameStats {
  return {
    gamesPlayed: 0,
    gamesWon: 0,
    winRate: 0,
    bestTime: {
      easy: null,
      medium: null,
      hard: null,
    },
    currentStreak: 0,
    longestStreak: 0,
    totalMinesFound: 0,
    averageTime: 0,
  };
}

/**
 * Calculates win rate as a percentage
 */
export function calculateWinRate(won: number, played: number): number {
  if (played === 0) return 0;
  return Math.round((won / played) * 100);
}

/**
 * Triggers haptic feedback on supported devices
 */
export function triggerHaptic(type: 'light' | 'medium' | 'heavy' = 'light'): void {
  if (typeof window === 'undefined' || !('vibrate' in navigator)) {
    return;
  }

  const durations: Record<string, number> = {
    light: 10,
    medium: 20,
    heavy: 30,
  };

  navigator.vibrate(durations[type]);
}

/**
 * Plays a sound effect (placeholder for future implementation)
 */
export function playSound(soundName: 'click' | 'flag' | 'explosion' | 'win'): void {
  // TODO: Implement sound effects if needed
  console.debug(`Sound: ${soundName}`);
}

/**
 * Checks if the device is mobile
 */
export function isMobile(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

/**
 * Debounce function for performance optimization
 */
export function debounce<T extends (...args: Parameters<T>) => ReturnType<T>>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}
