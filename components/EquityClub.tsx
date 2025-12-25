
import React from 'react';

export const EquityClub: React.FC = () => {
  return (
    <div className="p-6 md:p-12 lg:p-24 max-w-7xl mx-auto w-full space-y-12 md:space-y-24 breathing-fade pb-32">
      <div className="flex flex-col md:flex-row md:justify-between md:items-end border-b border-white/10 pb-10 md:pb-16 gap-6">
        <div className="space-y-3">
          <h2 className="text-4xl md:text-7xl font-serif tracking-tighter">The Treasure Chest</h2>
          <p className="text-[10px] md:text-[11px] uppercase tracking-[0.4em] text-white/50 text-center md:text-left">Your rewards & savings</p>
        </div>
        <div className="text-center md:text-right space-y-1 md:space-y-2 bg-emerald-500/5 p-6 md:p-0 rounded-xl md:bg-transparent">
          <p className="text-[10px] md:text-[11px] uppercase tracking-[0.3em] text-white/50">Current Total</p>
          <h3 className="text-5xl md:text-7xl font-serif rebate-text tracking-tighter">$14,250</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
        {/* Luxury Card Section */}
        <div className="bg-[#080808] border border-white/10 p-10 md:p-16 h-[380px] md:h-[450px] flex flex-col justify-between group hover:border-emerald-400/40 modern-transition cursor-pointer relative rebate-glow overflow-hidden shadow-2xl">
           <div className="absolute top-0 right-0 p-8 md:p-10">
              <div className="w-12 h-12 md:w-14 md:h-14 border border-white/10 flex items-center justify-center opacity-30 modern-transition rotate-12 group-hover:rotate-0">
                <span className="font-serif text-2xl md:text-3xl">☺</span>
              </div>
           </div>
           
           <div className="space-y-2">
              <span className="text-[10px] md:text-[11px] uppercase tracking-[0.4em] text-white/40 font-bold">Preferred Member</span>
              <h4 className="text-3xl md:text-4xl font-serif italic tracking-tight text-white/90">Johnathan Doe</h4>
           </div>

           <div className="space-y-8 md:space-y-12 z-10">
              <div className="space-y-2">
                 <p className="text-[9px] md:text-[10px] uppercase tracking-[0.4em] text-white/50">Your House Reward</p>
                 <p className="text-5xl md:text-6xl font-serif rebate-text">$14,250.00</p>
              </div>
              <div className="flex justify-between items-end border-t border-white/5 pt-6 md:pt-8">
                 <div className="flex items-center space-x-3">
                    <div className="w-8 h-[1px] bg-white/30"></div>
                    <span className="text-[8px] md:text-[9px] uppercase tracking-[0.4em] text-white/60">Verified</span>
                 </div>
                 <span className="text-[8px] md:text-[9px] uppercase tracking-[0.3em] text-emerald-400/90 font-bold animate-pulse">Asset Safe</span>
              </div>
           </div>
           <div className="absolute -bottom-16 -right-16 w-64 h-64 border border-white/[0.03] rotate-45 opacity-20"></div>
        </div>

        {/* Detailed Breakdown */}
        <div className="space-y-12 md:space-y-20 py-4 md:py-10">
           <div className="space-y-8 md:space-y-10">
              <h4 className="text-xl md:text-2xl font-serif italic border-b border-white/10 pb-6 text-white/80">Where it comes from</h4>
              <div className="space-y-8 md:space-y-10">
                {[
                  { name: "Architect Bonus", amount: "$2,500", source: "Friendly Builders" },
                  { name: "Build Bonus", amount: "$11,750", source: "Best Architects" }
                ].map((item, i) => (
                  <div key={i} className="flex justify-between items-center group modern-transition border-l-2 border-transparent hover:border-emerald-400/40 hover:pl-4 md:hover:pl-6">
                    <div className="space-y-1 md:space-y-2">
                      <p className="text-[10px] md:text-[11px] uppercase tracking-[0.3em] font-bold text-white/90">{item.name}</p>
                      <p className="text-[9px] md:text-[10px] uppercase tracking-[0.2em] text-white/40">{item.source}</p>
                    </div>
                    <span className="text-2xl md:text-3xl font-serif text-white/90 group-hover:text-emerald-400 transition-colors">{item.amount}</span>
                  </div>
                ))}
              </div>
           </div>

           <div className="p-8 md:p-12 border border-white/10 bg-[#080808] flex flex-col items-center text-center space-y-6 md:space-y-8">
              <p className="text-[10px] md:text-[11px] uppercase tracking-[0.3em] text-white/50 leading-relaxed max-w-sm font-medium">
                I watch your money to keep it safe for your beautiful new home.
              </p>
              <button className="w-full md:w-auto px-12 py-5 bg-white text-black text-[10px] md:text-[11px] uppercase tracking-[0.4em] font-bold hover:bg-white/90 modern-transition shadow-2xl active:scale-95">
                Full Money Report
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};
