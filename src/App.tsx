import React, { useState, useEffect, useCallback } from 'react';
import { GameHeader } from './components/GameHeader';
import { GameBoard } from './components/GameBoard';
import { ChatArea } from './components/ChatArea';
import { GameState, Position, ChatMessage, Move } from './types/game';
import { getInitialPieces } from './utils/pieceUtils';
import { calculateValidMoves, isPieceConnectedToGroup } from './utils/pieceUtils';
import { generateBoard, arePositionsEqual } from './utils/boardUtils';
import { useSocket } from './hooks/useSocket';
import { useTimer } from './hooks/useTimer';

function App() {
  const [gameState, setGameState] = useState<GameState>({
    pieces: getInitialPieces(),
    currentPlayer: 'blue',
    selectedPiece: null,
    validMoves: [],
    gameStatus: 'waiting',
    winner: null,
    blueTime: 360,
    redTime: 360,
    messages: [],
  });

  const handleTimeEnd = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      gameStatus: 'finished',
      winner: prev.currentPlayer === 'blue' ? 'red' : 'blue'
    }));
  }, []);

  const blueTime = useTimer(
    gameState.blueTime,
    gameState.gameStatus === 'playing' && gameState.currentPlayer === 'blue',
    handleTimeEnd
  );

  const redTime = useTimer(
    gameState.redTime,
    gameState.gameStatus === 'playing' && gameState.currentPlayer === 'red',
    handleTimeEnd
  );

  useEffect(() => {
    setGameState(prev => ({
      ...prev,
      blueTime,
      redTime
    }));
  }, [blueTime, redTime]);

  const handleGameStart = ({ gameId, color }) => {
    setGameState(prev => ({
      ...prev,
      gameStatus: 'playing',
      gameId,
      playerColor: color,
      currentPlayer: 'blue' // La partie commence toujours avec le joueur bleu
    }));
  };

  const handleOpponentMove = (move: Move) => {
    setGameState(prev => {
      const newPieces = prev.pieces.map(p => {
        if (p.id === move.pieceId) {
          return { ...p, position: move.to };
        }
        return p;
      }).filter(p => !arePositionsEqual(p.position, move.to) || p.id === move.pieceId);

      return {
        ...prev,
        pieces: newPieces,
        currentPlayer: prev.currentPlayer === 'blue' ? 'red' : 'blue'
      };
    });
  };

  // ... rest of the component implementation remains the same

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-6">
        <GameHeader 
          gameState={{
            ...gameState,
            blueTime,
            redTime
          }} 
        />
        <div className="flex flex-col md:flex-row gap-4">
          <GameBoard
            gameState={gameState}
            onPieceClick={handlePieceClick}
            onHexClick={handleHexClick}
            onForfeit={handleForfeit}
          />
          <ChatArea
            messages={gameState.messages}
            currentPlayer={gameState.playerColor || 'blue'}
            onSendMessage={handleSendMessage}
          />
        </div>
      </div>
    </div>
  );
}

export default App;