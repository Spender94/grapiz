import React, { useState } from 'react';
import { GameHeader } from './components/GameHeader';
import { GameBoard } from './components/GameBoard';
import { ChatArea } from './components/ChatArea';
import { GameControls } from './components/GameControls';
import { GameStatus } from './components/GameStatus';
import { Position } from './types/game';
import { useGameState } from './hooks/useGameState';
import { useSocket } from './hooks/useSocket';
import { useTimer } from './hooks/useTimer';
import { useLocalGame } from './hooks/useLocalGame';
import { GameMode, GAME_MODES, DEFAULT_GAME_MODE } from './config/gameConfig';

function App() {
  const [gameMode, setGameMode] = useState<GameMode>(DEFAULT_GAME_MODE);
  
  const {
    gameState: onlineGameState,
    handleTimeEnd: handleOnlineTimeEnd,
    handleGameStart,
    handleOpponentMove,
    handlePieceClick: handleOnlinePieceClick,
    handleHexClick: handleOnlineHexClick,
    handleChatMessage,
    handleGameEnd
  } = useGameState();

  const {
    gameState: localGameState,
    handlePieceClick: handleLocalPieceClick,
    handleHexClick: handleLocalHexClick,
    handleChat: handleLocalChat,
    forfeit: handleLocalForfeit
  } = useLocalGame();

  const { findGame, sendMove, sendChat, forfeit } = useSocket(
    handleGameStart,
    handleOpponentMove,
    handleChatMessage,
    () => handleGameEnd(onlineGameState.playerColor!),
    () => handleGameEnd(onlineGameState.playerColor!)
  );

  const gameState = gameMode === GAME_MODES.ONLINE ? onlineGameState : localGameState;

  const handleTimeEnd = () => {
    if (gameMode === GAME_MODES.ONLINE) {
      handleOnlineTimeEnd();
    } else {
      handleLocalForfeit();
    }
  };

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

  const handlePieceClick = (pieceId: string) => {
    if (gameMode === GAME_MODES.ONLINE) {
      handleOnlinePieceClick(pieceId);
    } else {
      handleLocalPieceClick(pieceId);
    }
  };

  const handleHexClick = (position: Position) => {
    if (gameMode === GAME_MODES.ONLINE) {
      handleOnlineHexClick(position, sendMove);
    } else {
      handleLocalHexClick(position);
    }
  };

  const handleChatSubmit = (message: string) => {
    if (gameMode === GAME_MODES.ONLINE) {
      if (gameState.gameId) {
        sendChat(gameState.gameId, message);
      }
    } else {
      handleLocalChat(message);
    }
  };

  const handleForfeit = () => {
    if (gameMode === GAME_MODES.ONLINE) {
      if (gameState.gameId) {
        forfeit(gameState.gameId);
      }
    } else {
      handleLocalForfeit();
    }
  };

  const showGameStatus = gameMode === GAME_MODES.ONLINE && 
    (gameState.gameStatus === 'waiting' || 
     (gameState.gameStatus === 'playing' && !gameState.playerColor) ||
     gameState.gameStatus === 'finished' ||
     gameState.gameStatus === 'draw');

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-6">
        <GameControls
          gameMode={gameMode}
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
            onForfeit={handleForfeit}
          />
          <ChatArea
            messages={gameState.messages}
            currentPlayer={gameState.currentPlayer}
            onSendMessage={handleChatSubmit}
          />
        </div>

        {showGameStatus && (
          <GameStatus
            gameStatus={gameState.gameStatus}
            winner={gameState.winner}
            onFindGame={findGame}
          />
        )}
      </div>
    </div>
  );
}

export default App;