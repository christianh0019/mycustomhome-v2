import React, { useEffect, useState } from 'react';
import { LedgerService } from '../services/LedgerService';
import { BudgetCategory, Transaction, LedgerSummary, AppTab } from '../types';
import { DollarSign, TrendingUp, AlertCircle, FileText, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { OnboardingModal } from './OnboardingModal';
import { markFeatureAsSeen } from './NewBadge';

export const Ledger: React.FC = () => {
    const [summary, setSummary] = useState<LedgerSummary | null>(null);
    const [categories, setCategories] = useState<BudgetCategory[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);

    // Tour State
    const [showTour, setShowTour] = useState(false);

    // Check Local Storage for Tour
    useEffect(() => {
        const TOUR_KEY = 'has_seen_ledger_tour';
        const hasSeen = localStorage.getItem(TOUR_KEY);

        if (!hasSeen) {
            setShowTour(true);
        }
    }, []);

    const handleTourClose = () => {
        const TOUR_KEY = 'has_seen_ledger_tour';
        localStorage.setItem(TOUR_KEY, 'true');
        setShowTour(false);
        markFeatureAsSeen(AppTab.TheLedger);
    };

    useEffect(() => {
        const loadData = async () => {
            try {
                const [sum, cats, txs] = await Promise.all([
                    LedgerService.getSummary(),
                    LedgerService.getCategories(),
                    LedgerService.getTransactions()
                ]);
                setSummary(sum);
                setCategories(cats);
                setTransactions(txs);
            } catch (err) {
                console.error("Failed to load ledger data", err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    if (loading || !summary) {
        return <div className="p-12 text-zinc-500">Loading Financial Data...</div>;
    }

    // Thermometer Value Logic
    const loanUtilization = (summary.total_committed / summary.total_loan) * 100;
    const cashSpent = (summary.total_paid / summary.total_loan) * 100;

    return (
        <div className="p-6 md:p-12 lg:p-12 max-w-7xl mx-auto w-full min-h-screen text-zinc-900 dark:text-zinc-100 pb-32 transition-colors duration-300">
            <OnboardingModal
                isOpen={showTour}
                onClose={handleTourClose}
                title="Financial Command Center"
                description="This is your single source of financial truth. No more spreadsheets, no more guessing."
                features={[
                    "Real-time Budget Tracking: See exactly what is committed vs paid.",
                    "Loan Health: Watch your loan utilization thermometer to avoid overruns.",
                    "Live Feed: Every transaction recorded instantly."
                ]}
                type="TAB_WELCOME"
            />

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                <div className="space-y-3">
                    <h2 className="text-4xl md:text-5xl font-serif tracking-tighter">The Ledger</h2>
                    <div className="h-[1px] w-12 bg-zinc-300 dark:bg-white/30"></div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 dark:text-white/40">Financial Truth Source</p>
                </div>

                <div className="flex gap-4">
                    <div className="bg-white dark:bg-[#111] border border-zinc-200 dark:border-white/10 px-6 py-3 rounded-2xl text-right shadow-sm dark:shadow-none">
                        <span className="text-[9px] uppercase tracking-widest text-zinc-500 block">Total Budget</span>
                        <span className="text-xl font-serif text-zinc-900 dark:text-white">${summary.total_budgeted.toLocaleString()}</span>
                    </div>
                    <div className="bg-white dark:bg-[#111] border border-zinc-200 dark:border-white/10 px-6 py-3 rounded-2xl text-right shadow-sm dark:shadow-none">
                        <span className="text-[9px] uppercase tracking-widest text-zinc-500 block">Cash on Hand</span>
                        <span className="text-xl font-serif text-emerald-500 dark:text-emerald-400">${summary.cash_on_hand.toLocaleString()}</span>
                    </div>
                </div>
            </div>

            {/* The Thermometer (Main Visual) */}
            <div className="mb-16">
                <div className="flex justify-between text-xs text-zinc-500 mb-2 uppercase tracking-widest">
                    <span>$0</span>
                    <span>Loan Limit: ${summary.total_loan.toLocaleString()}</span>
                </div>

                <div className="h-16 w-full bg-white dark:bg-[#111] rounded-2xl border border-zinc-200 dark:border-white/10 relative overflow-hidden flex items-center px-2">
                    {/* Background Hatching */}
                    <div className="absolute inset-0 opacity-5 dark:opacity-10" style={{ backgroundImage: 'linear-gradient(45deg, #000 25%, transparent 25%, transparent 50%, #000 50%, #000 75%, transparent 75%, transparent)', backgroundSize: '20px 20px' }} />

                    {/* Committed Bar (Blue) */}
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${loanUtilization}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="h-10 bg-blue-500/20 border border-blue-500/50 rounded-lg absolute left-2 z-10 flex items-center justify-end px-3"
                    >
                        <span className="text-[10px] font-bold text-blue-300 whitespace-nowrap drop-shadow-md">
                            Committed: ${(summary.total_committed / 1000).toFixed(0)}k
                        </span>
                    </motion.div>

                    {/* Paid Bar (Red/Green - let's use Emerald for 'Paid/Equity' or Rose for 'Outflow'?)
                         Standard accounting: Outflow is red. But hitting budget is good.
                         Let's use White/Zinc for "Real Cash Spent".
                      */}
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${cashSpent}%` }}
                        transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
                        className="h-10 bg-zinc-100 border border-zinc-300 rounded-lg absolute left-2 z-20 shadow-sm flex items-center justify-end px-3"
                    >
                        <span className="text-[10px] font-bold text-zinc-900 whitespace-nowrap">
                            Paid: ${(summary.total_paid / 1000).toFixed(0)}k
                        </span>
                    </motion.div>
                </div>
                <div className="mt-2 text-right text-[10px] text-zinc-600 uppercase tracking-widest">
                    {(loanUtilization).toFixed(1)}% of Loan Limit Committed
                </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Col: Categories (Budget Breakdown) */}
                <div className="lg:col-span-1 space-y-4">
                    <h3 className="text-sm font-medium text-zinc-900 dark:text-white mb-6 flex items-center gap-2">
                        <DollarSign size={16} /> Budget Breakdown
                    </h3>

                    {categories.map(cat => {
                        const percent = (cat.committed / cat.budgeted) * 100;
                        return (
                            <div key={cat.id} className="p-4 rounded-xl bg-white dark:bg-[#0A0A0A] border border-zinc-200 dark:border-white/5 hover:bg-zinc-50 dark:hover:bg-white/[0.02] transition-colors group shadow-sm dark:shadow-none">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <div className="text-xs font-medium text-zinc-900 dark:text-white group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors">{cat.name}</div>
                                        <div className="text-[10px] text-zinc-500 uppercase tracking-wider mt-0.5">
                                            ${cat.committed.toLocaleString()} / ${cat.budgeted.toLocaleString()}
                                        </div>
                                    </div>
                                    {cat.paid > 0 && (
                                        <span className="text-[10px] px-2 py-0.5 bg-zinc-100 dark:bg-white/10 rounded text-zinc-600 dark:text-zinc-300">
                                            Pd: ${cat.paid.toLocaleString()}
                                        </span>
                                    )}
                                </div>
                                {/* Mini Progress */}
                                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full ${percent > 100 ? 'bg-rose-500' : 'bg-zinc-500'}`}
                                        style={{ width: `${Math.min(percent, 100)}%` }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Right Col: Transaction Feed */}
                <div className="lg:col-span-2">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-sm font-medium text-zinc-900 dark:text-white flex items-center gap-2">
                            <TrendingUp size={16} /> Recent Activity
                        </h3>
                        <button className="text-[10px] uppercase tracking-widest text-emerald-400 hover:text-emerald-300">
                            + Add Expense
                        </button>
                    </div>

                    <div className="bg-white dark:bg-[#0A0A0A] border border-zinc-200 dark:border-white/5 rounded-2xl overflow-hidden shadow-sm dark:shadow-none transition-colors duration-300">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-zinc-50 dark:bg-white/[0.02] border-b border-zinc-200 dark:border-white/5 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">
                                <tr>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4">Vendor</th>
                                    <th className="px-6 py-4">Description</th>
                                    <th className="px-6 py-4 text-right">Amount</th>
                                    <th className="px-6 py-4 text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100 dark:divide-white/5">
                                {transactions.map(tx => (
                                    <tr key={tx.id} className="hover:bg-zinc-50 dark:hover:bg-white/[0.02] transition-colors group">
                                        <td className="px-6 py-4 text-zinc-500 dark:text-zinc-400 font-mono text-xs">{tx.date}</td>
                                        <td className="px-6 py-4 font-medium text-zinc-900 dark:text-white">{tx.vendor}</td>
                                        <td className="px-6 py-4 text-zinc-500 dark:text-zinc-400">
                                            {tx.description}
                                            {tx.category_id && (
                                                <span className="ml-2 text-[9px] px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-white/5 text-zinc-500">
                                                    {categories.find(c => c.id === tx.category_id)?.name}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right font-mono text-zinc-900 dark:text-white">
                                            ${tx.amount.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className={`text-[10px] px-2 py-1 rounded border capitalize ${tx.status === 'cleared'
                                                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
                                                : 'bg-amber-500/10 border-amber-500/20 text-amber-500'
                                                }`}>
                                                {tx.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {transactions.length === 0 && (
                            <div className="p-12 text-center text-zinc-500 dark:text-zinc-400 text-sm">
                                No transactions recorded yet.
                            </div>
                        )}

                        <div className="p-4 border-t border-zinc-200 dark:border-white/5 text-center">
                            <button className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">
                                View All History
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};
