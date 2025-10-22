/**
 * Pattern Generation for Pattern Mode
 * Generates boards with recognizable mine patterns
 */

import { Position, DifficultyConfig } from "@/types/game";

export type PatternType =
  | "horizontal_line"
  | "vertical_line"
  | "diagonal_line"
  | "square"
  | "diamond"
  | "cross"
  | "circle"
  | "checkerboard"
  | "symmetry_horizontal"
  | "symmetry_vertical"
  | "symmetry_diagonal"
  | "spiral"
  | "perimeter"
  | "random_clusters";

export interface PatternConfig {
  type: PatternType;
  density: number; // 0-1, how filled the pattern is
  size: number; // Size parameter for the pattern
}

export class PatternGenerator {
  private width: number;
  private height: number;
  private targetMineCount: number;

  constructor(config: DifficultyConfig) {
    this.width = config.width;
    this.height = config.height;
    this.targetMineCount = config.mines;
  }

  /**
   * Generate a board with a specific pattern
   */
  generatePattern(patternType: PatternType): Position[] {
    const minePositions: Position[] = [];

    switch (patternType) {
      case "horizontal_line":
        minePositions.push(...this.generateHorizontalLines());
        break;
      case "vertical_line":
        minePositions.push(...this.generateVerticalLines());
        break;
      case "diagonal_line":
        minePositions.push(...this.generateDiagonalLines());
        break;
      case "square":
        minePositions.push(...this.generateSquares());
        break;
      case "diamond":
        minePositions.push(...this.generateDiamonds());
        break;
      case "cross":
        minePositions.push(...this.generateCrosses());
        break;
      case "circle":
        minePositions.push(...this.generateCircles());
        break;
      case "checkerboard":
        minePositions.push(...this.generateCheckerboard());
        break;
      case "symmetry_horizontal":
        minePositions.push(...this.generateHorizontalSymmetry());
        break;
      case "symmetry_vertical":
        minePositions.push(...this.generateVerticalSymmetry());
        break;
      case "symmetry_diagonal":
        minePositions.push(...this.generateDiagonalSymmetry());
        break;
      case "spiral":
        minePositions.push(...this.generateSpiral());
        break;
      case "perimeter":
        minePositions.push(...this.generatePerimeter());
        break;
      case "random_clusters":
        minePositions.push(...this.generateRandomClusters());
        break;
    }

    // Adjust to target mine count
    return this.adjustMineCount(minePositions);
  }

  /**
   * Generate random pattern (mixed patterns)
   */
  generateRandomPattern(): Position[] {
    const patterns: PatternType[] = [
      "horizontal_line",
      "vertical_line",
      "diagonal_line",
      "square",
      "diamond",
      "cross",
    ];

    const randomPattern = patterns[Math.floor(Math.random() * patterns.length)];
    return this.generatePattern(randomPattern);
  }

  /**
   * Horizontal lines pattern
   */
  private generateHorizontalLines(): Position[] {
    const positions: Position[] = [];
    const spacing = Math.max(2, Math.floor(this.height / 5));

    for (let y = spacing; y < this.height; y += spacing) {
      for (let x = 0; x < this.width; x++) {
        positions.push({ x, y });
      }
    }

    return positions;
  }

  /**
   * Vertical lines pattern
   */
  private generateVerticalLines(): Position[] {
    const positions: Position[] = [];
    const spacing = Math.max(2, Math.floor(this.width / 5));

    for (let x = spacing; x < this.width; x += spacing) {
      for (let y = 0; y < this.height; y++) {
        positions.push({ x, y });
      }
    }

    return positions;
  }

  /**
   * Diagonal lines pattern
   */
  private generateDiagonalLines(): Position[] {
    const positions: Position[] = [];

    // Main diagonal
    for (let i = 0; i < Math.min(this.width, this.height); i++) {
      positions.push({ x: i, y: i });
    }

    // Anti-diagonal
    for (let i = 0; i < Math.min(this.width, this.height); i++) {
      positions.push({ x: i, y: this.height - 1 - i });
    }

    // Parallel diagonals
    const spacing = 3;
    for (let offset = spacing; offset < Math.max(this.width, this.height); offset += spacing) {
      // Upper parallels
      for (let i = 0; i < Math.min(this.width, this.height); i++) {
        if (i + offset < this.width) {
          positions.push({ x: i + offset, y: i });
        }
        if (i + offset < this.height) {
          positions.push({ x: i, y: i + offset });
        }
      }
    }

    return positions;
  }

  /**
   * Squares pattern
   */
  private generateSquares(): Position[] {
    const positions: Position[] = [];
    const squareSize = Math.max(3, Math.floor(Math.min(this.width, this.height) / 4));
    const spacing = squareSize + 2;

    for (let startY = 1; startY < this.height - squareSize; startY += spacing) {
      for (let startX = 1; startX < this.width - squareSize; startX += spacing) {
        // Top and bottom edges
        for (let x = startX; x < startX + squareSize; x++) {
          positions.push({ x, y: startY });
          positions.push({ x, y: startY + squareSize - 1 });
        }
        // Left and right edges
        for (let y = startY; y < startY + squareSize; y++) {
          positions.push({ x: startX, y });
          positions.push({ x: startX + squareSize - 1, y });
        }
      }
    }

    return positions;
  }

