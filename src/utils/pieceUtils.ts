import { Piece, Position, Player } from '../types/game';
import { isValidPosition, getNeighbors, arePositionsEqual, getPositionFromIndex } from './boardUtils';

// ... [Previous code remains the same until isPieceConnectedToGroup]

export function checkVictoryCondition(pieces: Piece[]): Player | 'draw' | null {
  const bluePieces = pieces.filter(p => p.player === 'blue');
  const redPieces = pieces.filter(p => p.player === 'red');

  const blueConnected = areAllPiecesConnected(bluePieces, pieces);
  const redConnected = areAllPiecesConnected(redPieces, pieces);

  if (blueConnected && redConnected) {
    return 'draw';
  } else if (blueConnected) {
    return 'blue';
  } else if (redConnected) {
    return 'red';
  }

  return null;
}

function areAllPiecesConnected(playerPieces: Piece[], allPieces: Piece[]): boolean {
  if (playerPieces.length === 0) return false;

  const visited = new Set<string>();
  const toVisit = [playerPieces[0]];

  while (toVisit.length > 0) {
    const current = toVisit.pop()!;
    if (visited.has(current.id)) continue;
    
    visited.add(current.id);
    const neighbors = getNeighbors(current.position);
    
    const connectedPieces = playerPieces.filter(p => 
      !visited.has(p.id) && 
      neighbors.some(n => arePositionsEqual(n, p.position))
    );

    toVisit.push(...connectedPieces);
  }

  return visited.size === playerPieces.length;
}

// ... [Rest of the previous code remains the same]