
import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { ROADMAP_CONFIG } from '../services/RoadmapService';
import { useUI } from '../contexts/UIContext';
import { MapPin, DollarSign, Calendar, User, Save } from 'lucide-react';

interface HomeownerProfileProps {
    profileId: string;
    matchId?: string; // Required for saving notes
    onClose: () => void;
}

interface HomeownerData {
    id: string;
    full_name: string;
    avatar_url: string;
    city?: string;
    budget_range?: string;
    current_stage?: number;
    role: 'homeowner';
}

export const HomeownerProfile: React.FC<HomeownerProfileProps> = ({ profileId, matchId, onClose }) => {
    const { showToast } = useUI();
    const [profile, setProfile] = useState<HomeownerData | null>(null);
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);

            // 1. Fetch Homeowner Profile
            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('id, full_name, avatar_url, city, budget_range, current_stage, role')
                .eq('id', profileId)
                .single();

            if (profileError || !profileData) {
                showToast('Could not load homeowner profile.', 'error');
                onClose();
                return;
            }
            setProfile(profileData as HomeownerData);

            // 2. Fetch Private Notes from Match (if matchId exists)
            if (matchId) {
                const { data: matchData } = await supabase
                    .from('matches')
                    .select('notes')
                    .eq('id', matchId)
                    .single();

                if (matchData) {
                    setNotes(matchData.notes || '');
                }
            }
            setLoading(false);
        };

        fetchData();
    }, [profileId, matchId]);

    const handleSaveNotes = async () => {
        if (!matchId) return;
        setSaving(true);
        const { error } = await supabase
            .from('matches')
            .update({ notes })
            .eq('id', matchId);

        if (error) {
            showToast('Failed to save notes.', 'error');
        } else {
            showToast('Notes saved successfully.', 'success');
        }
        setSaving(false);
    };

    if (loading) {
        return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>;
    }

    if (!profile) return null;

    const roadmapStage = typeof profile.current_stage === 'number'
        ? ROADMAP_CONFIG[profile.current_stage as keyof typeof ROADMAP_CONFIG]?.name
        : 'Not Started';

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
                            <p className="text-xs text-zinc-400 uppercase tracking-widest mt-1">Homeowner</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-xs font-medium text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors uppercase tracking-widest">Close</button>
                </div>

                <div className="space-y-8">
                    <div className="grid grid-cols-2 gap-8">
                        <div>
                            <div className="flex items-center gap-2 mb-2 text-zinc-400">
                                <MapPin size={14} strokeWidth={1.5} />
                                <span className="text-[10px] uppercase tracking-widest font-medium">Location</span>
                            </div>
                            <p className="text-lg font-light text-zinc-900 dark:text-white">{profile.city || '—'}</p>
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-2 text-zinc-400">
                                <DollarSign size={14} strokeWidth={1.5} />
                                <span className="text-[10px] uppercase tracking-widest font-medium">Budget</span>
                            </div>
                            <p className="text-lg font-light text-zinc-900 dark:text-white">{profile.budget_range || '—'}</p>
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center gap-2 mb-3 text-zinc-400">
                            <Calendar size={14} strokeWidth={1.5} />
                            <span className="text-[10px] uppercase tracking-widest font-medium">Project Stage</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-zinc-900 dark:bg-white"></div>
                            <p className="text-lg font-light text-zinc-900 dark:text-white">{roadmapStage}</p>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-zinc-100 dark:border-white/5">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-[10px] font-medium uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                                <User size={14} strokeWidth={1.5} /> Private Notes
                            </h3>
                            {saving && <span className="text-[10px] text-zinc-300 animate-pulse">Saving...</span>}
                        </div>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Add private notes..."
                            className="w-full h-40 p-4 bg-zinc-50 dark:bg-white/5 border-none rounded-xl text-sm text-zinc-600 dark:text-zinc-300 placeholder-zinc-300 focus:ring-0 resize-none leading-relaxed"
                        />
                        <div className="flex justify-end mt-4">
                            <button
                                onClick={handleSaveNotes}
                                disabled={saving}
                                className="px-6 py-2 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-full text-xs font-medium tracking-wide hover:opacity-90 disabled:opacity-50 transition-opacity"
                            >
                                Save Note
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
