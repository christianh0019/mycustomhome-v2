
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const SLIDES = [
    {
        title: "Welcome to the Sanctuary.",
        body: "Building a custom home used to be the 'Wild West'—risky, slow, and overpriced. We've changed that. As your digital fiduciary, MyCustomHome protects your interests, accelerates your timeline with AI, and gives you direct-to-source transparency. This is the safest, fastest way to build.",
        style: "bg-emerald-900"
    },
    {
        title: "Meet Your Copilot.",
        body: "You are never alone. Your AI Project Pilot (right here) is available 24/7 to answer zoning questions, analyze costs, and guide you through the 9 Stages of construction. It remembers everything, so you don't have to.",
        style: "bg-blue-900"
    },
    {
        title: "Total Control.",
        body: "Use the sidebar to manage your implementation. From 'Vision' to 'Keys', every document, receipt, and decision is organized here. No more lost emails.",
        style: "bg-indigo-900"
    },
    {
        title: "Let's Begin.",
        body: "Your journey starts now. We'll begin by assessing your land and requirements.",
        style: "bg-slate-900",
        isLast: true
    }
];

export const OnboardingTour: React.FC = () => {
    const { updateProfile } = useAuth();
    const [index, setIndex] = useState(0);

    const handleNext = async () => {
        if (index < SLIDES.length - 1) {
            setIndex(index + 1);
        } else {
            // Finish Tour
            await updateProfile({ hasOnboarded: true });
        }
    };

    const slide = SLIDES[index];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className={`relative w-full max-w-2xl overflow-hidden rounded-2xl shadow-2xl border border-white/10 ${slide.style} transition-colors duration-500`}>

                {/* Progress Bar */}
                <div className="flex w-full h-1 bg-white/10">
                    {SLIDES.map((_, i) => (
                        <div
                            key={i}
                            className={`h-full flex-1 transition-all duration-300 ${i <= index ? 'bg-white' : 'bg-transparent'}`}
                        />
                    ))}
                </div>

                {/* Content */}
                <div className="p-12 min-h-[400px] flex flex-col justify-center text-center">
                    <h2 className="text-4xl font-light tracking-tight text-white mb-6 animate-in slide-in-from-bottom-4 duration-500 key={index}">
                        {slide.title}
                    </h2>
                    <p className="text-xl font-light text-white/80 leading-relaxed max-w-lg mx-auto mb-10 animate-in slide-in-from-bottom-8 duration-500 delay-100 key={index}">
                        {slide.body}
                    </p>

                    <button
                        onClick={handleNext}
                        className="mx-auto px-8 py-3 bg-white text-black font-medium rounded-full hover:scale-105 transition-transform active:scale-95"
                    >
                        {slide.isLast ? "Start My Journey" : "Continue"}
                    </button>
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 p-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                <div className="absolute bottom-0 left-0 p-32 bg-black/20 rounded-full blur-3xl -ml-16 -mb-16 pointer-events-none" />
            </div>
        </div>
    );
};
