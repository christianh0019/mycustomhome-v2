import React, { useState, useRef, useEffect } from 'react';
import {
    FileText, Plus,
    PenTool, Type, Calendar, CheckSquare, Image as ImageIcon,
    ChevronLeft, Save, Upload, X, Trash2,
    Bold, Italic, Heading1, Heading2, List, AlignLeft, AlignCenter, AlignRight, Underline, ListOrdered, ChevronDown
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

import { DocItem, DraggableField, DroppableCanvas, DraggableFieldOnCanvas, DraggableTool, SendDocumentModal, Lead } from './DocumentComponents';

// Set worker for PDF.js - Ensure consistency
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const TOOL_TYPES: { type: DraggableField['type'], icon: any, label: string }[] = [
    { type: 'signature', icon: PenTool, label: 'Signature' },
    { type: 'initials', icon: Type, label: 'Initials' },
    { type: 'date', icon: Calendar, label: 'Date Signed' },
    { type: 'text', icon: FileText, label: 'Text Field' },
    { type: 'checkbox', icon: CheckSquare, label: 'Checkbox' },
    { type: 'image', icon: ImageIcon, label: 'Image' },
];

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

export const DocumentEditor: React.FC<{
    onBack: () => void;
    initialDoc: DocItem | null;
}> = ({ onBack, initialDoc }) => {
    const { user } = useAuth();
    const isReadOnly = initialDoc?.status !== 'draft';

    const [docTitle, setDocTitle] = useState(initialDoc?.title || 'Untitled Document');
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(initialDoc?.file_url || null);

    const [fileType, setFileType] = useState<'image' | 'pdf' | 'blank' | 'template' | null>(
        initialDoc?.file_url
            ? (initialDoc.file_url.toLowerCase().includes('.pdf') ? 'pdf' : 'image')
            : null
    );
    const [numPages, setNumPages] = useState<number>(1);
    const [pageContent, setPageContent] = useState<{ [page: number]: string }>({});
    const [fields, setFields] = useState<DraggableField[]>(initialDoc?.metadata || []);
    const [saving, setSaving] = useState(false);
    const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
    const [isSendModalOpen, setIsSendModalOpen] = useState(false);

    // Template Logic (Simplified for brevity, copying core parts)
    const handleStartTemplate = () => {
        setFileType('template');
        setNumPages(2);
        setDocTitle('Professional Services Agreement');
        // Pre-fill content (truncated for brevity, would usually load from a constant or DB)
        setPageContent({
            1: `<div style="text-align: center;"><h1>Professional Services Agreement</h1><p>Effective Date: ${new Date().toLocaleDateString()}</p></div>`,
            2: `<div><h2>Signatures</h2></div>`
        });
    };

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

    // Field Management
    const addField = (type: DraggableField['type'], label: string, x: number, y: number) => {
        const newField: DraggableField = {
            id: Date.now().toString(),
            type,
            label,
            x,
            y,
            pageNumber: 1,
            value: '',
            width: 200,
            recipientId: 1,
            assignee: 'contact' // Default to contact (Homeowner) for signature fields usually
        };
        // Auto-assign logic
        if (type === 'text' || type === 'checkbox') {
            // Could be either, but let's default to contact for now or let user choosing
        }
        setFields([...fields, newField]);
        setSelectedFieldId(newField.id);
    };

    const updateFieldPosition = (id: string, x: number, y: number) => {
        setFields(fields.map(f => f.id === id ? { ...f, x, y } : f));
    };

    const updateFieldValue = (id: string, value: string) => {
        setFields(fields.map(f => f.id === id ? { ...f, value } : f));
    };

    const deleteField = (id: string) => {
        setFields(fields.filter(f => f.id !== id));
        if (selectedFieldId === id) setSelectedFieldId(null);
    };

    const handleSave = async (status: 'draft' | 'sent' = 'draft', shouldExit = true, lead?: Lead) => {
        if (!user) return;
        setSaving(true);
        try {
            // 1. Upload File if new
            let finalUrl = previewUrl;
            if (file) {
                const fileExt = file.name.split('.').pop();
                const fileName = `${user.id}/${Math.random()}.${fileExt}`;
                const { error: uploadError } = await supabase.storage.from('documents').upload(fileName, file);
                if (uploadError) throw uploadError;
                const { data: { publicUrl } } = supabase.storage.from('documents').getPublicUrl(fileName);
                finalUrl = publicUrl;
            }

            const updates: any = {
                title: docTitle,
                status: status,
                metadata: fields,
                updated_at: new Date().toISOString(),
                file_url: finalUrl
            };

            if (lead) {
                updates.recipient = lead.project_title;
                // In a real app, we'd store lead_id too
            }

            if (initialDoc?.id) {
                await supabase.from('documents').update(updates).eq('id', initialDoc.id);
            } else {
                await supabase.from('documents').insert({
                    user_id: user.id,
                    ...updates
                });
            }

            // Log Action
            if (status === 'sent') {
                // Fetch doc id if new (omitted for brevity, ideally return from insert)
                // await supabase.from('document_audit_logs').insert({...})
            }

            if (shouldExit) onBack();

        } catch (err: any) {
            console.error(err);
            alert("Error saving: " + err.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-zinc-100 dark:bg-[#050505] flex flex-col">
            {/* Header */}
            <div className="h-16 bg-white dark:bg-[#0A0A0A] border-b border-zinc-200 dark:border-white/10 flex items-center justify-between px-6 shrink-0">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 flex items-center justify-center transition-colors">
                        <ChevronLeft size={18} className="text-zinc-600 dark:text-zinc-400" />
                    </button>
                    <input
                        value={docTitle}
                        onChange={(e) => setDocTitle(e.target.value)}
                        disabled={isReadOnly}
                        className="bg-transparent text-lg font-bold text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 rounded px-1"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => handleSave('draft')}
                        disabled={saving || isReadOnly}
                        className="px-4 py-2 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-white/5 rounded-lg text-sm font-medium transition-colors"
                    >
                        Save Draft
                    </button>
                    <button
                        onClick={() => {
                            if (fields.length === 0) { alert("Add fields first."); return; }
                            setIsSendModalOpen(true);
                        }}
                        disabled={saving}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-bold shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-2"
                    >
                        <Save size={16} />
                        {saving ? 'Saving...' : 'Send'}
                    </button>
                </div>
            </div>

            {/* Toolbar */}
            {(fileType === 'blank' || fileType === 'template') && !isReadOnly && (
                <RichTextToolbar onExec={(cmd, val) => document.execCommand(cmd, false, val)} />
            )}

            <div className="flex-1 flex overflow-hidden relative">
                {/* Sidebar */}
                <div className="w-64 bg-white dark:bg-[#0A0A0A] border-r border-zinc-200 dark:border-white/10 flex flex-col shrink-0 z-20">
                    <div className="p-4 border-b border-zinc-100 dark:border-white/5">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4">Form Fields</h3>
                        <div className="space-y-2">
                            {TOOL_TYPES.map(tool => (
                                <DraggableTool key={tool.type + tool.label} type={tool.type} icon={tool.icon} label={tool.label} />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Canvas */}
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
                            className="bg-white dark:bg-white shadow-2xl relative"
                            style={{ width: '595px', minHeight: '842px' }}
                        >
                            {/* Background Layer */}
                            <div className="absolute inset-0 z-0">
                                {fileType === 'pdf' && previewUrl ? (
                                    <Document file={previewUrl} onLoadSuccess={({ numPages }) => setNumPages(numPages)}>
                                        <Page pageNumber={1} width={595} renderTextLayer={false} renderAnnotationLayer={false} />
                                    </Document>
                                ) : (fileType === 'template' || fileType === 'blank') ? (
                                    <RichTextEditor content={pageContent[1] || ''} onChange={(html) => setPageContent({ ...pageContent, 1: html })} />
                                ) : (
                                    <img src={previewUrl || ''} className="w-full h-full object-contain" />
                                )}
                            </div>

                            {/* Field Layer */}
                            <div className="absolute inset-0 z-10">
                                <DroppableCanvas
                                    onDrop={() => { }}
                                    onCanvasDrop={(type, label, clientX, clientY, canvasRect) => {
                                        if (isReadOnly) return;
                                        const xPercent = ((clientX - canvasRect.left) / canvasRect.width) * 100;
                                        const yPercent = ((clientY - canvasRect.top) / canvasRect.height) * 100;
                                        addField(type, label, xPercent, yPercent);
                                    }}
                                >
                                    {fields.map(field => (
                                        <div key={field.id} className="relative">
                                            <DraggableFieldOnCanvas
                                                field={field}
                                                isSelected={selectedFieldId === field.id}
                                                onSelect={() => setSelectedFieldId(field.id)}
                                                onUpdatePos={updateFieldPosition}
                                                onUpdateValue={updateFieldValue}
                                            />
                                            {selectedFieldId === field.id && (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); deleteField(field.id); }}
                                                    className="absolute -top-3 -right-3 z-[60] bg-red-500 text-white rounded-full p-1 shadow-sm hover:scale-110 transition-transform"
                                                >
                                                    <Trash2 size={10} />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </DroppableCanvas>
                            </div>
                        </div>
                    )}
                </div>
            </div>

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
