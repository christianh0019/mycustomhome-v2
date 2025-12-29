import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
    FileText, Plus, Search,
    PenTool, Type, Calendar, CheckSquare,
    Users, Send, ChevronLeft, Save, GripVertical, Settings, Upload, X, Trash2, Eye, Pencil, File
} from 'lucide-react';
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
    recipient_email: string;
    date: string;
    status: DocumentStatus;
    file_url?: string;
    metadata?: any[];
}

interface DraggableField {
    id: string;
    type: 'signature' | 'initials' | 'date' | 'text' | 'checkbox';
    label: string;
    x: number; // Percentage 0-100
    y: number; // Percentage 0-100
    pageNumber: number; // 1-indexed
    value?: string;
    recipientId?: number; // 1 = Primary
}

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

const StatusBadge: React.FC<{ status: DocumentStatus }> = ({ status }) => {
    switch (status) {
        case 'completed': return <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-full text-[10px] uppercase tracking-widest font-bold">Completed</span>;
        case 'sent': return <span className="px-3 py-1 bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded-full text-[10px] uppercase tracking-widest font-bold">Sent</span>;
        case 'draft': return <span className="px-3 py-1 bg-zinc-500/10 text-zinc-500 border border-zinc-500/20 rounded-full text-[10px] uppercase tracking-widest font-bold">Draft</span>;
    }
};

// --- DOCUMENT CREATOR COMPONENT ---

