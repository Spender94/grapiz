import { useState, useCallback } from 'react';
import { GameState, Position, ChatMessage, Move, Player } from '../types/game';
import { getInitialPieces, checkVictoryCondition } from '../utils/pieceUtils';
import { calculateValidMoves } from '../utils/pieceUtils';
import { generateBoard, arePositionsEqual } from '../utils/boardUtils';
import { v4 as uuidv4 } from 'uuid';

export function useGameState() {
  // ... [Previous state and handlers remain the same until handleHexClick]

  const handleHexClick = useCallback((position: Position, sendMove: (gameId: string, move: Move) => void) => {
    setGameState(prev => {
      if (!prev.selectedPiece || !prev.validMoves.some(move => 
        arePositionsEqual(move, position)
      )) {
        return prev;
      }

      const move: Move = {
        pieceId: prev.selectedPiece.id,
        from: prev.selectedPiece.position,
        to: position
      };

      const newPieces = prev.pieces
        .filter(p => !arePositionsEqual(p.position, position))
        .map(p => p.id === prev.selectedPiece!.id ? { ...p, position } : p);

      // Check victory condition after move
      const victoryResult = checkVictoryCondition(newPieces);

      if (prev.gameId) {
        sendMove(prev.gameId, move);
      }

      return {
        ...prev,
        pieces: newPieces,
        currentPlayer: prev.currentPlayer === 'blue' ? 'red' : 'blue',
        selectedPiece: null,
        validMoves: [],
        gameStatus: victoryResult ? 'finished' : prev.gameStatus,
        winner: victoryResult === 'draw' ? null : victoryResult
      };
    });
  }, []);

  // ... [Rest of the code remains the same]

  return {
    gameState,
    setGameState,
    handleTimeEnd,
    handleGameStart,
    handleOpponentMove,
    handlePieceClick,
    handleHexClick,
    handleChatMessage,
    handleGameEnd
  };
}