/**
 * Audio Settings Component
 * Provides UI for managing audio preferences
 */

'use client';

import { useAudioSettings, useUISounds } from '@/hooks/useAudio';
import { cn } from '@/lib/utils';
import { SoundOff, SoundHigh, Settings, MediaVideo } from 'iconoir-react';
import { useState } from 'react';

interface SliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  icon?: React.ReactNode;
  min?: number;
  max?: number;
  step?: number;
}

function VolumeSlider({ label, value, onChange, icon, min = 0, max = 100, step = 1 }: SliderProps) {
  const { playClickSound } = useUISounds();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value, 10);
    onChange(newValue);
    playClickSound();
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <label className="text-sm font-medium text-mi-electric-blue">
            {label}
          </label>
        </div>
        <span className="text-xs text-mi-cyber-green font-mono">
          {value}%
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={handleChange}
        className="w-full h-2 bg-mi-black/50 rounded-lg appearance-none cursor-pointer slider-thumb:appearance-none slider-thumb:w-4 slider-thumb:h-4 slider-thumb:rounded-full slider-thumb:bg-mi-cyber-green slider-thumb:cursor-pointer hover:slider-thumb:bg-mi-electric-blue transition-colors"
        style={{
          background: `linear-gradient(to right, rgb(0, 255, 159) 0%, rgb(0, 255, 159) ${value}%, rgba(0, 0, 0, 0.5) ${value}%, rgba(0, 0, 0, 0.5) 100%)`,
        }}
      />
    </div>
  );
}

interface ToggleProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

function ToggleSetting({ label, description, checked, onChange }: ToggleProps) {
  const { playToggleSound } = useUISounds();

  const handleToggle = () => {
    onChange(!checked);
    playToggleSound();
  };

  return (
    <div className="flex items-center justify-between py-3 border-b border-mi-red/20">
      <div className="flex-1">
        <p className="text-sm font-medium text-mi-electric-blue">{label}</p>
        {description && (
          <p className="text-xs text-mi-yellow/70 mt-1">{description}</p>
        )}
      </div>
      <button
        onClick={handleToggle}
        className={cn(
          'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
          checked ? 'bg-mi-cyber-green' : 'bg-mi-black/50 border border-mi-red/30'
        )}
        role="switch"
        aria-checked={checked}
      >
        <span
          className={cn(
            'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
            checked ? 'translate-x-6' : 'translate-x-1'
          )}
        />
      </button>
    </div>
  );
}

interface SelectProps {
  label: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
}

