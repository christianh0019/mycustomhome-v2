import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';
import { ROADMAP_CONFIG } from '../services/RoadmapService';
import { HomeownerProfile } from './HomeownerProfile';
import { Search, MapPin, User, ArrowRight, Loader } from 'lucide-react';

interface Match {
    id: string; // match_id
    homeowner: {
        id: string;
        full_name: string;
        city: string;
        avatar_url: string;
        current_stage: number;
    };
    last_interaction: string;
}

export const VendorLeads: React.FC = () => {
    const { user } = useAuth();
    const [matches, setMatches] = useState<Match[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);

    useEffect(() => {
        if (user) {
            fetchMatches();
        }
    }, [user]);

    const fetchMatches = async () => {
        setLoading(true);
        // Fetch matches where current user is vendor
        const { data, error } = await supabase
            .from('matches')
            .select(`
                id,
                created_at,
                homeowner:homeowner_id (
                    id,
                    full_name,
                    city,
                    avatar_url,
                    current_stage
                )
            `)
            .eq('vendor_id', user?.id)
            .order('created_at', { ascending: false });

        if (data) {
            // Transform data to flat structure if needed, or just use as is
            // formatting:
            const formatted: Match[] = data.map((m: any) => ({
                id: m.id,
                homeowner: m.homeowner,
                last_interaction: m.created_at // placeholder for now, or fetch from messages
            }));
            setMatches(formatted);
        }
        setLoading(false);
    };

    if (selectedMatch) {
        return (
            <div className="h-full relative z-10">
                <HomeownerProfile
                    profileId={selectedMatch.homeowner.id}
                    matchId={selectedMatch.id}
                    onClose={() => setSelectedMatch(null)}
                />
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-zinc-50 dark:bg-black text-zinc-900 dark:text-white">
            <div className="p-8 pb-0">
                <div className="flex items-center justify-between mb-2">
                    <h1 className="text-3xl font-serif text-zinc-900 dark:text-white">Active Leads</h1>
                    <div className="text-xs text-zinc-400 uppercase tracking-widest">{matches.length} CONNECTIONS</div>
                </div>
                <p className="text-zinc-500 dark:text-zinc-500 mb-8">Manage your matched homeowners and project notes.</p>

                {/* Search Bar Placeholder - Functional enhancement for later */}
                <div className="relative max-w-md mb-8">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                    <input
                        type="text"
                        placeholder="Search homeowners..."
                        className="w-full pl-10 pr-4 py-2 bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white/20 transition-all"
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-8 pb-8">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <Loader className="animate-spin text-zinc-400" size={24} />
                    </div>
                ) : matches.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-zinc-400">
                        <User size={48} className="mb-4 opacity-20" />
                        <p>No matches found yet.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {matches.map(match => (
                            <div
                                key={match.id}
                                onClick={() => setSelectedMatch(match)}
                                className="group bg-white dark:bg-[#0A0A0A] p-6 rounded-xl border border-zinc-200 dark:border-white/10 hover:border-zinc-300 dark:hover:border-white/20 hover:shadow-lg dark:hover:shadow-indigo-500/5 transition-all cursor-pointer relative overflow-hidden"
                            >
                                <div className="absolute top-0 left-0 w-1 h-full bg-zinc-100 dark:bg-zinc-800 group-hover:bg-indigo-500 transition-colors"></div>

                                <div className="flex items-start justify-between mb-4">
                                    <img
                                        src={match.homeowner.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(match.homeowner.full_name)}`}
                                        alt={match.homeowner.full_name}
                                        className="w-12 h-12 rounded-full object-cover bg-zinc-100 dark:bg-zinc-800"
                                    />
                                    <div className="p-2 bg-zinc-50 dark:bg-zinc-900 rounded-full group-hover:bg-indigo-50 dark:group-hover:bg-indigo-500/10 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                        <ArrowRight size={16} />
                                    </div>
                                </div>

                                <h3 className="text-lg font-medium text-zinc-900 dark:text-white mb-1 group-hover:translate-x-1 transition-transform">{match.homeowner.full_name}</h3>

                                <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 text-sm mb-4">
                                    <MapPin size={14} />
                                    <span>{match.homeowner.city || 'Unknown Location'}</span>
                                </div>

                                <div className="pt-4 border-t border-zinc-100 dark:border-zinc-900 mt-auto">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-zinc-400 uppercase tracking-wider font-medium">Stage</span>
                                        <span className="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded text-zinc-600 dark:text-zinc-300 font-medium">
                                            {ROADMAP_CONFIG[match.homeowner.current_stage as keyof typeof ROADMAP_CONFIG]?.name || `Stage ${match.homeowner.current_stage || 0}`}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
