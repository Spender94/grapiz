import { useCallback, useState } from 'react';
import { GameState, Move, Player, ChatMessage, Position } from '../types/game';
import { getInitialPieces, calculateValidMoves, checkVictoryCondition } from '../utils/pieceUtils';
import { generateBoard, arePositionsEqual } from '../utils/boardUtils';
import { v4 as uuidv4 } from 'uuid';

const INITIAL_TIME = 360; // 6 minutes

export function useLocalGame() {
  const [gameState, setGameState] = useState<GameState>({
    pieces: getInitialPieces(),
    currentPlayer: 'blue',
    selectedPiece: null,
    validMoves: [],
    gameStatus: 'playing',
    winner: null,
    blueTime: INITIAL_TIME,
    redTime: INITIAL_TIME,
    messages: [],
    gameId: 'local-game',
    playerColor: undefined
  });

  const handlePieceClick = useCallback((pieceId: string) => {
    setGameState(prev => {
      if (prev.gameStatus === 'finished') {
        return prev;
      }

      const piece = prev.pieces.find(p => p.id === pieceId);
      if (!piece || piece.player !== prev.currentPlayer) {
        return prev;
      }

      const validMoves = calculateValidMoves(piece, prev.pieces, generateBoard());
      console.log('Valid moves:', validMoves);

      return {
        ...prev,
        selectedPiece: piece,
        validMoves
      };
    });
  }, []);

  const handleHexClick = useCallback((position: Position) => {
    setGameState(prev => {
      if (!prev.selectedPiece || !prev.validMoves.some(move => arePositionsEqual(move, position))) {
        return prev;
      }

      // Vérifier s'il y a une pièce à capturer à la position cible
      const capturedPiece = prev.pieces.find(p => 
        arePositionsEqual(p.position, position) && 
        p.player !== prev.selectedPiece!.player
      );

      // Créer le nouveau tableau de pièces en:
      // 1. Excluant la pièce capturée si elle existe
      // 2. Mettant à jour la position de la pièce qui se déplace
      const newPieces = prev.pieces
        .filter(p => !capturedPiece || p.id !== capturedPiece.id)
        .map(p => 
          p.id === prev.selectedPiece!.id 
            ? { ...p, position }
            : p
        );

      // Vérifier les conditions de victoire
      const victoryResult = checkVictoryCondition(newPieces);
      const newGameStatus = victoryResult ? 'finished' : 'playing';
      const newWinner = victoryResult === 'draw' ? null : victoryResult;

      return {
        ...prev,
        pieces: newPieces,
        currentPlayer: prev.currentPlayer === 'blue' ? 'red' : 'blue',
        selectedPiece: null,
        validMoves: [],
        gameStatus: newGameStatus,
        winner: newWinner
      };
    });
  }, []);

  const handleChat = useCallback((message: string) => {
    const chatMessage: ChatMessage = {
      id: uuidv4(),
      player: gameState.currentPlayer,
      message,
      timestamp: Date.now()
    };

    setGameState(prev => ({
      ...prev,
      messages: [...prev.messages, chatMessage]
    }));
  }, [gameState.currentPlayer]);

  const forfeit = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      gameStatus: 'finished',
      winner: prev.currentPlayer === 'blue' ? 'red' : 'blue'
    }));
  }, []);

  return {
    gameState,
    handlePieceClick,
    handleHexClick,
    handleChat,
    forfeit
  };
}