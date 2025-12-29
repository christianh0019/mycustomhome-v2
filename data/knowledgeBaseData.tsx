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
        title: "The Invisible 20%: Understanding Soft Costs",
        subtitle: "Why a $1M budget only buys you an $800k house.",
        readTime: "8 min read",
        category: "Budgeting",
        gradient: "from-orange-800 to-amber-950",
        icon: HelpCircle,
        content: (
            <div className="space-y-6 text-zinc-300 leading-relaxed font-light">
                <p>
                    Imagine you walk into a store to buy a $100 pair of sneakers, but at the register, they ring up as $125. You ask why, and the clerk says,
                    "Oh, the extra $25 is for the box, the receipt paper, and the electricity to run the lights in here."
                </p>
                <p>
                    That is exactly how <strong>Soft Costs</strong> work in home building.
                </p>
                <p>
                    Novice builders often make the mistake of thinking every dollar they spend goes into lumber, windows, and countertops (Hard Costs).
                    But before you can pour a single drop of concrete, you have to pay for the "permission" and "planning" to build.
                </p>

                <h3 className="text-2xl text-white font-serif mt-8 mb-4">The Breakdown: Where does the money go?</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                        <strong className="text-white block mb-2 text-lg">1. Architecture & Engineering (8-12%)</strong>
                        <p className="text-sm">You aren't just paying for pretty drawings. You are paying for structural stamps, civil engineering (drainage), and energy calculations.</p>
                    </div>
                    <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                        <strong className="text-white block mb-2 text-lg">2. Government Fees (3-5%)</strong>
                        <p className="text-sm">Permits, impact fees, tap fees. This is literally the cost of writing a check to the city just to be allowed to start.</p>
                    </div>
                    <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                        <strong className="text-white block mb-2 text-lg">3. Site Prep (Variable)</strong>
                        <p className="text-sm">Soil tests, surveys, hauling away debris. The land doesn't come ready-to-build by default.</p>
                    </div>
                    <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                        <strong className="text-white block mb-2 text-lg">4. Financial Costs (2-5%)</strong>
                        <p className="text-sm">Loan origination fees and "interest during construction." Yes, you pay interest on the money while you use it.</p>
                    </div>
                </div>

                <div className="bg-blue-500/10 p-6 rounded-2xl border border-blue-500/20 my-8">
                    <h4 className="text-blue-400 font-bold uppercase tracking-widest text-xs mb-2">Pro Tip</h4>
                    <p className="text-white font-medium">
                        Always reserve <span className="text-blue-300">20-25%</span> of your total budget for soft costs.
                    </p>
                    <p className="text-sm mt-2 text-zinc-400">
                        If you have $1,000,000 total, you have ~$750,000 to actually build the structure. If you budget $1M for construction, you will run out of money before the drywall goes up.
                    </p>
                </div>
            </div>
        )
    },
    {
        id: 10,
        title: "The Dirt is Deceiving: Budgeting for Land",
        subtitle: "Why 'Free Land' is a myth and what lies beneath.",
        readTime: "10 min read",
        category: "Budgeting",
        gradient: "from-green-800 to-emerald-950",
        icon: Compass,
        content: (
            <div className="space-y-6 text-zinc-300 leading-relaxed font-light">
                <p>
                    There is an old saying in development: <strong>"You make your money when you buy."</strong>
                </p>
                <p>
                    But for a custom home builder, the saying should be: "You lose your shirt if you don't know what's underground."
                    Buying raw land is the most risky part of the entire process because dirt is rarely just dirt.
                </p>

                <h3 className="text-2xl text-white font-serif mt-8 mb-4">The "Hidden" Price Tag</h3>
                <p>
                    Let's say you see a beautiful lot listed for $100,000. It looks like a steal. But here is the math you need to do before you sign:
                </p>

                <ul className="space-y-4 mt-6 mb-8">
                    <li className="flex gap-4 items-start">
                        <div className="min-w-8 h-8 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center font-bold">1</div>
                        <div>
                            <strong className="text-white block">Utility Connections ($10k - $50k+)</strong>
                            <p className="text-sm mt-1">Is there a sewer line? Or do you need a septic system ($30k)? Is water at the street? Or do you need a well ($20k)? Power poles can cost $5,000 each to install if they aren't close.</p>
                        </div>
                    </li>
                    <li className="flex gap-4 items-start">
                        <div className="min-w-8 h-8 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center font-bold">2</div>
                        <div>
                            <strong className="text-white block">Topography & Slope ($10k - $100k)</strong>
                            <p className="text-sm mt-1">That view is amazing, but a steep slope requires retaining walls, engineered foundations, and extra concrete pumping. Flat lots are boring, but cheap to build. Sloped lots are sexy, but expensive.</p>
                        </div>
                    </li>
                    <li className="flex gap-4 items-start">
                        <div className="min-w-8 h-8 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center font-bold">3</div>
                        <div>
                            <strong className="text-white block">Soil Quality ($5k - $50k)</strong>
                            <p className="text-sm mt-1">If your soil is "expansive clay," it moves when it gets wet. You'll need expensive piers (caissons) drilled deep into the ground to keep your house from cracking in half.</p>
                        </div>
                    </li>
                </ul>

                <h3 className="text-2xl text-white font-serif mt-8 mb-4">The Meaning of "Need Land"</h3>
                <p>
                    In our Budget Creator, selecting "Need Land" subtracts these costs from your budget. If you have $1.5M and need to buy a $300k lot, you are now a $1.2M home builder.
                </p>
                <p className="mt-4">
                    <strong>The Golden Rule:</strong> Never buy land without a "Feasibility Study" period (usually 30-60 days) to get real quotes on site prep.
                </p>
            </div>
        )
    },
    {
        id: 11,
        title: "The Myth of Cost Per Square Foot",
        subtitle: "Why asking 'How much per foot?' is like asking 'How much per pound?'",
        readTime: "7 min read",
        category: "Budgeting",
        gradient: "from-blue-900 to-indigo-950",
        icon: DollarSign,
        content: (
            <div className="space-y-6 text-zinc-300 leading-relaxed font-light">
                <p>
                    Asking a builder "How much do you charge per square foot?" is the single most common question in our industry.
                    It is also the most dangerous one to rely on.
                </p>

                <div className="bg-white/5 p-8 rounded-2xl border border-white/10 my-8 text-center">
                    <h3 className="text-xl md:text-2xl font-serif text-white mb-4">The Car Analogy</h3>
                    <div className="flex flex-col md:flex-row justify-center gap-8 md:gap-16 items-center">
                        <div className="space-y-2">
                            <div className="text-4xl">🚙</div>
                            <div className="font-bold text-white">Toyota Camry</div>
                            <div className="text-sm opacity-50">3,500 lbs</div>
                            <div className="text-emerald-400 font-mono">$8.50 / lb</div>
                        </div>
                        <div className="text-2xl opacity-30">VS</div>
                        <div className="space-y-2">
                            <div className="text-4xl">🏎️</div>
                            <div className="font-bold text-white">Ferrari 488</div>
                            <div className="text-sm opacity-50">3,300 lbs</div>
                            <div className="text-emerald-400 font-mono">$90.00 / lb</div>
                        </div>
                    </div>
                    <p className="mt-6 text-sm md:text-base max-w-lg mx-auto">
                        They weigh the same. They both have 4 wheels. But one is a commodity, and one is a high-performance machine.
                        <strong>Square footage is just the "weight" of the house.</strong> It tells you nothing about the quality.
                    </p>
                </div>

                <h3 className="text-2xl text-white font-serif mt-8 mb-4">What actually drives the cost?</h3>
                <ul className="list-disc pl-6 space-y-4 marker:text-blue-500">
                    <li className="pl-2">
                        <strong className="text-white">Complexity:</strong> A simple box with 4 corners is the cheapest shape to build. Every time you add a corner, a roof valley, or a vault, the price goes up, even if the square footage stays the same.
                    </li>
                    <li className="pl-2">
                        <strong className="text-white">Volume vs. Area:</strong> A room with 20ft ceilings costs twice as much to frame, drywall, paint, and heat as a room with 10ft ceilings, yet on paper, they are the same "100 sq ft" room.
                    </li>
                    <li className="pl-2">
                        <strong className="text-white">Finishes (The Ferrari Factor):</strong> Marble vs. Laminate. Wolf Range vs. GE Stove. Custom Cabinets vs. IKEA. These choices can swing the budget by $200k without changing the size of the house by one inch.
                    </li>
                </ul>

                <p className="mt-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-200 text-sm">
                    <strong>Warning:</strong> If a builder gives you a low price per square foot over the phone without seeing your plans, run. They are quoting you a Camry, and you are likely designing a Ferrari.
                </p>
            </div>
        )
    },
    {
        id: 12,
        title: "Quality Over Quantity: Right-Sizing",
        subtitle: "How to design a better home, not just a bigger one.",
        readTime: "6 min read",
        category: "Design",
        gradient: "from-purple-900 to-fuchsia-950",
        icon: Layout,
        content: (
            <div className="space-y-6 text-zinc-300 leading-relaxed font-light">
                <p>
                    The average American home has ballooned to over 2,500 sq ft, yet families have gotten smaller.
                    We are building "storage units for people" rather than homes designed for living.
                </p>
                <p>
                    The single best way to maximize your budget is to <strong className="text-white">build less house, but build it better.</strong>
                </p>

                <h3 className="text-2xl text-white font-serif mt-8 mb-4">The 80/20 Rule of Living</h3>
                <div className="relative pl-6 border-l-2 border-purple-500/50 my-6">
                    <p className="italic text-lg">
                        "You will spend 80% of your time in 20% of your house."
                    </p>
                </div>
                <p>
                    Think about it. You wake up (Bedroom), go to the Kitchen (Coffee), sit in the Living Room (Relax).
                    That Dining Room? Used twice a year. That Guest Room? Used for 10 days by in-laws.
                </p>
                <p>
                    Instead of building a mediocre 4,000 sq ft house, consider a spectacular 2,800 sq ft house.
                </p>

                <h3 className="text-2xl text-white font-serif mt-8 mb-4">Unlocking Value</h3>
                <ul className="space-y-3">
                    <li className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-purple-500" />
                        <span><strong>Eliminate Hallways:</strong> Hallways are "dead space" that costs $300/sqft to build but adds zero value to your life. Open plans remove this waste.</span>
                    </li>
                    <li className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-purple-500" />
                        <span><strong>Flex Rooms:</strong> Don't build a Guest Room AND an Office. Build a fantastic Office with a Murphy bed. Now you have one room that works 365 days a year.</span>
                    </li>
                    <li className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-purple-500" />
                        <span><strong>Outdoor Living:</strong> A covered patio costs 50% less than an indoor room but makes the house feel twice as big.</span>
                    </li>
                </ul>
            </div>
        )
    }
];

export const CATEGORIES = ['All', 'Strategy', 'Finance', 'Design', 'Legal', 'Construction', 'Budgeting'];
