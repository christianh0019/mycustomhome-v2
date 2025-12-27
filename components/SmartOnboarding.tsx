
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

// Define the shape of our form data
interface FormData {
    firstName: string;
    lastName: string;
    phone: string;
    city: string;
    budget: string;
    selfSelectedStage: number;
    preApprovalStatus: string; // 'Approved', 'Process', 'None'
    lenderName: string;
}

const STAGES = [
    { id: 1, title: 'Orientation', desc: 'I am just getting started.' },
    { id: 2, title: 'Financial Foundation', desc: 'I need to know my buying power.' },
    { id: 3, title: 'Land Acquisition', desc: 'I am looking for or have a lot.' },
    { id: 4, title: 'Design & Engineering', desc: 'I need architectural drawings.' },
    { id: 5, title: 'Permitting', desc: 'I am ready to submit to the city.' },
    { id: 6, title: 'Bidding', desc: 'I need to select a builder/subs.' },
    { id: 7, title: 'Construction Admin', desc: 'Dirt is moving / Building.' },
    { id: 8, title: 'Closeout', desc: 'Final inspections and move-in.' },
];

import { RoadmapService } from '../services/RoadmapService';

export const SmartOnboarding: React.FC = () => {
    const { user, updateProfile } = useAuth(); // Need 'user' to get ID
    const [stepIndex, setStepIndex] = useState(0);
    const [data, setData] = useState<FormData>({
        firstName: '', lastName: '', phone: '',
        city: '', budget: '',
        selfSelectedStage: 1,
        preApprovalStatus: '', lenderName: ''
    });

    // The logic to determine the question flow
    const getFlow = () => {
        const base = ['INTRO', 'CONTACT', 'SCOPE', 'STAGE_SELECT'];

        // Dynamic Backfill
        if (data.selfSelectedStage >= 4) { // If they claim they are at Land or later
            // They skipped Lenders (3) and Pre-Approval (2)
            // We should check if they actually have financing
            if (!data.preApprovalStatus) base.push('BACKFILL_FINANCE');
        }

        base.push('COMPLETE');
        return base;
    };

    const flow = getFlow();
    const currentStepId = flow[stepIndex];

    // AUTO-SUBMIT / AUTO-VERIFY when reaching COMPLETE
    useEffect(() => {
        if (currentStepId === 'COMPLETE') {
            const timer = setTimeout(() => {
                submit();
            }, 500); // Short delay for animation
            return () => clearTimeout(timer);
        }
    }, [currentStepId]);

    const next = () => {
        if (stepIndex < flow.length - 1) setStepIndex(stepIndex + 1);
    };

    const submit = async () => {
        // 1. Update Profile Basics
        if (user) {
            await updateProfile({
                hasOnboarded: true,
                name: `${data.firstName} ${data.lastName}`,
                phone: data.phone,
                city: data.city,
                budgetRange: data.budget,
                currentStage: 0,
                lenderName: data.lenderName,
                preApprovalInfo: data.preApprovalStatus
            });

            // 2. Initial Verification (Orientation > Smart Onboarding)
            try {
                await RoadmapService.verifyTask(user.id, 0, 'profile_setup', user.stage_progress || {});
            } catch (err) {
                console.error("Failed to auto-verify onboarding task", err);
            }
        }
    };

    // --- RENDERERS ---

    const renderIntro = () => (
        <div className="space-y-6 animate-in slide-in-from-right duration-500">
            <h1 className="text-4xl md:text-6xl font-serif tracking-tighter">Welcome.</h1>
            <p className="text-xl md:text-2xl font-light text-white/60">Let's build your custom home the right way.</p>
            <button onClick={next} className="mt-8 px-12 py-4 bg-white text-black font-bold uppercase tracking-widest hover:scale-105 transition-transform">
                Start
            </button>
        </div>
    );

    const renderContact = () => (
        <div className="space-y-8 animate-in slide-in-from-right duration-500 w-full max-w-lg">
            <div className="space-y-2">
                <h2 className="text-3xl font-serif">Who are you?</h2>
                <p className="text-white/50 text-sm uppercase tracking-widest">We keep this data PRIVATE.</p>
            </div>

            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <input placeholder="First Name" className="bg-transparent border-b border-white/20 py-4 text-xl outline-none focus:border-white transition-colors placeholder:text-white/20"
                        value={data.firstName} onChange={e => setData({ ...data, firstName: e.target.value })} autoFocus
                    />
                    <input placeholder="Last Name" className="bg-transparent border-b border-white/20 py-4 text-xl outline-none focus:border-white transition-colors placeholder:text-white/20"
                        value={data.lastName} onChange={e => setData({ ...data, lastName: e.target.value })}
                    />
                </div>
                <input placeholder="Phone Number" className="w-full bg-transparent border-b border-white/20 py-4 text-xl outline-none focus:border-white transition-colors placeholder:text-white/20"
                    value={data.phone} onChange={e => setData({ ...data, phone: e.target.value })}
                />
            </div>

            <button onClick={next} disabled={!data.firstName || !data.lastName} className="px-10 py-4 border border-white/20 hover:bg-white hover:text-black hover:border-white transition-all font-bold uppercase tracking-widest disabled:opacity-30">
                Next
            </button>
        </div>
    );

    const renderScope = () => (
        <div className="space-y-8 animate-in slide-in-from-right duration-500 w-full max-w-lg">
            <div className="space-y-2">
                <h2 className="text-3xl font-serif">What are we building?</h2>
                <p className="text-white/50 text-sm uppercase tracking-widest">Rough estimates are fine.</p>
            </div>

            <div className="space-y-6">
                <div>
                    <label className="text-[10px] uppercase tracking-widest text-white/40 mb-2 block">Target City</label>
                    <input placeholder="e.g. Nashville, TN" className="w-full bg-transparent border-b border-white/20 py-3 text-2xl outline-none focus:border-white transition-colors placeholder:text-white/20"
                        value={data.city} onChange={e => setData({ ...data, city: e.target.value })}
                    />
                </div>

                <div>
                    <label className="text-[10px] uppercase tracking-widest text-white/40 mb-2 block">Total Budget</label>
                    <select
                        value={data.budget}
                        onChange={e => setData({ ...data, budget: e.target.value })}
                        className="w-full bg-transparent border-b border-white/20 py-3 text-xl outline-none focus:border-white transition-colors appearance-none cursor-pointer"
                    >
                        <option value="" className="bg-black text-white/50">Select Range</option>
                        <option value="I don't know" className="bg-black">I don't know yet</option>
                        <option value="$500k - $1M" className="bg-black">$500k - $1M</option>
                        <option value="$1M - $2M" className="bg-black">$1M - $2M</option>
                        <option value="$2M - $5M" className="bg-black">$2M - $5M</option>
                        <option value="$5M+" className="bg-black">$5M+</option>
                    </select>
                </div>
            </div>

            <button onClick={next} disabled={!data.city || !data.budget} className="px-10 py-4 border border-white/20 hover:bg-white hover:text-black hover:border-white transition-all font-bold uppercase tracking-widest disabled:opacity-30">
                Next
            </button>
        </div>
    );

    const renderStageSelect = () => (
        <div className="space-y-8 animate-in slide-in-from-right duration-500 w-full max-w-2xl h-[80vh] flex flex-col">
            <div className="space-y-2 shrink-0">
                <h2 className="text-3xl font-serif">Where are you today?</h2>
                <p className="text-white/50 text-sm uppercase tracking-widest">Be honest, we'll fill in the gaps.</p>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-hide py-4">
                {STAGES.map(stage => (
                    <div
                        key={stage.id}
                        onClick={() => { setData({ ...data, selfSelectedStage: stage.id }); setTimeout(next, 300); }}
                        className={`p-6 border transition-all cursor-pointer group flex items-center justify-between ${data.selfSelectedStage === stage.id
                            ? 'bg-white text-black border-white'
                            : 'bg-white/5 border-white/10 hover:border-white/40 hover:bg-white/10'
                            }`}
                    >
                        <div>
                            <h4 className="font-serif text-xl mb-1">{stage.title}</h4>
                            <p className={`text-xs uppercase tracking-wide ${data.selfSelectedStage === stage.id ? 'text-black/60' : 'text-white/40'}`}>
                                {stage.desc}
                            </p>
                        </div>
                        <div className={`w-6 h-6 rounded-full border border-current flex items-center justify-center ${data.selfSelectedStage === stage.id ? 'opacity-100' : 'opacity-20'}`}>
                            {data.selfSelectedStage === stage.id && <div className="w-3 h-3 bg-black rounded-full" />}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderBackfillFinance = () => (
        <div className="space-y-8 animate-in slide-in-from-right duration-500 w-full max-w-lg">
            <div className="space-y-2">
                <h2 className="text-3xl font-serif">Quick Check.</h2>
                <p className="text-white/50 text-sm uppercase tracking-widest">Since you're past Stage 3, do you have financing?</p>
            </div>

            <div className="space-y-6">
                <div>
                    <label className="text-[10px] uppercase tracking-widest text-white/40 mb-2 block">Pre-Approval Status</label>
                    <div className="grid grid-cols-1 gap-3">
                        {['Approved', 'In Process', 'None / Cash'].map(opt => (
                            <button
                                key={opt}
                                onClick={() => setData({ ...data, preApprovalStatus: opt })}
                                className={`p-4 text-left border ${data.preApprovalStatus === opt ? 'bg-white text-black border-white' : 'border-white/20 hover:border-white/50'}`}
                            >
                                {opt}
                            </button>
                        ))}
                    </div>
                </div>

                {(data.preApprovalStatus === 'Approved' || data.preApprovalStatus === 'In Process') && (
                    <div className="animate-in fade-in slide-in-from-top-2">
                        <label className="text-[10px] uppercase tracking-widest text-white/40 mb-2 block">Lender Name</label>
                        <input placeholder="e.g. First Bank" className="w-full bg-transparent border-b border-white/20 py-3 text-xl outline-none focus:border-white transition-colors"
                            value={data.lenderName} onChange={e => setData({ ...data, lenderName: e.target.value })}
                        />
                    </div>
                )}
            </div>

            <button onClick={next} disabled={!data.preApprovalStatus} className="px-10 py-4 border border-white/20 hover:bg-white hover:text-black hover:border-white transition-all font-bold uppercase tracking-widest disabled:opacity-30">
                Continue
            </button>
        </div>
    );

    return (
        <div className="fixed inset-0 z-[100] bg-black text-white flex flex-col items-center justify-center p-6 md:p-12 overflow-hidden">
            {/* Progress */}
            <div className="absolute top-0 left-0 w-full h-1 bg-white/10">
                <div className="h-full bg-white transition-all duration-500 ease-out" style={{ width: `${((stepIndex + 1) / flow.length) * 100}%` }}></div>
            </div>

            <div className="w-full max-w-4xl flex justify-center">
                {currentStepId === 'INTRO' && renderIntro()}
                {currentStepId === 'CONTACT' && renderContact()}
                {currentStepId === 'SCOPE' && renderScope()}
                {currentStepId === 'STAGE_SELECT' && renderStageSelect()}
                {currentStepId === 'BACKFILL_FINANCE' && renderBackfillFinance()}
                {currentStepId === 'COMPLETE' && (
                    <div className="text-center space-y-6 animate-in zoom-in-95 duration-700">
                        <div className="w-24 h-24 bg-white text-black rounded-full flex items-center justify-center text-4xl mx-auto mb-6">✓</div>
                        <h2 className="text-4xl font-serif">You're Verified.</h2>
                        <p className="text-white/50">Your orientation is complete. Entering your dashboard...</p>
                        {/* Auto-redirect or minimal button */}
                        <div className="flex items-center justify-center gap-2 text-sm text-emerald-400 animate-pulse">
                            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                            Configuring your map...
                        </div>
                    </div>
                )}
            </div>

            {/* Hint */}
            <div className="absolute bottom-8 text-white/20 text-[10px] uppercase tracking-[0.2em]">
                Step {stepIndex + 1} of {flow.length}
            </div>
        </div>
    );
};
