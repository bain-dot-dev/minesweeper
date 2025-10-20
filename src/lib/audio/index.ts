/**
 * Audio System - Main exports
 * Central export point for all audio-related functionality
 */

// Core AudioManager
export { AudioManager, getAudioManager } from './AudioManager';

// Audio Configuration
export {
  AUDIO_PATHS,
  DEFAULT_AUDIO_CONFIGS,
  DEFAULT_AUDIO_SETTINGS,
  AUDIO_QUALITY_SETTINGS,
  CRITICAL_SOUNDS,
  PRELOAD_MUSIC,
  getAudioPath,
} from './audio-config';

// Re-export types for convenience
export type {
  AudioConfig,
  AudioSettings,
  AudioEventType,
  AudioCategory,
  GameContext,
  IAudioManager,
  AudioManagerState,
  AudioLibrary,
  ProceduralAudioConfig,
} from '@/types/audio';
