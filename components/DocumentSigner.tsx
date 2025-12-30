import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, CheckCircle2, PenTool, CheckSquare, Calendar, FileText, Type, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

import { DocItem, DraggableField, DroppableCanvas, DraggableFieldOnCanvas } from './DocumentComponents';
import { SignaturePadModal } from './SignaturePadModal';
import { InputModal } from './InputModal';

// Set worker for PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export const DocumentSigner: React.FC<{
    initialDoc: DocItem;
    onBack: () => void;
    onSigningComplete: (docId: string, signedUrl?: string) => void;
    currentUserRole?: 'business' | 'contact';
}> = ({ initialDoc, onBack, onSigningComplete, currentUserRole = 'contact' }) => {
    const { user } = useAuth();

    // State
    const [numPages, setNumPages] = useState<number>(1);
    const [fields, setFields] = useState<DraggableField[]>(initialDoc.metadata || []);
    const [activeSigningFieldId, setActiveSigningFieldId] = useState<string | null>(null);
    const [isSignaturePadOpen, setIsSignaturePadOpen] = useState(false);

    // Input Modal State
    const [inputModalState, setInputModalState] = useState<{
        isOpen: boolean;
        fieldId: string | null;
        label: string;
        value: string;
        type: 'text' | 'date';
    }>({
        isOpen: false,
        fieldId: null,
        label: '',
        value: '',
        type: 'text'
    });

    const fileType = initialDoc.file_url
        ? (initialDoc.file_url.toLowerCase().includes('.pdf') ? 'pdf' : 'image')
        : 'image'; // Fallback

    const requiredFields = fields.filter(f => f.assignee === currentUserRole);
    const completedFields = requiredFields.filter(f => !!f.value);
    const progress = Math.round((completedFields.length / Math.max(requiredFields.length, 1)) * 100);
    const isComplete = progress === 100 && requiredFields.length > 0;

    const updateFieldValue = (id: string, value: string) => {
        setFields(fields.map(f => f.id === id ? { ...f, value } : f));
    };

    const handleFieldClick = (field: DraggableField) => {
        // Strict Role Check: Ensure user only interacts with their assigned fields
        const canInteract = field.assignee === currentUserRole;
        if (!canInteract) return;

        setActiveSigningFieldId(field.id);

        if (field.type === 'signature' || field.type === 'initials') {
            setIsSignaturePadOpen(true);
        } else if (field.type === 'checkbox') {
            // Toggle Checkbox
            updateFieldValue(field.id, field.value === 'checked' ? '' : 'checked');
        } else {
            // Open Input Modal for text/date
            setInputModalState({
                isOpen: true,
                fieldId: field.id,
                label: field.label,
                value: field.value || '',
                type: field.type === 'date' ? 'date' : 'text'
            });
        }
    };

    const handleFinish = async () => {
        if (!isComplete) return;

        // Optimistic update
        onSigningComplete(initialDoc.id);

        // Audit Log would go here
    };

    return (
        <div className="fixed inset-0 z-50 bg-zinc-100 dark:bg-[#050505] flex flex-col">
            <InputModal
                isOpen={inputModalState.isOpen}
                onClose={() => setInputModalState({ ...inputModalState, isOpen: false })}
                onSave={(val) => {
                    if (inputModalState.fieldId) updateFieldValue(inputModalState.fieldId, val);
                }}
                label={inputModalState.label}
                type={inputModalState.type}
            />

            {isSignaturePadOpen && activeSigningFieldId && (
                <SignaturePadModal
                    isOpen={true}
                    onClose={() => setIsSignaturePadOpen(false)}
                    onSign={(signatureData) => {
                        updateFieldValue(activeSigningFieldId, signatureData);
                        setIsSignaturePadOpen(false);
                        setActiveSigningFieldId(null);
                    }}
                    documentTitle={initialDoc.title}
                />
            )}

            {/* Header */}
            <div className="h-16 bg-white dark:bg-[#0A0A0A] border-b border-zinc-200 dark:border-white/10 flex items-center justify-between px-6 shrink-0 shadow-sm z-30">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 flex items-center justify-center transition-colors">
                        <ChevronLeft size={18} className="text-zinc-600 dark:text-zinc-400" />
                    </button>
                    <div>
                        <h1 className="text-lg font-bold text-zinc-900 dark:text-white">{initialDoc.title}</h1>
                        <p className="text-xs text-zinc-500">Please review and sign below.</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="hidden md:flex flex-col items-end">
                        <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">{completedFields.length}/{requiredFields.length} Fields Completed</span>
                        <div className="w-32 h-1 bg-zinc-200 dark:bg-white/10 rounded-full mt-1 overflow-hidden">
                            <div className="h-full bg-indigo-500 transition-all duration-500" style={{ width: `${progress}%` }} />
                        </div>
                    </div>

                    <button
                        onClick={handleFinish}
                        disabled={!isComplete}
                        className={`px-6 py-2 rounded-lg text-sm font-bold shadow-lg transition-all flex items-center gap-2 ${isComplete
                                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/20 animate-pulse'
                                : 'bg-zinc-200 dark:bg-white/5 text-zinc-400 cursor-not-allowed'
                            }`}
                    >
                        <CheckCircle2 size={18} />
                        Finish & Sign
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-auto relative flex justify-center p-8 bg-zinc-100 dark:bg-[#050505]">
                <div
                    className="bg-white dark:bg-white shadow-2xl relative transition-transform duration-300"
                    style={{ width: '595px', minHeight: '842px' }}
                >
                    {/* Document Layer */}
                    <div className="absolute inset-0 z-0">
                        {fileType === 'pdf' && initialDoc.file_url ? (
                            <Document file={initialDoc.file_url} onLoadSuccess={({ numPages }) => setNumPages(numPages)}>
                                <Page pageNumber={1} width={595} renderTextLayer={false} renderAnnotationLayer={false} />
                            </Document>
                        ) : (
                            <img src={initialDoc.file_url || ''} className="w-full h-full object-contain" />
                        )}
                    </div>

                    {/* Interactive Layer */}
                    <div className="absolute inset-0 z-10">
                        {fields.map(field => (
                            <DraggableFieldOnCanvas
                                key={field.id}
                                field={field}
                                isSelected={false}
                                onSelect={() => { }}
                                onUpdatePos={() => { }}
                                isReadOnly={false}
                                isSigningMode={true}
                                currentUserRole={currentUserRole}
                                onSigningClick={() => handleFieldClick(field)}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Mobile Progress Bar (Sticky Bottom) */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-[#0A0A0A] border-t border-zinc-200 dark:border-white/10 p-4 z-40">
                <div className="flex justify-between text-xs font-bold mb-2">
                    <span>Progress</span>
                    <span>{progress}%</span>
                </div>
                <div className="w-full h-2 bg-zinc-100 dark:bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 transition-all duration-300" style={{ width: `${progress}%` }} />
                </div>
            </div>
        </div>
    );
};
