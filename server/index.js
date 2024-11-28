import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
  }
});

const games = new Map();
const waitingPlayers = new Set();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('findGame', () => {
    if (waitingPlayers.size > 0) {
      const opponent = waitingPlayers.values().next().value;
      waitingPlayers.delete(opponent);
      
      const gameId = Math.random().toString(36).substring(7);
      games.set(gameId, {
        players: {
          blue: opponent,
          red: socket.id
        },
        gameState: null
      });

      io.to(opponent).emit('gameStart', { gameId, color: 'blue' });
      socket.emit('gameStart', { gameId, color: 'red' });
    } else {
      waitingPlayers.add(socket.id);
      socket.emit('waiting');
    }
  });

  socket.on('move', ({ gameId, move }) => {
    const game = games.get(gameId);
    if (game) {
      const opponent = Object.values(game.players).find(id => id !== socket.id);
      if (opponent) {
        io.to(opponent).emit('opponentMove', move);
      }
    }
  });

  socket.on('chat', ({ gameId, message }) => {
    const game = games.get(gameId);
    if (game) {
      const opponent = Object.values(game.players).find(id => id !== socket.id);
      if (opponent) {
        io.to(opponent).emit('chatMessage', message);
      }
    }
  });

  socket.on('forfeit', ({ gameId }) => {
    const game = games.get(gameId);
    if (game) {
      const opponent = Object.values(game.players).find(id => id !== socket.id);
      if (opponent) {
        io.to(opponent).emit('opponentForfeit');
      }
      games.delete(gameId);
    }
  });

  socket.on('disconnect', () => {
    waitingPlayers.delete(socket.id);
    for (const [gameId, game] of games.entries()) {
      if (Object.values(game.players).includes(socket.id)) {
        const opponent = Object.values(game.players).find(id => id !== socket.id);
        if (opponent) {
          io.to(opponent).emit('opponentDisconnected');
        }
        games.delete(gameId);
      }
    }
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});