import React, { useState, useEffect } from 'react';
import { Plus, FileText, Pencil, Trash2, Eye } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';
import { DocItem } from './DocumentComponents';
import { DocumentEditor } from './DocumentEditor';
import { DocumentSigner } from './DocumentSigner';
import { DocumentPreview } from './DocumentPreview';

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
    switch (status) {
        case 'draft':
            return (
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-zinc-100 dark:bg-white/5 text-zinc-600 dark:text-zinc-400 rounded-full text-[10px] font-bold uppercase tracking-wider border border-zinc-200 dark:border-white/10">
                    <div className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
                    Draft
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
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 rounded-full text-[10px] font-bold uppercase tracking-wider border border-emerald-200 dark:border-emerald-500/20">
                    Signed
                </div>
            );
        default: return null;
    }
};

export const VendorDocuments: React.FC = () => {
    const { user } = useAuth();
    const [view, setView] = useState<'list' | 'create' | 'signing' | 'preview'>('list');
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
        // Ensure we select recipient_id to join with profiles if needed, or stick to 'recipient' field if that's where meaningful text is.
        // Actually the current code uses doc.recipient. If that's empty, maybe we rely on recipient_name?
        // Let's modify the query to be robust. 
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
        if (doc.status === 'sent' || doc.status === 'completed') {
            setView('preview');
        } else if (doc.status === 'draft') {
            setView('create');
        } else {
            // Fallback
            setView('create');
        }
    };

    const handleDeleteDoc = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm('Are you sure you want to delete?')) return;

        const { error } = await supabase.from('documents').delete().eq('id', id);
        if (!error) {
            setDocs(docs.filter(d => d.id !== id));
        }
    };

    if (view === 'create') {
        return (
            <DocumentEditor
                onBack={() => {
                    setView('list');
                    fetchDocuments();
                }}
                initialDoc={selectedDoc}
                onStartSigning={(docId) => {
                    // Update the local doc state if needed, or re-fetch?
                    // Ideally we have the doc object.
                    // If we just saved it, our selectedDoc might be stale if it was new.
                    // But onStartSigning is called after save.
                    // We can re-fetch strictly or just use the id.
                    fetchDocuments().then(() => {
                        const updatedDoc = docs.find(d => d.id === docId) || selectedDoc;
                        // Wait, fetchDocuments updates 'docs' state asynchronously.
                        // simpler: Just set view to signing. selectedDoc might need refresh.
                        // We will rely on DocumentSigner fetching or passing correct data.
                        // Actually DocumentSigner takes 'initialDoc'. We need the fresh one with 'recipient'.

                        // Let's fetch the single doc to be safe.
                        supabase.from('documents').select('*').eq('id', docId).single().then(({ data }) => {
                            if (data) {
                                setSelectedDoc(data);
                                setView('signing');
                            }
                        });
                    });
                }}
            />
        );
    }

    if (view === 'signing' && selectedDoc) {
        return (
            <DocumentSigner
                initialDoc={selectedDoc}
                onBack={() => {
                    setView('list');
                    fetchDocuments();
                }}
                onSigningComplete={() => {
                    setView('list');
                    fetchDocuments();
                }}
                currentUserRole="business"
            />
        );
    }

    if (view === 'preview' && selectedDoc) {
        return (
            <DocumentPreview
                doc={selectedDoc}
                onClose={() => {
                    setView('list');
                    fetchDocuments();
                }}
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
                                    // Update styling to indicate clickable again for sent/completed
                                    className={`group transition-colors cursor-pointer hover:bg-zinc-50 dark:hover:bg-white/5`}
                                >
                                    <td className="px-8 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                                                <FileText size={18} />
                                            </div>
                                            <span className="font-medium text-zinc-900 dark:text-white group-hover:underline decoration-zinc-400/50 underline-offset-4">{doc.title}</span>
                                        </div>
                                    </td>
                                    {/* Issue 1 Fix: Use recipient_name fallback */}
                                    <td className="px-8 py-4 text-zinc-600 dark:text-zinc-400 text-sm cursor-default">{doc.recipient || doc.recipient_name || '-'}</td>
                                    <td className="px-8 py-4 cursor-default">
                                        <StatusBadge status={doc.status} />
                                    </td>
                                    {/* Issue 2 Fix: Use created_at */}
                                    <td className="px-8 py-4 text-zinc-500 text-sm cursor-default">
                                        {doc.created_at ? new Date(doc.created_at).toLocaleDateString() : '-'}
                                    </td>
                                    <td className="px-8 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {doc.status === 'draft' ? (
                                                <>
                                                    <button onClick={(e) => { e.stopPropagation(); handleOpenDoc(doc); }} className="p-2 text-zinc-400 hover:text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors"><Pencil size={16} /></button>
                                                    <button onClick={(e) => handleDeleteDoc(doc.id, e)} className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"><Trash2 size={16} /></button>
                                                </>
                                            ) : (
                                                <button onClick={(e) => { e.stopPropagation(); handleOpenDoc(doc); }} className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"><Eye size={16} /></button>
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
