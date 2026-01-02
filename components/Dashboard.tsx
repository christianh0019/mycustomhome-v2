import React from 'react';
import { ROADMAP_CONFIG } from '../services/RoadmapService';
import { useProjectContext } from '../contexts/ProjectContext';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import {
    LayoutDashboard, DollarSign, Map, ArrowRight,
    TrendingUp, Calendar, AlertCircle
} from 'lucide-react';
import { useNavigation } from '../contexts/NavigationContext';
import { AppTab } from '../types';

export const Dashboard: React.FC = () => {
    const { user } = useAuth();
    const { projectData } = useProjectContext();
    const { navigateTo } = useNavigation();
    const { budget, roadmap } = projectData;

    // Calculate quick stats
    const hardCost = budget.totalBudget - (budget.hasLand ? 0 : budget.landCost) - (budget.includeSoftCosts ? budget.totalBudget * 0.15 : 0);
    const ppsf = hardCost / budget.targetSqFt;

    const cards = [
        {
            title: "Project Budget",
            value: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(budget.totalBudget),
            subtitle: `${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(ppsf)} / sqft available`,
            icon: DollarSign,
            color: "bg-emerald-500/10 text-emerald-400",
            action: () => navigateTo(AppTab.BudgetCreator),
            actionText: "Adjust Budget"
        },
        {
            title: "Roadmap Status",
            value: `Stage ${roadmap.currentStage}`,
            subtitle: ROADMAP_CONFIG[roadmap.currentStage as keyof typeof ROADMAP_CONFIG]?.name || 'Unknown Stage',
            icon: Map,
            color: "bg-blue-500/10 text-blue-400",
            action: () => navigateTo(AppTab.Roadmap),
            actionText: "View Roadmap"
        },
        {
            title: "Project Timeline",
            value: "Pre-Construction",
            subtitle: "Estimated Start: Summer 2026",
            icon: Calendar,
            color: "bg-purple-500/10 text-purple-400",
            action: null,
            actionText: null
        }
    ];

    return (
        <div className="flex-1 h-screen overflow-y-auto bg-zinc-50 dark:bg-black p-8 relative transition-colors duration-300">
            {/* Background Gradients */}
            <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-white to-transparent dark:from-zinc-900 dark:to-transparent pointer-events-none transition-colors duration-300" />

            <div className="max-w-6xl mx-auto relative z-10">
                {/* Header */}
                <div className="mb-12">
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 to-zinc-500 dark:from-white dark:to-zinc-500 mb-2">
                        Good Morning{user?.email ? `, ${user.email.split('@')[0]}` : ''}
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400">Here's what's happening with your project today.</p>
                </div>

                {/* Hero Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {cards.map((card, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-white dark:bg-[#0A0A0A] border border-zinc-200 dark:border-white/5 rounded-3xl p-6 hover:border-zinc-300 dark:hover:border-white/10 transition-colors group relative overflow-hidden shadow-sm dark:shadow-none"
                        >
                            <div className={`size-12 rounded-2xl flex items-center justify-center mb-4 ${card.color}`}>
                                <card.icon size={24} />
                            </div>
                            <h3 className="text-zinc-500 dark:text-zinc-400 text-sm font-medium mb-1">{card.title}</h3>
                            <div className="text-2xl font-bold text-zinc-900 dark:text-white mb-1">{card.value}</div>
                            <div className="text-xs text-zinc-500 font-mono mb-6">{card.subtitle}</div>

                            {card.action && (
                                <button
                                    onClick={card.action}
                                    className="flex items-center gap-2 text-sm text-zinc-600 dark:text-white/70 hover:text-zinc-900 dark:hover:text-white transition-colors group-hover:translate-x-1 duration-300"
                                >
                                    {card.actionText} <ArrowRight size={14} />
                                </button>
                            )}
                        </motion.div>
                    ))}
                </div>

                {/* AI Insight Area */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white dark:bg-white/[0.02] border border-zinc-200 dark:border-white/5 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between shadow-sm dark:shadow-none"
                >
                    <div className="flex items-center gap-6 mb-6 md:mb-0">
                        <div className="size-16 rounded-full bg-indigo-50 dark:bg-gradient-to-br dark:from-indigo-500/20 dark:to-purple-500/20 border border-indigo-100 dark:border-indigo-500/30 flex items-center justify-center">
                            <TrendingUp size={24} className="text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-1">Project Analysis</h3>
                            <p className="text-zinc-500 dark:text-zinc-400 text-sm max-w-xl">
                                Based on your current budget of <span className="text-zinc-900 dark:text-white font-mono">${(budget.totalBudget / 1000).toFixed(0)}k</span>,
                                your target size of <span className="text-zinc-900 dark:text-white font-mono">{budget.targetSqFt} sqft</span> allows for
                                <span className="text-zinc-900 dark:text-white font-medium"> ${(ppsf).toFixed(0)}/sqft</span> in hard costs.
                                {ppsf < 250 ? " This is lean." : ppsf > 400 ? " This is a healthy budget." : " This is workable."}
                            </p>
                        </div>
                    </div>
                    {/* Market Data Context Alert */}
                    {budget.marketData ? (
                        <div className={`px-4 py-2 rounded-lg border flex items-center gap-2 ${ppsf < budget.marketData.low
                            ? 'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400'
                            : ppsf > budget.marketData.high
                                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                                : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-600 dark:text-yellow-400'
                            }`}>
                            <AlertCircle size={16} />
                            <span className="text-sm font-medium">
                                {ppsf < budget.marketData.low
                                    ? "Below Market Rate"
                                    : ppsf > budget.marketData.high
                                        ? "Strong Budget"
                                        : "In Market Range"}
                            </span>
                        </div>
                    ) : null}


                    <div className="mt-6 pt-6 border-t border-zinc-100 dark:border-white/5 w-full md:hidden">
                        {/* Mobile explanation fallback if needed, but the main text covers it. keeping structure clean */}
                        <p className="text-zinc-500 dark:text-zinc-400 text-sm">
                            <strong className="text-zinc-900 dark:text-white">Analysis:</strong> Based on
                            {budget.marketData ? ` ${budget.marketData.city} rates` : ' national averages'},
                            this is {ppsf < (budget.marketData?.low || 250) ? 'lean' : 'healthy'} for this market.
                        </p>
                    </div>
                </motion.div>
            </div >
        </div >
    );
};
