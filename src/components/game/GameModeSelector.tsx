/**
 * Game Mode Selector Component
 * Mobile-first Mission Impossible themed UI for selecting game modes
 * Optimized for mini apps with no scrolling
 */

"use client";

import { useState, useMemo } from "react";
import { GameMode, GameModeCategory } from "@/types/gameMode";
import {
  gameModeRegistry,
  getGameModesByCategory,
} from "@/lib/gameModeRegistry";
import { ModeCard } from "./ModeCard";
import { ModePreview } from "./ModePreview";
import { cn } from "@/lib/utils";

interface GameModeSelectorProps {
  onSelectMode: (mode: GameMode) => void;
  currentMode?: string;
  className?: string;
  showPreview?: boolean;
  compact?: boolean;
  onClose?: () => void;
}

interface Category {
  id: GameModeCategory | "all";
  name: string;
  icon: string;
  shortName: string;
}

const CATEGORIES: Category[] = [
  { id: "all", name: "All Missions", shortName: "All", icon: "🎮" },
  { id: "time-based", name: "Time Ops", shortName: "Time", icon: "⏱️" },
  { id: "difficulty", name: "Progressive", shortName: "Prog", icon: "📈" },
  { id: "relaxed", name: "Training", shortName: "Train", icon: "🎯" },
  { id: "challenge", name: "Elite", shortName: "Elite", icon: "💀" },
  { id: "creative", name: "Special", shortName: "Special", icon: "🎨" },
];

export function GameModeSelector({
  onSelectMode,
  currentMode,
  className,
  showPreview = false, // Disabled by default for mobile
  onClose,
}: GameModeSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<
    GameModeCategory | "all"
  >("all");
  const [hoveredMode, setHoveredMode] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Get filtered modes based on category and search
  const filteredModes = useMemo(() => {
    let modes: GameMode[];

    if (selectedCategory === "all") {
      modes = gameModeRegistry.getEnabledModes();
    } else {
      modes = getGameModesByCategory(selectedCategory);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      modes = modes.filter(
        (mode) =>
          mode.name.toLowerCase().includes(query) ||
          mode.description.toLowerCase().includes(query) ||
          mode.category.toLowerCase().includes(query)
      );
    }

    return modes;
  }, [selectedCategory, searchQuery]);

  const handleModeSelect = (mode: GameMode) => {
    onSelectMode(mode);
  };

  const hoveredModeData = hoveredMode
    ? gameModeRegistry.getMode(hoveredMode)
    : null;

  return (
    <div
      className={cn(
        "w-full h-full flex flex-col overflow-hidden",
        "bg-gradient-to-b from-mi-dark-blue to-black",
        className
      )}
    >
      {/* Compact Header */}
      <div className="flex-shrink-0 px-3 py-2 border-b border-mi-cyber-green/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-mi-cyber-green uppercase tracking-wide">
              Select Mission
            </h1>
            <div className="text-xs text-gray-400">
              {filteredModes.length} available
            </div>
          </div>

          {/* Close Button */}
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors p-1"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Search Bar - Compact */}
      <div className="flex-shrink-0 px-3 py-2">
        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-3 py-2 bg-mi-dark-blue/50 border border-mi-cyber-green/30 rounded text-white placeholder-gray-500 focus:outline-none focus:border-mi-cyber-green text-sm"
        />
      </div>

      {/* Category Tabs - Horizontal Scroll */}
      <div className="flex-shrink-0 px-3 py-2">
        <div className="flex gap-1 overflow-x-auto scrollbar-hide">
          {CATEGORIES.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={cn(
                "flex-shrink-0 px-3 py-1.5 rounded text-xs font-medium transition-all duration-200 flex items-center gap-1.5",
                selectedCategory === category.id
                  ? "bg-mi-cyber-green text-black shadow-lg"
                  : "bg-mi-dark-blue/50 text-gray-300 hover:bg-mi-dark-blue hover:text-white border border-mi-cyber-green/20"
              )}
            >
              <span className="text-sm">{category.icon}</span>
              <span className="hidden sm:inline">{category.name}</span>
              <span className="sm:hidden">{category.shortName}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Modes Grid - Scrollable */}
      <div className="flex-1 overflow-y-auto px-3 py-2">
        <div className="grid gap-2 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
          {filteredModes.map((mode) => (
            <ModeCard
              key={mode.id}
              mode={mode}
              onSelect={() => handleModeSelect(mode)}
              onHover={() => setHoveredMode(mode.id)}
              onLeave={() => setHoveredMode(null)}
              isSelected={currentMode === mode.id}
              isHovered={hoveredMode === mode.id}
              compact={true}
            />
          ))}
        </div>

        {/* Empty State */}
        {filteredModes.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 space-y-3">
            <div className="text-4xl opacity-50">🔍</div>
            <h3 className="text-lg font-semibold text-gray-400">
              No missions found
            </h3>
            <p className="text-sm text-gray-500 text-center">
              Try adjusting your search or category filter
            </p>
          </div>
        )}
      </div>

      {/* Mode Preview (Mobile Bottom Sheet) */}
      {showPreview && hoveredModeData && (
        <div className="lg:hidden">
          <ModePreview mode={hoveredModeData} />
        </div>
      )}
    </div>
  );
}
