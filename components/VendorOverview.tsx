import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';
import {
    TrendingUp, Users, DollarSign, Activity,
    Briefcase, ArrowRight, AlertCircle, Clock, CheckCircle2
} from 'lucide-react';

interface OverviewMatch {
    id: string;
    pipeline_stage: string;
    revenue?: number;
    created_at: string;
    updated_at: string;
    homeowner: {
        id: string;
        full_name: string;
        avatar_url: string;
        budget_range: string;
    };
}

export const VendorOverview: React.FC<{ onNavigate: (tab: string) => void }> = ({ onNavigate }) => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [matches, setMatches] = useState<OverviewMatch[]>([]);
    const [stats, setStats] = useState({
        totalPipelineValue: 0,
        winRate: 0,
        activeOpportunities: 0,
        avgDealSize: 0,
        wonCount: 0,
        lostCount: 0
    });

    // Helper to parse budget strings like "$50k - $100k"
    const parseBudgetValue = (range: string): number => {
        if (!range) return 0;
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

    const formatCurrency = (val: number) => {
        if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
        if (val >= 1000) return `$${(val / 1000).toFixed(0)}k`;
        return `$${val}`;
    };

    useEffect(() => {
        const fetchOverviewData = async () => {
            if (!user) return;
            setLoading(true);

            const { data, error } = await supabase
                .from('matches')
                .select(`
                    id,
                    pipeline_stage,
                    revenue,
                    created_at,
                    updated_at,
                    homeowner:homeowner_id (
                        id,
                        full_name,
                        avatar_url,
                        budget_range
                    )
                `)
                .eq('vendor_id', user.id)
                .order('updated_at', { ascending: false });

            if (data) {
                const formatted: OverviewMatch[] = data.map((m: any) => ({
                    id: m.id,
                    pipeline_stage: m.pipeline_stage || 'new request',
                    revenue: m.revenue,
                    created_at: m.created_at,
                    updated_at: m.updated_at || m.created_at,
                    homeowner: m.homeowner
                }));
                setMatches(formatted);

                // --- Calculate Stats ---
                let totalValue = 0; // Active + Won
                let activeCount = 0;
                let wonCount = 0;
                let lostCount = 0;
                let wonRevenue = 0;

                formatted.forEach(m => {
                    const budget = parseBudgetValue(m.homeowner.budget_range);

                    if (m.pipeline_stage === 'won') {
                        wonCount++;
                        const actualRev = m.revenue || budget;
                        wonRevenue += actualRev;
                        totalValue += actualRev;
                    } else if (m.pipeline_stage === 'lost') {
                        lostCount++;
                    } else {
                        // Active
                        activeCount++;
                        totalValue += budget;
                    }
                });

                const totalDeals = wonCount + lostCount;
                const winRate = totalDeals > 0 ? Math.round((wonCount / totalDeals) * 100) : 0;
                const avgDealSize = wonCount > 0 ? wonRevenue / wonCount : 0;

                setStats({
                    totalPipelineValue: totalValue,
                    winRate,
                    activeOpportunities: activeCount,
                    avgDealSize,
                    wonCount,
                    lostCount
                });
            }
            setLoading(false);
        };

        fetchOverviewData();
    }, [user]);

    // Derived Lists for Action Center and Feed
    const staleLeads = matches.filter(m => {
        const daysSinceUpdate = (Date.now() - new Date(m.updated_at).getTime()) / (1000 * 3600 * 24);
        return m.pipeline_stage !== 'won' && m.pipeline_stage !== 'lost' && daysSinceUpdate > 7;
    }).slice(0, 3);

    const newRequests = matches.filter(m => m.pipeline_stage === 'new request').slice(0, 3);

    const recentActivity = matches.slice(0, 5); // Just top 5 most recent by updated_at

    if (loading) {
        return <div className="p-12 text-center text-zinc-500 animate-pulse">Loading dashboard...</div>;
    }

    return (
        <div className="p-6 md:p-12 max-w-7xl mx-auto w-full space-y-8 animate-in fade-in duration-500">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h2 className="text-3xl md:text-4xl font-serif text-zinc-900 dark:text-white mb-2">Command Center</h2>
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm">Welcome back, {user?.friendlyBusinessName || user?.name}. Here's your business at a glance.</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => onNavigate('Pipeline')}
                        className="px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-lg text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-opacity flex items-center gap-2"
                    >
                        View Pipeline <ArrowRight size={14} />
                    </button>
                </div>
            </div>

            {/* Pulse Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Pipeline Value */}
                <div className="p-6 bg-white dark:bg-[#0A0A0A] rounded-2xl border border-zinc-200 dark:border-white/10 shadow-sm flex flex-col justify-between group">
                    <div>
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-emerald-100 dark:bg-emerald-500/10 rounded-lg text-emerald-600 dark:text-emerald-400">
                                <DollarSign size={20} />
                            </div>
                            {/* <span className="text-[10px] uppercase tracking-widest text-emerald-500 font-bold">+12%</span> */}
                        </div>
                        <p className="text-xs uppercase tracking-widest text-zinc-500 dark:text-zinc-500 mb-1">Total Pipeline Value</p>
                        <h3 className="text-2xl md:text-3xl font-medium text-zinc-900 dark:text-white">
                            {formatCurrency(stats.totalPipelineValue)}
                        </h3>
                    </div>
                    {/* <div className="mt-4 h-1 w-full bg-zinc-100 dark:bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 w-[70%] rounded-full"></div>
                    </div> */}
                </div>

                {/* Win Rate */}
                <div className="p-6 bg-white dark:bg-[#0A0A0A] rounded-2xl border border-zinc-200 dark:border-white/10 shadow-sm flex flex-col justify-between">
                    <div>
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-blue-100 dark:bg-blue-500/10 rounded-lg text-blue-600 dark:text-blue-400">
                                <TrendingUp size={20} />
                            </div>
                        </div>
                        <p className="text-xs uppercase tracking-widest text-zinc-500 dark:text-zinc-500 mb-1">Win Rate</p>
                        <h3 className="text-2xl md:text-3xl font-medium text-zinc-900 dark:text-white">
                            {stats.winRate}%
                        </h3>
                    </div>
                </div>

                {/* Active Opportunities */}
                <div className="p-6 bg-white dark:bg-[#0A0A0A] rounded-2xl border border-zinc-200 dark:border-white/10 shadow-sm flex flex-col justify-between">
                    <div>
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-purple-100 dark:bg-purple-500/10 rounded-lg text-purple-600 dark:text-purple-400">
                                <Briefcase size={20} />
                            </div>
                        </div>
                        <p className="text-xs uppercase tracking-widest text-zinc-500 dark:text-zinc-500 mb-1">Active Deals</p>
                        <h3 className="text-2xl md:text-3xl font-medium text-zinc-900 dark:text-white">
                            {stats.activeOpportunities}
                        </h3>
                    </div>
                </div>

                {/* Avg Deal Size */}
                <div className="p-6 bg-white dark:bg-[#0A0A0A] rounded-2xl border border-zinc-200 dark:border-white/10 shadow-sm flex flex-col justify-between">
                    <div>
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-amber-100 dark:bg-amber-500/10 rounded-lg text-amber-600 dark:text-amber-400">
                                <Activity size={20} />
                            </div>
                        </div>
                        <p className="text-xs uppercase tracking-widest text-zinc-500 dark:text-zinc-500 mb-1">Avg Deal Size</p>
                        <h3 className="text-2xl md:text-3xl font-medium text-zinc-900 dark:text-white">
                            {formatCurrency(stats.avgDealSize)}
                        </h3>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Main Content Column (2/3) */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Action Center */}
                    <div className="bg-white dark:bg-[#0A0A0A] rounded-3xl border border-zinc-200 dark:border-white/10 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-zinc-100 dark:border-white/5 flex justify-between items-center">
                            <h3 className="font-serif text-xl text-zinc-900 dark:text-white">Action Center</h3>
                            <span className="text-[10px] uppercase tracking-widest text-zinc-400">Priority Items</span>
                        </div>
                        <div className="p-2 space-y-1">
                            {staleLeads.length === 0 && newRequests.length === 0 && (
                                <div className="p-8 text-center text-zinc-500 text-sm">
                                    <CheckCircle2 className="mx-auto mb-2 text-emerald-500" size={24} />
                                    No urgent actions. You're all caught up!
                                </div>
                            )}

                            {newRequests.map(match => (
                                <div key={match.id} onClick={() => onNavigate('Pipeline')} className="p-4 hover:bg-zinc-50 dark:hover:bg-white/5 rounded-2xl cursor-pointer group transition-colors flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-500/20 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                                            <AlertCircle size={20} />
                                        </div>
                                        <div>
                                            <p className="font-medium text-zinc-900 dark:text-white text-sm group-hover:underline">New Request: {match.homeowner.full_name}</p>
                                            <p className="text-xs text-zinc-500">Budget: {match.homeowner.budget_range}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] uppercase tracking-widest font-bold text-blue-500 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded">Review</span>
                                    </div>
                                </div>
                            ))}

                            {staleLeads.map(match => (
                                <div key={match.id} onClick={() => onNavigate('Pipeline')} className="p-4 hover:bg-zinc-50 dark:hover:bg-white/5 rounded-2xl cursor-pointer group transition-colors flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-amber-100 dark:bg-amber-500/20 rounded-full flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                                            <Clock size={20} />
                                        </div>
                                        <div>
                                            <p className="font-medium text-zinc-900 dark:text-white text-sm group-hover:underline">Stale Lead: {match.homeowner.full_name}</p>
                                            <p className="text-xs text-zinc-500">No activity in 7+ days. Stage: {match.pipeline_stage}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] uppercase tracking-widest font-bold text-amber-500 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded">Follow Up</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Sales Funnel Visual */}
                    {/* Simple implementation: Just showing counts for now. Could be a chart. */}
                    <div className="bg-white dark:bg-[#0A0A0A] rounded-3xl border border-zinc-200 dark:border-white/10 shadow-sm overflow-hidden p-6">
                        <h3 className="font-serif text-xl text-zinc-900 dark:text-white mb-6">Pipeline Health</h3>
                        <div className="space-y-4">
                            {[
                                { label: 'New Request', count: matches.filter(m => m.pipeline_stage === 'new request').length, color: 'bg-blue-500' },
                                { label: 'Contacted', count: matches.filter(m => m.pipeline_stage === 'contacted').length, color: 'bg-yellow-500' },
                                { label: 'Proposal Sent', count: matches.filter(m => m.pipeline_stage === 'proposal sent').length, color: 'bg-purple-500' },
                                { label: 'Won', count: stats.wonCount, color: 'bg-emerald-500' },
                            ].map(stage => (
                                <div key={stage.label}>
                                    <div className="flex justify-between text-xs uppercase tracking-widest text-zinc-500 mb-1">
                                        <span>{stage.label}</span>
                                        <span>{stage.count} deals</span>
                                    </div>
                                    <div className="h-2 w-full bg-zinc-100 dark:bg-white/5 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${stage.color} rounded-full transition-all duration-1000`}
                                            style={{ width: `${stats.activeOpportunities + stats.wonCount > 0 ? (stage.count / (stats.activeOpportunities + stats.wonCount)) * 100 : 0}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>

                {/* Sidebar Column (1/3) */}
                <div className="space-y-8">
                    {/* Recent Activity Feed */}
                    <div className="bg-zinc-50 dark:bg-white/[0.02] border border-zinc-200 dark:border-white/5 rounded-3xl p-6 h-full">
                        <h3 className="font-serif text-lg text-zinc-900 dark:text-white mb-6">Recent Activity</h3>
                        <div className="relative pl-4 border-l border-zinc-200 dark:border-white/10 space-y-8">
                            {recentActivity.map((match, i) => (
                                <div key={match.id} className="relative">
                                    <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700 border-4 border-zinc-50 dark:border-black"></div>
                                    <p className="text-xs text-zinc-500 mb-1">{new Date(match.updated_at).toLocaleDateString()}</p>
                                    <p className="text-sm font-medium text-zinc-900 dark:text-white">
                                        Updated deal with <span className="font-bold">{match.homeowner.full_name}</span>
                                    </p>
                                    <p className="text-xs text-zinc-400 mt-1 uppercase tracking-wider">
                                        Moved to <span className="text-zinc-600 dark:text-zinc-300 font-bold">{match.pipeline_stage}</span>
                                    </p>
                                </div>
                            ))}
                            {recentActivity.length === 0 && (
                                <p className="text-sm text-zinc-500 italic">No recent activity recorded.</p>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};
