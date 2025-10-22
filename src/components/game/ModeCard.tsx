/**
 * Mode Card Component
 * Individual game mode card with Mission Impossible styling
 */

"use client";

import { GameMode } from "@/types/gameMode";
import { cn } from "@/lib/utils";

interface ModeCardProps {
  mode: GameMode;
  onSelect: () => void;
  onHover: () => void;
  onLeave: () => void;
  isSelected?: boolean;
  isHovered?: boolean;
  compact?: boolean;
}

const CATEGORY_COLORS: Record<string, string> = {
  "time-based": "from-orange-500 to-red-500",
  difficulty: "from-purple-500 to-pink-500",
  relaxed: "from-blue-500 to-cyan-500",
  challenge: "from-red-600 to-red-800",
  creative: "from-green-500 to-teal-500",
};

export function ModeCard({
  mode,
  onSelect,
  onHover,
  onLeave,
  isSelected = false,
  isHovered = false,
  compact = false,
}: ModeCardProps) {
  const categoryGradient =
    CATEGORY_COLORS[mode.category] || "from-gray-500 to-gray-700";

  return (
    <div
      className={cn(
        "relative group cursor-pointer transition-all duration-300",
        isHovered && "scale-105 z-10"
      )}
      onClick={onSelect}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
    >
      {/* Card Container */}
      <div
        className={cn(
          "relative bg-gradient-to-br from-mi-dark-blue to-mi-dark-blue/50 border-2 rounded-lg overflow-hidden transition-all duration-300",
          isSelected
            ? "border-mi-cyber-green shadow-lg shadow-mi-cyber-green/50"
            : "border-mi-cyber-green/30 hover:border-mi-cyber-green/60",
          "h-full",
          compact ? "min-h-[120px]" : "min-h-[180px]"
        )}
      >
        {/* Selected Indicator */}
        {isSelected && (
          <div className="absolute top-1 right-1 z-20">
            <div className="bg-mi-cyber-green text-black px-1.5 py-0.5 rounded text-xs font-bold flex items-center gap-1">
              <span>✓</span>
              <span className="hidden sm:inline">ACTIVE</span>
            </div>
          </div>
        )}

        {/* Category Gradient Bar */}
        <div
          className={cn(
            "absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r",
            categoryGradient
          )}
        />

        {/* Content */}
        <div
          className={cn(
            "space-y-2 h-full flex flex-col",
            compact ? "p-2" : "p-3"
          )}
        >
          {/* Icon and Title */}
          <div className="space-y-1">
            <div className={cn(compact ? "text-2xl" : "text-3xl")}>
              {mode.icon}
            </div>
            <h3
              className={cn(
                "font-bold text-white leading-tight",
                compact ? "text-sm" : "text-base"
              )}
            >
              {mode.name}
            </h3>
          </div>

          {/* Description - Only show on larger screens or when not compact */}
          {!compact && (
            <p className={cn("text-gray-400 flex-grow text-xs line-clamp-2")}>
              {mode.description}
            </p>
          )}

          {/* Stats - Compact version */}
          <div className="space-y-1 pt-1 border-t border-mi-cyber-green/20">
            {/* Category Badge */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 uppercase tracking-wider">
                {mode.category}
              </span>
              {mode.continueAllowed && (
                <span className="text-xs text-mi-cyber-green font-semibold">
                  {mode.continueCost} WLD
                </span>
              )}
            </div>

            {/* Quick Info - More compact */}
            <div className="flex flex-wrap gap-1 text-xs">
              {typeof mode.config.boardSize !== "string" && (
                <span className="px-1.5 py-0.5 bg-mi-dark-blue/80 rounded text-gray-300 text-xs">
                  {mode.config.boardSize.width}x{mode.config.boardSize.height}
                </span>
              )}
              {typeof mode.config.mineCount === "number" && (
                <span className="px-1.5 py-0.5 bg-mi-dark-blue/80 rounded text-gray-300 text-xs">
                  💣 {mode.config.mineCount}
                </span>
              )}
              {mode.config.timeLimit && (
                <span className="px-1.5 py-0.5 bg-mi-dark-blue/80 rounded text-gray-300 text-xs">
                  ⏱️ {mode.config.timeLimit}s
                </span>
              )}
              {mode.config.moveLimit && (
                <span className="px-1.5 py-0.5 bg-mi-dark-blue/80 rounded text-gray-300 text-xs">
                  🎯 {mode.config.moveLimit}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Hover Effect Overlay */}
        <div
          className={cn(
            "absolute inset-0 bg-gradient-to-br from-mi-cyber-green/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          )}
        />

        {/* Scanning Line Animation (on hover) */}
        {isHovered && (
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-mi-cyber-green animate-scan" />
        )}
      </div>

      {/* Continue Badge (if not allowed) - More compact */}
      {!mode.continueAllowed && (
        <div className="absolute -top-1 -right-1 z-20">
          <div className="bg-red-600 text-white px-1.5 py-0.5 rounded text-xs font-bold shadow-lg transform rotate-12">
            NO CONTINUES
          </div>
        </div>
      )}
    </div>
  );
}
