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
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-[#0A0A0A] rounded-2xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col">
                <div className="flex justify-between items-center p-4 border-b border-zinc-200 dark:border-white/10">
                    <h3 className="font-bold text-zinc-900 dark:text-white">{title}</h3>
                    <button onClick={onClose} className="p-2 hover:bg-zinc-100 dark:hover:bg-white/5 rounded-full text-zinc-500">
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">
                            {type === 'date' ? 'Select Date' : 'Enter Value'}
                        </label>
                        <input
                            type={type}
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-xl p-3 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                            autoFocus
                        />
                    </div>

                    <div className="flex gap-3 mt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 rounded-xl border border-zinc-200 dark:border-white/10 font-bold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
                        >
                            <Check size={16} />
                            Save
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
