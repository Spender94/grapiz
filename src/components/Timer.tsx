import React from 'react';
import { Player } from '../types/game';
import { User } from 'lucide-react';

interface TimerProps {
  player: Player;
  time: number;
  isActive: boolean;
  gameMode: 'self' | 'ai' | 'online';
  aiLevel?: 'noob' | 'gaspard' | null;
}

export const Timer: React.FC<TimerProps> = ({ 
  player, 
  time, 
  isActive, 
  gameMode,
  aiLevel 
}) => {
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;

  const playerName = player === 'blue' 
    ? 'Joueur Bleu'
    : gameMode === 'online'
      ? 'Joueur Rouge'
      : gameMode === 'self'
        ? 'Joueur Rouge'
        : 'Gaspard';

  const showAvatar = player === 'red' && gameMode === 'ai' && aiLevel === 'gaspard';

  return (
    <div className={`
      p-4 h-full flex items-center gap-4
      ${player === 'blue' 
        ? 'bg-gradient-to-b from-[#902300] to-[#F56C00]' 
        : 'bg-gradient-to-b from-[#902300] to-[#F56C00]'}
      ${isActive ? 'ring-2 ring-yellow-300 ring-opacity-50' : ''}
      text-white rounded-lg
    `}>
      <div className="w-16 h-16 bg-white/10 rounded-lg flex items-center justify-center overflow-hidden">
        {showAvatar ? (
          <img 
            src="/gaspard.png"
            alt="Gaspard"
            className="w-full h-full object-cover"
          />
        ) : (
          <User className="w-10 h-10 text-white/90" />
        )}
      </div>
      <div>
        <h3 className="text-lg font-bold mb-1 text-white/90">
          {playerName}
        </h3>
        <p className="text-2xl font-mono tracking-wider">
          {minutes.toString().padStart(2, '0')}:
          {seconds.toString().padStart(2, '0')}
        </p>
      </div>
    </div>
  );
}