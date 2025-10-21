/**
 * AudioManager - Comprehensive audio management system
 * Handles sound effects, music, 3D spatial audio, and dynamic mixing
 */

import {
  IAudioManager,
  AudioManagerState,
  AudioSettings,
  AudioEventType,
  AudioConfig,
  GameContext,
  AudioCategory,
} from "@/types/audio";
import {
  AUDIO_PATHS,
  DEFAULT_AUDIO_CONFIGS,
  DEFAULT_AUDIO_SETTINGS,
  getAudioPath,
  CRITICAL_SOUNDS,
} from "./audio-config";

/**
 * Audio pool for managing multiple instances of the same sound
 */
class AudioPool {
  private pool: HTMLAudioElement[] = [];
  private poolSize: number;

  constructor(src: string, poolSize: number = 3) {
    this.poolSize = poolSize;
    for (let i = 0; i < poolSize; i++) {
      const audio = new Audio(src);
      // Use 'metadata' for faster loading - sound will still play instantly
      audio.preload = "metadata";
      this.pool.push(audio);
    }
  }

  play(config?: Partial<AudioConfig>): HTMLAudioElement | null {
    // Find an audio element that's not playing
    const available = this.pool.find((audio) => audio.paused || audio.ended);
    if (available) {
      this.applyConfig(available, config);
      available.currentTime = 0;
      available.play().catch((err) => {
        console.warn("Audio playback failed:", err);
      });
      return available;
    }

    // All are busy, use the first one (will restart it)
    const audio = this.pool[0];
    if (audio) {
      this.applyConfig(audio, config);
      audio.currentTime = 0;
      audio.play().catch((err) => {
        console.warn("Audio playback failed:", err);
      });
      return audio;
    }

    return null;
  }

  private applyConfig(
    audio: HTMLAudioElement,
    config?: Partial<AudioConfig>
  ): void {
    if (config?.volume !== undefined) audio.volume = config.volume;
    if (config?.playbackRate !== undefined)
      audio.playbackRate = config.playbackRate;
    if (config?.loop !== undefined) audio.loop = config.loop;
  }

  stopAll(): void {
    this.pool.forEach((audio) => {
      audio.pause();
      audio.currentTime = 0;
    });
  }
}

export class AudioManager implements IAudioManager {
  public state: AudioManagerState;
  public settings: AudioSettings;

  private soundPools: Map<string, AudioPool> = new Map();
  private musicTracks: Map<string, HTMLAudioElement> = new Map();
  private currentMusicElement: HTMLAudioElement | null = null;
  private audioContext: AudioContext | null = null;
  private gainNodes: Map<string, GainNode> = new Map();
  private fadeIntervals: Map<string, number> = new Map();

  // For mobile audio unlock
  private unlocked: boolean = false;
  private unlockAttempts: number = 0;
  private maxUnlockAttempts: number = 5;
  private showUnlockPrompt: boolean = false;

  // Track last music track for resuming when toggling music back on
  private lastMusicTrack: string | null = null;
  private wasMusicPlaying: boolean = false;

  // Event listeners for unlock prompt
  private unlockPromptListeners: Array<() => void> = [];

  constructor(initialSettings?: Partial<AudioSettings>) {
    this.state = {
      initialized: false,
      loading: false,
      error: null,
      loadedTracks: new Set(),
      currentMusic: null,
      activeContext: null,
    };

    this.settings = {
      ...DEFAULT_AUDIO_SETTINGS,
      ...initialSettings,
    };
  }

  /**
   * Initialize the audio system
   */
  async initialize(): Promise<void> {
    if (this.state.initialized) return;

    try {
      this.state.loading = true;

      // Create AudioContext for advanced features
      if (
        this.settings.enable3DAudio ||
        this.settings.audioQuality === "high"
      ) {
        this.createAudioContext();
      }

      // Preload critical sounds
      await this.preloadCriticalSounds();

      // Setup mobile audio unlock
      this.setupMobileUnlock();

      this.state.initialized = true;
      this.state.loading = false;
      this.state.error = null;
    } catch (error) {
      this.state.error =
        error instanceof Error ? error.message : "Failed to initialize audio";
      this.state.loading = false;
      console.error("Audio initialization failed:", error);
    }
  }

