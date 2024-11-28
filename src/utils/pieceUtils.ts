import { Piece, Position, Player } from '../types/game';
import { isValidPosition, getNeighbors, arePositionsEqual, getPositionFromIndex } from './boardUtils';

export function getInitialPieces(): Piece[] {
  const piecePositions = [
    { index: 1, player: 'red' },    // Groupe 1
    { index: 2, player: 'blue' },
    { index: 6, player: 'blue' },

    { index: 5, player: 'blue' },   // Groupe 2
    { index: 4, player: 'red' },
    { index: 11, player: 'red' },

    { index: 35, player: 'red' },   // Groupe 3
    { index: 26, player: 'blue' },
    { index: 43, player: 'blue' },

    { index: 61, player: 'blue' },  // Groupe 4
    { index: 56, player: 'red' },
    { index: 60, player: 'red' },

    { index: 57, player: 'red' },   // Groupe 5
    { index: 58, player: 'blue' },
    { index: 51, player: 'blue' },

    { index: 27, player: 'blue' },  // Groupe 6
    { index: 19, player: 'red' },
    { index: 36, player: 'red' }
  ];

  return piecePositions.map((piece, idx) => {
    const position = getPositionFromIndex(piece.index);
    if (!position) {
      throw new Error(`Invalid position index: ${piece.index}`);
    }
    return {
      id: `piece-${idx + 1}`,
      player: piece.player,
      position
    };
  });
}

export function calculateValidMoves(
  piece: Piece,
  pieces: Piece[],
  board: Position[]
): Position[] {
  const validMoves: Position[] = [];
  const lines = findAllLines(piece.position, board);

  lines.forEach(line => {
    const piecesInLine = countPiecesInLine(line, pieces);
    if (piecesInLine > 0) {
      const possibleMoves = getPossibleMovesInLine(piece, line, piecesInLine, pieces);
      validMoves.push(...possibleMoves);
    }
  });

  return validMoves.filter(move => 
    isValidPosition(move) && 
    !pieces.some(p => 
      p.player === piece.player && 
      arePositionsEqual(p.position, move)
    )
  );
}

function findAllLines(pos: Position, board: Position[]): Position[][] {
  const lines: Position[][] = [];
  
  // Directions valides pour un plateau hexagonal
  const directions = [
    { x: 1, y: 0 },    // Est
    { x: 0, y: 1 },    // Sud-Est
    { x: -1, y: 1 },   // Sud-Ouest
    { x: -1, y: 0 },   // Ouest
    { x: 0, y: -1 },   // Nord-Ouest
    { x: 1, y: -1 }    // Nord-Est
  ];

  directions.forEach(dir => {
    const line: Position[] = [];
    line.push({ ...pos });
    
    // Explorer dans la direction positive
    let current = { x: pos.x + dir.x, y: pos.y + dir.y };
    while (board.some(p => arePositionsEqual(p, current))) {
      line.push({ ...current });
      current = { x: current.x + dir.x, y: current.y + dir.y };
    }
    
    // Explorer dans la direction opposée
    current = { x: pos.x - dir.x, y: pos.y - dir.y };
    while (board.some(p => arePositionsEqual(p, current))) {
      line.unshift({ ...current });
      current = { x: current.x - dir.x, y: current.y - dir.y };
    }

    if (line.length > 1) {
      lines.push(line);
    }
  });

  return lines;
}

function countPiecesInLine(line: Position[], pieces: Piece[]): number {
  return line.reduce((count, pos) => {
    const hasPiece = pieces.some(p => arePositionsEqual(p.position, pos));
    return hasPiece ? count + 1 : count;
  }, 0);
}

function getPossibleMovesInLine(
  piece: Piece,
  line: Position[],
  moveCount: number,
  pieces: Piece[]
): Position[] {
  const moves: Position[] = [];
  const pieceIndex = line.findIndex(pos => arePositionsEqual(pos, piece.position));
  
  // Vérifier les mouvements dans les deux directions
  for (let direction = -1; direction <= 1; direction += 2) {
    let currentIndex = pieceIndex + (direction * moveCount);
    
    // Vérifier si la position cible est valide
    if (currentIndex >= 0 && currentIndex < line.length) {
      const targetPos = line[currentIndex];
      
      // Vérifier s'il y a des obstacles sur le chemin
      let blocked = false;
      for (let i = pieceIndex + direction; i !== currentIndex; i += direction) {
        const pieceAtPos = pieces.find(p => arePositionsEqual(p.position, line[i]));
        if (pieceAtPos && pieceAtPos.player !== piece.player) {
          blocked = true;
          break;
        }
      }
      
      if (!blocked) {
        const pieceAtTarget = pieces.find(p => arePositionsEqual(p.position, targetPos));
        if (!pieceAtTarget || pieceAtTarget.player !== piece.player) {
          moves.push(targetPos);
        }
      }
    }
  }

  return moves;
}

export function isPieceConnectedToGroup(
  piece: Piece,
  pieces: Piece[]
): boolean {
  const visited = new Set<string>();
  const toVisit = [piece];

  while (toVisit.length > 0) {
    const current = toVisit.pop()!;
    
    if (visited.has(current.id)) continue;
    visited.add(current.id);

    const neighbors = getNeighbors(current.position);
    const connectedPieces = pieces.filter(p => 
      p.player === piece.player &&
      neighbors.some(n => arePositionsEqual(n, p.position))
    );

    toVisit.push(...connectedPieces);
  }

  return pieces
    .filter(p => p.player === piece.player)
    .every(p => visited.has(p.id));
}