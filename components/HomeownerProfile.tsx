
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
    const [notes, setNotes] = useState<{ id: string, content: string, created_at: string }[]>([]);
    const [newNote, setNewNote] = useState('');
    const [loadingNotes, setLoadingNotes] = useState(true);
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

            setLoading(false);
        };

        fetchData();
    }, [profileId, matchId]);

    // Fetch Notes
    useEffect(() => {
        if (!matchId) return;
        const fetchNotes = async () => {
            setLoadingNotes(true);
            const { data, error } = await supabase
                .from('match_notes')
                .select('*')
                .eq('match_id', matchId)
                .order('created_at', { ascending: true }); // Oldest first

            if (error) {
                console.error('Error fetching notes:', error);
            } else {
                setNotes(data || []);
            }
            setLoadingNotes(false);
        };
        fetchNotes();
    }, [matchId]);

    // Save Note
    const handleAddNote = async () => {
        if (!matchId || !newNote.trim()) return;
        setSaving(true);

        const { data, error } = await supabase
            .from('match_notes')
            .insert({
                match_id: matchId,
                author_id: (await supabase.auth.getUser()).data.user?.id,
                content: newNote.trim()
            })
            .select()
            .single();

        if (error) {
            console.error('Error saving note:', error);
            showToast('Failed to save note.', 'error');
        } else if (data) {
            setNotes([...notes, data]);
            setNewNote('');
            showToast('Note saved successfully.', 'success');
        }
        setSaving(false);
    };

    if (loading) {
        return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>;
    }

    if (!profile) return null;

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

                    <div className="pt-8 border-t border-zinc-100 dark:border-white/5 flex flex-col h-[400px]">
                        <div className="flex items-center justify-between mb-4 shrink-0">
                            <h3 className="text-[10px] font-medium uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                                <User size={14} strokeWidth={1.5} /> Private Notes
                            </h3>
                        </div>

                        {/* Notes List */}
                        <div className="flex-1 overflow-y-auto mb-4 space-y-3 pr-2 scrollbar-hide">
                            {loadingNotes ? (
                                <p className="text-xs text-zinc-400 animate-pulse">Loading notes...</p>
                            ) : notes.length === 0 ? (
                                <div className="text-center py-8 opacity-50">
                                    <p className="text-xs text-zinc-400 italic">No notes yet. Start typing below.</p>
                                </div>
                            ) : (
                                notes.map(note => (
                                    <div key={note.id} className="p-3 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg group hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors">
                                        <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed font-light whitespace-pre-wrap">{note.content}</p>
                                        <p className="text-[10px] text-zinc-400 mt-2 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                                            {new Date(note.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                                        </p>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Input Area */}
                        <div className="shrink-0 relative">
                            <textarea
                                value={newNote}
                                onChange={(e) => setNewNote(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleAddNote();
                                    }
                                }}
                                placeholder="Add a new note..."
                                className="w-full h-24 p-4 pr-12 bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm text-zinc-600 dark:text-zinc-300 placeholder-zinc-300 focus:ring-0 focus:border-zinc-400 dark:focus:border-zinc-700 resize-none leading-relaxed shadow-sm"
                            />
                            <button
                                onClick={handleAddNote}
                                disabled={saving || !newNote.trim()}
                                className="absolute bottom-3 right-3 p-2 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-lg hover:opacity-90 disabled:opacity-30 transition-all"
                            >
                                <Save size={14} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
