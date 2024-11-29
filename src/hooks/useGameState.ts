import { useState, useCallback } from 'react';
import { GameState, Position, ChatMessage, Move, Player } from '../types/game';
import { getInitialPieces } from '../utils/pieceUtils';
import { calculateValidMoves } from '../utils/pieceUtils';
import { generateBoard, arePositionsEqual } from '../utils/boardUtils';
import { v4 as uuidv4 } from 'uuid';

export function useGameState() {
  const [gameState, setGameState] = useState<GameState>({
    pieces: getInitialPieces(),
    currentPlayer: 'blue',
    selectedPiece: null,
    validMoves: [],
    gameStatus: 'waiting',
    winner: null,
    blueTime: 360,
    redTime: 360,
    messages: [],
  });

  const handleTimeEnd = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      gameStatus: 'finished',
      winner: prev.currentPlayer === 'blue' ? 'red' : 'blue'
    }));
  }, []);

  const handleGameStart = useCallback(({ gameId, color }: { gameId: string, color: Player }) => {
    setGameState(prev => ({
      ...prev,
      gameStatus: 'playing',
      gameId,
      playerColor: color,
      currentPlayer: 'blue',
      pieces: getInitialPieces()
    }));
  }, []);

  const handleOpponentMove = useCallback((move: Move) => {
    setGameState(prev => {
      const movingPiece = prev.pieces.find(p => p.id === move.pieceId);
      if (!movingPiece) return prev;

      const newPieces = prev.pieces
        .filter(p => !arePositionsEqual(p.position, move.to))
        .map(p => p.id === move.pieceId ? { ...p, position: move.to } : p);

      return {
        ...prev,
        pieces: newPieces,
        currentPlayer: prev.currentPlayer === 'blue' ? 'red' : 'blue',
        selectedPiece: null,
        validMoves: []
      };
    });
  }, []);

  const handlePieceClick = useCallback((pieceId: string) => {
    setGameState(prev => {
      if (prev.gameStatus !== 'playing' || prev.currentPlayer !== prev.playerColor) {
        return prev;
      }

      const piece = prev.pieces.find(p => p.id === pieceId);
      if (!piece || piece.player !== prev.currentPlayer) {
        return prev;
      }

      const validMoves = calculateValidMoves(piece, prev.pieces, generateBoard());
      return {
        ...prev,
        selectedPiece: piece,
        validMoves
      };
    });
  }, []);

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

      if (prev.gameId) {
        sendMove(prev.gameId, move);
      }

      return {
        ...prev,
        pieces: newPieces,
        currentPlayer: prev.currentPlayer === 'blue' ? 'red' : 'blue',
        selectedPiece: null,
        validMoves: []
      };
    });
  }, []);

  const handleChatMessage = useCallback(({ message, player }: { message: string, player: Player }) => {
    setGameState(prev => ({
      ...prev,
      messages: [
        ...prev.messages,
        {
          id: uuidv4(),
          player,
          message,
          timestamp: Date.now()
        }
      ]
    }));
  }, []);

  const handleGameEnd = useCallback((winner: Player) => {
    setGameState(prev => ({
      ...prev,
      gameStatus: 'finished',
      winner
    }));
  }, []);

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