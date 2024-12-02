import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { Move, ChatMessage } from '../types/game';
import { SOCKET_URL, socketConfig } from '../config/socketConfig';

export function useSocket(
  onGameStart: (data: { gameId: string; color: 'red' | 'blue' }) => void,
  onOpponentMove: (move: Move) => void,
  onChatMessage: (message: ChatMessage) => void,
  onOpponentForfeit: () => void,
  onOpponentDisconnected: () => void
) {
  const socketRef = useRef<Socket>();

  const initSocket = useCallback(() => {
    if (socketRef.current?.connected) return;

    socketRef.current = io(SOCKET_URL, socketConfig);
    
    const socket = socketRef.current;

    socket.on('connect', () => {
      console.log('Connected to server:', socket.id);
    });

    socket.on('disconnect', (reason) => {
      console.log('Disconnected:', reason);
      if (reason === 'io server disconnect') {
        socket.connect();
      }
    });

    socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      setTimeout(() => {
        socket.connect();
      }, 1000);
    });

    socket.on('gameStart', (data) => {
      console.log('Game started:', data);
      onGameStart(data);
    });

    socket.on('opponentMove', (move) => {
      console.log('Received opponent move:', move);
      onOpponentMove(move);
    });

    socket.on('chatMessage', (message) => {
      console.log('Received chat message:', message);
      onChatMessage(message);
    });

    socket.on('opponentForfeit', () => {
      console.log('Opponent forfeited');
      onOpponentForfeit();
    });

    socket.on('opponentDisconnected', () => {
      console.log('Opponent disconnected');
      onOpponentDisconnected();
    });

    socket.on('waiting', () => {
      console.log('Waiting for opponent...');
    });

    socket.connect();
  }, [onGameStart, onOpponentMove, onChatMessage, onOpponentForfeit, onOpponentDisconnected]);

  useEffect(() => {
    initSocket();
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [initSocket]);

  const findGame = useCallback(() => {
    console.log('Finding game...');
    socketRef.current?.emit('findGame');
  }, []);

  const sendMove = useCallback((gameId: string, move: Move) => {
    console.log('Sending move:', { gameId, move });
    socketRef.current?.emit('move', { gameId, move });
  }, []);

  const sendChat = useCallback((gameId: string, message: string) => {
    socketRef.current?.emit('chat', { gameId, message });
  }, []);

  const forfeit = useCallback((gameId: string) => {
    socketRef.current?.emit('forfeit', { gameId });
  }, []);

  return {
    findGame,
    sendMove,
    sendChat,
    forfeit,
    connected: socketRef.current?.connected || false
  };
}