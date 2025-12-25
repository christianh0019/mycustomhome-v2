
import React from 'react';
import { StageGauge } from './StageGauge';
import { AuditFeed } from './AuditFeed';

interface HomeBaseProps {
  onOpenChat: () => void;
}

export const HomeBase: React.FC<HomeBaseProps> = ({ onOpenChat }) => {
  return (
    <div className="p-12 lg:p-20 max-w-7xl mx-auto w-full breathing-fade space-y-24">
      {/* Pilot's Note: The Sanctuary Focal Point */}
      <section className="flex flex-col items-center">
        <div className="relative w-full max-w-4xl">
          <div className="bg-white text-black p-16 lg:p-24 w-full shadow-2xl relative z-10">
            <div className="flex items-center space-x-4 mb-10 opacity-40">
              <div className="w-12 h-[1px] bg-black"></div>
              <span className="text-[9px] tracking-[0.5em] uppercase font-bold">The Pilot's Note</span>
            </div>
            
            <h2 className="text-4xl lg:text-5xl font-serif leading-[1.2] mb-12">
              Your vision has been successfully quantified. To maintain our current momentum, we shall now unlock Stage 3 lending partners through a brief financial validation.
            </h2>
            
            <button 
              onClick={onOpenChat}
              className="group flex items-center space-x-6 px-12 py-5 bg-black text-white text-[10px] tracking-[0.4em] uppercase hover:bg-[#111] sharp-transition"
            >
              <span>Initiate Validation</span>
              <span className="group-hover:translate-x-1 sharp-transition">→</span>
            </button>
          </div>
          {/* Subtle architectural background shadow */}
          <div className="absolute -bottom-6 -right-6 w-full h-full border border-white/10 -z-0"></div>
        </div>
      </section>

      {/* Sanctuary Modules */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 pt-12">
        {/* The Treasury (Equity Club) */}
        <div className="bg-black border border-white/10 p-10 h-[280px] flex flex-col justify-between group hover:border-white/30 sharp-transition cursor-pointer relative rebate-glow">
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase tracking-[0.4em] text-white/30">The Treasury</span>
            <div className="w-6 h-6 border border-white/10 flex items-center justify-center opacity-20">
              <span className="text-[8px]">§</span>
            </div>
          </div>
          <div>
            <p className="text-[9px] uppercase tracking-[0.3em] text-white/30 mb-2">Accrued Equity Rebate</p>
            <h3 className="text-5xl font-serif rebate-text tracking-tight">$14,250</h3>
          </div>
          <div className="flex justify-between items-center text-[9px] tracking-[0.3em] text-white/20">
            <span>CERTIFIED LEAD STATUS</span>
            <span className="text-white/40">TIER 1</span>
          </div>
        </div>

        {/* Cognitive Empathy: Financial Guardrails */}
        <div className="bg-[#080808] border border-white/5 p-10 flex flex-col items-center justify-between h-[280px]">
          <div className="w-full text-left">
            <span className="text-[10px] uppercase tracking-[0.4em] text-white/30">Current Guardrails</span>
          </div>
          <StageGauge score={742} label="CREDIT CAPACITY" />
          <div className="w-full grid grid-cols-2 gap-4 border-t border-white/5 pt-6">
             <div className="flex flex-col">
               <span className="text-[8px] text-white/20 uppercase mb-1">DTI Ratio</span>
               <span className="text-[10px] tracking-widest">22% — Safe</span>
             </div>
             <div className="flex flex-col text-right">
               <span className="text-[8px] text-white/20 uppercase mb-1">Max Power</span>
               <span className="text-[10px] tracking-widest">$1.2M</span>
             </div>
          </div>
        </div>

        {/* Protection: The Audit Feed */}
        <div className="bg-[#080808] border border-white/5 p-10 flex flex-col h-[280px]">
          <div className="flex items-center justify-between mb-8">
            <span className="text-[10px] uppercase tracking-[0.4em] text-white/30">Protective Audit</span>
            <div className="w-2 h-2 rounded-full bg-white/20"></div>
          </div>
          <div className="flex-1 overflow-y-auto pr-2">
            <AuditFeed limit={2} />
          </div>
        </div>
      </div>

      <footer className="pt-24 pb-12 flex flex-col items-center space-y-6 opacity-20 hover:opacity-40 sharp-transition">
        <div className="h-[1px] w-24 bg-white"></div>
        <p className="text-[9px] uppercase tracking-[0.5em] text-center">
          Building with restraint. Managed with precision.
        </p>
      </footer>
    </div>
  );
};
