
import React, { useState, useEffect } from 'react';

interface ChatbotOverlayProps {
  onClose: () => void;
}

export const ChatbotOverlay: React.FC<ChatbotOverlayProps> = ({ onClose }) => {
  const [messages, setMessages] = useState([
    { role: 'pilot', text: "I've been preparing the architecture for our next phase. Your project is in a safe state." },
    { role: 'pilot', text: "I understand that budget creep is often the primary concern. To protect your vision, I've initialized a secure validation layer. Shall we verify your lending capacity now?" }
  ]);

  const [input, setInput] = useState('');

  const handleExecute = () => {
    if (!input) return;
    setMessages(prev => [...prev, { role: 'user', text: input }]);
    setInput('');
    // Simulated pilot response
    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'pilot', text: "Acknowledged. I am establishing the secure link to our Stage 3 verified partners." }]);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 breathing-fade">
      <div className="w-full max-w-3xl bg-black border border-white/10 h-[650px] flex flex-col relative shadow-[0_0_100px_-20px_rgba(255,255,255,0.1)]">
        {/* Header: Restrained & Authoritative */}
        <div className="p-10 border-b border-white/5 flex justify-between items-center bg-black">
          <div className="space-y-1">
            <h3 className="text-2xl font-serif italic">Pilot Deck / Presence</h3>
            <p className="text-[9px] uppercase tracking-[0.4em] text-white/30">Active Guardian Protection</p>
          </div>
          <button 
            onClick={onClose}
            className="w-12 h-12 border border-white/10 flex items-center justify-center hover:bg-white hover:text-black sharp-transition group"
          >
            <span className="text-xl font-light">✕</span>
          </button>
        </div>

        {/* Presence Space: Breathing Content */}
        <div className="flex-1 overflow-y-auto p-12 space-y-12">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'pilot' ? 'justify-start' : 'justify-end'} breathing-fade`} style={{ animationDelay: `${i * 0.2}s` }}>
              <div className={`max-w-[85%] p-8 text-[11px] leading-relaxed uppercase tracking-[0.2em] ${
                m.role === 'pilot' 
                  ? 'bg-black border border-white/10 text-white/70 font-light' 
                  : 'bg-white text-black font-bold'
              }`}>
                {m.text}
              </div>
            </div>
          ))}
        </div>

        {/* Input: Clean & Minimal */}
        <div className="p-12 border-t border-white/5 bg-black">
          <div className="flex items-end gap-8">
            <div className="flex-1 space-y-2">
              <label className="text-[8px] uppercase tracking-[0.4em] text-white/20">Your Instructions</label>
              <input 
                autoFocus
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleExecute()}
                className="w-full bg-transparent border-b border-white/10 py-3 text-xs tracking-[0.3em] outline-none focus:border-white sharp-transition uppercase placeholder:text-white/10"
                placeholder="PROCEED WITH VALIDATION..."
              />
            </div>
            <button 
              onClick={handleExecute}
              className="px-10 py-4 bg-white text-black text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-white/80 sharp-transition"
            >
              Execute
            </button>
          </div>
          
          <div className="mt-8 flex items-center space-x-4 opacity-10">
             <div className="h-[1px] flex-1 bg-white"></div>
             <span className="text-[7px] uppercase tracking-[0.5em]">Cognitive Sync Nominal</span>
             <div className="h-[1px] flex-1 bg-white"></div>
          </div>
        </div>
      </div>
    </div>
  );
};
