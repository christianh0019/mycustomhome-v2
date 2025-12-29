import React, { useState, useRef, useEffect } from 'react';
import {
    FileText, Plus, Search, MoreVertical,
    PenTool, Type, Calendar, CheckSquare,
    Users, Send, ChevronLeft, Save, GripVertical, Settings, Upload, X, Trash2
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';
import { motion } from 'framer-motion';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Initialize PDF Worker
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

type DocumentStatus = 'draft' | 'sent' | 'completed';

interface DocItem {
    id: string;
    title: string;
    recipient: string;
    date: string;
    status: DocumentStatus;
}

interface DraggableField {
    id: string;
    type: 'signature' | 'initials' | 'date' | 'text' | 'checkbox';
    label: string;
    x: number; // Percentage 0-100
    y: number; // Percentage 0-100
    width?: number; // Pixels (optional default)
    height?: number;
    value?: string;
    recipientId?: number; // 1 = Primary
}

export const VendorDocuments: React.FC = () => {
    const { user } = useAuth();
    const [view, setView] = useState<'list' | 'create'>('list');
    const [docs, setDocs] = useState<DocItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (view === 'list') {
            fetchDocuments();
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
                date: new Date(d.created_at).toLocaleDateString(),
                status: d.status as DocumentStatus
            })));
        }
        setLoading(false);
    };

    if (view === 'create') {
        return <DocumentCreator onBack={() => setView('list')} />;
    }

    return (
        <div className="p-12 h-full flex flex-col">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h2 className="text-4xl font-serif text-zinc-900 dark:text-white mb-2">Documents</h2>
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm">Manage contracts, proposals, and e-signatures.</p>
                </div>
                <button
                    onClick={() => setView('create')}
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
                                <tr key={doc.id} className="group hover:bg-zinc-50 dark:hover:bg-white/[0.02] transition-colors">
                                    <td className="px-8 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                                                <FileText size={18} />
                                            </div>
                                            <span className="font-medium text-zinc-900 dark:text-white">{doc.title}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-4 text-zinc-600 dark:text-zinc-400 text-sm">{doc.recipient}</td>
                                    <td className="px-8 py-4">
                                        <StatusBadge status={doc.status} />
                                    </td>
                                    <td className="px-8 py-4 text-zinc-500 text-sm">{doc.date}</td>
                                    <td className="px-8 py-4 text-right">
                                        <button className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
                                            <MoreVertical size={16} />
                                        </button>
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

const StatusBadge: React.FC<{ status: DocumentStatus }> = ({ status }) => {
    switch (status) {
        case 'completed':
            return <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-full text-[10px] uppercase tracking-widest font-bold">Completed</span>;
        case 'sent':
            return <span className="px-3 py-1 bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded-full text-[10px] uppercase tracking-widest font-bold">Sent</span>;
        case 'draft':
            return <span className="px-3 py-1 bg-zinc-500/10 text-zinc-500 border border-zinc-500/20 rounded-full text-[10px] uppercase tracking-widest font-bold">Draft</span>;
    }
};

// --- DOCUMENT CREATOR COMPONENT ---

const DocumentCreator: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const { user } = useAuth();
    const [docTitle, setDocTitle] = useState('Untitled Document');
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [fileType, setFileType] = useState<'image' | 'pdf' | null>(null);
    const [fields, setFields] = useState<DraggableField[]>([]);
    const [saving, setSaving] = useState(false);

    // Recipient State
    const [recipientName, setRecipientName] = useState('Christian Hostetler');
    const [recipientEmail, setRecipientEmail] = useState('client@example.com');

    const canvasRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);
            setPreviewUrl(URL.createObjectURL(selectedFile));
            setFileType(selectedFile.type === 'application/pdf' ? 'pdf' : 'image');
        }
    };

    const handleSave = async () => {
        if (!user) {
            alert('You must be logged in to save.');
            return;
        }
        if (!docTitle) {
            alert('Please enter a document title.');
            return;
        }

        setSaving(true);
        try {
            let fileUrl = null;

            // 1. Upload File (if exists)
            if (file) {
                const fileExt = file.name.split('.').pop();
                const fileName = `${user.id}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

                const { error: uploadError } = await supabase.storage
                    .from('document-files')
                    .upload(fileName, file);

                if (uploadError) throw uploadError;

                // Get Public URL (assuming bucket is private, we might need signed URL, 
                // but for simplicity let's assume we store the path and generate signed urls on read,
                // OR just use creating a signed URL now to store? 
                // Best practice: store path. But for prototype, let's try to get a URL.)
                // Actually, if we just store the path, we can download it later.
                fileUrl = fileName;
            }

            // 2. Insert Record
            const { error: dbError } = await supabase
                .from('documents')
                .insert({
                    vendor_id: user.id,
                    title: docTitle,
                    status: 'draft',
                    recipient_name: recipientName,
                    recipient_email: recipientEmail,
                    metadata: fields, // JSONB of fields
                    file_url: fileUrl
                });

            if (dbError) throw dbError;

            alert('Document Saved Successfully!');
            onBack(); // Return to list

        } catch (error: any) {
            console.error('Error saving document:', error);
            alert(`Error saving document: ${error.message}`);
        } finally {
            setSaving(false);
        }
    };

    const handleDropField = (type: DraggableField['type'], label: string, clientX: number, clientY: number) => {
        if (!canvasRef.current) return;

        const rect = canvasRef.current.getBoundingClientRect();

        // Calculate position relative to container
        const relativeX = clientX - rect.left;
        const relativeY = clientY - rect.top;

        // Convert to percentage
        const percentX = (relativeX / rect.width) * 100;
        const percentY = (relativeY / rect.height) * 100;

        // Ensure within bounds
        if (percentX >= 0 && percentX <= 100 && percentY >= 0 && percentY <= 100) {
            setFields(prev => [...prev, {
                id: Date.now().toString(),
                type,
                label,
                x: percentX,
                y: percentY,
                recipientId: 1
            }]);
        }
    };

    const removeField = (id: string) => {
        setFields(prev => prev.filter(f => f.id !== id));
    };

    const updateFieldPosition = (id: string, deltaX: number, deltaY: number) => {
        if (!canvasRef.current) return;
        const rect = canvasRef.current.getBoundingClientRect();

        setFields(prev => prev.map(f => {
            if (f.id !== id) return f;

            // Convert pixel delta to percentage
            const pDeltaX = (deltaX / rect.width) * 100;
            const pDeltaY = (deltaY / rect.height) * 100;

            return {
                ...f,
                x: Math.min(100, Math.max(0, f.x + pDeltaX)),
                y: Math.min(100, Math.max(0, f.y + pDeltaY))
            };
        }));
    };

    return (
        <div className="h-full flex flex-col bg-zinc-100 dark:bg-[#050505]">
            {/* Top Bar */}
            <div className="h-16 bg-white dark:bg-[#0A0A0A] border-b border-zinc-200 dark:border-white/10 flex items-center justify-between px-6 shrink-0 z-20">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 hover:bg-zinc-100 dark:hover:bg-white/5 rounded-lg text-zinc-500 dark:text-zinc-400">
                        <ChevronLeft size={20} />
                    </button>
                    <div className="h-6 w-[1px] bg-zinc-200 dark:bg-white/10"></div>
                    <input
                        value={docTitle}
                        onChange={(e) => setDocTitle(e.target.value)}
                        className="bg-transparent text-zinc-900 dark:text-white font-serif text-lg focus:outline-none"
                    />
                    <span className="px-2 py-0.5 bg-zinc-100 dark:bg-white/10 text-zinc-500 text-[10px] rounded uppercase tracking-wider">Draft</span>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-4 py-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white text-xs font-bold uppercase tracking-widest flex items-center gap-2"
                    >
                        {saving ? 'Saving...' : <><Save size={14} /> Save</>}
                    </button>
                    <button
                        onClick={() => alert(`Sending document with ${fields.length} fields!`)}
                        disabled={fields.length === 0}
                        className={`px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-colors shadow-lg
                             ${fields.length > 0 ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/20' : 'bg-zinc-200 dark:bg-white/10 text-zinc-400 cursor-not-allowed'}`}
                    >
                        <Send size={14} /> Send
                    </button>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Tools Sidebar */}
                <div className="w-64 bg-white dark:bg-[#0A0A0A] border-r border-zinc-200 dark:border-white/10 flex flex-col">
                    <div className="p-4 border-b border-zinc-200 dark:border-white/5">
                        <h3 className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-4">Standard Fields</h3>
                        <div className="space-y-3">
                            {/* Draggable sources */}
                            <DraggableTool type="signature" icon={PenTool} label="Signature" color="text-blue-500" onDrop={handleDropField} />
                            <DraggableTool type="initials" icon={Type} label="Initials" onDrop={handleDropField} />
                            <DraggableTool type="date" icon={Calendar} label="Date Signed" onDrop={handleDropField} />
                            <DraggableTool type="text" icon={Type} label="Text Box" onDrop={handleDropField} />
                            <DraggableTool type="checkbox" icon={CheckSquare} label="Checkbox" onDrop={handleDropField} />
                        </div>
                    </div>
                </div>

                {/* Main Canvas Area */}
                <div className="flex-1 bg-zinc-100 dark:bg-[#050505] overflow-auto p-12 flex justify-center relative">
                    {/* The "Paper" Container */}
                    <div
                        className="relative w-[8.5in] min-h-[11in] bg-white shadow-2xl transition-all duration-300"
                        ref={canvasRef}
                    >
                        {!file ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 m-8 rounded-xl bg-zinc-50 dark:bg-zinc-900/50">
                                <div className="p-6 bg-white dark:bg-black rounded-full shadow-lg mb-6">
                                    <Upload size={32} className="text-zinc-400" />
                                </div>
                                <h3 className="text-lg font-medium text-zinc-900 dark:text-white mb-2">Upload Document</h3>
                                <p className="text-sm text-zinc-500 mb-6 text-center max-w-xs">Upload a PDF or Image (PNG, JPG) to start adding signature fields.</p>
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="px-6 py-3 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-lg text-xs font-bold uppercase tracking-widest hover:scale-105 transition-transform"
                                >
                                    Select File
                                </button>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileSelect}
                                    accept="image/*,.pdf"
                                    className="hidden"
                                />
                            </div>
                        ) : (
                            <>
                                {/* Rendering Layer */}
                                {fileType === 'image' && previewUrl && (
                                    <img src={previewUrl} alt="Document" className="w-full h-auto select-none pointer-events-none" />
                                )}
                                {fileType === 'pdf' && previewUrl && (
                                    <Document file={previewUrl} className="w-full">
                                        {/* Just showing page 1 for simple prototype */}
                                        <Page
                                            pageNumber={1}
                                            width={canvasRef.current?.getBoundingClientRect().width || 800}
                                            renderTextLayer={false}
                                            renderAnnotationLayer={false}
                                        />
                                    </Document>
                                )}

                                {/* Fields Overlay Layer */}
                                {fields.map((field) => (
                                    <DraggableFieldOnCanvas
                                        key={field.id}
                                        field={field}
                                        onRemove={removeField}
                                        onUpdatePos={updateFieldPosition}
                                    />
                                ))}
                            </>
                        )}
                    </div>
                </div>

                {/* Recipients Sidebar */}
                <div className="w-72 bg-white dark:bg-[#0A0A0A] border-l border-zinc-200 dark:border-white/10 flex flex-col">
                    <div className="p-6">
                        <h3 className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-6 flex items-center gap-2">
                            <Users size={12} /> Recipients
                        </h3>

                        <div className="space-y-4">
                            <div className="p-4 bg-zinc-50 dark:bg-white/5 rounded-xl border border-zinc-200 dark:border-white/5 relative group">
                                <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-zinc-400 hover:text-red-500">
                                    ×
                                </div>
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-8 h-8 rounded-full bg-yellow-500/20 text-yellow-500 flex items-center justify-center font-bold text-xs">1</div>
                                    <div>
                                        <p className="text-sm font-bold text-zinc-900 dark:text-white">Homeowner</p>
                                        <p className="text-[10px] text-zinc-500">Signer</p>
                                    </div>
                                </div>
                                <input
                                    className="w-full bg-white dark:bg-black/20 border border-zinc-200 dark:border-white/10 rounded px-2 py-1 text-xs mb-2"
                                    value={recipientName}
                                    onChange={(e) => setRecipientName(e.target.value)}
                                />
                                <input
                                    className="w-full bg-white dark:bg-black/20 border border-zinc-200 dark:border-white/10 rounded px-2 py-1 text-xs"
                                    value={recipientEmail}
                                    onChange={(e) => setRecipientEmail(e.target.value)}
                                />
                            </div>

                            <button className="w-full py-3 border border-dashed border-zinc-300 dark:border-white/20 rounded-xl text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:border-zinc-400 dark:hover:border-white/40 transition-colors uppercase tracking-widest font-bold">
                                + Add Recipient
                            </button>
                        </div>
                    </div>

                    <div className="mt-auto p-6 border-t border-zinc-200 dark:border-white/5">
                        <button
                            onClick={() => { setFile(null); setFields([]); }}
                            className="w-full flex items-center justify-center gap-2 text-xs text-red-500 hover:text-red-600 transition-colors py-2"
                        >
                            Reset / Clear Document
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- HELPER COMPONENTS ---

const DraggableTool: React.FC<{
    type: DraggableField['type'],
    icon: React.ElementType,
    label: string,
    color?: string,
    onDrop: (type: DraggableField['type'], label: string, x: number, y: number) => void
}> = ({ type, icon: Icon, label, color, onDrop }) => {
    return (
        <motion.div
            drag
            dragSnapToOrigin
            whileDrag={{ scale: 1.1, zIndex: 100, opacity: 0.8 }}
            onDragEnd={(e) => {
                // @ts-ignore - clientX/Y exist on drag events
                onDrop(type, label, e.clientX || e.pageX, e.clientY || e.pageY);
            }}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-zinc-50 dark:hover:bg-white/5 cursor-grab active:cursor-grabbing transition-colors group relative bg-white dark:bg-[#0A0A0A]"
        >
            <Icon size={16} className={color || "text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white"} />
            <span className="text-xs font-medium text-zinc-600 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-white">{label}</span>
            <GripVertical size={12} className="ml-auto text-zinc-300 opacity-0 group-hover:opacity-100" />
        </motion.div>
    );
};

const DraggableFieldOnCanvas: React.FC<{
    field: DraggableField,
    onRemove: (id: string) => void,
    onUpdatePos: (id: string, dx: number, dy: number) => void
}> = ({ field, onRemove, onUpdatePos }) => {

    // Convert percentage back to something absolute if needed, but styling with % left/top is standard
    // However, framer motion drag modifies transform (pixels).
    // Better to use a simpler drag handler if we want percentage-based state sync, 
    // but framer motion drag is smooth.
    // For this prototype, we'll maintain visual position via standard styles first, then use motion for interaction.

    return (
        <motion.div
            drag
            dragMomentum={false}
            onDragEnd={(_, info) => {
                onUpdatePos(field.id, info.offset.x, info.offset.y);
            }}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{
                position: 'absolute',
                left: `${field.x}%`,
                top: `${field.y}%`,
                // Center the anchor
                x: '-50%',
                y: '-50%',
            }}
            className="absolute z-10 group"
        >
            <div className={`p-2 rounded border-2 shadow-sm flex items-center gap-2 cursor-grab active:cursor-grabbing
                ${field.type === 'signature' ? 'bg-blue-500/10 border-blue-500 text-blue-600' : 'bg-yellow-500/10 border-yellow-500 text-yellow-600'}
            `}>
                <span className="text-[10px] font-bold uppercase tracking-wider whitespace-nowrap">{field.label}</span>
                <button
                    onClick={(e) => { e.stopPropagation(); onRemove(field.id); }}
                    className="p-1 hover:bg-black/10 rounded text-inherit opacity-0 group-hover:opacity-100 transition-opacity"
                >
                    <X size={10} />
                </button>
            </div>
            {/* Recipient Tag */}
            <div className="absolute -top-3 left-0 bg-yellow-500 text-black text-[8px] font-bold px-1 rounded shadow-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                Homeowner
            </div>
        </motion.div>
    );
};
