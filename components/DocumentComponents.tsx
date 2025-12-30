import React, { useState, useRef, useEffect } from 'react';
import {
    X, CheckSquare, Search, Send
} from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../services/supabase';

// --- Interfaces ---

export interface DraggableField {
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

export interface Lead {
    id: string;
    project_title: string;
    location_city: string;
    location_state: string;
}

export type DocumentStatus = 'draft' | 'sent' | 'completed';

export interface DocItem {
    id: string;
    title: string;
    recipient: string;
    recipient_email: string;
    date: string;
    status: DocumentStatus;
    file_url?: string;
    metadata?: DraggableField[];
}

// --- Components ---

export const DraggableTool: React.FC<{
    type: DraggableField['type'],
    icon: React.ElementType,
    label: string,
    onDrop?: (type: DraggableField['type'], label: string, x: number, y: number) => void
}> = ({ type, icon: Icon, label }) => {
    const handleDragStart = (e: React.DragEvent) => {
        const rect = (e.target as HTMLElement).getBoundingClientRect();
        const offsetX = e.clientX - rect.left;
        const offsetY = e.clientY - rect.top;

        e.dataTransfer.setData('application/json', JSON.stringify({ type, label, offsetX, offsetY }));
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

export const DroppableCanvas: React.FC<{
    onDrop: (type: DraggableField['type'], label: string, x: number, y: number) => void,
    onCanvasDrop: (type: DraggableField['type'], label: string, clientX: number, clientY: number, canvasRect: DOMRect, offset?: { x: number, y: number }) => void,
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
                    onCanvasDrop(
                        parsed.type,
                        parsed.label,
                        e.clientX,
                        e.clientY,
                        ref.current.getBoundingClientRect(),
                        { x: parsed.offsetX || 0, y: parsed.offsetY || 0 }
                    );
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

export const DraggableFieldOnCanvas: React.FC<{
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
        // Drag implementation placeholder (Note: Full drag implementation omitted for brevity as per previous code, focusing on display/selection first)
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
            {/* Minimal rendering for other types */}
            {field.type === 'initials' && (
                <div className="w-full flex items-center justify-center pointer-events-none">
                    {field.value ? <span className="font-serif italic">{field.value}</span> : <span className="text-[10px] opacity-50">Initials</span>}
                </div>
            )}
        </div>
    );
};

export const SendDocumentModal: React.FC<{
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