  /**
   * Create Web Audio API context for advanced features
   */
  private createAudioContext(): void {
    try {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      this.audioContext = new AudioContextClass();
      this.state.activeContext = this.audioContext;

      // Create master gain node
      if (this.audioContext) {
        const masterGain = this.audioContext.createGain();
        masterGain.connect(this.audioContext.destination);
        masterGain.gain.value = this.settings.masterVolume / 100;
        this.gainNodes.set("master", masterGain);
      }
    } catch (error) {
      console.warn("Failed to create AudioContext:", error);
    }
  }

  /**
   * Setup mobile audio unlock (iOS/Android require user interaction)
   * Enhanced for World Coin app and other embedded environments
   */
  private setupMobileUnlock(): void {
    const unlock = async () => {
      if (this.unlocked || this.unlockAttempts >= this.maxUnlockAttempts)
        return;

      console.log(
        `🔓 Audio unlock attempt ${this.unlockAttempts + 1}/${
          this.maxUnlockAttempts
        }`
      );
      this.unlockAttempts++;

      try {
        // Resume AudioContext if suspended
        if (this.audioContext && this.audioContext.state === "suspended") {
          console.log("🔓 Resuming suspended AudioContext");
          await this.audioContext.resume();
        }

        // Create and play silent audio to unlock
        const silentAudio = new Audio();
        silentAudio.src =
          "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=";
        silentAudio.volume = 0;
        silentAudio.preload = "auto";

        // Try to play the silent audio
        await silentAudio.play();

        console.log("✅ Audio unlocked successfully!");
        this.unlocked = true;

        // Remove all event listeners
        this.removeUnlockListeners();

        // Try to start any pending music
        this.tryStartPendingMusic();
      } catch (error) {
        console.warn(
          `⚠️ Audio unlock failed (attempt ${this.unlockAttempts}):`,
          error
        );

        // If this was the last attempt, show user guidance
        if (this.unlockAttempts >= this.maxUnlockAttempts) {
          console.warn(
            "🔇 Audio unlock failed after maximum attempts. User interaction required."
          );
          this.showAudioUnlockGuidance();
        }
      }
    };

    // Add multiple event listeners for better compatibility
    this.addUnlockListeners(unlock);

    // Also try to unlock immediately if we're in a context that allows it
    setTimeout(() => {
      if (!this.unlocked) {
        unlock();
      }
    }, 100);
  }

  /**
   * Add event listeners for audio unlock
   */
  private addUnlockListeners(unlock: (event?: Event) => void): void {
    const events = [
      "click",
      "touchstart",
      "touchend",
      "mousedown",
      "keydown",
      "gesturestart",
      "gesturechange",
      "gestureend",
    ];

    events.forEach((eventType) => {
      document.addEventListener(eventType, unlock, {
        once: true,
        passive: true,
        capture: true,
      });
    });
  }

  /**
   * Remove all unlock event listeners
   */
  private removeUnlockListeners(): void {
    const events = [
      "click",
      "touchstart",
      "touchend",
      "mousedown",
      "keydown",
      "gesturestart",
      "gesturechange",
      "gestureend",
    ];

    events.forEach((eventType) => {
      document.removeEventListener(eventType, () => {}, true);
    });
  }

  /**
   * Try to start any pending music after unlock
   */
  private tryStartPendingMusic(): void {
    if (this.settings.musicEnabled && this.lastMusicTrack) {
      console.log(
        "🎵 Starting pending music after unlock:",
        this.lastMusicTrack
      );
      this.playMusic(this.lastMusicTrack, { loop: true, fadeIn: 1000 });
    }
  }

  /**
   * Show guidance to user when audio unlock fails
   */
  private showAudioUnlockGuidance(): void {
    console.warn(
      "🔇 Audio is blocked. Please tap anywhere on the screen to enable audio."
    );
    this.showUnlockPrompt = true;
    this.notifyUnlockPromptListeners();
  }

  /**
   * Add listener for unlock prompt visibility changes
   */
  addUnlockPromptListener(listener: () => void): void {
    this.unlockPromptListeners.push(listener);
  }

  /**
   * Remove listener for unlock prompt visibility changes
   */
  removeUnlockPromptListener(listener: () => void): void {
    const index = this.unlockPromptListeners.indexOf(listener);
    if (index > -1) {
      this.unlockPromptListeners.splice(index, 1);
    }
  }

  /**
   * Notify all listeners about unlock prompt state change
   */
  private notifyUnlockPromptListeners(): void {
    this.unlockPromptListeners.forEach((listener) => listener());
  }

  /**
   * Get unlock prompt visibility state
   */
  getUnlockPromptVisible(): boolean {
    return this.showUnlockPrompt;
  }

