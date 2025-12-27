import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export type DialogType = 'confirm' | 'prompt' | 'alert';

export interface DialogProps {
    isOpen: boolean;
    type: DialogType;
    title: string;
    message?: string;
    defaultValue?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm: (value?: string) => void;
    onCancel: () => void;
}

export const Dialog: React.FC<DialogProps> = ({
    isOpen, type, title, message, defaultValue = '',
    confirmLabel = 'Confirm', cancelLabel = 'Cancel',
    onConfirm, onCancel
}) => {
    const [inputValue, setInputValue] = useState(defaultValue);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen && type === 'prompt') {
            setInputValue(defaultValue);
            // Focus hack
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen, type, defaultValue]);

    const handleConfirm = () => {
        if (type === 'prompt') {
            onConfirm(inputValue);
        } else {
            onConfirm();
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        onClick={onCancel}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-md bg-[#111] border border-white/10 rounded-2xl p-6 shadow-2xl overflow-hidden"
                    >
                        {/* Glow */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                        <h3 className="text-xl font-serif text-white mb-2 relative z-10">{title}</h3>
                        {message && <p className="text-zinc-400 text-sm mb-6 leading-relaxed relative z-10">{message}</p>}

                        {type === 'prompt' && (
                            <div className="mb-6 relative z-10">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-emerald-500/50 focus:bg-emerald-500/5 transition-all text-sm"
                                    onKeyDown={(e) => e.key === 'Enter' && handleConfirm()}
                                />
                            </div>
                        )}

                        <div className="flex justify-end gap-3 relative z-10">
                            {type !== 'alert' && (
                                <button
                                    onClick={onCancel}
                                    className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-zinc-500 hover:text-white transition-colors"
                                >
                                    {cancelLabel}
                                </button>
                            )}
                            <button
                                onClick={handleConfirm}
                                className="px-6 py-2 bg-white text-black text-xs font-bold uppercase tracking-wider rounded-lg hover:scale-105 active:scale-95 transition-all"
                            >
                                {confirmLabel}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
