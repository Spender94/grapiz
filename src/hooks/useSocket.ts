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
  const gameIdRef = useRef<string>();

  const initSocket = useCallback(() => {
    if (socketRef.current?.connected) return;

    socketRef.current = io(SOCKET_URL, socketConfig);
    const socket = socketRef.current;

    socket.on('connect', () => {
      console.log('Connected to server');
      // Automatically search for a game when connected
      socket.emit('findGame');
    });

    socket.on('disconnect', (reason) => {
      console.log('Disconnected:', reason);
      if (reason === 'io server disconnect') {
        socket.connect();
      }
    });

    socket.on('gameStart', (data) => {
      console.log('Game started:', data);
      gameIdRef.current = data.gameId;
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

    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    socket.connect();
  }, [onGameStart, onOpponentMove, onChatMessage, onOpponentForfeit, onOpponentDisconnected]);

  useEffect(() => {
    initSocket();

    return () => {
      if (socketRef.current) {
        console.log('Cleaning up socket connection');
        socketRef.current.disconnect();
        socketRef.current = undefined;
      }
    };
  }, [initSocket]);

  const findGame = useCallback(() => {
    if (!socketRef.current?.connected) {
      console.log('Socket not connected, reconnecting...');
      initSocket();
    }
    console.log('Finding game...');
    socketRef.current?.emit('findGame');
  }, [initSocket]);

  const sendMove = useCallback((gameId: string, move: Move) => {
    if (!socketRef.current?.connected) {
      console.warn('Cannot send move: socket not connected');
      return;
    }
    console.log('Sending move:', move);
    socketRef.current.emit('move', { gameId, move });
  }, []);

  const sendChat = useCallback((gameId: string, message: string) => {
    if (!socketRef.current?.connected) {
      console.warn('Cannot send chat: socket not connected');
      return;
    }
    console.log('Sending chat message:', message);
    socketRef.current.emit('chat', { gameId, message });
  }, []);

  const forfeit = useCallback((gameId: string) => {
    if (!socketRef.current?.connected) {
      console.warn('Cannot forfeit: socket not connected');
      return;
    }
    console.log('Forfeiting game');
    socketRef.current.emit('forfeit', { gameId });
  }, []);

  return {
    findGame,
    sendMove,
    sendChat,
    forfeit,
    connected: socketRef.current?.connected || false
  };
}