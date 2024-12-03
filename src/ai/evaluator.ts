import { Piece, Position, Player } from '../types/game';
import { getNeighbors, arePositionsEqual } from '../utils/boardUtils';
import { WEIGHTS } from './weights';
import { evaluateChain, evaluateEnemyChain, isPartOfChain } from './chainEvaluator';
import { checkVictoryCondition } from '../utils/pieceUtils';

const CENTER = { x: 0, y: 0 };

export function calculateDistanceToCenter(pos: Position): number {
  return Math.abs(pos.x - CENTER.x) + Math.abs(pos.y - CENTER.y);
}

export function evaluatePosition(position: Position, pieces: Piece[], piece: Piece): number {
  let score = 0;
  const alliedPieces = pieces.filter(p => p.player === piece.player);
  const enemyPieces = pieces.filter(p => p.player !== piece.player);
  
  // Vérifier si le coup est gagnant
  const simulatedPieces = pieces
    .filter(p => !arePositionsEqual(p.position, position))
    .map(p => p.id === piece.id ? { ...p, position } : p);
  
  const victoryResult = checkVictoryCondition(simulatedPieces);
  if (victoryResult === piece.player) {
    return WEIGHTS.WINNING_POSITION;
  } else if (victoryResult === (piece.player === 'red' ? 'blue' : 'red')) {
    return WEIGHTS.LOSING_POSITION;
  }

  // Distance au centre
  const distanceFromCenter = calculateDistanceToCenter(position);
  score += (4 - distanceFromCenter) * WEIGHTS.CENTER_POSITION;

  // Contrôle du centre
  if (distanceFromCenter <= 2) {
    score += WEIGHTS.CENTRAL_CONTROL;
  }

  // Connexions avec les alliés
  const neighbors = getNeighbors(position);
  const connectedAllies = alliedPieces.filter(p => 
    neighbors.some(n => arePositionsEqual(n, p.position))
  );
  score += connectedAllies.length * WEIGHTS.CONNECTED_ALLIES;

  // Formation de chaînes
  if (connectedAllies.length >= 2) {
    const chainBonus = evaluateChain(position, alliedPieces);
    score += chainBonus * WEIGHTS.CHAIN_FORMATION;
  }

  // Évaluation des captures
  const captureTarget = enemyPieces.find(p => arePositionsEqual(p.position, position));
  if (captureTarget) {
    // Vérifier si la pièce fait partie d'une chaîne ennemie
    if (isPartOfChain(captureTarget, enemyPieces)) {
      const chainStrength = evaluateEnemyChain(position, enemyPieces);
      score += chainStrength * WEIGHTS.BREAK_CHAIN_BONUS;
    } else {
      // Capture simple - bonus réduit si la pièce n'est pas dans une chaîne
      score += WEIGHTS.CAPTURE_BONUS * 0.3;
    }
  }

  // Protection des alliés menacés
  const alliesNeedingProtection = alliedPieces.filter(ally => {
    const allyNeighbors = getNeighbors(ally.position);
    const enemyThreats = enemyPieces.filter(enemy =>
      allyNeighbors.some(n => arePositionsEqual(n, enemy.position))
    );
    return enemyThreats.length >= 2;
  });

  if (alliesNeedingProtection.length > 0) {
    score += WEIGHTS.PROTECTION_BONUS;
  }

  // Bonus pour les mouvements qui rapprochent du centre
  if (distanceFromCenter < calculateDistanceToCenter(piece.position)) {
    score += WEIGHTS.CENTER_POSITION * 0.5;
  }

  return score;
}