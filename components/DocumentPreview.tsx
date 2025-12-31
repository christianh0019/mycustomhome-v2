import React, { useState, useEffect } from 'react';
import { ArrowLeft, Download, X } from 'lucide-react';
import { DocItem, DraggableField, DroppableCanvas, DraggableFieldOnCanvas } from './DocumentComponents';
import { Document, Page, pdfjs } from 'react-pdf';
import { PDFService } from '../services/PDFService';
import html2canvas from 'html2canvas';

// Ensure PDF worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface DocumentPreviewProps {
    doc: DocItem;
    onClose: () => void;
}

export const DocumentPreview: React.FC<DocumentPreviewProps> = ({ doc, onClose }) => {
    const [numPages, setNumPages] = useState<number>(doc.metadata?.numPages || 1);
    const [pageContent, setPageContent] = useState<{ [page: number]: string }>(doc.metadata?.content || {});
    const [fields, setFields] = useState<DraggableField[]>(
        Array.isArray(doc.metadata) ? doc.metadata : (doc.metadata?.fields || [])
    );
    const [layoutMode, setLayoutMode] = useState<'pdf' | 'rich'>('rich');

    useEffect(() => {
        // Determine layout mode
        const fileType = doc.metadata?.type || (doc.file_url?.toLowerCase().includes('.pdf') ? 'pdf' : 'image');
        setLayoutMode(fileType === 'pdf' ? 'pdf' : 'rich');

        if (doc.metadata?.numPages) setNumPages(doc.metadata.numPages);
        if (doc.metadata?.content) setPageContent(doc.metadata.content);
        if (doc.metadata?.fields) setFields(doc.metadata.fields);
    }, [doc]);

    const handleDownload = async () => {
        // Logic similar to DocumentSigner handleFinish but purely for download
        // If it's a PDF type
        if (layoutMode === 'pdf' && doc.file_url) {
            // If we have signed fields, we might want to flatten them into the PDF like we do for Vault.
            // Ideally we should check if there is a 'vault_items' entry with the final PDF?
            // But for now, regenerating it client side is a good fallback.
            if (fields.length > 0) {
                const pdfBytes = await PDFService.generateSignedPDF(doc, fields);
                const blob = new Blob([pdfBytes], { type: 'application/pdf' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${doc.title}_preview.pdf`;
                a.click();
            } else {
                // Just download original
                window.open(doc.file_url, '_blank');
            }
        } else {
            // Rich Text / Image
            const imagePages = [];
            for (let i = 1; i <= numPages; i++) {
                const el = document.getElementById(`preview-page-${i}`);
                if (el) {
                    const canvas = await html2canvas(el, {
                        scale: 2,
                        useCORS: true,
                        logging: false,
                        backgroundColor: '#ffffff'
                    });
                    imagePages.push({
                        dataUrl: canvas.toDataURL('image/png'),
                        width: 595,
                        height: 842
                    });
                }
            }
            if (imagePages.length > 0) {
                const pdfBytes = await PDFService.generateFromImages(imagePages);
                const blob = new Blob([pdfBytes], { type: 'application/pdf' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${doc.title}_preview.pdf`;
                a.click();
            }
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-[#F2F4F7] dark:bg-[#0A0A0A] flex flex-col">
            {/* Header */}
            <div className="h-16 px-6 bg-white dark:bg-[#0A0A0A] border-b border-zinc-200 dark:border-white/10 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                    <button onClick={onClose} className="p-2 hover:bg-zinc-100 dark:hover:bg-white/10 rounded-lg text-zinc-500">
                        <X size={20} />
                    </button>
                    <div>
                        <h1 className="font-semibold text-zinc-900 dark:text-white">{doc.title}</h1>
                        <p className="text-xs text-zinc-500 uppercase tracking-wider font-medium">{doc.status}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleDownload}
                        className="px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
                    >
                        <Download size={18} />
                        Download PDF
                    </button>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/10 rounded-lg font-medium transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>

            {/* Preview Canvas */}
            <div className="flex-1 overflow-y-auto p-8 flex justify-center bg-zinc-100 dark:bg-[#0A0A0A]">
                <div className="flex flex-col gap-8">
                    {Array.from({ length: numPages }).map((_, i) => {
                        const pageNum = i + 1;
                        // Filter fields for this page
                        const pageFields = fields.filter(f => (f.pageNumber || 1) === pageNum);

                        return (
                            <div key={pageNum} id={`preview-page-${pageNum}`} className="relative shadow-xl">
                                <DroppableCanvas
                                    onDrop={() => { }} // No-op
                                    onCanvasDrop={() => { }} // No-op
                                >
                                    {/* Background Content */}
                                    <div
                                        className="w-[595px] h-[842px] bg-white relative"
                                        style={{ pointerEvents: 'none' }} // Disable interaction base
                                    >
                                        {layoutMode === 'pdf' && doc.file_url ? (
                                            <Document file={doc.file_url} loading={<div className="h-[842px] flex items-center justify-center text-zinc-400">Loading PDF...</div>}>
                                                <Page pageNumber={pageNum} width={595} renderAnnotationLayer={false} renderTextLayer={false} />
                                            </Document>
                                        ) : (
                                            <div
                                                className="w-full h-full p-12 prose max-w-none"
                                                dangerouslySetInnerHTML={{ __html: pageContent[pageNum] || '' }}
                                            />
                                        )}

                                        {/* Fields Overlay - Read Only */}
                                        {pageFields.map(field => (
                                            <div
                                                key={field.id}
                                                className="absolute"
                                                style={{ left: 0, top: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
                                            >
                                                <DraggableFieldOnCanvas
                                                    field={field}
                                                    isSelected={false}
                                                    onSelect={() => { }}
                                                    onUpdatePos={() => { }}
                                                    onUpdateValue={() => { }}
                                                    onDelete={() => { }}
                                                    isReadOnly={true}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </DroppableCanvas>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