function SelectSetting({ label, value, options, onChange }: SelectProps) {
  const { playClickSound } = useUISounds();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value);
    playClickSound();
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-mi-electric-blue">
        {label}
      </label>
      <select
        value={value}
        onChange={handleChange}
        className="w-full px-3 py-2 bg-mi-black/50 border border-mi-red/30 rounded-lg text-white text-sm focus:outline-none focus:border-mi-cyber-green transition-colors"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function AudioSettings() {
  const {
    settings,
    setMasterVolume,
    setSoundEffectsVolume,
    setMusicVolume,
    toggleSounds,
    toggleMusic,
    updateSettings,
  } = useAudioSettings();

  const [isOpen, setIsOpen] = useState(false);
  const { playClickSound } = useUISounds();

  const togglePanel = () => {
    setIsOpen(!isOpen);
    playClickSound();
  };

  return (
    <div className="relative">
      {/* Toggle Button */}
      <button
        onClick={togglePanel}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-mi-red/20 to-mi-black/80 border border-mi-red/30 rounded-lg hover:border-mi-cyber-green transition-all"
        aria-label="Audio Settings"
      >
        <Settings className="w-5 h-5 text-mi-cyber-green" />
        <span className="text-sm text-white font-medium">Audio</span>
      </button>

      {/* Settings Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={togglePanel}
          />

          {/* Panel */}
          <div className="fixed right-4 top-20 w-96 max-w-[calc(100vw-2rem)] bg-gradient-to-br from-mi-black/95 to-mi-black/90 border-2 border-mi-red/40 rounded-lg shadow-2xl z-50 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-mi-red/30 to-mi-cyber-green/30 p-4 border-b border-mi-red/30">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-mi-cyber-green uppercase tracking-wide">
                  Audio Settings
                </h3>
                <button
                  onClick={togglePanel}
                  className="text-mi-red hover:text-white transition-colors"
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>
              <p className="text-xs text-mi-yellow/70 mt-1">
                Configure audio preferences
              </p>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Volume Controls */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-mi-yellow uppercase tracking-wide">
                  Volume Controls
                </h4>

                <VolumeSlider
                  label="Master Volume"
                  value={settings.masterVolume}
                  onChange={setMasterVolume}
                  icon={<SoundHigh className="w-4 h-4 text-mi-cyber-green" />}
                />

                <VolumeSlider
                  label="Sound Effects"
                  value={settings.soundEffectsVolume}
                  onChange={setSoundEffectsVolume}
                  icon={<SoundOff className="w-4 h-4 text-mi-electric-blue" />}
                />

                <VolumeSlider
                  label="Music"
                  value={settings.musicVolume}
                  onChange={setMusicVolume}
                  icon={<MediaVideo className="w-4 h-4 text-mi-orange" />}
                />
              </div>

              {/* Toggle Settings */}
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-mi-yellow uppercase tracking-wide mb-3">
                  Audio Options
                </h4>

                <ToggleSetting
                  label="Enable Sound Effects"
                  description="Gameplay and UI sounds"
                  checked={settings.soundEnabled}
                  onChange={toggleSounds}
                />

                <ToggleSetting
                  label="Enable Music"
                  description="Background music and themes"
                  checked={settings.musicEnabled}
                  onChange={toggleMusic}
                />

                <ToggleSetting
                  label="3D Spatial Audio"
                  description="Positional sound effects (experimental)"
                  checked={settings.enable3DAudio}
                  onChange={(checked) => updateSettings({ enable3DAudio: checked })}
                />
              </div>

              {/* Quality Settings */}
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-mi-yellow uppercase tracking-wide mb-3">
                  Quality & Performance
                </h4>

                <SelectSetting
                  label="Audio Quality"
                  value={settings.audioQuality}
                  options={[
                    { value: 'low', label: 'Low (Better Performance)' },
                    { value: 'medium', label: 'Medium (Balanced)' },
                    { value: 'high', label: 'High (Best Quality)' },
                  ]}
                  onChange={(quality) =>
                    updateSettings({ audioQuality: quality as 'low' | 'medium' | 'high' })
                  }
                />
              </div>

              {/* Accessibility */}
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-mi-yellow uppercase tracking-wide mb-3">
                  Accessibility
                </h4>

                <ToggleSetting
                  label="Visual Cues Only"
                  description="Disable audio for hearing impaired"
                  checked={settings.visualCuesOnly}
                  onChange={(checked) => {
                    updateSettings({
                      visualCuesOnly: checked,
                      soundEnabled: !checked,
                      musicEnabled: !checked,
                    });
                  }}
                />

                <ToggleSetting
                  label="Reduced Audio Effects"
                  description="Minimize audio for sensory sensitivity"
                  checked={settings.reducedAudioEffects}
                  onChange={(checked) => updateSettings({ reducedAudioEffects: checked })}
                />
              </div>

              {/* Info */}
              <div className="bg-mi-black/50 border border-mi-cyan/30 rounded-lg p-4 mt-4">
                <p className="text-xs text-mi-cyan italic">
                  <span className="font-bold">Tip:</span> Settings are automatically saved
                  to your browser's local storage.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/**
 * Compact audio controls for the game header
 */
export function CompactAudioControls() {
  const { settings, toggleMute } = useAudioSettings();
  const { playClickSound } = useUISounds();

  const handleMuteToggle = () => {
    toggleMute();
    playClickSound();
  };

  const isMuted = !settings.soundEnabled && !settings.musicEnabled;

  return (
    <button
      onClick={handleMuteToggle}
      className="p-2 bg-mi-black/50 border border-mi-red/30 rounded-lg hover:border-mi-cyber-green transition-all"
      aria-label={isMuted ? 'Unmute' : 'Mute'}
      title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
    >
      {isMuted ? (
        <SoundOff className="w-5 h-5 text-mi-red" />
      ) : (
        <SoundHigh className="w-5 h-5 text-mi-cyber-green" />
      )}
    </button>
  );
}
