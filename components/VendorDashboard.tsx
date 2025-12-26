
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { MessagesTab } from './MessagesTab';
import { Settings } from './Settings';

enum VendorTab {
    Overview = 'Overview',
    Opportunities = 'Leads',
    Projects = 'Active Jobs',
    Messages = 'Messages',
    Settings = 'Profile'
}

export const VendorDashboard: React.FC = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<VendorTab>(VendorTab.Overview);

    const renderContent = () => {
        switch (activeTab) {
            case VendorTab.Overview:
                return <VendorOverview />;
            case VendorTab.Opportunities:
                return <VendorOpportunities />;
            case VendorTab.Projects:
                return <VendorProjects />;
            case VendorTab.Messages:
                return <MessagesTab />; // Reusing the powerful messaging component
            case VendorTab.Settings:
                return <Settings />;
            default:
                return <VendorOverview />;
        }
    };

    return (
        <div className="flex h-screen bg-black text-white font-sans overflow-hidden">
            {/* Vendor Sidebar */}
            <div className="w-[260px] border-r border-white/10 flex flex-col bg-[#050505]">
                <div className="p-8">
                    <h1 className="text-2xl font-serif tracking-tighter text-white">MCH<span className="text-white/40 text-xs tracking-widest ml-2 font-sans font-normal">PARTNER</span></h1>
                </div>
                <nav className="flex-1 space-y-1">
                    {Object.values(VendorTab).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`w-full text-left px-8 py-4 text-[10px] uppercase tracking-[0.2em] modern-transition flex items-center justify-between ${activeTab === tab
                                ? 'text-white bg-white/5 font-semibold border-r-2 border-white'
                                : 'text-white/50 hover:text-white/90 hover:bg-white/[0.02]'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </nav>
                <div className="p-8 border-t border-white/5">
                    <div className="flex items-center gap-3 opacity-60">
                        <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-xs font-bold">
                            {user?.companyName ? user.companyName.substring(0, 2).toUpperCase() : 'CO'}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold uppercase tracking-widest">{user?.companyName || 'Vendor Inc.'}</span>
                            <span className="text-[8px] uppercase tracking-widest opacity-50">Verified</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="flex-1 flex flex-col relative overflow-hidden bg-black">
                {renderContent()}
            </main>
        </div>
    );
};

const VendorOverview: React.FC = () => (
    <div className="p-12 max-w-7xl mx-auto w-full space-y-12">
        <h2 className="text-4xl font-serif">Dashboard</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
                { label: 'Active Bids', value: '3', trend: '+1 this week' },
                { label: 'Win Rate', value: '42%', trend: 'Top 10%' },
                { label: 'Current Jobs', value: '1', trend: 'On Schedule' }
            ].map((stat, i) => (
                <div key={i} className="p-8 border border-white/10 bg-[#080808]">
                    <p className="text-[10px] uppercase tracking-widest text-white/40 mb-2">{stat.label}</p>
                    <p className="text-4xl font-semibold mb-2">{stat.value}</p>
                    <p className="text-[10px] text-green-500 uppercase tracking-wider">{stat.trend}</p>
                </div>
            ))}
        </div>
    </div>
);

const VendorOpportunities: React.FC = () => (
    <div className="p-12 w-full h-full overflow-y-auto">
        <h2 className="text-4xl font-serif mb-8">Live Opportunities</h2>
        <div className="space-y-4">
            {[1, 2, 3].map(i => (
                <div key={i} className="p-6 border border-white/10 bg-[#080808] hover:border-white/30 transition-all cursor-pointer flex justify-between items-center group">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className="px-2 py-1 bg-white/10 text-[9px] uppercase tracking-wide rounded text-white/80">Custom Build</span>
                            <span className="text-[10px] text-white/40">Posted 2h ago</span>
                        </div>
                        <h3 className="text-xl font-medium mb-1 group-hover:underline decoration-white/30 underline-offset-4">Modern Farmhouse - Frisco, TX</h3>
                        <p className="text-sm text-white/50">Budget: $1.2M - $1.5M • 4,500 sqft • Ready to break ground</p>
                    </div>
                    <button className="px-6 py-3 bg-white text-black text-[10px] uppercase tracking-widest font-bold hover:scale-105 transition-transform">
                        Submit Bid
                    </button>
                </div>
            ))}
        </div>
    </div>
);

const VendorProjects: React.FC = () => (
    <div className="flex-1 flex items-center justify-center text-white/30">
        <p className="uppercase tracking-widest">No active projects yet</p>
    </div>
);
