
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export const OnboardingTour: React.FC = () => {
    const { updateProfile } = useAuth();
    const [step, setStep] = useState(0);
    const [scope, setScope] = useState({ city: '', budget: '' });

    const handleComplete = async () => {
        await updateProfile({
            hasOnboarded: true,
            city: scope.city,
            budgetRange: scope.budget
        });
    };

    const steps = [
        {
            title: "Welcome to MCH",
            desc: "Your private digital family office for building.",
            icon: "✨"
        },
        {
            title: "Define Your Scope",
            desc: "To guide you, I need to know your target market.",
            isForm: true
        },
        {
            title: "Your Guide",
            desc: "The AI Pilot will analyze your land, contracts, and bids 24/7.",
            icon: "🤖"
        },
        {
            title: "The Team",
            desc: "We research and vet every vendor for you.",
            icon: "🤝"
        }
    ];

    return (
        <div className="fixed inset-0 z-[100] bg-black text-white flex flex-col items-center justify-center p-8 animate-in fade-in duration-500">
            <div className="max-w-md w-full text-center space-y-8 animate-in slide-in-from-bottom-8 duration-700">

                {steps[step].isForm ? (
                    <div className="space-y-6 animate-in slide-in-from-right duration-500">
                        <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">🎯</div>
                        <h2 className="text-3xl font-serif">{steps[step].title}</h2>
                        <p className="text-white/60 text-sm uppercase tracking-widest">{steps[step].desc}</p>

                        <div className="space-y-4 text-left">
                            <div>
                                <label className="text-[10px] uppercase tracking-widest text-white/50 block mb-2">Target City / Region</label>
                                <input
                                    value={scope.city}
                                    onChange={e => setScope({ ...scope, city: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 px-4 py-3 text-sm focus:border-white outline-none transition-colors text-white"
                                    placeholder="e.g. Austin, TX"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] uppercase tracking-widest text-white/50 block mb-2">Total Budget Range</label>
                                <select
                                    value={scope.budget}
                                    onChange={e => setScope({ ...scope, budget: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 px-4 py-3 text-sm focus:border-white outline-none transition-colors appearance-none text-white"
                                >
                                    <option value="" className="text-black">Select Range</option>
                                    <option value="$500k - $1M" className="text-black">$500k - $1M</option>
                                    <option value="$1M - $2M" className="text-black">$1M - $2M</option>
                                    <option value="$2M - $5M" className="text-black">$2M - $5M</option>
                                    <option value="$5M+" className="text-black">$5M+</option>
                                </select>
                            </div>
                        </div>

                        <button
                            onClick={() => setStep(step + 1)}
                            disabled={!scope.city || !scope.budget}
                            className="w-full bg-white text-black py-4 font-bold uppercase tracking-widest hover:bg-white/90 disabled:opacity-50 transition-all mt-8"
                        >
                            Next Step
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center text-4xl mx-auto mb-6 animate-bounce">
                            {steps[step].icon}
                        </div>

                        <h2 className="text-4xl font-serif tracking-tight">{steps[step].title}</h2>
                        <p className="text-lg text-white/60 font-light leading-relaxed">{steps[step].desc}</p>

                        <button
                            onClick={() => {
                                if (step < steps.length - 1) {
                                    setStep(step + 1);
                                } else {
                                    handleComplete();
                                }
                            }}
                            className="px-12 py-4 bg-white text-black text-sm font-bold uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-[0_0_40px_rgba(255,255,255,0.1)] mt-8"
                        >
                            {step === steps.length - 1 ? "Enter MCH" : "Continue"}
                        </button>
                    </>
                )}

                <div className="flex justify-center space-x-2 mt-12">
                    {steps.map((_, i) => (
                        <div
                            key={i}
                            className={`h-1 rounded-full transition-all duration-500 ${i === step ? 'w-8 bg-white' : 'w-2 bg-white/20'}`}
                        ></div>
                    ))}
                </div>
            </div>
        </div>
    );
};
