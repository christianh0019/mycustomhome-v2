
import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { Message } from '../types';
import { PilotService } from '../services/PilotService';
import { supabase } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';

interface Attachment {
  name: string;
  url: string;
  type: 'image' | 'file';
}

export const ProjectPilot: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [input, setInput] = useState('');
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [currentAttachment, setCurrentAttachment] = useState<Attachment | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // State to track if we've done the initial load scroll
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initial Load
  useEffect(() => {
    const initChat = async () => {
      if (user) {
        // Don't show typing indicator immediately, just load history
        const history = await PilotService.loadHistory(user.id);
        if (history.length > 0) {
          setMessages(history);
          setInitialLoadComplete(true);
        } else {
          setIsTyping(true);
          PilotService.sendMessage([], "Start conversation").then(response => {
            setMessages([{
              id: 'init', role: 'pilot', text: response, timestamp: 'Now'
            }]);
            setInitialLoadComplete(true);
            setIsTyping(false);
          });
        }
      }
    };
    initChat();
  }, [user]);

  // Scroll Logic
  useLayoutEffect(() => {
    if (scrollRef.current) {
      // If it's the very first load or a massive update, snap to bottom instantly
      // Otherwise, smooth scroll for new messages
      const behavior = initialLoadComplete ? 'smooth' : 'auto';

      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: behavior
      });
    }
  }, [messages, initialLoadComplete]);

  const handleSend = async () => {
    if ((!input.trim() && !currentAttachment) || isTyping || isUploading) return;

    let finalInput = input;

    if (currentAttachment) {
      const attachmentMsg = `[Attachment: ${currentAttachment.name}](${currentAttachment.url})`;
      finalInput = finalInput ? `${finalInput}\n\n${attachmentMsg}` : attachmentMsg;
    }

    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: finalInput, timestamp: 'Now' };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setCurrentAttachment(null);
    setIsTyping(true);

    const response = await PilotService.sendMessage(messages, finalInput, user?.id);
    const pilotMsg: Message = { id: (Date.now() + 1).toString(), role: 'pilot', text: response, timestamp: 'Now' };
    setMessages(prev => [...prev, pilotMsg]);
    setIsTyping(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setIsUploading(true);
    try {
      const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
      const filePath = `${user.id}/${fileName}`;
      const { error } = await supabase.storage.from('chat-attachments').upload(filePath, file);
      if (error) { alert('Upload failed'); setIsUploading(false); return; }
      const { data: { publicUrl } } = supabase.storage.from('chat-attachments').getPublicUrl(filePath);

      const isImage = /\.(jpg|jpeg|png|webp|gif)$/i.test(file.name);
      setCurrentAttachment({
        name: file.name,
        url: publicUrl,
        type: isImage ? 'image' : 'file'
      });
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      console.error(err);
      alert('Upload error');
    } finally {
      setIsUploading(false);
    }
  };

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
            <div onClick={() => setLightboxUrl(url)} className="group relative cursor-zoom-in w-full max-w-sm rounded-lg overflow-hidden border border-white/10 bg-black/50 hover:border-white/30 modern-transition shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-50"></div>
              <img src={url} alt="attachment" className="w-full h-auto object-cover max-h-64" />
              <div className="absolute bottom-0 left-0 right-0 p-3 bg-black/60 backdrop-blur-md text-[10px] text-white/90 truncate opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                {name}
              </div>
            </div>
          ) : (
            <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 bg-white/[0.03] border border-white/10 rounded-xl hover:bg-white/[0.08] transition-all group hover:scale-[1.02] hover:shadow-lg">
              <div className="w-10 h-10 flex items-center justify-center bg-white/10 rounded-lg text-xl group-hover:scale-110 transition-transform">📄</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white/90 truncate">{name}</p>
                <p className="text-[9px] text-white/40 uppercase tracking-widest">Document</p>
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
      {lightboxUrl && (
        <div className="fixed inset-0 z-[100] bg-black/98 flex items-center justify-center p-4 animate-in fade-in duration-300" onClick={() => setLightboxUrl(null)}>
          <img src={lightboxUrl} className="max-w-full max-h-screen object-contain rounded-sm shadow-2xl scale-in-95 animate-in duration-300" />
          <button className="absolute top-8 right-8 text-white/50 hover:text-white text-4xl transition-colors">&times;</button>
        </div>
      )}

      <div ref={scrollRef} className="flex-1 overflow-y-auto py-10 md:py-20 space-y-8 pr-1 no-scrollbar">
        {messages.map((m, idx) => (
          <div key={m.id} className={`flex ${m.role === 'pilot' ? 'justify-start' : 'justify-end'} group`}>
            <div className={`max-w-[90%] md:max-w-[85%] space-y-2 animate-in slide-in-from-bottom-2 duration-500 fade-in fill-mode-backwards`} style={{ animationDelay: `${idx * 50}ms` }}>
              <div className={`flex items-center space-x-2 mb-1 ${m.role === 'pilot' ? 'opacity-50' : 'opacity-50 justify-end'}`}>
                {m.role === 'pilot' && <div className="w-3 h-[1px] bg-white"></div>}
                <span className="text-[9px] uppercase tracking-[0.3em] font-medium text-white/60">
                  {m.role === 'pilot' ? 'Guide' : 'You'}
                </span>
                {m.role !== 'pilot' && <div className="w-3 h-[1px] bg-white"></div>}
              </div>
              <div className={`p-5 md:p-8 text-[13px] md:text-[14px] leading-relaxed tracking-wide border backdrop-blur-md transition-all duration-300 ${m.role === 'pilot'
                ? 'bg-white/[0.02] border-white/5 text-white/80 rounded-tr-2xl rounded-br-2xl rounded-bl-2xl'
                : 'bg-white text-black font-medium border-white shadow-[0_10px_40px_rgba(255,255,255,0.1)] rounded-tl-2xl rounded-bl-2xl rounded-br-2xl'
                }`}>
                {renderMessageContent(m.text)}
              </div>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start animate-in fade-in duration-500">
            <div className="bg-white/[0.02] border border-white/5 px-6 py-4 rounded-full flex gap-1 items-center">
              <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        )}
      </div>

      <div className="pb-8 pt-6 sticky bottom-0 bg-gradient-to-t from-black via-black/95 to-transparent backdrop-blur-sm -mx-4 px-4 md:mx-0 md:px-0 z-10 transition-all overflow-hidden">
        {currentAttachment && (
          <div className="mx-auto max-w-3xl mb-4 flex items-center gap-3 p-3 bg-white/[0.03] border border-white/10 rounded-xl animate-in slide-in-from-bottom-2 backdrop-blur-md">
            {currentAttachment.type === 'image' ? (
              <img src={currentAttachment.url} className="w-12 h-12 rounded object-cover border border-white/10 shadow-sm" />
            ) : (
              <div className="w-12 h-12 flex items-center justify-center bg-white/10 rounded text-xl">📄</div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-white/50 uppercase tracking-wider mb-0.5">Attached</p>
              <p className="text-xs font-medium text-white/90 truncate">{currentAttachment.name}</p>
            </div>
            <button
              onClick={() => setCurrentAttachment(null)}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-white/40 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
        )}

        <div className="relative group max-w-3xl mx-auto flex items-center gap-3">
          <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className={`w-12 h-12 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all transform hover:scale-105 active:scale-95 border border-transparent hover:border-white/10 ${isUploading ? 'animate-pulse' : ''}`}
          >
            {isUploading ? '...' : '📎'}
          </button>
          <input
            autoFocus value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1 bg-white/[0.03] hover:bg-white/[0.05] focus:bg-white/[0.08] border border-white/10 rounded-full py-4 px-8 text-[13px] tracking-[0.05em] outline-none focus:border-white/20 transition-all placeholder:text-white/20 shadow-inner"
            placeholder={isUploading ? "Uploading..." : "Type your instruction..."}
            disabled={isUploading}
          />
          <button
            onClick={handleSend}
            disabled={isUploading || (!input.trim() && !currentAttachment)}
            className="w-14 h-14 flex items-center justify-center bg-white text-black rounded-full font-bold transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 disabled:shadow-none"
          >
            ↑
          </button>
        </div>
      </div>
    </div>
  );
};