  /**
   * Dismiss unlock prompt
   */
  dismissUnlockPrompt(): void {
    this.showUnlockPrompt = false;
    this.notifyUnlockPromptListeners();
  }

  /**
   * Preload critical sounds for instant playback
   */
  private async preloadCriticalSounds(): Promise<void> {
    const promises: Promise<void>[] = [];

    // Preload critical sound effects ONLY (not music - too large)
    for (const soundEvent of CRITICAL_SOUNDS) {
      const path = getAudioPath(soundEvent);
      if (path) {
        promises.push(this.loadSound(soundEvent, path));
      }
    }

    // Don't preload music - load on demand to prevent delays
    // Music will be loaded when first needed

    await Promise.allSettled(promises);
  }

  /**
   * Load a sound into the pool
   */
  private async loadSound(
    eventType: AudioEventType,
    path: string
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      // Smaller pool for better performance
      const poolSize = 2;
      const pool = new AudioPool(path, poolSize);
      this.soundPools.set(eventType, pool);
      this.state.loadedTracks.add(eventType);

      // Wait for first audio in pool to be ready
      const testAudio = new Audio(path);
      // Use 'metadata' instead of 'auto' for faster initial load
      testAudio.preload = "metadata";
      testAudio.addEventListener(
        "canplaythrough",
        () => {
          resolve();
        },
        { once: true }
      );
      testAudio.addEventListener(
        "error",
        (e) => {
          // Silently fail if file doesn't exist - expected during development
          // console.warn(`Failed to load sound: ${eventType}`, e);
          reject(e);
        },
        { once: true }
      );
      testAudio.load();
    });
  }

  /**
   * Load a music track
   */
  private async loadMusic(
    eventType: AudioEventType,
    path: string
  ): Promise<void> {
    return new Promise((resolve) => {
      const audio = new Audio(path);
      // Use 'none' preload to prevent automatic downloading
      // Music will only load when play() is called
      audio.preload = "none";

      // Create the element but don't load it yet
      this.musicTracks.set(eventType, audio);
      this.state.loadedTracks.add(eventType);

      // Resolve immediately - actual loading happens on play
      resolve();

      audio.addEventListener(
        "error",
        () => {
          // Silently fail if file doesn't exist - expected during development
          // console.warn(`Failed to load music: ${eventType}`);
        },
        { once: true }
      );
    });
  }

  /**
   * Preload all audio tracks
   */
  async preloadAll(): Promise<void> {
    const promises: Promise<void>[] = [];

    // Load all sound effects
    for (const category of Object.keys(AUDIO_PATHS) as Array<
      keyof typeof AUDIO_PATHS
    >) {
      const paths = AUDIO_PATHS[category];
      for (const [key, path] of Object.entries(paths)) {
        if (category === "ambient") {
          promises.push(this.loadMusic(key as AudioEventType, path));
        } else {
          promises.push(this.loadSound(key as AudioEventType, path));
        }
      }
    }

    await Promise.allSettled(promises);
  }

  /**
   * Preload sounds by category
   */
  async preloadCategory(category: AudioCategory): Promise<void> {
    const paths = AUDIO_PATHS[category];
    if (!paths) return;

    const promises = Object.entries(paths).map(([key, path]) => {
      if (category === "ambient") {
        return this.loadMusic(key as AudioEventType, path);
      } else {
        return this.loadSound(key as AudioEventType, path);
      }
    });

    await Promise.allSettled(promises);
  }

  /**
   * Play a sound effect
   */
  playSound(event: AudioEventType, config?: Partial<AudioConfig>): void {
    if (!this.settings.soundEnabled) return;

    // If audio is not unlocked, try to unlock it
    if (!this.unlocked) {
      console.log("🔓 Audio not unlocked, attempting unlock for sound:", event);
      this.setupMobileUnlock();
      return;
    }

    const pool = this.soundPools.get(event);

    // If not loaded, try to play immediately with Audio element
    if (!pool) {
      const path = getAudioPath(event);
      if (path) {
        // Play immediately without waiting for pool
        const quickAudio = new Audio(path);
        const defaultConfig = DEFAULT_AUDIO_CONFIGS[event]?.defaultConfig;
        const finalVolume =
          (config?.volume ?? defaultConfig?.volume ?? 1) *
          (this.settings.soundEffectsVolume / 100) *
          (this.settings.masterVolume / 100);

        quickAudio.volume = finalVolume;
        quickAudio
          .play()
          .then(() => {
            console.log("✅ Sound played successfully:", event);
          })
          .catch((error) => {
            console.warn("⚠️ Sound playback failed:", event, error);
            // Try to unlock audio if it fails
            if (!this.unlocked) {
              this.setupMobileUnlock();
            }
          });

        // Load into pool for next time (background)
        this.loadSound(event, path).catch(() => {
          // Silently fail
        });
        return;
      }
    }

    if (pool) {
      const defaultConfig = DEFAULT_AUDIO_CONFIGS[event]?.defaultConfig;
      const finalVolume =
        (config?.volume ?? defaultConfig?.volume ?? 1) *
        (this.settings.soundEffectsVolume / 100) *
        (this.settings.masterVolume / 100);

      pool.play({
        ...defaultConfig,
        ...config,
        volume: finalVolume,
      });
    }
  }

  /**
   * Play music track with crossfade
   */
  playMusic(trackName: string, config?: Partial<AudioConfig>): void {
    // Store the last requested music track even if music is disabled
    this.lastMusicTrack = trackName;

    console.log(
      "🎵 playMusic called:",
      trackName,
      "musicEnabled:",
      this.settings.musicEnabled,
      "unlocked:",
      this.unlocked
    );

    if (!this.settings.musicEnabled) {
      console.log("🎵 Music is disabled, storing intent to play");
      this.wasMusicPlaying = true;
      return;
    }

    // If audio is not unlocked, try to unlock it and store the intent
    if (!this.unlocked) {
      console.log("🔓 Audio not unlocked, storing music intent:", trackName);
      this.wasMusicPlaying = true;
      this.setupMobileUnlock();
      return;
    }

    const eventType = trackName as AudioEventType;
    const track = this.musicTracks.get(eventType);

    // Lazy load if not loaded
    if (!track) {
      const path = getAudioPath(eventType);
      if (path) {
        this.loadMusic(eventType, path)
          .then(() => {
            this.playMusic(trackName, config);
          })
          .catch(() => {
            // Silently fail if file doesn't exist - expected during development
            // console.warn(`Failed to load music on demand: ${trackName}`);
          });
        return;
      }
    }

    if (!track) return;

    // Stop current music if different
    if (this.currentMusicElement && this.currentMusicElement !== track) {
      const fadeOut = config?.fadeOut ?? 1000;
      this.fadeMusicOut(this.currentMusicElement, fadeOut);
    }

    // Configure and play new track
    const defaultConfig = DEFAULT_AUDIO_CONFIGS[eventType]?.defaultConfig;
    const finalVolume =
      (config?.volume ?? defaultConfig?.volume ?? 0.5) *
      (this.settings.musicVolume / 100) *
      (this.settings.masterVolume / 100);

    track.volume = config?.fadeIn ? 0 : finalVolume;
    track.loop = config?.loop ?? defaultConfig?.loop ?? false;
    track.playbackRate = config?.playbackRate ?? 1;

    // Start loading and play as soon as enough data is available
    // Browser will stream the rest while playing
    const playWhenReady = () => {
      console.log("🎵 Attempting to play track:", trackName);
      track
        .play()
        .then(() => {
          console.log("✅ Music playing successfully:", trackName);
        })
        .catch((err) => {
          // Expected if user hasn't interacted yet - will play after interaction
          console.warn("⚠️ Music playback blocked:", err.message);
        });

      // Fade in if specified
      if (config?.fadeIn) {
        this.fadeMusicIn(track, finalVolume, config.fadeIn);
      }
    };

    // If track has enough data, play immediately
    if (track.readyState >= 2) {
      // HAVE_CURRENT_DATA or better
      console.log("🎵 Track ready, playing immediately");
      playWhenReady();
    } else {
      // Wait for enough data to start playing
      console.log("🎵 Track not ready, loading first...");
      track.addEventListener("canplay", playWhenReady, { once: true });
      track.load(); // Start loading
    }

    this.currentMusicElement = track;
    this.state.currentMusic = trackName;
    this.wasMusicPlaying = true;
    console.log("🎵 Music state updated:", {
      currentMusicElement: !!this.currentMusicElement,
      currentMusic: this.state.currentMusic,
      wasMusicPlaying: this.wasMusicPlaying,
    });
  }

  /**
   * Fade music in
   */
  private fadeMusicIn(
    audio: HTMLAudioElement,
    targetVolume: number,
    duration: number
  ): void {
    const steps = 50;
    const stepDuration = duration / steps;
    const volumeStep = targetVolume / steps;
    let currentStep = 0;

    const fadeInterval = setInterval(() => {
      currentStep++;
      audio.volume = Math.min(volumeStep * currentStep, targetVolume);

      if (currentStep >= steps) {
        clearInterval(fadeInterval);
      }
    }, stepDuration);
  }

  /**
   * Fade music out
   */
  private fadeMusicOut(audio: HTMLAudioElement, duration: number): void {
    const initialVolume = audio.volume;
    const steps = 50;
    const stepDuration = duration / steps;
    const volumeStep = initialVolume / steps;
    let currentStep = 0;

    const fadeInterval = setInterval(() => {
      currentStep++;
      audio.volume = Math.max(initialVolume - volumeStep * currentStep, 0);

      if (currentStep >= steps || audio.volume === 0) {
        clearInterval(fadeInterval);
        audio.pause();
        audio.currentTime = 0;
      }
    }, stepDuration);
  }

  /**
   * Stop a specific sound
   */
  stopSound(event: AudioEventType): void {
    const pool = this.soundPools.get(event);
    if (pool) {
      pool.stopAll();
    }
  }

  /**
   * Stop current music
   */
  stopMusic(): void {
    if (this.currentMusicElement) {
      this.currentMusicElement.pause();
      this.currentMusicElement.currentTime = 0;
      this.currentMusicElement = null;
      // Keep state.currentMusic for potential resume
      // this.state.currentMusic = null;
    }
  }

  /**
   * Stop all audio
   */
  stopAll(): void {
    // Stop all sounds
    this.soundPools.forEach((pool) => pool.stopAll());

    // Stop music
    this.stopMusic();
  }

  /**
   * Play adaptive sound based on game context
   */
  playAdaptiveSound(event: AudioEventType, context: GameContext): void {
    const config: Partial<AudioConfig> = {};

    // Adjust based on context
    if (event === "cell_reveal") {
      if (context.nearBombs > 5) {
        // High danger - play tense sound
        config.playbackRate = 1.2;
        config.volume = 0.6;
        this.playSound("bomb_warning", { volume: 0.3 });
      } else if (context.nearBombs === 0) {
        // Safe - play calm sound
        this.playSound("safe_reveal", config);
        return;
      }
    }

    if (event === "combo_streak") {
      // Rising pitch for combo
      const pitch = 1 + context.streakCount * 0.05;
      config.playbackRate = Math.min(pitch, 2);
    }

    this.playSound(event, config);
  }

  /**
   * Create 3D spatial sound (requires AudioContext)
   */
  create3DSound(event: AudioEventType, x?: number, y?: number): void {
    // Parameters x and y reserved for future 3D audio implementation
    void x;
    void y;

    if (!this.audioContext || !this.settings.enable3DAudio) {
      // Fallback to regular sound
      this.playSound(event);
      return;
    }

    // Implementation would require Web Audio API setup
    // For now, use regular playback
    this.playSound(event);
  }

  /**
   * Adjust music intensity dynamically
   */
  adjustMusicIntensity(dangerLevel: number): void {
    if (!this.currentMusicElement) return;

    // Adjust volume based on danger level
    const baseVolume =
      (this.settings.musicVolume / 100) * (this.settings.masterVolume / 100);
    const targetVolume = baseVolume * (0.6 + dangerLevel * 0.4);

    this.currentMusicElement.volume = targetVolume;

    // Switch to danger music if danger level is very high
    if (dangerLevel > 0.7 && this.state.currentMusic !== "danger_zone") {
      this.fadeTransition(
        this.state.currentMusic || "gameplay_tension",
        "danger_zone",
        2000
      );
    }
  }

  /**
   * Smooth transition between music tracks
   */
  async fadeTransition(
    from: string,
    to: string,
    duration: number
  ): Promise<void> {
    return new Promise((resolve) => {
      // Fade out current
      if (this.currentMusicElement) {
        this.fadeMusicOut(this.currentMusicElement, duration / 2);
      }

      // Wait for fade out, then fade in new track
      setTimeout(() => {
        this.playMusic(to, {
          fadeIn: duration / 2,
          loop: true,
        });
        resolve();
      }, duration / 2);
    });
  }

  /**
   * Set global volume
   */
  setGlobalVolume(volume: number): void {
    this.settings.masterVolume = Math.max(0, Math.min(100, volume));

    // Update master gain node if using Web Audio API
    const masterGain = this.gainNodes.get("master");
    if (masterGain) {
      masterGain.gain.value = this.settings.masterVolume / 100;
    }

    // Update current music volume
    if (this.currentMusicElement) {
      const baseVolume = this.settings.musicVolume / 100;
      this.currentMusicElement.volume =
        baseVolume * (this.settings.masterVolume / 100);
    }
  }

  /**
   * Set sound effects volume
   */
  setSoundEffectsVolume(volume: number): void {
    this.settings.soundEffectsVolume = Math.max(0, Math.min(100, volume));
  }

  /**
   * Set music volume
   */
  setMusicVolume(volume: number): void {
    this.settings.musicVolume = Math.max(0, Math.min(100, volume));

    // Update current music
    if (this.currentMusicElement) {
      const finalVolume =
        (this.settings.musicVolume / 100) * (this.settings.masterVolume / 100);
      this.currentMusicElement.volume = finalVolume;
    }
  }

  /**
   * Toggle mute
   */
  toggleMute(): void {
    const wasMuted = !this.settings.soundEnabled && !this.settings.musicEnabled;

    if (wasMuted) {
      this.settings.soundEnabled = true;
      this.settings.musicEnabled = true;
    } else {
      this.settings.soundEnabled = false;
      this.settings.musicEnabled = false;
      this.stopAll();
    }
  }

  /**
   * Update settings
   */
  updateSettings(settings: Partial<AudioSettings>): void {
    const previousMusicEnabled = this.settings.musicEnabled;

    this.settings = { ...this.settings, ...settings };

    // Apply volume changes
    if (settings.masterVolume !== undefined) {
      this.setGlobalVolume(settings.masterVolume);
    }
    if (settings.musicVolume !== undefined) {
      this.setMusicVolume(settings.musicVolume);
    }
    if (settings.soundEffectsVolume !== undefined) {
      this.setSoundEffectsVolume(settings.soundEffectsVolume);
    }

    // Handle music toggling
    if (settings.musicEnabled !== undefined) {
      if (!settings.musicEnabled && previousMusicEnabled) {
        // Music was disabled - stop it
        console.log("🎵 Music disabled - stopping music");
        this.stopMusic();
      } else if (settings.musicEnabled && !previousMusicEnabled) {
        // Music was enabled - resume or start default music
        console.log("🎵 Music enabled - checking what to play...", {
          wasMusicPlaying: this.wasMusicPlaying,
          currentMusic: this.state.currentMusic,
          lastMusicTrack: this.lastMusicTrack,
        });

        if (this.wasMusicPlaying && this.state.currentMusic) {
          // Resume the music that was playing
          console.log("🎵 Resuming previous music:", this.state.currentMusic);
          this.playMusic(this.state.currentMusic, { loop: true, fadeIn: 500 });
        } else if (this.lastMusicTrack) {
          // Resume the last requested track
          console.log("🎵 Playing last requested track:", this.lastMusicTrack);
          this.playMusic(this.lastMusicTrack, { loop: true, fadeIn: 500 });
        } else {
          // No music was playing - start default menu theme
          console.log("🎵 Starting default menu theme");
          this.playMusic("menu_theme", { loop: true, fadeIn: 1000 });
        }
      }
    }

    // Handle mute
    if (settings.soundEnabled === false && settings.musicEnabled === false) {
      this.stopAll();
    }
  }

  /**
   * Check if a track is currently playing
   */
  isPlaying(trackName: string): boolean {
    const eventType = trackName as AudioEventType;
    const track = this.musicTracks.get(eventType);
    return track ? !track.paused : false;
  }

  /**
   * Get current volume of a track
   */
  getVolume(trackName: string): number {
    const eventType = trackName as AudioEventType;
    const track = this.musicTracks.get(eventType);
    return track ? track.volume : 0;
  }

  /**
   * Cleanup and dispose resources
   */
  cleanup(): void {
    this.stopAll();

    // Clear all pools
    this.soundPools.forEach((pool) => pool.stopAll());
    this.soundPools.clear();

    // Clear music tracks
    this.musicTracks.clear();

    // Close audio context
    if (this.audioContext && this.audioContext.state !== "closed") {
      this.audioContext.close();
    }

    this.state.initialized = false;
    this.state.loadedTracks.clear();
  }
}

// Singleton instance
let audioManagerInstance: AudioManager | null = null;

export function getAudioManager(): AudioManager {
  if (!audioManagerInstance) {
    audioManagerInstance = new AudioManager();
  }
  return audioManagerInstance;
}
