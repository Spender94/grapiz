import { Piece, Position, AILevel } from '../types/game';
import { minimax } from '../ai/minimax';
import { generateBoard } from '../utils/boardUtils';
import { calculateValidMoves } from '../utils/pieceUtils';
import { evaluatePosition } from '../ai/evaluator';
import { calculateDistanceToCenter } from '../ai/evaluator';

const lastMoves: string[] = [];
const MAX_MOVES_HISTORY = 3;
const THINKING_TIME = 2000;

const AI_DEPTHS: Record<AILevel, number> = {
  'noob': 0,
  'gaspard': 3,
  'null': 0
};

export function useAI() {
  const calculateNoobMove = (pieces: Piece[]): { pieceId: string, position: Position } | null => {
    const redPieces = pieces.filter(p => p.player === 'red');
    const board = generateBoard();
    
    // Filtrer les pièces qui n'ont pas été jouées récemment
    const availablePieces = redPieces.filter(piece => {
      const moveCount = lastMoves.filter(id => id === piece.id).length;
      return moveCount === 0;
    });

    // Si toutes les pièces ont été jouées récemment, réinitialiser l'historique
    const piecesToUse = availablePieces.length > 0 ? availablePieces : redPieces;
    
    let bestScore = -Infinity;
    let bestMove = null;

    for (const piece of piecesToUse) {
      const validMoves = calculateValidMoves(piece, pieces, board);
      
      for (const move of validMoves) {
        let score = 0;

        // Bonus pour la capture
        const capturesPiece = pieces.some(p => 
          p.player === 'blue' && 
          p.position.x === move.x && 
          p.position.y === move.y
        );
        if (capturesPiece) {
          score += 1000; // Fort bonus pour la capture
        }

        // Bonus pour se rapprocher du centre
        const distanceToCenter = calculateDistanceToCenter(move);
        score += (4 - distanceToCenter) * 200; // Bonus important pour être proche du centre

        // Malus pour s'éloigner du centre
        const currentDistanceToCenter = calculateDistanceToCenter(piece.position);
        if (distanceToCenter > currentDistanceToCenter) {
          score -= 100; // Malus pour s'éloigner du centre
        }

        if (score > bestScore) {
          bestScore = score;
          bestMove = { pieceId: piece.id, position: move };
        }
      }
    }

    if (bestMove) {
      lastMoves.push(bestMove.pieceId);
      if (lastMoves.length > MAX_MOVES_HISTORY) {
        lastMoves.shift();
      }
    }

    return bestMove;
  };

  const calculateAIMove = async (pieces: Piece[], aiLevel: AILevel): Promise<{ pieceId: string, position: Position } | null> => {
    await new Promise(resolve => setTimeout(resolve, THINKING_TIME));

    if (aiLevel === 'noob') {
      return calculateNoobMove(pieces);
    }

    const depth = AI_DEPTHS[aiLevel || 'null'];
    const result = minimax(pieces, depth, -Infinity, Infinity, true, 'red');
    
    if (result.move) {
      lastMoves.push(result.move.pieceId);
      if (lastMoves.length > MAX_MOVES_HISTORY) {
        lastMoves.shift();
      }
      return result.move;
    }

    return null;
  };

  return { calculateAIMove };
}