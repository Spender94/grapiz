import React, { useState } from 'react';
import { Player, ChatMessage } from '../types/game';

interface ChatAreaProps {
  messages: ChatMessage[];
  currentPlayer: Player;
  onSendMessage: (message: string) => void;
}

export const ChatArea: React.FC<ChatAreaProps> = ({
  messages,
  currentPlayer,
  onSendMessage,
}) => {
  const [newMessage, setNewMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      onSendMessage(newMessage.trim());
      setNewMessage('');
    }
  };

  return (
    <div className="w-full md:w-2/5 h-[400px] md:h-auto relative rounded-lg overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#FCD07C] via-[#F5A21A] to-[#BA8C43]" />
      <div className="absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-white/95 to-transparent z-10" />
      <div className="relative z-20 p-4 flex flex-col h-full">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Chat</h2>
        <div className="flex-1 overflow-y-auto mb-4 space-y-2">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`p-2 rounded-lg max-w-[80%] ${
                msg.player === currentPlayer
                  ? 'ml-auto bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-800'
              }`}
            >
              <p className="text-sm">{msg.message}</p>
              <span className="text-xs opacity-75">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </span>
            </div>
          ))}
        </div>
        <form onSubmit={handleSubmit} className="mt-auto">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Tapez votre message..."
            className="w-full p-3 rounded-lg bg-[#AC5800] text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/30"
          />
        </form>
      </div>
    </div>
  );
}