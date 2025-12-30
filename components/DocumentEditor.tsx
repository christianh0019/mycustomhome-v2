import React, { useState, useRef, useEffect } from 'react';
import {
    FileText, Plus,
    PenTool, Type, Calendar, CheckSquare, Image as ImageIcon,
    ChevronLeft, Save, Upload, X, Trash2,
    Bold, Italic, Heading1, Heading2, List, AlignLeft, AlignCenter, AlignRight, Underline, ListOrdered, ChevronDown, Type as FontIcon, Palette
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

import { DocItem, DraggableField, DroppableCanvas, DraggableFieldOnCanvas, DraggableTool, SendDocumentModal, Lead } from './DocumentComponents';
import { auditService } from '../services/AuditService';

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
    const ToolbarBtn: React.FC<{ icon: React.ElementType, onClick: () => void, active?: boolean }> = ({ icon: Icon, onClick, active }) => (
        <button
            onClick={(e) => { e.preventDefault(); onClick(); }}
            className={`p-1.5 rounded transition-colors ${active ? 'bg-indigo-100 text-indigo-700' : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200'}`}
        >
            <Icon size={16} />
        </button>
    );

    return (
        <div className="h-12 border-b border-zinc-200 dark:border-white/10 bg-white dark:bg-[#111] flex items-center px-4 gap-2 shrink-0 shadow-sm z-[60]">
            {/* Font Family Selector */}
            <div className="relative group">
                <button className="flex items-center gap-1.5 px-2 py-1.5 rounded hover:bg-zinc-100 dark:hover:bg-white/5 text-zinc-600 dark:text-zinc-300 text-xs font-medium">
                    <span className="w-20 text-left truncate">Sans Serif</span>
                    <ChevronDown size={12} />
                </button>
                <div className="absolute top-full left-0 mt-1 w-32 bg-white dark:bg-zinc-800 rounded-lg shadow-xl border border-zinc-200 dark:border-white/10 hidden group-hover:block z-50">
                    <button onClick={() => onExec('fontName', 'Arial')} className="w-full text-left px-3 py-2 text-xs hover:bg-zinc-100 dark:hover:bg-white/5 dark:text-white font-sans">Sans Serif</button>
                    <button onClick={() => onExec('fontName', 'Times New Roman')} className="w-full text-left px-3 py-2 text-xs hover:bg-zinc-100 dark:hover:bg-white/5 dark:text-white font-serif">Serif</button>
                    <button onClick={() => onExec('fontName', 'Courier New')} className="w-full text-left px-3 py-2 text-xs hover:bg-zinc-100 dark:hover:bg-white/5 dark:text-white font-mono">Monospace</button>
                </div>
            </div>

            <div className="w-[1px] h-5 bg-zinc-200 dark:bg-white/10" />

            {/* Font Size Selector */}
            <div className="relative group">
                <button className="flex items-center gap-1.5 px-2 py-1.5 rounded hover:bg-zinc-100 dark:hover:bg-white/5 text-zinc-600 dark:text-zinc-300 text-xs font-medium">
                    <span className="w-12 text-left truncate">Normal</span>
                    <ChevronDown size={12} />
                </button>
                <div className="absolute top-full left-0 mt-1 w-32 bg-white dark:bg-zinc-800 rounded-lg shadow-xl border border-zinc-200 dark:border-white/10 hidden group-hover:block z-50">
                    <button onClick={() => onExec('formatBlock', 'P')} className="w-full text-left px-3 py-2 text-xs hover:bg-zinc-100 dark:hover:bg-white/5 dark:text-white">Normal</button>
                    <button onClick={() => onExec('formatBlock', 'H1')} className="w-full text-left px-3 py-2 text-lg font-bold hover:bg-zinc-100 dark:hover:bg-white/5 dark:text-white">Heading 1</button>
                    <button onClick={() => onExec('formatBlock', 'H2')} className="w-full text-left px-3 py-2 text-base font-bold hover:bg-zinc-100 dark:hover:bg-white/5 dark:text-white">Heading 2</button>
                    <button onClick={() => onExec('formatBlock', 'H3')} className="w-full text-left px-3 py-2 text-sm font-bold hover:bg-zinc-100 dark:hover:bg-white/5 dark:text-white">Heading 3</button>
                </div>
            </div>

            <div className="w-[1px] h-5 bg-zinc-200 dark:bg-white/10" />

            {/* Color Selector */}
            <div className="relative group">
                <button className="p-1.5 rounded text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200 transition-colors">
                    <Palette size={16} />
                </button>
                <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-zinc-800 rounded-lg shadow-xl border border-zinc-200 dark:border-white/10 hidden group-hover:block z-50 p-3">
                    <div className="grid grid-cols-6 gap-2">
                        {['#000000', '#434343', '#666666', '#999999', '#b91c1c', '#c2410c', '#b45309', '#047857', '#0e7490', '#1d4ed8', '#4338ca', '#6d28d9'].map(c => (
                            <button
                                key={c}
                                onClick={() => onExec('foreColor', c)}
                                className="w-5 h-5 rounded-full border border-zinc-200 dark:border-white/20 hover:scale-110 transition-transform"
                                style={{ backgroundColor: c }}
                                title={c}
                            />
                        ))}
                    </div>
                </div>
            </div>

            <div className="w-[1px] h-5 bg-zinc-200 dark:bg-white/10" />

            <ToolbarBtn icon={Bold} onClick={() => onExec('bold')} />
            <ToolbarBtn icon={Italic} onClick={() => onExec('italic')} />
            <ToolbarBtn icon={Underline} onClick={() => onExec('underline')} />

            <div className="w-[1px] h-5 bg-zinc-200 dark:bg-white/10" />

            <ToolbarBtn icon={AlignLeft} onClick={() => onExec('justifyLeft')} />
            <ToolbarBtn icon={AlignCenter} onClick={() => onExec('justifyCenter')} />
            <ToolbarBtn icon={AlignRight} onClick={() => onExec('justifyRight')} />

            <div className="w-[1px] h-5 bg-zinc-200 dark:bg-white/10" />

            <ToolbarBtn icon={List} onClick={() => onExec('insertUnorderedList')} />
            <ToolbarBtn icon={ListOrdered} onClick={() => onExec('insertOrderedList')} />
        </div>
    );
};

