import React, { useState, useEffect } from 'react';
import { GameMode, AILevel } from '../types/game';
import { UserCircle2, Bot, Globe, Users } from 'lucide-react';
import { io } from 'socket.io-client';

interface GameControlsProps {
  gameMode: GameMode;
  aiLevel: AILevel;
  onGameModeChange: (mode: GameMode, aiLevel?: AILevel) => void;
}

export const GameControls: React.FC<GameControlsProps> = ({
  gameMode,
  aiLevel,
  onGameModeChange,
}) => {
  const [connectedPlayers, setConnectedPlayers] = useState<number>(0);
  const [socket, setSocket] = useState<any>(null);

  useEffect(() => {
    const newSocket = io('https://grapiz.onrender.com', {
      transports: ['websocket', 'polling'],
      path: '/socket.io/'
    });

    newSocket.on('connect', () => {
      console.log('Connected to server for player count');
    });

    newSocket.on('playerCount', (count: number) => {
      console.log('Received player count:', count);
      setConnectedPlayers(count);
    });

    setSocket(newSocket);

    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, []);

  return (
    <div className="flex flex-wrap gap-4 mb-4">
      <button
        onClick={() => onGameModeChange('self')}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
          gameMode === 'self'
            ? 'bg-orange-600 text-white'
            : 'bg-gray-600 text-white hover:bg-gray-700'
        }`}
      >
        <UserCircle2 className="w-5 h-5" />
        <span>Analyse</span>
      </button>

      <button
        onClick={() => onGameModeChange('online')}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
          gameMode === 'online'
            ? 'bg-blue-600 text-white'
            : 'bg-blue-500 text-white hover:bg-blue-600'
        }`}
      >
        <Globe className="w-5 h-5" />
        <span>Trouver un adversaire</span>
      </button>

      <button
        onClick={() => onGameModeChange('ai', 'gaspard')}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
          gameMode === 'ai' && aiLevel === 'gaspard'
            ? 'bg-orange-600 text-white'
            : 'bg-gray-600 text-white hover:bg-gray-700'
        }`}
      >
        <Bot className="w-5 h-5" />
        <span>Gaspard</span>
      </button>

      <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg">
        <Users className="w-5 h-5 text-gray-600" />
        <span className="text-gray-700">{connectedPlayers} connecté{connectedPlayers > 1 ? 's' : ''}</span>
      </div>
    </div>
  );
}