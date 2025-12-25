
import React from 'react';

const CATEGORIES = [
  { name: "Our Dreams", count: 12, desc: "Ideas for the house" },
  { id: "money", name: "The Money", count: 4, desc: "Savings and bank" },
  { name: "The Land", count: 8, desc: "Our future garden" },
  { name: "The Build", count: 15, desc: "Worker agreements" },
];

export const Vault: React.FC = () => {
  return (
    <div className="p-6 md:p-12 lg:p-24 max-w-7xl mx-auto w-full breathing-fade pb-32">
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-6 mb-12 md:mb-24">
        <div className="space-y-2">
          <h2 className="text-4xl md:text-6xl font-serif tracking-tighter">The Safe Box</h2>
          <p className="text-[10px] md:text-[11px] uppercase tracking-[0.4em] text-white/50">Stored securely and privately</p>
        </div>
        <button className="w-full md:w-auto px-10 py-4 bg-white text-black text-[10px] md:text-[11px] uppercase tracking-[0.3em] font-bold hover:bg-white/90 modern-transition shadow-xl">
          Add New File
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 mb-16 md:mb-24">
        {CATEGORIES.map((cat, i) => (
          <div key={i} className="group border border-white/10 p-6 md:p-12 bg-[#080808] hover:border-white/40 modern-transition cursor-pointer flex flex-col justify-between aspect-square hover:bg-[#0c0c0c]">
            <div className="flex justify-between items-start">
               <span className="text-xl md:text-3xl font-serif text-white/10">0{i+1}</span>
               <div className="w-1.5 h-1.5 rounded-full bg-white/10 group-hover:bg-white modern-transition"></div>
            </div>
            <div className="space-y-1 md:space-y-3">
              <h4 className="text-lg md:text-2xl font-serif text-white/90 truncate">{cat.name}</h4>
              <p className="text-[8px] uppercase tracking-[0.2em] text-white/40 hidden md:block">{cat.desc}</p>
            </div>
            <span className="text-[8px] md:text-[10px] uppercase tracking-[0.2em] text-white/60">{cat.count} Items</span>
          </div>
        ))}
      </div>

      <div className="border border-white/10 bg-[#050505] overflow-hidden shadow-2xl">
        <div className="p-6 md:p-10 border-b border-white/5 flex justify-between items-center bg-[#0a0a0a]">
           <span className="text-[9px] md:text-[11px] uppercase tracking-[0.4em] text-white/50 font-semibold">The Archive</span>
           <span className="text-[8px] md:text-[11px] uppercase tracking-[0.3em] text-emerald-400/60 font-bold">Secure Link</span>
        </div>
        <div className="divide-y divide-white/5">
           {[
             { name: "Land_Paper_Final.pdf", category: "The Land", audit: "Looks Good!", date: "Oct 15" },
             { name: "Money_Plan_Step1.xls", category: "The Money", audit: "Check now", date: "Oct 12", risk: true },
             { name: "House_Pictures_V1.pdf", category: "Dreams", audit: "Verified", date: "Oct 09" }
           ].map((file, idx) => (
             <div key={idx} className="p-6 md:p-10 flex justify-between items-center group cursor-pointer hover:bg-white/[0.03] modern-transition">
                <div className="flex flex-col space-y-1 flex-1 min-w-0 pr-4">
                   <span className="text-[12px] md:text-[13px] uppercase tracking-[0.1em] font-medium truncate group-hover:text-white transition-colors">{file.name}</span>
                   <div className="flex items-center space-x-3 md:space-x-6">
                      <span className="text-[8px] text-white/40 uppercase tracking-[0.1em]">{file.category}</span>
                      <span className="text-[8px] text-white/20 uppercase">/</span>
                      <span className="text-[8px] text-white/40 uppercase tracking-[0.1em]">{file.date}</span>
                   </div>
                </div>
                <div className="flex items-center space-x-4 md:space-x-16">
                   <div className="flex flex-col items-end">
                      <span className={`text-[8px] md:text-[10px] uppercase tracking-[0.2em] font-bold ${file.risk ? 'text-red-400' : 'text-emerald-400/80'}`}>
                        {file.audit}
                      </span>
                   </div>
                   <div className="w-8 h-8 md:w-12 md:h-12 border border-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-black modern-transition">
                      ↓
                   </div>
                </div>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
};
