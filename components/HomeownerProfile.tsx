
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
        <div className="bg-white dark:bg-[#111] h-full flex flex-col relative">
            {/* Blueprint Theme Header */}
            <div className="h-32 bg-[#0052CC] relative overflow-hidden shrink-0">
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                <div className="absolute bottom-4 left-6 text-white/80 text-xs font-mono uppercase tracking-widest">Project Blueprint</div>
            </div>

            <div className="px-6 -mt-10 flex flex-col flex-1 pb-6 overflow-y-auto">
                <div className="flex items-end justify-between mb-6">
                    <div className="flex items-end gap-4">
                        <img
                            src={profile.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.full_name)}`}
                            className="w-20 h-20 rounded-none border-4 border-white dark:border-[#111] shadow-lg object-cover bg-white"
                            style={{ borderRadius: '4px' }}
                        />
                        <div className="mb-2">
                            <h2 className="text-xl font-bold text-zinc-900 dark:text-white leading-tight font-mono">{profile.full_name}</h2>
                            <p className="text-sm text-zinc-500 font-mono">PROJECT OWNER</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="mb-4 text-xs font-bold text-zinc-500 hover:text-zinc-900 uppercase tracking-wider border border-zinc-200 dark:border-white/10 px-3 py-1 rounded hover:bg-zinc-50 dark:hover:bg-white/5 transition-colors">Close</button>
                </div>

                <div className="space-y-6 font-mono text-sm">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/30">
                            <div className="flex items-center gap-2 mb-1 text-blue-600 dark:text-blue-400">
                                <MapPin size={14} />
                                <span className="text-[10px] uppercase tracking-widest font-bold">Location</span>
                            </div>
                            <p className="font-bold text-zinc-900 dark:text-white">{profile.city || 'Unknown'}</p>
                        </div>
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/30">
                            <div className="flex items-center gap-2 mb-1 text-blue-600 dark:text-blue-400">
                                <DollarSign size={14} />
                                <span className="text-[10px] uppercase tracking-widest font-bold">Budget</span>
                            </div>
                            <p className="font-bold text-zinc-900 dark:text-white">{profile.budget_range || 'Not set'}</p>
                        </div>
                    </div>

                    <div className="p-4 border-2 border-dashed border-zinc-300 dark:border-zinc-700">
                        <div className="flex items-center gap-2 mb-2 text-zinc-500">
                            <Calendar size={16} />
                            <span className="text-xs font-bold uppercase tracking-widest">Roadmap Status</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-3 h-3 bg-blue-600"></div>
                            <p className="font-bold text-zinc-900 dark:text-white">{roadmapStage}</p>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-zinc-200 dark:border-white/10">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                                <User size={14} /> Private Field Notes
                            </h3>
                            {saving && <span className="text-[10px] text-zinc-400 animate-pulse">Saving...</span>}
                        </div>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="// Enter private notes..."
                            className="w-full h-32 p-3 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 text-sm text-zinc-800 dark:text-zinc-300 focus:outline-none focus:border-blue-500 font-mono resize-None"
                        />
                        <div className="flex justify-end mt-2">
                            <button
                                onClick={handleSaveNotes}
                                disabled={saving}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-xs font-bold uppercase tracking-wider hover:bg-blue-700 disabled:opacity-50"
                            >
                                <Save size={14} /> Save Note
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
