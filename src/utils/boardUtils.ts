import { Position } from '../types/game';

export function generateBoard(): Position[] {
  const positions: Position[] = [];
  const size = 4; // Taille du plateau (distance du centre au bord)
  let currentPosition = 1;

  // Parcourir l'hexagone en utilisant les coordonnées axiales avec rotation de 90°
  for (let r = -size; r <= size; r++) {
    const q1 = Math.max(-size, -r - size);
    const q2 = Math.min(size, -r + size);
    
    for (let q = q1; q <= q2; q++) {
      positions.push({
        x: q,
        y: r,
        index: currentPosition++
      } as Position & { index: number });
    }
  }

  return positions;
}

export function getPositionFromIndex(index: number): Position | undefined {
  return generateBoard().find(pos => (pos as any).index === index);
}

export function isValidPosition(pos: Position): boolean {
  const size = 4;
  const s = -pos.x - pos.y; // Coordonnée s calculée
  return Math.abs(pos.x) <= size && 
         Math.abs(pos.y) <= size && 
         Math.abs(s) <= size;
}

export function getNeighbors(pos: Position): Position[] {
  const directions = [
    { x: 1, y: 0 },   // Est
    { x: 0, y: 1 },   // Sud-Est
    { x: -1, y: 1 },  // Sud-Ouest
    { x: -1, y: 0 },  // Ouest
    { x: 0, y: -1 },  // Nord-Ouest
    { x: 1, y: -1 }   // Nord-Est
  ];

  return directions
    .map(dir => ({
      x: pos.x + dir.x,
      y: pos.y + dir.y
    }))
    .filter(isValidPosition);
}

export function arePositionsEqual(pos1: Position, pos2: Position): boolean {
  return pos1.x === pos2.x && pos1.y === pos2.y;
}