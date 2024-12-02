import { useCallback, useState, useEffect, useRef } from 'react';
import { GameState, Position, ChatMessage, GameMode, AILevel } from '../types/game';
import { getInitialPieces, calculateValidMoves, checkVictoryCondition } from '../utils/pieceUtils';
import { generateBoard, arePositionsEqual } from '../utils/boardUtils';
import { v4 as uuidv4 } from 'uuid';
import { useAI } from './useAI';

const INITIAL_TIME = 360; // 6 minutes

const createInitialState = (gameMode: GameMode = 'self', aiLevel: AILevel = null): GameState => {
  // Pour les modes AI, choisir aléatoirement le premier joueur
  const firstPlayer = gameMode === 'ai' ? (Math.random() < 0.5 ? 'blue' : 'red') : 'blue';
  
  return {
    pieces: getInitialPieces(),
    currentPlayer: firstPlayer,
    selectedPiece: null,
    validMoves: [],
    gameStatus: 'playing',
    winner: null,
    blueTime: INITIAL_TIME,
    redTime: INITIAL_TIME,
    messages: [],
    gameId: 'local-game',
    gameMode,
    aiLevel,
    isThinking: false
  };
};

export function useLocalGame() {
  const [gameState, setGameState] = useState<GameState>(() => createInitialState());
  const { calculateAIMove } = useAI();
  const aiMoveInProgress = useRef(false);
  const aiTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Reset game state when changing modes
  const resetGame = useCallback((mode: GameMode, aiLevel: AILevel = null) => {
    // Nettoyer tous les timers existants
    if (aiTimeoutRef.current) {
      clearTimeout(aiTimeoutRef.current);
      aiTimeoutRef.current = null;
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    aiMoveInProgress.current = false;

    // Créer un nouveau state complètement frais
    setGameState(createInitialState(mode, aiLevel));
  }, []);

  // Timer effect
  useEffect(() => {
    // Nettoyer l'intervalle existant
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    
    if (gameState.gameStatus === 'playing' && !gameState.isThinking) {
      timerIntervalRef.current = setInterval(() => {
        setGameState(prev => {
          const timeKey = prev.currentPlayer === 'blue' ? 'blueTime' : 'redTime';
          const newTime = prev[timeKey] - 1;
          
          if (newTime <= 0) {
            // Nettoyer l'intervalle si le temps est écoulé
            if (timerIntervalRef.current) {
              clearInterval(timerIntervalRef.current);
              timerIntervalRef.current = null;
            }
            
            return {
              ...prev,
              gameStatus: 'finished',
              winner: prev.currentPlayer === 'blue' ? 'red' : 'blue'
            };
          }
          
          return {
            ...prev,
            [timeKey]: newTime
          };
        });
      }, 1000);
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    };
  }, [gameState.gameStatus, gameState.isThinking]);

  // AI move effect
  useEffect(() => {
    if (aiTimeoutRef.current) {
      clearTimeout(aiTimeoutRef.current);
      aiTimeoutRef.current = null;
    }

    const shouldMakeAIMove = 
      gameState.gameMode === 'ai' && 
      gameState.gameStatus === 'playing' && 
      gameState.currentPlayer === 'red' && 
      !aiMoveInProgress.current;

    if (!shouldMakeAIMove) return;

    const makeAIMove = async () => {
      if (aiMoveInProgress.current) return;
      
      aiMoveInProgress.current = true;
      setGameState(prev => ({ ...prev, isThinking: true }));

      try {
        const aiMove = await calculateAIMove(gameState.pieces, gameState.aiLevel);
        
        if (aiMove && gameState.currentPlayer === 'red') {
          setGameState(prev => {
            const piece = prev.pieces.find(p => p.id === aiMove.pieceId);
            if (!piece) return prev;

            const validMoves = calculateValidMoves(piece, prev.pieces, generateBoard());
            if (!validMoves.some(move => arePositionsEqual(move, aiMove.position))) {
              return { ...prev, isThinking: false };
            }

            const capturedPiece = prev.pieces.find(p => 
              arePositionsEqual(p.position, aiMove.position) && 
              p.player !== piece.player
            );

            const newPieces = prev.pieces
              .filter(p => !capturedPiece || p.id !== capturedPiece.id)
              .map(p => p.id === piece.id ? { ...p, position: aiMove.position } : p);

            const victoryResult = checkVictoryCondition(newPieces);

            return {
              ...prev,
              pieces: newPieces,
              currentPlayer: 'blue',
              selectedPiece: null,
              validMoves: [],
              gameStatus: victoryResult ? 'finished' : 'playing',
              winner: victoryResult === 'draw' ? null : victoryResult,
              isThinking: false
            };
          });
        }
      } catch (error) {
        console.error('AI move error:', error);
        setGameState(prev => ({ ...prev, isThinking: false }));
      } finally {
        aiMoveInProgress.current = false;
      }
    };

    aiTimeoutRef.current = setTimeout(makeAIMove, 500);

    return () => {
      if (aiTimeoutRef.current) {
        clearTimeout(aiTimeoutRef.current);
        aiTimeoutRef.current = null;
      }
    };
  }, [gameState.gameMode, gameState.gameStatus, gameState.currentPlayer, gameState.pieces, gameState.aiLevel, calculateAIMove]);

  const handlePieceClick = useCallback((pieceId: string) => {
    setGameState(prev => {
      if (prev.gameStatus === 'finished' || prev.isThinking) {
        return prev;
      }

      const piece = prev.pieces.find(p => p.id === pieceId);
      if (!piece || piece.player !== prev.currentPlayer) {
        return prev;
      }

      if (prev.gameMode === 'ai' && piece.player === 'red') {
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

  const handleHexClick = useCallback((position: Position) => {
    setGameState(prev => {
      if (!prev.selectedPiece || !prev.validMoves.some(move => arePositionsEqual(move, position))) {
        return prev;
      }

      if (prev.gameMode === 'ai' && prev.currentPlayer === 'red') {
        return prev;
      }

      const capturedPiece = prev.pieces.find(p => 
        arePositionsEqual(p.position, position) && 
        p.player !== prev.selectedPiece!.player
      );

      const newPieces = prev.pieces
        .filter(p => !capturedPiece || p.id !== capturedPiece.id)
        .map(p => 
          p.id === prev.selectedPiece!.id 
            ? { ...p, position }
            : p
        );

      const victoryResult = checkVictoryCondition(newPieces);

      return {
        ...prev,
        pieces: newPieces,
        currentPlayer: prev.currentPlayer === 'blue' ? 'red' : 'blue',
        selectedPiece: null,
        validMoves: [],
        gameStatus: victoryResult ? 'finished' : 'playing',
        winner: victoryResult === 'draw' ? null : victoryResult
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

  const setGameMode = useCallback((mode: GameMode, aiLevel: AILevel = null) => {
    resetGame(mode, aiLevel);
  }, [resetGame]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      if (aiTimeoutRef.current) {
        clearTimeout(aiTimeoutRef.current);
      }
    };
  }, []);

  return {
    gameState,
    handlePieceClick,
    handleHexClick,
    handleChat,
    forfeit,
    setGameMode
  };
}