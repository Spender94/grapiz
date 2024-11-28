import { useState, useCallback } from 'react';
import { GameState, Position, ChatMessage, Move, Player } from '../types/game';
import { getInitialPieces, checkVictoryCondition, calculateValidMoves } from '../utils/pieceUtils';
import { arePositionsEqual, generateBoard } from '../utils/boardUtils';
import { v4 as uuidv4 } from 'uuid';

const INITIAL_TIME = 360; // 6 minutes in seconds

export function useGameState() {
  const [gameState, setGameState] = useState<GameState>({
    pieces: getInitialPieces(),
    currentPlayer: 'blue',
    selectedPiece: null,
    validMoves: [],
    gameStatus: 'waiting',
    winner: null,
    blueTime: INITIAL_TIME,
    redTime: INITIAL_TIME,
    messages: [],
    gameId: undefined,
    playerColor: undefined
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
      gameId,
      playerColor: color,
      gameStatus: 'playing'
    }));
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
      if (!prev.selectedPiece || !prev.validMoves.some(move => arePositionsEqual(move, position))) {
        return prev;
      }

      const move: Move = {
        pieceId: prev.selectedPiece.id,
        from: prev.selectedPiece.position,
        to: position
      };

      if (prev.gameId) {
        sendMove(prev.gameId, move);
      }

      const newPieces = prev.pieces
        .filter(p => !arePositionsEqual(p.position, position))
        .map(p => p.id === prev.selectedPiece!.id ? { ...p, position } : p);

      const victoryResult = checkVictoryCondition(newPieces);

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

  const handleChatMessage = useCallback((message: ChatMessage) => {
    setGameState(prev => ({
      ...prev,
      messages: [...prev.messages, message]
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
    handleTimeEnd,
    handleGameStart,
    handleOpponentMove: handleHexClick,
    handlePieceClick,
    handleHexClick,
    handleChatMessage,
    handleGameEnd
  };
}