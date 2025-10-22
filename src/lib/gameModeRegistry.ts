/**
 * Game Mode Registry
 * Central system for managing and accessing game modes
 */

import { GameMode, GameModeCategory } from "@/types/gameMode";
import { ALL_GAME_MODES, DEFAULT_GAME_MODE } from "@/config/gameModes";

export class GameModeRegistry {
  private modes: Map<string, GameMode> = new Map();
  private static instance: GameModeRegistry | null = null;

  private constructor() {
    this.registerAllModes();
  }

  /**
   * Get singleton instance of the registry
   */
  static getInstance(): GameModeRegistry {
    if (!GameModeRegistry.instance) {
      GameModeRegistry.instance = new GameModeRegistry();
    }
    return GameModeRegistry.instance;
  }

  /**
   * Register all game modes from configuration
   */
  private registerAllModes(): void {
    ALL_GAME_MODES.forEach((mode) => {
      this.registerMode(mode);
    });
  }

  /**
   * Register a single game mode
   */
  registerMode(mode: GameMode): void {
    if (this.modes.has(mode.id)) {
      console.warn(`Game mode ${mode.id} already registered. Overwriting.`);
    }
    this.modes.set(mode.id, mode);
  }

  /**
   * Get a game mode by ID
   */
  getMode(id: string): GameMode | undefined {
    return this.modes.get(id);
  }

  /**
   * Get game mode or return default if not found
   */
  getModeOrDefault(id: string): GameMode {
    return this.modes.get(id) || DEFAULT_GAME_MODE;
  }

  /**
   * Get all game modes
   */
  getAllModes(): GameMode[] {
    return Array.from(this.modes.values());
  }

  /**
   * Get enabled game modes only
   */
  getEnabledModes(): GameMode[] {
    return Array.from(this.modes.values()).filter(
      (mode) => mode.enabled !== false
    );
  }

  /**
   * Get game modes by category
   */
  getModesByCategory(category: GameModeCategory): GameMode[] {
    return Array.from(this.modes.values()).filter(
      (mode) => mode.category === category && mode.enabled !== false
    );
  }

  /**
   * Get all available categories
   */
  getCategories(): GameModeCategory[] {
    const categories = new Set<GameModeCategory>();
    this.modes.forEach((mode) => {
      if (mode.enabled !== false) {
        categories.add(mode.category);
      }
    });
    return Array.from(categories);
  }

  /**
   * Check if a mode allows continues
   */
  canContinue(modeId: string): boolean {
    const mode = this.modes.get(modeId);
    return mode?.continueAllowed ?? false;
  }

  /**
   * Get continue cost for a mode
   */
  getContinueCost(modeId: string): number {
    const mode = this.modes.get(modeId);
    return mode?.continueCost ?? 0;
  }

  /**
   * Get modes that support continues
   */
  getContinuableModes(): GameMode[] {
    return Array.from(this.modes.values()).filter(
      (mode) => mode.continueAllowed && mode.enabled !== false
    );
  }

  /**
   * Search modes by name or description
   */
  searchModes(query: string): GameMode[] {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.modes.values()).filter(
      (mode) =>
        mode.enabled !== false &&
        (mode.name.toLowerCase().includes(lowerQuery) ||
          mode.description.toLowerCase().includes(lowerQuery))
    );
  }

  /**
   * Check if a mode exists
   */
  hasMode(id: string): boolean {
    return this.modes.has(id);
  }

  /**
   * Get total number of registered modes
   */
  getModesCount(): number {
    return this.modes.size;
  }

  /**
   * Get modes sorted by a specific criterion
   */
  getSortedModes(
    sortBy: "name" | "difficulty" | "cost" = "name"
  ): GameMode[] {
    const modes = this.getEnabledModes();

    switch (sortBy) {
      case "name":
        return modes.sort((a, b) => a.name.localeCompare(b.name));
      case "difficulty":
        // Simple difficulty heuristic based on category
        const difficultyOrder: Record<GameModeCategory, number> = {
          relaxed: 1,
          "time-based": 2,
          difficulty: 3,
          challenge: 4,
          creative: 5,
        };
        return modes.sort(
          (a, b) => difficultyOrder[a.category] - difficultyOrder[b.category]
        );
      case "cost":
        return modes.sort((a, b) => a.continueCost - b.continueCost);
      default:
        return modes;
    }
  }

  /**
   * Unregister a game mode (useful for feature flags)
   */
  unregisterMode(id: string): boolean {
    return this.modes.delete(id);
  }

  /**
   * Clear all registered modes
   */
  clearAll(): void {
    this.modes.clear();
  }

  /**
   * Reload all modes from configuration
   */
  reload(): void {
    this.clearAll();
    this.registerAllModes();
  }
}

// Export singleton instance for convenience
export const gameModeRegistry = GameModeRegistry.getInstance();

// Utility functions for easy access
export function getGameMode(id: string): GameMode | undefined {
  return gameModeRegistry.getMode(id);
}

export function getGameModeOrDefault(id: string): GameMode {
  return gameModeRegistry.getModeOrDefault(id);
}

export function getAllGameModes(): GameMode[] {
  return gameModeRegistry.getAllModes();
}

export function getGameModesByCategory(category: GameModeCategory): GameMode[] {
  return gameModeRegistry.getModesByCategory(category);
}

export function getDefaultGameMode(): GameMode {
  return DEFAULT_GAME_MODE;
}
