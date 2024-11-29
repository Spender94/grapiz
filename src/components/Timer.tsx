import React from 'react';
import { Player } from '../types/game';

interface TimerProps {
  player: Player;
  time: number;
  isActive: boolean;
}

export const Timer: React.FC<TimerProps> = ({ player, time, isActive }) => {
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;

  return (
    <div className={`
      p-4 h-full flex items-center gap-4
      ${player === 'blue' 
        ? 'bg-gradient-to-b from-[#902300] to-[#F56C00]' 
        : 'bg-gradient-to-b from-[#902300] to-[#F56C00]'}
      ${isActive ? 'ring-2 ring-yellow-300 ring-opacity-50' : ''}
      text-white rounded-lg
    `}>
      <div className="w-16 h-16 bg-white/10 rounded-lg flex items-center justify-center">
        {/* Placeholder for avatar */}
        <div className="w-12 h-12 rounded-full bg-white/20" />
      </div>
      <div>
        <h3 className="text-lg font-bold mb-1 text-white/90">
          {player === 'blue' ? 'Joueur Bleu' : 'Joueur Rouge'}
        </h3>
        <p className="text-2xl font-mono tracking-wider">
          {minutes.toString().padStart(2, '0')}:
          {seconds.toString().padStart(2, '0')}
        </p>
      </div>
    </div>
  );
}