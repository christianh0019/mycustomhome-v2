
import React, { useState, useEffect, useRef } from 'react';
import { Message } from '../types';
import { PilotService } from '../services/PilotService';

export const ProjectPilot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Initial greeting
  useEffect(() => {
    if (messages.length === 0) {
      setIsTyping(true);
      PilotService.sendMessage([], "Start conversation").then(response => {
        setMessages([{
          id: 'init',
          role: 'pilot',
          text: response,
          timestamp: 'Just now'
        }]);
        setIsTyping(false);
      });
    }
  }, []);

  // Autoscroll effect
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    // Add User Message
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: 'Now'
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Get AI Response
    const response = await PilotService.sendMessage(messages, input);

    const pilotMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: 'pilot',
      text: response,
      timestamp: 'Now'
    };
    setMessages(prev => [...prev, pilotMsg]);
    setIsTyping(false);
  };

  return (
    <div className="h-full flex flex-col bg-black max-w-4xl mx-auto w-full px-4 md:px-12">
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto py-10 md:py-20 space-y-10 md:space-y-12 pr-1"
      >
        {messages.map((m, idx) => (
          <div
            key={m.id}
            className={`flex ${m.role === 'pilot' ? 'justify-start' : 'justify-end'} breathing-fade`}
            style={{ animationDelay: `${idx * 100}ms` }}
          >
            <div className="max-w-[90%] md:max-w-[85%] space-y-2">
              <div className={`flex items-center space-x-2 mb-1 ${m.role === 'pilot' ? 'opacity-50' : 'opacity-50 justify-end'}`}>
                {m.role === 'pilot' && <div className="w-3 h-[1px] bg-white"></div>}
                <span className="text-[8px] uppercase tracking-[0.3em] font-semibold">
                  {m.role === 'pilot' ? 'Guide' : 'You'}
                </span>
                {m.role !== 'pilot' && <div className="w-3 h-[1px] bg-white"></div>}
              </div>
              <div className={`p-5 md:p-8 text-[12px] md:text-[13px] leading-relaxed tracking-wider border backdrop-blur-sm modern-transition ${m.role === 'pilot'
                ? 'bg-white/[0.03] border-white/10 text-white/90'
                : 'bg-white text-black font-semibold border-white shadow-[0_10px_30px_rgba(255,255,255,0.05)]'
                }`}>
                {m.text}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="pb-8 pt-4 sticky bottom-0 bg-black/80 backdrop-blur-lg border-t border-white/5 -mx-4 px-4 md:mx-0 md:px-0">
        <div className="relative group max-w-3xl mx-auto flex items-center gap-3">
          <input
            autoFocus
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1 bg-white/5 border border-white/10 rounded-full py-4 px-6 text-[12px] tracking-[0.1em] outline-none focus:border-white/40 modern-transition placeholder:text-white/20"
            placeholder="TYPE YOUR INSTRUCTION..."
          />
          <button
            onClick={handleSend}
            className="w-12 h-12 flex items-center justify-center bg-white text-black rounded-full font-bold modern-transition shadow-xl active:scale-90"
          >
            ↑
          </button>
        </div>
      </div>
    </div>
  );
};
