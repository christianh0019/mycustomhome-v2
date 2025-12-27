import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastProps {
    id: string;
    message: string;
    type?: ToastType;
    duration?: number;
    onDismiss: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ id, message, type = 'info', duration = 4000, onDismiss }) => {

    useEffect(() => {
        const timer = setTimeout(() => {
            onDismiss(id);
        }, duration);
        return () => clearTimeout(timer);
    }, [id, duration, onDismiss]);

    const icons = {
        success: <CheckCircle size={18} className="text-emerald-500" />,
        error: <AlertCircle size={18} className="text-red-500" />,
        info: <Info size={18} className="text-blue-500" />
    };

    const styles = {
        success: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-200',
        error: 'bg-red-500/10 border-red-500/20 text-red-200',
        info: 'bg-blue-500/10 border-blue-500/20 text-blue-200'
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-md shadow-2xl ${styles[type]} min-w-[300px] max-w-md`}
        >
            <div className="shrink-0">{icons[type]}</div>
            <p className="text-sm font-medium flex-1">{message}</p>
            <button
                onClick={() => onDismiss(id)}
                className="shrink-0 opacity-50 hover:opacity-100 transition-opacity p-1"
            >
                <X size={14} />
            </button>
        </motion.div>
    );
};