export const RichTextEditor: React.FC<{
    content: string;
    onChange: (html: string) => void;
    onOverflow?: (content: string) => void;
    readOnly?: boolean;
}> = ({ content, onChange, onOverflow, readOnly }) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const isInitializedString = useRef(false);

    // Initial load only
    useEffect(() => {
        if (editorRef.current && content !== undefined && !isInitializedString.current) {
            editorRef.current.innerHTML = content;
            isInitializedString.current = true;
        }
    }, [content]); // re-run if content changes and we haven't initialized? actually we only want to init once usually?
    // Wait, if I am using it for display in Signer, I might want it to update if content changes prop.
    // But in Editor it's uncontrolled mostly (onInput).
    // Let's stick to the existing behavior but allow `readOnly`.

    // Actually, strictly following existing behavior: "Initial load only".
    // But for Signer, `content` is passed once.

    const checkOverflow = () => {
        if (editorRef.current && onOverflow && !readOnly) {
            // ...
        }
    };

    return (
        <div
            ref={editorRef}
            className={`
                w-full h-full outline-none font-serif text-[11px] leading-relaxed relative
                prose prose-sm max-w-none
                prose-headings:font-bold prose-headings:text-zinc-900
                prose-p:mb-4 prose-p:text-zinc-900
                prose-ul:list-disc prose-ul:pl-5
                px-[96px] py-[96px] /* A4 Margins: approx 1 inch = 96px */
            `}
            contentEditable={!readOnly}
            suppressContentEditableWarning
            onInput={(e) => {
                if (readOnly) return;
                onChange(e.currentTarget.innerHTML);
                checkOverflow();
            }}
        />
    );
};

interface DocumentEditorProps {
    initialDoc?: DocItem | null;
    onBack: () => void;
    onStartSigning?: (docId: string) => void;
}

