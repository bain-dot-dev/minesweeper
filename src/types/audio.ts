/**
 * Audio system types for Mission Impossible Minesweeper
 * Defines interfaces for audio configuration, management, and settings
 */

export type AudioCategory =
  | "ui"
  | "gameplay"
  | "danger"
  | "success"
  | "ambient";

export interface AudioConfig {
  preload: boolean;
  volume: number;
  loop: boolean;
  fadeIn?: number;
  fadeOut?: number;
  playbackRate?: number;
}

export interface AudioTrack {
  name: string;
  path: string;
  category: AudioCategory;
  defaultConfig: Partial<AudioConfig>;
}

export interface AudioSettings {
  masterVolume: number; // 0-100
  soundEffectsVolume: number; // 0-100
  musicVolume: number; // 0-100
  enableHaptics: boolean; // Mobile only
  enable3DAudio: boolean; // Spatial sound
  audioQuality: "low" | "medium" | "high";
  // Accessibility
  visualCuesOnly: boolean; // For hearing impaired
  reducedAudioEffects: boolean; // For sensory sensitivity
  soundEnabled: boolean;
  musicEnabled: boolean;
}

export interface GameContext {
  nearBombs: number;
  streakCount: number;
  revealedCells: number;
  totalCells: number;
  dangerLevel: number; // 0-1, calculated based on game state
}

export interface AudioEventData {
  type: AudioEventType;
  context?: Partial<GameContext>;
  position?: { x: number; y: number };
  metadata?: Record<string, unknown>;
}

export type AudioEventType =
  // UI Events
  | "menu_click"
  | "menu_hover"
  | "button_press"
  | "toggle_switch"
  | "difficulty_change"
  // Gameplay Events
  | "cell_reveal"
  | "cell_flag"
  | "cell_unflag"
  | "cascade_reveal"
  | "number_reveal"
  | "number_1"
  | "number_2"
  | "safe_reveal"
  // Danger Events
  | "bomb_explode"
  | "bomb_warning"
  | "countdown"
  | "critical_alarm"
  | "heartbeat"
  // Success Events
  | "victory"
  | "achievement"
  | "combo_streak"
  | "mission_complete"
  // Ambient/Music
  | "menu_theme"
  | "gameplay_tension"
  | "danger_zone"
  | "victory_theme";

export interface AudioManagerState {
  initialized: boolean;
  loading: boolean;
  error: string | null;
  loadedTracks: Set<string>;
  currentMusic: string | null;
  activeContext: AudioContext | null;
}

export interface IAudioManager {
  // State
  state: AudioManagerState;
  settings: AudioSettings;

  // Core methods
  initialize(): Promise<void>;
  preloadAll(): Promise<void>;
  preloadCategory(category: AudioCategory): Promise<void>;

  // Playback
  playSound(event: AudioEventType, config?: Partial<AudioConfig>): void;
  playMusic(trackName: string, config?: Partial<AudioConfig>): void;
  stopSound(event: AudioEventType): void;
  stopMusic(): void;
  stopAll(): void;

  // Advanced features
  playAdaptiveSound(event: AudioEventType, context: GameContext): void;
  create3DSound(event: AudioEventType, x: number, y: number): void;
  adjustMusicIntensity(dangerLevel: number): void;
  fadeTransition(from: string, to: string, duration: number): Promise<void>;

  // Settings
  setGlobalVolume(volume: number): void;
  setSoundEffectsVolume(volume: number): void;
  setMusicVolume(volume: number): void;
  toggleMute(): void;
  updateSettings(settings: Partial<AudioSettings>): void;

  // Utility
  isPlaying(trackName: string): boolean;
  getVolume(trackName: string): number;
  cleanup(): void;
}

export interface ProceduralAudioConfig {
  frequency: number;
  duration: number;
  volume: number;
  waveType: OscillatorType;
  envelope?: {
    attack: number;
    decay: number;
    sustain: number;
    release: number;
  };
}

// Audio library structure for easy reference
export interface AudioLibrary {
  ui: Record<string, string>;
  gameplay: Record<string, string>;
  danger: Record<string, string>;
  success: Record<string, string>;
  ambient: Record<string, string>;
}