const DocumentCreator: React.FC<{ onBack: () => void, initialDoc: DocItem | null }> = ({ onBack, initialDoc }) => {
    const { user } = useAuth();
    const isReadOnly = initialDoc ? initialDoc.status !== 'draft' : false;

    const [docTitle, setDocTitle] = useState(initialDoc?.title || 'Untitled Document');
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    // 'blank' means user chose to write from scratch
    const [fileType, setFileType] = useState<'image' | 'pdf' | 'blank' | null>(null);
    const [numPages, setNumPages] = useState<number>(1);

    const [fields, setFields] = useState<DraggableField[]>(initialDoc?.metadata || []);
    const [saving, setSaving] = useState(false);

    const [recipientName, setRecipientName] = useState(initialDoc?.recipient || 'Christian Hostetler');
    const [recipientEmail, setRecipientEmail] = useState(initialDoc?.recipient_email || 'client@example.com');

    // Key fix: Use refs for each page to calculate accurate drop positions
    const pageRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Initialize document data
    useEffect(() => {
        if (initialDoc) {
            if (initialDoc.file_url) {
                loadFileFromStorage(initialDoc.file_url);
            } else {
                // If no file but has ID, assume blank or legacy?
                // For now, if no url, default null unless marked as blank type (future compat)
            }
        }
    }, [initialDoc]);

    const loadFileFromStorage = async (path: string) => {
        try {
            const { data, error } = await supabase.storage.from('document-files').download(path);
            if (error) throw error;
            if (data) {
                const type = path.endsWith('.pdf') ? 'pdf' : 'image';
                setFileType(type);
                setPreviewUrl(URL.createObjectURL(data));
            }
        } catch (err) {
            console.error("Error loading document:", err);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);
            setPreviewUrl(URL.createObjectURL(selectedFile));
            setFileType(selectedFile.type === 'application/pdf' ? 'pdf' : 'image');
            // If image/pdf, numPages will be set by onLoadSuccess or default to 1
        }
    };

    const handleStartBlank = () => {
        setFileType('blank');
        setNumPages(1);
    };

    const handleSave = async () => {
        if (!user || !docTitle) {
            alert('Please login and enter a title.');
            return;
        }

        setSaving(true);
        try {
            let fileUrl = initialDoc?.file_url;

            if (file) {
                const fileExt = file.name.split('.').pop();
                const fileName = `${user.id}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
                const { error: uploadError } = await supabase.storage.from('document-files').upload(fileName, file);
                if (uploadError) throw uploadError;
                fileUrl = fileName;
            }

            const docData = {
                title: docTitle,
                recipient_name: recipientName,
                recipient_email: recipientEmail,
                metadata: fields,
                file_url: fileUrl,
                status: 'draft'
            };

            const query = initialDoc?.id
                ? supabase.from('documents').update(docData).eq('id', initialDoc.id)
                : supabase.from('documents').insert({ ...docData, vendor_id: user.id });

            const { error } = await query;
            if (error) throw error;

            alert('Document Saved Successfully!');
            onBack();
        } catch (error: any) {
            alert(`Error saving document: ${error.message}`);
        } finally {
            setSaving(false);
        }
    };

    const handleDropField = (type: DraggableField['type'], label: string) => {
        // This is called by the tool palette, but actual placement happens via dragEnd on the tool itself
        // or we can allow "click to add" to center of page 1
    };

    // NEW: Accurate Drop Handler calculates which page the field was dropped on
    const handleFieldDrop = (type: DraggableField['type'], label: string, clientX: number, clientY: number) => {
        if (isReadOnly) return;

        // Find which page container encompasses these coordinates
        let targetPage = 1;
        let relativeX = 0;
        let relativeY = 0;
        let found = false;

        for (let i = 1; i <= numPages; i++) {
            const el = pageRefs.current[i];
            if (el) {
                const rect = el.getBoundingClientRect();
                if (clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom) {
                    targetPage = i;
                    relativeX = ((clientX - rect.left) / rect.width) * 100;
                    relativeY = ((clientY - rect.top) / rect.height) * 100;
                    found = true;
                    break;
                }
            }
        }

        if (found) {
            setFields(prev => [...prev, {
                id: Date.now().toString(),
                type,
                label,
                x: relativeX,
                y: relativeY,
                pageNumber: targetPage,
                recipientId: 1
            }]);
        }
    };

    const removeField = (id: string) => {
        if (isReadOnly) return;
        setFields(prev => prev.filter(f => f.id !== id));
    };

    const updateFieldPosition = (id: string, deltaX: number, deltaY: number) => {
        // NOTE: React-motion drag gives deltaX/Y in pixels. We need to convert to % of CURRENT page.
        // But detecting "page switching" during drag is hard with simple framer-motion drag.
        // For now, we enforce staying on the same page OR we need a more complex drag handler.
        // For this iteration, we'll keep it simple: update position relative to its current page.

        setFields(prev => prev.map(f => {
            if (f.id !== id) return f;

            const el = pageRefs.current[f.pageNumber || 1];
            if (!el) return f;

            const rect = el.getBoundingClientRect();
            const pDeltaX = (deltaX / rect.width) * 100;
            const pDeltaY = (deltaY / rect.height) * 100;

            return {
                ...f,
                x: Math.min(100, Math.max(0, f.x + pDeltaX)),
                y: Math.min(100, Math.max(0, f.y + pDeltaY))
            };
        }));
    };

    function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
        setNumPages(numPages);
    }

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
                        readOnly={isReadOnly}
                        className="bg-transparent text-zinc-900 dark:text-white font-serif text-lg focus:outline-none"
                    />
                    <StatusBadge status={isReadOnly ? (initialDoc?.status || 'sent') : 'draft'} />
                </div>
                {!isReadOnly ? (
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
                ) : (
                    <div className="flex items-center gap-3">
                        <span className="text-zinc-400 text-xs uppercase tracking-widest font-bold flex items-center gap-2">
                            <Eye size={14} /> Read Only Mode
                        </span>
                    </div>
                )}
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Tools Sidebar */}
                {!isReadOnly && (
                    <div className="w-64 bg-white dark:bg-[#0A0A0A] border-r border-zinc-200 dark:border-white/10 flex flex-col z-10">
                        <div className="p-4 border-b border-zinc-200 dark:border-white/5">
                            <h3 className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-4">Standard Fields</h3>
                            <div className="space-y-3">
                                <DraggableTool type="signature" icon={PenTool} label="Signature" color="text-blue-500" onDrop={handleFieldDrop} />
                                <DraggableTool type="initials" icon={Type} label="Initials" onDrop={handleFieldDrop} />
                                <DraggableTool type="date" icon={Calendar} label="Date Signed" onDrop={handleFieldDrop} />
                                <DraggableTool type="text" icon={Type} label="Text Box" onDrop={handleFieldDrop} />
                                <DraggableTool type="checkbox" icon={CheckSquare} label="Checkbox" onDrop={handleFieldDrop} />
                            </div>
                        </div>
                    </div>
                )}

                {/* Main Canvas Area */}
                <div className="flex-1 bg-zinc-100 dark:bg-[#050505] overflow-auto p-12 flex justify-center relative">
                    <div className="flex flex-col gap-8 pb-32"> {/* Scrollable column of pages */}

                        {!fileType && (
                            <div className="flex flex-col items-center justify-center min-h-[500px]">
                                <div className="bg-white dark:bg-[#0A0A0A] p-12 rounded-3xl shadow-xl max-w-lg w-full text-center border border-zinc-200 dark:border-white/5">
                                    <div className="w-16 h-16 bg-blue-500/10 text-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                        <FileText size={32} />
                                    </div>
                                    <h2 className="text-2xl font-serif text-zinc-900 dark:text-white mb-2">Create Document</h2>
                                    <p className="text-zinc-500 mb-8">Upload a contract or start from a blank page.</p>

                                    <div className="grid grid-cols-2 gap-4">
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            className="flex flex-col items-center gap-3 p-6 rounded-2xl border border-zinc-200 dark:border-white/10 hover:border-blue-500 hover:bg-blue-500/5 transition-all group"
                                        >
                                            <Upload className="text-zinc-400 group-hover:text-blue-500" />
                                            <span className="font-bold text-sm text-zinc-700 dark:text-zinc-200">Upload PDF/Image</span>
                                        </button>
                                        <button
                                            onClick={handleStartBlank}
                                            className="flex flex-col items-center gap-3 p-6 rounded-2xl border border-zinc-200 dark:border-white/10 hover:border-blue-500 hover:bg-blue-500/5 transition-all group"
                                        >
                                            <File className="text-zinc-400 group-hover:text-blue-500" />
                                            <span className="font-bold text-sm text-zinc-700 dark:text-zinc-200">Start Blank</span>
                                        </button>
                                    </div>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileSelect}
                                        accept="image/*,.pdf"
                                        className="hidden"
                                    />
                                </div>
                            </div>
                        )}

                        {fileType && Array.from({ length: numPages }, (_, i) => i + 1).map((pageNum) => (
                            <div
                                key={pageNum}
                                ref={(el) => pageRefs.current[pageNum] = el}
                                className="relative w-[8.5in] min-h-[11in] bg-white shadow-2xl transition-all duration-300 mx-auto"
                            >
                                {/* Background Layer */}
                                {fileType === 'pdf' && previewUrl && (
                                    <Document
                                        file={previewUrl}
                                        onLoadSuccess={onDocumentLoadSuccess}
                                        loading={<div className="h-[11in] flex items-center justify-center text-zinc-400">Loading Page...</div>}
                                    >
                                        <Page
                                            pageNumber={pageNum}
                                            width={816} // 8.5in * 96dpi approx
                                            renderTextLayer={false}
                                            renderAnnotationLayer={false}
                                        />
                                    </Document>
                                )}
                                {fileType === 'image' && previewUrl && pageNum === 1 && (
                                    <img src={previewUrl} alt="Document" className="w-full h-auto select-none pointer-events-none" />
                                )}
                                {fileType === 'blank' && (
                                    <div className="p-12 h-full">
                                        {/* Blank writeable area - could be contenteditable or just a container for text fields */}
                                        <div className="h-full border border-dashed border-zinc-100 rounded-lg flex items-center justify-center text-zinc-200 text-6xl font-serif opacity-30 select-none">
                                            Page {pageNum}
                                        </div>
                                    </div>
                                )}

                                {/* Fields Overlay - Filtered by Page */}
                                {fields.filter(f => (f.pageNumber || 1) === pageNum).map((field) => (
                                    <DraggableFieldOnCanvas
                                        key={field.id}
                                        field={field}
                                        onRemove={removeField}
                                        onUpdatePos={updateFieldPosition}
                                        isReadOnly={isReadOnly}
                                    />
                                ))}

                                {/* Page Number indicator */}
                                <div className="absolute -right-12 top-0 text-xs text-zinc-400 font-medium">
                                    Page {pageNum}
                                </div>
                            </div>
                        ))}

                        {/* Add Page Button for Blank Mode */}
                        {fileType === 'blank' && !isReadOnly && (
                            <button
                                onClick={() => setNumPages(prev => prev + 1)}
                                className="mx-auto flex items-center gap-2 px-6 py-3 bg-white dark:bg-[#0A0A0A] rounded-full shadow-lg text-sm font-bold text-zinc-600 hover:text-blue-500 hover:scale-105 transition-all"
                            >
                                <Plus size={16} /> Add Page
                            </button>
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
                                    readOnly={isReadOnly}
                                />
                                <input
                                    className="w-full bg-white dark:bg-black/20 border border-zinc-200 dark:border-white/10 rounded px-2 py-1 text-xs"
                                    value={recipientEmail}
                                    onChange={(e) => setRecipientEmail(e.target.value)}
                                    readOnly={isReadOnly}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="mt-auto p-6 border-t border-zinc-200 dark:border-white/5">
                        {!isReadOnly && (
                            <button
                                onClick={() => { setFile(null); setFileType(null); setFields([]); setNumPages(1); }}
                                className="w-full flex items-center justify-center gap-2 text-xs text-red-500 hover:text-red-600 transition-colors py-2"
                            >
                                Reset / Clear Document
                            </button>
                        )}
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
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-zinc-50 dark:hover:bg-white/5 cursor-grab active:cursor-grabbing transition-colors group relative bg-white dark:bg-[#0A0A0A] border border-transparent hover:border-zinc-200"
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
    onUpdatePos: (id: string, dx: number, dy: number) => void,
    isReadOnly?: boolean
}> = ({ field, onRemove, onUpdatePos, isReadOnly }) => {

    return (
        <motion.div
            drag={!isReadOnly}
            dragMomentum={false}
            onDragEnd={(_, info) => {
                if (!isReadOnly) onUpdatePos(field.id, info.offset.x, info.offset.y);
            }}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{
                position: 'absolute',
                left: `${field.x}%`,
                top: `${field.y}%`,
                // We want the drag point to be the center, but initial placement should be accurate
                // If x/y are top-left based:
                // x: `${field.x}%`, y: `${field.y}%`
                // But generally users drag by center. Let's assume touch point is center.
                x: '-50%',
                y: '-50%',
                cursor: isReadOnly ? 'default' : 'grab'
            }}
            className="absolute z-10 group"
        >
            <div className={`p-2 rounded border-2 shadow-sm flex items-center gap-2 ${!isReadOnly && 'active:cursor-grabbing'}
                ${field.type === 'signature' ? 'bg-blue-500/10 border-blue-500 text-blue-600' : 'bg-yellow-500/10 border-yellow-500 text-yellow-600'}
            `}>
                <span className="text-[10px] font-bold uppercase tracking-wider whitespace-nowrap">{field.label}</span>
                {!isReadOnly && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onRemove(field.id); }}
                        className="p-1 hover:bg-black/10 rounded text-inherit opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <X size={10} />
                    </button>
                )}
            </div>
            {/* Recipient Tag */}
            <div className={`absolute -top-3 left-0 bg-yellow-500 text-black text-[8px] font-bold px-1 rounded shadow-sm whitespace-nowrap transition-opacity ${isReadOnly ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                Homeowner
            </div>
        </motion.div>
    );
};
