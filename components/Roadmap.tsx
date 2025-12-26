
import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const STAGES = [
  { id: 0, name: "Hello!", desc: "Getting started", icon: "☺" },
  { id: 1, name: "Our Dream", desc: "Thinking of the house", icon: "◬" },
  { id: 2, name: "The Bank", desc: "Checking the piggy bank", icon: "◇" },
  { id: 3, name: "The Helpers", desc: "Finding friendly lenders", icon: "◈" },
  { id: 4, name: "The Land", desc: "Finding the perfect spot", icon: "▧" },
  { id: 5, name: "The Plan", desc: "Drawing the house", icon: "▤" },
  { id: 6, name: "Building!", desc: "Making it real", icon: "▣" },
  { id: 7, name: "Welcome Home", desc: "Moving in!", icon: "■" },
];

export const Roadmap: React.FC = () => {
  const { user } = useAuth();
  const currentStageIndex = user?.currentStage || 0;

  return (
    <div className="p-6 md:p-12 lg:p-24 max-w-7xl mx-auto w-full breathing-fade pb-32">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-20">
        {/* Left: The Visual House Build */}
        <div className="lg:col-span-1 border border-white/10 p-8 md:p-12 flex flex-col items-center justify-center space-y-6 md:space-y-10 bg-[#080808] modern-transition hover:border-white/20">
          <span className="text-[9px] uppercase tracking-[0.4em] text-white/50 text-center">Development Sketch</span>
          <div className="w-full aspect-[4/5] border border-white/10 relative flex items-center justify-center p-6 md:p-8 overflow-hidden bg-black shadow-inner">
            <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>

            <div className="relative w-full h-full flex items-center justify-center">
              <div className="w-3/4 h-1/2 border-2 border-white/30 relative modern-transition">
                <div className="absolute -top-10 left-0 w-full h-10 border-t-2 border-l-2 border-r-2 border-white/10 -skew-x-12"></div>
                <div className="absolute inset-4 border border-dashed border-white/5"></div>
                <div className="absolute bottom-2 left-2 text-[8px] uppercase tracking-[0.2em] text-white/30">STEP {currentStageIndex}</div>
              </div>
              <div className="absolute inset-0 bg-emerald-500/[0.08] blur-[80px] rounded-full animate-pulse"></div>
            </div>
          </div>
          <div className="text-center space-y-2">
            <h4 className="text-2xl font-serif italic text-white/90">The Skeleton</h4>
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/60 leading-relaxed max-w-[200px] mx-auto">
              {STAGES[currentStageIndex]?.name || 'Unknown Stage'}
            </p>
          </div>
        </div>

        {/* Right: The List Path */}
        <div className="lg:col-span-2 space-y-12">
          <div className="space-y-3">
            <h2 className="text-4xl md:text-6xl font-serif tracking-tighter">The Map</h2>
            <div className="h-[1px] w-12 bg-white/30"></div>
          </div>

          <div className="space-y-12 relative pl-2">
            <div className="absolute left-[13px] top-0 bottom-0 w-[1px] bg-white/10"></div>
            {STAGES.map((s, i) => {
              const active = s.id === currentStageIndex;
              const past = s.id < currentStageIndex;
              return (
                <div key={s.id} className={`relative pl-12 modern-transition ${active ? 'opacity-100 scale-100' : (past ? 'opacity-50' : 'opacity-30 hover:opacity-70')}`}>
                  <div className={`absolute left-0 top-1 w-7 h-7 border modern-transition flex items-center justify-center ${active ? 'bg-white border-white scale-110 shadow-[0_0_20px_rgba(255,255,255,0.2)]' : (past ? 'bg-white/20 border-transparent' : 'bg-black border-white/20')
                    }`}>
                    <span className={`text-[10px] font-bold ${active ? 'text-black' : 'text-white/60'}`}>{past ? '✓' : s.icon}</span>
                  </div>
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
                    <div>
                      <h3 className={`text-2xl md:text-3xl font-serif tracking-tight modern-transition ${active ? 'text-white' : 'text-white/80'}`}>{s.name}</h3>
                      <p className="text-[9px] uppercase tracking-[0.3em] mt-1 text-white/40">{s.desc}</p>
                    </div>
                    {active && <span className="text-[8px] uppercase tracking-[0.4em] font-bold border border-white/40 px-4 py-1.5 w-max backdrop-blur-sm">Active Guide</span>}
                  </div>
                  {active && (
                    <div className="mt-8 p-8 bg-white text-black shadow-2xl relative overflow-hidden">
                      <p className="text-[12px] leading-relaxed italic mb-6 font-medium">
                        "Your Guide: We're almost done with the dream part. I'm checking the budget to keep your 'Treasure Chest' full!"
                      </p>
                      <button className="text-[10px] font-bold uppercase tracking-[0.3em] border-b-2 border-black/20 pb-1 hover:border-black modern-transition">
                        Continue Dreaming
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
