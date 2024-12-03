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

app.use(express.static(join(__dirname, '../dist')));

const io = new Server(httpServer, {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? ["https://cosmic-bubblegum-4be6f9.netlify.app"]
      : ["http://localhost:5173"],
    methods: ["GET", "POST"],
    credentials: true
  },
  pingTimeout: 60000,
  pingInterval: 25000,
  transports: ['polling', 'websocket'],
  path: '/socket.io/'
});

const games = new Map();
const waitingPlayers = new Set();
const INITIAL_TIME = 360; // 6 minutes in seconds

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  // Broadcast player count to all clients
  io.emit('playerCount', io.engine.clientsCount);

  socket.on('findGame', () => {
    console.log('Player searching for game:', socket.id);
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
        moves: [],
        timers: {
          blue: INITIAL_TIME,
          red: INITIAL_TIME
        },
        lastUpdate: Date.now()
      });

      console.log(`Game ${gameId} created between ${opponent} (blue) and ${socket.id} (red)`);

      // Send initial game state to both players
      io.to(opponent).emit('gameStart', { gameId, color: 'blue' });
      io.to(socket.id).emit('gameStart', { gameId, color: 'red' });

      // Initial timer sync
      io.to(opponent).emit('timeSync', { 
        blueTime: INITIAL_TIME, 
        redTime: INITIAL_TIME 
      });
      io.to(socket.id).emit('timeSync', { 
        blueTime: INITIAL_TIME, 
        redTime: INITIAL_TIME 
      });
    } else {
      console.log('Player added to waiting list:', socket.id);
      waitingPlayers.add(socket.id);
      socket.emit('waiting');
    }
  });

  socket.on('timeUpdate', ({ gameId, player, time }) => {
    const game = games.get(gameId);
    if (game) {
      game.timers[player] = time;
      game.lastUpdate = Date.now();
      
      // Broadcast time update to both players
      Object.values(game.players).forEach(playerId => {
        io.to(playerId).emit('timeSync', {
          blueTime: game.timers.blue,
          redTime: game.timers.red
        });
      });
    }
  });

  socket.on('move', ({ gameId, move }) => {
    console.log('Move received:', { gameId, move });
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
    
    // Update connected players count
    io.emit('playerCount', io.engine.clientsCount - 1);
    
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

app.get('*', (req, res) => {
  res.sendFile(join(__dirname, '../dist/index.html'));
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});