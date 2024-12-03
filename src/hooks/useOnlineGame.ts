import { useState, useCallback, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { GameState, Position, ChatMessage, Move, Player } from '../types/game';
import { getInitialPieces, calculateValidMoves, checkVictoryCondition } from '../utils/pieceUtils';
import { generateBoard, arePositionsEqual } from '../utils/boardUtils';
import { v4 as uuidv4 } from 'uuid';

const SOCKET_URL = 'https://grapiz.onrender.com';
const INITIAL_TIME = 360;

export function useOnlineGame() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isSearching, setIsSearching] = useState(false);
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
    playerColor: undefined,
    gameMode: 'online',
    aiLevel: null,
    isThinking: false
  });

  // Initialiser la connexion socket
  useEffect(() => {
    if (!socket) {
      const newSocket = io(SOCKET_URL, {
        transports: ['websocket', 'polling'],
        path: '/socket.io/'
      });

      newSocket.on('connect', () => {
        console.log('Connected to server');
      });

      newSocket.on('gameStart', ({ gameId, color }) => {
        setIsSearching(false);
        setGameState(prev => ({
          ...prev,
          gameId,
          playerColor: color,
          gameStatus: 'playing'
        }));
      });

      newSocket.on('opponentMove', (move: Move) => {
        handleOpponentMove(move);
      });

      newSocket.on('chatMessage', (message: ChatMessage) => {
        setGameState(prev => ({
          ...prev,
          messages: [...prev.messages, message]
        }));
      });

      newSocket.on('opponentForfeit', () => {
        setGameState(prev => ({
          ...prev,
          gameStatus: 'finished',
          winner: prev.playerColor
        }));
      });

      newSocket.on('opponentDisconnected', () => {
        setGameState(prev => ({
          ...prev,
          gameStatus: 'finished',
          winner: prev.playerColor
        }));
      });

      setSocket(newSocket);
    }

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  const startMatchmaking = useCallback(() => {
    if (socket) {
      setIsSearching(true);
      socket.emit('findGame');
    }
  }, [socket]);

  const cancelMatchmaking = useCallback(() => {
    setIsSearching(false);
    if (socket) {
      socket.disconnect();
      setSocket(null);
    }
  }, [socket]);

  const handlePieceClick = useCallback((pieceId: string) => {
    setGameState(prev => {
      if (prev.gameStatus !== 'playing' || prev.currentPlayer !== prev.playerColor) {
        return prev;
      }

      const piece = prev.pieces.find(p => p.id === pieceId);
      if (!piece || piece.player !== prev.playerColor) {
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

      const move: Move = {
        pieceId: prev.selectedPiece.id,
        from: prev.selectedPiece.position,
        to: position
      };

      if (socket && prev.gameId) {
        socket.emit('move', { gameId: prev.gameId, move });
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
        gameStatus: victoryResult ? 'finished' : prev.gameStatus,
        winner: victoryResult === 'draw' ? null : victoryResult
      };
    });
  }, [socket]);

  const handleOpponentMove = useCallback((move: Move) => {
    setGameState(prev => {
      const capturedPiece = prev.pieces.find(p => 
        arePositionsEqual(p.position, move.to) && 
        p.player !== prev.currentPlayer
      );

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

  const handleChat = useCallback((message: string) => {
    if (socket && gameState.gameId) {
      socket.emit('chat', {
        gameId: gameState.gameId,
        message
      });
    }
  }, [socket, gameState.gameId]);

  const forfeit = useCallback(() => {
    if (socket && gameState.gameId) {
      socket.emit('forfeit', { gameId: gameState.gameId });
      setGameState(prev => ({
        ...prev,
        gameStatus: 'finished',
        winner: prev.playerColor === 'blue' ? 'red' : 'blue'
      }));
    }
  }, [socket, gameState.gameId]);

  return {
    gameState,
    isSearching,
    startMatchmaking,
    cancelMatchmaking,
    handlePieceClick,
    handleHexClick,
    handleChat,
    forfeit
  };
}