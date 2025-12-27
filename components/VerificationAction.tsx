import React from 'react';
import { VerificationActionConfig } from '../services/RoadmapService';
import { UploadCloud, MessageSquare, FileText, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface VerificationActionProps {
    action: VerificationActionConfig | undefined;
    isVerified: boolean;
    onVerify: () => void; // Fallback for when action is complete
}

export const VerificationAction: React.FC<VerificationActionProps> = ({ action, isVerified, onVerify }) => {

    // If already verified, show a static "Done" state
    if (isVerified) {
        return (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] uppercase tracking-wider font-medium cursor-default">
                <CheckCircle size={12} />
                <span>Verified</span>
            </div>
        );
    }

    if (!action) {
        // Fallback for tasks without explicit action config (shouldn't happen often now)
        return (
            <button
                onClick={onVerify}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10 transition-colors text-[10px] uppercase tracking-wider font-medium group"
            >
                <div className="w-3 h-3 rounded-full border border-current group-hover:bg-white/20" />
                <span>Mark Done</span>
            </button>
        );
    }

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent card from toggling if inside a clickable area

        // TODO: Replace these alerts with actual Modal Triggers
        if (action.type === 'UPLOAD_FILE') {
            console.log("Trigger Upload Modal", action.config);
            // Simulate completion for now until we have real file upload events
            // In real app, this button opens a modal, and the modal calls onVerify upon success.
            const confirmed = window.confirm(`[MOCK] Upload ${action.config.targetFolder}? \n\nClick OK to simulate successful upload and verification.`);
            if (confirmed) onVerify();
        }
        else if (action.type === 'TALK_TO_PILOT') {
            console.log("Trigger Chat Intent", action.config);
            window.alert(`[MOCK] Opening Chat with intent: ${action.config.intent}`);
            // Chat usually doesn't auto-verify. The user might need to manually check it after chatting.
            // For this MVP, let's allow manual verify after clicking "Chat".
            onVerify();
        }
        else if (action.type === 'FORM_INPUT') {
            console.log("Trigger Form Modal", action.config);
            const input = window.prompt(`[MOCK] Form: ${action.label}\nEnter value to verify:`, "Simulated Input");
            if (input) onVerify();
        }
    };

    // Render different styles based on type
    return (
        <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleClick}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] uppercase tracking-widest font-bold border transition-all shadow-lg
                ${action.type === 'UPLOAD_FILE' ? 'bg-blue-500/10 border-blue-500/30 text-blue-400 hover:bg-blue-500/20 hover:border-blue-500/50' : ''}
                ${action.type === 'TALK_TO_PILOT' ? 'bg-purple-500/10 border-purple-500/30 text-purple-400 hover:bg-purple-500/20 hover:border-purple-500/50' : ''}
                ${action.type === 'FORM_INPUT' ? 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700 hover:border-zinc-500' : ''}
            `}
        >
            {action.type === 'UPLOAD_FILE' && <UploadCloud size={14} />}
            {action.type === 'TALK_TO_PILOT' && <MessageSquare size={14} />}
            {action.type === 'FORM_INPUT' && <FileText size={14} />}
            <span>{action.label}</span>
        </motion.button>
    );
};
