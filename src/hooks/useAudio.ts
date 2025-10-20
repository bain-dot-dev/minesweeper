/**
 * React hooks for audio integration
 * Provides easy-to-use hooks for playing sounds and managing audio
 */

import { useEffect, useRef, useCallback, useMemo } from 'react';
import { getAudioManager } from '@/lib/audio/AudioManager';
import { AudioEventType, AudioConfig, GameContext, AudioSettings } from '@/types/audio';
import { CellState } from '@/types/game';

/**
 * Main hook for game audio
 * Provides methods to play sounds and music with automatic cleanup
 */
export function useGameAudio() {
  const audioManagerRef = useRef(getAudioManager());

  useEffect(() => {
    const audioManager = audioManagerRef.current;

    // Initialize audio system
    audioManager.initialize().catch(err => {
      console.error('Failed to initialize audio:', err);
    });

    // Cleanup on unmount
    return () => {
      audioManager.stopAll();
    };
  }, []);

  const playSound = useCallback((event: AudioEventType, config?: Partial<AudioConfig>) => {
    audioManagerRef.current.playSound(event, config);
  }, []);

  const playMusic = useCallback((trackName: string, config?: Partial<AudioConfig>) => {
    audioManagerRef.current.playMusic(trackName, config);
  }, []);

  const stopMusic = useCallback(() => {
    audioManagerRef.current.stopMusic();
  }, []);

  const stopAll = useCallback(() => {
    audioManagerRef.current.stopAll();
  }, []);

  const playAdaptiveSound = useCallback((event: AudioEventType, context: GameContext) => {
    audioManagerRef.current.playAdaptiveSound(event, context);
  }, []);

  const adjustMusicIntensity = useCallback((dangerLevel: number) => {
    audioManagerRef.current.adjustMusicIntensity(dangerLevel);
  }, []);

  const fadeTransition = useCallback(async (from: string, to: string, duration: number) => {
    return audioManagerRef.current.fadeTransition(from, to, duration);
  }, []);

  return {
    playSound,
    playMusic,
    stopMusic,
    stopAll,
    playAdaptiveSound,
    adjustMusicIntensity,
    fadeTransition,
    audioManager: audioManagerRef.current,
  };
}

/**
 * Hook for playing cell-specific sounds
 * Automatically determines the correct sound based on cell state
 */
export function useCellAudio() {
  const { playSound, playAdaptiveSound } = useGameAudio();

  const playCellRevealSound = useCallback((cell: CellState, context?: Partial<GameContext>) => {
    if (cell.isMine) {
      // Bomb explosion with spatial effect
      playSound('bomb_explode', { volume: 0.8 });
      return;
    }

    if (cell.adjacentMines === 0) {
      // Safe reveal - will trigger cascade
      playSound('cascade_reveal', { volume: 0.4 });
      return;
    }

    // Number reveal - different sound for each number
    // Use available sounds with pitch variation for missing ones
    let soundToPlay: AudioEventType;
    if (cell.adjacentMines <= 2) {
      soundToPlay = `number_${cell.adjacentMines}` as AudioEventType;
    } else {
      // Use number_2 with different pitch for numbers 3-8
      soundToPlay = 'number_2' as AudioEventType;
    }

    // Adjust pitch based on number (higher numbers = higher pitch)
    const pitchVariation = 1 + ((cell.adjacentMines - 1) * 0.1);

    if (context && context.nearBombs !== undefined) {
      // Use adaptive sound if context provided
      playAdaptiveSound('cell_reveal', {
        nearBombs: context.nearBombs,
        streakCount: context.streakCount || 0,
        revealedCells: context.revealedCells || 0,
        totalCells: context.totalCells || 0,
        dangerLevel: context.dangerLevel || 0,
      });
    } else {
      // Regular number reveal with pitch variation
      playSound(soundToPlay, {
        volume: 0.45,
        playbackRate: pitchVariation
      });
    }
  }, [playSound, playAdaptiveSound]);

  const playCellFlagSound = useCallback((isFlagging: boolean) => {
    if (isFlagging) {
      playSound('cell_flag', { volume: 0.5 });
    } else {
      // Use same sound for unflag if unflag sound doesn't exist
      playSound('cell_flag', { volume: 0.3, playbackRate: 0.9 });
    }
  }, [playSound]);

  return {
    playCellRevealSound,
    playCellFlagSound,
  };
}

/**
 * Hook for game state audio (victory, defeat, etc.)
 */
export function useGameStateAudio() {
  const { playSound, playMusic, stopMusic, fadeTransition } = useGameAudio();

  const playVictorySound = useCallback(() => {
    stopMusic();
    playSound('mission_complete', { volume: 0.7 });
    setTimeout(() => {
      playMusic('victory_theme', { volume: 0.6, loop: false });
    }, 500);
  }, [playSound, playMusic, stopMusic]);

  const playDefeatSound = useCallback(() => {
    stopMusic();
    playSound('bomb_explode', { volume: 0.8 });
  }, [playSound, stopMusic]);

  const startGameplayMusic = useCallback(() => {
    playMusic('gameplay_tension', {
      volume: 0.4,
      loop: true,
      fadeIn: 2000,
    });
  }, [playMusic]);

  const transitionToDangerMusic = useCallback(() => {
    fadeTransition('gameplay_tension', 'danger_zone', 2000);
  }, [fadeTransition]);

  const playMenuMusic = useCallback(() => {
    playMusic('menu_theme', {
      volume: 0.3,
      loop: true,
      fadeIn: 1500,
    });
  }, [playMusic]);

  return {
    playVictorySound,
    playDefeatSound,
    startGameplayMusic,
    transitionToDangerMusic,
    playMenuMusic,
  };
}

