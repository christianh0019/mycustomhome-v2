
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
        <div className="bg-white dark:bg-[#0A0A0A] h-full flex flex-col pt-12 relative font-sans">
            <div className="px-8 flex flex-col flex-1 pb-8 overflow-y-auto">
                <div className="flex items-start justify-between mb-8">
                    <div className="flex items-center gap-5">
                        <img
                            src={profile.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.full_name)}`}
                            className="w-16 h-16 rounded-full object-cover bg-zinc-100 dark:bg-zinc-800"
                        />
                        <div>
                            <h2 className="text-2xl font-light text-zinc-900 dark:text-white tracking-tight">{profile.full_name}</h2>
                            <p className="text-xs text-amber-600 font-medium uppercase tracking-widest mt-1">{profile.role}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-xs font-medium text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors uppercase tracking-widest">Close</button>
                </div>

                <div className="space-y-8">
                    {profile.company_name && (
                        <div>
                            <div className="flex items-center gap-2 mb-2 text-zinc-400">
                                <Briefcase size={14} strokeWidth={1.5} />
                                <span className="text-[10px] uppercase tracking-widest font-medium">Business Entity</span>
                            </div>
                            <p className="text-lg font-light text-zinc-900 dark:text-white">{profile.company_name}</p>
                        </div>
                    )}

                    <div>
                        <div className="flex items-center gap-2 mb-3 text-zinc-400 border-b border-zinc-100 dark:border-white/5 pb-2">
                            <Info size={14} strokeWidth={1.5} />
                            <span className="text-[10px] uppercase tracking-widest font-medium">Professional Bio</span>
                        </div>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed font-light">
                            {profile.bio || "No biography provided."}
                        </p>
                    </div>

                    <div className="flex gap-2 pt-4">
                        <div className="h-[1px] flex-1 bg-zinc-100 dark:bg-white/10"></div>
                        <div className="h-[1px] w-8 bg-amber-500"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};
