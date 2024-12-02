import { Piece, Position } from '../types/game';
import { getNeighbors, arePositionsEqual } from '../utils/boardUtils';
import { calculateDistanceToCenter } from './evaluator';

export function evaluateChain(position: Position, alliedPieces: Piece[]): number {
  const visited = new Set<string>();
  let chainValue = 0;

  function dfs(pos: Position, depth: number) {
    const key = `${pos.x},${pos.y}`;
    if (visited.has(key)) return;
    
    visited.add(key);
    chainValue += (5 - calculateDistanceToCenter(pos)) * (5 - depth);

    const neighbors = getNeighbors(pos);
    neighbors.forEach(neighbor => {
      if (alliedPieces.some(p => arePositionsEqual(p.position, neighbor))) {
        dfs(neighbor, depth + 1);
      }
    });
  }

  dfs(position, 1);
  return chainValue;
}

export function evaluateEnemyChain(position: Position, enemyPieces: Piece[]): number {
  const neighbors = getNeighbors(position);
  const connectedEnemies = enemyPieces.filter(p => 
    neighbors.some(n => arePositionsEqual(n, p.position))
  );

  if (connectedEnemies.length < 2) return 0;

  const visited = new Set<string>();
  let chainStrength = 0;

  function dfs(pos: Position, depth: number) {
    const key = `${pos.x},${pos.y}`;
    if (visited.has(key)) return;
    
    visited.add(key);
    // Augmenter la valeur pour les chaînes plus courtes mais plus proches du centre
    chainStrength += (5 - calculateDistanceToCenter(pos)) * (4 - depth);

    const neighbors = getNeighbors(pos);
    neighbors.forEach(neighbor => {
      if (enemyPieces.some(p => arePositionsEqual(p.position, neighbor))) {
        dfs(neighbor, depth + 1);
      }
    });
  }

  connectedEnemies.forEach(enemy => {
    dfs(enemy.position, 1);
  });

  return chainStrength;
}

export function isPartOfChain(piece: Piece, pieces: Piece[]): boolean {
  const neighbors = getNeighbors(piece.position);
  const connectedPieces = pieces.filter(p =>
    p.id !== piece.id &&
    p.player === piece.player &&
    neighbors.some(n => arePositionsEqual(n, p.position))
  );

  if (connectedPieces.length < 2) return false;

  // Vérifier si les pièces connectées sont elles-mêmes connectées
  for (let i = 0; i < connectedPieces.length; i++) {
    for (let j = i + 1; j < connectedPieces.length; j++) {
      const pieceNeighbors = getNeighbors(connectedPieces[i].position);
      if (pieceNeighbors.some(n => arePositionsEqual(n, connectedPieces[j].position))) {
        return true;
      }
    }
  }

  return false;
}