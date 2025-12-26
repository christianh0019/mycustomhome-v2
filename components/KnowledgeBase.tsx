
import React, { useState } from 'react';

interface Article {
    id: number;
    title: string;
    subtitle: string;
    readTime: string;
    category: string;
    content: React.ReactNode;
}

const ARTICLES: Article[] = [
    {
        id: 1,
        title: "Custom vs. Tract: The Real Value",
        subtitle: "Why building custom is a smarter asset class than buying production.",
        readTime: "5 min read",
        category: "Strategy",
        content: (
            <div className="space-y-6 text-white/80 leading-relaxed font-light">
                <p>
                    When you buy a tract home, you are buying a product optimized for the builder's margin, not your life.
                    Production builders cut corners on things you can't see: framing spacing, insulation quality, and foundation depth.
                </p>
                <h3 className="text-xl text-white font-serif italic">The Financial Edge</h3>
                <p>
                    A custom home typically carries a 20-30% instant equity position upon completion. Because you are the developer,
                    you capture the developer's profit margin. In a $1M tract home, you pay $1M for a house that cost $700k to build.
                    In a custom build, you spend $700k to build a house worth $1M.
                </p>
                <p>
                    This "sweat equity" is the primary reason high-net-worth individuals choose custom. It is not just about
                    luxury; it is about leverage.
                </p>
            </div>
        )
    },
    {
        id: 2,
        title: "The 9 Stages of a Build",
        subtitle: "A roadmap to the chaos. What happens when.",
        readTime: "8 min read",
        category: "Process",
        content: (
            <div className="space-y-6 text-white/80 leading-relaxed font-light">
                <p>
                    Construction looks like chaos, but it follows a rigid symphony. Understanding these 9 movements will save your sanity.
                </p>
                <ul className="list-disc pl-6 space-y-2">
                    <li><strong className="text-white">1. Vision:</strong> The dream phase. Sketches and mood boards.</li>
                    <li><strong className="text-white">2. Pre-Approval:</strong> The budget reality check.</li>
                    <li><strong className="text-white">3. Lenders:</strong> Securing the construction loan.</li>
                    <li><strong className="text-white">4. Land:</strong> Finding the dirt.</li>
                    <li><strong className="text-white">5. Architects:</strong> Turning drawings into blueprints.</li>
                    <li><strong className="text-white">6. Builders:</strong> Vetting the team.</li>
                    <li><strong className="text-white">7. Construction:</strong> The 12-month push.</li>
                    <li><strong className="text-white">8. Management:</strong> Daily decisions and draws.</li>
                    <li><strong className="text-white">9. The Summit:</strong> Move-in day.</li>
                </ul>
            </div>
        )
    },
    // Placeholder for future articles
    {
        id: 3,
        title: "Designing for Resale",
        subtitle: "How to be unique without alienating the market.",
        readTime: "4 min read",
        category: "Design",
        content: <p>Coming soon...</p>
    }
];

export const KnowledgeBase: React.FC = () => {
    const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

    return (
        <div className="p-6 md:p-12 lg:p-24 max-w-7xl mx-auto w-full breathing-fade pb-32">
            {/* Header */}
            <div className="space-y-3 mb-16">
                <h2 className="text-4xl md:text-6xl font-serif tracking-tighter">The Library</h2>
                <div className="h-[1px] w-12 bg-white/30"></div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">Market Intelligence & Strategy</p>
            </div>

            {selectedArticle ? (
                // Article Detail View
                <div className="animate-in slide-in-from-right-8 duration-500">
                    <button
                        onClick={() => setSelectedArticle(null)}
                        className="mb-8 text-[10px] uppercase tracking-[0.2em] text-white/50 hover:text-white flex items-center gap-2 modern-transition"
                    >
                        ← Back to Library
                    </button>

                    <article className="max-w-3xl">
                        <span className="text-[9px] px-3 py-1 border border-white/20 rounded-full text-white/60 mb-6 inline-block uppercase tracking-widest">
                            {selectedArticle.category}
                        </span>
                        <h1 className="text-3xl md:text-5xl font-serif mb-6 leading-tight">{selectedArticle.title}</h1>
                        <p className="text-lg md:text-xl text-white/60 font-light mb-12 border-l border-white/20 pl-6 italic">
                            {selectedArticle.subtitle}
                        </p>

                        <div className="prose prose-invert prose-lg">
                            {selectedArticle.content}
                        </div>
                    </article>
                </div>
            ) : (
                // Grid View
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {ARTICLES.map((article) => (
                        <div
                            key={article.id}
                            onClick={() => setSelectedArticle(article)}
                            className="group cursor-pointer border border-white/10 bg-[#080808] p-8 hover:bg-white/[0.02] hover:border-white/20 modern-transition relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-20 bg-white/[0.02] rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-white/[0.05] transition-colors"></div>

                            <div className="relative">
                                <div className="flex justify-between items-start mb-6">
                                    <span className="text-[9px] uppercase tracking-[0.2em] text-white/40 border-b border-white/10 pb-1">
                                        {article.category}
                                    </span>
                                    <span className="text-[9px] text-white/30">{article.readTime}</span>
                                </div>

                                <h3 className="text-2xl font-serif mb-4 group-hover:underline decoration-white/30 underline-offset-4 decoration-1">
                                    {article.title}
                                </h3>

                                <p className="text-sm text-white/50 font-light leading-relaxed mb-8">
                                    {article.subtitle}
                                </p>

                                <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-white/40 group-hover:text-white modern-transition">
                                    Read Article <span>→</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
