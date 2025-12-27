import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';

interface ProceedButtonProps {
    nextStageName: string;
    onProceed: () => void;
}

export const ProceedButton: React.FC<ProceedButtonProps> = ({ nextStageName, onProceed }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 mb-12 flex justify-center w-full"
        >
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onProceed}
                className="group relative px-8 py-4 bg-white text-black rounded-xl font-bold uppercase tracking-widest flex items-center gap-3 shadow-2xl hover:shadow-emerald-500/20 transition-all overflow-hidden"
            >
                {/* Background Animation */}
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 via-white to-emerald-400 opacity-0 group-hover:opacity-20 transition-opacity duration-500" />

                <Sparkles size={18} className="text-emerald-600" />
                <span>Proceed to {nextStageName}</span>
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </motion.button>
        </motion.div>
    );
};
