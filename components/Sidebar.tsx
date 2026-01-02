import React, { useMemo } from 'react';
import { AppTab } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { RoadmapService } from '../services/RoadmapService';
import { NewBadge, markFeatureAsSeen } from './NewBadge';
import {
  Lock, Map, Calculator, Users, MessageSquare,
  Book, Wallet, Hexagon, Component, LayoutDashboard, Settings,
  Sun, Moon
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

// Standardized Tab Structure
interface TabConfig {
  id: AppTab;
  icon: React.ElementType;
  label: string;
}

const ORDERED_TABS: TabConfig[] = [
  { id: AppTab.Dashboard, icon: LayoutDashboard, label: 'Dashboard' },
  // { id: AppTab.ProjectPilot, icon: Component, label: 'Your Helper' }, // Moving to global widget
  { id: AppTab.Roadmap, icon: Map, label: 'The Roadmap' },
  { id: AppTab.BudgetCreator, icon: Calculator, label: 'The Budget' },
  { id: AppTab.TheVault, icon: Lock, label: 'The Safe Box' },
  { id: AppTab.Partners, icon: Users, label: 'The Team' },
  { id: AppTab.Messages, icon: MessageSquare, label: 'Messages' }, // or "The Wire"
  { id: AppTab.KnowledgeBase, icon: Book, label: 'The Library' },
  // { id: AppTab.EquityClub, icon: Hexagon, label: 'The Treasure' }, // Hidden
  { id: AppTab.TheLedger, icon: Wallet, label: 'The Ledger' },
];

interface SidebarProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const mainTabs = useMemo(() => {
    return ORDERED_TABS.map((tabConfig) => {
      const { id } = tabConfig;
      let isLocked = false;
      let unlockMessage = "";

      // Logic for locking
      if (id === AppTab.Partners) {
        isLocked = !RoadmapService.isFeatureUnlocked(user, 'TheTeam');
        unlockMessage = "Complete Stage 3 to Unlock";
      }
      if (id === AppTab.TheLedger) {
        isLocked = !RoadmapService.isFeatureUnlocked(user, 'TheLedger');
        unlockMessage = "Complete Stage 1 to Unlock";
      }
      // Budget Creator is always unlocked

      return { ...tabConfig, isLocked, unlockMessage };
    });
  }, [user]);

  return (
    <div className="w-[280px] h-full bg-white dark:bg-[#050505] border-r border-zinc-200 dark:border-white/10 flex flex-col shrink-0 z-30 shadow-2xl transition-colors duration-300">
      <div className="p-10">
        {theme === 'dark' ? (
          <h1 className="text-3xl font-serif tracking-tighter leading-none mb-2 text-white">
            CHH
          </h1>
        ) : (
          <img src="/logo-light.png" alt="Custom Home Helper" className="w-full max-w-[180px] mb-6" />
        )}

        {theme === 'dark' && <div className="h-[1px] w-8 bg-white/40 mb-8"></div>}
        <p className="text-[10px] uppercase tracking-[0.4em] text-zinc-500 dark:text-white/50">Your Private Guide</p>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto">
        {mainTabs.map(({ id, icon: Icon, label, isLocked, unlockMessage }) => (
          <button
            key={id}
            onClick={() => {
              if (isLocked) return;
              if (id === AppTab.TheLedger) markFeatureAsSeen('TheLedger');
              if (id === AppTab.Partners) markFeatureAsSeen('TheTeam');

              setActiveTab(id);
            }}
            disabled={isLocked}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group relative
                  ${activeTab === id
                ? 'bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white shadow-sm'
                : isLocked
                  ? 'opacity-50 cursor-not-allowed hover:bg-transparent text-zinc-400 dark:text-zinc-600'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-white/5'
              }
            `}
            title={isLocked ? unlockMessage : ''}
          >
            {/* Icon */}
            <div className={`transition-transform duration-300 ${activeTab === id ? 'scale-110' : 'group-hover:scale-110'}`}>
              <Icon size={18} />
            </div>

            {/* Label */}
            <span>{label}</span>

            {isLocked && <Lock size={14} className="ml-auto opacity-50" />}

            {!isLocked && (id === AppTab.TheLedger || id === AppTab.Partners) && (
              <NewBadge
                featureId={id === AppTab.Partners ? 'TheTeam' : 'TheLedger'}
                isUnlocked={!isLocked}
              />
            )}
          </button>
        ))}
      </nav>

      <div className="p-0 border-t border-zinc-200 dark:border-white/5 bg-zinc-50 dark:bg-black/40 flex flex-col">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="w-full text-left px-10 py-4 text-[11px] tracking-[0.2em] uppercase modern-transition flex items-center justify-between group text-zinc-500 dark:text-white/50 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/[0.03]"
        >
          <div className="flex items-center gap-3">
            {theme === 'dark' ? <Moon size={14} /> : <Sun size={14} />}
            <span>{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
          </div>
        </button>

        {/* Settings Tab */}
        <button
          onClick={() => setActiveTab(AppTab.Settings)}
          className={`w-full text-left px-10 py-6 text-[11px] tracking-[0.2em] uppercase modern-transition flex items-center justify-between group ${activeTab === AppTab.Settings
            ? 'text-zinc-900 dark:text-white bg-zinc-100 dark:bg-white/5 font-medium'
            : 'text-zinc-500 dark:text-white/50 hover:text-zinc-900 dark:hover:text-white/90 hover:bg-zinc-100 dark:hover:bg-white/[0.03]'
            }`}
        >
          <div className="flex items-center gap-3">
            <Settings size={14} className={activeTab === AppTab.Settings ? "text-zinc-900 dark:text-white" : "text-zinc-400 dark:text-white/50 group-hover:text-zinc-900 dark:group-hover:text-white"} />
            <span>Settings</span>
          </div>
          <span className="text-[9px] uppercase tracking-widest text-zinc-400 dark:text-white/50">Member</span>
        </button>
      </div>
    </div>
  );
};
