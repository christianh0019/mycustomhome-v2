
import React from 'react';
import { AppTab } from '../types';

interface BottomNavProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
}

const ICONS: Record<AppTab, string> = {
  [AppTab.ProjectPilot]: '✦',
  [AppTab.Roadmap]: '◬',
  [AppTab.TheVault]: '▣',
  [AppTab.Partners]: '☺',
  [AppTab.Messages]: '✉',
  [AppTab.EquityClub]: '◈',
};

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab }) => {
  const tabs = Object.values(AppTab);

  return (
    <nav className="ios-blur border-t border-white/10 flex justify-around items-center px-2 py-2 pb-safe shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => setActiveTab(tab)}
          className={`flex flex-col items-center justify-center p-2 modern-transition ${
            activeTab === tab ? 'text-white scale-110' : 'text-white/40'
          }`}
        >
          <span className="text-xl mb-1">{ICONS[tab]}</span>
          <span className="text-[7px] uppercase tracking-[0.2em] font-bold truncate w-12 text-center">
            {tab.split(' ').pop()}
          </span>
          {activeTab === tab && (
            <div className="absolute -bottom-1 w-1 h-1 bg-white rounded-full"></div>
          )}
        </button>
      ))}
    </nav>
  );
};
