/**
 * Audio configuration and track definitions
 * Maps audio events to file paths and default configurations
 */

import { AudioLibrary, AudioTrack, AudioEventType } from "@/types/audio";

/**
 * Audio file paths organized by category
 * NOTE: These are placeholder paths. Replace with actual audio files.
 */
export const AUDIO_PATHS: AudioLibrary = {
  ui: {
    menu_click: "/audio/sfx/ui/click_tactical.mp3",
    menu_hover: "/audio/sfx/ui/hover_soft.mp3",
    button_press: "/audio/sfx/ui/click_tactical.mp3", // Use click_tactical as fallback
    toggle_switch: "/audio/sfx/ui/switch_toggle.mp3",
    difficulty_change: "/audio/sfx/ui/click_tactical.mp3", // Use click_tactical as fallback
  },
  gameplay: {
    cell_reveal: "/audio/sfx/gameplay/reveal_digital.mp3",
    cell_flag: "/audio/sfx/gameplay/flag_place.mp3",
    cell_unflag: "/audio/sfx/gameplay/flag_place.mp3", // Use flag_place as fallback
    cascade_reveal: "/audio/sfx/gameplay/cascade_whoosh.mp3",
    safe_reveal: "/audio/sfx/gameplay/reveal_digital.mp3", // Use reveal_digital as fallback
    number_1: "/audio/sfx/gameplay/numbers/beep_1.mp3",
    number_2: "/audio/sfx/gameplay/numbers/beep_2.mp3",
    number_3: "/audio/sfx/gameplay/numbers/beep_2.mp3", // Use beep_2 as fallback
    number_4: "/audio/sfx/gameplay/numbers/beep_2.mp3", // Use beep_2 as fallback
    number_5: "/audio/sfx/gameplay/numbers/beep_2.mp3", // Use beep_2 as fallback
    number_6: "/audio/sfx/gameplay/numbers/beep_2.mp3", // Use beep_2 as fallback
    number_7: "/audio/sfx/gameplay/numbers/beep_2.mp3", // Use beep_2 as fallback
    number_8: "/audio/sfx/gameplay/numbers/beep_2.mp3", // Use beep_2 as fallback
  },
  danger: {
    bomb_explode: "/audio/sfx/danger/explosion_big.mp3",
    bomb_warning: "/audio/sfx/danger/alarm_warning.mp3", // Use alarm_warning as fallback
    countdown: "/audio/sfx/danger/countdown_tick.mp3",
    critical_alarm: "/audio/sfx/danger/alarm_warning.mp3",
    heartbeat: "/audio/sfx/danger/heartbeat_fast.mp3",
  },
  success: {
    victory: "/audio/sfx/success/victory_fanfare.mp3",
    achievement: "/audio/sfx/success/achievement_chime.mp3",
    combo_streak: "/audio/sfx/success/achievement_chime.mp3", // Use achievement as fallback
    mission_complete: "/audio/sfx/success/victory_fanfare.mp3", // Use victory as fallback
  },
  ambient: {
    menu_theme: "/audio/music/menu_theme.mp3",
    gameplay_tension: "/audio/music/gameplay_ambient.mp3",
    danger_zone: "/audio/music/danger_tension.mp3",
    victory_theme: "/audio/music/victory_theme.mp3",
  },
};

/**
 * Default audio configurations for different event types
 */
export const DEFAULT_AUDIO_CONFIGS: Record<
  AudioEventType,
  Partial<AudioTrack>
