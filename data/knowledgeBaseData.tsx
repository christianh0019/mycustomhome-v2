import React from 'react';
import {
    BookOpen, DollarSign, PenTool, Gavel, Layout,
    ShieldCheck, AlertTriangle, Compass, ArrowRight, X, Clock, HelpCircle
} from 'lucide-react';

export interface Article {
    id: number;
    title: string;
    subtitle: string;
    readTime: string;
    category: 'Strategy' | 'Finance' | 'Design' | 'Legal' | 'Construction' | 'Budgeting';
    gradient: string;
    icon: React.ElementType;
    content: React.ReactNode;
    featured?: boolean;
}

export const ARTICLES: Article[] = [
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
    },
    // NEW EDUCATIONAL CONTENT FOR BUDGET CREATOR
    {
        id: 9,
        title: "What are 'Soft Costs'?",
        subtitle: "The 20% of your budget you can't see but definitely pay for.",
        readTime: "4 min read",
        category: "Budgeting",
        gradient: "from-orange-800 to-amber-950",
        icon: HelpCircle,
        content: (
            <div className="space-y-4 text-zinc-300 leading-relaxed">
                <p>
                    Novice home builders think a $1M budget means they get a $1M house. In reality, they get an $800k house and $200k of paperwork.
                    These are <strong>Soft Costs</strong>.
                </p>
                <h3 className="text-white font-serif text-lg mt-4">The Breakdown</h3>
                <ul className="list-disc pl-5 space-y-2">
                    <li><strong>Architecture & Engineering (5-10%):</strong> Blueprints, structural stamps, civil engineering for drainage.</li>
                    <li><strong>Permits & Impact Fees (2-5%):</strong> Checks written to the city/county just for permission to build.</li>
                    <li><strong>Site Prep & Testing:</strong> Soil reports, surveys, and utility tap fees.</li>
                </ul>
                <div className="bg-white/5 p-4 rounded-xl border border-white/10 mt-4">
                    <strong className="text-white block mb-1">The Golden Rule</strong>
                    Always reserve 20% of your total budget for soft costs. If you don't use it all, you get nicer finishes. If you don't budget for it, you run out of money before drywall.
                </div>
            </div>
        )
    },
    {
        id: 10,
        title: "Budgeting for Land",
        subtitle: "Why 'Free Land' is a myth and dirt is expensive.",
        readTime: "5 min read",
        category: "Budgeting",
        gradient: "from-green-800 to-emerald-950",
        icon: Compass,
        content: (
            <div className="space-y-4 text-zinc-300 leading-relaxed">
                <p>
                    Land is the most volatile variable in home building. A "cheap" lot often requires expensive improvements.
                </p>
                <h3 className="text-white font-serif text-lg mt-4">The "Finished Lot" Concept</h3>
                <p>
                    You aren't just buying dirt; you are looking for a "build-ready" status.
                </p>
                <ul className="list-disc pl-5 space-y-2">
                    <li><strong>Utilities:</strong> Is water/sewer at the street? Or do you need a $40k well and septic system?</li>
                    <li><strong>Slope:</strong> A gorgeous hillside view might cost $50k in retaining walls and extra concrete.</li>
                    <li><strong>Clearing:</strong> Trees are beautiful, but removing them to pour a foundation costs thousands.</li>
                </ul>
                <p className="mt-4">
                    <strong>Budget Tip:</strong> Never buy land without a "Feasibility Study" period (usually 30-60 days) to get real quotes on site prep.
                </p>
            </div>
        )
    },
    {
        id: 11,
        title: "The Myth of Price Per Sq Ft",
        subtitle: "Why asking 'How much per foot?' is the wrong question.",
        readTime: "6 min read",
        category: "Budgeting",
        gradient: "from-blue-900 to-indigo-950",
        icon: DollarSign,
        content: (
            <div className="space-y-4 text-zinc-300 leading-relaxed">
                <p>
                    Asking a builder "How much per square foot?" is like asking a car dealer "How much per pound is this car?"
                </p>
                <p>
                    A Honda and a Ferrari weigh roughly the same. The cost per pound is wildly different.
                </p>
                <h3 className="text-white font-serif text-lg mt-4">What drives the number?</h3>
                <ul className="list-disc pl-5 space-y-2">
                    <li><strong>Complexity:</strong> Corners cost money. A box is cheap. A complex house with 20 corners and 4 rooflines is expensive.</li>
                    <li><strong>Finishes:</strong> Marble vs. Tile. Wolf vs. GE. These don't change the square footage, but they double the cost.</li>
                    <li><strong>Volume:</strong> High ceilings and big windows increase the "volume" of the house, which increases cost, even if the "floor area" stays the same.</li>
                </ul>
            </div>
        )
    },
    {
        id: 12,
        title: "How Big Should It Be?",
        subtitle: "Balancing 'Resale Value' with 'Actually Living in It'.",
        readTime: "5 min read",
        category: "Design",
        gradient: "from-purple-900 to-fuchsia-950",
        icon: Layout,
        content: (
            <div className="space-y-4 text-zinc-300 leading-relaxed">
                <p>
                    The average American home is 2,400 sq ft. Custom homes often bloat to 4,000+ sq ft, but bigger isn't always better.
                </p>
                <h3 className="text-white font-serif text-lg mt-4">Rules of Thumb</h3>
                <ul className="list-disc pl-5 space-y-2">
                    <li><strong>The 80% Rule:</strong> You will spend 80% of your time in 20% of your house (Kitchen, Living, Primary Bed). Spend your money there.</li>
                    <li><strong>Guest Rooms:</strong> Do you really need a dedicated room for someone who visits 4 days a year? Consider a flex office/bed.</li>
                    <li><strong>Resale Sweet Spot:</strong> In most markets, 2,800 - 3,500 sq ft is the "Goldilocks" zone for high-end resale fluidity.</li>
                </ul>
            </div>
        )
    }
];

export const CATEGORIES = ['All', 'Strategy', 'Finance', 'Design', 'Legal', 'Construction', 'Budgeting'];
