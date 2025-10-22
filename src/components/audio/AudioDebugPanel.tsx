/**
 * Audio Debug Panel
 * Shows audio system status for debugging in World Coin app
 */

"use client";

import { useState } from "react";
import { useWorldCoinAudio } from "@/hooks/useAudio";
import { cn } from "@/lib/utils";
import { Bug, SoundHigh, SoundOff, InfoCircle } from "iconoir-react";

interface AudioDebugPanelProps {
  className?: string;
}

export function AudioDebugPanel({ className }: AudioDebugPanelProps) {
  const [isVisible, setIsVisible] = useState(false);
  const { isWorldCoinApp, isUnlocked, contextState, forceUnlock, testSound } =
    useWorldCoinAudio();

  // Only show in development or World Coin app
  const shouldShow = process.env.NODE_ENV === "development" || isWorldCoinApp;

  if (!shouldShow) {
    return null;
  }

  const handleForceUnlock = async () => {
    try {
      await forceUnlock();
      console.log("🔓 Force unlock completed");
    } catch (error) {
      console.error("❌ Force unlock failed:", error);
    }
  };

  const handleTestSound = () => {
    testSound();
  };

  return (
    <div className={cn("fixed bottom-4 left-4 z-50", className)}>
      {/* Toggle Button */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="p-2 bg-mi-black/80 border border-mi-red/30 rounded-lg hover:border-mi-cyber-green transition-all"
        title="Audio Debug Panel"
      >
        <Bug className="w-5 h-5 text-mi-cyber-green" />
      </button>

      {/* Debug Panel */}
      {isVisible && (
        <div className="absolute bottom-12 left-0 bg-mi-black/95 border border-mi-red/40 rounded-lg p-4 min-w-[300px] space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-mi-cyber-green uppercase">
              Audio Debug
            </h3>
            <button
              onClick={() => setIsVisible(false)}
              className="text-mi-red hover:text-white text-xs"
            >
              ✕
            </button>
          </div>

          {/* Status Info */}
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-mi-yellow">Environment:</span>
              <span
                className={cn(
                  "px-2 py-1 rounded text-xs font-mono",
                  isWorldCoinApp
                    ? "bg-mi-cyber-green/20 text-mi-cyber-green"
                    : "bg-mi-orange/20 text-mi-orange"
                )}
              >
                {isWorldCoinApp ? "World Coin App" : "Browser"}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-mi-yellow">Audio Unlocked:</span>
              <span
                className={cn(
                  "px-2 py-1 rounded text-xs font-mono",
                  isUnlocked
                    ? "bg-mi-cyber-green/20 text-mi-cyber-green"
                    : "bg-mi-red/20 text-mi-red"
                )}
              >
                {isUnlocked ? "Yes" : "No"}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-mi-yellow">AudioContext:</span>
              <span
                className={cn(
                  "px-2 py-1 rounded text-xs font-mono",
                  contextState === "running"
                    ? "bg-mi-cyber-green/20 text-mi-cyber-green"
                    : contextState === "suspended"
                    ? "bg-mi-orange/20 text-mi-orange"
                    : "bg-mi-red/20 text-mi-red"
                )}
              >
                {contextState || "Unknown"}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <button
              onClick={handleForceUnlock}
              disabled={isUnlocked}
              className={cn(
                "w-full py-2 px-3 text-xs rounded transition-all",
                isUnlocked
                  ? "bg-mi-black/50 text-mi-yellow/50 cursor-not-allowed"
                  : "bg-mi-cyber-green/20 text-mi-cyber-green hover:bg-mi-cyber-green/30"
              )}
            >
              <div className="flex items-center justify-center gap-2">
                {isUnlocked ? (
                  <SoundHigh className="w-4 h-4" />
                ) : (
                  <SoundOff className="w-4 h-4" />
                )}
                <span>{isUnlocked ? "Audio Unlocked" : "Force Unlock"}</span>
              </div>
            </button>

            <button
              onClick={handleTestSound}
              disabled={!isUnlocked}
              className={cn(
                "w-full py-2 px-3 text-xs rounded transition-all",
                !isUnlocked
                  ? "bg-mi-black/50 text-mi-yellow/50 cursor-not-allowed"
                  : "bg-mi-electric-blue/20 text-mi-electric-blue hover:bg-mi-electric-blue/30"
              )}
            >
              <div className="flex items-center justify-center gap-2">
                <SoundHigh className="w-4 h-4" />
                <span>Test Sound</span>
              </div>
            </button>
          </div>

          {/* Info */}
          <div className="text-xs text-mi-yellow/70 bg-mi-black/50 rounded p-2">
            <div className="flex items-start gap-2">
              <InfoCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
              <div>
                <p>This panel helps debug audio issues in World Coin app.</p>
                <p className="mt-1">
                  Audio must be unlocked before sounds can play.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
