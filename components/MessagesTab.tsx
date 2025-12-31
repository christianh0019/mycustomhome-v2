import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { AppTab } from '../types';
import { OnboardingModal } from './OnboardingModal';
import { ProfileView } from './ProfileView';
import { markFeatureAsSeen } from './NewBadge';
import { FileText, CheckCircle2 } from 'lucide-react';
import { useUI } from '../contexts/UIContext';
import { supabase } from '../services/supabase';
import { DocumentSigner } from './DocumentSigner';
import { DocItem } from './DocumentComponents';

// --- Types ---
interface ChatUser {
   id: string;
   name: string;
   avatar: string;
   status: 'online' | 'offline' | 'typing';
}

interface ChatMessage {
   id: string;
   senderId: string;
   text: string;
   timestamp: string;
   createdAt: string;
   isRead: boolean;
   type?: 'text' | 'signature_request';
   metadata?: {
      documentId?: string; // Correctly referencing documentId
      documentTitle?: string;
      status?: 'pending' | 'signed';
   };
}

interface Thread {
   id: string;
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

   // Signing State
   // When non-null, we are in "Full Screen Signing Mode"
   const [signingDoc, setSigningDoc] = useState<DocItem | null>(null);
   const [signingMessageId, setSigningMessageId] = useState<string | null>(null);

   const activeThread = threads.find(t => t.id === activeThreadId);

   // Tour State
   const [showTour, setShowTour] = useState(false);

   useEffect(() => {
      const TOUR_KEY = 'has_seen_messages_tour';
      if (!localStorage.getItem(TOUR_KEY)) setShowTour(true);
   }, []);

   const handleTourClose = () => {
      localStorage.setItem('has_seen_messages_tour', 'true');
      setShowTour(false);
      markFeatureAsSeen(AppTab.Messages);
   };

