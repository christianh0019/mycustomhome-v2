import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { LocationCostService, MarketData } from '../../services/LocationCostService';
import { calculateBudgetBreakdown, getFeasibilityStatus as checkFeasibility, BudgetBreakdown } from '../../services/BudgetLogic';
import { Calculator, MapPin, CheckCircle, AlertTriangle, ArrowRight, Info, Home, Layers, DollarSign } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { usePageContext } from '../../contexts/PageContext';
import { useProjectContext } from '../../contexts/ProjectContext';
import { ARTICLES, Article } from '../../data/knowledgeBaseData';
import { HelpCircle, X, Clock } from 'lucide-react';

export const BudgetCreator: React.FC = () => {
    const { user, updateProfile } = useAuth();

    // Inputs

    const [isLoadingMarket, setIsLoadingMarket] = useState(false);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    // Educational Modal State
    const [viewingArticle, setViewingArticle] = useState<Article | null>(null);

    // Global Project State
    const { projectData, updateBudget } = useProjectContext();
    const { totalBudget, landCost, targetSqFt, includeSoftCosts, hasLand, city, marketData } = projectData.budget;

    // Context Sharing
    const { setPageData } = usePageContext();

    // Calculate Breakdown
    const breakdown = calculateBudgetBreakdown(totalBudget, !hasLand ? landCost : 0, targetSqFt, includeSoftCosts);

    // Calculate Feasibility
    const feasibility = breakdown.hardCostPerSqFt > 0 && marketData
        ? checkFeasibility(breakdown.hardCostPerSqFt, marketData.low, marketData.high)
        : null;

    const handleRunMarketResearch = async () => {
        setIsLoadingMarket(true);
        setShowSuggestions(false); // Hide suggestions when searching
        if (city) {
            const data = await LocationCostService.getMarketData(city);
            if (data) {
                updateBudget({ marketData: data });
            }
        }
        setIsLoadingMarket(false);
    };

    const handleCityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        updateBudget({ city: e.target.value });
    };

    // Debounced Autocomplete
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (city && city.length >= 2) {
                // Only search if not currently selecting (optional optimization, but simple check is enough)
                const matches = await LocationCostService.searchCities(city);
                setSuggestions(matches);
                // Only show if we have matches and the user hasn't exactly matched one yet (optional)
                setShowSuggestions(matches.length > 0);
            } else {
                setSuggestions([]);
                setShowSuggestions(false);
            }
        }, 400); // 400ms debounce

        return () => clearTimeout(timer);
    }, [city]);

    const selectCity = (selectedCity: string) => {
        updateBudget({ city: selectedCity });
        setSuggestions([]);
        setShowSuggestions(false);
        // Optional: Auto-trigger search or let user click arrow? 
        // User said: "when they choose one and hit the arrow" -> implies manual trigger after selection.
        // But also said "choose one ... an actual ai search should occur". 
        // I'll leave it manual trigger via arrow/enter for now to match "hit the arrow".
    };

    // Auto-run on mount if we have city
    useEffect(() => {
        if (city && !marketData) {
            handleRunMarketResearch();
        }
    }, [city, marketData]); // Added marketData to dependencies

    // Sync to PageContext for AI
    useEffect(() => {
        setPageData({
            currentApp: "Budget Creator",
            inputs: {
                totalBudget,
                landCost,
                targetSqFt,
                includeSoftCosts,
                hasLand
            },
            results: {
                hardConstructionBudget: breakdown.hardConstructionBudget,
                hardCostPerSqFt: breakdown.hardCostPerSqFt,
                feasibilityStatus: feasibility?.status || "Unknown",
                marketCity: city || "None"
            }
        });

        // Cleanup on unmount
        return () => setPageData({});
    }, [totalBudget, landCost, targetSqFt, includeSoftCosts, hasLand, feasibility, breakdown, city, setPageData]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
    };

    return (
        <div className="p-6 md:p-12 max-w-7xl mx-auto w-full min-h-screen text-zinc-100 pb-32 relative">

            {/* Article Modal Overlay */}
            <AnimatePresence>
                {viewingArticle && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                            onClick={() => setViewingArticle(null)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-[#111] border border-white/10 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl relative z-60 shadow-2xl flex flex-col"
                        >
                            <div className={`h - 32 bg - gradient - to - r ${viewingArticle.gradient} shrink - 0 relative flex items - center px - 8`}>
                                <button
                                    onClick={() => setViewingArticle(null)}
                                    className="absolute top-4 right-4 p-2 bg-black/20 rounded-full hover:bg-black/40 text-white transition-colors"
                                >
                                    <X size={18} />
                                </button>
                                <viewingArticle.icon size={64} className="text-white/20 absolute right-8" />
                                <div>
                                    <span className="text-[10px] uppercase tracking-widest text-white/60 bg-black/20 px-2 py-1 rounded-full mb-2 inline-block">
                                        {viewingArticle.category}
                                    </span>
                                    <h2 className="text-2xl font-serif text-white">{viewingArticle.title}</h2>
                                </div>
                            </div>
                            <div className="p-8">
                                <div className="flex items-center gap-2 text-xs text-zinc-500 mb-6 uppercase tracking-widest">
                                    <Clock size={12} /> {viewingArticle.readTime}
                                </div>
                                <div className="prose prose-invert prose-sm text-zinc-300">
                                    {viewingArticle.content}
                                </div>
                                <button
                                    onClick={() => setViewingArticle(null)}
                                    className="mt-8 w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-medium transition-colors"
                                >
                                    Close Guide
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                <div className="space-y-3">
                    <h2 className="text-4xl md:text-5xl font-serif tracking-tighter text-white">The Budget</h2>
                    <div className="h-[1px] w-12 bg-white/30"></div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">Align your dream with market reality</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                {/* LEFT COLUMN: Inputs */}
                <div className="lg:col-span-5 space-y-8">

                    {/* 1. Market Research (AI Context) */}
                    <div className="bg-[#111] border border-white/5 rounded-2xl p-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-20 bg-blue-500/5 blur-3xl rounded-full pointer-events-none" />

                        <div className="flex items-center gap-3 mb-4">
                            <div className="size-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">
                                <MapPin size={16} />
                            </div>
                            <h3 className="text-sm font-bold uppercase tracking-widest">Market Context</h3>
                        </div>

                        <div className="flex gap-2 mb-4 relative">
                            <div className="relative w-full">
                                <input
                                    placeholder="Enter City, State..."
                                    value={city}
                                    onChange={handleCityChange}
                                    onKeyPress={(e) => e.key === 'Enter' && handleRunMarketResearch()}
                                    className="bg-transparent border-none text-white focus:ring-0 placeholder:text-zinc-600 w-full"
                                />
                                {showSuggestions && (
                                    <div className="absolute top-full left-0 right-0 mt-2 bg-[#111] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden">
                                        {suggestions.map((s) => (
                                            <button
                                                key={s}
                                                onClick={() => selectCity(s)}
                                                className="w-full text-left px-4 py-3 text-sm text-zinc-300 hover:bg-white/5 hover:text-white transition-colors border-b border-white/5 last:border-0"
                                            >
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={handleRunMarketResearch}
                                disabled={isLoadingMarket}
                                className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg px-4 flex items-center justify-center transition-colors shrink-0"
                            >
                                {isLoadingMarket ? <div className="size-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <ArrowRight size={16} />}
                            </button>
                        </div>

                        <AnimatePresence mode="wait">
                            {marketData ? (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="space-y-2"
                                >
                                    <p className="text-xs text-zinc-400 leading-relaxed">
                                        <span className="text-blue-400 font-bold">AI Insight:</span> {marketData.description}
                                    </p>
                                    <div className="flex justify-between items-center text-xs pt-2 border-t border-white/5">
                                        <span className="text-zinc-500">Typical Range:</span>
                                        <span className="font-mono text-zinc-300">${marketData.low} - ${marketData.high} / sqft</span>
                                    </div>
                                </motion.div>
                            ) : (
                                <div className="text-xs text-zinc-600 italic">Enter location to fetch cost data...</div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* 2. Project Inputs */}
                    <div className="space-y-8">
                        {/* Total Budget */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <label className="text-xs uppercase tracking-widest text-zinc-400">Total Investment Cap</label>
                                <span className="text-xl font-serif text-white">{formatCurrency(totalBudget)}</span>
                            </div>
                            <input
                                type="range"
                                min={300000} max={5000000} step={10000}
                                value={totalBudget}
                                onChange={(e) => updateBudget({ totalBudget: Number(e.target.value) })}
                                className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-white"
                            />
                        </div>

                        {/* Land Logic */}
                        <div className="bg-white/5 rounded-xl p-4 space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Layers size={14} className="text-zinc-400" />
                                    <span className="text-xs uppercase tracking-widest text-zinc-300">Land Status</span>
                                    <button onClick={() => setViewingArticle(ARTICLES.find(a => a.id === 10) || null)} className="text-blue-400/80 hover:text-blue-400 transition-colors p-1 hover:bg-white/5 rounded-full">
                                        <HelpCircle size={18} />
                                    </button>
                                </div>
                                <div className="flex gap-2 mb-4 bg-zinc-900 p-1 rounded-lg w-fit">
                                    <button onClick={() => updateBudget({ hasLand: true })} className={`px-3 py-1.5 text-xs rounded-md transition-all ${hasLand ? 'bg-white text-black font-medium' : 'text-zinc-500 hover:text-white'}`}>
                                        I have land
                                    </button>
                                    <button onClick={() => updateBudget({ hasLand: false })} className={`px-3 py-1.5 text-xs rounded-md transition-all ${!hasLand ? 'bg-white text-black font-medium' : 'text-zinc-500 hover:text-white'}`}>
                                        I need land
                                    </button>
                                </div>
                            </div>

                            <AnimatePresence>
                                {!hasLand && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-zinc-400">Estimated Land Cost</span>
                                                <span className="font-mono text-white">{formatCurrency(landCost)}</span>
                                            </div>
                                            <input
                                                type="range"
                                                min={0} max={1000000} step={5000}
                                                value={landCost}
                                                onChange={(e) => updateBudget({ landCost: Number(e.target.value) })}
                                                className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-white"
                                            />
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Soft Cost Toggle */}
                        <div className="flex items-center justify-between p-4 border border-white/5 rounded-xl hover:bg-white/[0.02] transition-colors cursor-pointer" onClick={() => updateBudget({ includeSoftCosts: !includeSoftCosts })}>
                            <div className="flex items-center gap-3">
                                <div className={`size-4 border rounded flex items-center justify-center transition-colors ${includeSoftCosts ? 'bg-emerald-500 border-emerald-500' : 'border-zinc-600'} `}>
                                    {includeSoftCosts && <CheckCircle size={10} className="text-black" />}
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs font-medium text-zinc-300">Include Soft Costs?</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] text-zinc-500">Permits, Design, Engineering (~20%)</span>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setViewingArticle(ARTICLES.find(a => a.id === 9) || null); }}
                                            className="text-blue-400/80 hover:text-blue-400 transition-colors p-1 hover:bg-white/5 rounded-full"
                                        >
                                            <HelpCircle size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Size Slider */}
                        <div className="space-y-4 pt-6 border-t border-white/10">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <label className="text-xs uppercase tracking-widest text-zinc-400">Target Home Size</label>
                                    <button onClick={() => setViewingArticle(ARTICLES.find(a => a.id === 12) || null)} className="text-blue-400/80 hover:text-blue-400 transition-colors p-1 hover:bg-white/5 rounded-full">
                                        <HelpCircle size={18} />
                                    </button>
                                </div>
                                <span className="text-xl font-serif text-white">{targetSqFt.toLocaleString()} sq ft</span>
                            </div>
                            <input
                                type="range"
                                min={1000} max={10000} step={50}
                                value={targetSqFt}
                                onChange={(e) => updateBudget({ targetSqFt: Number(e.target.value) })}
                                className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-white"
                            />
                            {/* Visualizer Helper */}
                            <div className="text-xs text-center text-zinc-500 bg-white/5 py-2 rounded-lg">
                                {targetSqFt < 2000 && "Comfortable 2-3 Bed, Small Lot"}
                                {targetSqFt >= 2000 && targetSqFt < 3000 && "Spacious Family Home, 3-4 Bed, Office"}
                                {targetSqFt >= 3000 && targetSqFt < 4500 && "Luxury Size, 4+ Bed, Rec Room, Large Garage"}
                                {targetSqFt >= 4500 && "Estate Size, Extensive Amenities"}
                            </div>
                        </div>

                    </div>
                </div>

                {/* RIGHT COLUMN: The Breakdown & Reality Check */}
                <div className="lg:col-span-7 space-y-6">

                    {/* The Waterfall Waterfall */}
                    <div className="bg-zinc-900/50 rounded-3xl p-8 border border-white/5">
                        <h3 className="text-lg font-serif text-white mb-6">Where the money goes</h3>

                        <div className="space-y-1 relative">
                            {/* Total Bar */}
                            <div className="h-16 bg-[#111] rounded-xl flex items-center px-6 border border-white/10 justify-between relative z-30">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white/10 rounded-lg"><DollarSign size={16} /></div>
                                    <span className="text-sm font-medium">Total Budget</span>
                                </div>
                                <span className="text-lg font-bold">{formatCurrency(breakdown.totalBudget)}</span>
                            </div>

                            {/* Deductions Connector */}
                            <div className="pl-10 ml-6 border-l-2 border-dashed border-white/10 space-y-4 py-4">
                                {includeSoftCosts && (
                                    <div className="flex justify-between items-center text-orange-400 px-4">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs uppercase tracking-widest">- Soft Costs (~20%)</span>
                                        </div>
                                        <span className="font-mono text-sm">({formatCurrency(breakdown.softCostEstimate)})</span>
                                    </div>
                                )}
                                {!hasLand && (
                                    <div className="flex justify-between items-center text-red-400 px-4">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs uppercase tracking-widest">- Land Cost</span>
                                        </div>
                                        <span className="font-mono text-sm">({formatCurrency(breakdown.landCost)})</span>
                                    </div>
                                )}
                            </div>

                            {/* Result: Hard Cost */}
                            <motion.div
                                layout
                                className="h-24 bg-white text-black rounded-xl flex flex-col justify-center px-6 relative z-30 shadow-[0_0_30px_rgba(255,255,255,0.1)]"
                            >
                                <span className="text-[10px] uppercase tracking-widest opacity-60 mb-1">Available for Construction (Hard Cost)</span>
                                <div className="flex justify-between items-end">
                                    <span className="text-3xl font-bold tracking-tight">{formatCurrency(breakdown.hardConstructionBudget)}</span>
                                    <span className="text-xs font-mono opacity-60 bg-black/10 px-2 py-1 rounded-md">
                                        {((breakdown.hardConstructionBudget / breakdown.totalBudget) * 100).toFixed(0)}% of total
                                    </span>
                                </div>
                            </motion.div>
                        </div>
                    </div>

                    {/* The Reality Check Gauge */}
                    <div className="bg-[#0A0A0A] rounded-3xl p-8 border border-white/10 text-center relative overflow-hidden">
                        {feasibility && (
                            <>
                                <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 opacity-30`} />

                                {/* Dynamic Indicator */}
                                <div className="mb-6 relative pointer-events-auto">
                                    <div className="flex items-center justify-center gap-2 mb-2">
                                        <span className="text-[10px] uppercase tracking-[0.3em] text-zinc-500">Construction Power</span>
                                        <button onClick={() => setViewingArticle(ARTICLES.find(a => a.id === 11) || null)} className="text-blue-400/80 hover:text-blue-400 transition-colors p-1 hover:bg-white/5 rounded-full">
                                            <HelpCircle size={18} />
                                        </button>
                                    </div>
                                    <h2 className={`text-6xl font-bold mt-2 ${feasibility.color} transition-colors duration-500`}>
                                        ${Math.round(breakdown.hardCostPerSqFt)}
                                        <span className="text-lg text-zinc-500 font-normal ml-2">/ per sqft</span>
                                    </h2>
                                </div>

                                <motion.div
                                    key={feasibility.status}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className={`inline-block px-6 py-3 rounded-xl border ${feasibility.status === 'Unrealistic' ? 'bg-red-500/10 border-red-500/30' : feasibility.status === 'Tight' ? 'bg-yellow-500/10 border-yellow-500/30' : 'bg-emerald-500/10 border-emerald-500/30'}`}
                                >
                                    <div className="flex items-center gap-3 justify-center mb-1">
                                        {feasibility.status === 'Unrealistic' ? <AlertTriangle size={18} className={feasibility.color} /> : <CheckCircle size={18} className={feasibility.color} />}
                                        <span className={`text-sm font-bold uppercase tracking-widest ${feasibility.color}`}>
                                            Status: {feasibility.status}
                                        </span>
                                    </div>
                                    <p className="text-xs text-zinc-400 max-w-sm mx-auto mt-2">
                                        {feasibility.message}
                                    </p>
                                </motion.div>
                            </>
                        )}

                        {!marketData && (
                            <div className="py-12 flex flex-col items-center opacity-50">
                                <div className="animate-pulse size-12 rounded-full bg-white/10 mb-4" />
                                <span className="text-sm">Enter a city to visualize feasibility...</span>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
};
