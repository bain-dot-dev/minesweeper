/**
 * Game Mode Selector Component
 * Mission Impossible themed UI for selecting game modes
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
}

interface Category {
  id: GameModeCategory | "all";
  name: string;
  icon: string;
}

const CATEGORIES: Category[] = [
  { id: "all", name: "All Missions", icon: "🎮" },
  { id: "time-based", name: "Time Ops", icon: "⏱️" },
  { id: "difficulty", name: "Progressive", icon: "📈" },
  { id: "relaxed", name: "Training", icon: "🎯" },
  { id: "challenge", name: "Elite", icon: "💀" },
  { id: "creative", name: "Special", icon: "🎨" },
];

export function GameModeSelector({
  onSelectMode,
  currentMode,
  className,
  showPreview = true,
  compact = false,
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
      className={cn("w-full max-w-7xl mx-auto px-4 py-8 space-y-6", className)}
    >
      {/* Header */}
      <div className="text-center space-y-2 relative">
        <h1 className="text-4xl md:text-5xl font-bold text-mi-cyber-green uppercase tracking-wider">
          Select Your Mission
        </h1>
        <div className="h-1 w-32 mx-auto bg-gradient-to-r from-transparent via-mi-electric-blue to-transparent" />
        <p className="text-gray-400 text-sm md:text-base">
          Choose your operation mode and begin your mission
        </p>
      </div>

      {/* Search Bar */}
      <div className="max-w-md mx-auto">
        <input
          type="text"
          placeholder="Search missions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-3 bg-mi-dark-blue/50 border border-mi-cyber-green/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-mi-cyber-green focus:ring-2 focus:ring-mi-cyber-green/20 transition-all"
        />
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 justify-center">
        {CATEGORIES.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={cn(
              "px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2",
              selectedCategory === category.id
                ? "bg-mi-cyber-green text-black shadow-lg shadow-mi-cyber-green/50 scale-105"
                : "bg-mi-dark-blue/50 text-gray-300 hover:bg-mi-dark-blue hover:text-white border border-mi-cyber-green/20"
            )}
          >
            <span className="text-lg">{category.icon}</span>
            <span className="text-sm md:text-base">{category.name}</span>
          </button>
        ))}
      </div>

      {/* Mode Count */}
      <div className="text-center text-sm text-gray-400">
        {filteredModes.length}{" "}
        {filteredModes.length === 1 ? "mission" : "missions"} available
      </div>

      {/* Modes Grid */}
      <div
        className={cn(
          "grid gap-4",
          compact
            ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
            : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        )}
      >
        {filteredModes.map((mode) => (
          <ModeCard
            key={mode.id}
            mode={mode}
            onSelect={() => handleModeSelect(mode)}
            onHover={() => setHoveredMode(mode.id)}
            onLeave={() => setHoveredMode(null)}
            isSelected={currentMode === mode.id}
            isHovered={hoveredMode === mode.id}
            compact={compact}
          />
        ))}
      </div>

      {/* Empty State */}
      {filteredModes.length === 0 && (
        <div className="text-center py-12 space-y-4">
          <div className="text-6xl opacity-50">🔍</div>
          <h3 className="text-xl font-semibold text-gray-400">
            No missions found
          </h3>
          <p className="text-gray-500">
            Try adjusting your search or category filter
          </p>
        </div>
      )}

      {/* Mode Preview (Desktop) */}
      {showPreview && hoveredModeData && (
        <div className="hidden lg:block">
          <ModePreview mode={hoveredModeData} />
        </div>
      )}
    </div>
  );
}
