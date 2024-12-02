import React, { useState, useRef, useEffect } from 'react';
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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      onSendMessage(newMessage.trim());
      setNewMessage('');
    }
  };

  return (
    <div className="w-full md:w-2/5 h-[calc(100vh-12rem)] relative rounded-lg overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#FCD07C] via-[#F5A21A] to-[#BA8C43]" />
      <div className="absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-white/95 to-transparent z-10" />
      <div className="relative z-20 p-4 flex flex-col h-full">
        <div className="text-[#AE670C] font-['Verdana'] text-xs md:text-sm mb-4 leading-tight">
          ATTENTION : Les touches F5, Alt-F4, Control-W ou autres ferment ou relancent Frutiparc et vous font perdre la partie. Ne les utilisez pas !
        </div>
        <div className="flex-1 overflow-y-auto mb-4 space-y-2">
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className="text-[#AE670C] font-['Verdana'] text-xs md:text-sm leading-relaxed"
            >
              <span className="font-semibold">
                {msg.player === 'blue' ? 'Joueur Bleu' : 'Joueur Rouge'}
              </span>
              {' > '}
              <span>{msg.message}</span>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <form onSubmit={handleSubmit} className="mt-auto">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Tapez votre message..."
            className="w-full p-3 rounded-lg bg-[#AC5800] text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/30 font-['Verdana'] text-sm"
          />
        </form>
      </div>
    </div>
  );
}