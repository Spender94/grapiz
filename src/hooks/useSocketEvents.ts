import { Socket } from 'socket.io-client';
import { Move, ChatMessage } from '../types/game';

export function setupSocketEvents(
  socket: Socket,
  handlers: {
    onGameStart: (data: { gameId: string; color: 'red' | 'blue' }) => void;
    onOpponentMove: (move: Move) => void;
    onChatMessage: (message: ChatMessage) => void;
    onOpponentForfeit: () => void;
    onOpponentDisconnected: () => void;
  }
) {
  // Connection events
  socket.on('connect', () => {
    console.log('Connected to server:', socket.id);
    if (socket.connected) {
      socket.emit('findGame');
    }
  });

  socket.on('connect_error', (error) => {
    console.error('Connection error:', error.message);
  });

  socket.on('disconnect', (reason) => {
    console.log('Disconnected:', reason);
    if (reason === 'io server disconnect') {
      socket.connect();
    }
  });

  // Game events
  socket.on('gameStart', (data) => {
    console.log('Game started:', data);
    handlers.onGameStart(data);
    socket.emit('gameStartAck');
  });

  socket.on('opponentMove', (move) => {
    console.log('Opponent moved:', move);
    handlers.onOpponentMove(move);
    socket.emit('moveAck', { moveId: move.pieceId });
  });

  socket.on('chatMessage', (message) => {
    console.log('Chat message received:', message);
    handlers.onChatMessage(message);
    socket.emit('chatAck', { messageId: message.id });
  });

  socket.on('opponentForfeit', () => {
    console.log('Opponent forfeited');
    handlers.onOpponentForfeit();
  });

  socket.on('opponentDisconnected', () => {
    console.log('Opponent disconnected');
    handlers.onOpponentDisconnected();
  });

  socket.on('waiting', () => {
    console.log('Waiting for opponent...');
  });

  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });
}