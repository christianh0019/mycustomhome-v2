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
    lost_reason?: string; // Add optional lost_reason
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
    const [showLost, setShowLost] = useState(false);
    const [markingLostId, setMarkingLostId] = useState<string | null>(null);
    const [lostReason, setLostReason] = useState('');

    const LOST_REASONS = [
        "Not Interested",
        "Lost the Bid",
        "Not an Ideal Project",
        "Budget Mismatch",
        "Other"
    ];

    // --- Stats State ---
    const [stats, setStats] = useState({
        totalValue: 0,
        count: 0,
        wonValue: 0
    });

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
        let totalActiveValue = 0;
        let totalActiveCount = 0;
        let wonValue = 0;
        data.forEach(m => {
            const val = parseBudgetValue(m.homeowner.budget_range);
            if (m.pipeline_stage === 'won') {
                wonValue += val;
            } else if (m.pipeline_stage !== 'lost') { // Only count active deals for pipeline value and count
                totalActiveValue += val;
                totalActiveCount += 1;
            }
        });
        setStats({ totalValue: totalActiveValue, count: totalActiveCount, wonValue: wonValue });
    };

    // Revised Fetch to Client-Side Filter for correct Stats
    const fetchAllAndFilter = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('matches')
            .select(`
                id,
                pipeline_stage,
                lost_reason,
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
                lost_reason: m.lost_reason,
                homeowner: m.homeowner,
                created_at: m.created_at
            }));

            // Calculate Global Stats (Active + Won)
            calculateStats(formatted);

            // Filter for Display
            if (showLost) {
                setMatches(formatted.filter(m => m.pipeline_stage === 'lost'));
            } else {
                setMatches(formatted.filter(m => m.pipeline_stage !== 'lost'));
            }
        }
        setLoading(false);
    }

    // Replace initial useEffect to use fetchAllAndFilter
    useEffect(() => {
        if (user) fetchAllAndFilter();
    }, [user, showLost]);

    const handleStageChange = async (matchId: string, newStage: string) => {
        // Optimistic update
        const updatedMatches = matches.map(m =>
            m.id === matchId ? { ...m, pipeline_stage: newStage } : m
        );
        setMatches(updatedMatches);
        // Recalculate stats based on the full data if available, or trigger a refetch
        // For now, we'll refetch all to ensure stats are accurate.
        // calculateStats(updatedMatches); // This would only work if `matches` was the full dataset

        const { error } = await supabase
            .from('matches')
            .update({ pipeline_stage: newStage, lost_reason: null }) // Clear lost reason if re-opening
            .eq('id', matchId);

        if (error) {
            showToast('Failed to update stage', 'error');
            fetchAllAndFilter(); // Revert and refetch
        } else {
            showToast('Pipeline stage updated!', 'success');
            fetchAllAndFilter(); // Refetch to ensure consistency and correct stats
        }
    };

    const confirmLost = async () => {
        if (!markingLostId || !lostReason) return;

        const { error } = await supabase
            .from('matches')
            .update({
                pipeline_stage: 'lost',
                lost_reason: lostReason
            })
            .eq('id', markingLostId);

        if (error) {
            showToast('Failed to mark as lost.', 'error');
        } else {
            showToast('Deal marked as lost.', 'success');
            setMarkingLostId(null);
            setLostReason('');
            fetchAllAndFilter();
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
                    <div className="flex bg-zinc-200 dark:bg-white/10 p-1 rounded-lg">
                        <button
                            onClick={() => setShowLost(false)}
                            className={`px-4 py-1.5 text-xs font-bold uppercase tracking-widest rounded-md transition-all ${!showLost ? 'bg-white dark:bg-zinc-800 shadow text-zinc-900 dark:text-white' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'}`}
                        >
                            Active
                        </button>
                        <button
                            onClick={() => setShowLost(true)}
                            className={`px-4 py-1.5 text-xs font-bold uppercase tracking-widest rounded-md transition-all ${showLost ? 'bg-white dark:bg-zinc-800 shadow text-zinc-900 dark:text-white' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'}`}
                        >
                            Lost / Archived
                        </button>
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
                        <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                        <p className="text-xs uppercase tracking-widest text-zinc-500 mb-2 font-medium">Opportunities</p>
                        <p className="text-3xl font-light text-zinc-900 dark:text-white">{stats.count}</p>
                        <LayoutDashboard className="absolute right-6 bottom-6 text-zinc-100 dark:text-zinc-800 group-hover:scale-110 transition-transform" size={48} />
                    </div>
                    <div className="p-6 bg-white dark:bg-[#0A0A0A] rounded-xl border border-zinc-200 dark:border-white/10 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
                        <p className="text-xs uppercase tracking-widest text-zinc-500 mb-2 font-medium">Revenue (Won)</p>
                        <p className="text-3xl font-light text-zinc-900 dark:text-white">{formatCurrency(stats.wonValue)}</p>
                        <CheckCircle2 className="absolute right-6 bottom-6 text-zinc-100 dark:text-zinc-800 group-hover:scale-110 transition-transform" size={48} />
                    </div>
                </div>
            </div>

            {/* Kanban Board OR Lost List */}
            <div className="flex-1 overflow-x-auto overflow-y-hidden px-8 pb-8">
                {showLost ? (
                    <div className="bg-white dark:bg-[#0A0A0A] rounded-2xl border border-zinc-200 dark:border-white/10 overflow-hidden h-full">
                        <div className="p-4 border-b border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/5">
                            <h3 className="text-sm font-bold uppercase tracking-widest">Lost Deals</h3>
                        </div>
                        <div className="overflow-y-auto h-full p-0">
                            {matches.length === 0 ? (
                                <div className="p-12 text-center text-zinc-400">No lost deals found.</div>
                            ) : (
                                <table className="w-full text-left bg-white dark:bg-[#0A0A0A]">
                                    <thead className="bg-zinc-50 dark:bg-white/5 text-xs text-zinc-500 uppercase tracking-wider sticky top-0 z-10">
                                        <tr>
                                            <th className="p-4 font-medium">Homeowner</th>
                                            <th className="p-4 font-medium">Reason</th>
                                            <th className="p-4 font-medium">Date Lost</th>
                                            <th className="p-4 font-medium text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-100 dark:divide-white/5">
                                        {matches.map(m => (
                                            <tr key={m.id} className="hover:bg-zinc-50 dark:hover:bg-white/5 transition-colors">
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        <img src={m.homeowner.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.homeowner.full_name)}`} className="w-8 h-8 rounded-full" />
                                                        <span className="font-medium text-sm text-zinc-900 dark:text-white">{m.homeowner.full_name}</span>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <span className="px-2 py-1 bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300 rounded text-xs font-bold uppercase tracking-wide">
                                                        {m.lost_reason || 'Unknown'}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-xs text-zinc-500">
                                                    {new Date(m.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="p-4 text-right">
                                                    <button onClick={() => handleStageChange(m.id, 'new request')} className="text-xs text-zinc-400 hover:text-zinc-900 dark:hover:text-white underline">
                                                        Re-open
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="flex gap-6 h-full min-w-[1000px]">
                        {STAGES.map(stage => {
                            const stageMatches = matches.filter(m => (m.pipeline_stage || 'new request') === stage.id);
                            return (
                                <div
                                    key={stage.id}
                                    className="w-1/4 flex flex-col h-full bg-zinc-50/50 dark:bg-white/[0.01] rounded-2xl"
                                    onDragOver={(e) => {
                                        e.preventDefault();
                                        e.currentTarget.classList.add('bg-zinc-100', 'dark:bg-white/5');
                                    }}
                                    onDragLeave={(e) => {
                                        e.currentTarget.classList.remove('bg-zinc-100', 'dark:bg-white/5');
                                    }}
                                    onDrop={(e) => {
                                        e.preventDefault();
                                        e.currentTarget.classList.remove('bg-zinc-100', 'dark:bg-white/5');
                                        const id = e.dataTransfer.getData('text/plain');
                                        if (id) {
                                            handleStageChange(id, stage.id);
                                        }
                                    }}
                                >
                                    {/* Column Header */}
                                    <div className="flex items-center justify-between mb-4 px-2 pt-2">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${stage.color}`}></div>
                                            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500">{stage.label}</h3>
                                        </div>
                                        <span className="text-xs text-zinc-400 font-medium bg-zinc-100 dark:bg-white/5 px-2 py-0.5 rounded-full">{stageMatches.length}</span>
                                    </div>

                                    {/* Column Content */}
                                    <div className="flex-1 p-3 space-y-3 overflow-y-auto">
                                        {stageMatches.map(match => (
                                            <div
                                                key={match.id}
                                                className="bg-white dark:bg-[#0A0A0A] p-4 rounded-xl border border-zinc-200 dark:border-white/10 shadow-sm hover:shadow-md cursor-grab active:cursor-grabbing transition-all group relative"
                                                draggable
                                                onDragStart={(e) => {
                                                    e.dataTransfer.setData('text/plain', match.id);
                                                    e.dataTransfer.effectAllowed = 'move';
                                                }}
                                            >
                                                {/* Profile Click */}
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

                                                {/* Card Footer Actions */}
                                                <div className="pt-2 border-t border-zinc-100 dark:border-white/5 flex justify-between items-center mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); setMarkingLostId(match.id); }}
                                                        className="text-[10px] uppercase tracking-wider text-red-300 hover:text-red-500 font-bold"
                                                    >
                                                        Mark Lost
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Mark Lost Modal */}
            {markingLostId && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
                    <div className="bg-white dark:bg-[#0A0A0A] p-8 rounded-2xl shadow-2xl border border-zinc-200 dark:border-white/10 w-full max-w-sm animate-in zoom-in-95 duration-200">
                        <h3 className="text-xl font-serif mb-2 text-zinc-900 dark:text-white">Mark Deal as Lost</h3>
                        <p className="text-sm text-zinc-500 mb-6">Why is this deal being closed? This helps improve future insights.</p>

                        <div className="space-y-2 mb-6">
                            {LOST_REASONS.map(reason => (
                                <button
                                    key={reason}
                                    onClick={() => setLostReason(reason)}
                                    className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all border ${lostReason === reason ? 'bg-zinc-900 border-zinc-900 text-white dark:bg-white dark:border-white dark:text-black font-semibold' : 'bg-zinc-50 border-zinc-100 text-zinc-600 hover:bg-zinc-100 dark:bg-white/5 dark:border-white/5 dark:text-zinc-300 dark:hover:bg-white/10'}`}
                                >
                                    {reason}
                                </button>
                            ))}
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => { setMarkingLostId(null); setLostReason(''); }}
                                className="flex-1 py-3 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmLost}
                                disabled={!lostReason}
                                className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Confirm Lost
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
