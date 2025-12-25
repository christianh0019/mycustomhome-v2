
import React from 'react';
import { AppTab } from '../types';

interface SidebarProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const tabs = Object.values(AppTab);

  return (
    <div className="w-[280px] h-full bg-[#050505] border-r border-white/10 flex flex-col shrink-0 z-30 shadow-2xl">
      <div className="p-10">
        <h1 className="text-3xl font-serif tracking-tighter leading-none mb-2 text-white">
          MCH
        </h1>
        <div className="h-[1px] w-8 bg-white/40 mb-8"></div>
        <p className="text-[10px] uppercase tracking-[0.4em] text-white/50">Your Private Guide</p>
      </div>

      <nav className="flex-1 space-y-1">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`w-full text-left px-10 py-5 text-[11px] tracking-[0.2em] uppercase modern-transition flex items-center justify-between group ${
              activeTab === tab 
                ? 'text-white bg-white/5 font-medium' 
                : 'text-white/50 hover:text-white/90 hover:bg-white/[0.03]'
            }`}
          >
            <span>{tab}</span>
            <div className={`w-1 h-1 rounded-full modern-transition ${activeTab === tab ? 'bg-white scale-100' : 'bg-white/0 scale-0 group-hover:bg-white/20 group-hover:scale-100'}`}></div>
          </button>
        ))}
      </nav>

      <div className="p-10 border-t border-white/5 bg-black/40">
        <div className="flex items-center space-x-4 group cursor-pointer">
          <div className="w-10 h-10 border border-white/20 flex items-center justify-center text-[11px] font-medium group-hover:border-white/60 modern-transition">
            JD
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-white/90">J. DOE</span>
            <span className="text-[9px] uppercase tracking-widest text-white/50">Gold Star Member</span>
          </div>
        </div>
      </div>
    </div>
  );
};
