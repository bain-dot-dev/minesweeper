/**
 * World Coin App Audio Unlock Component
 * Provides a more aggressive audio unlock mechanism for World Coin mini apps
 */

"use client";

import { useEffect, useState } from "react";
import { getAudioManager } from "@/lib/audio/AudioManager";
import { cn } from "@/lib/utils";
import { SoundHigh, SoundOff, WarningTriangle } from "iconoir-react";

interface WorldCoinAudioUnlockProps {
  className?: string;
}

export function WorldCoinAudioUnlock({ className }: WorldCoinAudioUnlockProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [audioManager] = useState(() => getAudioManager());

  useEffect(() => {
    // Check if we're in World Coin app and audio is not unlocked
    const checkAudioStatus = () => {
      const isWorldCoin = audioManager.isWorldCoinAppEnvironment();
      const isUnlocked = audioManager.isAudioUnlocked();
      const contextState = audioManager.getAudioContextState();

      console.log("🔍 Audio status check:", {
        isWorldCoin,
        isUnlocked,
        contextState,
        shouldShow: isWorldCoin && !isUnlocked,
      });

      if (isWorldCoin && !isUnlocked) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    // Check immediately
    checkAudioStatus();

    // Check periodically
    const interval = setInterval(checkAudioStatus, 1000);

    return () => clearInterval(interval);
  }, [audioManager]);

  const handleUnlock = async () => {
    setIsUnlocking(true);

    try {
      console.log("🔓 Attempting World Coin audio unlock...");
      await audioManager.forceUnlock();

      // Wait a moment and check if it worked
      setTimeout(() => {
        if (audioManager.isAudioUnlocked()) {
          console.log("✅ Audio unlock successful");
          setIsVisible(false);
        } else {
          console.warn("⚠️ Audio unlock may have failed");
        }
        setIsUnlocking(false);
      }, 500);
    } catch (error) {
      console.error("❌ Audio unlock failed:", error);
      setIsUnlocking(false);
    }
  };

  const handleTestSound = async () => {
    try {
      console.log("🔊 Testing audio after unlock...");
      audioManager.playSound("menu_click", { volume: 0.3 });
    } catch (error) {
      console.warn("⚠️ Test sound failed:", error);
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div
      className={cn(
        "fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4",
        className
      )}
    >
      <div className="bg-gradient-to-br from-mi-black/95 to-mi-black/90 border-2 border-mi-red/40 rounded-lg p-6 max-w-md w-full text-center">
        {/* Header */}
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="relative">
            <SoundOff className="w-8 h-8 text-mi-red animate-pulse" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-mi-red rounded-full animate-ping"></div>
          </div>
          <h3 className="text-lg font-bold text-mi-cyber-green uppercase tracking-wide">
            Audio Unlock Required
          </h3>
        </div>

        {/* Description */}
        <div className="space-y-3 mb-6">
          <p className="text-sm text-mi-yellow">
            Audio is disabled in World Coin app. Tap the button below to enable
            sound effects and music.
          </p>

          <div className="flex items-center gap-2 text-xs text-mi-electric-blue bg-mi-black/50 rounded p-2">
            <WarningTriangle className="w-4 h-4" />
            <span>This is required for the full gaming experience</span>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={handleUnlock}
            disabled={isUnlocking}
            className={cn(
              "w-full py-3 px-6 rounded-lg font-bold text-white uppercase tracking-wide transition-all",
              "bg-gradient-to-r from-mi-cyber-green to-mi-electric-blue",
              "hover:from-mi-electric-blue hover:to-mi-cyber-green",
              "active:scale-95 shadow-lg",
              isUnlocking && "opacity-50 cursor-not-allowed"
            )}
          >
            {isUnlocking ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Unlocking Audio...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <SoundHigh className="w-5 h-5" />
                <span>Enable Audio</span>
              </div>
            )}
          </button>

          <button
            onClick={handleTestSound}
            className="w-full py-2 px-4 text-sm text-mi-cyan hover:text-white transition-colors border border-mi-cyan/30 rounded hover:border-mi-cyan"
          >
            Test Sound (after unlock)
          </button>
        </div>

        {/* Debug Info */}
        <div className="mt-4 pt-4 border-t border-mi-red/20 text-xs text-mi-yellow/70">
          <p>World Coin App Environment Detected</p>
          <p>
            AudioContext State:{" "}
            {audioManager.getAudioContextState() || "Unknown"}
          </p>
        </div>
      </div>
    </div>
  );
}
