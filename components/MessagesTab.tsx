import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { AppTab } from '../types';
import { OnboardingModal } from './OnboardingModal';
import { markFeatureAsSeen } from './NewBadge';

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
   isRead: boolean;
}

interface Thread {
   id: string;
   partner: ChatUser;
   messages: ChatMessage[];
   unreadCount: number;
}

// --- Mock Data ---
const ME_ID = 'me';

const THREADS: Thread[] = [
   {
      id: '1',
      partner: { id: 'p1', name: 'Precision Builders', avatar: 'https://ui-avatars.com/api/?name=Precision+Builders&background=0D8ABC&color=fff', status: 'online' },
      unreadCount: 2,
      messages: [
         { id: '1', senderId: 'me', text: 'When can we expect the updated bid?', timestamp: '10:00 AM', isRead: true },
         { id: '2', senderId: 'p1', text: 'Just finalizing the lumber package costs.', timestamp: '10:15 AM', isRead: true },
         { id: '3', senderId: 'p1', text: 'I should have it to you by EOD.', timestamp: '10:16 AM', isRead: true },
      ]
   },
   {
      id: '2',
      partner: { id: 'p2', name: 'Studio Arch', avatar: 'https://ui-avatars.com/api/?name=Studio+Arch&background=2E3A59&color=fff', status: 'offline' },
      unreadCount: 0,
      messages: [
         { id: '1', senderId: 'p2', text: 'Here are the revised elevations.', timestamp: 'Yesterday', isRead: true },
         { id: '2', senderId: 'me', text: 'Love the new roofline! Approved.', timestamp: 'Yesterday', isRead: true },
      ]
   },
   {
      id: '3',
      partner: { id: 'p3', name: 'Private Capital', avatar: 'https://ui-avatars.com/api/?name=Private+Capital&background=10B981&color=fff', status: 'typing' },
      unreadCount: 5,
      messages: [
         { id: '1', senderId: 'p3', text: 'Pre-approval letter attached.', timestamp: '2 days ago', isRead: true },
         { id: '2', senderId: 'p3', text: 'We need your updated tax returns.', timestamp: '2 days ago', isRead: true },
      ]
   }
];

export const MessagesTab: React.FC = () => {
   const [activeThreadId, setActiveThreadId] = useState<string>(THREADS[0].id);
   const [input, setInput] = useState('');

   const activeThread = THREADS.find(t => t.id === activeThreadId);

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

   const handleSend = () => {
      if (!input.trim() || !activeThread) return;
      // In a real app, this would update state/DB
      console.log('Sending:', input);
      setInput('');
   };

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
               {THREADS.map(thread => {
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
                              <p className="text-xs text-zinc-500 dark:text-white/50 truncate max-w-[180px]">{lastMsg?.text}</p>
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
                     {activeThread.messages.map((msg, idx) => {
                        const isMe = msg.senderId === ME_ID;
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