  /**
   * Diamonds pattern
   */
  private generateDiamonds(): Position[] {
    const positions: Position[] = [];
    const centerX = Math.floor(this.width / 2);
    const centerY = Math.floor(this.height / 2);
    const maxRadius = Math.floor(Math.min(this.width, this.height) / 3);

    for (let radius = 2; radius <= maxRadius; radius += 3) {
      for (let x = 0; x < this.width; x++) {
        for (let y = 0; y < this.height; y++) {
          const distance = Math.abs(x - centerX) + Math.abs(y - centerY);
          if (distance === radius) {
            positions.push({ x, y });
          }
        }
      }
    }

    return positions;
  }

  /**
   * Crosses pattern
   */
  private generateCrosses(): Position[] {
    const positions: Position[] = [];
    const centerX = Math.floor(this.width / 2);
    const centerY = Math.floor(this.height / 2);

    // Vertical line
    for (let y = 0; y < this.height; y++) {
      positions.push({ x: centerX, y });
    }

    // Horizontal line
    for (let x = 0; x < this.width; x++) {
      positions.push({ x, y: centerY });
    }

    // Additional crosses at quarters
    const quarterX = Math.floor(this.width / 4);

    for (let y = 0; y < this.height; y++) {
      positions.push({ x: quarterX, y });
      positions.push({ x: this.width - quarterX - 1, y });
    }

    return positions;
  }

  /**
   * Circles pattern
   */
  private generateCircles(): Position[] {
    const positions: Position[] = [];
    const centerX = Math.floor(this.width / 2);
    const centerY = Math.floor(this.height / 2);
    const maxRadius = Math.floor(Math.min(this.width, this.height) / 3);

    for (let radius = 2; radius <= maxRadius; radius += 3) {
      for (let x = 0; x < this.width; x++) {
        for (let y = 0; y < this.height; y++) {
          const distance = Math.sqrt(
            Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2)
          );
          if (Math.abs(distance - radius) < 0.6) {
            positions.push({ x, y });
          }
        }
      }
    }

