import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { AppTab } from '../types';
import { OnboardingModal } from './OnboardingModal';
import { markFeatureAsSeen } from './NewBadge';
import { SignatureModal } from './SignatureModal';
import { FileText, CheckCircle2 } from 'lucide-react';
import { useUI } from '../contexts/UIContext';
import { supabase } from '../services/supabase';

// --- Types ---
interface ChatUser {
   id: string;
   name: string;
   avatar: string; // We'll generate this from name
   status: 'online' | 'offline' | 'typing';
}

interface ChatMessage {
   id: string;
   senderId: string; // 'me' (user id) or lead id
   text: string;
   timestamp: string; // Display string
   createdAt: string; // ISO string for sorting
   isRead: boolean;
   type?: 'text' | 'signature_request';
   metadata?: {
      documentId?: string;
      documentTitle?: string;
      status?: 'pending' | 'signed';
   };
}

interface Thread {
   id: string; // This is the Lead ID
   partner: ChatUser;
   messages: ChatMessage[];
   unreadCount: number;
}

export const MessagesTab: React.FC = () => {
   const { user } = useAuth();
   const { showToast } = useUI();

   const [threads, setThreads] = useState<Thread[]>([]);
   const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
   const [input, setInput] = useState('');
   const [loading, setLoading] = useState(true);

   // Signature State
   const [signingMessageId, setSigningMessageId] = useState<string | null>(null);

   const activeThread = threads.find(t => t.id === activeThreadId);

   // Tour State
   const [showTour, setShowTour] = useState(false);

   // Check Local Storage for Tour
   useEffect(() => {
      const TOUR_KEY = 'has_seen_messages_tour';
      const hasSeen = localStorage.getItem(TOUR_KEY);

      if (!hasSeen) {
         setShowTour(true);
      }
   }, []);

   const handleTourClose = () => {
      const TOUR_KEY = 'has_seen_messages_tour';
      localStorage.setItem(TOUR_KEY, 'true');
      setShowTour(false);
      markFeatureAsSeen(AppTab.Messages);
   };

   // --- Data Fetching ---
   useEffect(() => {
      if (!user) return;

      const fetchData = async () => {
         setLoading(true);

         // 1. Fetch Leads (Threads)
         // Ensure we handle RLS: User must own the leads
         const { data: leads, error: leadsError } = await supabase
            .from('leads')
            .select('*')
            .order('created_at', { ascending: false });

         if (leadsError) {
            console.error('Error fetching leads:', leadsError);
            return;
         }

         if (!leads || leads.length === 0) {
            setThreads([]);
            setLoading(false);
            return;
         }

         // 2. Fetch Messages for these leads
         const leadIds = leads.map(l => l.id);
         const { data: messages, error: messagesError } = await supabase
            .from('messages')
            .select('*')
            .in('thread_id', leadIds)
            .order('created_at', { ascending: true });

         if (messagesError) console.error('Error fetching messages:', messagesError);

         // 3. Assemble Threads
         const builtThreads: Thread[] = leads.map(lead => {
            const leadConf = {
               id: lead.id,
               name: lead.project_title || 'Untitled Project',
               avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(lead.project_title || 'L')}&background=random&color=fff`,
               status: 'online' as const // Mock status for now
            };

            const threadMessages: ChatMessage[] = (messages || [])
               .filter(m => m.thread_id === lead.id)
               .map(m => ({
                  id: m.id,
                  senderId: m.sender_id === 'me' || m.sender_id === user.id ? 'me' : m.sender_id,
                  text: m.text,
                  timestamp: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  createdAt: m.created_at,
                  isRead: m.is_read || false,
                  type: m.type,
                  metadata: m.metadata
               }));

            return {
               id: lead.id,
               partner: leadConf,
               messages: threadMessages,
               unreadCount: threadMessages.filter(m => m.senderId !== 'me' && !m.isRead).length
            };
         });

         // Sort threads by latest message
         builtThreads.sort((a, b) => {
            const lastMsgA = a.messages[a.messages.length - 1]?.createdAt || '';
            const lastMsgB = b.messages[b.messages.length - 1]?.createdAt || '';
            return lastMsgB.localeCompare(lastMsgA);
         });

         setThreads(builtThreads);
         setLoading(false);

         // Auto-select first thread if none selected
         if (!activeThreadId && builtThreads.length > 0) {
            setActiveThreadId(builtThreads[0].id);
         }
      };

      fetchData();

      // Set up polling interval for new messages
      const interval = setInterval(fetchData, 3000);
      return () => clearInterval(interval);

   }, [user, activeThreadId]);

   const handleSend = async () => {
      if (!input.trim() || !activeThreadId || !user) return;

      const optimisticMsg: ChatMessage = {
         id: 'temp-' + Date.now(),
         senderId: 'me',
         text: input,
         timestamp: 'Just now',
         createdAt: new Date().toISOString(),
         isRead: true,
         type: 'text'
      };

      // Optimistic UI Update
      setThreads(prev => prev.map(t => {
         if (t.id === activeThreadId) {
            return { ...t, messages: [...t.messages, optimisticMsg] };
         }
         return t;
      }));
      setInput('');

      // DB Insert
      const { error } = await supabase.from('messages').insert({
         thread_id: activeThreadId,
         sender_id: user.id, // Current user is sender
         text: optimisticMsg.text,
         type: 'text'
      });

      if (error) {
         console.error('Error sending message:', error);
         showToast('Failed to send message.', 'error');
      }
   };

   const handleSignClick = (messageId: string) => {
      setSigningMessageId(messageId);
   };

   const handleSignatureComplete = async (signatureDataUrl: string) => {
      if (!signingMessageId || !activeThreadId || !user) return;

      const signingMessage = activeThread?.messages.find(m => m.id === signingMessageId);
      if (!signingMessage || !signingMessage.metadata?.documentId) return;

      const docId = signingMessage.metadata.documentId;

      // 1. Update Document Status in DB
      const { error: docError } = await supabase
         .from('documents')
         .update({ status: 'completed' })
         .eq('id', docId);

      if (docError) {
         console.error('Error updating document status:', docError);
         showToast('Failed to sign document.', 'error');
         return;
      }

      // 2. Update Message Metadata in DB
      const newMetadata = { ...signingMessage.metadata, status: 'signed' };

      const { error: msgError } = await supabase
         .from('messages')
         .update({ metadata: newMetadata })
         .eq('id', signingMessageId);

      // 3. Insert Confirmation Message
      if (!msgError) {
         await supabase.from('messages').insert({
            thread_id: activeThreadId,
            sender_id: user.id, // Confirmed by user (acting as signer)
            text: `Signed ${signingMessage.metadata?.documentTitle}.`,
            type: 'text'
         });
      }

      setSigningMessageId(null);
      showToast("Document signed successfully!", "success");
   };

   const signingMessage = activeThread?.messages.find(m => m.id === signingMessageId);

   return (
      <div className="h-full flex flex-col md:flex-row bg-zinc-50 dark:bg-black text-zinc-900 dark:text-white relative transition-colors duration-300">
         <OnboardingModal
            isOpen={showTour}
            onClose={handleTourClose}
            title="Unified Communications"
            description="Keep all your conversations in one place. No more lost emails or scattered texts."
            features={[
               "Project-Based Threads: Chats are organized by partner (Architect, Builder, etc).",
               "Contextual Attachments: Files shared here automatically go to the Vault.",
               "Real-Time Updates: See when your team is online and responding."
            ]}
            type="TAB_WELCOME"
         />

         {/* Signature Modal */}
         <SignatureModal
            isOpen={!!signingMessageId}
            onClose={() => setSigningMessageId(null)}
            onSign={handleSignatureComplete}
            documentTitle={signingMessage?.metadata?.documentTitle || 'Document'}
         />

         {/* --- Sidebar (Thread List) --- */}
         <div className={`w-full md:w-80 border-r border-zinc-200 dark:border-white/5 flex flex-col bg-white dark:bg-[#0A0A0A] ${activeThreadId ? 'hidden md:flex' : 'flex'}`}>

            {/* Header */}
            <div className="h-16 px-6 border-b border-zinc-200 dark:border-white/5 flex items-center justify-between shrink-0">
               <h2 className="text-sm font-semibold tracking-widest uppercase">Messages</h2>
               <button className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 flex items-center justify-center transition-colors">
                  <span className="text-lg mb-1">+</span>
               </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto">
               {loading && threads.length === 0 && (
                  <div className="p-6 text-center text-zinc-400 text-xs">Loading conversations...</div>
               )}
               {!loading && threads.length === 0 && (
                  <div className="p-6 text-center text-zinc-400 text-xs">No conversations yet.</div>
               )}

               {threads.map(thread => {
                  const lastMsg = thread.messages[thread.messages.length - 1];
                  const isActive = activeThreadId === thread.id;

                  return (
                     <div
                        key={thread.id}
                        onClick={() => setActiveThreadId(thread.id)}
                        className={`px-5 py-4 flex items-center gap-4 cursor-pointer transition-all border-b border-zinc-100 dark:border-white/[0.02] hover:bg-zinc-50 dark:hover:bg-white/[0.02] ${isActive ? 'bg-zinc-100 dark:bg-white/[0.05]' : ''}`}
                     >
                        <div className="relative">
                           <img src={thread.partner.avatar} className="w-12 h-12 rounded-full object-cover opacity-90" alt="avatar" />
                           {thread.partner.status === 'online' && (
                              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-black"></div>
                           )}
                        </div>

                        <div className="flex-1 min-w-0">
                           <div className="flex justify-between items-baseline mb-1">
                              <h3 className="text-sm font-medium truncate pr-2 text-zinc-900 dark:text-white">{thread.partner.name}</h3>
                              <span className="text-[10px] text-zinc-500 dark:text-white/30 whitespace-nowrap">{lastMsg?.timestamp}</span>
                           </div>
                           <div className="flex justify-between items-center">
                              <p className="text-xs text-zinc-500 dark:text-white/50 truncate max-w-[180px]">
                                 {lastMsg?.type === 'signature_request' ? '📄 Signature Request' : lastMsg?.text || 'No messages'}
                              </p>
                              {thread.unreadCount > 0 && (
                                 <div className="w-5 h-5 bg-zinc-900 dark:bg-white text-white dark:text-black text-[10px] font-bold rounded-full flex items-center justify-center">
                                    {thread.unreadCount}
                                 </div>
                              )}
                           </div>
                        </div>
                     </div>
                  );
               })}
            </div>
         </div>

         {/* --- Main Chat Area --- */}
         <div className={`flex-1 flex flex-col bg-zinc-50 dark:bg-[#050505] relative ${!activeThreadId ? 'hidden md:flex' : 'flex'}`}>

            {activeThread ? (
               <>
                  {/* Chat Header */}
                  <div className="h-16 px-6 border-b border-zinc-200 dark:border-white/5 flex items-center justify-between shrink-0 bg-white/80 dark:bg-black/40 backdrop-blur-md z-1">
                     <div className="flex items-center gap-4">
                        <button
                           onClick={() => setActiveThreadId(null)}
                           className="md:hidden text-zinc-500 dark:text-white/60 hover:text-zinc-900 dark:hover:text-white mr-2"
                        >
                           ←
                        </button>
                        <img src={activeThread.partner.avatar} className="w-10 h-10 rounded-full" />
                        <div>
                           <h3 className="text-sm font-semibold tracking-wide text-zinc-900 dark:text-white">{activeThread.partner.name}</h3>
                           <p className="text-[10px] text-green-500 uppercase tracking-wider font-medium">
                              {activeThread.partner.status === 'typing' ? 'Typing...' : activeThread.partner.status}
                           </p>
                        </div>
                     </div>
                     <div className="flex gap-4 text-white/40">
                        <button className="hover:text-white transition-colors">📞</button>
                        <button className="hover:text-white transition-colors">ℹ️</button>
                     </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-6">
                     {activeThread.messages.length === 0 && (
                        <div className="text-center text-zinc-400 text-sm mt-10">Start a conversation via the documents tab or type below.</div>
                     )}

                     {activeThread.messages.map((msg, idx) => {
                        const isMe = msg.senderId === 'me';

                        // Signature Request Card
                        if (msg.type === 'signature_request' && msg.metadata) {
                           return (
                              <div key={msg.id} className="flex justify-start w-full">
                                 <div className="max-w-[85%] md:max-w-[400px] bg-white dark:bg-[#111] border border-zinc-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-lg">
                                    {/* Card Header */}
                                    <div className="p-4 border-b border-zinc-100 dark:border-white/5 bg-zinc-50 dark:bg-white/[0.02] flex items-center gap-3">
                                       <div className="size-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                                          <FileText size={20} />
                                       </div>
                                       <div>
                                          <h4 className="font-bold text-sm text-zinc-900 dark:text-white">Signature Requested</h4>
                                          <p className="text-xs text-zinc-500 dark:text-zinc-400">{msg.metadata.documentTitle}</p>
                                       </div>
                                    </div>

                                    {/* Card Body */}
                                    <div className="p-5">
                                       <p className="text-xs text-zinc-600 dark:text-zinc-300 mb-4 leading-relaxed">
                                          {msg.text}
                                       </p>

                                       {msg.metadata.status === 'pending' ? (
                                          <button
                                             onClick={() => handleSignClick(msg.id)}
                                             className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
                                          >
                                             Review & Sign
                                          </button>
                                       ) : (
                                          <div className="w-full py-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2">
                                             <CheckCircle2 size={16} /> Signed
                                          </div>
                                       )}
                                    </div>
                                 </div>
                              </div>
                           )
                        }

                        // Standard Text Message
                        return (
                           <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} group`}>
                              <div className={`max-w-[85%] md:max-w-[70%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                                 <div
                                    className={`px-5 py-3 text-[13px] leading-relaxed shadow-sm ${isMe
                                       ? 'bg-indigo-600 dark:bg-white text-white dark:text-black rounded-l-2xl rounded-tr-2xl'
                                       : 'bg-white dark:bg-white/10 text-zinc-800 dark:text-white border border-zinc-200 dark:border-white/5 rounded-r-2xl rounded-tl-2xl'
                                       }`}
                                 >
                                    {msg.text}
                                 </div>
                                 <div className="flex items-center gap-1 mt-1 px-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="text-[10px] text-zinc-400 dark:text-white/30">{msg.timestamp}</span>
                                    {isMe && msg.isRead && <span className="text-[10px] text-blue-400">✓✓</span>}
                                 </div>
                              </div>
                           </div>
                        );
                     })}
                  </div>

                  {/* Input Area */}
                  <div className="p-4 md:p-6 bg-white/80 dark:bg-black/40 border-t border-zinc-200 dark:border-white/5 backdrop-blur-md">
                     <div className="flex items-center gap-3 max-w-4xl mx-auto">
                        <button className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 text-zinc-500 dark:text-white/50 hover:text-zinc-900 dark:hover:text-white transition-colors flex items-center justify-center">
                           📎
                        </button>
                        <input
                           value={input}
                           onChange={(e) => setInput(e.target.value)}
                           onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                           className="flex-1 bg-zinc-100 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white rounded-full px-6 py-3 text-sm focus:border-indigo-500 dark:focus:border-white/20 focus:bg-white dark:focus:bg-white/[0.05] outline-none transition-all placeholder:text-zinc-400 dark:placeholder:text-white/20"
                           placeholder="Type a message..."
                        />
                        <button
                           onClick={handleSend}
                           className="w-10 h-10 rounded-full bg-indigo-600 dark:bg-white text-white dark:text-black hover:scale-105 active:scale-95 transition-all flex items-center justify-center font-bold"
                        >
                           ↑
                        </button>
                     </div>
                  </div>
               </>
            ) : (
               /* Empty State */
               <div className="flex-1 flex flex-col items-center justify-center text-zinc-400 dark:text-white/30 select-none">
                  <div className="w-20 h-20 bg-zinc-100 dark:bg-white/5 rounded-full flex items-center justify-center text-4xl mb-6">
                     💬
                  </div>
                  <p className="uppercase tracking-widest text-xs">Select a conversation</p>
               </div>
            )}
         </div>
      </div>
   );
};
