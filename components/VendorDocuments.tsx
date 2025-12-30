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

const RichTextEditor: React.FC<{
    content: string;
    onChange: (html: string) => void;
}> = ({ content, onChange }) => {
    const editorRef = useRef<HTMLDivElement>(null);

    // Sync content updates
    useEffect(() => {
        if (editorRef.current && content && !editorRef.current.innerHTML) {
            editorRef.current.innerHTML = content;
        }
    }, []);

    return (
        <div
            ref={editorRef}
            className={`
                w-full h-full p-16 outline-none font-serif text-[11px] leading-relaxed relative
                prose prose-sm max-w-none
                prose-headings:font-bold prose-headings:uppercase prose-headings:tracking-wide prose-headings:mb-2 prose-headings:border-b prose-headings:border-zinc-200 prose-headings:pb-1
                prose-p:mb-4 prose-p:text-zinc-900
                prose-ul:list-disc prose-ul:pl-5 prose-ul:space-y-1 prose-ul:text-zinc-600
            `}
            contentEditable
            onInput={(e) => onChange(e.currentTarget.innerHTML)}
            dangerouslySetInnerHTML={{ __html: content }}
        />
    );
};

const RichTextToolbar: React.FC<{ onExec: (cmd: string, val?: string) => void }> = ({ onExec }) => {
    const ToolbarBtn: React.FC<{ icon: React.ElementType, onClick: () => void }> = ({ icon: Icon, onClick }) => (
        <button
            onClick={(e) => { e.preventDefault(); onClick(); }}
            className="p-1.5 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200 rounded transition-colors"
        >
            <Icon size={14} />
        </button>
    );

    return (
        <div className="h-10 border-b border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-black/20 flex items-center px-4 gap-1 shrink-0">
            <ToolbarBtn icon={Bold} onClick={() => onExec('bold')} />
            <ToolbarBtn icon={Italic} onClick={() => onExec('italic')} />
            <ToolbarBtn icon={Underline} onClick={() => onExec('underline')} />
            <div className="w-[1px] h-4 bg-zinc-300 mx-1" />
            <ToolbarBtn icon={AlignLeft} onClick={() => onExec('justifyLeft')} />
            <ToolbarBtn icon={AlignCenter} onClick={() => onExec('justifyCenter')} />
            <ToolbarBtn icon={AlignRight} onClick={() => onExec('justifyRight')} />
            <div className="w-[1px] h-4 bg-zinc-300 mx-1" />
            <ToolbarBtn icon={Heading1} onClick={() => onExec('formatBlock', 'H2')} />
            <ToolbarBtn icon={Heading2} onClick={() => onExec('formatBlock', 'H3')} />
            <ToolbarBtn icon={List} onClick={() => onExec('insertUnorderedList')} />
            <ToolbarBtn icon={ListOrdered} onClick={() => onExec('insertOrderedList')} />
        </div>
    );
};

// --- Helper Components (Defined Upfront) ---

