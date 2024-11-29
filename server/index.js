import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const httpServer = createServer(app);

// Serve static files first
app.use(express.static(join(__dirname, '../dist')));

const io = new Server(httpServer, {
  cors: {
    origin: process.env.NODE_ENV === 'production' ? false : ["http://localhost:5173"],
    methods: ["GET", "POST"],
    credentials: true
  }
});

const games = new Map();
const waitingPlayers = new Set();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('findGame', () => {
    console.log('Player searching for game:', socket.id);
    
    // Si le joueur était déjà en attente, on le retire
    waitingPlayers.delete(socket.id);
    
    if (waitingPlayers.size > 0) {
      const opponent = waitingPlayers.values().next().value;
      waitingPlayers.delete(opponent);
      
      const gameId = uuidv4();
      games.set(gameId, {
        players: {
          blue: opponent,
          red: socket.id
        },
        moves: []
      });

      console.log(`Game ${gameId} created between ${opponent} (blue) and ${socket.id} (red)`);

      io.to(opponent).emit('gameStart', { gameId, color: 'blue' });
      socket.emit('gameStart', { gameId, color: 'red' });
    } else {
      console.log('Player added to waiting list:', socket.id);
      waitingPlayers.add(socket.id);
      socket.emit('waiting');
    }
  });

  socket.on('move', ({ gameId, move }) => {
    const game = games.get(gameId);
    if (game) {
      game.moves.push(move);
      const opponent = Object.values(game.players).find(id => id !== socket.id);
      if (opponent) {
        io.to(opponent).emit('opponentMove', move);
      }
    }
  });

  socket.on('chat', ({ gameId, message }) => {
    const game = games.get(gameId);
    if (game) {
      const playerColor = Object.entries(game.players).find(([_, id]) => id === socket.id)?.[0];
      if (playerColor) {
        const chatMessage = {
          id: uuidv4(),
          player: playerColor,
          message,
          timestamp: Date.now()
        };
        
        Object.values(game.players).forEach(playerId => {
          io.to(playerId).emit('chatMessage', chatMessage);
        });
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
    console.log('User disconnected:', socket.id);
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

// Handle all other routes by serving the index.html
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, '../dist/index.html'));
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});