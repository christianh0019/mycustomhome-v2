import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, CheckCircle2, PenTool, CheckSquare, Calendar, FileText, Type, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

import { DocItem, DraggableField, DroppableCanvas, DraggableFieldOnCanvas } from './DocumentComponents';
import { RichTextEditor } from './DocumentEditor';
import { SignaturePadModal } from './SignaturePadModal';
import { InputModal } from './InputModal';
import { auditService } from '../services/AuditService';

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
    const [numPages, setNumPages] = useState<number>(initialDoc.metadata?.numPages || 1);
    const [pageContent, setPageContent] = useState<{ [page: number]: string }>(initialDoc.metadata?.content || {});
    const [fields, setFields] = useState<DraggableField[]>(
        Array.isArray(initialDoc.metadata)
            ? initialDoc.metadata
            : (initialDoc.metadata?.fields || [])
    );
    const [activeSigningFieldId, setActiveSigningFieldId] = useState<string | null>(null);
    const [isSignaturePadOpen, setIsSignaturePadOpen] = useState(false);
    const [saving, setSaving] = useState(false);

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

    const fileType = initialDoc.metadata?.type || (
        initialDoc.file_url
            ? (initialDoc.file_url.toLowerCase().includes('.pdf') ? 'pdf' : 'image')
            : (initialDoc.metadata?.type || 'image') // Default fallback
    );

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

        if (field.type === 'signature') {
            setIsSignaturePadOpen(true);
        } else if (field.type === 'checkbox') {
            // Toggle Checkbox
            updateFieldValue(field.id, field.value === 'checked' ? '' : 'checked');
        } else {
            // Open Input Modal for text/date/initials
            setInputModalState({
                isOpen: true,
                fieldId: field.id,
                label: field.type === 'initials' ? 'Enter Initials' : field.label,
                value: field.value || '',
                type: field.type === 'date' ? 'date' : 'text'
            });
        }
    };

    // Log 'viewed_by_client' on mount
    useEffect(() => {
        if (currentUserRole === 'contact') {
            auditService.logAction(initialDoc.id, 'viewed_by_client', user?.id);
        }
    }, [currentUserRole, initialDoc.id]);

    const handleSaveForLater = async () => {
        setSaving(true);
        try {
            const updates = {
                metadata: {
                    fields,
                    content: pageContent,
                    type: fileType,
                    numPages
                }
            };
            const { error } = await supabase.from('documents').update(updates).eq('id', initialDoc.id);
            if (error) throw error;
            alert('Progress saved!');
        } catch (err) {
            console.error(err);
            alert('Failed to save progress.');
        } finally {
            setSaving(false);
        }
    };

    const handleFinish = async () => {
        if (!isComplete) return;
        setSaving(true);

        // 1. Fetch IP & Location (Moved to top level)
        let ipData = { ip: 'Unknown', city: 'Unknown', region: 'Unknown', country: 'Unknown' };
        try {
            const response = await fetch('https://ipapi.co/json/');
            if (response.ok) {
                const data = await response.json();
                ipData = {
                    ip: data.ip,
                    city: data.city,
                    region: data.region,
                    country: data.country_name
                };
            }
        } catch (ipError) {
            console.warn('Failed to fetch IP:', ipError);
        }

        const updates: any = {
            metadata: {
                fields,
                content: pageContent,
                type: fileType,
                numPages
            }
        };

        let nextStatus = initialDoc.status;
        let auditAction: 'signed_by_business' | 'signed_by_client' | null = null;

        if (currentUserRole === 'business') {
            nextStatus = 'sent';
            auditAction = 'signed_by_business';
        } else if (currentUserRole === 'contact') {
            nextStatus = 'completed';
            auditAction = 'signed_by_client';
        }

        if (nextStatus) updates.status = nextStatus;

        try {
            const { error: updateError } = await supabase.from('documents').update(updates).eq('id', initialDoc.id);
            if (updateError) throw updateError;

            if (auditAction) {
                // Modified to include IP data immediately for the generic action log
                await auditService.logAction(initialDoc.id, auditAction, user?.id, {
                    ip_address: ipData.ip,
                    location: `${ipData.city}, ${ipData.region}`
                });
            }

            if (currentUserRole === 'business' && nextStatus === 'sent') {
                if (initialDoc.recipient_name || initialDoc.recipient) {
                    const recipientName = initialDoc.recipient_name || initialDoc.recipient;

                    // Fetch matches to find the correct homeowner
                    const { data: matches } = await supabase
                        .from('matches')
                        .select('id, homeowner_id, homeowner:profiles!homeowner_id(full_name)')
                        .eq('vendor_id', user?.id);

                    // Find match where homeowner name equals recipient name
                    const targetMatch = matches?.find((m: any) => m.homeowner?.full_name === recipientName);

                    if (targetMatch) {
                        // Update document with recipient_id for RLS access
                        await supabase
                            .from('documents')
                            .update({ recipient_id: targetMatch.homeowner_id })
                            .eq('id', initialDoc.id);

                        await supabase.from('messages').insert({
                            thread_id: targetMatch.id, // Using match_id as thread_id
                            sender_id: user?.id,
                            type: 'signature_request',
                            text: `Please sign the document: ${initialDoc.title}`,
                            metadata: { documentId: initialDoc.id, documentTitle: initialDoc.title, status: 'pending' }
                        });

                        // Log with IP
                        await auditService.logAction(initialDoc.id, 'sent', user?.id, {
                            recipient_match_id: targetMatch.id,
                            ip_address: ipData.ip,
                            location: `${ipData.city}, ${ipData.region}`
                        });

                        // Also explicitly log 'signed_by_business' with IP if they signed it 
                        // (Though we logged it above in the generic check, we ensure it has details there too now)
                    } else {
                        console.warn('No matching homeowner found for recipient:', recipientName);
                        // Optional: show toast "Document saved, but could not find chat thread for [Name]"
                    }
                }
            } else if (currentUserRole === 'contact' && nextStatus === 'completed') {
                try {
                    // IP fetch moved to top

                    const { PDFService } = await import('../services/PDFService');
                    let pdfBytes: Uint8Array;
                    let imagePages: any[] = [];

                    // 2. Generate Base PDF
                    if (fileType === 'pdf') {
                        pdfBytes = await PDFService.generateSignedPDF(initialDoc, fields);
                    } else {
                        const html2canvas = (await import('html2canvas')).default;

                        for (let i = 1; i <= numPages; i++) {
                            const params: any = {
                                scale: 2,
                                useCORS: true,
                                logging: false,
                                scrollY: 0,
                                windowWidth: 1200,
                                backgroundColor: '#ffffff'
                            };
                            const el = document.getElementById(`page-${i}`);
                            if (el) {
                                const canvas = await html2canvas(el, params);
                                imagePages.push({
                                    dataUrl: canvas.toDataURL('image/png'),
                                    width: 595,
                                    height: 842
                                });
                            }
                        }

                        pdfBytes = await PDFService.generateFromImages(imagePages);
                    }

                    // 3. Append Signature Certificate
                    // Fetch audit logs
                    const { data: auditLogs } = await supabase
                        .from('document_audit_logs')
                        .select('*')
                        .eq('document_id', initialDoc.id)
                        .order('created_at', { ascending: true });

                    const signedAt = new Date().toISOString();
                    const businessLog = auditLogs?.find(l => l.action === 'signed_by_business');

                    // Fetch Vendor Profile for Business Name
                    let vendorName = 'Business Owner';
                    let vendorEmail = '';
                    if (initialDoc.vendor_id) {
                        const { data: vendorProfile } = await supabase
                            .from('profiles')
                            .select('full_name, email') // Try to fetch email if exposed
                            .eq('id', initialDoc.vendor_id)
                            .single();

                        if (vendorProfile?.full_name) vendorName = vendorProfile.full_name;
                        if (vendorProfile?.email) vendorEmail = vendorProfile.email;
                        else if (initialDoc.sender_email) vendorEmail = initialDoc.sender_email;
                    }

                    // To get Vendor Email, strictly we can't from client unless it's in metadata or public profile
                    // We will leave it empty or checking if we can get it from initialDoc (often no)

                    // Certificate Data

                    // Fetch Homeowner Profile (for Name)
                    let homeownerName = user?.user_metadata?.full_name;
                    if (!homeownerName) {
                        const { data: userProfile } = await supabase
                            .from('profiles')
                            .select('full_name') // Homeowner profile
                            .eq('id', user?.id)
                            .single();
                        if (userProfile?.full_name) homeownerName = userProfile.full_name;
                        else homeownerName = 'Homeowner';
                    }

                    const certificateData = {
                        referenceNumber: initialDoc.id.toUpperCase(),
                        sentAt: auditLogs?.find(l => l.action === 'sent')?.created_at || new Date().toISOString(),
                        completedAt: signedAt,
                        signers: [
                            {
                                name: homeownerName,
                                email: user?.email || '',
                                role: 'Homeowner',
                                ip: ipData.ip,
                                location: `${ipData.city}, ${ipData.region}`,
                                viewedAt: auditLogs?.find(l => l.action === 'viewed_by_client')?.created_at || new Date().toISOString(),
                                signedAt: signedAt,
                                signatureImage: fields.find(f => f.assignee === 'contact' && f.type === 'signature')?.value
                            },
                            {
                                name: vendorName,
                                email: vendorEmail,
                                role: 'Business Owner',
                                ip: businessLog?.details?.ip || businessLog?.details?.ip_address || 'Unavailable (Sent prior to update)',
                                location: businessLog?.details?.location || 'Unavailable',
                                viewedAt: businessLog?.created_at || auditLogs?.find(l => l.action === 'sent')?.created_at || new Date().toISOString(),
                                signedAt: businessLog?.created_at || auditLogs?.find(l => l.action === 'sent')?.created_at || new Date().toISOString(),
                                signatureImage: fields.find(f => f.assignee === 'business' && f.type === 'signature')?.value
                            }
                        ]
                    };

                    const finalPdfBytes = await PDFService.appendCertificate(pdfBytes, certificateData);

                    const blob = new Blob([finalPdfBytes], { type: 'application/pdf' });
                    const fileName = `${initialDoc.title.replace(/\s/g, '_')}_signed.pdf`;
                    const filePath = `${user?.id}/${Date.now()}_${fileName}`;

                    // Upload to Vault Storage
                    const { error: uploadError } = await supabase.storage.from('vault').upload(filePath, blob);
                    if (uploadError) throw uploadError;

                    // Create Vault Item Record
                    await supabase.from('vault_items').insert({
                        user_id: user?.id,
                        file_path: filePath,
                        original_name: fileName,
                        smart_name: initialDoc.title,
                        category: 'Contracts',
                        status: 'ready',
                        summary: 'Signed Contract via My Home Custom.'
                    });

                    await auditService.logAction(initialDoc.id, 'completed', user?.id, {
                        vault_path: filePath,
                        ip_address: ipData.ip,
                        location: `${ipData.city}, ${ipData.region}`
                    });
                } catch (vaultError: any) {
                    console.error('Failed to save to Safe Box:', vaultError);
                    alert(`Document signed, but failed to save copy to Safe Box. Error: ${vaultError?.message || vaultError}`);
                }
            }

            onSigningComplete(initialDoc.id);
        } catch (err) {
            console.error(err);
            alert('Failed to sign and save document.');
        } finally {
            setSaving(false);
        }
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
                    onSave={(signatureData) => {
                        updateFieldValue(activeSigningFieldId, signatureData);
                        setIsSignaturePadOpen(false);
                        setActiveSigningFieldId(null);
                    }}
                />
            )}

            {/* Header */}
            <div className="h-16 bg-white dark:bg-[#0A0A0A] border-b border-zinc-200 dark:border-white/10 flex items-center justify-between px-6 shrink-0 shadow-sm z-30">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} disabled={saving} className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 flex items-center justify-center transition-colors disabled:opacity-50">
                        <ChevronLeft size={18} className="text-zinc-600 dark:text-zinc-400" />
                    </button>
                    <div>
                        <h1 className="text-lg font-bold text-zinc-900 dark:text-white">{initialDoc.title}</h1>
                        <p className="text-xs text-zinc-500">
                            {currentUserRole === 'contact' ? 'Please review and sign below.' : 'Business Owner View'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="hidden md:flex flex-col items-end">
                        <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">{completedFields.length}/{requiredFields.length} Fields Completed</span>
                        <div className="w-32 h-1 bg-zinc-200 dark:bg-white/10 rounded-full mt-1 overflow-hidden">
                            <div className="h-full bg-indigo-500 transition-all duration-500" style={{ width: `${progress}%` }} />
                        </div>
                    </div>

                    {currentUserRole === 'contact' && (
                        <button
                            onClick={handleSaveForLater}
                            disabled={saving}
                            className="px-4 py-2 rounded-lg text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors"
                        >
                            Save for Later
                        </button>
                    )}

                    <button
                        onClick={handleFinish}
                        disabled={!isComplete || saving}
                        className={`px-6 py-2 rounded-lg text-sm font-bold shadow-lg transition-all flex items-center gap-2 ${isComplete
                            ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/20 animate-pulse'
                            : 'bg-zinc-200 dark:bg-white/5 text-zinc-400 cursor-not-allowed'
                            }`}
                    >
                        {saving ? (
                            <span>Saving...</span>
                        ) : (
                            <>
                                <CheckCircle2 size={18} />
                                {currentUserRole === 'business' ? 'Sign & Send to Client' : 'Sign & Complete'}
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-auto relative flex justify-center p-8 bg-zinc-100 dark:bg-[#050505]">
                <div className="flex flex-col gap-8 pb-32">
                    {Array.from({ length: numPages }).map((_, i) => {
                        const pageNum = i + 1;
                        return (
                            <div
                                key={pageNum}
                                id={`page-${pageNum}`}
                                className="bg-white dark:bg-white shadow-2xl relative transition-transform duration-300"
                                style={{ width: '595px', height: '842px', minHeight: '842px' }}
                            >
                                {/* Document Layer */}
                                <div className="absolute inset-0 z-0 pointer-events-none">
                                    {(fileType === 'pdf' && initialDoc.file_url) ? (
                                        <Document file={initialDoc.file_url} onLoadSuccess={({ numPages }) => setNumPages(numPages)}>
                                            <Page pageNumber={pageNum} width={595} renderTextLayer={false} renderAnnotationLayer={false} />
                                        </Document>
                                    ) : (fileType === 'template' || fileType === 'blank') ? (
                                        <RichTextEditor
                                            content={pageContent[pageNum] || ''}
                                            onChange={() => { }}
                                            readOnly={true}
                                        />
                                    ) : (
                                        pageNum === 1 ? <img src={initialDoc.file_url || ''} className="w-full h-full object-contain" /> : null
                                    )}
                                </div>

                                {/* Interactive Layer */}
                                <div className="absolute inset-0 z-10">
                                    {fields.filter(f => (f.pageNumber === pageNum) || (!f.pageNumber && pageNum === 1)).map(field => (
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
                        );
                    })}
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
