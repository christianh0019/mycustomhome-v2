
import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { ProjectPilot } from './ProjectPilot';
import { Roadmap } from './Roadmap';
import { Vault } from './Vault';
import { Partners } from './Partners';
import { MessagesTab } from './MessagesTab';
import { EquityClub } from './EquityClub';
import { BottomNav } from './BottomNav';
import { Settings } from './Settings';
import { SmartOnboarding } from './SmartOnboarding';
import { KnowledgeBase } from './KnowledgeBase';
import { VendorDashboard } from './VendorDashboard';
import { AppTab } from '../types';
import { useAuth } from '../contexts/AuthContext';

import { useNavigation } from '../contexts/NavigationContext';

export const MainApp: React.FC = () => {
    const { user } = useAuth();
    const { activeTab, setActiveTab } = useNavigation();

    // RENDER: Vendor App
    if (user && user.role === 'vendor') {
        return <VendorDashboard />;
    }

    // RENDER: Homeowner App
    return (
        <div className="flex h-screen bg-black text-white font-sans overflow-hidden">
            {user && !user.hasOnboarded && <SmartOnboarding />}

            <div className="hidden md:flex">
                <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
            </div>

            <main className="flex-1 flex flex-col relative overflow-y-auto bg-black pb-24 md:pb-0">
                {/* Progress Navigation */}
                <div className="sticky top-0 z-20 bg-black/80 backdrop-blur-md px-6 md:px-10 py-3 border-b border-white/5 flex items-center justify-between pt-safe">
                    <div className="flex items-center space-x-3 md:space-x-4">
                        <span className="text-[8px] md:text-[9px] tracking-[0.4em] uppercase text-white/40">Step 1:</span>
                        <span className="text-[9px] md:text-[10px] tracking-[0.2em] uppercase font-bold truncate max-w-[100px] md:max-w-none">Dreaming</span>
                    </div>
                    <div className="flex items-center space-x-4 md:space-x-6">
                        <div className="w-20 md:w-32 h-[1px] bg-white/10 relative">
                            <div className="absolute top-0 left-0 h-full bg-white transition-all duration-1000" style={{ width: '85%' }}></div>
                        </div>
                        <span className="text-[8px] md:text-[9px] tracking-[0.2em] uppercase text-white/40">85%</span>
                    </div>
                </div>

                <div className="flex-1">
                    {activeTab === AppTab.ProjectPilot && <ProjectPilot />}
                    {activeTab === AppTab.Roadmap && <Roadmap />}
                    {activeTab === AppTab.TheVault && <Vault />}
                    {activeTab === AppTab.Partners && <Partners />}
                    {activeTab === AppTab.Messages && <MessagesTab />}
                    {activeTab === AppTab.EquityClub && <EquityClub />}
                    {activeTab === AppTab.KnowledgeBase && <KnowledgeBase />}
                    {activeTab === AppTab.Settings && <Settings />}
                </div>

                <div className="md:hidden fixed bottom-0 left-0 right-0 z-50">
                    <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
                </div>
            </main>
        </div>
    );
};
