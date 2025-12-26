import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { ProjectPilot } from './components/ProjectPilot';
import { Roadmap } from './components/Roadmap';
import { Vault } from './components/Vault';
import { Partners } from './components/Partners';
import { MessagesTab } from './components/MessagesTab';
import { EquityClub } from './components/EquityClub';
import { BottomNav } from './components/BottomNav';
import { Settings } from './components/Settings';
import { LoginScreen } from './components/LoginScreen';
import { OnboardingTour } from './components/OnboardingTour';
import { KnowledgeBase } from './components/KnowledgeBase';
import { AppTab } from './types';
import { AuthProvider, useAuth } from './contexts/AuthContext';

const AppContent: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.ProjectPilot);

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case AppTab.ProjectPilot:
        return <ProjectPilot />;
      case AppTab.Roadmap:
        return <Roadmap />;
      case AppTab.TheVault:
        return <Vault />;
      case AppTab.Partners:
        return <Partners />;
      case AppTab.Messages:
        return <MessagesTab />;
      case AppTab.EquityClub:
        return <EquityClub />;
      case AppTab.KnowledgeBase:
        return <KnowledgeBase />;
      case AppTab.Settings:
        return <Settings />;
      default:
        return <ProjectPilot />;
    }
  };

  return (
    <div className="flex h-screen bg-black text-white font-sans overflow-hidden">
      {user && !user.hasOnboarded && <OnboardingTour />}
      {/* Sidebar - Desktop Only */}
      <div className="hidden md:flex">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>

      <main className="flex-1 flex flex-col relative overflow-y-auto bg-black pb-24 md:pb-0">
        {/* Progress Navigation - Hidden on Mobile to save space, or very compact */}
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
          {renderContent()}
        </div>

        {/* Bottom Nav - Mobile Only */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50">
          <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
