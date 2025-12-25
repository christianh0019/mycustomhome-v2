
import React from 'react';
import { Partner } from '../types';

const CURATED_PARTNERS: Partner[] = [
  { id: '1', name: 'Friendly Builders', category: 'Builders', transparencyScore: 9.8, status: 'Vetted', history: 'Made 14 houses' },
  { id: '2', name: 'Best Architects', category: 'Designers', transparencyScore: 9.4, status: 'Active Bid', history: 'Great drawings' },
  { id: '3', name: 'Helpful Realtors', category: 'Land Finders', transparencyScore: 9.1, status: 'Vetted', history: '32 perfect spots' },
  { id: '4', name: 'Smart Engineers', category: 'Fixers', transparencyScore: 8.8, status: 'Partner', history: 'Expert builders' },
];

export const Partners: React.FC = () => {
  return (
    <div className="p-6 md:p-12 lg:p-24 max-w-6xl mx-auto w-full breathing-fade pb-32">
      <div className="mb-12 md:mb-20 space-y-2">
        <h2 className="text-4xl md:text-6xl font-serif tracking-tighter">The Team</h2>
        <p className="text-[10px] md:text-[11px] uppercase tracking-[0.4em] text-white/30">People we trust to help us</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12">
        {CURATED_PARTNERS.map((p) => (
          <div key={p.id} className="bg-[#050505] border border-white/5 p-8 md:p-12 flex flex-col justify-between min-h-[300px] md:h-[360px] group hover:border-white/20 transition-all cursor-pointer">
            <div className="flex justify-between items-start gap-4">
              <div className="space-y-1">
                <span className="text-[9px] uppercase tracking-[0.3em] text-white/30">{p.category}</span>
                <h3 className="text-2xl md:text-3xl font-serif tracking-tight">{p.name}</h3>
              </div>
              <div className="flex flex-col items-center p-3 md:p-4 border border-white/10 bg-black group-hover:border-white transition-all min-w-[60px]">
                <span className="text-[7px] uppercase tracking-[0.2em] text-white/40 mb-1">Score</span>
                <span className="text-xl md:text-2xl font-serif">{p.transparencyScore}</span>
              </div>
            </div>

            <div className="space-y-6">
              <div className="p-4 md:p-6 bg-white/[0.02] border border-white/5">
                <p className="text-[10px] tracking-widest opacity-80">{p.history}</p>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                  <span className="text-[9px] uppercase tracking-[0.3em] font-bold">{p.status}</span>
                </div>
                <button className="text-[9px] uppercase tracking-[0.3em] border-b border-white/20 pb-1 group-hover:border-white transition-all">
                  Show Details
                </button>
              </div>
            </div>
          </div>
        ))}

        <div className="md:col-span-2 border border-dashed border-white/10 p-12 md:p-20 flex flex-col items-center justify-center space-y-6 opacity-40 hover:opacity-100 transition-opacity text-center">
           <h4 className="text-2xl font-serif italic">Need someone else?</h4>
           <p className="text-[10px] uppercase tracking-[0.2em] max-w-xs leading-relaxed">
             I can help you find more experts for your house!
           </p>
           <button className="w-full md:w-auto px-10 py-4 border border-white text-white text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-white hover:text-black transition-all">
              Help Me Search
           </button>
        </div>
      </div>
    </div>
  );
};