    return positions;
  }

  /**
   * Checkerboard pattern
   */
  private generateCheckerboard(): Position[] {
    const positions: Position[] = [];

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if ((x + y) % 2 === 0) {
          positions.push({ x, y });
        }
      }
    }

    return positions;
  }

  /**
   * Horizontal symmetry pattern
   */
  private generateHorizontalSymmetry(): Position[] {
    const positions: Position[] = [];
    const halfHeight = Math.floor(this.height / 2);

    // Generate random positions in top half
    const topHalfCount = Math.floor(this.targetMineCount / 2);
    for (let i = 0; i < topHalfCount; i++) {
      const x = Math.floor(Math.random() * this.width);
      const y = Math.floor(Math.random() * halfHeight);
      positions.push({ x, y });
      // Mirror to bottom half
      positions.push({ x, y: this.height - 1 - y });
    }

    return positions;
  }

  /**
   * Vertical symmetry pattern
   */
  private generateVerticalSymmetry(): Position[] {
    const positions: Position[] = [];
    const halfWidth = Math.floor(this.width / 2);

    // Generate random positions in left half
    const leftHalfCount = Math.floor(this.targetMineCount / 2);
    for (let i = 0; i < leftHalfCount; i++) {
      const x = Math.floor(Math.random() * halfWidth);
      const y = Math.floor(Math.random() * this.height);
      positions.push({ x, y });
      // Mirror to right half
      positions.push({ x: this.width - 1 - x, y });
    }

    return positions;
  }

  /**
   * Diagonal symmetry pattern
   */
  private generateDiagonalSymmetry(): Position[] {
    const positions: Position[] = [];
    const halfCount = Math.floor(this.targetMineCount / 2);

    for (let i = 0; i < halfCount; i++) {
      const x = Math.floor(Math.random() * this.width);
      const y = Math.floor(Math.random() * this.height);
      positions.push({ x, y });
      // Mirror across main diagonal
      if (x < this.height && y < this.width) {
        positions.push({ x: y, y: x });
      }
    }

    return positions;
  }

  /**
   * Spiral pattern
   */
  private generateSpiral(): Position[] {
    const positions: Position[] = [];
    const centerX = Math.floor(this.width / 2);
    const centerY = Math.floor(this.height / 2);

    let x = centerX;
    let y = centerY;
    let dx = 0;
    let dy = -1;
    let steps = 1;
    let stepCount = 0;
    let changeCount = 0;

    for (let i = 0; i < this.width * this.height; i++) {
      if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
        if (i % 2 === 0) {
          positions.push({ x, y });
        }
      }

      x += dx;
      y += dy;
      stepCount++;

      if (stepCount === steps) {
        stepCount = 0;
        changeCount++;

        // Turn right
        const temp = dx;
        dx = -dy;
        dy = temp;

        if (changeCount === 2) {
          changeCount = 0;
          steps++;
        }
      }

      if (Math.abs(x - centerX) > this.width || Math.abs(y - centerY) > this.height) {
        break;
      }
    }

    return positions;
  }

  /**
   * Perimeter pattern
   */
  private generatePerimeter(): Position[] {
    const positions: Position[] = [];

    // Top and bottom edges
    for (let x = 0; x < this.width; x++) {
      positions.push({ x, y: 0 });
      positions.push({ x, y: this.height - 1 });
    }

    // Left and right edges
    for (let y = 1; y < this.height - 1; y++) {
      positions.push({ x: 0, y });
      positions.push({ x: this.width - 1, y });
    }

    return positions;
  }

  /**
   * Random clusters pattern
   */
  private generateRandomClusters(): Position[] {
    const positions: Position[] = [];
    const clusterCount = Math.max(3, Math.floor(this.targetMineCount / 8));
    const minesPerCluster = Math.floor(this.targetMineCount / clusterCount);

    for (let i = 0; i < clusterCount; i++) {
      const centerX = Math.floor(Math.random() * this.width);
      const centerY = Math.floor(Math.random() * this.height);

      for (let j = 0; j < minesPerCluster; j++) {
        const offsetX = Math.floor(Math.random() * 5) - 2;
        const offsetY = Math.floor(Math.random() * 5) - 2;
        const x = Math.max(0, Math.min(this.width - 1, centerX + offsetX));
        const y = Math.max(0, Math.min(this.height - 1, centerY + offsetY));
        positions.push({ x, y });
      }
    }

    return positions;
  }

  /**
   * Adjust mine count to match target
   */
  private adjustMineCount(positions: Position[]): Position[] {
    // Remove duplicates
    const uniquePositions = this.removeDuplicates(positions);

    if (uniquePositions.length === this.targetMineCount) {
      return uniquePositions;
    }

    if (uniquePositions.length < this.targetMineCount) {
      // Add random mines to reach target
      const needed = this.targetMineCount - uniquePositions.length;
      const allPositions = new Set(
        uniquePositions.map((p) => `${p.x},${p.y}`)
      );

      for (let i = 0; i < needed * 10 && uniquePositions.length < this.targetMineCount; i++) {
        const x = Math.floor(Math.random() * this.width);
        const y = Math.floor(Math.random() * this.height);
        const key = `${x},${y}`;

        if (!allPositions.has(key)) {
          uniquePositions.push({ x, y });
          allPositions.add(key);
        }
      }
    } else {
      // Remove random mines to reach target
      while (uniquePositions.length > this.targetMineCount) {
        const randomIndex = Math.floor(Math.random() * uniquePositions.length);
        uniquePositions.splice(randomIndex, 1);
      }
    }

    return uniquePositions;
  }

  /**
   * Remove duplicate positions
   */
  private removeDuplicates(positions: Position[]): Position[] {
    const seen = new Set<string>();
    const unique: Position[] = [];

    for (const pos of positions) {
      const key = `${pos.x},${pos.y}`;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(pos);
      }
    }

    return unique;
  }

  /**
   * Get pattern description
   */
  static getPatternDescription(type: PatternType): string {
    const descriptions: Record<PatternType, string> = {
      horizontal_line: "Mines arranged in horizontal lines",
      vertical_line: "Mines arranged in vertical lines",
      diagonal_line: "Mines arranged diagonally",
      square: "Mines forming square patterns",
      diamond: "Mines forming diamond patterns",
      cross: "Mines forming cross patterns",
      circle: "Mines forming circular patterns",
      checkerboard: "Mines in checkerboard pattern",
      symmetry_horizontal: "Mines with horizontal symmetry",
      symmetry_vertical: "Mines with vertical symmetry",
      symmetry_diagonal: "Mines with diagonal symmetry",
      spiral: "Mines in spiral pattern",
      perimeter: "Mines around the edges",
      random_clusters: "Mines in random clusters",
    };

    return descriptions[type] || "Unknown pattern";
  }
}

/**
 * Create a pattern generator
 */
export function createPatternGenerator(
  config: DifficultyConfig
): PatternGenerator {
  return new PatternGenerator(config);
}

/**
 * Get random pattern type
 */
export function getRandomPatternType(): PatternType {
  const patterns: PatternType[] = [
    "horizontal_line",
    "vertical_line",
    "diagonal_line",
    "square",
    "diamond",
    "cross",
    "circle",
    "symmetry_horizontal",
    "symmetry_vertical",
    "symmetry_diagonal",
    "spiral",
  ];

  return patterns[Math.floor(Math.random() * patterns.length)];
}
