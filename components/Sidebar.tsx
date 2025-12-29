
import React, { useMemo } from 'react';
import { AppTab } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { RoadmapService } from '../services/RoadmapService';
import { NewBadge, markFeatureAsSeen } from './NewBadge';
import {
  Lock, Map, Calculator, Users, MessageSquare,
  Book, Wallet, UserCircle, Hexagon, Component
} from 'lucide-react';

const TAB_ICONS: Record<string, React.ElementType> = {
  [AppTab.ProjectPilot]: Component, // Your Helper
  [AppTab.Roadmap]: Map, // The Map
  [AppTab.BudgetCreator]: Calculator, // The Budget
  [AppTab.TheVault]: Lock, // The Safe Box (Vault usually implies lock/security)
  [AppTab.Partners]: Users, // The Team
  [AppTab.Messages]: MessageSquare,
  [AppTab.KnowledgeBase]: Book,
  [AppTab.EquityClub]: Hexagon, // Treasure Chest
  [AppTab.TheLedger]: Wallet,
  [AppTab.Settings]: UserCircle
};

// Explicit order
const ORDERED_TABS = [
  // AppTab.ProjectPilot, // Moved to Global Widget
  AppTab.Roadmap,
  AppTab.BudgetCreator,
  AppTab.TheVault,
  AppTab.Partners,
  AppTab.Messages,
  AppTab.KnowledgeBase,
  // AppTab.EquityClub, // Hidden per user request for now
  AppTab.TheLedger,
];

interface SidebarProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { user } = useAuth();

  // Filter out Settings from the main navigation list to put it at the bottom
  // Filter GATE TABS based on progress
  const mainTabs = useMemo(() => {
    // We want BudgetCreator to appear early, maybe after Roadmap or Project Pilot.
    // Order in Enum defines order here usually? No, Object.values order.
    // Let's explicitly order them if needed, or just let 'The Budget' appear where it falls in Enum.
    // Enum order: Pilot, Roadmap, Vault, Partners, Messages, KB, Settings, Equity, Ledger, BudgetCreator
    // We might want to reorder the Enum in types.ts if we want to change display order easily, 
    // OR we can sort here. For now, I'll filter and explicitly place Budget Creator if I can, 
    // but Object.values is easiest.

    // To position "The Budget" nicely, let's just let it render. 
    // (Ideally, we would reorder the Enum keys in types.ts for natural ordering).
    // I can't reorder types.ts easily without breaking other things depending on index? 
    // No, it's string enum.

    // Use manual order
    return ORDERED_TABS.map(tab => {
      let isLocked = false;
      let unlockMessage = "";

      // ICONS mapping (inline or imported if preferred, but for now we rely on the implementation below)
      // Note: original Sidebar didn't render icons but plan suggests it. I'll stick to text for consistency unless I see icons.

      // New tabs logic mapping
      if (tab === AppTab.BudgetCreator) {
        // Always unlocked? Or unlocked after ProjectPilot?
        // Let's keep it open as a lead magnet tool.
        isLocked = false;
      }
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
            onClick={() => {
              if (isLocked) return;
              // The original code does not have markFeatureAsSeen or setIsMobileOpen,
              // so these lines are commented out to maintain syntactical correctness
              // and avoid introducing undeclared variables/functions.
              if (tab === AppTab.TheLedger) markFeatureAsSeen('TheLedger');
              if (tab === AppTab.Partners) markFeatureAsSeen('TheTeam'); // 'TheTeam' key used in service
              // Could map others dynamically if needing to scale

              setActiveTab(tab);
            }}
            disabled={isLocked}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group relative
                  ${activeTab === tab
                ? 'bg-zinc-100 text-black shadow-lg shadow-white/5'
                : isLocked
                  ? 'opacity-50 cursor-not-allowed hover:bg-transparent text-zinc-500'
                  : 'text-zinc-400 hover:text-zinc-100 hover:bg-white/5'
              }
                `}
            title={isLocked ? unlockMessage : ''}
          >
            {/* The original code did not have an 'icon' variable.
                Keeping the original 'tab' text for now.
                If an icon is intended, it would need to be defined or imported. */}
            {/* Icon */}
            <div className={`transition-transform duration-300 ${activeTab === tab ? 'scale-110' : 'group-hover:scale-110'}`}>
              {TAB_ICONS[tab] && React.createElement(TAB_ICONS[tab], { size: 18 })}
            </div>
            <span>{tab}</span>

            {isLocked && <Lock size={14} className="ml-auto opacity-50" />}

            {/* New Badge - NewBadge component is not defined in the original file.
                    Commenting out to maintain syntactical correctness.
                    If NewBadge is intended, it needs to be imported or defined. */}
            {!isLocked && (tab === AppTab.TheLedger || tab === AppTab.Partners) && (
              <NewBadge
                featureId={tab === AppTab.Partners ? 'TheTeam' : 'TheLedger'}
                isUnlocked={!isLocked}
              />
            )}
            {/* The original closing div for the flex container is removed as the new structure replaces it. */}
            {/* The original dot indicator is also removed as the new structure does not include it. */}
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
