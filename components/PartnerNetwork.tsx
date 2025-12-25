
import React from 'react';

export const PartnerNetwork: React.FC = () => {
  const partners = [
    { name: "Sterling & Sons", category: "Architects", score: 98, status: "Vetted" },
    { name: "Luxe Frame Co.", category: "Builders", score: 94, status: "Active Bid" },
    { name: "Prime Lot Group", category: "Realtors", score: 91, status: "Vetted" },
    { name: "Concrete Collective", category: "Engineers", score: 88, status: "Awaiting Review" },
  ];

  return (
    <div className="p-12 max-w-5xl mx-auto w-full">
      <h2 className="text-5xl font-serif mb-4">Partner Network</h2>
      <p className="text-xs uppercase tracking-[0.3em] text-white/40 mb-12">Reputation Scoring & Plan Review</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {partners.map((partner, i) => (
          <div key={i} className="bg-[#1A1A1A] border border-white/20 p-10 flex flex-col justify-between group hover:border-white transition-all">
            <div className="flex justify-between items-start">
               <div>
                  <span className="text-[10px] uppercase tracking-[0.2em] text-white/40">{partner.category}</span>
                  <h4 className="text-2xl font-serif mt-2">{partner.name}</h4>
               </div>
               <div className="w-12 h-12 border border-white/20 flex items-center justify-center font-serif text-xl">
                  {partner.score}
               </div>
            </div>
            
            <div className="mt-8 flex justify-between items-center">
               <span className={`text-[9px] uppercase tracking-[0.2em] font-bold ${
                 partner.status === 'Active Bid' ? 'text-white' : 'text-white/40'
               }`}>
                 {partner.status}
               </span>
               <button className="text-[9px] uppercase tracking-[0.3em] border border-white/20 px-4 py-2 hover:bg-white hover:text-black transition-all">
                  View Profile
               </button>
            </div>
          </div>
        ))}

        <div className="bg-white text-black p-10 flex flex-col items-center justify-center text-center space-y-4">
           <h4 className="text-2xl font-serif">Apply as Partner</h4>
           <p className="text-[10px] uppercase tracking-widest leading-relaxed opacity-60">
             Rigorous 14-point audit required for tier 1 access.
           </p>
           <button className="px-10 py-4 bg-black text-white text-[10px] uppercase tracking-[0.3em] font-bold">
             Open Portal
           </button>
        </div>
      </div>
    </div>
  );
};
