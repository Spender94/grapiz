import React from 'react';
import { GameHeader } from './components/GameHeader';
import { GameBoard } from './components/GameBoard';
import { ChatArea } from './components/ChatArea';
import { Move } from './types/game';
import { useGameState } from './hooks/useGameState';
import { useSocket } from './hooks/useSocket';
import { useTimer } from './hooks/useTimer';

function App() {
  const {
    gameState,
    handleTimeEnd,
    handleGameStart,
    handleOpponentMove,
    handlePieceClick,
    handleHexClick,
    handleChatMessage,
    handleGameEnd
  } = useGameState();

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

  const { findGame, sendMove, sendChat, forfeit } = useSocket(
    handleGameStart,
    handleOpponentMove,
    handleChatMessage,
    () => handleGameEnd(gameState.playerColor!),
    () => handleGameEnd(gameState.playerColor!)
  );

  const handleHexClickWithMove = (position: Position) => {
    handleHexClick(position, sendMove);
  };

  const handleForfeit = () => {
    if (!gameState.gameId) return;
    forfeit(gameState.gameId);
    handleGameEnd(gameState.currentPlayer === 'blue' ? 'red' : 'blue');
  };

  React.useEffect(() => {
    findGame();
  }, []);

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
            onHexClick={handleHexClickWithMove}
            onForfeit={handleForfeit}
          />
          <ChatArea
            messages={gameState.messages}
            currentPlayer={gameState.playerColor || 'blue'}
            onSendMessage={(message) => {
              if (gameState.gameId) {
                sendChat(gameState.gameId, message);
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default App;