export const DocumentEditor: React.FC<DocumentEditorProps> = ({ initialDoc, onBack, onStartSigning }) => {
    const { user } = useAuth();
    // Fix: New docs (initialDoc is null) should NOT be read-only.
    const isReadOnly = initialDoc ? initialDoc.status !== 'draft' : false;

    const [docTitle, setDocTitle] = useState(initialDoc?.title || 'Untitled Document');
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(initialDoc?.file_url || null);

    const [fileType, setFileType] = useState<'image' | 'pdf' | 'blank' | 'template' | null>(
        initialDoc?.metadata?.type || (
            initialDoc?.file_url
                ? (initialDoc.file_url.toLowerCase().includes('.pdf') ? 'pdf' : 'image')
                : null
        )
    );
    const [numPages, setNumPages] = useState<number>(initialDoc?.metadata?.numPages || 1);
    const [pageContent, setPageContent] = useState<{ [page: number]: string }>(initialDoc?.metadata?.content || {});

    // Handle legacy metadata (array) vs new metadata (object)
    const [fields, setFields] = useState<DraggableField[]>(
        Array.isArray(initialDoc?.metadata)
            ? initialDoc.metadata
            : (initialDoc?.metadata?.fields || [])
    );

    const [saving, setSaving] = useState(false);
    const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
    const [isSendModalOpen, setIsSendModalOpen] = useState(false);

    const handleStartTemplate = () => {
        setFileType('template');
        setNumPages(1);
        setDocTitle('Professional Services Agreement');
        setPageContent({
            1: `<h1 style="text-align: center;">Professional Services Agreement</h1><p>Effective Date: ${new Date().toLocaleDateString()}</p><p>This agreement is entered into by and between the Client and the Vendor.</p><h3>1. Services</h3><p>The vendor agrees to perform the services described in the attached Statement of Work.</p><br/><br/><br/>`
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

    const handlePageOverflow = (pageNum: number, overflowContent: string) => {
        const nextPageNum = pageNum + 1;
        setPageContent(prev => {
            const currentNextContent = prev[nextPageNum] || '';
            return {
                ...prev,
                [nextPageNum]: overflowContent + currentNextContent
            };
        });

        if (nextPageNum > numPages) {
            setNumPages(nextPageNum);
        }
    };

    // Field Management
    const addField = (type: DraggableField['type'], label: string, x: number, y: number, pageNumber: number) => {
        const newField: DraggableField = {
            id: Date.now().toString(),
            type,
            label,
            x,
            y,
            pageNumber,
            value: '',
            width: 200,
            height: 40,
            assignee: 'contact'
        };
        setFields([...fields, newField]);
        setSelectedFieldId(newField.id);
    };

    const updateFieldPosition = (id: string, x: number, y: number) => {
        setFields(fields.map(f => f.id === id ? { ...f, x, y } : f));
    };

    const updateFieldSize = (id: string, width: number, height: number) => {
        setFields(fields.map(f => f.id === id ? { ...f, width, height } : f));
    };

    const updateFieldValue = (id: string, val: string) => {
        setFields(fields.map(f => f.id === id ? { ...f, value: val } : f));
    };

    const updateFieldAssignee = (id: string, assignee: 'business' | 'contact') => {
        setFields(fields.map(f => f.id === id ? { ...f, assignee } : f));
    };

    const deleteField = (id: string) => {
        setFields(fields.filter(f => f.id !== id));
        if (selectedFieldId === id) setSelectedFieldId(null);
    };

    const handleSave = async (status: 'draft' | 'sent' = 'draft', shouldExit = true, lead?: Lead): Promise<string | null> => {
        if (!user) return null;
        setSaving(true);
        try {
            let finalUrl = previewUrl;
            if (file) {
                const fileExt = file.name.split('.').pop();
                const fileName = `${user.id}/${Math.random()}.${fileExt}`;
                const { error: uploadError } = await supabase.storage.from('documents').upload(fileName, file);
                if (uploadError) throw uploadError;
                const { data: { publicUrl } } = supabase.storage.from('documents').getPublicUrl(fileName);
                finalUrl = publicUrl;
            }

            // Save rich content mostly in metadata since 'content' column might not exist or be preferred
            const updates: any = {
                title: docTitle,
                status: status,
                metadata: {
                    fields,
                    content: pageContent,
                    type: fileType,
                    numPages
                },
                // updated_at removed as it does not exist in the schema
                file_url: finalUrl
            };

            if (lead) {
                updates.recipient_name = lead.project_title;
                // updates.recipient_email = lead.email; // If we had email
            }

            let docId = initialDoc?.id;

            if (docId) {
                await supabase.from('documents').update(updates).eq('id', docId);
            } else {
                const { data, error } = await supabase.from('documents').insert({
                    vendor_id: user.id,
                    ...updates
                }).select().single();

                if (error) throw error;
                if (data) docId = data.id;
            }

            if (shouldExit) onBack();
            return docId || null;

        } catch (err: any) {
            console.error(err);
            alert("Error saving: " + err.message);
            return null;
        } finally {
            setSaving(false);
        }
    };

    // ... (rendering code)

    {
        isSendModalOpen && (
            <SendDocumentModal
                isOpen={isSendModalOpen}
                onClose={() => setIsSendModalOpen(false)}
                onSend={(lead) => {
                    if (confirm(`Are you sure you want to sign and send this document to ${lead.name}? This document will be locked for editing.`)) {
                        // First save as locking/draft, but effectively we want to move to signing mode.
                        handleSave('draft', false, lead).then(async (savedDocId) => {
                            setIsSendModalOpen(false);
                            if (savedDocId && onStartSigning) {
                                onStartSigning(savedDocId);
                            }
                        });
                    }
                }}
            />
        )
    }

    return (
        <div className="fixed inset-0 z-50 bg-[#e3e3e3] dark:bg-[#111] flex flex-col font-sans">
            {/* Header */}
            <div className="h-16 bg-white dark:bg-[#0A0A0A] border-b border-zinc-200 dark:border-white/10 flex items-center justify-between px-6 shrink-0 z-40">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 flex items-center justify-center transition-colors">
                        <ChevronLeft size={18} className="text-zinc-600 dark:text-zinc-400" />
                    </button>
                    <div>
                        <input
                            value={docTitle}
                            onChange={(e) => setDocTitle(e.target.value)}
                            disabled={isReadOnly}
                            className="bg-transparent text-lg font-bold text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 rounded px-1 -ml-1"
                        />
                        <div className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 mt-0.5">
                            {fileType === 'template' || fileType === 'blank' ? 'Rich Text Document' : 'PDF / Image Mode'}
                        </div>
                    </div>
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
                        onClick={() => setIsSendModalOpen(true)}
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
                <div className="w-64 bg-white dark:bg-[#0A0A0A] border-r border-zinc-200 dark:border-white/10 flex flex-col shrink-0 z-30 shadow-sm">
                    <div className="p-4 border-b border-zinc-100 dark:border-white/5">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4 px-1">Fields</h3>
                        <div className="space-y-3">
                            {TOOL_TYPES.map(tool => (
                                <DraggableTool key={tool.type + tool.label} type={tool.type} icon={tool.icon} label={tool.label} />
                            ))}
                        </div>
                    </div>

                    <div className="p-4">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4 px-1">Layers</h3>
                        <div className="space-y-2">
                            {fields.map((f, i) => (
                                <div key={f.id}
                                    className={`flex items-center gap-2 p-2 rounded text-xs cursor-pointer ${selectedFieldId === f.id ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-zinc-50 text-zinc-600'}`}
                                    onClick={() => setSelectedFieldId(f.id)}
                                >
                                    <div className="w-4 h-4 rounded-full bg-zinc-200 flex items-center justify-center text-[10px] font-mono">{i + 1}</div>
                                    <span className="truncate flex-1">{f.label}</span>
                                    <button onClick={(e) => { e.stopPropagation(); deleteField(f.id); }} className="text-zinc-400 hover:text-red-500"><Trash2 size={12} /></button>
                                </div>
                            ))}
                            {fields.length === 0 && <div className="text-xs text-zinc-400 italic px-2">No fields added yet.</div>}
                        </div>
                    </div>
                </div>

                {/* Canvas Area */}
                <div className="flex-1 overflow-auto relative flex justify-center p-12 bg-[#e3e3e3] dark:bg-[#050505]">
                    {!fileType ? (
                        <div className="flex flex-col items-center justify-center h-full text-zinc-400">
                            <div className="w-32 h-40 bg-white dark:bg-white/5 shadow-sm rounded-lg flex items-center justify-center mb-6">
                                <Plus size={48} className="text-zinc-200" />
                            </div>
                            <h2 className="text-xl font-bold text-zinc-700 dark:text-zinc-300 mb-2">Create a Document</h2>
                            <p className="max-w-md text-center mb-8 text-sm">Upload a PDF to place fields on top, or start with a blank document to write your own contract.</p>

                            <div className="flex flex-col gap-3 w-64">
                                <button onClick={handleStartTemplate} className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/20 transition-all">
                                    Use Standard Agreement
                                </button>
                                <button onClick={() => setFileType('blank')} className="w-full py-3 bg-white dark:bg-white/10 hover:bg-zinc-50 dark:hover:bg-white/20 text-zinc-700 dark:text-white border border-zinc-200 dark:border-white/10 rounded-xl text-sm font-bold transition-all">
                                    Start Blank Document
                                </button>
                                <div className="relative">
                                    <input type="file" onChange={handleFileUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="image/*,application/pdf" />
                                    <button className="w-full py-3 bg-white dark:bg-white/10 hover:bg-zinc-50 dark:hover:bg-white/20 text-zinc-700 dark:text-white border border-zinc-200 dark:border-white/10 rounded-xl text-sm font-bold transition-all">
                                        Upload PDF or Image
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-8 pb-32">
                            {Array.from({ length: numPages }).map((_, i) => {
                                const pageNum = i + 1;
                                return (
                                    <div
                                        key={pageNum}
                                        className="bg-white shadow-[0_4px_30px_rgba(0,0,0,0.1)] relative transition-transform duration-300 origin-top"
                                        style={{ width: '595px', height: '842px', minHeight: '842px' }}
                                    >
                                        <DroppableCanvas
                                            onDrop={() => { }}
                                            onCanvasDrop={(type, label, clientX, clientY, canvasRect, offset) => {
                                                if (isReadOnly) return;

                                                const finalX = clientX - canvasRect.left - (offset?.x || 0);
                                                const finalY = clientY - canvasRect.top - (offset?.y || 0);

                                                const xPercent = (finalX / canvasRect.width) * 100;
                                                const yPercent = (finalY / canvasRect.height) * 100;

                                                addField(type, label, xPercent, yPercent, pageNum);
                                            }}
                                        >
                                            {/* Content Layer */}
                                            <div className="absolute inset-0 z-0 select-text">
                                                {fileType === 'pdf' && previewUrl ? (
                                                    <Document file={previewUrl} onLoadSuccess={({ numPages }) => setNumPages(numPages)}>
                                                        <Page pageNumber={pageNum} width={595} renderTextLayer={false} renderAnnotationLayer={false} />
                                                    </Document>
                                                ) : (fileType === 'template' || fileType === 'blank') ? (
                                                    <RichTextEditor
                                                        content={pageContent[pageNum] || ''}
                                                        onChange={(html) => setPageContent(prev => ({ ...prev, [pageNum]: html }))}
                                                        onOverflow={(overflow) => handlePageOverflow(pageNum, overflow)}
                                                    />
                                                ) : (
                                                    pageNum === 1 ? <img src={previewUrl || ''} className="w-full h-full object-contain" /> : null
                                                )}
                                            </div>

                                            {/* Field Layer */}
                                            {fields.filter(f => f.pageNumber === pageNum).map(field => (
                                                <DraggableFieldOnCanvas
                                                    key={field.id}
                                                    field={field}
                                                    isSelected={selectedFieldId === field.id}
                                                    onSelect={() => setSelectedFieldId(field.id)}
                                                    onUpdatePos={updateFieldPosition}
                                                    onUpdateSize={updateFieldSize}
                                                    onUpdateValue={updateFieldValue}
                                                    onDelete={() => deleteField(field.id)}
                                                />
                                            ))}
                                        </DroppableCanvas>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Right Sidebar - Properties */}
                <div className="w-64 bg-white dark:bg-[#0A0A0A] border-l border-zinc-200 dark:border-white/10 flex flex-col shrink-0 z-30 shadow-sm relative">
                    <div className="p-4 border-b border-zinc-100 dark:border-white/5">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-1">Properties</h3>
                    </div>

                    <div className="p-4">
                        {selectedFieldId ? (
                            <div className="space-y-6">
                                {/* Selected Field Info */}
                                <div>
                                    <label className="text-xs font-medium text-zinc-500 block mb-2">Selected Field</label>
                                    <div className="text-sm font-bold text-zinc-800 dark:text-white bg-zinc-50 dark:bg-white/5 p-2 rounded border border-zinc-200 dark:border-white/10">
                                        {fields.find(f => f.id === selectedFieldId)?.label || 'Unknown Field'}
                                    </div>
                                </div>

                                {/* Properties based on Type */}
                                {fields.find(f => f.id === selectedFieldId)?.type === 'image' ? (
                                    <div>
                                        <label className="text-xs font-bold text-zinc-900 dark:text-white block mb-3">Image Source</label>

                                        {fields.find(f => f.id === selectedFieldId)?.value ? (
                                            <div className="mb-3">
                                                <div className="w-full h-32 bg-zinc-100 rounded-lg overflow-hidden border border-zinc-200 mb-2">
                                                    <img src={fields.find(f => f.id === selectedFieldId)?.value} className="w-full h-full object-contain" />
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="w-full h-32 bg-zinc-50 dark:bg-white/5 rounded-lg border-2 border-dashed border-zinc-200 dark:border-white/10 flex flex-col items-center justify-center text-zinc-400 mb-3">
                                                <ImageIcon size={24} className="mb-2 opacity-50" />
                                                <span className="text-xs">No image set</span>
                                            </div>
                                        )}

                                        <div className="relative">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file && selectedFieldId) {
                                                        const reader = new FileReader();
                                                        reader.onload = (ev) => {
                                                            if (ev.target?.result) {
                                                                updateFieldValue(selectedFieldId, ev.target.result as string);
                                                            }
                                                        };
                                                        reader.readAsDataURL(file);
                                                    }
                                                }}
                                            />
                                            <button className="w-full py-2 bg-white dark:bg-white/10 border border-zinc-200 dark:border-white/10 hover:border-indigo-500 text-zinc-700 dark:text-white rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2">
                                                <Upload size={14} />
                                                {fields.find(f => f.id === selectedFieldId)?.value ? 'Replace Image' : 'Upload Image'}
                                            </button>
                                        </div>
                                        <p className="text-[10px] text-zinc-400 mt-2 leading-relaxed">
                                            Upload an image to display in this field. It will be embedded in the document.
                                        </p>
                                    </div>
                                ) : (
                                    /* Assignee Selector for other fields */
                                    <div>
                                        <label className="text-xs font-bold text-zinc-900 dark:text-white block mb-3">Who will sign this?</label>
                                        <div className="space-y-2">
                                            <button
                                                onClick={() => updateFieldAssignee(selectedFieldId!, 'business')}
                                                className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${fields.find(f => f.id === selectedFieldId)?.assignee === 'business'
                                                    ? 'bg-red-50 border-red-500 text-red-700'
                                                    : 'bg-white dark:bg-white/5 border-zinc-200 dark:border-white/10 text-zinc-600 hover:border-red-200'
                                                    }`}
                                            >
                                                <span className="text-sm font-medium">Business Owner</span>
                                                {fields.find(f => f.id === selectedFieldId)?.assignee === 'business' && <div className="w-2 h-2 rounded-full bg-red-500" />}
                                            </button>

                                            <button
                                                onClick={() => updateFieldAssignee(selectedFieldId!, 'contact')}
                                                className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${fields.find(f => f.id === selectedFieldId)?.assignee === 'contact'
                                                    ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                                                    : 'bg-white dark:bg-white/5 border-zinc-200 dark:border-white/10 text-zinc-600 hover:border-emerald-200'
                                                    }`}
                                            >
                                                <span className="text-sm font-medium">Contact (Client)</span>
                                                {fields.find(f => f.id === selectedFieldId)?.assignee === 'contact' && <div className="w-2 h-2 rounded-full bg-emerald-500" />}
                                            </button>
                                        </div>
                                        <p className="text-[10px] text-zinc-400 mt-2 leading-relaxed">
                                            Assigning a field determines who is required to fill it out during the signing process.
                                        </p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-zinc-400 text-center">
                                <FileText size={32} className="mb-3 opacity-20" />
                                <p className="text-sm">Select a field on the canvas to edit its properties.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>


        </div>
    );
};
