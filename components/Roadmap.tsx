import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  MapPin, CheckCircle, Clock, Construction, FileText,
  Landmark, Ruler, Key, ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const STAGES = [
  {
    id: 0,
    name: "Orientation",
    desc: "Setting the coordinates",
    icon: MapPin,
    subtasks: ["Initial Consultation", "Budget Framework", "Feasibility Study"]
  },
  {
    id: 1,
    name: "Financial Foundation",
    desc: "Securing the capital",
    icon: Landmark,
    subtasks: ["Prequalification", "Construction Loan Intro", "Proof of Funds"]
  },
  {
    id: 2,
    name: "Land Acquisition",
    desc: "Finding the ground",
    icon: CompassIcon, // Custom or fallback
    subtasks: ["Site Selection", "Soil Testing", "Survey & Topo", "Closing"]
  },
  {
    id: 3,
    name: "Design & Engineering",
    desc: "Blueprints to reality",
    icon: Ruler,
    subtasks: ["Conceptual Design", "Architectural Plans", "Structural Engineering", "Final Bids"]
  },
  {
    id: 4,
    name: "Permitting",
    desc: "The red tape",
    icon: FileText,
    subtasks: ["HOA Approval", "City Submission", "Permit Issuance"]
  },
  {
    id: 5,
    name: "Construction",
    desc: "Breaking ground",
    icon: Construction,
    subtasks: ["Foundation", "Framing", "Systems", "Finishes"]
  },
  {
    id: 6,
    name: "The Summit",
    desc: "Welcome home",
    icon: Key,
    subtasks: ["Final Walkthrough", "Occupancy Permit", "Move-In Day"]
  },
];

function CompassIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
    </svg>
  );
}

export const Roadmap: React.FC = () => {
  const { user } = useAuth();
  const currentStageIndex = user?.currentStage || 0;

  // State for expanded detail view
  const [expandedStage, setExpandedStage] = useState<number | null>(currentStageIndex);

  return (
    <div className="p-6 md:p-12 lg:p-12 max-w-7xl mx-auto w-full min-h-screen text-zinc-100 pb-32">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-24 gap-6">
        <div className="space-y-3">
          <h2 className="text-4xl md:text-5xl font-serif tracking-tighter">The Map</h2>
          <div className="h-[1px] w-12 bg-white/30"></div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">Your Journey from Dirt to Door-Keys</p>
        </div>

        <div className="bg-[#0A0A0A] border border-white/10 px-6 py-3 rounded-2xl flex items-center gap-4">
          <div className="flex flex-col text-right">
            <span className="text-[9px] uppercase tracking-widest text-zinc-500">Current Phase</span>
            <span className="text-xs uppercase tracking-widest text-white font-bold flex items-center gap-2 justify-end">
              {STAGES[currentStageIndex]?.name || 'Unknown'}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24">

        {/* Timeline Column */}
        <div className="lg:col-span-4 relative pl-8 border-l border-white/5 space-y-24">

          {STAGES.map((stage, index) => {
            const isActive = index === currentStageIndex;
            const isPast = index < currentStageIndex;
            const isFuture = index > currentStageIndex;

            return (
              <div
                key={stage.id}
                onClick={() => setExpandedStage(stage.id)}
                className={`relative group cursor-pointer transition-all duration-500 ${isActive ? 'scale-105' : 'opacity-50 hover:opacity-80'}`}
              >
                {/* The Node on the Line */}
                <div className={`absolute -left-[41px] top-1 w-5 h-5 rounded-full border-2 transition-all duration-500 flex items-center justify-center z-10
                                ${isActive ? 'bg-black border-white shadow-[0_0_15px_rgba(255,255,255,0.5)] scale-125' :
                    isPast ? 'bg-white border-white' : 'bg-[#0A0A0A] border-zinc-800'
                  }`}
                >
                  {isPast && <CheckCircle size={10} className="text-black" />}
                  {isActive && <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />}
                </div>

                {/* Connecting Line (drawn via CSS on parent, but active segment highlighted) */}
                {isActive && (
                  <div className="absolute -left-[33px] top-6 w-[2px] h-24 bg-gradient-to-b from-white to-transparent" />
                )}

                <div className="flex items-center gap-4">
                  <h3 className={`text-2xl font-serif transition-colors ${isActive ? 'text-white' : 'text-zinc-500'}`}>
                    {stage.name}
                  </h3>
                  {isActive && (
                    <span className="px-2 py-1 rounded-full bg-white/10 border border-white/10 text-[8px] uppercase tracking-widest text-white">
                      Active
                    </span>
                  )}
                </div>
                <p className="text-[10px] uppercase tracking-widest text-zinc-600 mt-1">
                  {stage.desc}
                </p>
              </div>
            );
          })}

        </div>

        {/* Detail Column (Sticky) */}
        <div className="lg:col-span-8">
          <div className="sticky top-32">
            <AnimatePresence mode="wait">
              {expandedStage !== null && (
                <motion.div
                  key={expandedStage}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="bg-[#0A0A0A] border border-white/10 rounded-3xl p-8 md:p-12 relative overflow-hidden"
                >
                  {/* Background Glow */}
                  <div className="absolute top-0 right-0 p-20 opacity-[0.03] bg-gradient-to-br from-white to-transparent blur-3xl rounded-full translate-x-10 -translate-y-10" />

                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-8">
                      <div>
                        <div className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 mb-2">Phase 0{expandedStage + 1}</div>
                        <h2 className="text-4xl md:text-5xl font-serif text-white">{STAGES[expandedStage].name}</h2>
                      </div>
                      <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                        {React.createElement(STAGES[expandedStage].icon, { size: 32, className: "text-white/80" })}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">

                      {/* Subtasks */}
                      <div className="space-y-6">
                        <h4 className="text-xs uppercase tracking-widest text-zinc-400 border-b border-white/10 pb-4">Checklist</h4>
                        <ul className="space-y-4">
                          {STAGES[expandedStage].subtasks.map((task, i) => (
                            <li key={i} className="flex items-center gap-3 group cursor-pointer">
                              <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors
                                                            ${expandedStage < currentStageIndex
                                  ? 'bg-white border-white'
                                  : 'border-zinc-700 group-hover:border-white/50'
                                }`}
                              >
                                {expandedStage < currentStageIndex && <CheckCircle size={12} className="text-black" />}
                              </div>
                              <span className={`text-sm transition-colors ${expandedStage < currentStageIndex ? 'text-zinc-500 line-through decoration-zinc-800' : 'text-zinc-300'}`}>
                                {task}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Dynamic Content */}
                      <div className="space-y-6">
                        <h4 className="text-xs uppercase tracking-widest text-zinc-400 border-b border-white/10 pb-4">Resources</h4>

                        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors cursor-pointer group">
                          <div className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2">Guide</div>
                          <h5 className="text-lg font-serif text-zinc-200 group-hover:text-white transition-colors mb-4">
                            Mastering the {STAGES[expandedStage].name} Phase
                          </h5>
                          <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-zinc-500 group-hover:text-white transition-colors">
                            Read Now <ArrowRight size={12} />
                          </div>
                        </div>

                        {expandedStage === currentStageIndex && (
                          <div className="p-6 rounded-2xl bg-white text-black text-center space-y-4">
                            <p className="text-xs font-medium uppercase tracking-widest">Action Required</p>
                            <button className="w-full py-3 bg-black text-white text-[10px] uppercase tracking-widest font-bold rounded-xl hover:bg-zinc-800 transition-colors">
                              Start Phase
                            </button>
                          </div>
                        )}

                      </div>

                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

      </div>

    </div>
  );
};