> = {
  // UI Sounds
  menu_click: {
    category: "ui",
    defaultConfig: { volume: 0.3, preload: true, loop: false },
  },
  menu_hover: {
    category: "ui",
    defaultConfig: { volume: 0.2, preload: true, loop: false },
  },
  button_press: {
    category: "ui",
    defaultConfig: { volume: 0.4, preload: true, loop: false },
  },
  toggle_switch: {
    category: "ui",
    defaultConfig: { volume: 0.35, preload: true, loop: false },
  },
  difficulty_change: {
    category: "ui",
    defaultConfig: { volume: 0.4, preload: true, loop: false },
  },

  // Gameplay Sounds
  cell_reveal: {
    category: "gameplay",
    defaultConfig: { volume: 0.4, preload: true, loop: false },
  },
  cell_flag: {
    category: "gameplay",
    defaultConfig: { volume: 0.45, preload: true, loop: false },
  },
  cell_unflag: {
    category: "gameplay",
    defaultConfig: { volume: 0.4, preload: true, loop: false },
  },
  cascade_reveal: {
    category: "gameplay",
    defaultConfig: { volume: 0.5, preload: true, loop: false },
  },
  number_reveal: {
    category: "gameplay",
    defaultConfig: { volume: 0.4, preload: true, loop: false },
  },
  number_1: {
    category: "gameplay",
    defaultConfig: { volume: 0.4, preload: true, loop: false },
  },
  number_2: {
    category: "gameplay",
    defaultConfig: { volume: 0.45, preload: true, loop: false },
  },
  safe_reveal: {
    category: "gameplay",
    defaultConfig: { volume: 0.35, preload: true, loop: false },
  },

  // Danger Sounds
  bomb_explode: {
    category: "danger",
    defaultConfig: { volume: 0.7, preload: true, loop: false },
  },
  bomb_warning: {
    category: "danger",
    defaultConfig: { volume: 0.5, preload: true, loop: false },
  },
  countdown: {
    category: "danger",
    defaultConfig: { volume: 0.45, preload: false, loop: false },
  },
  critical_alarm: {
    category: "danger",
    defaultConfig: { volume: 0.6, preload: false, loop: true },
  },
  heartbeat: {
    category: "danger",
    defaultConfig: { volume: 0.4, preload: false, loop: true },
  },

  // Success Sounds
  victory: {
    category: "success",
    defaultConfig: { volume: 0.6, preload: true, loop: false },
  },
  achievement: {
    category: "success",
    defaultConfig: { volume: 0.5, preload: true, loop: false },
  },
  combo_streak: {
    category: "success",
    defaultConfig: { volume: 0.5, preload: false, loop: false },
  },
  mission_complete: {
    category: "success",
    defaultConfig: { volume: 0.7, preload: true, loop: false },
  },

  // Ambient/Music
  menu_theme: {
    category: "ambient",
    defaultConfig: { volume: 0.3, preload: true, loop: true, fadeIn: 2000 },
  },
  gameplay_tension: {
    category: "ambient",
    defaultConfig: { volume: 0.35, preload: true, loop: true, fadeIn: 1500 },
  },
  danger_zone: {
    category: "ambient",
    defaultConfig: { volume: 0.4, preload: false, loop: true, fadeIn: 1000 },
  },
  victory_theme: {
    category: "ambient",
    defaultConfig: { volume: 0.5, preload: true, loop: false },
  },
};

/**
 * Audio quality presets
 */
export const AUDIO_QUALITY_SETTINGS = {
  low: {
    sampleRate: 22050,
    enableReverb: false,
    enable3D: false,
    maxSimultaneousSounds: 5,
  },
  medium: {
    sampleRate: 44100,
    enableReverb: true,
    enable3D: false,
    maxSimultaneousSounds: 10,
  },
  high: {
    sampleRate: 48000,
    enableReverb: true,
    enable3D: true,
    maxSimultaneousSounds: 20,
  },
} as const;

/**
 * Critical sounds that should always be preloaded
 * Only preload sounds that actually exist
 */
export const CRITICAL_SOUNDS: AudioEventType[] = [
  // UI - Most used (only existing files)
  "menu_click",
  "toggle_switch",

  // Gameplay - Essential
  "cell_reveal",
  "cell_flag",
  "cascade_reveal",

  // Numbers - Only preload the ones that exist (1 and 2)
  "number_1",
  "number_2",
  // 3-8 will use number_2 with pitch variation

  // Danger
  "bomb_explode",

  // Success
  "victory",
];

/**
 * Music tracks that should be preloaded
 * NOTE: Large music files should NOT be preloaded to prevent delays
 * They will load on-demand when play() is called
 */
export const PRELOAD_MUSIC: AudioEventType[] = [
  // Intentionally empty - music loads on demand to prevent initial delays
];

/**
 * Get audio path for an event type
 */
export function getAudioPath(eventType: AudioEventType): string {
  // Check each category
  for (const category of Object.keys(AUDIO_PATHS) as Array<
    keyof AudioLibrary
  >) {
    const categoryPaths = AUDIO_PATHS[category];
    if (eventType in categoryPaths) {
      return categoryPaths[eventType];
    }
  }

  // Check for numbered sounds (e.g., number_1, number_2, etc.)
  if (eventType.startsWith("number_")) {
    const match = eventType.match(/number_(\d)/);
    if (match && match[1]) {
      const num = match[1];
      const key = `number_${num}`;
      if (key in AUDIO_PATHS.gameplay) {
        return AUDIO_PATHS.gameplay[key];
      }
    }
  }

  // Silently return empty for missing files
  // console.warn(`Audio path not found for event: ${eventType}`);
  return "";
}

/**
 * Default audio settings
 */
export const DEFAULT_AUDIO_SETTINGS = {
  masterVolume: 70,
  soundEffectsVolume: 80,
  musicVolume: 50, // Reduced for better balance
  enableHaptics: false,
  enable3DAudio: false,
  audioQuality: "medium" as const,
  visualCuesOnly: false,
  reducedAudioEffects: false,
  soundEnabled: true,
  musicEnabled: true,
};
