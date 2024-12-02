import React from 'react';
import { GameHeader } from './components/GameHeader';
import { GameBoard } from './components/GameBoard';
import { ChatArea } from './components/ChatArea';
import { GameControls } from './components/GameControls';
import { useLocalGame } from './hooks/useLocalGame';
import { useTimer } from './hooks/useTimer';

function App() {
  const {
    gameState,
    handlePieceClick,
    handleHexClick,
    handleChat,
    forfeit,
    setGameMode
  } = useLocalGame();

  const blueTime = useTimer(
    gameState.blueTime,
    gameState.gameStatus === 'playing' && gameState.currentPlayer === 'blue',
    forfeit
  );

  const redTime = useTimer(
    gameState.redTime,
    gameState.gameStatus === 'playing' && gameState.currentPlayer === 'red',
    forfeit
  );

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-2 md:px-4 py-4 md:py-6">
        <GameControls
          gameMode={gameState.gameMode}
          aiLevel={gameState.aiLevel}
          onGameModeChange={setGameMode}
        />
        
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
            onForfeit={forfeit}
          />
          <ChatArea
            messages={gameState.messages}
            currentPlayer={gameState.currentPlayer}
            onSendMessage={handleChat}
          />
        </div>
      </div>
    </div>
  );
}

export default App;