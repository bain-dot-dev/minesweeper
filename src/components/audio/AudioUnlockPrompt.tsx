/**
 * Audio Unlock Prompt Component
 * Shows when audio is blocked and user interaction is required
 */

"use client";

import { useState, useEffect } from "react";
import { SoundOff, SoundHigh, WarningTriangle } from "iconoir-react";
import { cn } from "@/lib/utils";

interface AudioUnlockPromptProps {
  isVisible: boolean;
  onDismiss: () => void;
}

export function AudioUnlockPrompt({
  isVisible,
  onDismiss,
}: AudioUnlockPromptProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
        onClick={onDismiss}
      />

      {/* Prompt */}
      <div
        className={cn(
          "fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50",
          "bg-gradient-to-br from-mi-black/95 to-mi-black/90 border-2 border-mi-red/40 rounded-lg shadow-2xl",
          "p-6 max-w-sm w-full mx-4",
          "transition-all duration-300",
          isAnimating ? "scale-105 opacity-100" : "scale-100 opacity-100"
        )}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="relative">
            <WarningTriangle className="w-8 h-8 text-mi-yellow animate-pulse" />
            <div className="absolute inset-0 w-8 h-8 text-mi-yellow opacity-30 animate-ping" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-mi-cyber-green uppercase tracking-wide">
              Audio Blocked
            </h3>
            <p className="text-xs text-mi-yellow/70">
              User interaction required
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-mi-black/50 border border-mi-red/30 rounded-lg">
            <SoundOff className="w-6 h-6 text-mi-red" />
            <div className="flex-1">
              <p className="text-sm text-mi-electric-blue font-medium">
                Audio is currently disabled
              </p>
              <p className="text-xs text-mi-yellow/70 mt-1">
                Tap anywhere to enable audio and sounds
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-mi-black/50 border border-mi-cyber-green/30 rounded-lg">
            <SoundHigh className="w-6 h-6 text-mi-cyber-green" />
            <div className="flex-1">
              <p className="text-sm text-mi-electric-blue font-medium">
                After enabling
              </p>
              <p className="text-xs text-mi-yellow/70 mt-1">
                You&apos;ll hear game sounds and music
              </p>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-mi-black/30 border border-mi-cyan/30 rounded-lg p-3">
            <p className="text-xs text-mi-cyan italic text-center">
              <span className="font-bold">Tip:</span> This is required for
              mobile browsers and embedded apps like World Coin
            </p>
          </div>
        </div>

        {/* Dismiss Button */}
        <button
          onClick={onDismiss}
          className="w-full mt-4 px-4 py-2 bg-gradient-to-r from-mi-red/20 to-mi-black/80 border border-mi-red/30 rounded-lg hover:border-mi-cyber-green transition-all text-sm font-medium text-white"
        >
          Got it
        </button>
      </div>
    </>
  );
}
