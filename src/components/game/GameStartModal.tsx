/**
 * Game Start Modal Component
 * Combines audio unlock prompt with mission briefing for game start
 */

"use client";

import { useState, useEffect } from "react";
import { WarningTriangle, Play, SoundHigh, SoundOff } from "iconoir-react";
import { cn } from "@/lib/utils";
import { getAudioManager } from "@/lib/audio/AudioManager";

interface GameStartModalProps {
  isVisible: boolean;
  onStart: () => void;
  onDismiss: () => void;
}

export function GameStartModal({
  isVisible,
  onStart,
  onDismiss,
}: GameStartModalProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [hasSeenModal, setHasSeenModal] = useState(true);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const [audioManager] = useState(() => getAudioManager());

  useEffect(() => {
    // Check if user has seen the modal before
    const hasSeenBefore = localStorage.getItem("minesweeper-game-start-seen");
    setHasSeenModal(!!hasSeenBefore);

    // Check audio unlock status
    const checkAudioStatus = () => {
      const isUnlocked = audioManager.isAudioUnlocked();
      setAudioUnlocked(isUnlocked);
    };

    // Check immediately
    checkAudioStatus();

    // Check periodically
    const interval = setInterval(checkAudioStatus, 1000);

    return () => clearInterval(interval);
  }, [audioManager]);

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  const handleStart = async () => {
    // Mark as seen when user starts the game
    localStorage.setItem("minesweeper-game-start-seen", "true");

    // If audio is not unlocked, unlock it first
    if (!audioUnlocked) {
      setIsUnlocking(true);
      try {
        console.log("🔓 Unlocking audio before starting game...");
        await audioManager.forceUnlock();

        // Wait a moment and check if it worked
        setTimeout(() => {
          if (audioManager.isAudioUnlocked()) {
            console.log("✅ Audio unlocked successfully");
            setAudioUnlocked(true);
          } else {
            console.warn("⚠️ Audio unlock may have failed");
          }
          setIsUnlocking(false);
          onStart();
        }, 500);
      } catch (error) {
        console.error("❌ Audio unlock failed:", error);
        setIsUnlocking(false);
        onStart(); // Start game anyway
      }
    } else {
      onStart();
    }
  };

  const handleDismiss = () => {
    // Mark as seen when user dismisses
    localStorage.setItem("minesweeper-game-start-seen", "true");
    onDismiss();
  };

  const handleTestSound = () => {
    try {
      console.log("🔊 Testing audio...");
      audioManager.playSound("menu_click", { volume: 0.3 });
    } catch (error) {
      console.warn("⚠️ Test sound failed:", error);
    }
  };

  // Show modal if visible and either hasn't been seen before OR audio is not unlocked
  // This ensures the modal shows on every reload when audio is not unlocked
  if (!isVisible) return null;

  // Don't show if user has seen it AND audio is unlocked
  if (hasSeenModal && audioUnlocked) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
        onClick={handleDismiss}
      />

      {/* Modal */}
      <div
        className={cn(
          "fixed inset-0 z-50 flex items-center justify-center p-4",
          "transition-all duration-300"
        )}
      >
        <div
          className={cn(
            "bg-gradient-to-br from-mi-black/95 to-mi-black/90 border-2 border-mi-red/40 rounded-lg shadow-2xl",
            "p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto",
            "transition-all duration-300",
            isAnimating ? "scale-105 opacity-100" : "scale-100 opacity-100"
          )}
        >
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="relative">
              <WarningTriangle className="w-8 h-8 text-mi-yellow" />
              <div className="absolute inset-0 w-8 h-8 text-mi-yellow opacity-30 animate-ping" />
            </div>
            <div>
              <h2
                className="text-2xl font-bold text-mi-cyber-green uppercase tracking-wide"
                style={{ fontFamily: "'Bebas Neue', Impact, sans-serif" }}
              >
                Mission Briefing
              </h2>
              <p className="text-sm text-mi-yellow/70">
                Mission details & instructions
              </p>
            </div>
          </div>

          {/* Mission Briefing */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-mi-cyber-green mb-4 uppercase">
              Mission Details
            </h3>

            <div className="bg-mi-black/30 border border-mi-red/20 rounded-lg p-4 mb-4">
              <p className="text-sm text-mi-yellow italic mb-4">
                &ldquo;Agent, your mission is to locate and defuse all explosive
                devices. Proceed with extreme caution...&rdquo;
              </p>

              <ul className="text-sm text-mi-electric-blue space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-mi-cyber-green">▸</span>
                  <span>
                    <strong className="text-white">Click</strong> to reveal
                    sectors
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-mi-cyber-green">▸</span>
                  <span>
                    <strong className="text-white">Right-click</strong> or{" "}
                    <strong className="text-white">long-press</strong> to mark
                    threats
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-mi-cyber-green">▸</span>
                  <span>
                    Numbers indicate{" "}
                    <strong className="text-white">
                      proximity to explosives
                    </strong>
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-mi-cyber-green">▸</span>
                  <span>
                    <strong className="text-white">
                      Neutralize all threats
                    </strong>{" "}
                    to complete the mission!
                  </span>
                </li>
              </ul>
            </div>

            {/* Audio Status */}
            <div className="bg-mi-black/30 border border-mi-cyan/30 rounded-lg p-3 mb-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {audioUnlocked ? (
                    <SoundHigh className="w-4 h-4 text-mi-cyber-green" />
                  ) : (
                    <SoundOff className="w-4 h-4 text-mi-red" />
                  )}
                  <span className="text-sm font-medium text-white">
                    Audio Status: {audioUnlocked ? "Enabled" : "Disabled"}
                  </span>
                </div>
                {!audioUnlocked && (
                  <button
                    onClick={handleTestSound}
                    className="px-2 py-1 text-xs bg-mi-cyan/20 text-mi-cyan border border-mi-cyan/30 rounded hover:bg-mi-cyan/30 transition-colors"
                  >
                    Test
                  </button>
                )}
              </div>
              <p className="text-xs text-mi-cyan italic">
                <span className="font-bold">Note:</span> Audio will be
                automatically enabled when you start the mission
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleStart}
              disabled={isUnlocking}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-all text-sm font-medium text-white",
                "bg-gradient-to-r from-mi-cyber-green/20 to-mi-black/80 border border-mi-cyber-green/50",
                "hover:border-mi-cyber-green hover:bg-mi-cyber-green/10",
                isUnlocking && "opacity-50 cursor-not-allowed"
              )}
            >
              {isUnlocking ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Enabling Audio...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Start Mission
                </>
              )}
            </button>
            {/* <button
              onClick={handleDismiss}
              className="px-4 py-3 bg-gradient-to-r from-mi-red/20 to-mi-black/80 border border-mi-red/30 rounded-lg hover:border-mi-red hover:bg-mi-red/10 transition-all text-sm font-medium text-white"
            >
              Skip
            </button> */}
          </div>
        </div>
      </div>
    </>
  );
}
