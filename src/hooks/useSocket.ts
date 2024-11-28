import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { GameState, Move } from '../types/game';

// En production, nous utiliserons l'URL du serveur déployé
const SOCKET_URL = import.meta.env.PROD 
  ? 'https://grapiz.onrender.com'  // URL de production
  : 'http://localhost:3001';              // URL de développement

export function useSocket(onGameStart: (data: { gameId: string, color: 'red' | 'blue' }) => void,
                         onOpponentMove: (move: Move) => void,
                         onChatMessage: (message: string) => void,
                         onOpponentForfeit: () => void,
                         onOpponentDisconnected: () => void) {
  const socketRef = useRef<Socket>();

  useEffect(() => {
    socketRef.current = io(SOCKET_URL);

    socketRef.current.on('gameStart', onGameStart);
    socketRef.current.on('opponentMove', onOpponentMove);
    socketRef.current.on('chatMessage', onChatMessage);
    socketRef.current.on('opponentForfeit', onOpponentForfeit);
    socketRef.current.on('opponentDisconnected', onOpponentDisconnected);
    socketRef.current.on('waiting', () => {
      console.log('Waiting for opponent...');
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  const findGame = () => {
    socketRef.current?.emit('findGame');
  };

  const sendMove = (gameId: string, move: Move) => {
    socketRef.current?.emit('move', { gameId, move });
  };

  const sendChat = (gameId: string, message: string) => {
    socketRef.current?.emit('chat', { gameId, message });
  };

  const forfeit = (gameId: string) => {
    socketRef.current?.emit('forfeit', { gameId });
  };

  return {
    findGame,
    sendMove,
    sendChat,
    forfeit
  };
}