   // --- Data Fetching ---
   useEffect(() => {
      if (!user) return;

      const fetchData = async () => {
         setLoading(true);

         // 1. Fetch Matches (where user is either homeowner or vendor)
         const { data: matches, error: matchesError } = await supabase
            .from('matches')
            .select(`
               id,
               status,
               created_at,
               homeowner:homeowner_id (id, full_name, avatar_url, role),
               vendor:vendor_id (id, full_name, avatar_url, role)
            `)
            .or(`homeowner_id.eq.${user.id},vendor_id.eq.${user.id}`)
            .order('created_at', { ascending: false });

         if (matchesError || !matches) {
            console.error('Error fetching matches:', matchesError);
            setThreads([]);
            setLoading(false);
            return;
         }

         if (matches.length === 0) {
            setThreads([]);
            setLoading(false);
            return;
         }

         const matchIds = matches.map(m => m.id);

         // 2. Fetch Messages for these matches
         const { data: messages, error: messagesError } = await supabase
            .from('messages')
            .select('*')
            .in('thread_id', matchIds)
            .order('created_at', { ascending: true });

         // 3. Build Thread Objects
         const builtThreads: Thread[] = matches.map((match: any) => {
            // Determine "Partner" (the other person in the match)
            const isHomeowner = match.homeowner?.id === user.id;
            const partnerProfile = isHomeowner ? match.vendor : match.homeowner;

            // Fallbacks for missing profile data
            const partnerName = partnerProfile?.full_name || (isHomeowner ? 'Vendor' : 'Homeowner');
            const partnerAvatar = partnerProfile?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(partnerName)}&background=random`;

            const leadConf = {
               id: partnerProfile?.id || 'unknown',
               name: partnerName,
               avatar: partnerAvatar,
               status: 'online' as const
            };

            const threadMessages: ChatMessage[] = (messages || [])
               .filter(m => m.thread_id === match.id)
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
               id: match.id, // Thread ID is now Match ID
               partner: leadConf,
               messages: threadMessages,
               unreadCount: threadMessages.filter(m => m.senderId !== 'me' && !m.isRead).length
            };
         });

         // Sort by last message time
         builtThreads.sort((a, b) => {
            const lastMsgA = a.messages[a.messages.length - 1]?.createdAt || a.messages[0]?.createdAt || '';
            const lastMsgB = b.messages[b.messages.length - 1]?.createdAt || b.messages[0]?.createdAt || '';
            return lastMsgB.localeCompare(lastMsgA);
         });

         setThreads(builtThreads);
         setLoading(false);
      };

      fetchData();
      const interval = setInterval(fetchData, 3000);
      return () => clearInterval(interval);
   }, [user]);

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

      setThreads(prev => prev.map(t => t.id === activeThreadId ? { ...t, messages: [...t.messages, optimisticMsg] } : t));
      setInput('');

      const { error } = await supabase.from('messages').insert({
         thread_id: activeThreadId,
         sender_id: user.id,
         text: optimisticMsg.text,
         type: 'text'
      });

      if (error) showToast('Failed to send message.', 'error');
   };

   // --- Open Signing View ---
   const handleSignClick = async (messageId: string, docId: string) => {
      if (!docId) {
         showToast("Invalid document link.", "error");
         return;
      }
      setSigningMessageId(messageId);

      // Fetch strict document data
      const { data, error } = await supabase.from('documents').select('*').eq('id', docId).single();

      if (error || !data) {
         console.error('Error fetching doc:', error);
         showToast("Could not load document.", "error");
         return;
      }
      setSigningDoc(data as DocItem);
   };

   // --- Complete Signing ---
   const handleSignatureComplete = async (docId: string, signedUrl?: string) => {
      if (!signingMessageId || !activeThreadId || !user) return;

      const { error: msgError } = await supabase
         .from('messages')
         .update({
            metadata: {
               ...signingDoc?.metadata,
               documentTitle: signingDoc?.title,
               documentId: docId,
               status: 'signed'
            }
         })
         .eq('id', signingMessageId);

      if (!msgError) {
         // CRITICAL FIX: Also update the document status in the documents table
         await supabase.from('documents').update({ status: 'completed' }).eq('id', docId);

         await supabase.from('messages').insert({
            thread_id: activeThreadId,
            sender_id: user.id,
            text: `Signed ${signingDoc?.title}.`,
            type: 'text'
         });
      }

      setSigningDoc(null);
      setSigningMessageId(null);
      showToast("Document signed successfully!", "success");
   };

   const [viewingProfileId, setViewingProfileId] = useState<string | null>(null);

   // --- RENDER ---

   // 1. Full Screen Signing Mode
   if (signingDoc) {
      return (
         <div className="fixed inset-0 z-50 bg-white dark:bg-black">
            <DocumentSigner
               initialDoc={signingDoc}
               onBack={() => setSigningDoc(null)}
               onSigningComplete={handleSignatureComplete}
               currentUserRole="contact"
            />
         </div>
      );
   }

   // 2. Normal Chat View
   return (
      <div className="h-full flex flex-col md:flex-row bg-zinc-50 dark:bg-black text-zinc-900 dark:text-white relative transition-colors duration-300">
         <OnboardingModal
            isOpen={showTour}
            onClose={handleTourClose}
            title="Unified Communications"
            description="Keep all your conversations in one place."
            features={[]}
            type="TAB_WELCOME"
         />

         {/* Sidebar */}
         <div className={`w-full md:w-80 border-r border-zinc-200 dark:border-white/5 flex flex-col bg-white dark:bg-[#0A0A0A] ${activeThreadId ? 'hidden md:flex' : 'flex'}`}>
            <div className="h-16 px-6 border-b border-zinc-200 dark:border-white/5 flex items-center justify-between shrink-0">
               <h2 className="text-sm font-semibold tracking-widest uppercase">Messages</h2>
               <button className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-white/5 flex items-center justify-center">
                  <span className="text-lg mb-1">+</span>
               </button>
            </div>
            <div className="flex-1 overflow-y-auto">
               {threads.map(thread => (
                  <div
                     key={thread.id}
                     onClick={() => setActiveThreadId(thread.id)}
                     className={`px-5 py-4 flex items-center gap-4 cursor-pointer border-b border-zinc-100 dark:border-white/[0.02] hover:bg-zinc-50 dark:hover:bg-white/[0.02] ${activeThreadId === thread.id ? 'bg-zinc-100 dark:bg-white/[0.05]' : ''}`}
                  >
                     <img src={thread.partner.avatar} className="w-12 h-12 rounded-full object-cover opacity-90" />
                     <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline mb-1">
                           <h3 className="text-sm font-medium truncate pr-2">{thread.partner.name}</h3>
                           <span className="text-[10px] text-zinc-500">{thread.messages[thread.messages.length - 1]?.timestamp}</span>
                        </div>
                        <p className="text-xs text-zinc-500 truncate">{thread.messages[thread.messages.length - 1]?.text}</p>
                     </div>
                  </div>
               ))}
            </div>
         </div>

         {/* Chat Area */}
         <div className={`flex-1 flex flex-col bg-zinc-50 dark:bg-[#050505] relative ${!activeThreadId ? 'hidden md:flex' : 'flex'}`}>

            {/* Profile Overlay */}
            {viewingProfileId && activeThreadId && (
               <div className="absolute inset-0 z-20 bg-white dark:bg-[#0A0A0A] flex flex-col animate-in slide-in-from-right duration-300">
                  <ProfileView
                     profileId={viewingProfileId}
                     matchId={activeThreadId}
                     viewerRole={user?.role === 'business' ? 'business' : 'homeowner'}
                     onClose={() => setViewingProfileId(null)}
                  />
               </div>
            )}

            {activeThread ? (
               <>
                  <div className="h-16 px-6 border-b border-zinc-200 dark:border-white/5 flex items-center justify-between shrink-0 bg-white/80 dark:bg-black/40 backdrop-blur-md">
                     <div className="flex items-center gap-4 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setViewingProfileId(activeThread.partner.id)}>
                        <button onClick={(e) => { e.stopPropagation(); setActiveThreadId(null); }} className="md:hidden">←</button>
                        <img src={activeThread.partner.avatar} className="w-10 h-10 rounded-full" />
                        <div>
                           <h3 className="text-sm font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
                              {activeThread.partner.name}
                              <span className="text-[10px] bg-zinc-100 dark:bg-white/10 px-2 py-0.5 rounded-full text-zinc-500">View Profile</span>
                           </h3>
                           <p className="text-[10px] text-green-500 uppercase tracking-widest font-medium">Online</p>
                        </div>
                     </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-6">
                     {activeThread.messages.map((msg) => {
                        const isMe = msg.senderId === 'me';
                        if (msg.type === 'signature_request' && msg.metadata) {
                           return (
                              <div key={msg.id} className="flex justify-start w-full">
                                 <div className="max-w-[400px] bg-white dark:bg-[#111] border border-zinc-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-lg">
                                    <div className="p-4 border-b border-zinc-100 dark:border-white/5 flex items-center gap-3">
                                       <div className="size-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500"><FileText size={20} /></div>
                                       <div>
                                          <h4 className="font-bold text-sm text-zinc-900 dark:text-white">Signature Requested</h4>
                                          <p className="text-xs text-zinc-500">{msg.metadata.documentTitle}</p>
                                       </div>
                                    </div>
                                    <div className="p-5">
                                       <p className="text-xs text-zinc-600 mb-4">{msg.text}</p>
                                       {msg.metadata.status === 'pending' ? (
                                          <button
                                             onClick={() => handleSignClick(msg.id, msg.metadata?.documentId || '')}
                                             className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs uppercase tracking-widest"
                                          >
                                             Review & Sign
                                          </button>
                                       ) : (
                                          <div className="w-full py-3 bg-emerald-500/10 text-emerald-500 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2">
                                             <CheckCircle2 size={16} /> Signed
                                          </div>
                                       )}
                                    </div>
                                 </div>
                              </div>
                           );
                        }
                        return (
                           <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                              <div className={`px-5 py-3 text-[13px] rounded-2xl max-w-[70%] ${isMe ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white dark:bg-white/10 border border-zinc-200 dark:border-white/5 rounded-tl-none'}`}>
                                 {msg.text}
                              </div>
                           </div>
                        );
                     })}
                  </div>

                  <div className="p-4 border-t border-zinc-200 dark:border-white/5 bg-white/80 dark:bg-black/40 backdrop-blur-md">
                     <div className="flex gap-3 max-w-4xl mx-auto">
                        <input
                           value={input}
                           onChange={(e) => setInput(e.target.value)}
                           onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                           className="flex-1 bg-zinc-100 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/10 rounded-full px-6 py-3 text-sm focus:bg-white outline-none transition-all"
                           placeholder="Type a message..."
                        />
                        <button onClick={handleSend} className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center">↑</button>
                     </div>
                  </div>
               </>
            ) : (
               <div className="flex-1 flex flex-col items-center justify-center text-zinc-400">
                  <div className="text-4xl mb-4">💬</div>
                  <p className="uppercase tracking-widest text-xs">Select a conversation</p>
               </div>
            )}
         </div>
      </div>
   );
};
