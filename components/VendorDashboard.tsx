import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { MessagesTab } from './MessagesTab';
import { Settings } from './Settings';
import { VendorDocuments } from './VendorDocuments';
import { VendorLeads } from './VendorLeads';
import { VendorPipeline } from './VendorPipeline'; // Import
import { useTheme } from '../contexts/ThemeContext';
import {
    LayoutDashboard, MessageSquare, Briefcase, Users, Search,
    Sun, Moon, BadgeCheck, FileText, TrendingUp // Add TrendingUp icon
} from 'lucide-react';

enum VendorTab {
    Overview = 'Overview',
    Pipeline = 'Pipeline', // Add Pipeline
    Opportunities = 'Leads',
    Projects = 'Active Jobs',
    Documents = 'Documents',
    Messages = 'Messages',
    Settings = 'Profile'
}

export const VendorDashboard: React.FC = () => {
    const { user } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const [activeTab, setActiveTab] = useState<VendorTab>(VendorTab.Overview);

    const renderContent = () => {
        switch (activeTab) {
            case VendorTab.Overview:
                return <VendorOverview />;
            case VendorTab.Pipeline: // Render Pipeline
                return <VendorPipeline />;
            case VendorTab.Opportunities:
                return <VendorLeads />;
            case VendorTab.Projects:
                return <VendorProjects />;
            case VendorTab.Documents:
                return <VendorDocuments />;
            case VendorTab.Messages:
                return <MessagesTab />;
            case VendorTab.Settings:
                return <Settings />;
            default:
                return <VendorOverview />;
        }
    };

    const getIcon = (tab: VendorTab) => {
        switch (tab) {
            case VendorTab.Overview: return LayoutDashboard;
            case VendorTab.Pipeline: return TrendingUp; // Icon for Pipeline
            case VendorTab.Opportunities: return Search;
            case VendorTab.Projects: return Briefcase;
            case VendorTab.Documents: return FileText;
            case VendorTab.Messages: return MessageSquare;
            case VendorTab.Settings: return Users;
            default: return LayoutDashboard;
        }
    };

    return (
        <div className="flex h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-white font-sans overflow-hidden transition-colors duration-300">
            {/* Vendor Sidebar */}
            <div className="w-[280px] h-full bg-white dark:bg-[#050505] border-r border-zinc-200 dark:border-white/10 flex flex-col shrink-0 z-30 shadow-2xl transition-colors duration-300">
                <div className="p-10">
                    <h1 className="text-3xl font-serif tracking-tighter leading-none mb-2 text-zinc-900 dark:text-white">
                        MCH <span className="text-zinc-400 dark:text-white/40 text-[10px] tracking-widest ml-2 font-sans font-normal">PARTNER</span>
                    </h1>
                    <div className="h-[1px] w-8 bg-zinc-300 dark:bg-white/40 mb-8"></div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 bg-zinc-100 dark:bg-white/10 rounded-full flex items-center justify-center text-xs font-bold text-zinc-900 dark:text-white">
                            {user?.companyName ? user.companyName.substring(0, 2).toUpperCase() : 'CO'}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-900 dark:text-white">{user?.companyName || 'Vendor Inc.'}</span>
                            <span className="text-[8px] uppercase tracking-widest text-emerald-500 font-bold flex items-center gap-1">
                                <BadgeCheck size={10} /> Verified
                            </span>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 space-y-1 overflow-y-auto px-4">
                    {Object.values(VendorTab).map((tab) => {
                        const Icon = getIcon(tab);
                        const isActive = activeTab === tab;
                        return (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group relative
                                    ${isActive
                                        ? 'bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white shadow-sm'
                                        : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-white/5'
                                    }
                                `}
                            >
                                <div className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                                    <Icon size={18} />
                                </div>
                                <span className="uppercase tracking-widest text-[10px] font-bold">{tab}</span>
                            </button>
                        );
                    })}
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
                </div>
            </div>

            {/* Main Content */}
            <main className="flex-1 flex flex-col relative overflow-hidden bg-zinc-50 dark:bg-black transition-colors duration-300">
                {renderContent()}
            </main>
        </div>
    );
};

const VendorOverview: React.FC = () => (
    <div className="p-12 max-w-7xl mx-auto w-full space-y-12">
        <h2 className="text-4xl font-serif text-zinc-900 dark:text-white">Dashboard</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
                { label: 'Active Bids', value: '3', trend: '+1 this week' },
                { label: 'Win Rate', value: '42%', trend: 'Top 10%' },
                { label: 'Current Jobs', value: '1', trend: 'On Schedule' }
            ].map((stat, i) => (
                <div key={i} className="p-8 border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#080808] rounded-2xl shadow-sm dark:shadow-none">
                    <p className="text-[10px] uppercase tracking-widest text-zinc-500 dark:text-white/40 mb-2">{stat.label}</p>
                    <p className="text-4xl font-semibold mb-2 text-zinc-900 dark:text-white">{stat.value}</p>
                    <p className="text-[10px] text-emerald-500 uppercase tracking-wider font-bold">{stat.trend}</p>
                </div>
            ))}
        </div>
    </div>
);

const VendorProjects: React.FC = () => (
    <div className="p-12 w-full h-full overflow-y-auto">
        <h2 className="text-4xl font-serif mb-8 text-zinc-900 dark:text-white">Active Jobs</h2>
        <div className="space-y-6">
            <div className="p-8 border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#080808] rounded-2xl flex items-center justify-between shadow-sm dark:shadow-none">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <span className="px-2 py-1 bg-emerald-500/10 text-emerald-500 text-[9px] uppercase tracking-wide rounded border border-emerald-500/20 font-bold">Active</span>
                        <span className="text-[10px] text-zinc-500 dark:text-zinc-400">Started 2 days ago</span>
                    </div>
                    <h3 className="text-2xl font-medium mb-1 text-zinc-900 dark:text-white">Miller Residence - Main House</h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">Client: Christian • Stage: Pre-Construction</p>
                </div>

                <div className="flex gap-4">
                    <button className="px-6 py-3 border border-zinc-200 dark:border-white/10 hover:bg-zinc-50 dark:hover:bg-white/5 text-zinc-900 dark:text-white text-[10px] uppercase tracking-widest rounded-lg transition-colors font-bold">
                        View Files
                    </button>
                    <button
                        onClick={() => alert("Simulated: Contract sent to homeowner's message inbox!")}
                        className="px-6 py-3 bg-zinc-900 dark:bg-white text-white dark:text-black text-[10px] uppercase tracking-widest font-bold hover:scale-105 transition-transform flex items-center gap-2 rounded-lg shadow-xl"
                    >
                        Send Contract
                    </button>
                </div>
            </div>
        </div>
    </div>
);
