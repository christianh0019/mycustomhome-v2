
import React, { useState, useEffect, useRef } from 'react';
import { Message } from '../types';
import { PilotService } from '../services/PilotService';
import { supabase } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';

export const ProjectPilot: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [input, setInput] = useState('');
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const initChat = async () => {
      if (user) {
        setIsTyping(true);
        const history = await PilotService.loadHistory(user.id);
        if (history.length > 0) {
          setMessages(history);
          setIsTyping(false);
        } else {
          PilotService.sendMessage([], "Start conversation").then(response => {
            setMessages([{
              id: 'init', role: 'pilot', text: response, timestamp: 'Now'
            }]);
            setIsTyping(false);
          });
        }
      }
    };
    initChat();
  }, [user]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  const sendToPilot = async (text: string) => {
    if (!text.trim() || isTyping) return;
    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: text, timestamp: 'Now' };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);
    const response = await PilotService.sendMessage(messages, text, user?.id);
    const pilotMsg: Message = { id: (Date.now() + 1).toString(), role: 'pilot', text: response, timestamp: 'Now' };
    setMessages(prev => [...prev, pilotMsg]);
    setIsTyping(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    try {
      const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
      const filePath = `${user.id}/${fileName}`;
      const { error } = await supabase.storage.from('chat-attachments').upload(filePath, file);
      if (error) { alert('Upload failed'); return; }
      const { data: { publicUrl } } = supabase.storage.from('chat-attachments').getPublicUrl(filePath);

      const attachmentMsg = `[Attachment: ${file.name}](${publicUrl})`;
      // Send immediately
      await sendToPilot(attachmentMsg);
    } catch (err) { console.error(err); }
  };

  // --- RENDERER ---
  const renderMessageContent = (text: string) => {
    const attachMatch = text.match(/\[Attachment: (.*?)\]\((.*?)\)/);
    if (attachMatch) {
      const [fullStr, name, url] = attachMatch;
      const pureText = text.replace(fullStr, '').trim();
      const isImage = /\.(jpg|jpeg|png|webp|gif)$/i.test(url);

      return (
        <div className="space-y-4">
          {pureText && <p>{pureText}</p>}
          {isImage ? (
            <div onClick={() => setLightboxUrl(url)} className="group relative cursor-zoom-in w-full max-w-sm rounded-lg overflow-hidden border border-white/10 bg-black/50 hover:border-white/30 modern-transition">
              <img src={url} alt="attachment" className="w-full h-auto object-cover max-h-64" />
              <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/60 backdrop-blur-sm text-[10px] text-white/70 truncate opacity-0 group-hover:opacity-100 transition-opacity">
                {name}
              </div>
            </div>
          ) : (
            <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors group">
              <div className="w-10 h-10 flex items-center justify-center bg-white/10 rounded-md text-xl group-hover:scale-110 transition-transform">📄</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white/90 truncate">{name}</p>
                <p className="text-[10px] text-white/50 uppercase tracking-wider">Document</p>
              </div>
            </a>
          )}
        </div>
      );
    }
    return text;
  };

  return (
    <div className="h-full flex flex-col bg-black max-w-4xl mx-auto w-full px-4 md:px-12 relative">
      {/* LIGHTBOX */}
      {lightboxUrl && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 animate-in fade-in" onClick={() => setLightboxUrl(null)}>
          <img src={lightboxUrl} className="max-w-full max-h-screen object-contain rounded-md shadow-2xl" />
          <button className="absolute top-8 right-8 text-white/50 hover:text-white text-4xl">&times;</button>
        </div>
      )}

      <div ref={scrollRef} className="flex-1 overflow-y-auto py-10 md:py-20 space-y-10 md:space-y-12 pr-1">
        {messages.map((m, idx) => (
          <div key={m.id} className={`flex ${m.role === 'pilot' ? 'justify-start' : 'justify-end'} breathing-fade`} style={{ animationDelay: `${idx * 100}ms` }}>
            <div className="max-w-[90%] md:max-w-[85%] space-y-2">
              <div className={`flex items-center space-x-2 mb-1 ${m.role === 'pilot' ? 'opacity-50' : 'opacity-50 justify-end'}`}>
                {m.role === 'pilot' && <div className="w-3 h-[1px] bg-white"></div>}
                <span className="text-[8px] uppercase tracking-[0.3em] font-semibold">{m.role === 'pilot' ? 'Guide' : 'You'}</span>
                {m.role !== 'pilot' && <div className="w-3 h-[1px] bg-white"></div>}
              </div>
              <div className={`p-5 md:p-8 text-[12px] md:text-[13px] leading-relaxed tracking-wider border backdrop-blur-sm modern-transition ${m.role === 'pilot' ? 'bg-white/[0.03] border-white/10 text-white/90' : 'bg-white text-black font-semibold border-white shadow-[0_10px_30px_rgba(255,255,255,0.05)]'}`}>
                {renderMessageContent(m.text)}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="pb-8 pt-4 sticky bottom-0 bg-black/80 backdrop-blur-lg border-t border-white/5 -mx-4 px-4 md:mx-0 md:px-0">
        <div className="relative group max-w-3xl mx-auto flex items-center gap-3">
          <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
          <button onClick={() => fileInputRef.current?.click()} className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white modern-transition">📎</button>
          <input
            autoFocus value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendToPilot(input)}
            className="flex-1 bg-white/5 border border-white/10 rounded-full py-4 px-6 text-[12px] tracking-[0.1em] outline-none focus:border-white/40 modern-transition placeholder:text-white/20"
            placeholder="TYPE YOUR INSTRUCTION..."
          />
          <button onClick={() => sendToPilot(input)} className="w-12 h-12 flex items-center justify-center bg-white text-black rounded-full font-bold modern-transition shadow-xl active:scale-90">↑</button>
        </div>
      </div>
    </div>
  );
};
