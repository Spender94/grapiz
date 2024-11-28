import { Piece, Position, Player } from '../types/game';
import { isValidPosition, getNeighbors, arePositionsEqual } from './boardUtils';

export function getInitialPieces(): Piece[] {
  const pieces: Piece[] = [];
  let id = 1;

  // Position des pions selon la numérotation fournie
  const positions = [
    { pos: { x: 0, y: 0 }, player: 'red', id: 1 },
    { pos: { x: 1, y: 0 }, player: 'blue', id: 2 },
    { pos: { x: 2, y: 0 }, player: 'blue', id: 6 },
    
    { pos: { x: 0, y: 2 }, player: 'blue', id: 5 },
    { pos: { x: 1, y: 2 }, player: 'red', id: 4 },
    { pos: { x: 2, y: 2 }, player: 'red', id: 11 },
    
    { pos: { x: 4, y: 2 }, player: 'red', id: 35 },
    { pos: { x: 4, y: 1 }, player: 'blue', id: 26 },
    { pos: { x: 4, y: 3 }, player: 'blue', id: 43 },
    
    { pos: { x: 8, y: 4 }, player: 'blue', id: 61 },
    { pos: { x: 7, y: 4 }, player: 'red', id: 56 },
    { pos: { x: 6, y: 4 }, player: 'red', id: 60 },
    
    { pos: { x: 6, y: 6 }, player: 'red', id: 57 },
    { pos: { x: 7, y: 6 }, player: 'blue', id: 58 },
    { pos: { x: 8, y: 6 }, player: 'blue', id: 51 },
    
    { pos: { x: 2, y: 6 }, player: 'blue', id: 27 },
    { pos: { x: 1, y: 6 }, player: 'red', id: 19 },
    { pos: { x: 0, y: 6 }, player: 'red', id: 36 }
  ];

  positions.forEach(({ pos, player }) => {
    pieces.push({
      id: `piece-${id++}`,
      player,
      position: pos
    });
  });

  return pieces;
}

export function calculateValidMoves(
  piece: Piece,
  pieces: Piece[],
  board: Position[]
): Position[] {
  const validMoves: Position[] = [];
  const lines = findLines(piece.position, pieces);

  lines.forEach(line => {
    const moveLength = countPiecesOnLine(line, pieces);
    const possibleMoves = getPossibleMoves(piece.position, line, moveLength);
    
    possibleMoves.forEach(move => {
      if (isValidMove(move, piece.player, pieces, board)) {
        validMoves.push(move);
      }
    });
  });

  return validMoves;
}

function findLines(pos: Position, pieces: Piece[]): Position[][] {
  const directions = [
    { x: 1, y: 0 },   // Horizontal
    { x: 0, y: 1 },   // Vertical
    { x: 1, y: 1 },   // Diagonal
    { x: 1, y: -1 }   // Autre diagonal
  ];

  return directions.map(dir => {
    const line: Position[] = [];
    for (let i = -8; i <= 8; i++) {
      const checkPos = {
        x: pos.x + dir.x * i,
        y: pos.y + dir.y * i
      };
      if (isValidPosition(checkPos)) {
        line.push(checkPos);
      }
    }
    return line;
  });
}

function countPiecesOnLine(line: Position[], pieces: Piece[]): number {
  return line.filter(pos => 
    pieces.some(p => arePositionsEqual(p.position, pos))
  ).length;
}

function getPossibleMoves(
  start: Position,
  line: Position[],
  moveLength: number
): Position[] {
  const startIndex = line.findIndex(pos => 
    arePositionsEqual(pos, start)
  );
  
  const moves: Position[] = [];
  
  // Forward moves
  for (let i = 1; i <= moveLength; i++) {
    if (startIndex + i < line.length) {
      moves.push(line[startIndex + i]);
    }
  }
  
  // Backward moves
  for (let i = 1; i <= moveLength; i++) {
    if (startIndex - i >= 0) {
      moves.push(line[startIndex - i]);
    }
  }
  
  return moves;
}

function isValidMove(
  move: Position,
  player: Player,
  pieces: Piece[],
  board: Position[]
): boolean {
  // Vérifier si la position est sur le plateau
  if (!board.some(pos => arePositionsEqual(pos, move))) {
    return false;
  }

  // Vérifier si la case est vide ou contient un pion adverse
  const pieceAtPosition = pieces.find(p => 
    arePositionsEqual(p.position, move)
  );

  return !pieceAtPosition || pieceAtPosition.player !== player;
}

export function checkVictoryCondition(pieces: Piece[]): Player | 'draw' | null {
  const bluePieces = pieces.filter(p => p.player === 'blue');
  const redPieces = pieces.filter(p => p.player === 'red');

  const blueConnected = areAllPiecesConnected(bluePieces);
  const redConnected = areAllPiecesConnected(redPieces);

  if (blueConnected && redConnected) {
    return 'draw';
  } else if (blueConnected) {
    return 'blue';
  } else if (redConnected) {
    return 'red';
  }

  return null;
}

function areAllPiecesConnected(playerPieces: Piece[]): boolean {
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