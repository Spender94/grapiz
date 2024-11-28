import { Position } from '../types/game';

export const BOARD_SIZE = 5; // Nombre de cases sur chaque côté de l'hexagone

export function generateHexagonalBoard(): Position[] {
  const positions: Position[] = [];
  const center = BOARD_SIZE - 1;

  for (let q = -BOARD_SIZE + 1; q < BOARD_SIZE; q++) {
    for (let r = -BOARD_SIZE + 1; r < BOARD_SIZE; r++) {
      const s = -q - r;
      if (Math.abs(q) + Math.abs(r) + Math.abs(s) <= BOARD_SIZE * 2) {
        positions.push({ x: q + center, y: r + center });
      }
    }
  }

  return positions;
}

export function getInitialPieces() {
  const corners = [
    { x: 0, y: 0 }, { x: 8, y: 0 },
    { x: 0, y: 8 }, { x: 8, y: 8 },
    { x: 4, y: 0 }, { x: 4, y: 8 }
  ];

  const pieces = [];
  let id = 0;

  corners.forEach((corner, index) => {
    const isEvenCorner = index % 2 === 0;
    const centerPieceColor = isEvenCorner ? 'blue' : 'red';
    const surroundingColor = isEvenCorner ? 'red' : 'blue';

    // Centre
    pieces.push({
      id: `piece-${id++}`,
      player: centerPieceColor,
      position: { x: corner.x, y: corner.y }
    });

    // Pièces environnantes
    if (corner.x === 4) {
      pieces.push({
        id: `piece-${id++}`,
        player: surroundingColor,
        position: { x: corner.x - 1, y: corner.y }
      });
      pieces.push({
        id: `piece-${id++}`,
        player: surroundingColor,
        position: { x: corner.x + 1, y: corner.y }
      });
    } else {
      pieces.push({
        id: `piece-${id++}`,
        player: surroundingColor,
        position: { x: corner.x, y: corner.y - 1 }
      });
      pieces.push({
        id: `piece-${id++}`,
        player: surroundingColor,
        position: { x: corner.x, y: corner.y + 1 }
      });
    }
  });

  return pieces;
}

export function calculateValidMoves(
  piece: Position,
  pieces: Position[],
  board: Position[]
): Position[] {
  // TODO: Implémenter la logique de calcul des mouvements valides
  return [];
}