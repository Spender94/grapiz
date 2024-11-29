import { useState, useCallback } from 'react';
import { GameState, Position, ChatMessage, Move, Player } from '../types/game';
import { getInitialPieces, calculateValidMoves, checkVictoryCondition } from '../utils/pieceUtils';
import { generateBoard, arePositionsEqual } from '../utils/boardUtils';

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
    console.log('Game starting with color:', color);
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
        console.log('Not player turn or game not playing');
        return prev;
      }

      const piece = prev.pieces.find(p => p.id === pieceId);
      if (!piece || piece.player !== prev.currentPlayer) {
        console.log('Invalid piece selection');
        return prev;
      }

      const validMoves = calculateValidMoves(piece, prev.pieces, generateBoard());
      console.log('Valid moves calculated:', validMoves);

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
        console.log('Invalid move attempt');
        return prev;
      }

      const move: Move = {
        pieceId: prev.selectedPiece.id,
        from: prev.selectedPiece.position,
        to: position
      };

      // Vérifier s'il y a une pièce à capturer
      const capturedPiece = prev.pieces.find(p => 
        arePositionsEqual(p.position, position) && 
        p.player !== prev.selectedPiece!.player
      );

      // Mettre à jour les pièces
      const newPieces = prev.pieces
        .filter(p => !capturedPiece || p.id !== capturedPiece.id)
        .map(p => 
          p.id === prev.selectedPiece!.id 
            ? { ...p, position }
            : p
        );

      const victoryResult = checkVictoryCondition(newPieces);

      if (prev.gameId) {
        console.log('Sending move:', move);
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

  const handleOpponentMove = useCallback((move: Move) => {
    console.log('Handling opponent move:', move);
    setGameState(prev => {
      // Vérifier s'il y a une pièce à capturer
      const capturedPiece = prev.pieces.find(p => 
        arePositionsEqual(p.position, move.to) && 
        p.player !== prev.currentPlayer
      );

      // Mettre à jour les pièces
      const newPieces = prev.pieces
        .filter(p => !capturedPiece || p.id !== capturedPiece.id)
        .map(p => 
          p.id === move.pieceId 
            ? { ...p, position: move.to }
            : p
        );

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
    handleOpponentMove,
    handlePieceClick,
    handleHexClick,
    handleChatMessage,
    handleGameEnd
  };
}