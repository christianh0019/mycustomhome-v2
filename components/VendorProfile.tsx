
import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { useUI } from '../contexts/UIContext';
import { Briefcase, Info } from 'lucide-react';

interface VendorProfileProps {
    profileId: string;
    onClose: () => void;
}

interface VendorData {
    id: string;
    full_name: string;
    avatar_url: string;
    company_name?: string;
    bio?: string;
    role: 'business' | 'consultant' | 'contact';
}

export const VendorProfile: React.FC<VendorProfileProps> = ({ profileId, onClose }) => {
    const { showToast } = useUI();
    const [profile, setProfile] = useState<VendorData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', profileId)
                .single();

            if (error || !data) {
                showToast('Could not load vendor profile.', 'error');
                onClose();
                return;
            }
            setProfile(data as VendorData);
            setLoading(false);
        };

        fetchData();
    }, [profileId]);

    if (loading) {
        return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>;
    }

    if (!profile) return null;

    return (
        <div className="bg-white dark:bg-[#111] h-full flex flex-col relative pt-10">
            <div className="px-6 flex flex-col flex-1 pb-6 overflow-y-auto">
                <div className="flex items-end justify-between mb-6">
                    <div className="flex items-end gap-4">
                        <img
                            src={profile.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.full_name)}`}
                            className="w-20 h-20 rounded-full border-4 border-white dark:border-[#111] shadow-2xl object-cover bg-white"
                        />
                        <div className="mb-2">
                            <h2 className="text-xl font-bold text-zinc-900 dark:text-white leading-tight font-serif tracking-wide">{profile.full_name}</h2>
                            <p className="text-xs text-amber-600 font-bold uppercase tracking-widest">{profile.role}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="mb-4 text-xs font-bold text-zinc-500 hover:text-zinc-900 uppercase tracking-wider hover:underline">Close</button>
                </div>

                <div className="space-y-6">
                    {profile.company_name && (
                        <div className="p-6 bg-zinc-50 dark:bg-white/5 rounded-none border-l-4 border-amber-500 shadow-sm">
                            <div className="flex items-center gap-2 mb-2 text-zinc-400">
                                <Briefcase size={16} />
                                <span className="text-xs font-bold uppercase tracking-widest text-zinc-900 dark:text-white">Business Entity</span>
                            </div>
                            <p className="text-lg font-serif italic text-zinc-800 dark:text-zinc-200">{profile.company_name}</p>
                        </div>
                    )}

                    <div className="p-0">
                        <div className="flex items-center gap-2 mb-3 text-zinc-400 border-b border-zinc-100 dark:border-white/5 pb-2">
                            <Info size={16} />
                            <span className="text-xs font-bold uppercase tracking-widest">Professional Bio</span>
                        </div>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed font-serif">
                            {profile.bio || "No biography provided."}
                        </p>
                    </div>

                    <div className="flex gap-2 pt-4">
                        <div className="h-1 flex-1 bg-zinc-100 dark:bg-zinc-800 rounded-full"></div>
                        <div className="h-1 w-10 bg-amber-500 rounded-full"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};