/**
 * Hook for UI interaction sounds
 */
export function useUISounds() {
  const { playSound } = useGameAudio();

  const playClickSound = useCallback(() => {
    playSound('menu_click', { volume: 0.35 });
  }, [playSound]);

  const playHoverSound = useCallback(() => {
    playSound('menu_hover', { volume: 0.2 });
  }, [playSound]);

  const playButtonPress = useCallback(() => {
    playSound('button_press', { volume: 0.4 });
  }, [playSound]);

  const playToggleSound = useCallback(() => {
    playSound('toggle_switch', { volume: 0.35 });
  }, [playSound]);

  const playDifficultyChange = useCallback(() => {
    playSound('difficulty_change', { volume: 0.45 });
  }, [playSound]);

  return {
    playClickSound,
    playHoverSound,
    playButtonPress,
    playToggleSound,
    playDifficultyChange,
  };
}

/**
 * Hook for managing audio settings
 */
export function useAudioSettings() {
  const audioManagerRef = useRef(getAudioManager());

  const settings = audioManagerRef.current.settings;

  const updateSettings = useCallback((newSettings: Partial<AudioSettings>) => {
    audioManagerRef.current.updateSettings(newSettings);
  }, []);

  const setMasterVolume = useCallback((volume: number) => {
    audioManagerRef.current.setGlobalVolume(volume);
  }, []);

  const setSoundEffectsVolume = useCallback((volume: number) => {
    audioManagerRef.current.setSoundEffectsVolume(volume);
  }, []);

  const setMusicVolume = useCallback((volume: number) => {
    audioManagerRef.current.setMusicVolume(volume);
  }, []);

  const toggleMute = useCallback(() => {
    audioManagerRef.current.toggleMute();
  }, []);

  const toggleSounds = useCallback(() => {
    updateSettings({ soundEnabled: !settings.soundEnabled });
  }, [settings.soundEnabled, updateSettings]);

  const toggleMusic = useCallback(() => {
    updateSettings({ musicEnabled: !settings.musicEnabled });
    if (settings.musicEnabled) {
      audioManagerRef.current.stopMusic();
    }
  }, [settings.musicEnabled, updateSettings]);

  return {
    settings,
    updateSettings,
    setMasterVolume,
    setSoundEffectsVolume,
    setMusicVolume,
    toggleMute,
    toggleSounds,
    toggleMusic,
  };
}

/**
 * Hook for dynamic music that adapts to game state
 */
export function useDynamicMusic(gameState: {
  status: string;
  flagCount: number;
  mineCount: number;
  revealedCount: number;
  totalCells: number;
}) {
  const { adjustMusicIntensity, fadeTransition } = useGameAudio();
  const previousDangerLevel = useRef(0);

  useEffect(() => {
    if (gameState.status !== 'playing') return;

    // Calculate danger level based on game state
    const revealPercentage = gameState.revealedCount / (gameState.totalCells - gameState.mineCount);
    const flagPercentage = gameState.flagCount / gameState.mineCount;

    // Danger increases as more is revealed with fewer flags
    const dangerLevel = Math.min(
      (revealPercentage * 0.7) + ((1 - flagPercentage) * 0.3),
      1
    );

    // Only update if danger level changed significantly
    if (Math.abs(dangerLevel - previousDangerLevel.current) > 0.1) {
      adjustMusicIntensity(dangerLevel);
      previousDangerLevel.current = dangerLevel;

      // Transition to danger music at high danger levels
      if (dangerLevel > 0.7 && previousDangerLevel.current <= 0.7) {
        fadeTransition('gameplay_tension', 'danger_zone', 2000);
      }
    }
  }, [
    gameState.status,
    gameState.revealedCount,
    gameState.flagCount,
    gameState.mineCount,
    gameState.totalCells,
    adjustMusicIntensity,
    fadeTransition,
  ]);
}

/**
 * Hook for audio preloading with loading state
 */
export function useAudioPreloader() {
  const audioManagerRef = useRef(getAudioManager());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const preloadAll = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      await audioManagerRef.current.preloadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to preload audio');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const preloadCategory = useCallback(async (category: 'ui' | 'gameplay' | 'danger' | 'success' | 'ambient') => {
    setIsLoading(true);
    setError(null);
    try {
      await audioManagerRef.current.preloadCategory(category);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to preload audio category');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    preloadAll,
    preloadCategory,
    isLoading,
    error,
  };
}

// Import useState for useAudioPreloader
import { useState } from 'react';
