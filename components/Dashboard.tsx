import React from 'react';
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
            subtitle: "Financial Foundation",
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
        <div className="flex-1 h-screen overflow-y-auto bg-black p-8 relative">
            {/* Background Gradients */}
            <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-zinc-900 to-transparent pointer-events-none" />

            <div className="max-w-6xl mx-auto relative z-10">
                {/* Header */}
                <div className="mb-12">
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-500 mb-2">
                        Good Morning{user?.email ? `, ${user.email.split('@')[0]}` : ''}
                    </h1>
                    <p className="text-zinc-400">Here's what's happening with your project today.</p>
                </div>

                {/* Hero Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {cards.map((card, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-[#0A0A0A] border border-white/5 rounded-3xl p-6 hover:border-white/10 transition-colors group relative overflow-hidden"
                        >
                            <div className={`size-12 rounded-2xl flex items-center justify-center mb-4 ${card.color}`}>
                                <card.icon size={24} />
                            </div>
                            <h3 className="text-zinc-400 text-sm font-medium mb-1">{card.title}</h3>
                            <div className="text-2xl font-bold text-white mb-1">{card.value}</div>
                            <div className="text-xs text-zinc-500 font-mono mb-6">{card.subtitle}</div>

                            {card.action && (
                                <button
                                    onClick={card.action}
                                    className="flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors group-hover:translate-x-1 duration-300"
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
                    className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 flex items-center justify-between"
                >
                    <div className="flex items-center gap-6">
                        <div className="size-16 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center">
                            <TrendingUp size={24} className="text-indigo-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white mb-1">Project Analysis</h3>
                            <p className="text-zinc-400 text-sm max-w-xl">
                                Based on your current budget of <span className="text-white font-mono">${(budget.totalBudget / 1000).toFixed(0)}k</span>,
                                your target size of <span className="text-white font-mono">{budget.targetSqFt} sqft</span> allows for
                                <span className="text-white font-medium"> ${(ppsf).toFixed(0)}/sqft</span> in hard costs.
                                {ppsf < 250 ? " This is lean." : ppsf > 400 ? " This is a healthy budget." : " This is workable."}
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};
