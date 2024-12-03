import React, { useEffect } from 'react';
import { GameHeader } from './components/GameHeader';
import { GameBoard } from './components/GameBoard';
import { ChatArea } from './components/ChatArea';
import { GameControls } from './components/GameControls';
import { OnlineMatchmaking } from './components/OnlineMatchmaking';
import { useLocalGame } from './hooks/useLocalGame';
import { useOnlineGame } from './hooks/useOnlineGame';
import { useTimer } from './hooks/useTimer';
import { GameMode, AILevel } from './types/game';

function App() {
  const {
    gameState: localGameState,
    handlePieceClick: handleLocalPieceClick,
    handleHexClick: handleLocalHexClick,
    handleChat: handleLocalChat,
    forfeit: localForfeit,
    setGameMode
  } = useLocalGame();

  const {
    gameState: onlineGameState,
    isSearching,
    startMatchmaking,
    cancelMatchmaking,
    handlePieceClick: handleOnlinePieceClick,
    handleHexClick: handleOnlineHexClick,
    handleChat: handleOnlineChat,
    forfeit: onlineForfeit
  } = useOnlineGame();

  const gameState = localGameState.gameMode === 'online' ? onlineGameState : localGameState;
  const handlePieceClick = localGameState.gameMode === 'online' ? handleOnlinePieceClick : handleLocalPieceClick;
  const handleHexClick = localGameState.gameMode === 'online' ? handleOnlineHexClick : handleLocalHexClick;
  const handleChat = localGameState.gameMode === 'online' ? handleOnlineChat : handleLocalChat;
  const forfeit = localGameState.gameMode === 'online' ? onlineForfeit : localForfeit;

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

  const handleGameModeChange = (mode: GameMode, aiLevel?: AILevel) => {
    if (mode === 'online') {
      startMatchmaking();
    }
    setGameMode(mode, aiLevel);
  };

  // Démarrer automatiquement en mode en ligne
  useEffect(() => {
    handleGameModeChange('online');
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-2 md:px-4 py-4 md:py-6">
        <GameControls
          gameMode={gameState.gameMode}
          aiLevel={gameState.aiLevel}
          onGameModeChange={handleGameModeChange}
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

        {isSearching && (
          <OnlineMatchmaking onCancel={cancelMatchmaking} />
        )}
      </div>
    </div>
  );
}

export default App;