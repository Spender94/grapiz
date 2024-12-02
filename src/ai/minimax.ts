import { Piece, Position, Player } from '../types/game';
import { calculateValidMoves } from '../utils/pieceUtils';
import { generateBoard, arePositionsEqual } from '../utils/boardUtils';
import { evaluatePosition } from './evaluator';
import { WEIGHTS } from './weights';
import { evaluateChain, isPartOfChain } from './chainEvaluator';

interface MinimaxResult {
  score: number;
  move?: { pieceId: string; position: Position };
}

function evaluateGameState(pieces: Piece[], currentPlayer: Player): number {
  let score = 0;
  const playerPieces = pieces.filter(p => p.player === currentPlayer);
  const opponentPieces = pieces.filter(p => p.player !== currentPlayer);

  // Évaluer la position de chaque pièce
  for (const piece of playerPieces) {
    score += evaluatePosition(piece.position, pieces, piece);
    
    // Bonus pour les chaînes formées
    if (isPartOfChain(piece, playerPieces)) {
      score += evaluateChain(piece.position, playerPieces) * 1.5;
    }
  }

  // Pénaliser les positions avantageuses de l'adversaire
  for (const piece of opponentPieces) {
    score -= evaluatePosition(piece.position, pieces, piece) * 0.8;
    
    // Pénaliser les chaînes adverses
    if (isPartOfChain(piece, opponentPieces)) {
      score -= evaluateChain(piece.position, opponentPieces);
    }
  }

  return score;
}

function orderMoves(piece: Piece, moves: Position[], pieces: Piece[]): Position[] {
  return moves.sort((a, b) => {
    const scoreA = evaluatePosition(a, pieces, piece);
    const scoreB = evaluatePosition(b, pieces, piece);
    return scoreB - scoreA;
  });
}

export function minimax(
  pieces: Piece[],
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean,
  currentPlayer: Player
): MinimaxResult {
  // Évaluation de la position finale
  if (depth === 0) {
    return { 
      score: evaluateGameState(pieces, isMaximizing ? currentPlayer : (currentPlayer === 'red' ? 'blue' : 'red'))
    };
  }

  const currentPieces = pieces.filter(p => p.player === currentPlayer);
  const board = generateBoard();

  if (isMaximizing) {
    let maxEval = -Infinity;
    let bestMove;

    for (const piece of currentPieces) {
      const validMoves = calculateValidMoves(piece, pieces, board);
      const orderedMoves = orderMoves(piece, validMoves, pieces);
      
      for (const move of orderedMoves) {
        const capturedPiece = pieces.find(p => 
          p.player !== currentPlayer && 
          arePositionsEqual(p.position, move)
        );

        const newPieces = pieces
          .filter(p => p !== capturedPiece)
          .map(p => p.id === piece.id ? { ...p, position: move } : p);

        const evalResult = minimax(
          newPieces,
          depth - 1,
          alpha,
          beta,
          false,
          currentPlayer === 'red' ? 'blue' : 'red'
        );

        if (evalResult.score > maxEval) {
          maxEval = evalResult.score;
          bestMove = { pieceId: piece.id, position: move };
        }

        alpha = Math.max(alpha, evalResult.score);
        if (beta <= alpha) break;
      }
    }

    return { score: maxEval, move: bestMove };
  } else {
    let minEval = Infinity;
    let bestMove;

    for (const piece of currentPieces) {
      const validMoves = calculateValidMoves(piece, pieces, board);
      const orderedMoves = orderMoves(piece, validMoves, pieces);
      
      for (const move of orderedMoves) {
        const capturedPiece = pieces.find(p => 
          p.player !== currentPlayer && 
          arePositionsEqual(p.position, move)
        );

        const newPieces = pieces
          .filter(p => p !== capturedPiece)
          .map(p => p.id === piece.id ? { ...p, position: move } : p);

        const evalResult = minimax(
          newPieces,
          depth - 1,
          alpha,
          beta,
          true,
          currentPlayer === 'red' ? 'blue' : 'red'
        );

        if (evalResult.score < minEval) {
          minEval = evalResult.score;
          bestMove = { pieceId: piece.id, position: move };
        }

        beta = Math.min(beta, evalResult.score);
        if (beta <= alpha) break;
      }
    }

    return { score: minEval, move: bestMove };
  }
}