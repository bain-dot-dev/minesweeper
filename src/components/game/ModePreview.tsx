/**
 * Mode Preview Component
 * Detailed preview of a game mode (shown on hover/select)
 */

"use client";

import { GameMode } from "@/types/gameMode";
import { cn } from "@/lib/utils";

interface ModePreviewProps {
  mode: GameMode;
  className?: string;
}

export function ModePreview({ mode, className }: ModePreviewProps) {
  const getBoardSizeText = (): string => {
    if (typeof mode.config.boardSize === "string") {
      return "Dynamic board size";
    }
    return `${mode.config.boardSize.width} × ${mode.config.boardSize.height}`;
  };

  const getMineCountText = (): string => {
    if (typeof mode.config.mineCount === "string") {
      return "Dynamic mine count";
    }
    return `${mode.config.mineCount} mines`;
  };

  return (
    <div
      className={cn(
        "fixed bottom-6 left-6 right-6 lg:left-auto lg:right-6 lg:w-96",
        "bg-gradient-to-br from-mi-dark-blue to-mi-dark-blue/90",
        "border-2 border-mi-cyber-green rounded-xl p-6 shadow-2xl",
        "animate-slide-up backdrop-blur-sm",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start gap-4 mb-4">
        <div className="text-5xl">{mode.icon}</div>
        <div className="flex-1">
          <h3 className="text-2xl font-bold text-white mb-1">{mode.name}</h3>
          <p className="text-sm text-gray-400 uppercase tracking-wider">
            {mode.category}
          </p>
        </div>
      </div>

      {/* Description */}
      <p className="text-gray-300 mb-4 leading-relaxed">{mode.description}</p>

      {/* Specs */}
      <div className="space-y-3 mb-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-mi-dark-blue/50 rounded-lg p-3 border border-mi-cyber-green/20">
            <div className="text-xs text-gray-500 uppercase mb-1">Board</div>
            <div className="text-white font-semibold">
              {getBoardSizeText()}
            </div>
          </div>
          <div className="bg-mi-dark-blue/50 rounded-lg p-3 border border-mi-cyber-green/20">
            <div className="text-xs text-gray-500 uppercase mb-1">Mines</div>
            <div className="text-white font-semibold">
              {getMineCountText()}
            </div>
          </div>
        </div>

        {(mode.config.timeLimit || mode.config.moveLimit) && (
          <div className="grid grid-cols-2 gap-3">
            {mode.config.timeLimit && (
              <div className="bg-mi-dark-blue/50 rounded-lg p-3 border border-mi-cyber-green/20">
                <div className="text-xs text-gray-500 uppercase mb-1">
                  Time Limit
                </div>
                <div className="text-white font-semibold">
                  {mode.config.timeLimit}s
                </div>
              </div>
            )}
            {mode.config.moveLimit && (
              <div className="bg-mi-dark-blue/50 rounded-lg p-3 border border-mi-cyber-green/20">
                <div className="text-xs text-gray-500 uppercase mb-1">
                  Move Limit
                </div>
                <div className="text-white font-semibold">
                  {mode.config.moveLimit}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Special Rules */}
      {mode.config.specialRules.length > 0 && (
        <div className="mb-4">
          <div className="text-xs text-gray-500 uppercase mb-2">
            Special Rules
          </div>
          <div className="flex flex-wrap gap-2">
            {mode.config.specialRules.map((rule) => (
              <span
                key={rule}
                className="px-2 py-1 bg-mi-cyber-green/20 text-mi-cyber-green text-xs rounded-full border border-mi-cyber-green/30"
              >
                {rule.replace(/-/g, " ")}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Continue Info */}
      <div className="border-t border-mi-cyber-green/20 pt-4">
        {mode.continueAllowed ? (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Continue Available</span>
            <span className="text-lg font-bold text-mi-cyber-green">
              {mode.continueCost} WLD
            </span>
          </div>
        ) : (
          <div className="text-center">
            <span className="text-sm text-red-400 font-semibold">
              ⚠️ No Continues Available
            </span>
          </div>
        )}
      </div>

      {/* Difficulty Progression Info */}
      {mode.config.difficultyProgression && (
        <div className="mt-4 p-3 bg-purple-900/20 rounded-lg border border-purple-500/30">
          <div className="text-xs text-purple-300 uppercase mb-1">
            Progressive Difficulty
          </div>
          <div className="text-sm text-purple-200">
            Starts at level {mode.config.difficultyProgression.startLevel}
            {mode.config.difficultyProgression.maxLevel
              ? `, max level ${mode.config.difficultyProgression.maxLevel}`
              : ", unlimited levels"}
          </div>
        </div>
      )}
    </div>
  );
}
