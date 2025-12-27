import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { Message } from '../types';
import { PilotService } from '../services/PilotService';
import { RoadmapService } from '../services/RoadmapService';
import { supabase } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';
import {
  Send, Paperclip, X, Image as ImageIcon, FileText,
  Sparkles, ArrowUp, Bot, User
} from 'lucide-react';

interface Attachment {
  name: string;
  url: string;
  type: 'image' | 'file';
}

import { OnboardingModal } from './OnboardingModal';
import { markFeatureAsSeen } from './NewBadge';
import { AppTab } from '../types';

export const ProjectPilot: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [input, setInput] = useState('');
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [currentAttachment, setCurrentAttachment] = useState<Attachment | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);

  // Tour State
  const [showTour, setShowTour] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check Local Storage for Tour
  useEffect(() => {
    const TOUR_KEY = 'has_seen_pilot_tour';
    const hasSeen = localStorage.getItem(TOUR_KEY);

    if (!hasSeen) {
      setShowTour(true);
    }
  }, []);

  const handleTourClose = () => {
    const TOUR_KEY = 'has_seen_pilot_tour';
    localStorage.setItem(TOUR_KEY, 'true');
    setShowTour(false);
    // Also mark the badge as seen if it hasn't been already (redundancy)
    markFeatureAsSeen(AppTab.ProjectPilot);
  };

  // Initial Load & Context Check
  useEffect(() => {
    const initChat = async () => {
      if (user && !hasInitialized) {
        // 1. Load History
        const history = await PilotService.loadHistory(user.id);

        // 2. Check for Injected Context (e.g. from Vault)
        const context = PilotService.getContext();

        if (context && context.type === 'file_analysis') {
          // If we have history, just append a new "system" or "pilot" message acknowledging the file
          // If no history, it's a fresh start

          const file = context.file;
          const contextMsg = `I see you want to discuss **${file.original_name}**. \n\nI've loaded the breakdown:\n${file.ai_analysis?.summary}\n\nWhat would you like to know?`;

          setMessages(prev => {
            const newHistory = history.length > 0 ? history : [];
            return [...newHistory, {
              id: 'context-' + Date.now(),
              role: 'pilot',
              text: contextMsg,
              timestamp: 'Now'
            }];
          });
          setHasInitialized(true);
          return;
        }

        if (history.length > 0) {
          setMessages(history);
          setHasInitialized(true);
        } else {
          setIsTyping(true);
          PilotService.sendMessage([], "Start conversation").then(response => {
            setMessages([{
              id: 'init', role: 'pilot', text: response, timestamp: 'Now'
            }]);
            setHasInitialized(true);
            setIsTyping(false);
          });
        }
      }
    };
    initChat();
  }, [user, hasInitialized]);

  // Scroll: Snap on init, smooth after
  useLayoutEffect(() => {
    if (hasInitialized) scrollToBottom('auto');
  }, [hasInitialized]);

  useEffect(() => {
    if (hasInitialized) scrollToBottom('smooth');
  }, [messages, isTyping]);

  const scrollToBottom = (behavior: 'auto' | 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

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

    // --- DEMO INTERCEPTION: Stage 0 Inspiration Verification ---
    const lowerInput = finalInput.toLowerCase();
    const currentStage = user?.currentStage ?? 0;

    if (currentStage === 0 && (lowerInput.includes('inspiration') || lowerInput.includes('ready') || lowerInput.includes('upload') || currentAttachment)) {
      setTimeout(async () => {
        const responseText = "This is perfect. I've analyzed your inspiration style and it seems you prefer a Modern Minimalist aesthetic with high contrast.\n\nI have marked the **'Upload Inspiration'** task as complete for you. You are ready to proceed to the next stage!";

        // Trigger Verification
        if (user) {
          await RoadmapService.verifyTask(user.id, 0, 'inspiration_upload', user.stage_progress || {});
        }

        const pilotMsg: Message = { id: (Date.now() + 1).toString(), role: 'pilot', text: responseText, timestamp: 'Now' };
        setMessages(prev => [...prev, pilotMsg]);
        setIsTyping(false);

        // Save to History (Mock)
        // We won't save valid AI response to history service to avoid pollution or just fire it
        // Actually, let's just mock the UI.
      }, 2000);
      return;
    }
    // -------------------------------------------------------------

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
            <div onClick={() => setLightboxUrl(url)} className="group relative cursor-zoom-in w-full max-w-sm rounded-2xl overflow-hidden border border-white/10 bg-black/50 hover:border-white/30 transition-all shadow-lg">
              <img src={url} alt="attachment" className="w-full h-auto object-cover max-h-64" onLoad={() => scrollToBottom('smooth')} />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
            </div>
          ) : (
            <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 bg-white/[0.05] border border-white/10 rounded-2xl hover:bg-white/[0.1] transition-all group">
              <div className="w-10 h-10 flex items-center justify-center bg-white/10 rounded-xl text-white group-hover:scale-110 transition-transform">
                <FileText size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white/90 truncate">{name}</p>
                <p className="text-[10px] text-white/40 uppercase tracking-widest">Document</p>
              </div>
            </a>
          )}
        </div>
      );
    }
    return text;
  };

  return (
    <div className="flex flex-col h-full bg-black relative">
      <OnboardingModal
        isOpen={showTour}
        onClose={handleTourClose}
        title="Meet Your Helper"
        description="I am your 24/7 AI General Contractor. I don't just chat—I work."
        features={[
          "Analyze contracts & bids for hidden risks.",
          "Answer technical questions about plumbing, framing, or code.",
          "Draft emails to qualified builders on your behalf.",
          "Remember every detail of your project context."
        ]}
        type="TAB_WELCOME"
      />

      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-emerald-500/5 blur-[100px] rounded-full" />
      </div>

      {lightboxUrl && (
        <div className="fixed inset-0 z-[100] bg-black/98 flex items-center justify-center p-4 animate-in fade-in duration-300" onClick={() => setLightboxUrl(null)}>
          <img src={lightboxUrl} className="max-w-full max-h-screen object-contain rounded-lg shadow-2xl scale-in-95 animate-in duration-300" />
          <button className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors">
            <X size={32} />
          </button>
        </div>
      )}

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto px-4 md:px-0 py-8 scroll-smooth no-scrollbar relative z-10 w-full max-w-3xl mx-auto">

        {/* Welcome Spacer */}
        <div className="h-12" />

        {messages.map((m, idx) => {
          const isPilot = m.role === 'pilot';
          return (
            <div key={m.id} className={`flex ${isPilot ? 'justify-start' : 'justify-end'} mb-8 group w-full`}>
              <div className={`max-w-[85%] md:max-w-[80%] flex gap-4 ${isPilot ? 'flex-row' : 'flex-row-reverse'}`}>

                {/* Avatar */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-2 shadow-lg border border-white/5
                            ${isPilot ? 'bg-gradient-to-br from-emerald-500/20 to-black text-emerald-400' : 'bg-white/10 text-white/60'}
                        `}>
                  {isPilot ? <Sparkles size={14} /> : <User size={14} />}
                </div>

                <div className={`space-y-1 ${isPilot ? 'items-start' : 'items-end'} flex flex-col`}>
                  {/* Name */}
                  <span className="text-[9px] uppercase tracking-widest text-white/30 px-1">
                    {isPilot ? 'Project Pilot' : 'You'}
                  </span>

                  {/* Message Bubble */}
                  <div className={`p-4 md:p-6 text-sm leading-7 tracking-wide backdrop-blur-xl border shadow-xl transition-all duration-300
                                ${isPilot
                      ? 'bg-white/[0.03] border-white/5 text-zinc-300 rounded-2xl rounded-tl-sm'
                      : 'bg-white text-black font-medium border-white rounded-2xl rounded-tr-sm'
                    }`}>
                    {renderMessageContent(m.text)}
                  </div>
                </div>

              </div>
            </div>
          )
        })}

        {isTyping && (
          <div className="flex justify-start mb-8 w-full max-w-[85%] gap-4">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 border border-white/5 flex items-center justify-center flex-shrink-0 mt-2">
              <Sparkles size={14} className="animate-pulse" />
            </div>
            <div>
              <span className="text-[9px] uppercase tracking-widest text-white/30 px-1 mb-1 block">Project Pilot</span>
              <div className="bg-white/[0.03] border border-white/5 px-4 py-3 rounded-2xl rounded-tl-sm flex gap-1 items-center h-[48px] w-[80px]">
                <div className="w-1.5 h-1.5 bg-emerald-500/50 rounded-full animate-[bounce_1s_infinite_0ms]"></div>
                <div className="w-1.5 h-1.5 bg-emerald-500/50 rounded-full animate-[bounce_1s_infinite_150ms]"></div>
                <div className="w-1.5 h-1.5 bg-emerald-500/50 rounded-full animate-[bounce_1s_infinite_300ms]"></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} className="h-4" />
      </div>

      {/* Input Area (Sticky Bottom) */}
      <div className="pb-8 pt-4 px-4 sticky bottom-0 bg-gradient-to-t from-black via-black to-transparent z-20 w-full max-w-3xl mx-auto">
        {currentAttachment && (
          <div className="flex items-center gap-3 p-3 bg-[#111] border border-white/10 rounded-xl mb-3 animate-in slide-in-from-bottom-2">
            {currentAttachment.type === 'image' ? <ImageIcon size={16} className="text-purple-400" /> : <Paperclip size={16} className="text-blue-400" />}
            <span className="text-xs text-white truncate max-w-[200px]">{currentAttachment.name}</span>
            <button onClick={() => setCurrentAttachment(null)} className="ml-auto p-1 hover:bg-white/10 rounded text-white/50 hover:text-white">
              <X size={14} />
            </button>
          </div>
        )}

        <div className="relative group flex items-center gap-3 bg-[#0A0A0A] border border-white/10 rounded-[2rem] p-2 pr-2 shadow-2xl focus-within:border-white/30 transition-all">
          <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-colors"
          >
            {isUploading ? <div className="w-4 h-4 border-2 border-t-white rounded-full animate-spin" /> : <Paperclip size={18} />}
          </button>

          <input
            autoFocus
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1 bg-transparent text-sm text-white placeholder:text-zinc-600 outline-none h-10"
            placeholder={isUploading ? "Uploading..." : "Message Project Pilot..."}
            disabled={isUploading}
          />

          <button
            onClick={handleSend}
            disabled={isUploading || (!input.trim() && !currentAttachment)}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white text-black hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all"
          >
            <ArrowUp size={18} strokeWidth={3} />
          </button>
        </div>
        <div className="text-center mt-3">
          <p className="text-[9px] text-zinc-600 uppercase tracking-widest">AI Pilot can make mistakes. Verify important details.</p>
        </div>
      </div>

    </div>
  );
};
