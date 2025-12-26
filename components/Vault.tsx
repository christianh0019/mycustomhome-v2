import React, { useState, useEffect, useRef } from 'react';
import {
  Shield, Upload, FileText, Image as ImageIcon, Lock,
  MoreVertical, Trash2, Download, Search, HardDrive
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';

interface VaultFile {
  name: string;
  id: string; // usually path
  size: number;
  type: string;
  created_at: string;
  updated_at: string;
  metadata?: any;
}

const CATEGORIES = [
  { id: 'all', name: 'All Files' },
  { id: 'contracts', name: 'Contracts' },
  { id: 'plans', name: 'Plans & Drawings' },
  { id: 'financials', name: 'Financials' },
];

export const Vault: React.FC = () => {
  const { user } = useAuth();
  const [files, setFiles] = useState<VaultFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
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
      // List files in user's folder
      const { data, error } = await supabase
        .storage
        .from('vault')
        .list(user.id, {
          limit: 100,
          offset: 0,
          sortBy: { column: 'created_at', order: 'desc' },
        });

      if (error) {
        console.error('Error fetching vault files:', error);
      } else {
        setFiles(data || []);
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
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${file.name.replace(/\s/g, '_')}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('vault')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

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
    handleUpload(e as unknown as DragEvent); // Type casting for simplicity in this hybrid handler
  };

  const handleDownload = async (fileName: string) => {
    if (!user) return;
    try {
      const { data, error } = await supabase.storage
        .from('vault')
        .download(`${user.id}/${fileName}`);

      if (error) throw error;

      // Create blob link to download
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error downloading:', err);
    }
  };

  const handleDelete = async (fileName: string) => {
    if (!user || !window.confirm('Are you sure you want to delete this file?')) return;
    try {
      const { error } = await supabase.storage
        .from('vault')
        .remove([`${user.id}/${fileName}`]);

      if (error) throw error;
      await fetchFiles();
    } catch (err) {
      console.error('Error deleting:', err);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="p-6 md:p-12 lg:p-12 max-w-7xl mx-auto w-full min-h-screen text-zinc-100 pb-32">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
        <div className="space-y-3">
          <h2 className="text-4xl md:text-5xl font-serif tracking-tighter">The Safe Box</h2>
          <div className="h-[1px] w-12 bg-white/30"></div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">Secure Encrypted Storage</p>
        </div>

        <div className="flex gap-4">
          <div className="bg-[#0A0A0A] border border-white/10 px-6 py-3 rounded-2xl flex items-center gap-4">
            <HardDrive size={16} className="text-zinc-500" />
            <div className="flex flex-col text-right">
              <span className="text-[9px] uppercase tracking-widest text-zinc-500">Storage Used</span>
              <span className="text-xs font-bold text-white flex items-center gap-2 justify-end">
                {files.length > 0 ? formatSize(files.reduce((acc, f) => acc + (f.metadata?.size || 0), 0)) : '0 MB'}
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
              {uploading ? 'Securing File...' : 'Drop files to secure'}
            </h3>
            <p className="text-xs text-zinc-500 max-w-[200px] relative z-10">
              Drag & drop contracts, plans, drawings here.
            </p>

            <div className="mt-8 flex items-center gap-2 text-[9px] uppercase tracking-widest text-zinc-600 bg-black/50 px-3 py-1 rounded-full border border-white/5 relative z-10">
              <Lock size={10} className="text-emerald-500" />
              AES-256 Encrypted
            </div>
          </div>

          {/* Security Badge */}
          <div className="p-6 rounded-2xl bg-[#0A0A0A] border border-white/5 flex items-center gap-4">
            <div className="p-3 bg-emerald-500/10 rounded-full border border-emerald-500/20">
              <Shield size={20} className="text-emerald-500" />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-widest text-zinc-500">Vault Status</div>
              <div className="text-sm font-medium text-white">Secure & Private</div>
            </div>
          </div>
        </div>

        {/* Right: File List */}
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
            ) : files.length === 0 ? (
              <div className="w-full h-[400px] flex flex-col items-center justify-center text-zinc-600 p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                  <Search size={24} className="opacity-50" />
                </div>
                <p className="text-sm font-serif mb-1 text-zinc-400">Vault is Empty</p>
                <p className="text-xs max-w-xs">Upload important documents to keep them safe.</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {files.map((file) => (
                  <div key={file.id} className="p-5 flex items-center justify-between group hover:bg-white/[0.02] transition-colors relative">
                    <div className="flex items-center gap-5 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                        {file.metadata?.mimetype?.includes('image') ? (
                          <ImageIcon size={18} className="text-purple-400" />
                        ) : (
                          <FileText size={18} className="text-blue-400" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-medium text-white truncate pr-4">{file.name}</h4>
                        <div className="flex items-center gap-3 text-[10px] uppercase tracking-wider text-zinc-500 mt-1">
                          <span>{new Date(file.created_at).toLocaleDateString()}</span>
                          <span className="w-1 h-1 rounded-full bg-zinc-700" />
                          <span>{formatSize(file.metadata?.size || 0)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleDownload(file.name)}
                        className="p-2 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white"
                        title="Download"
                      >
                        <Download size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(file.name)}
                        className="p-2 rounded-lg hover:bg-red-500/10 text-zinc-400 hover:text-red-500"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
