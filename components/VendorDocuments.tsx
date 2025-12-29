import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
    FileText, Plus, Search,
    PenTool, Type, Calendar, CheckSquare, Image as ImageIcon,
    Users, Send, ChevronLeft, Save, GripVertical, Settings, Upload, X, Trash2, Eye, Pencil, File, FileSignature,
    Bold, Italic, Heading1, Heading2, List, AlignLeft, AlignCenter, AlignRight, Underline
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
    type: 'signature' | 'initials' | 'date' | 'text' | 'checkbox' | 'image';
    label: string;
    x: number; // Percentage 0-100
    y: number; // Percentage 0-100
    pageNumber: number; // 1-indexed
    value?: string;
    recipientId?: number; // 1 = Primary
    width?: number; // For resizeable items
    height?: number;
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

const RichTextEditor: React.FC<{
    initialContent?: string;
    onChange?: (html: string) => void;
    readOnly?: boolean;
}> = ({ initialContent, onChange, readOnly }) => {
    const editorRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (editorRef.current && initialContent && !editorRef.current.innerHTML) {
            editorRef.current.innerHTML = initialContent;
        }
    }, [initialContent]);

    const exec = (command: string, value: string | undefined = undefined) => {
        if (editorRef.current) {
            editorRef.current.focus();
        }
        document.execCommand(command, false, value);
        if (editorRef.current && onChange) {
            onChange(editorRef.current.innerHTML);
        }
    };

    const handleInput = () => {
        if (editorRef.current && onChange) {
            onChange(editorRef.current.innerHTML);
        }
    };

    return (
        <div className="h-full flex flex-col relative w-full">

            <div
                ref={editorRef}
                contentEditable={!readOnly}
                onInput={handleInput}
                className={`
                    flex-1 p-16 outline-none font-serif text-[11px] leading-relaxed relative
                    prose prose-sm max-w-none
                    prose-headings:font-bold prose-headings:uppercase prose-headings:tracking-wide prose-headings:mb-2 prose-headings:border-b prose-headings:border-zinc-200 prose-headings:pb-1
                    prose-p:mb-4 prose-p:text-zinc-900
                    prose-ul:list-disc prose-ul:pl-5 prose-ul:space-y-1 prose-ul:text-zinc-600
                `}
                style={{ minHeight: '100%' }}
            />
        </div>
    );
};

const ToolbarBtn: React.FC<{ icon: React.ElementType, onClick: () => void, label?: string }> = ({ icon: Icon, onClick, label }) => (
    <button
        onMouseDown={(e) => {
            e.preventDefault();
            onClick();
        }}
        title={label}
        className="p-1.5 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200 rounded transition-colors"
    >
        <Icon size={14} />
    </button>
);


