
import React, { useMemo } from 'react';
import { AppTab } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { RoadmapService } from '../services/RoadmapService';
import { Lock } from 'lucide-react';

interface SidebarProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { user } = useAuth();

  // Filter out Settings from the main navigation list to put it at the bottom
  // Filter GATE TABS based on progress
  const mainTabs = useMemo(() => {
    const allTabs = Object.values(AppTab).filter(tab => tab !== AppTab.Settings);

    return allTabs.map(tab => {
      let isLocked = false;
      let unlockMessage = "";

      // New tabs logic mapping
      if (tab === AppTab.Partners) { // The Team
        isLocked = !RoadmapService.isFeatureUnlocked(user, 'TheTeam');
        unlockMessage = "Complete Stage 3 to Unlock";
      }
      if (tab === AppTab.TheLedger) {
        isLocked = !RoadmapService.isFeatureUnlocked(user, 'TheLedger');
        unlockMessage = "Complete Stage 1 (Financial Foundation) to Unlock";
      }
      // Note: AppTab doesn't have Ledger or Jobsite yet, we handle existing ones first.

      return { tab, isLocked, unlockMessage };
    });
  }, [user]);

  return (
    <div className="w-[280px] h-full bg-[#050505] border-r border-white/10 flex flex-col shrink-0 z-30 shadow-2xl">
      <div className="p-10">
        <h1 className="text-3xl font-serif tracking-tighter leading-none mb-2 text-white">
          MCH
        </h1>
        <div className="h-[1px] w-8 bg-white/40 mb-8"></div>
        <p className="text-[10px] uppercase tracking-[0.4em] text-white/50">Your Private Guide</p>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto">
        {mainTabs.map(({ tab, isLocked, unlockMessage }) => (
          <button
            key={tab}
            onClick={() => !isLocked && setActiveTab(tab)}
            disabled={isLocked}
            className={`w-full text-left px-10 py-5 text-[11px] tracking-[0.2em] uppercase modern-transition flex items-center justify-between group ${activeTab === tab
              ? 'text-white bg-white/5 font-medium'
              : isLocked
                ? 'text-white/20 cursor-not-allowed opacity-50'
                : 'text-white/50 hover:text-white/90 hover:bg-white/[0.03]'
              }`}
            title={isLocked ? unlockMessage : ''}
          >
            <div className="flex items-center gap-2">
              <span>{tab}</span>
              {isLocked && <Lock size={10} className="text-white/20" />}
            </div>

            {!isLocked && (
              <div className={`w-1 h-1 rounded-full modern-transition ${activeTab === tab ? 'bg-white scale-100' : 'bg-white/0 scale-0 group-hover:bg-white/20 group-hover:scale-100'}`}></div>
            )}
          </button>
        ))}
      </nav>

      <div className="p-0 border-t border-white/5 bg-black/40">
        {/* Settings Tab */}
        <button
          onClick={() => setActiveTab(AppTab.Settings)}
          className={`w-full text-left px-10 py-6 text-[11px] tracking-[0.2em] uppercase modern-transition flex items-center justify-between group ${activeTab === AppTab.Settings
            ? 'text-white bg-white/5 font-medium'
            : 'text-white/50 hover:text-white/90 hover:bg-white/[0.03]'
            }`}
        >
          <div className="flex items-center space-x-3">
            <span>{AppTab.Settings}</span>
          </div>
          <div className={`w-1 h-1 rounded-full modern-transition ${activeTab === AppTab.Settings ? 'bg-white scale-100' : 'bg-white/0 scale-0 group-hover:bg-white/20 group-hover:scale-100'}`}></div>
        </button>

        {/* User Profile Summary */}
        <div className="px-10 py-8 border-t border-white/5">
          <div className="flex items-center space-x-4 group cursor-pointer" onClick={() => setActiveTab(AppTab.Settings)}>
            <div className="w-10 h-10 border border-white/20 flex items-center justify-center text-[11px] font-medium group-hover:border-white/60 modern-transition overflow-hidden rounded-full">
              <img src={user?.avatarUrl || `https://ui-avatars.com/api/?name=${user?.name || "User"}&background=random`} alt="CH" className="w-full h-full object-cover opacity-80" />
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-semibold uppercase tracking-widest text-white/90">{user?.name?.split(' ')[0] || 'User'}</span>
              <span className="text-[9px] uppercase tracking-widest text-white/50">Member</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
