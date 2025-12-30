import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
    FileText, Plus, Search,
    PenTool, Type, Calendar, CheckSquare, Image as ImageIcon,
    Users, Send, ChevronLeft, Save, GripVertical, Settings, Upload, X, Trash2, Eye, Pencil, File, FileSignature,
    Bold, Italic, Heading1, Heading2, List, AlignLeft, AlignCenter, AlignRight, Underline, ListOrdered, Indent, Outdent, Minus, ChevronDown
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';
import { motion } from 'framer-motion';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

import { SignaturePadModal } from './SignaturePadModal';
import { InputModal } from './InputModal';

// Set worker for PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

// --- Interfaces & Types ---

// Inside DocumentCreator component:
type DocumentStatus = 'draft' | 'sent' | 'completed';

export interface DocItem {
    id: string;
    title: string;
    recipient: string;
    recipient_email: string;
    date: string;
    status: DocumentStatus;
    file_url?: string;
    metadata?: any[];
}

interface DraggableField {
    id: string;
    type: 'signature' | 'initials' | 'date' | 'text' | 'checkbox' | 'image';
    label: string;
    x: number; // Percentage 0-100
    y: number; // Percentage 0-100
    pageNumber: number; // 1-indexed
    value?: string;
    recipientId?: number; // 1 = Primary
    width?: number; // For resizeable items
    height?: number;
    assignee?: 'business' | 'contact';
}

interface Lead {
    id: string;
    project_title: string;
    location_city: string;
    location_state: string;
}

const SendDocumentModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSend: (lead: Lead) => void;
}> = ({ isOpen, onClose, onSend }) => {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (isOpen) {
            fetchLeads();
        }
    }, [isOpen]);

    const fetchLeads = async () => {
        setLoading(true);
        // Fetch leads from Supabase
        const { data, error } = await supabase
            .from('leads')
            .select('id, project_title, location_city, location_state')
            .order('created_at', { ascending: false });

        if (data) {
            setLeads(data);
        }
        setLoading(false);
    };

    const filteredLeads = leads.filter(l =>
        (l.project_title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (l.location_city?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white dark:bg-[#111] w-full max-w-md rounded-2xl shadow-xl border border-zinc-200 dark:border-white/10 overflow-hidden flex flex-col max-h-[80vh]"
            >
                <div className="p-6 border-b border-zinc-200 dark:border-white/10 flex justify-between items-center">
                    <h3 className="text-xl font-serif font-bold text-zinc-900 dark:text-white">Send Document</h3>
                    <button onClick={onClose} className="p-2 hover:bg-zinc-100 dark:hover:bg-white/5 rounded-full transition-colors">
                        <X size={20} className="text-zinc-500" />
                    </button>
                </div>

                <div className="p-6 flex-1 overflow-y-auto">
                    <div className="relative mb-4">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search projects..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                        />
                    </div>

                    <div className="space-y-2">
                        {loading ? (
                            <div className="text-center py-8 text-zinc-400">Loading leads...</div>
                        ) : filteredLeads.length > 0 ? (
                            filteredLeads.map(lead => (
                                <div
                                    key={lead.id}
                                    onClick={() => setSelectedLead(lead)}
                                    className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${selectedLead?.id === lead.id
                                        ? 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-500 ring-1 ring-indigo-500'
                                        : 'bg-white dark:bg-white/5 border-zinc-200 dark:border-white/10 hover:border-indigo-300'
                                        }`}
                                >
                                    <div>
                                        <h4 className="font-bold text-zinc-900 dark:text-white">{lead.project_title}</h4>
                                        <p className="text-xs text-zinc-500">{lead.location_city}, {lead.location_state}</p>
                                    </div>
                                    {selectedLead?.id === lead.id && (
                                        <div className="w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center text-white">
                                            <CheckSquare size={12} />
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-zinc-400">No leads found.</div>
                        )}
                    </div>
                </div>

                <div className="p-6 border-t border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-black/20">
                    <button
                        onClick={() => selectedLead && onSend(selectedLead)}
                        disabled={!selectedLead}
                        className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${selectedLead
                            ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                            : 'bg-zinc-200 dark:bg-white/5 text-zinc-400 cursor-not-allowed'
                            }`}
                    >
                        <Send size={18} />
                        Send Document
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

// --- Components ---

const TOOL_TYPES: { type: DraggableField['type'], icon: any, label: string }[] = [
    { type: 'signature', icon: PenTool, label: 'Signature' },
    { type: 'initials', icon: Type, label: 'Initials' }, // Using Type icon as placeholder for Initials
    { type: 'date', icon: Calendar, label: 'Date Signed' },
    { type: 'text', icon: FileText, label: 'Text Field' },
    { type: 'checkbox', icon: CheckSquare, label: 'Checkbox' },
    { type: 'image', icon: ImageIcon, label: 'Image' },
];

const StatusBadge: React.FC<{ status: DocumentStatus, isSigning?: boolean }> = ({ status, isSigning }) => {
    // If we are in "Signing Mode", we are effectively "Published/Live"
    if (isSigning) {
        return (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 rounded-full text-[10px] font-bold uppercase tracking-wider border border-emerald-200 dark:border-emerald-500/20">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Published
            </div>
        );
    }

    switch (status) {
        case 'draft':
            return (
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-zinc-100 dark:bg-white/5 text-zinc-600 dark:text-zinc-400 rounded-full text-[10px] font-bold uppercase tracking-wider border border-zinc-200 dark:border-white/10">
                    <div className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
                    Draft Mode
                </div>
            );
        case 'sent':
            return (
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 rounded-full text-[10px] font-bold uppercase tracking-wider border border-blue-200 dark:border-blue-500/20">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                    Sent
                </div>
            );
        case 'completed':
            return (
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400 rounded-full text-[10px] font-bold uppercase tracking-wider border border-green-200 dark:border-green-500/20">
                    <CheckSquare size={10} />
                    Signed
                </div>
            );
    }
};

const IconButton: React.FC<{ icon: any, onClick?: () => void, active?: boolean, disabled?: boolean, title?: string }> = ({ icon: Icon, onClick, active, disabled, title }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        title={title}
        className={`w-8 h-8 flex items-center justify-center rounded transition-colors ${active ? 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
        <Icon size={16} />
    </button>
);

const ToolbarSelect: React.FC<{
    value: string,
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void,
    options: { label: string, value: string }[],
    width?: string
}> = ({ value, onChange, options, width = 'w-32' }) => (
    <div className={`relative ${width} h-8 bg-zinc-100 rounded flex items-center px-2`}>
        <select
            value={value}
            onChange={onChange}
            className="w-full h-full bg-transparent text-xs text-zinc-700 outline-none appearance-none cursor-pointer"
        >
            {options.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
            ))}
        </select>
        <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400">
            <ChevronDown size={12} />
        </div>
    </div>
);


// Exporting DocumentCreator for reuse in MessagesTab
export const DocumentCreator: React.FC<{
    onBack: () => void;
    initialDoc: DocItem | null;
    isSigningSession?: boolean; // New: If true, opens directly in signing mode
    currentUserRole?: 'business' | 'contact'; // New: Restricts field interaction
    onSigningComplete?: (docId: string, signedUrl?: string) => void; // New: Callback when verified
}> = ({ onBack, initialDoc, isSigningSession = false, currentUserRole = 'business', onSigningComplete }) => {
    const { user } = useAuth();
    const isReadOnly = initialDoc ? initialDoc.status !== 'draft' && !isSigningSession : false;

    const [docTitle, setDocTitle] = useState(initialDoc?.title || 'Untitled Document');
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(initialDoc?.file_url || null); // Load valid URL if exists

    const [fileType, setFileType] = useState<'image' | 'pdf' | 'blank' | 'template' | null>(initialDoc?.file_url ? (initialDoc.file_url.endsWith('.pdf') ? 'pdf' : 'image') : null);
    const [numPages, setNumPages] = useState<number>(1);

    const [pageContent, setPageContent] = useState<{ [page: number]: string }>({});
    const [fields, setFields] = useState<DraggableField[]>(initialDoc?.metadata || []);
    const [saving, setSaving] = useState(false);

    const [recipientName, setRecipientName] = useState(initialDoc?.recipient || '');
    const [recipientEmail, setRecipientEmail] = useState(initialDoc?.recipient_email || '');

    const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);

    const [isSendModalOpen, setIsSendModalOpen] = useState(false);

    // Signing Mode State
    // If isSigningSession is true, start in signing mode immediately
    const [isSigningMode, setIsSigningMode] = useState(isSigningSession);
    const [showPublishWarning, setShowPublishWarning] = useState(false);
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

    const handleInputModalSave = (val: string) => {
        if (inputModalState.fieldId) {
            updateFieldValue(inputModalState.fieldId, val);
        }
    };


    const handleSendClick = () => {
        // 1. Initial Validation: Ensure fields exist
        if (fields.filter(f => f.assignee === 'business').length === 0 && fields.filter(f => f.assignee === 'contact').length === 0) {
            alert("Please add at least one field before sending.");
            return;
        }
        setShowPublishWarning(true);
    };


    // Inside DocumentCreator component:



    const confirmPublish = () => {
        setShowPublishWarning(false);
        setIsSigningMode(true);
        // Force save to lock content. Pass false for shouldExit
        handleSave('draft', true, undefined, false);
    };

    const handleSigningFieldClick = (field: DraggableField) => {
        // Strict Role Check: Ensure user only interacts with their assigned fields
        if (!isSigningMode) return;

        const canInteract = field.assignee === currentUserRole;
        if (!canInteract) return;

        setActiveSigningFieldId(field.id);

        if (field.type === 'signature' || field.type === 'initials') {
            setIsSignaturePadOpen(true);
        } else {
            // Open Input Modal for other fields
            setInputModalState({
                isOpen: true,
                fieldId: field.id,
                label: field.label,
                value: field.value || '',
                type: field.type === 'date' ? 'date' : 'text'
            });
        }
    };

    // --- State Management ---
    const addField = (type: DraggableField['type'], label: string, x: number, y: number) => {
        const newField: DraggableField = {
            id: Date.now().toString(),
            type,
            label,
            x,
            y,
            pageNumber: 1, // Default to page 1 for now if single page
            value: '',
            width: 200,
            recipientId: 1, // Default to recipient 1
            assignee: 'business' // Default to business (Vendor)
        };
        setFields([...fields, newField]);
        setSelectedFieldId(newField.id);
    };

    const updateFieldPosition = (id: string, x: number, y: number) => {
        setFields(fields.map(f => f.id === id ? { ...f, x, y } : f));
    };

    const updateFieldValue = (id: string, value: string) => {
        setFields(fields.map(f => f.id === id ? { ...f, value } : f));
    };

    const updateFieldAssignee = (id: string, assignee: 'business' | 'contact') => {
        setFields(fields.map(f => f.id === id ? { ...f, assignee } : f));
    };

    const deleteField = (id: string) => {
        setFields(fields.filter(f => f.id !== id));
        if (selectedFieldId === id) setSelectedFieldId(null);
    };

    // --- File Handling ---

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if (f) {
            setFile(f);
            setPreviewUrl(URL.createObjectURL(f));
            if (f.type === 'application/pdf') {
                setFileType('pdf');
            } else {
                setFileType('image');
            }
        }
    };

    const handleSave = async (status: DocumentStatus = 'draft', shouldExit = true, lead?: Lead, forceStay = false) => {
        if (!user) return;
        setSaving(true);

        try {
            const updates: any = {
                title: docTitle,
                recipient: lead?.project_title || recipientName,
                recipient_email: recipientEmail,
                status: status,
                metadata: fields, // Store fields as JSON
                updated_at: new Date().toISOString(),
            };

            // If we have a newly uploaded file, upload it to storage
            if (file) {
                const fileExt = file.name.split('.').pop();
                const fileName = `${Math.random()}.${fileExt}`;
                const filePath = `${user.id}/${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('documents')
                    .upload(filePath, file);

                if (uploadError) {
                    setSaving(false);
                    alert("Error uploading file.");
                    return;
                }

                const { data: { publicUrl } } = supabase.storage.from('documents').getPublicUrl(filePath);
                updates.file_url = publicUrl;
            }

            if (initialDoc?.id) {
                // Update existing
                const { error } = await supabase.from('documents').update(updates).eq('id', initialDoc.id);
                if (error) throw error;
            } else {
                // Insert new
                const { error } = await supabase.from('documents').insert({
                    user_id: user.id,
                    ...updates
                });
                if (error) throw error;
            }

            if (shouldExit && !forceStay) {
                onBack();
            }
        } catch (err: any) {
            console.error(err);
            alert("Error saving document: " + err.message);
        } finally {
            setSaving(false);
        }
    };

    // --- Image Drop Handling ---
    const fileInputRef = useRef<HTMLInputElement>(null);
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if (f && selectedFieldId) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                updateFieldValue(selectedFieldId, ev.target?.result as string);
            };
            reader.readAsDataURL(f);
        }
    };


    // If in strict signing session, hide the editor sidebars/toolbars
    const showEditorUI = !isSigningSession;

    return (
        <div className="fixed inset-0 z-50 bg-zinc-100 dark:bg-[#050505] flex flex-col">
            <InputModal
                isOpen={inputModalState.isOpen}
                onClose={() => setInputModalState({ ...inputModalState, isOpen: false })}
                onSave={handleInputModalSave}
                label={inputModalState.label}
                type={inputModalState.type}
            />
            {isSignaturePadOpen && activeSigningFieldId && (
                <SignaturePadModal
                    isOpen={true}
                    onClose={() => setIsSignaturePadOpen(false)}
                    onSave={(signatureData) => {
                        updateFieldValue(activeSigningFieldId, signatureData);
                        setIsSignaturePadOpen(false);
                        setActiveSigningFieldId(null);
                    }}
                    title={fields.find(f => f.id === activeSigningFieldId)?.label || 'Sign Document'}
                />
            )}

            {/* Header */}
            <div className="h-16 bg-white dark:bg-[#0A0A0A] border-b border-zinc-200 dark:border-white/10 flex items-center justify-between px-6 shrink-0">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 flex items-center justify-center transition-colors">
                        <ChevronLeft size={18} className="text-zinc-600 dark:text-zinc-400" />
                    </button>
                    <div>
                        <input
                            value={docTitle}
                            onChange={(e) => setDocTitle(e.target.value)}
                            disabled={isReadOnly || isSigningSession}
                            className="bg-transparent text-lg font-bold text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 rounded px-1 -ml-1"
                        />
                        {isSigningSession && <p className="text-xs text-blue-500 uppercase tracking-widest font-semibold flex items-center gap-1"><PenTool size={12} /> Review & Sign Mode</p>}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {!isSigningSession ? (
                        <>
                            <div className="flex bg-zinc-100 dark:bg-white/5 rounded p-1">
                                <button
                                    onClick={() => setFileType('image')}
                                    className={`px-3 py-1 rounded text-xs font-medium transition-all ${fileType === 'image' ? 'bg-white dark:bg-white/10 shadow text-zinc-900 dark:text-white' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'}`}
                                >
                                    Image
                                </button>
                                <button
                                    onClick={() => setFileType('pdf')}
                                    className={`px-3 py-1 rounded text-xs font-medium transition-all ${fileType === 'pdf' ? 'bg-white dark:bg-white/10 shadow text-zinc-900 dark:text-white' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'}`}
                                >
                                    PDF
                                </button>
                            </div>

                            <button
                                onClick={handleSendClick}
                                disabled={saving}
                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-bold shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-2"
                            >
                                <Send size={16} />
                                {saving ? 'Sending...' : 'Send to Client'}
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={() => {
                                if (onSigningComplete) {
                                    onSigningComplete(initialDoc?.id || '', previewUrl || undefined);
                                }
                            }}
                            className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-bold shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2 animate-pulse"
                        >
                            <CheckSquare size={16} />
                            Finish & Sign
                        </button>
                    )}
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden relative">

                {/* Tools Sidebar - Hide in Signing Mode */}
                {!isSigningSession && (
                    <div className="w-16 bg-white dark:bg-[#0A0A0A] border-r border-zinc-200 dark:border-white/10 flex flex-col items-center py-4 gap-4 shrink-0 z-20">
                        {TOOL_TYPES.map(tool => (
                            <DraggableTool key={tool.type} type={tool.type} icon={tool.icon} label={tool.label} />
                        ))}
                    </div>
                )}

                {/* Canvas Area */}
                <div className="flex-1 bg-zinc-100 dark:bg-[#050505] overflow-auto relative flex justify-center p-8">
                    {!fileType ? (
                        <div className="flex flex-col items-center justify-center h-full text-zinc-400">
                            <div className="w-24 h-32 border-2 border-dashed border-zinc-300 dark:border-white/10 rounded-xl flex items-center justify-center mb-4 bg-white dark:bg-white/5">
                                <Plus size={32} />
                            </div>
                            <p className="font-bold mb-4">Start by adding content</p>
                            <div className="flex gap-4">
                                <label className="px-4 py-2 bg-white dark:bg-white/10 border border-zinc-200 dark:border-white/10 rounded-lg text-sm font-bold cursor-pointer hover:bg-zinc-50 dark:hover:bg-white/10 transition-colors">
                                    Upload File
                                    <input type="file" onChange={handleFileUpload} className="hidden" accept="image/*,application/pdf" />
                                </label>
                                <button onClick={() => setFileType('blank')} className="px-4 py-2 bg-white dark:bg-white/10 border border-zinc-200 dark:border-white/10 rounded-lg text-sm font-bold hover:bg-zinc-50 dark:hover:bg-white/10 transition-colors">
                                    Start Blank
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div
                            className="bg-white dark:bg-white shadow-2xl relative min-h-[842px]"
                            style={{
                                width: '595px', // A4 width
                                minHeight: '842px', // A4 height
                            }}
                        >
                            {/* Document Content Layer */}
                            {previewUrl && (
                                <div className="absolute inset-0 z-0">
                                    {fileType === 'pdf' ? (
                                        <Document
                                            file={previewUrl}
                                            onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                                            loading={<div className="p-10 text-center">Loading PDF...</div>}
                                        >
                                            {Array.from(new Array(numPages), (el, index) => (
                                                <Page
                                                    key={`page_${index + 1}`}
                                                    pageNumber={index + 1}
                                                    width={595}
                                                    renderTextLayer={false}
                                                    renderAnnotationLayer={false}
                                                />
                                            ))}
                                        </Document>
                                    ) : (
                                        <img src={previewUrl} className="w-full h-full object-contain" alt="Document" />
                                    )}
                                </div>
                            )}

                            {/* Interaction Layer */}
                            {/* We need this layer to capture drops */}
                            <div className="absolute inset-0 z-10">
                                <DroppableCanvas
                                    onDrop={(type, label, x, y) => {
                                        // Calculate percentage position
                                        // x and y are absolute screen coordinates
                                        // We need to convert to percentage relative to the canvas (595px width)
                                        // But the DroppableCanvas component handles the drop event itself?
                                        // No, the DraggableTool calls onDrop with clientX/clientY
                                        // We need to pass the canvas rect to calculate percentage
                                    }}
                                    onCanvasDrop={(type, label, clientX, clientY, canvasRect) => {
                                        if (isReadOnly || isSigningSession) return;
                                        const xPercent = ((clientX - canvasRect.left) / canvasRect.width) * 100;
                                        const yPercent = ((clientY - canvasRect.top) / canvasRect.height) * 100;
                                        addField(type, label, xPercent, yPercent);
                                    }}
                                >
                                    {fields.map(field => (
                                        <DraggableFieldOnCanvas
                                            key={field.id}
                                            field={field}
                                            isSelected={selectedFieldId === field.id}
                                            onSelect={() => setSelectedFieldId(field.id)}
                                            onUpdatePos={(id, absX, absY) => {
                                                if (isReadOnly || isSigningSession) return;
                                                // Convert back to percentage
                                                // We need ref to canvas to know size. 
                                                // For now, assuming standard size or finding element
                                                // Ideally, pass a ref or context.
                                                // Simplification: We rely on the child to calculate relative if possible?
                                                // Recalculating here:
                                                const canvas = document.querySelector('.bg-white.shadow-2xl');
                                                if (canvas) {
                                                    const rect = canvas.getBoundingClientRect();
                                                    const xPer = ((absX - rect.left) / rect.width) * 100;
                                                    const yPer = ((absY - rect.top) / rect.height) * 100;
                                                    updateFieldPosition(id, xPer, yPer);
                                                }
                                            }}
                                            isReadOnly={isReadOnly}
                                            isSigningMode={isSigningMode}
                                            onSigningClick={() => handleSigningFieldClick(field)}
                                            isBusiness={field.assignee === 'business'}
                                            isContact={field.assignee === 'contact'}
                                            activeSigningFieldId={activeSigningFieldId}
                                        />
                                    ))}
                                </DroppableCanvas>
                            </div>
                        </div>
                    )}
                </div>

                {/* Settings Sidebar - Hide in Signing Mode */}
                {!isSigningSession && (
                    <div className="w-80 bg-white dark:bg-[#0A0A0A] border-l border-zinc-200 dark:border-white/10 overflow-y-auto shrink-0 z-20">
                        {selectedFieldId ? (
                            <div className="p-6">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-6 flex items-center gap-2">
                                    <Settings size={14} /> Field Settings
                                </h3>

                                {fields.find(f => f.id === selectedFieldId) && (
                                    <>
                                        {(() => {
                                            const f = fields.find(f => f.id === selectedFieldId)!;
                                            return (
                                                <div className="space-y-6">
                                                    <div>
                                                        <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Label</label>
                                                        <input
                                                            value={f.label}
                                                            onChange={(e) => setFields(fields.map(field => field.id === f.id ? { ...field, label: e.target.value } : field))}
                                                            className="w-full bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500 dark:text-white"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Assignee</label>
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => updateFieldAssignee(f.id, 'business')}
                                                                className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-wider border border-zinc-200 dark:border-white/10 transition-all ${f.assignee === 'business'
                                                                    ? 'bg-red-50 text-red-600 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20'
                                                                    : 'bg-white dark:bg-white/5 text-zinc-500 hover:bg-zinc-50'
                                                                    }`}
                                                            >
                                                                Vendor (You)
                                                            </button>
                                                            <button
                                                                onClick={() => updateFieldAssignee(f.id, 'contact')}
                                                                className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-wider border border-zinc-200 dark:border-white/10 transition-all ${f.assignee === 'contact'
                                                                    ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20'
                                                                    : 'bg-white dark:bg-white/5 text-zinc-500 hover:bg-zinc-50'
                                                                    }`}
                                                            >
                                                                Client (Lead)
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <div className="pt-6 border-t border-zinc-200 dark:border-white/10">
                                                        <button
                                                            onClick={() => deleteField(f.id)}
                                                            className="w-full py-2 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-lg text-sm font-bold flex items-center justify-center gap-2 hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors"
                                                        >
                                                            <Trash2 size={16} /> Delete Field
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })()}
                                    </>
                                )}
                            </div>
                        ) : (
                            <div className="p-6 text-center text-zinc-400 mt-10">
                                <p className="text-xs uppercase tracking-widest">No field selected</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Send Modal */}
            <SendDocumentModal
                isOpen={isSendModalOpen}
                onClose={() => setIsSendModalOpen(false)}
                onSend={async (lead) => {
                    await handleSave('sent', true, lead);
                    setIsSendModalOpen(false);
                }}
            />

            {/* Pre-Publish Warning Modal */}
            {showPublishWarning && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <motion.div
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                        className="bg-white dark:bg-[#111] max-w-sm w-full rounded-2xl p-6 shadow-2xl border border-zinc-200 dark:border-white/10"
                    >
                        <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">Ready to Sign?</h3>
                        <p className="text-sm text-zinc-500 mb-6">
                            Once you enter signing mode, the document structure will be locked. You won't be able to move or add fields.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowPublishWarning(false)}
                                className="flex-1 py-3 rounded-xl font-bold bg-zinc-100 dark:bg-white/5 text-zinc-600 dark:text-zinc-400"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmPublish}
                                className="flex-1 py-3 rounded-xl font-bold bg-indigo-600 text-white"
                            >
                                Start Signing
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

// --- Helper Components ---

const DraggableTool: React.FC<{
    type: DraggableField['type'],
    icon: React.ElementType,
    label: string,
    color?: string,
    onDrop: (type: DraggableField['type'], label: string, x: number, y: number) => void
}> = ({ type, icon: Icon, label, color, onDrop }) => {
    const ref = useRef<HTMLDivElement>(null);

    // Basic drag implementation using HTML5 Drag and Drop for simplicity to start with, 
    // or we can use the same PointerEvent logic if the canvas accepts it.
    // For "Dropping onto Canvas", HTML5 DnD is often easier.

    // Actually, let's use a simpler "Click to Add" or "Drag" approach.
    // We'll stick to HTML5 draggable for the toolbar items.

    const handleDragStart = (e: React.DragEvent) => {
        e.dataTransfer.setData('application/json', JSON.stringify({ type, label }));
        e.dataTransfer.effectAllowed = 'copy';
    };

    return (
        <div
            draggable
            onDragStart={handleDragStart}
            className="w-10 h-10 flex items-center justify-center bg-zinc-100 dark:bg-white/5 rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-white/10 cursor-grab active:cursor-grabbing transition-colors relative group"
            title={label}
        >
            <Icon size={20} />
            <div className="absolute left-full ml-3 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
                {label}
            </div>
        </div>
    );
};

const DroppableCanvas: React.FC<{
    onDrop: (type: DraggableField['type'], label: string, x: number, y: number) => void,
    onCanvasDrop: (type: DraggableField['type'], label: string, clientX: number, clientY: number, canvasRect: DOMRect) => void,
    children: React.ReactNode
}> = ({ onDrop, onCanvasDrop, children }) => {
    const ref = useRef<HTMLDivElement>(null);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const data = e.dataTransfer.getData('application/json');
        if (data) {
            const parsed = JSON.parse(data);
            if (ref.current) {
                onCanvasDrop(parsed.type, parsed.label, e.clientX, e.clientY, ref.current.getBoundingClientRect());
            }
        }
    };

    return (
        <div
            ref={ref}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className="w-full h-full relative"
        >
            {children}
        </div>
    );
};

const DraggableFieldOnCanvas: React.FC<{
    field: DraggableField,
    isSelected: boolean,
    onSelect: () => void,
    onUpdatePos: (id: string, x: number, y: number) => void,
    onUpdateValue?: (id: string, val: string) => void,
    isReadOnly?: boolean,
    isSigningMode?: boolean,
    onSigningClick?: () => void,
    isBusiness?: boolean,
    isContact?: boolean,
    activeSigningFieldId?: string | null
}> = ({ field, isSelected, onSelect, onUpdatePos, onUpdateValue, isReadOnly, isSigningMode, onSigningClick, isBusiness, isContact, activeSigningFieldId }) => {
    const [isDragging, setIsDragging] = useState(false);
    const dragStart = useRef<{ x: number, y: number, initialLeft: number, initialTop: number } | null>(null);
    const elementRef = useRef<HTMLDivElement>(null);

    // Resize state
    const [isResizing, setIsResizing] = useState(false);

    const handlePointerDown = (e: React.PointerEvent) => {
        if (isReadOnly) {
            if (isSigningMode && onSigningClick) {
                onSigningClick();
            }
            return;
        }

        e.preventDefault();
        e.stopPropagation();
        onSelect();

        const el = elementRef.current;
        if (!el || !el.offsetParent) return;

        setIsDragging(true);

        const rect = el.getBoundingClientRect();
        const parentRect = el.offsetParent.getBoundingClientRect();

        dragStart.current = {
            x: e.clientX,
            y: e.clientY,
            initialLeft: e.clientX - parentRect.left, // This is relative to parent, but strictly logic is: 
            // Actually, we want the current offsetLeft/Top?
            // Let's rely on the visual position.
            // Simplified: The element is positioned by %.
            // We need to track pixel deltas.
            initialTop: e.clientY - parentRect.top
        };

        // We need to capture the STARTING pixel position relative to the container
        // computed from the percentage
        const computedLeft = el.offsetLeft;
        const computedTop = el.offsetTop;

        dragStart.current = {
            x: e.clientX,
            y: e.clientY,
            initialLeft: computedLeft,
            initialTop: computedTop
        };

        const handlePointerMove = (moveEvent: PointerEvent) => {
            moveEvent.preventDefault();
            if (!dragStart.current || !el || !el.offsetParent) return;

            const deltaX = moveEvent.clientX - dragStart.current.x;
            const deltaY = moveEvent.clientY - dragStart.current.y;

            // Apply translation directly for performance
            el.style.transform = `translate(${deltaX}px, ${deltaY}px) translate(-50%, -50%)`;
        };

        const handlePointerUp = (upEvent: PointerEvent) => {
            document.removeEventListener('pointermove', handlePointerMove);
            document.removeEventListener('pointerup', handlePointerUp);

            if (!dragStart.current || !el || !el.offsetParent) {
                setIsDragging(false);
                return;
            }

            const deltaX = upEvent.clientX - dragStart.current.x;
            const deltaY = upEvent.clientY - dragStart.current.y;

            const parentRect = el.offsetParent.getBoundingClientRect();

            // Calculate final position in pixels
            const finalPixelX = dragStart.current.initialLeft + deltaX;
            const finalPixelY = dragStart.current.initialTop + deltaY;

            // Reset style transform and update state
            el.style.transform = 'translate(-50%, -50%)';
            setIsDragging(false);
            dragStart.current = null;

            // Pass Absolute Screen Coordinates (Center) to match updateFieldPosition expectation
            onUpdatePos(field.id, parentRect.left + finalPixelX, parentRect.top + finalPixelY);
        };

        document.addEventListener('pointermove', handlePointerMove);
        document.addEventListener('pointerup', handlePointerUp);
    };

    const handleResizeStart = (e: React.PointerEvent) => {
        if (isReadOnly) return;
        e.preventDefault();
        e.stopPropagation();

        const el = elementRef.current;
        if (!el) return;

        setIsResizing(true);
        // Implement resize logic if needed (similar to drag but updating width/height)
        // For now, skipping full implementation to keep it simple, just stopping propogation
    };

    // Style logic
    const style: React.CSSProperties = {
        position: 'absolute',
        left: `${field.x}%`,
        top: `${field.y}%`,
        width: field.width ? `${field.width}px` : undefined,
        height: field.height ? `${field.height}px` : undefined,
        // Default size for signature if not set
        ...((field.type === 'signature' || field.type === 'initials') && !field.width ? { width: '200px', height: '100px' } : {}),
        transform: 'translate(-50%, -50%)',
        cursor: isReadOnly ? (isSigningMode && (isBusiness || isContact) ? 'pointer' : 'default') : (isDragging ? 'grabbing' : 'grab'),
        zIndex: isDragging || isResizing || isSelected ? 50 : 10,
        touchAction: 'none'
    };

    const isActive = activeSigningFieldId === field.id;
    const isCompleted = !!field.value;
    const showPulse = isSigningMode && !isCompleted && ((isBusiness && field.assignee === 'business') || (isContact && field.assignee === 'contact'));

    return (
        <div
            ref={elementRef}
            style={style}
            onPointerDown={handlePointerDown}
            className={`
                group
                flex flex-col
                ${isSelected && !isReadOnly ? 'ring-2 ring-indigo-500' : ''}
                ${showPulse ? 'animate-pulse ring-2 ring-emerald-400 ring-offset-2' : ''}
                ${isCompleted && isSigningMode ? 'opacity-80' : ''}
            `}
        >
            {/* Field Body */}
            <div className={`
                relative flex-1 rounded-lg border-2 flex items-center justify-center overflow-hidden bg-white dark:bg-black/80
                ${field.assignee === 'business'
                    ? 'border-red-200 bg-red-50/50 dark:border-red-500/30'
                    : 'border-emerald-200 bg-emerald-50/50 dark:border-emerald-500/30'}
                ${isSigningMode && isActive ? 'ring-2 ring-blue-500' : ''}
             `}>
                {/* Resize Handle - Only in Edit Mode */}
                {!isReadOnly && isSelected && (
                    <div
                        onPointerDown={handleResizeStart}
                        className="absolute bottom-0 right-0 w-4 h-4 bg-indigo-500 cursor-nwse-resize z-50 rounded-tl"
                    />
                )}

                {/* Content or Placeholder */}
                {field.value ? (
                    <div className="w-full h-full p-1 flex items-center justify-center">
                        {field.type === 'signature' || field.type === 'initials' || field.type === 'image' ? (
                            <img src={field.value} alt="Content" className="w-full h-full object-contain rounded" />
                        ) : field.type === 'checkbox' ? (
                            field.value === 'true' ? <CheckSquare size={24} className="text-zinc-900 dark:text-white" /> : <div className="w-6 h-6 border-2 border-zinc-400 rounded" />
                        ) : (
                            <span className="font-serif text-lg text-zinc-900 dark:text-white whitespace-pre-wrap leading-tight">
                                {field.value}
                            </span>
                        )}
                    </div>
                ) : (
                    /* Empty State Label */
                    <div className="flex flex-col items-center justify-center p-2 text-center">
                        {field.type === 'signature' && <PenTool size={16} className="text-zinc-400 mb-1 opacity-50" />}
                        <span className={`text-[10px] font-bold uppercase tracking-widest truncate max-w-full
                            ${field.assignee === 'business' ? 'text-red-500' : 'text-emerald-500'}
                        `}>
                            {field.label}
                        </span>
                    </div>
                )}
            </div>

            {/* Assignee Label (Outside) */}
            {!isReadOnly && (
                <div className={`
                    absolute -top-5 left-0 text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded
                    ${field.assignee === 'business' ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}
                `}>
                    {field.assignee === 'business' ? 'Vendor' : 'Client'}
                </div>
            )}
        </div>
    );
};

export const VendorDocuments: React.FC = () => {
    const { user } = useAuth();
    const [view, setView] = useState<'list' | 'create'>('list');
    const [docs, setDocs] = useState<DocItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDoc, setSelectedDoc] = useState<DocItem | null>(null);

    useEffect(() => {
        if (view === 'list') {
            fetchDocuments();
            setSelectedDoc(null);
        }
    }, [view]);

    const fetchDocuments = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('documents')
            .select('*')
            .order('created_at', { ascending: false });

        if (data) {
            setDocs(data.map(d => ({
                id: d.id,
                title: d.title,
                recipient: d.recipient_name || '-',
                recipient_email: d.recipient_email,
                date: new Date(d.created_at).toLocaleDateString(),
                status: d.status as DocumentStatus,
                file_url: d.file_url,
                metadata: d.metadata || []
            })));
        }
        setLoading(false);
    };

    const handleCreateNew = () => {
        setSelectedDoc(null);
        setView('create');
    };

    const handleOpenDoc = (doc: DocItem) => {
        setSelectedDoc(doc);
        setView('create');
    };

    const handleDeleteDoc = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm('Are you sure you want to delete this document?')) return;

        const { error } = await supabase.from('documents').delete().eq('id', id);
        if (error) {
            alert('Error deleting document');
        } else {
            fetchDocuments();
        }
    };

    if (view === 'create') {
        return <DocumentCreator onBack={() => setView('list')} initialDoc={selectedDoc} />;
    }

    return (
        <div className="p-12 h-full flex flex-col">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h2 className="text-4xl font-serif text-zinc-900 dark:text-white mb-2">Documents</h2>
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm">Manage contracts, proposals, and e-signatures.</p>
                </div>
                <button
                    onClick={handleCreateNew}
                    className="bg-zinc-900 dark:bg-white text-white dark:text-black px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-xs flex items-center gap-2 hover:scale-105 transition-transform shadow-lg"
                >
                    <Plus size={16} /> New Document
                </button>
            </div>

            {/* Filter / Search Bar */}
            <div className="flex gap-4 mb-8">
                <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                    <input
                        className="w-full bg-white dark:bg-[#080808] border border-zinc-200 dark:border-white/10 rounded-xl py-3 pl-12 pr-4 text-zinc-900 dark:text-white focus:outline-none focus:border-zinc-400 dark:focus:border-white/20 transition-colors"
                        placeholder="Search documents..."
                    />
                </div>
                <div className="flex gap-2">
                    {['All', 'Sent', 'Completed', 'Drafts'].map(filter => (
                        <button key={filter} className="px-5 py-3 rounded-xl border border-zinc-200 dark:border-white/10 text-xs font-bold uppercase tracking-widest hover:bg-zinc-50 dark:hover:bg-white/5 transition-colors text-zinc-600 dark:text-zinc-400">
                            {filter}
                        </button>
                    ))}
                </div>
            </div>

            {/* Document List */}
            <div className="bg-white dark:bg-[#080808] border border-zinc-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm dark:shadow-none flex-1">
                {loading ? (
                    <div className="p-12 text-center text-zinc-500">Loading documents...</div>
                ) : docs.length === 0 ? (
                    <div className="p-12 text-center text-zinc-500">No documents found. Create one to get started.</div>
                ) : (
                    <table className="w-full text-left">
                        <thead className="bg-zinc-50 dark:bg-white/5 border-b border-zinc-200 dark:border-white/5">
                            <tr>
                                <th className="px-8 py-4 text-[10px] uppercase tracking-widest text-zinc-500 dark:text-zinc-400 font-bold">Document Name</th>
                                <th className="px-8 py-4 text-[10px] uppercase tracking-widest text-zinc-500 dark:text-zinc-400 font-bold">Recipient</th>
                                <th className="px-8 py-4 text-[10px] uppercase tracking-widest text-zinc-500 dark:text-zinc-400 font-bold">Status</th>
                                <th className="px-8 py-4 text-[10px] uppercase tracking-widest text-zinc-500 dark:text-zinc-400 font-bold">Date</th>
                                <th className="px-8 py-4"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 dark:divide-white/5">
                            {docs.map(doc => (
                                <tr
                                    key={doc.id}
                                    className="group hover:bg-zinc-50 dark:hover:bg-white/[0.02] transition-colors"
                                >
                                    <td
                                        onClick={() => handleOpenDoc(doc)}
                                        className="px-8 py-4 cursor-pointer"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                                                <FileText size={18} />
                                            </div>
                                            <span className="font-medium text-zinc-900 dark:text-white group-hover:underline decoration-zinc-400/50 underline-offset-4">{doc.title}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-4 text-zinc-600 dark:text-zinc-400 text-sm cursor-default">{doc.recipient}</td>
                                    <td className="px-8 py-4 cursor-default">
                                        <StatusBadge status={doc.status} />
                                    </td>
                                    <td className="px-8 py-4 text-zinc-500 text-sm cursor-default">{doc.date}</td>
                                    <td className="px-8 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {doc.status === 'draft' ? (
                                                <>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleOpenDoc(doc); }}
                                                        className="p-2 text-zinc-400 hover:text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors"
                                                        title="Edit Draft"
                                                    >
                                                        <Pencil size={16} />
                                                    </button>
                                                    <button
                                                        onClick={(e) => handleDeleteDoc(doc.id, e)}
                                                        className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                                        title="Delete Draft"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </>
                                            ) : (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleOpenDoc(doc); }}
                                                    className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
                                                    title="View Document"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};