const DocumentCreator: React.FC<{ onBack: () => void, initialDoc: DocItem | null }> = ({ onBack, initialDoc }) => {
    const { user } = useAuth();
    const isReadOnly = initialDoc ? initialDoc.status !== 'draft' : false;

    const [docTitle, setDocTitle] = useState(initialDoc?.title || 'Untitled Document');
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const [fileType, setFileType] = useState<'image' | 'pdf' | 'blank' | 'template' | null>(null);
    const [numPages, setNumPages] = useState<number>(1);

    const [pageContent, setPageContent] = useState<{ [page: number]: string }>({});
    const [fields, setFields] = useState<DraggableField[]>(initialDoc?.metadata || []);
    const [saving, setSaving] = useState(false);

    const [recipientName, setRecipientName] = useState(initialDoc?.recipient || 'Christian Hostetler');
    const [recipientEmail, setRecipientEmail] = useState(initialDoc?.recipient_email || 'client@example.com');

    const pageRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Initialize document data
    useEffect(() => {
        if (initialDoc) {
            if (initialDoc.file_url === 'TEMPLATE') {
                setFileType('template');
                setNumPages(2);
                initializeTemplate(recipientName);
            } else if (initialDoc.file_url === 'BLANK') {
                setFileType('blank');
                setNumPages(1);
            } else if (initialDoc.file_url) {
                loadFileFromStorage(initialDoc.file_url);
            }
        }
    }, [initialDoc]);

    const initializeTemplate = (recipName: string) => {
        // Pre-fill content
        const page1 = `
            <div style="margin-bottom: 3rem; display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px solid #e5e7eb; padding-bottom: 2rem;">
                <div>
                     <div style="font-size: 1.875rem; font-weight: 700; margin-bottom: 0.5rem;">BuildCorp Inc.</div>
                     <div style="color: #71717a;">123 Construction Ave, Suite 100<br/>New York, NY 10001</div>
                </div>
                <!-- Logo Space -->
            </div>

            <div style="text-align: center; margin-bottom: 3rem;">
                <h1 style="font-size: 1.5rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 1rem;">Professional Services Agreement</h1>
                <p style="color: #71717a; font-style: italic;">Effective Date: ${new Date().toLocaleDateString()}</p>
            </div>

            <div style="display: flex; flex-direction: column; gap: 2rem;">
                <section>
                    <h2>1. The Parties</h2>
                    <p>This Professional Services Agreement ("Agreement") is entered into between <strong>BuildCorp Inc.</strong> ("Service Provider") and <strong>${recipName}</strong> ("Client"). The Service Provider and Client may be referred to individually as a "Party" or collectively as the "Parties".</p>
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

                 <section>
                    <h2>3. Compensation</h2>
                    <p>Client agrees to pay Service Provider a total fee of <strong>$0.00</strong> (TBD) for the Services.</p>
                    <p style="margin-top: 0.25rem;">Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
                </section>
            </div>
        `;

        const page2 = `
            <div style="display: flex; flex-direction: column; height: 100%;">
                <div style="flex: 1; display: flex; flex-direction: column; gap: 2rem;">
                    <section>
                        <h2>4. Term and Termination</h2>
                        <p>This Agreement shall commence on the Effective Date and shall continue until the completion of the Services, unless earlier terminated as provided herein. Either Party may terminate this Agreement upon written notice if the other Party materially breaches any provision of this Agreement.</p>
                    </section>
                    
                    <section>
                        <h2>5. Confidentiality</h2>
                        <p>Each Party agrees to retain in confidence all non-public information and trade secrets of the other Party used or disclosed in connection with this Agreement. The Parties shall take reasonable precautions to prevent unauthorized disclosure of such information.</p>
                    </section>

                    <section>
                        <h2>6. Governing Law</h2>
                        <p>This Agreement shall be governed by and construed in accordance with the laws of the State of New York.</p>
                    </section>
                </div>

                <div style="margin-top: 4rem; padding-top: 2rem; border-top: 2px solid #18181b;">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4rem;">
                        <div>
                            <h4 style="font-weight: 700; margin-bottom: 2rem;">IN WITNESS WHEREOF, the Parties have executed this Agreement as of the date first above written.</h4>
                            <div style="display: flex; flex-direction: column; gap: 2rem;">
                                <div>
                                    <div style="height: 3rem; border-bottom: 1px solid #d4d4d8; margin-bottom: 0.5rem;"></div>
                                    <p style="font-weight: 700;">BuildCorp Inc.</p>
                                    <p style="color: #71717a;">Authorized Signature</p>
                                </div>
                                <div>
                                    <div style="height: 3rem; border-bottom: 1px solid #d4d4d8; margin-bottom: 0.5rem;"></div>
                                    <p style="font-weight: 700;">Date</p>
                                </div>
                            </div>
                        </div>
                        <div>
                            <h4 style="font-weight: 700; margin-bottom: 2rem;">Signature Block</h4>
                            <div style="display: flex; flex-direction: column; gap: 2rem;">
                                <div>
                                    <div style="height: 3rem; border-bottom: 1px solid #d4d4d8; margin-bottom: 0.5rem;"></div>
                                    <p style="font-weight: 700;">${recipName}</p>
                                    <p style="color: #71717a;">Client Signature</p>
                                </div>
                                <div>
                                    <div style="height: 3rem; border-bottom: 1px solid #d4d4d8; margin-bottom: 0.5rem;"></div>
                                    <p style="font-weight: 700;">Date</p>
                                </div>
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

        if (fields.length === 0) {
            setFields([
                {
                    id: 'logo-placeholder',
                    type: 'image',
                    label: 'Company Logo',
                    x: 85,
                    y: 5,
                    pageNumber: 1,
                    recipientId: 1
                }
            ]);
        }
    };

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
        }
    };

    const handleStartBlank = () => {
        setFileType('blank');
        setNumPages(1);
    };

    const handleStartTemplate = () => {
        setFileType('template');
        setNumPages(2);
        setDocTitle('Professional Services Agreement');
        initializeTemplate(recipientName);
    };

    const handleSave = async () => {
        if (!user || !docTitle) {
            alert('Please login and enter a title.');
            return;
        }

        setSaving(true);
        try {
            let fileUrl = initialDoc?.file_url;

            if (fileType === 'template') fileUrl = 'TEMPLATE';
            else if (fileType === 'blank') fileUrl = 'BLANK';
            else if (file) {
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

    const handleFieldDrop = (type: DraggableField['type'], label: string, clientX: number, clientY: number) => {
        if (isReadOnly) return;

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

    const updateFieldPosition = (id: string, clientX: number, clientY: number) => {
        setFields(prev => prev.map(f => {
            if (f.id !== id) return f;

            const el = pageRefs.current[f.pageNumber || 1];
            if (!el) return f;

            const rect = el.getBoundingClientRect();
            // Calculate absolute position percentage based on the drop center point
            const x = ((clientX - rect.left) / rect.width) * 100;
            const y = ((clientY - rect.top) / rect.height) * 100;

            return {
                ...f,
                x: Math.min(100, Math.max(0, x)),
                y: Math.min(100, Math.max(0, y))
            };
        }));
    };

    const updateFieldValue = (id: string, value: string) => {
        setFields(prev => prev.map(f => f.id === id ? { ...f, value } : f));
    }

    const updateFieldSize = (id: string, width: number, height: number) => {
        setFields(prev => prev.map(f => f.id === id ? { ...f, width, height } : f));
    }

    function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
        setNumPages(numPages);
    }

    const exec = (command: string, value: string | undefined = undefined) => {
        document.execCommand(command, false, value);
    };

    return (
        <div className="h-full flex flex-col bg-zinc-100 dark:bg-[#050505]">
            <div className="bg-white dark:bg-[#0A0A0A] border-b border-zinc-200 dark:border-white/10 flex flex-col shrink-0 z-20">
                {/* Top Row: Navigation & Save */}
                <div className="h-16 flex items-center justify-between px-6 border-b border-zinc-100 dark:border-white/5">
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

                {/* Second Row: Toolbar (Only if not read-only and is editable type) */}
                {!isReadOnly && (fileType === 'blank' || fileType === 'template') && (
                    <div className="h-12 flex items-center gap-1 px-6 bg-zinc-50/50 dark:bg-white/5">
                        <ToolbarBtn icon={Bold} label="Bold" onClick={() => exec('bold')} />
                        <ToolbarBtn icon={Italic} label="Italic" onClick={() => exec('italic')} />
                        <ToolbarBtn icon={Underline} label="Underline" onClick={() => exec('underline')} />
                        <div className="w-[1px] h-4 bg-zinc-300 mx-2" />
                        <ToolbarBtn icon={AlignLeft} label="Align Left" onClick={() => exec('justifyLeft')} />
                        <ToolbarBtn icon={AlignCenter} label="Align Center" onClick={() => exec('justifyCenter')} />
                        <ToolbarBtn icon={AlignRight} label="Align Right" onClick={() => exec('justifyRight')} />
                        <div className="w-[1px] h-4 bg-zinc-300 mx-2" />
                        <ToolbarBtn icon={Heading1} label="Heading 1" onClick={() => exec('formatBlock', 'H2')} />
                        <ToolbarBtn icon={Heading2} label="Heading 2" onClick={() => exec('formatBlock', 'H3')} />
                        <ToolbarBtn icon={List} label="List" onClick={() => exec('insertUnorderedList')} />
                    </div>
                )}
            </div>

            <div className="flex-1 flex overflow-hidden">
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
                                <DraggableTool type="image" icon={ImageIcon} label="Image / Logo" onDrop={handleFieldDrop} />
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex-1 bg-zinc-100 dark:bg-[#050505] overflow-auto p-12 flex justify-center relative">
                    <div className="flex flex-col gap-8 pb-32">
                        {!fileType && (
                            <div className="flex flex-col items-center justify-center min-h-[500px]">
                                <div className="bg-white dark:bg-[#0A0A0A] p-12 rounded-3xl shadow-xl max-w-2xl w-full text-center border border-zinc-200 dark:border-white/5">
                                    <h2 className="text-3xl font-serif text-zinc-900 dark:text-white mb-2">Create Document</h2>
                                    <p className="text-zinc-500 mb-12">Select how you would like to start.</p>

                                    <div className="grid grid-cols-3 gap-6">
                                        <button
                                            onClick={handleStartTemplate}
                                            className="flex flex-col items-center gap-4 p-8 rounded-2xl border border-zinc-200 dark:border-white/10 hover:border-blue-500 hover:bg-blue-500/5 transition-all group bg-zinc-50 dark:bg-zinc-900/50"
                                        >
                                            <div className="p-4 bg-white dark:bg-black rounded-full shadow-sm text-blue-500">
                                                <FileSignature size={24} />
                                            </div>
                                            <span className="font-bold text-sm text-zinc-900 dark:text-white">Use Template</span>
                                            <p className="text-xs text-zinc-500">Standard Professional Agreement</p>
                                        </button>

                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            className="flex flex-col items-center gap-4 p-8 rounded-2xl border border-zinc-200 dark:border-white/10 hover:border-blue-500 hover:bg-blue-500/5 transition-all group bg-zinc-50 dark:bg-zinc-900/50"
                                        >
                                            <div className="p-4 bg-white dark:bg-black rounded-full shadow-sm text-zinc-500 group-hover:text-blue-500">
                                                <Upload size={24} />
                                            </div>
                                            <span className="font-bold text-sm text-zinc-900 dark:text-white">Upload File</span>
                                            <p className="text-xs text-zinc-500">PDF or Image</p>
                                        </button>

                                        <button
                                            onClick={handleStartBlank}
                                            className="flex flex-col items-center gap-4 p-8 rounded-2xl border border-zinc-200 dark:border-white/10 hover:border-blue-500 hover:bg-blue-500/5 transition-all group bg-zinc-50 dark:bg-zinc-900/50"
                                        >
                                            <div className="p-4 bg-white dark:bg-black rounded-full shadow-sm text-zinc-500 group-hover:text-blue-500">
                                                <File size={24} />
                                            </div>
                                            <span className="font-bold text-sm text-zinc-900 dark:text-white">Start Blank</span>
                                            <p className="text-xs text-zinc-500">Empty Canvas</p>
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
                                className="relative w-[8.5in] min-h-[11in] bg-white shadow-xl transition-all duration-300 mx-auto"
                            >
                                {fileType === 'pdf' && previewUrl && (
                                    <Document
                                        file={previewUrl}
                                        onLoadSuccess={onDocumentLoadSuccess}
                                        loading={<div className="h-[11in] flex items-center justify-center text-zinc-400">Loading Page...</div>}
                                    >
                                        <Page
                                            pageNumber={pageNum}
                                            width={816}
                                            renderTextLayer={false}
                                            renderAnnotationLayer={false}
                                        />
                                    </Document>
                                )}
                                {fileType === 'image' && previewUrl && pageNum === 1 && (
                                    <img src={previewUrl} alt="Document" className="w-full h-auto select-none pointer-events-none" />
                                )}

                                {(fileType === 'blank' || fileType === 'template') && (
                                    <div className="absolute inset-0 z-0">
                                        <RichTextEditor
                                            initialContent={pageContent[pageNum] || ''}
                                            readOnly={isReadOnly}
                                        />
                                    </div>
                                )}

                                {fields.filter(f => (f.pageNumber || 1) === pageNum).map((field) => (
                                    <DraggableFieldOnCanvas
                                        key={field.id}
                                        field={field}
                                        onRemove={removeField}
                                        onUpdatePos={updateFieldPosition}
                                        onUpdateValue={updateFieldValue}
                                        onUpdateSize={updateFieldSize}
                                        isReadOnly={isReadOnly}
                                    />
                                ))}

                                <div className="absolute -right-12 top-0 text-xs text-zinc-400 font-medium">
                                    Page {pageNum}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const DraggableTool: React.FC<{
    type: DraggableField['type'],
    icon: React.ElementType,
    label: string,
    color?: string,
    onDrop: (type: DraggableField['type'], label: string, x: number, y: number) => void
}> = ({ type, icon: Icon, label, color, onDrop }) => {
    const ref = useRef<HTMLDivElement>(null);

    return (
        <motion.div
            ref={ref}
            drag
            dragSnapToOrigin
            whileDrag={{ scale: 1.1, zIndex: 100, opacity: 0.8, cursor: 'grabbing' }}
            dragMomentum={false}
            onDragEnd={(e) => {
                const element = ref.current;
                if (element) {
                    const rect = element.getBoundingClientRect();
                    const centerX = rect.left + (rect.width / 2);
                    const centerY = rect.top + (rect.height / 2);
                    onDrop(type, label, centerX, centerY);
                } else {
                    // @ts-ignore
                    onDrop(type, label, e.clientX || e.pageX, e.clientY || e.pageY);
                }
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
    onUpdatePos: (id: string, x: number, y: number) => void,
    onUpdateValue?: (id: string, value: string) => void,
    isReadOnly?: boolean
}> = ({ field, onRemove, onUpdatePos, onUpdateValue, isReadOnly }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const elementRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    // Manual Resize State
    const [isResizing, setIsResizing] = useState(false);
    const resizeStart = useRef<{ x: number, y: number, initialWidth: number, initialHeight: number } | null>(null);

    // Manual Drag State
    const dragStart = useRef<{ x: number, y: number, initialLeft: number, initialTop: number } | null>(null);

    const handlePointerDown = (e: React.PointerEvent) => {
        if (isReadOnly) return;
        // Don't start drag if clicking resize handle
        // @ts-ignore
        if (e.target.dataset.resizeHandle) return;

        e.preventDefault();
        e.stopPropagation();

        const el = elementRef.current;
        if (!el) return;

        // Capture initial state
        const rect = el.getBoundingClientRect();
        const parent = el.offsetParent?.getBoundingClientRect();

        if (!parent) return;

        setIsDragging(true);
        dragStart.current = {
            x: e.clientX,
            y: e.clientY,
            // Calculate current Left/Top in Pixels relative to parent
            initialLeft: rect.left - parent.left + (rect.width / 2),
            initialTop: rect.top - parent.top + (rect.height / 2)
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
        const rect = el.getBoundingClientRect();

        resizeStart.current = {
            x: e.clientX,
            y: e.clientY,
            initialWidth: rect.width,
            initialHeight: rect.height
        };

        const handleResizeMove = (moveEvent: PointerEvent) => {
            moveEvent.preventDefault();
            if (!resizeStart.current || !el) return;

            const deltaX = moveEvent.clientX - resizeStart.current.x;
            const deltaY = moveEvent.clientY - resizeStart.current.y;

            const newWidth = Math.max(50, resizeStart.current.initialWidth + deltaX);
            const newHeight = Math.max(30, resizeStart.current.initialHeight + deltaY);

            el.style.width = `${newWidth}px`;
            el.style.height = `${newHeight}px`;
        };

        const handleResizeUp = (upEvent: PointerEvent) => {
            document.removeEventListener('pointermove', handleResizeMove);
            document.removeEventListener('pointerup', handleResizeUp);

            setIsResizing(false);
            if (!resizeStart.current || !el) return;

            const newWidth = parseFloat(el.style.width);
            const newHeight = parseFloat(el.style.height);

            if (onUpdateSize) {
                onUpdateSize(field.id, newWidth, newHeight);
            }
        };

        document.addEventListener('pointermove', handleResizeMove);
        document.addEventListener('pointerup', handleResizeUp);
    }

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0] && onUpdateValue) {
            const url = URL.createObjectURL(e.target.files[0]);
            onUpdateValue(field.id, url);
        }
    };

    return (
        <div
            ref={elementRef}
            onPointerDown={handlePointerDown}
            style={{
                position: 'absolute',
                left: `${field.x}%`,
                top: `${field.y}%`,
                width: field.width ? `${field.width}px` : undefined,
                height: field.height ? `${field.height}px` : undefined,
                transform: 'translate(-50%, -50%)',
                cursor: isReadOnly ? 'default' : (isDragging ? 'grabbing' : 'grab'),
                zIndex: isDragging || isResizing ? 50 : 10,
                touchAction: 'none'
            }}
            className="group"
        >
            {field.type === 'image' ? (
                <div className="relative group/image w-full h-full">
                    {field.value ? (
                        <div className="relative w-full h-full">
                            <img src={field.value} alt="Logo" className="w-full h-full object-contain border border-transparent hover:border-blue-500 rounded select-none pointer-events-none" />
                            {!isReadOnly && (
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded cursor-pointer pointer-events-auto" onPointerDown={(e) => e.stopPropagation()} onClick={() => fileInputRef.current?.click()}>
                                    <Pencil size={12} className="text-white" />
                                </div>
                            )}
                        </div>
                    ) : (
                        <div
                            onClick={() => !isReadOnly && fileInputRef.current?.click()}
                            className="w-full h-full min-w-[64px] min-h-[64px] bg-zinc-100 border-2 border-dashed border-zinc-300 rounded flex items-center justify-center cursor-pointer hover:bg-zinc-200 hover:border-zinc-400 transition-colors"
                        >
                            <ImageIcon size={20} className="text-zinc-400" />
                        </div>
                    )}
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                </div>
            ) : (
                <div className={`w-full h-full p-2 rounded border-2 shadow-sm flex items-center justify-center text-center gap-2 select-none overflow-hidden
                    ${field.type === 'signature' ? 'bg-blue-500/10 border-blue-500 text-blue-600' : 'bg-yellow-500/10 border-yellow-500 text-yellow-600'}
                `}>
                    <span className="text-[10px] font-bold uppercase tracking-wider whitespace-nowrap overflow-hidden text-ellipsis">{field.label}</span>
                </div>
            )}

            {!isReadOnly && (
                <>
                    <button
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={(e) => { e.stopPropagation(); onRemove(field.id); }}
                        className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:scale-110 cursor-pointer pointer-events-auto z-20"
                    >
                        <X size={10} />
                    </button>
                    <div
                        onPointerDown={handleResizeStart}
                        data-resize-handle="true"
                        className="absolute -bottom-1 -right-1 w-3 h-3 bg-white border border-zinc-400 rounded-full cursor-nwse-resize opacity-0 group-hover:opacity-100 transition-opacity z-20"
                    />
                </>
            )}
        </div>
    );
};
