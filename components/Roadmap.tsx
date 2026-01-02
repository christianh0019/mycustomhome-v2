import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ROADMAP_CONFIG, RoadmapService } from '../services/RoadmapService';
import { VerificationAction } from './VerificationAction';
import {
  MapPin, CheckCircle, Lock, Landmark, Ruler, Key, ArrowRight, Shield, ShieldCheck, Square, FileText, Construction
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function CompassIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
    </svg>
  );
}

const ICONS: Record<number, any> = {
  0: MapPin,
  1: Landmark,
  2: CompassIcon,
  3: Ruler,
  4: ShieldCheck,
  5: Construction,
  6: Key
};

import { ProceedButton } from './ProceedButton';
import { OnboardingModal } from './OnboardingModal';
import { markFeatureAsSeen } from './NewBadge';
import { AppTab } from '../types';

export const Roadmap: React.FC = () => {
  const { user, updateProfile } = useAuth();

  // Provide fallback for currentStage if undefined
  const currentStageIndex = user?.currentStage ?? 0;

  // State for expanded detail view
  const [expandedStage, setExpandedStage] = useState<number | null>(currentStageIndex);

  // State for celebration modal (Stage Welcome)
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', description: '' });

  // State for Map Tour (First Time)
  const [showMapTour, setShowMapTour] = useState(false);

  // Check Local Storage for Tour
  useEffect(() => {
    const TOUR_KEY = 'has_seen_map_tour';
    const hasSeen = localStorage.getItem(TOUR_KEY);

    if (!hasSeen) {
      setShowMapTour(true);
    }
  }, []);

  const handleMapTourClose = () => {
    const TOUR_KEY = 'has_seen_map_tour';
    localStorage.setItem(TOUR_KEY, 'true');
    setShowMapTour(false);
    markFeatureAsSeen(AppTab.Roadmap);
  };


  const handleVerifyTask = async (stageId: number, taskId: string) => {
    if (!user) return;
    try {
      const newProgress = await RoadmapService.verifyTask(user.id, stageId, taskId, user.stage_progress);
      // Optimistically update local context
      updateProfile({ stage_progress: newProgress });

      // If stage verified, refresh user to get new currentStage? 
      // (AuthContext usually handles this via subscription on profile updates)
    } catch (e) {
      console.error("Task verify failed", e);
    }
  };

  const handleAdvanceStage = async () => {
    if (!user) return;
    try {
      // 1. Advance in DB
      const nextStageId = currentStageIndex + 1;
      await RoadmapService.advanceStage(user.id, nextStageId);

      // 2. Optimistic Update (Context will refresh eventually, but we want speed)
      updateProfile({ currentStage: nextStageId });
      setExpandedStage(nextStageId); // Auto-expand new stage

      // 3. Trigger Modal
      const nextStageConfig = ROADMAP_CONFIG[nextStageId as keyof typeof ROADMAP_CONFIG];
      setModalContent({
        title: `Welcome to ${nextStageConfig.name}`,
        description: "You have advanced to the next level. New tools and tasks are now available."
      });
      setShowWelcomeModal(true);

    } catch (e) {
      console.error("Advance failed", e);
    }
  };

  return (
    <div className="p-6 md:p-12 lg:p-12 max-w-7xl mx-auto w-full min-h-screen text-zinc-900 dark:text-zinc-100 pb-32 transition-colors duration-300">
      {/* Stage Welcome Modal (Level Up) */}
      <OnboardingModal
        isOpen={showWelcomeModal}
        onClose={() => setShowWelcomeModal(false)}
        title={modalContent.title}
        description={modalContent.description}
        type="STAGE_WELCOME"
      />

      {/* General Map Tour (First Time) */}
      <OnboardingModal
        isOpen={showMapTour}
        onClose={handleMapTourClose}
        title="Your Master Roadmap"
        description="Building a home is a journey. We've broken it down into clear, manageable steps."
        features={[
          "Step-by-Step Guide: Never wonder what to do next.",
          "Unlock Features: As you complete stages, new tools (like Ledger & Team) unlock.",
          "Track Progress: See exactly how close you are to breaking ground."
        ]}
        type="TAB_WELCOME"
      />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-24 gap-6">
        <div className="space-y-3">
          <h2 className="text-4xl md:text-5xl font-serif tracking-tighter">The Map</h2>
          <div className="h-[1px] w-12 bg-white/30"></div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">Your Journey from Dirt to Door-Keys</p>
        </div>

        <div className="bg-white dark:bg-[#0A0A0A] border border-zinc-200 dark:border-white/10 px-6 py-3 rounded-2xl flex items-center gap-4 transition-colors duration-300 shadow-sm dark:shadow-none">
          <div className="flex flex-col text-right">
            <span className="text-[9px] uppercase tracking-widest text-zinc-500">Current Phase</span>
            <span className="text-xs uppercase tracking-widest text-zinc-900 dark:text-white font-bold flex items-center gap-2 justify-end">
              {ROADMAP_CONFIG[currentStageIndex as keyof typeof ROADMAP_CONFIG]?.name || 'Unknown'}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24">

        {/* Timeline Column */}
        <div className="lg:col-span-4 relative pl-8 border-l border-zinc-200 dark:border-white/5 space-y-24">
          {Object.values(ROADMAP_CONFIG).map((stage) => {
            const status = user ? RoadmapService.getStageStatus(user, stage.id) : 'locked';
            const isLocked = status === 'locked';
            const isCompleted = status === 'completed';
            const isActive = status === 'active';
            const Icon = ICONS[stage.id];

            return (
              <div
                key={stage.id}
                className={`relative group cursor-pointer ${isLocked ? 'opacity-30 grayscale' : 'opacity-100'} `}
                onClick={() => !isLocked && setExpandedStage(stage.id)}
              >
                {/* Node */}
                <div className={`absolute -left-[45px] top-0 size-8 rounded-full border-2 flex items-center justify-center transition-all duration-500 z-10 ${isCompleted ? 'bg-emerald-500 border-emerald-500 text-black' :
                  isActive ? 'bg-white dark:bg-[#0A0A0A] border-zinc-900 dark:border-white text-zinc-900 dark:text-white shadow-lg dark:shadow-[0_0_20px_rgba(255,255,255,0.3)]' :
                    'bg-zinc-100 dark:bg-[#0A0A0A] border-zinc-300 dark:border-white/10 text-zinc-400 dark:text-white/20'
                  }`}>
                  {isCompleted ? <CheckCircle size={14} /> : isLocked ? <Lock size={12} /> : <div className="size-2 bg-white rounded-full animate-pulse" />}
                </div>

                {/* Content */}
                <div>
                  <span className={`text-[9px] font-bold uppercase tracking-widest mb-1 block ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-500 dark:text-zinc-600'}`}>0{stage.id}</span>
                  <h3 className={`text-2xl font-serif transition-colors ${isActive ? 'text-zinc-900 dark:text-white' : 'text-zinc-400 dark:text-white/60 group-hover:text-zinc-900 dark:group-hover:text-white'}`}>{stage.name}</h3>

                  {isActive && (
                    <motion.div layoutId="active-glow" className="absolute -inset-4 bg-white/5 rounded-xl -z-10 blur-xl opacity-50" />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Detail Column */}
        <div className="lg:col-span-8">
          <AnimatePresence mode="wait">
            {expandedStage !== null && ROADMAP_CONFIG[expandedStage as keyof typeof ROADMAP_CONFIG] && (
              <motion.div
                key={expandedStage}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white dark:bg-[#111] border border-zinc-200 dark:border-white/5 rounded-3xl p-8 md:p-12 relative overflow-hidden shadow-sm dark:shadow-none transition-colors duration-300"
              >
                {/* Background Decoration */}
                <div className="absolute top-0 right-0 p-32 bg-emerald-500/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                <div className="relative z-10">
                  <span className="text-[10px] uppercase tracking-widest text-emerald-500 mb-4 block flex items-center gap-2">
                    <span className="size-1.5 rounded-full bg-emerald-500"></span>
                    Active Verification Protocol
                  </span>
                  <h2 className="text-4xl md:text-5xl font-serif text-zinc-900 dark:text-white mb-6">
                    {ROADMAP_CONFIG[expandedStage as keyof typeof ROADMAP_CONFIG].name}
                  </h2>
                  <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-xl mb-12">
                    Complete the following verification tasks to unlock the next stage of your project.
                  </p>

                  {/* Verification Checklist */}
                  <div className="space-y-4">
                    {ROADMAP_CONFIG[expandedStage as keyof typeof ROADMAP_CONFIG].required_tasks.map((task) => {
                      const isDone = user?.stage_progress?.[expandedStage]?.completed_tasks?.includes(task.id);

                      return (
                        <div
                          key={task.id}
                          className={`p-5 rounded-xl border transition-all duration-300 flex items-center gap-5 group ${isDone
                            ? 'bg-emerald-500/10 border-emerald-500/30'
                            : 'bg-zinc-50 dark:bg-white/[0.02] border-zinc-200 dark:border-white/5 hover:bg-zinc-100 dark:hover:bg-white/[0.05]'
                            }`}
                        >
                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${isDone ? 'bg-emerald-500 border-emerald-500 text-black' : 'border-zinc-300 dark:border-white/20 text-transparent'}`}>
                            {isDone && <CheckCircle size={14} />}
                          </div>

                          <div className="flex-1">
                            <span className={`text-sm font-medium transition-colors ${isDone ? 'text-zinc-900 dark:text-white' : 'text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-200'}`}>
                              {task.label}
                            </span>
                          </div>

                          {/* Verification Action Button */}
                          <div className="ml-4">
                            <VerificationAction
                              action={task.action}
                              isVerified={isDone || false}
                              onVerify={() => handleVerifyTask(expandedStage, task.id)}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* MANUAL ADVANCE BUTTON (If Stage is Verified but Current Stage is not yet bumped) */}
                  <AnimatePresence>
                    {user?.stage_progress?.[expandedStage]?.is_verified && expandedStage === currentStageIndex && (
                      <ProceedButton
                        nextStageName={ROADMAP_CONFIG[(expandedStage + 1) as keyof typeof ROADMAP_CONFIG]?.name || "Next Stage"}
                        onProceed={handleAdvanceStage}
                      />
                    )}
                  </AnimatePresence>

                  {/* Status Footer */}
                  <div className="mt-12 pt-8 border-t border-white/5 flex justify-between items-center">
                    <div className="text-xs text-zinc-500">
                      {user?.stage_progress?.[expandedStage]?.is_verified
                        ? "Stage Verified & Complete"
                        : `${user?.stage_progress?.[expandedStage]?.completed_tasks?.length || 0} / ${ROADMAP_CONFIG[expandedStage as keyof typeof ROADMAP_CONFIG].required_tasks.length} Required Tasks`}
                    </div >
                    {
                      user?.stage_progress?.[expandedStage]?.is_verified && (
                        <span className="px-4 py-2 bg-emerald-500/10 text-emerald-500 text-xs uppercase tracking-widest font-bold rounded-lg border border-emerald-500/20">
                          Verified
                        </span>
                      )
                    }
                  </div >

                </div >
              </motion.div >
            )}
          </AnimatePresence >
        </div >
      </div >
    </div >
  );
};

