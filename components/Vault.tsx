import React, { useState, useEffect, useRef } from 'react';
import {
  Shield, Upload, FileText, Image as ImageIcon, Lock,
  MoreVertical, Trash2, Download, Search, HardDrive,
  Sparkles, Eye, FileCheck, BrainCircuit
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';
import { PilotService } from '../services/PilotService';
import { VaultItem } from '../types';

const CATEGORIES = [
  { id: 'all', name: 'All Files' },
  { id: 'Contracts', name: 'Contracts' },
  { id: 'Plans & Drawings', name: 'Plans & Drawings' },
  { id: 'Financials', name: 'Financials' },
];

export const Vault: React.FC = () => {
  const { user } = useAuth();
  const [files, setFiles] = useState<VaultItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedFile, setSelectedFile] = useState<VaultItem | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      fetchFiles();
    }
  }, [user]);

  const fetchFiles = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Fetch from Metadata table, not raw storage
      const { data, error } = await supabase
        .from('vault_items')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching vault items:', error);
      } else {
        setFiles(data as VaultItem[]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement> | DragEvent) => {
    if (!user) return;
    let file: File | null = null;

    if ('target' in event && (event.target as HTMLInputElement).files) {
      file = (event.target as HTMLInputElement).files?.[0] || null;
    } else if ('dataTransfer' in event && (event as any).dataTransfer.files) {
      file = (event as any).dataTransfer.files?.[0] || null;
    }

    if (!file) return;

    setUploading(true);
    try {
      const fileName = `${Date.now()}_${file.name.replace(/\s/g, '_')}`;
      const filePath = `${user.id}/${fileName}`;
      const fileType = file.type;

      // 1. Upload Blob
      const { error: uploadError } = await supabase.storage
        .from('vault')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Trigger AI Analysis (Async)
      // We await it here for UI smoothness or we can fire-and-forget
      // Let's await the *init* so we see the spinner, then re-fetch
      await PilotService.analyzeDocument(user.id, filePath, file.name, fileType);

      // Refresh list
      await fetchFiles();
    } catch (error) {
      alert('Error uploading file: ' + (error as Error).message);
    } finally {
      setUploading(false);
      setDragActive(false);
    }
  };

  // Drag handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handleUpload(e as unknown as DragEvent);
  };

  const handleDownload = async (file: VaultItem) => {
    try {
      const { data, error } = await supabase.storage
        .from('vault')
        .download(file.file_path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.smart_name || file.original_name;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error downloading:', err);
    }
  };

  const handleDelete = async (file: VaultItem) => {
    if (!window.confirm('Are you sure you want to delete this file?')) return;
    try {
      // 1. Delete Blob
      await supabase.storage.from('vault').remove([file.file_path]);
      // 2. Delete Meta
      await supabase.from('vault_items').delete().eq('id', file.id);

      await fetchFiles();
      setSelectedFile(null);
    } catch (err) {
      console.error('Error deleting:', err);
    }
  };

  const sortedFiles = activeCategory === 'all'
    ? files
    : files.filter(f => f.category === activeCategory);

  return (
    <div className="p-6 md:p-12 lg:p-12 max-w-7xl mx-auto w-full min-h-screen text-zinc-100 pb-32">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
        <div className="space-y-3">
          <h2 className="text-4xl md:text-5xl font-serif tracking-tighter">The Safe Box</h2>
          <div className="h-[1px] w-12 bg-white/30"></div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">AI-Indexed Secure Storage</p>
        </div>

        <div className="flex gap-4">
          <div className="bg-[#0A0A0A] border border-white/10 px-6 py-3 rounded-2xl flex items-center gap-4">
            <BrainCircuit size={16} className="text-emerald-500 animate-pulse" />
            <div className="flex flex-col text-right">
              <span className="text-[9px] uppercase tracking-widest text-zinc-500">AI Status</span>
              <span className="text-xs font-bold text-white flex items-center gap-2 justify-end">
                Active & Monitoring
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

        {/* Left: Upload Zone */}
        <div className="lg:col-span-4 space-y-8">
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`relative h-[300px] rounded-3xl border-2 border-dashed modern-transition flex flex-col items-center justify-center p-8 text-center cursor-pointer group bg-[#0A0A0A] overflow-hidden
                            ${dragActive ? 'border-emerald-500 bg-emerald-900/10' : 'border-white/10 hover:border-white/20'}`}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleUpload}
            />

            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className={`w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6 modern-transition ${uploading ? 'animate-pulse' : 'group-hover:scale-110'}`}>
              {uploading ? (
                <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <Upload size={32} className="text-zinc-400 group-hover:text-white" />
              )}
            </div>

            <h3 className="text-xl font-serif text-white mb-2 relative z-10">
              {uploading ? 'Encrypting & Analyzing...' : 'Secure Upload'}
            </h3>
            <p className="text-xs text-zinc-500 max-w-[200px] relative z-10">
              Drag files here. AI will scan, categorize, and rename them automatically.
            </p>

            <div className="mt-8 flex items-center gap-2 text-[9px] uppercase tracking-widest text-zinc-600 bg-black/50 px-3 py-1 rounded-full border border-white/5 relative z-10">
              <Sparkles size={10} className="text-emerald-500" />
              Auto-Organize On
            </div>
          </div>
        </div>

        {/* Right: Smart Grid */}
        <div className="lg:col-span-8">
          {/* Filter Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-6 mb-2 no-scrollbar">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-full text-[10px] uppercase tracking-widest transition-all whitespace-nowrap border ${activeCategory === cat.id
                    ? 'bg-white text-black border-white font-bold'
                    : 'bg-transparent text-zinc-500 border-transparent hover:bg-white/5'
                  }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          <div className="bg-[#0A0A0A] border border-white/5 rounded-3xl overflow-hidden min-h-[400px]">
            {loading ? (
              <div className="w-full h-[400px] flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              </div>
            ) : sortedFiles.length === 0 ? (
              <div className="w-full h-[400px] flex flex-col items-center justify-center text-zinc-600 p-8 text-center">
                <Search size={24} className="opacity-50 mb-4" />
                <p className="text-sm font-serif mb-1 text-zinc-400">Vault Empty</p>
                <p className="text-xs">Uploaded files will be auto-categorized here.</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {sortedFiles.map((file) => (
                  <div
                    key={file.id}
                    onClick={() => setSelectedFile(file)}
                    className="p-5 flex items-center justify-between group hover:bg-white/[0.02] transition-colors relative cursor-pointer"
                  >
                    <div className="flex items-center gap-5 min-w-0">
                      <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform border border-white/5">
                        {file.status === 'analyzing' ? (
                          <Sparkles size={18} className="text-emerald-500 animate-pulse" />
                        ) : (
                          <FileCheck size={18} className="text-blue-400" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-medium text-white truncate pr-4 flex items-center gap-2">
                          {file.smart_name || file.original_name}
                          {file.status === 'analyzing' && <span className="text-[9px] text-emerald-500 uppercase tracking-widest animate-pulse">• Analyzing</span>}
                        </h4>
                        <div className="flex items-center gap-3 text-[10px] uppercase tracking-wider text-zinc-500 mt-1">
                          <span>{file.category}</span>
                          <span className="w-1 h-1 rounded-full bg-zinc-700" />
                          <span>{new Date(file.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button className="p-2 rounded-lg hover:border border-transparent hover:border-white/10 text-zinc-600 hover:text-white transition-all">
                        <Eye size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* FILE DETAIL MODAL */}
      {selectedFile && (
        <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-300" onClick={() => setSelectedFile(null)}>
          <div className="w-full max-w-2xl bg-[#111] border border-white/10 rounded-2xl overflow-hidden relative shadow-2xl animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>

            <div className="p-8 border-b border-white/5 bg-gradient-to-r from-emerald-900/10 to-transparent">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20">
                    <FileCheck size={20} />
                  </div>
                  <div>
                    <h3 className="text-xl font-serif text-white">{selectedFile.smart_name || selectedFile.original_name}</h3>
                    <p className="text-[10px] uppercase tracking-widest text-emerald-400">Verified & Indexed</p>
                  </div>
                </div>
                <button onClick={() => setSelectedFile(null)} className="text-white/40 hover:text-white">✕</button>
              </div>
            </div>

            <div className="p-8 space-y-8">
              <div>
                <h4 className="text-[10px] uppercase tracking-widest text-zinc-500 mb-3 flex items-center gap-2">
                  <Sparkles size={12} className="text-purple-400" /> AI Executive Summary
                </h4>
                <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                  <p className="text-sm text-zinc-300 leading-relaxed">
                    {selectedFile.status === 'analyzing'
                      ? <span className="animate-pulse">AI is currently processing this document to extract key insights...</span>
                      : selectedFile.summary || "No summary available."}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[9px] uppercase tracking-widest text-zinc-600 mb-1">Category</p>
                  <p className="text-sm text-white">{selectedFile.category}</p>
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-widest text-zinc-600 mb-1">Original Name</p>
                  <p className="text-sm text-zinc-400 truncate">{selectedFile.original_name}</p>
                </div>
              </div>

              <div className="flex gap-4 pt-4 border-t border-white/5">
                <button
                  onClick={() => handleDownload(selectedFile)}
                  className="flex-1 py-3 bg-white text-black font-bold text-xs uppercase tracking-widest rounded hover:bg-white/90 flex items-center justify-center gap-2"
                >
                  <Download size={14} /> Download
                </button>
                <button
                  onClick={() => handleDelete(selectedFile)}
                  className="px-6 py-3 border border-red-500/20 hover:bg-red-500/10 text-red-400 text-xs uppercase tracking-widest rounded transition-colors flex items-center gap-2"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
