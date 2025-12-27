import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Map, Database, HardHat } from 'lucide-react';

interface OnboardingModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    description: string;
    features?: string[];
    type: 'STAGE_WELCOME' | 'TAB_WELCOME';
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onClose, title, description, features, type }) => {

    // Auto-lock body scroll when open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';

        }
        return () => { document.body.style.overflow = 'unset'; }
    }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 overflow-y-auto overflow-x-hidden flex items-center justify-center p-4"
                        onClick={onClose}
                    >
                        {/* Modal Content */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-lg bg-[#0A0A0A] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Decorative Top Bar */}
                            <div className="h-2 w-full bg-gradient-to-r from-emerald-500 via-emerald-400 to-emerald-600" />

                            <div className="p-8">
                                {/* Header */}
                                <div className="flex justify-between items-start mb-6">
                                    <div className="space-y-2">
                                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 rounded-full text-emerald-400 text-[10px] uppercase font-bold tracking-widest border border-emerald-500/20">
                                            <Sparkles size={12} />
                                            <span>{type === 'STAGE_WELCOME' ? 'Level Up' : 'New Feature'}</span>
                                        </div>
                                        <h2 className="text-3xl font-serif text-white tracking-tight">{title}</h2>
                                    </div>
                                    <button
                                        onClick={onClose}
                                        className="p-2 rounded-full hover:bg-white/5 text-zinc-400 hover:text-white transition-colors"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                {/* Content */}
                                <div className="space-y-6">
                                    <p className="text-zinc-400 text-sm leading-relaxed border-l-2 border-white/10 pl-4">
                                        {description}
                                    </p>

                                    {features && features.length > 0 && (
                                        <div className="bg-white/5 rounded-xl p-6 border border-white/5">
                                            <h4 className="text-xs uppercase tracking-widest text-zinc-500 mb-4 font-bold">What's Unlocked</h4>
                                            <ul className="space-y-3">
                                                {features.map((feat, i) => (
                                                    <li key={i} className="flex items-center gap-3 text-sm text-zinc-300">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                        {feat}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {/* Action */}
                                    <button
                                        onClick={onClose}
                                        className="w-full py-4 bg-white text-black font-bold uppercase tracking-widest text-xs rounded-xl hover:bg-zinc-200 transition-colors"
                                    >
                                        Let's Go
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
