/**
 * Core game logic for Minesweeper
 * Includes mine placement, adjacent mine calculation, and flood fill algorithm
 */

import { CellState, DifficultyConfig, Position } from '@/types/game';
import { DIRECTIONS } from './constants';

/**
 * Creates an empty game board with all cells unrevealed and no mines
 */
export function createEmptyBoard(width: number, height: number): CellState[][] {
  const board: CellState[][] = [];

  for (let y = 0; y < height; y++) {
    board[y] = [];
    for (let x = 0; x < width; x++) {
      board[y][x] = {
        isMine: false,
        isRevealed: false,
        isFlagged: false,
        adjacentMines: 0,
        x,
        y,
      };
    }
  }

  return board;
}

/**
 * Places mines randomly on the board, ensuring the first click position is safe
 * This guarantees the first click never hits a mine
 */
export function placeMines(
  board: CellState[][],
  config: DifficultyConfig,
  firstClickPos: Position
): CellState[][] {
  const { width, height, mines } = config;
  const newBoard = board.map(row => row.map(cell => ({ ...cell })));

  let minesPlaced = 0;
  const excludedPositions = new Set<string>();

  // Exclude first click position and its neighbors
  excludedPositions.add(`${firstClickPos.x},${firstClickPos.y}`);
  for (const [dx, dy] of DIRECTIONS) {
    const nx = firstClickPos.x + dx;
    const ny = firstClickPos.y + dy;
    if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
      excludedPositions.add(`${nx},${ny}`);
    }
  }

  // Randomly place mines
  while (minesPlaced < mines) {
    const x = Math.floor(Math.random() * width);
    const y = Math.floor(Math.random() * height);
    const posKey = `${x},${y}`;

    if (!newBoard[y][x].isMine && !excludedPositions.has(posKey)) {
      newBoard[y][x].isMine = true;
      minesPlaced++;
    }
  }

  // Calculate adjacent mines for all cells
  return calculateAdjacentMines(newBoard);
}

/**
 * Calculates the number of adjacent mines for each cell
 */
export function calculateAdjacentMines(board: CellState[][]): CellState[][] {
  const height = board.length;
  const width = board[0].length;
  const newBoard = board.map(row => row.map(cell => ({ ...cell })));

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (!newBoard[y][x].isMine) {
        let count = 0;

        for (const [dx, dy] of DIRECTIONS) {
          const nx = x + dx;
          const ny = y + dy;

          if (
            nx >= 0 && nx < width &&
            ny >= 0 && ny < height &&
            newBoard[ny][nx].isMine
          ) {
            count++;
          }
        }

        newBoard[y][x].adjacentMines = count;
      }
    }
  }

  return newBoard;
}

/**
 * Reveals a cell and recursively reveals adjacent empty cells (flood fill)
 * Returns the updated board and the number of newly revealed cells
 */
export function revealCell(
  board: CellState[][],
  x: number,
  y: number
): { board: CellState[][]; revealedCount: number } {
  const height = board.length;
  const width = board[0].length;
  const newBoard = board.map(row => row.map(cell => ({ ...cell })));
  let revealedCount = 0;

  // Helper function for flood fill
  const floodFill = (cx: number, cy: number) => {
    // Boundary check
    if (cx < 0 || cx >= width || cy < 0 || cy >= height) {
      return;
    }

    const cell = newBoard[cy][cx];

    // Skip if already revealed, flagged, or is a mine
    if (cell.isRevealed || cell.isFlagged || cell.isMine) {
      return;
    }

    // Reveal the cell
    cell.isRevealed = true;
    revealedCount++;

    // If the cell has no adjacent mines, recursively reveal neighbors
    if (cell.adjacentMines === 0) {
      for (const [dx, dy] of DIRECTIONS) {
        floodFill(cx + dx, cy + dy);
      }
    }
  };

  floodFill(x, y);

  return { board: newBoard, revealedCount };
}

/**
 * Toggles the flag state of a cell
 */
export function toggleFlag(board: CellState[][], x: number, y: number): CellState[][] {
  const newBoard = board.map(row => row.map(cell => ({ ...cell })));
  const cell = newBoard[y][x];

  if (!cell.isRevealed) {
    cell.isFlagged = !cell.isFlagged;
  }

  return newBoard;
}

/**
 * Reveals all mines on the board (for game over state)
 */
export function revealAllMines(board: CellState[][]): CellState[][] {
  return board.map(row =>
    row.map(cell => ({
      ...cell,
      isRevealed: cell.isMine ? true : cell.isRevealed,
    }))
  );
}

/**
 * Checks if the player has won the game
 * Win condition: all non-mine cells are revealed
 */
export function checkWinCondition(
  board: CellState[][],
  totalCells: number,
  mineCount: number,
  revealedCount: number
): boolean {
  const nonMineCells = totalCells - mineCount;
  return revealedCount === nonMineCells;
}

/**
 * Counts the number of flags placed on the board
 */
export function countFlags(board: CellState[][]): number {
  let count = 0;

  for (const row of board) {
    for (const cell of row) {
      if (cell.isFlagged) {
        count++;
      }
    }
  }

  return count;
}

/**
 * Gets all cell positions around a given position
 */
export function getAdjacentPositions(
  x: number,
  y: number,
  width: number,
  height: number
): Position[] {
  const positions: Position[] = [];

  for (const [dx, dy] of DIRECTIONS) {
    const nx = x + dx;
    const ny = y + dy;

    if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
      positions.push({ x: nx, y: ny });
    }
  }

  return positions;
}
