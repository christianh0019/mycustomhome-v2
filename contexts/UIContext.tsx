import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Toast, ToastType } from '../components/Toast';
import { Dialog, DialogType } from '../components/Dialog';
import { AnimatePresence } from 'framer-motion';

interface ToastData {
    id: string;
    message: string;
    type: ToastType;
}

interface DialogConfig {
    type: DialogType;
    title: string;
    message?: string;
    defaultValue?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    resolve: (value: any) => void;
}

interface UIContextType {
    showToast: (message: string, type?: ToastType) => void;

    // Async Dialogs
    alert: (message: string, title?: string) => Promise<void>;
    confirm: (message: string, title?: string) => Promise<boolean>;
    prompt: (message: string, defaultValue?: string, title?: string) => Promise<string | null>;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export const UIProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<ToastData[]>([]);
    const [dialog, setDialog] = useState<DialogConfig | null>(null);

    // --- TOASTS ---
    const showToast = useCallback((message: string, type: ToastType = 'info') => {
        const id = Math.random().toString(36).substring(7);
        setToasts(prev => [...prev, { id, message, type }]);
    }, []);

    const dismissToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    // --- DIALOGS ---
    const alert = useCallback((message: string, title = 'Notice') => {
        return new Promise<void>(resolve => {
            setDialog({
                type: 'alert',
                title,
                message,
                confirmLabel: 'OK',
                resolve: () => {
                    setDialog(null);
                    resolve();
                }
            });
        });
    }, []);

    const confirm = useCallback((message: string, title = 'Confirm') => {
        return new Promise<boolean>(resolve => {
            setDialog({
                type: 'confirm',
                title,
                message,
                confirmLabel: 'Yes',
                cancelLabel: 'Cancel',
                resolve: (start: boolean) => {
                    setDialog(null);
                    resolve(start);
                }
            });
        });
    }, []);

    const prompt = useCallback((message: string, defaultValue = '', title = 'Input') => {
        return new Promise<string | null>(resolve => {
            setDialog({
                type: 'prompt',
                title,
                message,
                defaultValue,
                confirmLabel: 'Submit',
                cancelLabel: 'Cancel',
                resolve: (value: string | null) => {
                    setDialog(null);
                    resolve(value);
                }
            });
        });
    }, []);

    return (
        <UIContext.Provider value={{ showToast, alert, confirm, prompt }}>
            {children}

            {/* TOAST CONTAINER */}
            <div className="fixed bottom-6 right-6 z-[300] flex flex-col gap-2 pointer-events-none">
                <AnimatePresence mode="popLayout">
                    {toasts.map(toast => (
                        <Toast key={toast.id} {...toast} onDismiss={dismissToast} />
                    ))}
                </AnimatePresence>
            </div>

            {/* GLOBAL DIALOG */}
            <Dialog
                isOpen={!!dialog}
                type={dialog?.type || 'alert'}
                title={dialog?.title || ''}
                message={dialog?.message}
                defaultValue={dialog?.defaultValue}
                confirmLabel={dialog?.confirmLabel}
                cancelLabel={dialog?.cancelLabel}
                onConfirm={(val) => dialog?.resolve(val !== undefined ? val : true)}
                onCancel={() => dialog?.resolve(dialog.type === 'prompt' ? null : false)}
            />
        </UIContext.Provider>
    );
};

export const useUI = () => {
    const context = useContext(UIContext);
    if (!context) throw new Error('useUI must be used within a UIProvider');
    return context;
};
