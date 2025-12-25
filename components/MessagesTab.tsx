
import React, { useState } from 'react';
import { Message } from '../types';

const THREADS = [
  { id: '1', partner: 'Precision Builders', lastMsg: 'More things added to the bill...', date: '2h ago', risk: true },
  { id: '2', partner: 'Design Team', lastMsg: 'Windows look great!', date: '5h ago', risk: false },
  { id: '3', partner: 'Land Agent', lastMsg: 'The land is ready.', date: '1d ago', risk: false },
];

export const MessagesTab: React.FC = () => {
  const [selectedThread, setSelectedThread] = useState(THREADS[0]);
  const [showList, setShowList] = useState(true);

  return (
    <div className="p-4 md:p-12 lg:p-24 max-w-6xl mx-auto w-full breathing-fade pb-32">
      <div className="mb-8 md:mb-16">
        <h2 className="text-4xl md:text-6xl font-serif tracking-tighter">Chatting</h2>
        <p className="text-[10px] uppercase tracking-[0.4em] text-white/30 mt-2 md:mt-4">I'm watching your talks</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 md:gap-12">
        {/* Thread List - Hidden on mobile when chat is open */}
        <div className={`lg:col-span-1 space-y-3 ${!showList ? 'hidden lg:block' : 'block'}`}>
           {THREADS.map(t => (
             <div 
               key={t.id} 
               onClick={() => { setSelectedThread(t); setShowList(false); }}
               className={`p-5 md:p-6 border modern-transition cursor-pointer ${selectedThread.id === t.id ? 'bg-white text-black border-white' : 'bg-[#050505] border-white/5 hover:border-white/20'}`}
             >
                <div className="flex justify-between items-start mb-1">
                   <span className="text-[9px] uppercase tracking-[0.2em] font-bold">{t.partner}</span>
                   <span className="text-[7px] opacity-40 uppercase">{t.date}</span>
                </div>
                <p className="text-[10px] truncate opacity-80 uppercase tracking-widest">{t.lastMsg}</p>
                {t.risk && <div className="mt-3 h-[2px] w-full bg-red-500/50"></div>}
             </div>
           ))}
        </div>

        {/* Conversation View */}
        <div className={`lg:col-span-3 border border-white/10 bg-[#050505] flex flex-col h-[600px] ${showList ? 'hidden lg:flex' : 'flex'}`}>
           <div className="p-5 md:p-8 border-b border-white/5 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <button onClick={() => setShowList(true)} className="lg:hidden text-xl">←</button>
                <h4 className="text-xl md:text-2xl font-serif italic truncate">{selectedThread.partner}</h4>
              </div>
              {selectedThread.risk && <span className="text-[8px] uppercase tracking-[0.2em] text-red-500 font-bold hidden md:block">Watch out!</span>}
           </div>

           <div className="flex-1 overflow-y-auto p-6 md:p-12 space-y-8 md:space-y-12">
              <div className="flex justify-start">
                 <div className="max-w-[90%] md:max-w-[80%] space-y-2">
                    <span className="text-[8px] uppercase tracking-[0.3em] opacity-30 font-bold">{selectedThread.partner}</span>
                    <div className="p-5 md:p-8 bg-black border border-white/10 text-[11px] md:text-[12px] uppercase tracking-[0.1em] leading-relaxed">
                       "I need more money because the ground has rocks in it."
                    </div>
                 </div>
              </div>

              {/* AI INTERVENTION */}
              <div className="border border-red-500/30 bg-red-500/5 p-6 md:p-8 flex flex-col items-center text-center space-y-4 breathing-fade">
                 <span className="text-[10px] uppercase tracking-[0.4em] text-red-500 font-bold">Your Guide Says:</span>
                 <p className="text-[11px] md:text-[12px] uppercase tracking-[0.1em] leading-relaxed max-w-sm">
                    "Builders need to show proof first. I wrote a note asking them to prove it so your money stays safe."
                 </p>
                 <button className="w-full md:w-auto px-8 py-3 bg-red-500 text-white text-[9px] uppercase tracking-[0.2em] font-bold hover:bg-red-600 transition-all">
                    Send My Note
                 </button>
              </div>

              <div className="flex justify-end">
                 <div className="max-w-[90%] md:max-w-[80%] space-y-2">
                    <span className="text-[8px] uppercase tracking-[0.3em] opacity-30 font-bold text-right block">You</span>
                    <div className="p-5 md:p-8 bg-white text-black text-[11px] md:text-[12px] uppercase tracking-[0.1em] leading-relaxed font-bold">
                       "Thanks! Let's wait for proof."
                    </div>
                 </div>
              </div>
           </div>

           <div className="p-6 md:p-8 border-t border-white/5">
              <input className="w-full bg-transparent border-b border-white/10 py-3 text-[11px] tracking-[0.1em] outline-none focus:border-white uppercase placeholder:text-white/10" placeholder="TYPE MESSAGE..." />
           </div>
        </div>
      </div>
    </div>
  );
};
