import React, { useState, useEffect } from 'react';
import {
    BookOpen, DollarSign, PenTool, Gavel, Layout,
    ShieldCheck, AlertTriangle, Compass, ArrowRight, X, Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { ARTICLES, CATEGORIES, Article } from '../data/knowledgeBaseData';

import { OnboardingModal } from './OnboardingModal';
import { markFeatureAsSeen } from './NewBadge';
import { AppTab } from '../types';

export const KnowledgeBase: React.FC = () => {
    const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
    const [activeCategory, setActiveCategory] = useState('All');

    // Tour State
    const [showTour, setShowTour] = useState(false);

    // Check Local Storage for Tour
    useEffect(() => {
        const TOUR_KEY = 'has_seen_kb_tour';
        const hasSeen = localStorage.getItem(TOUR_KEY);

        if (!hasSeen) {
            setShowTour(true);
        }
    }, []);

    const handleTourClose = () => {
        const TOUR_KEY = 'has_seen_kb_tour';
        localStorage.setItem(TOUR_KEY, 'true');
        setShowTour(false);
        markFeatureAsSeen(AppTab.KnowledgeBase);
    };

    const handleRead = (article: Article) => {
        setSelectedArticle(article);
    }
    const filteredArticles = activeCategory === 'All'
        ? ARTICLES.filter(a => !a.featured)
        : ARTICLES.filter(a => a.category === activeCategory);

    const featuredArticle = ARTICLES.find(a => a.featured);

    return (
        <div className="p-6 md:p-12 lg:p-12 max-w-7xl mx-auto w-full min-h-screen text-zinc-100 pb-32">
            <OnboardingModal
                isOpen={showTour}
                onClose={handleTourClose}
                title="The Knowledge Base"
                description="Expert wisdom distilled into simple guides to help you avoid costly mistakes."
                features={[
                    "Owner-Centric: Written for you, not for contractors.",
                    "Save Thousands: Learn the secrets builders usually keep to themselves.",
                    "Process Mastery: Understand permits, lien waivers, and draw schedules."
                ]}
                type="TAB_WELCOME"
            />

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
                <div className="space-y-3">
                    <h2 className="text-4xl md:text-5xl font-serif tracking-tighter">The Library</h2>
                    <div className="h-[1px] w-12 bg-white/30"></div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">Market Intelligence & Strategy</p>
                </div>

                {/* Category Filter */}
                <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-4 py-2 rounded-full text-[10px] uppercase tracking-widest transition-all ${activeCategory === cat
                                ? 'bg-white text-black font-bold'
                                : 'bg-white/5 text-zinc-500 hover:bg-white/10'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            <AnimatePresence mode="wait">
                {selectedArticle ? (
                    // READER VIEW
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        key="reader"
                        className="max-w-4xl mx-auto"
                    >
                        <button
                            onClick={() => setSelectedArticle(null)}
                            className="mb-8 text-[10px] uppercase tracking-[0.2em] text-white/50 hover:text-white flex items-center gap-2 transition-colors group"
                        >
                            <div className="p-2 rounded-full bg-white/5 group-hover:bg-white/10">
                                <X size={14} />
                            </div>
                            Close Article
                        </button>

                        <div className={`w-full h-64 md:h-80 rounded-3xl bg-gradient-to-br ${selectedArticle.gradient} relative overflow-hidden mb-12 flex items-center justify-center`}>
                            <selectedArticle.icon size={120} className="text-white/10" />
                            <div className="absolute inset-0 bg-black/20" />
                        </div>

                        <div className="max-w-2xl mx-auto">
                            <div className="flex items-center gap-4 mb-6">
                                <span className="px-3 py-1 rounded-full border border-white/10 bg-white/5 text-[10px] uppercase tracking-widest text-zinc-400">
                                    {selectedArticle.category}
                                </span>
                                <span className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-zinc-500">
                                    <Clock size={12} /> {selectedArticle.readTime}
                                </span>
                            </div>

                            <h1 className="text-3xl md:text-5xl font-serif mb-6 leading-tight">
                                {selectedArticle.title}
                            </h1>
                            <p className="text-xl text-zinc-400 font-light mb-12 italic border-l-2 border-white/10 pl-6">
                                {selectedArticle.subtitle}
                            </p>

                            <div className="prose prose-invert prose-lg text-zinc-300">
                                {selectedArticle.content}
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    // GRID VIEW
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        key="grid"
                    >
                        {/* Featured Hero (Only show if 'All' is selected or matches category) */}
                        {featuredArticle && (activeCategory === 'All' || activeCategory === featuredArticle.category) && (
                            <div
                                onClick={() => setSelectedArticle(featuredArticle)}
                                className={`w-full aspect-[2/1] md:aspect-[3/1] rounded-3xl bg-gradient-to-r ${featuredArticle.gradient} relative overflow-hidden mb-12 cursor-pointer group border border-white/5 hover:border-white/20 transition-all`}
                            >
                                <div className="absolute top-0 right-0 p-12 opacity-20 group-hover:opacity-30 transition-opacity duration-500 transform group-hover:scale-110">
                                    <featuredArticle.icon size={300} />
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent p-8 md:p-12 flex flex-col justify-end">
                                    <div className="bg-white/10 backdrop-blur-md self-start px-3 py-1 rounded-full text-[10px] uppercase tracking-widest text-white mb-4 border border-white/10">
                                        Featured • {featuredArticle.category}
                                    </div>
                                    <h2 className="text-3xl md:text-5xl font-serif max-w-2xl leading-tight mb-4 group-hover:text-white text-zinc-100 transition-colors">
                                        {featuredArticle.title}
                                    </h2>
                                    <p className="text-zinc-400 max-w-xl text-sm md:text-base mb-6 line-clamp-2">
                                        {featuredArticle.subtitle}
                                    </p>
                                    <div className="flex items-center gap-2 text-xs uppercase tracking-widest font-bold">
                                        Read Guide <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Standard Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredArticles.map((article, i) => (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    key={article.id}
                                    onClick={() => setSelectedArticle(article)}
                                    className="group cursor-pointer bg-[#0A0A0A] border border-white/5 rounded-2xl p-6 hover:bg-white/[0.02] hover:border-white/20 transition-all relative overflow-hidden h-[320px] flex flex-col justify-between"
                                >
                                    {/* Abstract Visual Gradient Top */}
                                    <div className={`absolute top-0 left-0 right-0 h-32 bg-gradient-to-b ${article.gradient} opacity-20 group-hover:opacity-30 transition-opacity`} />

                                    <div className="relative z-10 flex justify-between items-start">
                                        <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-zinc-400 group-hover:text-white transition-colors">
                                            <article.icon size={20} />
                                        </div>
                                        <span className="text-[10px] uppercase tracking-widest text-zinc-600 border border-white/5 px-2 py-1 rounded-full">
                                            {article.category}
                                        </span>
                                    </div>

                                    <div className="relative z-10 mt-4">
                                        <h3 className="text-xl font-serif mb-3 text-zinc-200 group-hover:text-white group-hover:underline decoration-white/20 underline-offset-4 transition-colors">
                                            {article.title}
                                        </h3>
                                        <p className="text-sm text-zinc-500 line-clamp-2 leading-relaxed font-light group-hover:text-zinc-400 transition-colors">
                                            {article.subtitle}
                                        </p>
                                    </div>

                                    <div className="relative z-10 pt-6 border-t border-white/5 flex items-center justify-between text-[10px] uppercase tracking-widest text-zinc-600 group-hover:text-zinc-400 transition-colors">
                                        <span>{article.readTime}</span>
                                        <span className="group-hover:translate-x-1 transition-transform">Read →</span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
