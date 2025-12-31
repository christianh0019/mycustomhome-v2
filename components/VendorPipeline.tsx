import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';
import { HomeownerProfile } from './HomeownerProfile';
import {
    LayoutDashboard, DollarSign, TrendingUp, MoreHorizontal,
    ArrowRight, CheckCircle2, Circle
} from 'lucide-react';
import { useUI } from '../contexts/UIContext';

// --- Types ---
interface Match {
    id: string; // match_id
    pipeline_stage: string;
    homeowner: {
        id: string;
        full_name: string;
        city: string;
        avatar_url: string;
        budget_range: string; // e.g. "$500k - $700k"
    };
    created_at: string;
}

const STAGES = [
    { id: 'new request', label: 'New Request', color: 'bg-blue-500' },
    { id: 'contacted', label: 'Contacted', color: 'bg-yellow-500' },
    { id: 'proposal sent', label: 'Proposal Sent', color: 'bg-purple-500' },
    { id: 'won', label: 'Won', color: 'bg-emerald-500' }
];

export const VendorPipeline: React.FC = () => {
    const { user } = useAuth();
    const { showToast } = useUI();
    const [matches, setMatches] = useState<Match[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
    const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);

    // --- Stats State ---
    const [stats, setStats] = useState({
        totalValue: 0,
        count: 0,
        wonValue: 0
    });

    useEffect(() => {
        if (user) fetchPipeline();
    }, [user]);

    const fetchPipeline = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('matches')
            .select(`
                id,
                pipeline_stage,
                created_at,
                homeowner:homeowner_id (
                    id,
                    full_name,
                    city,
                    avatar_url,
                    budget_range
                )
            `)
            .eq('vendor_id', user?.id)
            .order('created_at', { ascending: false });

        if (data) {
            const formatted: Match[] = data.map((m: any) => ({
                id: m.id,
                pipeline_stage: m.pipeline_stage || 'new request',
                homeowner: m.homeowner,
                created_at: m.created_at
            }));
            setMatches(formatted);
            calculateStats(formatted);
        }
        setLoading(false);
    };

    // Helper to estimate value from string range
    const parseBudgetValue = (range: string): number => {
        if (!range) return 0;
        // Simple heuristic: Take the lower bound number
        // Remove '$', 'k', 'M', spaces
        // Example: "$500k - $700k" -> 500000
        try {
            const clean = range.toLowerCase().replace(/,/g, '');
            const match = clean.match(/(\d+(?:\.\d+)?)\s*(k|m)?/);
            if (match) {
                let val = parseFloat(match[1]);
                const multiplier = match[2];
                if (multiplier === 'k') val *= 1000;
                if (multiplier === 'm') val *= 1000000;
                return val;
            }
        } catch (e) {
            return 0;
        }
        return 0;
    };

    const calculateStats = (data: Match[]) => {
        let total = 0;
        let won = 0;
        data.forEach(m => {
            const val = parseBudgetValue(m.homeowner.budget_range);
            if (m.pipeline_stage === 'won') {
                won += val;
            } else {
                total += val; // Active pipeline
            }
        });
        setStats({ totalValue: total, count: data.length, wonValue: won });
    };

    const handleStageChange = async (matchId: string, newStage: string) => {
        // Optimistic update
        const updatedMatches = matches.map(m =>
            m.id === matchId ? { ...m, pipeline_stage: newStage } : m
        );
        setMatches(updatedMatches);
        calculateStats(updatedMatches);

        const { error } = await supabase
            .from('matches')
            .update({ pipeline_stage: newStage })
            .eq('id', matchId);

        if (error) {
            showToast('Failed to update stage', 'error');
            fetchPipeline(); // Revert
        }
    };

    // Format currency
    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);


    if (selectedProfileId) {
        return (
            <div className="h-full relative z-10 w-full animate-in slide-in-from-right duration-300">
                <HomeownerProfile
                    profileId={selectedProfileId}
                    matchId={selectedMatchId || undefined}
                    onClose={() => { setSelectedProfileId(null); setSelectedMatchId(null); }}
                />
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-zinc-50 dark:bg-black text-zinc-900 dark:text-white font-sans overflow-hidden">
            {/* Header / Stats */}
            <div className="p-8 pb-0 shrink-0">
                <div className="flex items-end justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-serif text-zinc-900 dark:text-white mb-2">Sales Pipeline</h1>
                        <p className="text-zinc-500 dark:text-zinc-500">Track and manage your active opportunities.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="p-6 bg-white dark:bg-[#0A0A0A] rounded-xl border border-zinc-200 dark:border-white/10 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
                        <p className="text-xs uppercase tracking-widest text-zinc-500 mb-2 font-medium">Pipeline Value</p>
                        <p className="text-3xl font-light text-zinc-900 dark:text-white">{formatCurrency(stats.totalValue)}</p>
                        <TrendingUp className="absolute right-6 bottom-6 text-zinc-100 dark:text-zinc-800 group-hover:scale-110 transition-transform" size={48} />
                    </div>
                    <div className="p-6 bg-white dark:bg-[#0A0A0A] rounded-xl border border-zinc-200 dark:border-white/10 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
                        <p className="text-xs uppercase tracking-widest text-zinc-500 mb-2 font-medium">Revenue (Won)</p>
                        <p className="text-3xl font-light text-zinc-900 dark:text-white">{formatCurrency(stats.wonValue)}</p>
                        <CheckCircle2 className="absolute right-6 bottom-6 text-zinc-100 dark:text-zinc-800 group-hover:scale-110 transition-transform" size={48} />
                    </div>
                    <div className="p-6 bg-white dark:bg-[#0A0A0A] rounded-xl border border-zinc-200 dark:border-white/10 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                        <p className="text-xs uppercase tracking-widest text-zinc-500 mb-2 font-medium">Active Deals</p>
                        <p className="text-3xl font-light text-zinc-900 dark:text-white">{matches.filter(m => m.pipeline_stage !== 'won').length}</p>
                        <LayoutDashboard className="absolute right-6 bottom-6 text-zinc-100 dark:text-zinc-800 group-hover:scale-110 transition-transform" size={48} />
                    </div>
                </div>
            </div>

            {/* Kanban Board */}
            <div className="flex-1 overflow-x-auto overflow-y-hidden px-8 pb-8">
                <div className="flex gap-6 h-full min-w-[1000px]">
                    {STAGES.map(stage => {
                        const stageMatches = matches.filter(m => (m.pipeline_stage || 'new request') === stage.id);
                        return (
                            <div key={stage.id} className="w-1/4 flex flex-col h-full">
                                {/* Column Header */}
                                <div className="flex items-center justify-between mb-4 px-2">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${stage.color}`}></div>
                                        <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500">{stage.label}</h3>
                                    </div>
                                    <span className="text-xs text-zinc-400 font-medium bg-zinc-100 dark:bg-white/5 px-2 py-0.5 rounded-full">{stageMatches.length}</span>
                                </div>

                                {/* Column Content */}
                                <div className="flex-1 bg-zinc-100/50 dark:bg-white/[0.02] rounded-2xl p-3 space-y-3 overflow-y-auto border border-zinc-200/50 dark:border-white/5">
                                    {stageMatches.map(match => (
                                        <div
                                            key={match.id}
                                            className="bg-white dark:bg-[#0A0A0A] p-4 rounded-xl border border-zinc-200 dark:border-white/10 shadow-sm hover:shadow-md cursor-grab active:cursor-grabbing transition-all group"
                                            draggable
                                            onDragStart={(e) => {
                                                e.dataTransfer.setData('text/plain', match.id);
                                            }}
                                        >
                                            <div onClick={() => { setSelectedProfileId(match.homeowner.id); setSelectedMatchId(match.id); }} className="cursor-pointer">
                                                <div className="flex items-center justify-between mb-3">
                                                    <div className="flex items-center gap-2">
                                                        <img
                                                            src={match.homeowner.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(match.homeowner.full_name)}`}
                                                            className="w-6 h-6 rounded-full object-cover"
                                                        />
                                                        <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{match.homeowner.full_name}</span>
                                                    </div>
                                                </div>
                                                <div className="mb-3">
                                                    <p className="text-[10px] uppercase tracking-wider text-zinc-400 mb-0.5">Estimated Value</p>
                                                    <p className="text-sm font-semibold text-zinc-900 dark:text-white flex items-center gap-1">
                                                        <DollarSign size={12} className="text-emerald-500" />
                                                        {match.homeowner.budget_range || '—'}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Quick Actions / Move */}
                                            <div className="pt-2 border-t border-zinc-100 dark:border-white/5 flex justify-end gap-1">
                                                {STAGES.map(s => (
                                                    <button
                                                        key={s.id}
                                                        onClick={() => handleStageChange(match.id, s.id)}
                                                        title={`Move to ${s.label}`}
                                                        className={`w-2 h-2 rounded-full transition-all hover:scale-150 ${s.id === match.pipeline_stage ? 'bg-zinc-900 dark:bg-white scale-125 ring-2 ring-offset-1 ring-zinc-300 dark:ring-zinc-700' : 'bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-400'}`}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {/* Drop Zone Overlay Logic would go here for true dnd, but simple buttons work for MVP */}
                                <div
                                    className="hidden" // Placeholder for drop logic if implemented later
                                    onDragOver={(e) => e.preventDefault()}
                                    onDrop={(e) => {
                                        e.preventDefault();
                                        const id = e.dataTransfer.getData('text/plain');
                                        handleStageChange(id, stage.id);
                                    }}
                                ></div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
