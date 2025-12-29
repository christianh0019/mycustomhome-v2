import React, { useState } from 'react';
import {
    FileText, Plus, Search, MoreVertical,
    PenTool, Type, Calendar, CheckSquare,
    Users, Send, ChevronLeft, Save, GripVertical, Settings
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

type DocumentStatus = 'draft' | 'sent' | 'completed';

interface Document {
    id: string;
    title: string;
    recipient: string;
    date: string;
    status: DocumentStatus;
}

export const VendorDocuments: React.FC = () => {
    const [view, setView] = useState<'list' | 'create'>('list');
    const [docs, setDocs] = useState<Document[]>([
        { id: '1', title: 'Miller Residence - Contract', recipient: 'Christian Hostetler', date: '2 days ago', status: 'sent' },
        { id: '2', title: 'Change Order #4', recipient: 'Christian Hostetler', date: '1 week ago', status: 'completed' },
        { id: '3', title: 'Subcontractor Agreement', recipient: '-', date: '2 weeks ago', status: 'draft' },
    ]);

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
    const [docTitle, setDocTitle] = useState('Untitled Document');

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
                    <button className="px-4 py-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                        <Save size={14} /> Save
                    </button>
                    <button
                        onClick={() => alert("Simulated: Envelope sent to recipients!")}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-colors shadow-lg shadow-blue-500/20"
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
                            <ToolButton icon={PenTool} label="Signature" color="text-blue-500" />
                            <ToolButton icon={Type} label="Initials" />
                            <ToolButton icon={Calendar} label="Date Signed" />
                            <ToolButton icon={Type} label="Text Box" />
                            <ToolButton icon={CheckSquare} label="Checkbox" />
                        </div>
                    </div>
                </div>

                {/* Main Canvas */}
                <div className="flex-1 bg-zinc-100 dark:bg-[#050505] overflow-auto p-12 flex justify-center relative">
                    {/* Simulated Paper */}
                    <div className="w-[8.5in] min-h-[11in] bg-white text-black shadow-2xl relative p-12 flex flex-col gap-8">
                        {/* Placeholder Content */}
                        <div className="flex justify-between items-start border-b-2 border-black pb-8">
                            <div>
                                <h1 className="text-3xl font-serif font-bold mb-2">Construction Agreement</h1>
                                <p className="font-mono text-sm opacity-60">REF: MCH-2024-001</p>
                            </div>
                            <div className="text-right">
                                <h2 className="font-bold text-xl mb-1">CONTRACTOR</h2>
                                <p className="text-sm">Precision Builders, LLC</p>
                            </div>
                        </div>

                        <div className="space-y-4 font-serif text-sm leading-relaxed opacity-80">
                            {[1, 2, 3, 4, 5].map(i => (
                                <p key={i} className="text-justify">
                                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duic aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
                                </p>
                            ))}
                        </div>

                        {/* Drop Zone Simulation */}
                        <div className="mt-12 border-2 border-dashed border-blue-200 bg-blue-50/50 rounded-xl p-8 flex items-center justify-center text-blue-400">
                            <div className="text-center">
                                <p className="font-bold uppercase tracking-widest text-xs mb-2">Signature Zone</p>
                                <p className="text-xs opacity-70">Drag signature field here</p>
                            </div>
                        </div>
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
                                <input className="w-full bg-white dark:bg-black/20 border border-zinc-200 dark:border-white/10 rounded px-2 py-1 text-xs mb-2" value="Christian Hostetler" readOnly />
                                <input className="w-full bg-white dark:bg-black/20 border border-zinc-200 dark:border-white/10 rounded px-2 py-1 text-xs" value="client@example.com" readOnly />
                            </div>

                            <button className="w-full py-3 border border-dashed border-zinc-300 dark:border-white/20 rounded-xl text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:border-zinc-400 dark:hover:border-white/40 transition-colors uppercase tracking-widest font-bold">
                                + Add Recipient
                            </button>
                        </div>
                    </div>

                    <div className="mt-auto p-6 border-t border-zinc-200 dark:border-white/5">
                        <button className="w-full flex items-center justify-between text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">
                            <span className="flex items-center gap-2"><Settings size={12} /> Advanced Options</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ToolButton: React.FC<{ icon: React.ElementType, label: string, color?: string }> = ({ icon: Icon, label, color }) => (
    <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-zinc-50 dark:hover:bg-white/5 cursor-grab active:cursor-grabbing transition-colors group draggable">
        <Icon size={16} className={color || "text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white"} />
        <span className="text-xs font-medium text-zinc-600 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-white">{label}</span>
        <GripVertical size={12} className="ml-auto text-zinc-300 opacity-0 group-hover:opacity-100" />
    </div>
);
