import React, { useState, useEffect } from 'react';
import {
    CirclePlay, X, Clock,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { ARTICLES, Article } from '../data/knowledgeBaseData';
import { ROADMAP_CONFIG } from '../services/RoadmapService';

import { OnboardingModal } from './OnboardingModal';
import { markFeatureAsSeen } from './NewBadge';
import { AppTab } from '../types';

export const KnowledgeBase: React.FC = () => {
    const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
    const [activeStage, setActiveStage] = useState<number>(0);

    // Tour State
    const [showTour, setShowTour] = useState(false);

    // Check Local Storage for Tour
    useEffect(() => {
        const TOUR_KEY = 'has_seen_kb_tour_v2';
        const hasSeen = localStorage.getItem(TOUR_KEY);

        if (!hasSeen) {
            setShowTour(true);
        }
    }, []);

    const handleTourClose = () => {
        const TOUR_KEY = 'has_seen_kb_tour_v2';
        localStorage.setItem(TOUR_KEY, 'true');
        setShowTour(false);
        markFeatureAsSeen(AppTab.KnowledgeBase);
    };

    // Filter Logic: Articles that belong to the Active Stage
    // If an article has multiple stages, it appears in all of them.
    const filteredArticles = ARTICLES.filter(a => a.stageIds.includes(activeStage));

    return (
        <div className="p-6 md:p-12 lg:p-12 max-w-7xl mx-auto w-full min-h-screen text-zinc-900 dark:text-zinc-100 pb-32 transition-colors duration-300">
            <OnboardingModal
                isOpen={showTour}
                onClose={handleTourClose}
                title="The Knowledge Base"
                description="Expert wisdom organized by where you are in the journey."
                features={[
                    "Stage-Specific: Only see what matters right now.",
                    "Video Classes: Watch deep-dives on complex topics.",
                    "Process Mastery: Avoid the mistakes typical of each phase."
                ]}
                type="TAB_WELCOME"
            />

            {/* Header */}
            <div className="flex flex-col mb-12 gap-8">
                <div className="space-y-3">
                    <h2 className="text-4xl md:text-5xl font-serif tracking-tighter">The Library</h2>
                    <div className="h-[1px] w-12 bg-zinc-300 dark:bg-white/30"></div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 dark:text-white/40">Market Intelligence & Strategy</p>
                </div>

                {/* Stage Filter Tabs */}
                <div className="w-full overflow-x-auto pb-4 -mx-6 px-6 md:mx-0 md:px-0">
                    <div className="flex gap-2 min-w-max">
                        {Object.entries(ROADMAP_CONFIG).map(([stageId, config]) => {
                            const id = parseInt(stageId);
                            const isActive = activeStage === id;
                            return (
                                <button
                                    key={id}
                                    onClick={() => setActiveStage(id)}
                                    className={`px-5 py-3 rounded-xl text-[10px] uppercase tracking-widest transition-all border flex flex-col items-start gap-1 min-w-[140px]
                                ${isActive
                                            ? 'bg-zinc-900 dark:bg-white text-white dark:text-black border-zinc-900 dark:border-white shadow-lg scale-105'
                                            : 'bg-white dark:bg-white/5 border-zinc-200 dark:border-white/10 text-zinc-400 hover:border-zinc-400 dark:hover:border-white/20'
                                        }`}
                                >
                                    <span className={isActive ? 'opacity-100' : 'opacity-50'}>Stage {id}</span>
                                    <span className={`font-bold text-xs truncate w-full text-left ${isActive ? 'text-white dark:text-black' : 'text-zinc-600 dark:text-zinc-300'}`}>
                                        {config.name}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {selectedArticle ? (
                    // READER VIEW
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        key="reader"
                        className="max-w-4xl mx-auto"
                    >
                        <button
                            onClick={() => setSelectedArticle(null)}
                            className="mb-8 text-[10px] uppercase tracking-[0.2em] text-zinc-500 dark:text-white/50 hover:text-zinc-900 dark:hover:text-white flex items-center gap-2 transition-colors group"
                        >
                            <div className="p-2 rounded-full bg-zinc-100 dark:bg-white/5 group-hover:bg-zinc-200 dark:group-hover:bg-white/10">
                                <X size={14} />
                            </div>
                            Back to Stage {activeStage}
                        </button>

                        {/* Video Player or Gradient Header */}
                        {selectedArticle.videoUrl ? (
                            <div className="w-full aspect-video rounded-3xl overflow-hidden shadow-2xl mb-12 bg-black relative z-10">
                                <iframe
                                    width="100%"
                                    height="100%"
                                    src={selectedArticle.videoUrl}
                                    title={selectedArticle.title}
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    className="w-full h-full"
                                ></iframe>
                            </div>
                        ) : (
                            <div className={`w-full h-48 md:h-64 rounded-3xl bg-gradient-to-br ${selectedArticle.gradient} relative overflow-hidden mb-12 flex items-center justify-center`}>
                                <selectedArticle.icon size={100} className="text-white/10" />
                                <div className="absolute inset-0 bg-black/20" />
                            </div>
                        )}


                        <div className="max-w-3xl mx-auto">
                            <div className="flex items-center gap-4 mb-6">
                                <span className="px-3 py-1 rounded-full border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/5 text-[10px] uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                                    {selectedArticle.category}
                                </span>
                                <span className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-zinc-500">
                                    <Clock size={12} /> {selectedArticle.readTime}
                                </span>
                            </div>

                            <h1 className="text-3xl md:text-5xl font-serif mb-6 leading-tight text-zinc-900 dark:text-white">
                                {selectedArticle.title}
                            </h1>
                            <p className="text-xl text-zinc-500 dark:text-zinc-400 font-light mb-12 italic border-l-2 border-zinc-200 dark:border-white/10 pl-6">
                                {selectedArticle.subtitle}
                            </p>

                            <div className="prose prose-lg text-zinc-600 dark:text-zinc-300 dark:prose-invert">
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
                        {filteredArticles.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 opacity-50">
                                <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-white/5 flex items-center justify-center mb-4">
                                    <Clock size={24} />
                                </div>
                                <p className="text-sm uppercase tracking-widest">No articles for this stage yet.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredArticles.map((article, i) => (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        key={article.id}
                                        onClick={() => setSelectedArticle(article)}
                                        className="group cursor-pointer bg-white dark:bg-[#0A0A0A] border border-zinc-200 dark:border-white/5 rounded-2xl p-6 hover:bg-zinc-50 dark:hover:bg-white/[0.02] hover:border-zinc-300 dark:hover:border-white/20 transition-all relative overflow-hidden h-[340px] flex flex-col justify-between shadow-sm dark:shadow-none"
                                    >
                                        {/* Abstract Visual Gradient Top */}
                                        <div className={`absolute top-0 left-0 right-0 h-32 bg-gradient-to-b ${article.gradient} opacity-20 group-hover:opacity-30 transition-opacity`} />

                                        <div className="relative z-10 flex justify-between items-start">
                                            <div className="p-3 bg-zinc-100 dark:bg-white/5 rounded-xl border border-zinc-200 dark:border-white/5 text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">
                                                {article.videoUrl ? <CirclePlay size={20} /> : <article.icon size={20} />}
                                            </div>
                                            <span className="text-[10px] uppercase tracking-widest text-zinc-500 dark:text-zinc-600 border border-zinc-200 dark:border-white/5 px-2 py-1 rounded-full bg-zinc-50 dark:bg-transparent">
                                                {article.category}
                                            </span>
                                        </div>

                                        <div className="relative z-10 mt-4">
                                            <h3 className="text-xl font-serif mb-3 text-zinc-900 dark:text-zinc-200 group-hover:text-emerald-600 dark:group-hover:text-white group-hover:underline decoration-zinc-300 dark:decoration-white/20 underline-offset-4 transition-colors">
                                                {article.title}
                                            </h3>
                                            <p className="text-sm text-zinc-500 line-clamp-2 leading-relaxed font-light group-hover:text-zinc-600 dark:group-hover:text-zinc-400 transition-colors">
                                                {article.subtitle}
                                            </p>
                                        </div>

                                        <div className="relative z-10 pt-6 border-t border-zinc-100 dark:border-white/5 flex items-center justify-between text-[10px] uppercase tracking-widest text-zinc-400 dark:text-zinc-600 group-hover:text-zinc-900 dark:group-hover:text-zinc-400 transition-colors">
                                            <span className="flex items-center gap-1.5">
                                                <Clock size={10} />
                                                {article.readTime}
                                            </span>
                                            <div className="flex items-center gap-2">
                                                {article.videoUrl && <span className="text-emerald-500 font-bold">Watch</span>}
                                                <span className="group-hover:translate-x-1 transition-transform">Read →</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
