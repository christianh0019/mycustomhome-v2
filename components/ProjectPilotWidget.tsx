import React, { useState, useEffect, useRef } from 'react';
import { Message } from '../types';
import { PilotService } from '../services/PilotService';
import { supabase } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useAIContext } from '../hooks/useAIContext';
import { AnimatePresence, motion } from 'framer-motion';
import {
    Send, Paperclip, X, Image as ImageIcon, FileText,
    Sparkles, ArrowUp, Bot, User, Maximize2, Minimize2, MessageSquare
} from 'lucide-react';

interface Attachment {
    name: string;
    url: string;
    type: 'image' | 'file';
}

export const ProjectPilotWidget: React.FC = () => {
    const { user } = useAuth();
    const { activeTab, currentContext } = useAIContext();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [isTyping, setIsTyping] = useState(false);
    const [input, setInput] = useState('');
    const [currentAttachment, setCurrentAttachment] = useState<Attachment | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [hasInitialized, setHasInitialized] = useState(false);

    // Notifications
    const [notification, setNotification] = useState<string | null>(null);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Initial Load
    useEffect(() => {
        const initChat = async () => {
            if (user && !hasInitialized) {
                const history = await PilotService.loadHistory(user.id);
                if (history.length > 0) {
                    setMessages(history);
                } else {
                    setMessages([{
                        id: 'init', role: 'pilot', text: "I'm here to help. Ask me anything about your project.", timestamp: 'Now'
                    }]);
                }
                setHasInitialized(true);
            }
        };
        initChat();
    }, [user, hasInitialized]);

    // Auto-scroll
    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
            // Clear notification when opened
            setNotification(null);
        }
    }, [messages, isOpen]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSend = async (overrideText?: string) => {
        const textToSend = overrideText || input;
        if ((!textToSend.trim() && !currentAttachment) || isTyping || isUploading) return;

        let finalInput = textToSend;
        if (currentAttachment) {
            const attachmentMsg = `[Attachment: ${currentAttachment.name}](${currentAttachment.url})`;
            finalInput = finalInput ? `${finalInput}\n\n${attachmentMsg}` : attachmentMsg;
        }

        const userMsg: Message = { id: Date.now().toString(), role: 'user', text: finalInput, timestamp: 'Now' };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setCurrentAttachment(null);
        setIsTyping(true);

        // Inject Context if using Analyze feature
        let contextPrefix = "";
        if (overrideText?.includes("Analyze this screen")) {
            contextPrefix = `[CONTEXT: ${currentContext}] \n\n`;
        }

        // We pass the context silently to the backend usually, but for this demo, 
        // we'll just prepend it to the prompt sent to PilotService if needed, 
        // or PilotService handles it. Here, let's assume PilotService handles history.
        // We will prepend context for the "AI" to see it in the message history logic.

        const response = await PilotService.sendMessage(messages, contextPrefix + finalInput, user?.id);
        const pilotMsg: Message = { id: (Date.now() + 1).toString(), role: 'pilot', text: response, timestamp: 'Now' };

        setMessages(prev => [...prev, pilotMsg]);
        setIsTyping(false);

        // If closed, show notification
        if (!isOpen) {
            setNotification("New reply from Pilot");
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !user) return;

        setIsUploading(true);
        try {
            const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
            const filePath = `${user.id}/${fileName}`;
            const { error } = await supabase.storage.from('chat-attachments').upload(filePath, file);
            if (error) throw error;
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
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <>
            {/* TOGGLE BUTTON */}
            <motion.div
                className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
            >
                {/* Notification Bubble */}
                <AnimatePresence>
                    {!isOpen && notification && (
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-white text-black text-xs font-medium px-4 py-2 rounded-xl shadow-xl mb-2 relative"
                        >
                            {notification}
                            <div className="absolute bottom-[-4px] right-6 w-2 h-2 bg-white rotate-45" />
                        </motion.div>
                    )}
                </AnimatePresence>

                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={`group flex items-center justify-center size-14 rounded-full shadow-2xl transition-all duration-300 ${isOpen ? 'bg-zinc-800 text-white' : 'bg-white text-black hover:scale-110'}`}
                >
                    {isOpen ? <X size={24} /> : <Sparkles size={24} className={notification ? 'animate-pulse' : ''} />}
                </button>
            </motion.div>

            {/* CHAT WINDOW */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="fixed bottom-24 right-6 w-[400px] h-[600px] max-h-[80vh] bg-[#0A0A0A]/95 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl z-50 flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                            <div className="flex items-center gap-3">
                                <div className="size-8 rounded-full bg-gradient-to-br from-emerald-500/20 to-emerald-900/20 flex items-center justify-center border border-emerald-500/30">
                                    <Sparkles size={14} className="text-emerald-400" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-white">Project Pilot</h3>
                                    <div className="flex items-center gap-1.5 opacity-50">
                                        <div className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="text-[10px] uppercase tracking-wider">Online</span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => handleSend(`Analyze this screen: ${activeTab}`)}
                                className="text-[10px] uppercase tracking-wider bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white px-3 py-1.5 rounded-lg transition-colors border border-white/5"
                            >
                                ✨ Analyze Tab
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
                            {messages.map((m) => {
                                const isPilot = m.role === 'pilot';
                                return (
                                    <div key={m.id} className={`flex ${isPilot ? 'justify-start' : 'justify-end'} gap-3`}>
                                        {isPilot && (
                                            <div className="size-6 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                                                <Sparkles size={12} className="text-emerald-400" />
                                            </div>
                                        )}
                                        <div className={`max-w-[85%] rounded-2xl p-3 text-sm leading-relaxed ${isPilot
                                                ? 'bg-white/5 text-zinc-300 border border-white/5 rounded-tl-none'
                                                : 'bg-white text-black font-medium rounded-tr-none'
                                            }`}>
                                            {m.text}
                                        </div>
                                    </div>
                                );
                            })}
                            {isTyping && (
                                <div className="flex justify-start gap-3">
                                    <div className="size-6 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                                        <Sparkles size={12} className="text-emerald-400" />
                                    </div>
                                    <div className="bg-white/5 rounded-2xl rounded-tl-none p-3 h-10 flex items-center gap-1">
                                        <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce" />
                                        <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce delay-75" />
                                        <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce delay-150" />
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div className="p-4 bg-black/40 border-t border-white/5">
                            {currentAttachment && (
                                <div className="flex items-center gap-2 mb-2 p-2 bg-white/5 rounded-lg border border-white/5">
                                    <Paperclip size={12} className="text-blue-400" />
                                    <span className="text-xs text-zinc-300 truncate max-w-[200px]">{currentAttachment.name}</span>
                                    <button onClick={() => setCurrentAttachment(null)} className="ml-auto text-zinc-500 hover:text-white"><X size={12} /></button>
                                </div>
                            )}
                            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl p-1 pr-2 focus-within:border-white/20 transition-colors">
                                <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="p-2 text-zinc-500 hover:text-white transition-colors"
                                >
                                    <Paperclip size={18} />
                                </button>
                                <input
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder="Message Project Pilot..."
                                    className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-white placeholder:text-zinc-600 h-9"
                                    disabled={isUploading}
                                />
                                <button
                                    onClick={() => handleSend()}
                                    disabled={!input.trim() && !currentAttachment}
                                    className="p-2 bg-white text-black rounded-lg hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all"
                                >
                                    <ArrowUp size={16} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};
