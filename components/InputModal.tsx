import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';

interface InputModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (value: string) => void;
    title: string;
    initialValue?: string;
    type?: 'text' | 'date';
}

export const InputModal: React.FC<InputModalProps> = ({
    isOpen,
    onClose,
    onSave,
    title,
    initialValue = '',
    type = 'text'
}) => {
    const [value, setValue] = useState(initialValue);

    useEffect(() => {
        setValue(initialValue);
    }, [initialValue, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(value);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all duration-300">
            <div className="bg-white dark:bg-[#0A0A0A] rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col border border-zinc-200 dark:border-white/10 ring-4 ring-black/5 dark:ring-white/5 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center p-5 border-b border-zinc-100 dark:border-white/5">
                    <h3 className="font-serif font-bold text-lg text-zinc-900 dark:text-white tracking-tight">{title}</h3>
                    <button onClick={onClose} className="p-2 hover:bg-zinc-100 dark:hover:bg-white/5 rounded-full text-zinc-400 hover:text-zinc-600 transition-colors">
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-6">
                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">
                            {type === 'date' ? 'Select Date' : 'Enter Value'}
                        </label>
                        <input
                            type={type}
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-xl p-4 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-medium"
                            autoFocus
                            placeholder="Type here..."
                        />
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 rounded-xl border border-zinc-200 dark:border-white/10 font-bold text-zinc-500 hover:bg-zinc-50 dark:hover:bg-white/5 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
                        >
                            <Check size={16} />
                            Done
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
