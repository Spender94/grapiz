import React, { useState, useEffect } from 'react';
import { GameHeader } from './components/GameHeader';
import { GameBoard } from './components/GameBoard';
import { ChatArea } from './components/ChatArea';
import { GameState, Position, ChatMessage, Move } from './types/game';
import { getInitialPieces } from './utils/pieceUtils';
import { calculateValidMoves, isPieceConnectedToGroup } from './utils/pieceUtils';
import { generateBoard, arePositionsEqual } from './utils/boardUtils';
import { useSocket } from './hooks/useSocket';

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

  const handleGameStart = ({ gameId, color }) => {
    setGameState(prev => ({
      ...prev,
      gameStatus: 'playing',
      gameId,
      playerColor: color
    }));
  };

  const handleOpponentMove = (move: Move) => {
    setGameState(prev => {
      const newPieces = prev.pieces.map(p => {
        if (p.id === move.pieceId) {
          return { ...p, position: move.to };
        }
        return p;
      });

      return {
        ...prev,
        pieces: newPieces,
        currentPlayer: prev.currentPlayer === 'blue' ? 'red' : 'blue'
      };
    });
  };

  const handleChatMessage = (message: string) => {
    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      player: gameState.currentPlayer === 'blue' ? 'red' : 'blue',
      message,
      timestamp: Date.now(),
    };

    setGameState(prev => ({
      ...prev,
      messages: [...prev.messages, newMessage],
    }));
  };

  const handleOpponentForfeit = () => {
    setGameState(prev => ({
      ...prev,
      gameStatus: 'finished',
      winner: prev.playerColor
    }));
  };

  const handleOpponentDisconnected = () => {
    setGameState(prev => ({
      ...prev,
      gameStatus: 'finished',
      winner: prev.playerColor
    }));
  };

  const { findGame, sendMove, sendChat, forfeit } = useSocket(
    handleGameStart,
    handleOpponentMove,
    handleChatMessage,
    handleOpponentForfeit,
    handleOpponentDisconnected
  );

  useEffect(() => {
    findGame();
  }, []);

  // ... rest of the component implementation remains the same, 
  // just update the handlers to use socket functions when appropriate

  const handlePieceClick = (pieceId: string) => {
    if (gameState.gameStatus !== 'playing' || 
        gameState.currentPlayer !== gameState.playerColor) return;

    const piece = gameState.pieces.find(p => p.id === pieceId);
    if (!piece || piece.player !== gameState.currentPlayer) return;

    const validMoves = calculateValidMoves(piece, gameState.pieces, generateBoard());
    
    setGameState(prev => ({
      ...prev,
      selectedPiece: piece,
      validMoves
    }));
  };

  const handleHexClick = (position: Position) => {
    if (!gameState.selectedPiece || !gameState.validMoves.some(move => 
      move.x === position.x && move.y === position.y
    )) return;

    const move: Move = {
      pieceId: gameState.selectedPiece.id,
      from: gameState.selectedPiece.position,
      to: position
    };

    sendMove(gameState.gameId!, move);

    setGameState(prev => {
      const capturedPiece = prev.pieces.find(p => 
        p.player !== prev.selectedPiece!.player && 
        arePositionsEqual(p.position, position)
      );

      let newPieces = prev.pieces
        .filter(p => p !== capturedPiece)
        .map(p => {
          if (p.id === prev.selectedPiece!.id) {
            return { ...p, position };
          }
          return p;
        });

      const isConnected = isPieceConnectedToGroup(
        { ...prev.selectedPiece!, position },
        newPieces
      );

      return {
        ...prev,
        pieces: newPieces,
        currentPlayer: prev.currentPlayer === 'blue' ? 'red' : 'blue',
        selectedPiece: null,
        validMoves: [],
        gameStatus: isConnected ? 'finished' : 'playing',
        winner: isConnected ? prev.currentPlayer : null
      };
    });
  };

  const handleForfeit = () => {
    if (gameState.gameId) {
      forfeit(gameState.gameId);
      setGameState(prev => ({
        ...prev,
        gameStatus: 'finished',
        winner: prev.currentPlayer === 'blue' ? 'red' : 'blue'
      }));
    }
  };

  const handleSendMessage = (message: string) => {
    if (gameState.gameId) {
      sendChat(gameState.gameId, message);
      const newMessage: ChatMessage = {
        id: `msg-${Date.now()}`,
        player: gameState.playerColor!,
        message,
        timestamp: Date.now(),
      };

      setGameState(prev => ({
        ...prev,
        messages: [...prev.messages, newMessage],
      }));
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-6">
        <GameHeader gameState={gameState} />
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
            onSendMessage={handleSendMessage}
          />
        </div>
      </div>
    </div>
  );
}

export default App;