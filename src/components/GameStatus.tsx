import React from 'react';
import { Loader2, Users, Trophy, AlertCircle } from 'lucide-react';

interface GameStatusProps {
  gameStatus: 'waiting' | 'playing' | 'finished' | 'draw';
  onFindGame?: () => void;
  winner?: 'blue' | 'red' | null;
}

export const GameStatus: React.FC<GameStatusProps> = ({
  gameStatus,
  onFindGame,
  winner
}) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 text-center shadow-xl">
        {gameStatus === 'waiting' && (
          <div className="space-y-4">
            <div className="flex justify-center">
              <Loader2 className="w-12 h-12 text-orange-500 animate-spin" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">En attente d'un adversaire</h2>
            <p className="text-gray-600">
              Un autre joueur devrait bientôt vous rejoindre...
            </p>
          </div>
        )}

        {gameStatus === 'playing' && (
          <div className="space-y-4">
            <div className="flex justify-center">
              <Users className="w-12 h-12 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">La partie commence !</h2>
            <p className="text-gray-600">
              Un adversaire a été trouvé. Bonne chance !
            </p>
          </div>
        )}

        {gameStatus === 'finished' && (
          <div className="space-y-4">
            <div className="flex justify-center">
              {winner ? (
                <Trophy className="w-12 h-12 text-yellow-500" />
              ) : (
                <AlertCircle className="w-12 h-12 text-red-500" />
              )}
            </div>
            <h2 className="text-2xl font-bold text-gray-800">
              {winner 
                ? `Le joueur ${winner === 'blue' ? 'Bleu' : 'Rouge'} a gagné !`
                : 'Partie terminée'}
            </h2>
            <button
              onClick={onFindGame}
              className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              Nouvelle partie
            </button>
          </div>
        )}

        {gameStatus === 'draw' && (
          <div className="space-y-4">
            <div className="flex justify-center">
              <Users className="w-12 h-12 text-blue-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Match nul !</h2>
            <p className="text-gray-600">
              Les deux joueurs ont connecté leurs pions simultanément.
            </p>
            <button
              onClick={onFindGame}
              className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              Nouvelle partie
            </button>
          </div>
        )}
      </div>
    </div>
  );
}