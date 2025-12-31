
import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { ROADMAP_CONFIG } from '../services/RoadmapService';
import { useUI } from '../contexts/UIContext';
import { User, MapPin, DollarSign, Calendar, Briefcase, Info, Save } from 'lucide-react';

interface ProfileViewProps {
    profileId: string;
    // The matchId is required for the Vendor to read/write notes about this homeowner
    matchId?: string;
    viewerRole: 'homeowner' | 'business' | 'contact' | 'admin';
    onClose: () => void;
}

interface ProfileData {
    id: string;
    full_name: string;
    avatar_url: string;
    role: string;
    company_name?: string;
    bio?: string;
    city?: string;
    budget_range?: string;
    current_stage?: number;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ profileId, matchId, viewerRole, onClose }) => {
    const { showToast } = useUI();
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            setLoading(true);

            // 1. Fetch Basic Profile Data
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', profileId)
                .single();

            if (error || !data) {
                showToast('Could not load profile.', 'error');
                onClose();
                return;
            }

            setProfile(data);

            // 2. If Vendor viewing Homeowner, fetch Private Notes from Match
            if (viewerRole === 'business' && matchId) {
                const { data: matchData, error: matchError } = await supabase
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

        fetchProfile();
    }, [profileId, matchId, viewerRole]);

    const handleSaveNotes = async () => {
        if (!matchId || viewerRole !== 'business') return;
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
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (!profile) return null;

    const roadmapStage = typeof profile.current_stage === 'number'
        ? ROADMAP_CONFIG[profile.current_stage as keyof typeof ROADMAP_CONFIG]?.name
        : 'Not Started';

    return (
        <div className="bg-white dark:bg-[#111] h-full flex flex-col">
            {/* Header / Cover */}
            <div className="h-32 bg-gradient-to-r from-indigo-500 to-purple-600 shrink-0"></div>

            <div className="px-6 -mt-10 flex flex-col flex-1 pb-6 overflow-y-auto">
                {/* Avatar & Name */}
                <div className="flex items-end justify-between mb-6">
                    <div className="flex items-end gap-4">
                        <img
                            src={profile.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.full_name)}`}
                            className="w-20 h-20 rounded-2xl border-4 border-white dark:border-[#111] shadow-lg object-cover bg-white"
                        />
                        <div className="mb-2">
                            <h2 className="text-xl font-bold text-zinc-900 dark:text-white leading-tight">{profile.full_name}</h2>
                            <p className="text-sm text-zinc-500 capitalize">{profile.role === 'business' ? 'Vendor' : 'Homeowner'}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="mb-4 text-xs font-semibold text-zinc-500 hover:text-zinc-900 uppercase tracking-wider">Close</button>
                </div>

                {/* Content based on Role */}
                <div className="space-y-6">

                    {/* If Viewer is Homeowner -> Seeing Vendor Info */}
                    {(profile.role === 'business' || viewerRole === 'homeowner') && (
                        <div className="space-y-4">
                            {profile.company_name && (
                                <div className="p-4 bg-zinc-50 dark:bg-white/5 rounded-xl border border-zinc-100 dark:border-white/5">
                                    <div className="flex items-center gap-2 mb-2 text-zinc-400">
                                        <Briefcase size={16} />
                                        <span className="text-xs font-semibold uppercase tracking-widest">Company</span>
                                    </div>
                                    <p className="font-medium text-zinc-900 dark:text-white">{profile.company_name}</p>
                                </div>
                            )}
                            <div className="p-4 bg-zinc-50 dark:bg-white/5 rounded-xl border border-zinc-100 dark:border-white/5">
                                <div className="flex items-center gap-2 mb-2 text-zinc-400">
                                    <Info size={16} />
                                    <span className="text-xs font-semibold uppercase tracking-widest">Bio / Info</span>
                                </div>
                                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                    {profile.bio || "No information provided."}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* If Viewer is Vendor -> Seeing Homeowner Project Data */}
                    {viewerRole === 'business' && (
                        <>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-zinc-50 dark:bg-white/5 rounded-xl border border-zinc-100 dark:border-white/5">
                                    <div className="flex items-center gap-2 mb-1 text-zinc-400">
                                        <MapPin size={14} />
                                        <span className="text-[10px] uppercase tracking-widest font-semibold">Location</span>
                                    </div>
                                    <p className="font-medium text-zinc-900 dark:text-white">{profile.city || 'Unknown'}</p>
                                </div>
                                <div className="p-4 bg-zinc-50 dark:bg-white/5 rounded-xl border border-zinc-100 dark:border-white/5">
                                    <div className="flex items-center gap-2 mb-1 text-zinc-400">
                                        <DollarSign size={14} />
                                        <span className="text-[10px] uppercase tracking-widest font-semibold">Budget</span>
                                    </div>
                                    <p className="font-medium text-zinc-900 dark:text-white">{profile.budget_range || 'Not set'}</p>
                                </div>
                            </div>

                            <div className="p-4 bg-zinc-50 dark:bg-white/5 rounded-xl border border-zinc-100 dark:border-white/5">
                                <div className="flex items-center gap-2 mb-2 text-zinc-400">
                                    <Calendar size={16} />
                                    <span className="text-xs font-semibold uppercase tracking-widest">Roadmap Stage</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                    <p className="font-medium text-zinc-900 dark:text-white">{roadmapStage}</p>
                                </div>
                            </div>

                            {/* PRIVATE NOTES */}
                            <div className="pt-4 border-t border-zinc-200 dark:border-white/10">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                                        <User size={14} /> Private Notes
                                    </h3>
                                    {saving && <span className="text-[10px] text-zinc-400 animate-pulse">Saving...</span>}
                                </div>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Add private notes about this client..."
                                    className="w-full h-32 p-3 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-700/30 rounded-lg text-sm text-zinc-800 dark:text-yellow-100 placeholder-yellow-800/30 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 resize-None"
                                />
                                <div className="flex justify-end mt-2">
                                    <button
                                        onClick={handleSaveNotes}
                                        disabled={saving}
                                        className="flex items-center gap-2 px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-lg text-xs font-bold uppercase tracking-wider hover:opacity-90 disabled:opacity-50"
                                    >
                                        <Save size={14} /> Save Note
                                    </button>
                                </div>
                                <p className="text-[10px] text-zinc-400 mt-2 text-center">
                                    Only you can see these notes.
                                </p>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
