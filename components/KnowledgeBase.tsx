import React, { useState, useEffect } from 'react';
import {
    BookOpen, DollarSign, PenTool, Gavel, Layout,
    ShieldCheck, AlertTriangle, Compass, ArrowRight, X, Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Article {
    id: number;
    title: string;
    subtitle: string;
    readTime: string;
    category: 'Strategy' | 'Finance' | 'Design' | 'Legal' | 'Construction';
    gradient: string;
    icon: React.ElementType;
    content: React.ReactNode;
    featured?: boolean;
}

const ARTICLES: Article[] = [
    {
        id: 1,
        title: "The 2025 Guide to Construction Loans",
        subtitle: "Interest reserves, draw schedules, and why 'Cash is King' might be wrong.",
        readTime: "12 min read",
        category: "Finance",
        gradient: "from-emerald-900 to-green-950",
        icon: DollarSign,
        featured: true,
        content: (
            <div className="space-y-6 text-zinc-300 leading-relaxed font-light">
                <p>
                    Most borrowers treat a construction loan like a mortgage. It isn't. It's a line of credit that behaves
                    like a checking account with a detonator attached.
                </p>
                <h3 className="text-xl text-white font-serif">The Interest Reserve Trap</h3>
                <p>
                    Banks will offer to "roll interest into the loan." This sounds like a favor. It effectively means you are
                    borrowing money to pay the interest on the money you borrowed. On a $2M build, this compound effect can
                    cost you $40k+ in "phantom costs" before you move in.
                </p>
                <h3 className="text-xl text-white font-serif">The Draw Schedule</h3>
                <p>
                    Your builder needs cash flow. Your bank wants risk mitigation. You are caught in the middle.
                    If the bank inspector "feels" the foundation is only 80% done, they short the draw. The builder stops work.
                    The project stalls.
                </p>
            </div>
        )
    },
    {
        id: 2,
        title: "Custom vs. Tract: The Asset Class",
        subtitle: "Start with 20% equity or start underwater. The math of development.",
        readTime: "5 min read",
        category: "Strategy",
        gradient: "from-blue-900 to-slate-900",
        icon: Compass,
        content: (
            <div className="space-y-6 text-zinc-300 leading-relaxed font-light">
                <p>
                    Production builders charge you $1M for a house that cost $700k to build. That $300k spread is their profit.
                    When you build custom, YOU are the developer. You capture that margin.
                </p>
                <p>
                    This "sweat equity" makes custom homes a distinct asset class compared to retail real estate.
                </p>
            </div>
        )
    },
    {
        id: 3,
        title: "The 9 Stages of a Build",
        subtitle: "A roadmap to the chaos. What happens when.",
        readTime: "8 min read",
        category: "Construction",
        gradient: "from-orange-900 to-red-950",
        icon: Layout,
        content: (
            <div className="space-y-6 text-zinc-300 leading-relaxed font-light">
                <ul className="list-disc pl-6 space-y-4">
                    <li><strong className="text-white">1. Vision:</strong> Sketches and mood boards.</li>
                    <li><strong className="text-white">2. Pre-Approval:</strong> The budget reality check.</li>
                    <li><strong className="text-white">3. Land:</strong> Finding the dirt.</li>
                    <li><strong className="text-white">4. Architects:</strong> Turning drawings into blueprints.</li>
                    <li><strong className="text-white">5. Construction:</strong> The 12-month push.</li>
                </ul>
            </div>
        )
    },
    {
        id: 4,
        title: "Designing for Resale",
        subtitle: "How to be unique without alienating the market.",
        readTime: "6 min read",
        category: "Design",
        gradient: "from-purple-900 to-indigo-950",
        icon: PenTool,
        content: <p>Full guide on creating timeless design features that appraise well...</p>
    },
    {
        id: 5,
        title: "Lien Waivers 101",
        subtitle: "How to prevent paying for your roof twice.",
        readTime: "4 min read",
        category: "Legal",
        gradient: "from-zinc-800 to-zinc-950",
        icon: Gavel,
        content: (
            <div className="space-y-6 text-zinc-300">
                <p>
                    If your builder pays the roofer, but the roofer doesn't pay their supplier, the supplier can put a lien
                    on YOUR house. Even if you paid the builder in full. Learn how to demand unconditional lien waivers.
                </p>
            </div>
        )
    },
    {
        id: 6,
        title: "The 'Cost Plus' Trap",
        subtitle: "Why 'Fixed Price' contracts are a myth in custom building.",
        readTime: "7 min read",
        category: "Finance",
        gradient: "from-emerald-900 to-teal-950",
        icon: DollarSign,
        content: <p>Fixed Price contracts incentivize the builder to cut corners. Cost Plus incentivizes them to spend. Which is better?</p>
    },
    {
        id: 7,
        title: "Land Feasibility: 5 Red Flags",
        subtitle: "Soil, Slope, and Utilities. Don't buy a money pit.",
        readTime: "9 min read",
        category: "Strategy",
        gradient: "from-red-900 to-rose-950",
        icon: AlertTriangle,
        content: <p>If the land is cheap, there is a reason. Usually it involves $50k in retaining walls or a $30k septic system.</p>
    },
    {
        id: 8,
        title: "Architect vs. Designer",
        subtitle: "Do you need a licensed pro or a talented artist?",
        readTime: "5 min read",
        category: "Design",
        gradient: "from-indigo-900 to-violet-950",
        icon: PenTool,
        content: <p>For a basic layout, a designer saves you money. For complex engineering, you need an architect. Know the difference.</p>
    }
];

const CATEGORIES = ['All', 'Strategy', 'Finance', 'Design', 'Legal', 'Construction'];

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