const DraggableTool: React.FC<{
    type: DraggableField['type'],
    icon: React.ElementType,
    label: string,
    onDrop?: (type: DraggableField['type'], label: string, x: number, y: number) => void
}> = ({ type, icon: Icon, label }) => {
    const handleDragStart = (e: React.DragEvent) => {
        e.dataTransfer.setData('application/json', JSON.stringify({ type, label }));
        e.dataTransfer.effectAllowed = 'copy';
    };

    return (
        <div
            draggable
            onDragStart={handleDragStart}
            className="w-full flex items-center gap-3 p-3 rounded-lg bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 hover:border-indigo-400 dark:hover:border-indigo-500/50 cursor-grab active:cursor-grabbing transition-all group"
        >
            <div className="w-8 h-8 rounded bg-white dark:bg-white/10 flex items-center justify-center text-zinc-500 group-hover:text-indigo-600 transition-colors">
                <Icon size={16} />
            </div>
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{label}</span>
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
            try {
                const parsed = JSON.parse(data);
                if (ref.current) {
                    onCanvasDrop(parsed.type, parsed.label, e.clientX, e.clientY, ref.current.getBoundingClientRect());
                }
            } catch (e) {
                console.error("Failed to parse drop data", e);
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
    currentUserRole?: 'business' | 'contact'
}> = ({ field, isSelected, onSelect, onUpdatePos, isReadOnly, isSigningMode, onSigningClick, currentUserRole }) => {
    const [isDragging, setIsDragging] = useState(false);
    const elementRef = useRef<HTMLDivElement>(null);

    // Simple pointer drag logic
    const handlePointerDown = (e: React.PointerEvent) => {
        if (isReadOnly || isSigningMode) return;
        e.stopPropagation();
        onSelect();
        // Drag implementation placeholder
    };

    const style: React.CSSProperties = {
        position: 'absolute',
        left: `${field.x}%`,
        top: `${field.y}%`,
        transform: 'translate(-50%, -50%)',
        width: field.width || 200,
        height: field.height || 40,
    };

    if (field.type === 'initials') {
        style.width = 60;
        style.height = 40;
    } else if (field.type === 'checkbox') {
        style.width = 30;
        style.height = 30;
    }

    const isAssignedToUser = field.assignee === currentUserRole;
    const canSign = isSigningMode && isAssignedToUser;

    const getStatusColor = () => {
        if (field.value) return 'bg-emerald-500/10 border-emerald-500 text-emerald-600';
        if (canSign) return 'bg-indigo-500/10 border-indigo-500 text-indigo-600 animate-pulse';
        if (!isSigningMode && field.assignee === 'contact') return 'bg-amber-500/10 border-amber-500 text-amber-600';
        return 'bg-white dark:bg-zinc-800 border-zinc-300 dark:border-zinc-600 text-zinc-900 dark:text-zinc-100';
    };

    return (
        <div
            ref={elementRef}
            style={style}
            onPointerDown={handlePointerDown}
            onClick={(e) => {
                if (canSign && onSigningClick) {
                    e.stopPropagation();
                    onSigningClick();
                }
            }}
            className={`
                group absolute flex items-center px-2 border rounded cursor-pointer transition-all select-none overflow-hidden
                ${getStatusColor()}
                ${isSelected && !isSigningMode ? 'ring-2 ring-indigo-500 z-50' : 'z-10 hover:z-50'}
                ${isSigningMode && !isAssignedToUser ? 'opacity-50 pointer-events-none' : ''}
            `}
        >
            {field.type === 'signature' && (
                <div className="w-full flex items-center justify-center pointer-events-none">
                    {field.value ? <img src={field.value} className="h-full max-h-8 object-contain" /> : <span className="text-xs font-serif italic text-opacity-50">Signature</span>}
                </div>
            )}
            {field.type === 'text' && (
                <div className="w-full truncate text-xs pointer-events-none">{field.value || field.label}</div>
            )}
            {field.type === 'date' && (
                <div className="w-full truncate text-xs font-mono pointer-events-none">{field.value || 'DD/MM/YYYY'}</div>
            )}
        </div>
    );
};

// Exporting DocumentCreator for reuse in MessagesTab
export const DocumentCreator: React.FC<{
    onBack: () => void;
    initialDoc: DocItem | null;
    isSigningSession?: boolean; // New: If true, opens directly in signing mode
    currentUserRole?: 'business' | 'contact'; // New: Restricts field interaction
    onSigningComplete?: (docId: string, signedUrl?: string) => void; // New: Callback when verified
}> = ({ onBack, initialDoc, isSigningSession = false, currentUserRole = 'business', onSigningComplete }) => {
    const { user } = useAuth();
    const isReadOnly = initialDoc ? (initialDoc.status !== 'draft' || isSigningSession) : false;

    const [docTitle, setDocTitle] = useState(initialDoc?.title || 'Untitled Document');
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(initialDoc?.file_url || null); // Load valid URL if exists

    const [fileType, setFileType] = useState<'image' | 'pdf' | 'blank' | 'template' | null>(
        initialDoc?.file_url
            ? (initialDoc.file_url.toLowerCase().includes('.pdf') ? 'pdf' : 'image')
            : null
    );
    const [numPages, setNumPages] = useState<number>(1);

    const [pageContent, setPageContent] = useState<{ [page: number]: string }>({});
    const [fields, setFields] = useState<DraggableField[]>(initialDoc?.metadata || []);
    const [saving, setSaving] = useState(false);

    const initializeTemplate = (recipName: string) => {
        // Pre-fill content
        const page1 = `
            <div style="margin-bottom: 3rem; display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px solid #e5e7eb; padding-bottom: 2rem;">
                <div>
                     <div style="font-size: 1.875rem; font-weight: 700; margin-bottom: 0.5rem;">BuildCorp Inc.</div>
                     <div style="color: #71717a;">123 Construction Ave, Suite 100<br/>New York, NY 10001</div>
                </div>
                <div style="width: 4rem; height: 4rem; background-color: #18181b; color: white; border-radius: 0.25rem; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1.25rem;">BC</div>
            </div>

            <div style="text-align: center; margin-bottom: 3rem;">
                <h1 style="font-size: 1.5rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 1rem;">Professional Services Agreement</h1>
                <p style="color: #71717a; font-style: italic;">Effective Date: ${new Date().toLocaleDateString()}</p>
            </div>

            <div style="display: flex; flex-direction: column; gap: 2rem;">
                <section>
                    <h2>1. The Parties</h2>
                    <p>This Professional Services Agreement ("Agreement") is entered into between <strong>BuildCorp Inc.</strong> ("Service Provider") and <strong>${recipName || 'Client'}</strong> ("Client"). The Service Provider and Client may be referred to individually as a "Party" or collectively as the "Parties".</p>
                </section>

                <section>
                    <h2>2. Scope of Work</h2>
                    <p style="margin-bottom: 0.5rem;">The Service Provider agrees to perform the following services for the Client:</p>
                    <ul>
                        <li>Custom home design and architectural planning.</li>
                        <li>Permit acquisition and regulatory compliance consultation.</li>
                        <li>Material selection and vendor coordination.</li>
                        <li>On-site project management and quality assurance.</li>
                    </ul>
                    <p style="margin-top: 0.5rem;">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
                </section>
            </div>
        `;

        const page2 = `
            <div style="display: flex; flex-direction: column; height: 100%;">
                <div style="flex: 1; display: flex; flex-direction: column; gap: 2rem;">
                    <section>
                        <h2>3. Compensation</h2>
                        <p>Client agrees to pay Service Provider a total fee of <strong>$0.00</strong> (TBD) for the Services.</p>
                    </section>
                    <section>
                        <h2>4. Term and Termination</h2>
                        <p>This Agreement shall commence on the Effective Date and shall continue until the completion of the Services. Either Party may terminate this Agreement upon written notice if the other Party materially breaches any provision.</p>
                    </section>
                </div>
                
                <div style="margin-top: 4rem; padding-top: 2rem; border-top: 2px solid #18181b;">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4rem;">
                        <div>
                            <h4 style="font-weight: 700; margin-bottom: 2rem;">IN WITNESS WHEREOF, the Parties have executed this Agreement.</h4>
                            <div style="display: flex; flex-direction: column; gap: 2rem;">
                                <div><div style="height: 3rem; border-bottom: 1px solid #d4d4d8; margin-bottom: 0.5rem;"></div><p style="font-weight: 700;">BuildCorp Inc.</p></div>
                                <div><div style="height: 3rem; border-bottom: 1px solid #d4d4d8; margin-bottom: 0.5rem;"></div><p style="font-weight: 700;">Date</p></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        setPageContent({
            1: page1,
            2: page2
        });
    };

    const handleStartTemplate = () => {
        setFileType('template');
        setNumPages(2);
        setDocTitle('Professional Services Agreement');
        initializeTemplate(recipientName);
    };

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

            {/* Toolbar - Only visible in EDITOR mode (not signing/preview) */}
            {!isSigningSession && (fileType === 'blank' || fileType === 'template') && (
                <RichTextToolbar onExec={(cmd, val) => document.execCommand(cmd, false, val)} />
            )}

            <div className="flex-1 flex overflow-hidden relative">

                {/* Tools Sidebar - Only visible in EDITOR mode */}
                {!isSigningSession && (
                    <div className="w-64 bg-white dark:bg-[#0A0A0A] border-r border-zinc-200 dark:border-white/10 flex flex-col shrink-0 z-20">
                        <div className="p-4 border-b border-zinc-100 dark:border-white/5">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4">Form Fields</h3>
                            <div className="space-y-2">
                                {TOOL_TYPES.map(tool => (
                                    <DraggableTool key={tool.type || 'tool-' + tool.label} type={tool.type} icon={tool.icon} label={tool.label} />
                                ))}
                            </div>
                        </div>
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
                                <button onClick={handleStartTemplate} className="px-4 py-2 bg-white dark:bg-white/10 border border-zinc-200 dark:border-white/10 rounded-lg text-sm font-bold hover:bg-zinc-50 dark:hover:bg-white/10 transition-colors">
                                    Use Template
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
                            {(previewUrl || fileType === 'blank' || fileType === 'template') && (
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
                                    ) : (fileType === 'blank' || fileType === 'template') ? (
                                        <RichTextEditor
                                            content={pageContent[1] || ''}
                                            onChange={(html) => setPageContent({ ...pageContent, 1: html })}
                                        />
                                    ) : (
                                        <img src={previewUrl || ''} className="w-full h-full object-contain" alt="Document" />
                                    )}
                                </div>
                            )}

                            {/* Interaction Layer */}
                            {/* We need this layer to capture drops */}
                            <div className="absolute inset-0 z-10">
                                <DroppableCanvas
                                    onDrop={(type, label, x, y) => {
                                        // Drop logic
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
                                            onSelect={() => !isSigningSession && setSelectedFieldId(field.id)}
                                            onUpdatePos={updateFieldPosition}
                                            onUpdateValue={updateFieldValue}
                                            isReadOnly={isReadOnly}
                                            isSigningMode={isSigningSession}
                                            currentUserRole={currentUserRole}
                                            onSigningClick={() => handleSigningFieldClick(field)}
                                        />
                                    ))}
                                </DroppableCanvas>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {showPublishWarning && (
                <div className="absolute inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white dark:bg-[#111] max-w-sm w-full rounded-2xl p-6 shadow-2xl border border-zinc-200 dark:border-white/10"
                    >
                        <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">Ready to Sign?</h3>
                        <p className="text-zinc-500 dark:text-zinc-400 mb-6 font-medium">
                            Entering signing mode will lock the document structure. You won't be able to add or move fields.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowPublishWarning(false)}
                                className="flex-1 py-3 rounded-xl font-bold bg-zinc-100 dark:bg-white/5 text-zinc-900 dark:text-white hover:bg-zinc-200 dark:hover:bg-white/10"
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

            {isSendModalOpen && (
                <SendDocumentModal
                    isOpen={isSendModalOpen}
                    onClose={() => setIsSendModalOpen(false)}
                    onSend={(lead) => {
                        handleSave('sent', true, lead);
                        setIsSendModalOpen(false);
                    }}
                />
            )}
        </div>
    );
};

export const VendorDocuments: React.FC = () => {
    const { user } = useAuth();
    const [view, setView] = useState<'list' | 'create'>('list');
    const [docs, setDocs] = useState<DocItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedDoc, setSelectedDoc] = useState<DocItem | null>(null);

    useEffect(() => {
        if (user) {
            fetchDocuments();
        }
    }, [user]);

    const fetchDocuments = async () => {
        if (!user) return;
        setLoading(true);
        const { data, error } = await supabase
            .from('documents')
            .select('*')
            .order('created_at', { ascending: false });

        if (data) {
            setDocs(data as DocItem[]);
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
        if (!error) {
            setDocs(docs.filter(d => d.id !== id));
        }
    };

    if (view === 'create') {
        return (
            <DocumentCreator
                onBack={() => {
                    setView('list');
                    fetchDocuments();
                }}
                initialDoc={selectedDoc}
            />
        );
    }

    return (
        <div className="p-8 h-full overflow-y-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-serif font-bold text-zinc-900 dark:text-white mb-2">Documents</h1>
                    <p className="text-zinc-500">Manage your contracts and templates.</p>
                </div>
                <button
                    onClick={handleCreateNew}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-2"
                >
                    <Plus size={18} />
                    New Document
                </button>
            </div>

            <div className="bg-white dark:bg-[#0A0A0A] rounded-2xl border border-zinc-200 dark:border-white/10 overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-zinc-400">Loading documents...</div>
                ) : docs.length === 0 ? (
                    <div className="p-16 text-center text-zinc-400">
                        <FileText size={48} className="mx-auto mb-4 opacity-20" />
                        <p>No documents found. Create one to get started.</p>
                    </div>
                ) : (
                    <table className="w-full">
                        <thead className="bg-zinc-50 dark:bg-white/5 border-b border-zinc-200 dark:border-white/10">
                            <tr>
                                <th className="text-left px-8 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Document</th>
                                <th className="text-left px-8 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Recipient</th>
                                <th className="text-left px-8 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Status</th>
                                <th className="text-left px-8 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Date</th>
                                <th className="text-right px-8 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 dark:divide-white/5">
                            {docs.map(doc => (
                                <tr
                                    key={doc.id}
                                    onClick={() => handleOpenDoc(doc)}
                                    className="group hover:bg-zinc-50 dark:hover:bg-white/5 transition-colors cursor-pointer"
                                >
                                    <td className="px-8 py-4">
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
                                    <td className="px-8 py-4 text-zinc-500 text-sm cursor-default">{new Date(doc.date).toLocaleDateString()}</td>
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
