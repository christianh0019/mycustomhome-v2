
import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import {
    ArrowRight, Check, Shield, Zap, TrendingUp, Cpu, Coins, Lock,
    Search, Heart, Map, Home, FileText, Users, ChevronDown, DollarSign,
    AlertTriangle, EyeOff, Gavel, FileX, Ruler, HardHat
} from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';

export const HomePage: React.FC = () => {
    const targetRef = useRef<HTMLDivElement>(null);

    // Animation Variants
    const fadeInUp = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
    };

    const staggerContainer = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15
            }
        }
    };

    return (
        <div className="bg-black text-white font-sans selection:bg-white selection:text-black overflow-x-hidden">

            {/* SECTION 1: HERO */}
            <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/90 to-black z-10"></div>
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1600607686527-6fb886090705?q=80&w=2600&auto=format&fit=crop')] bg-cover bg-center opacity-40 grayscale mix-blend-overlay"></div>
                </div>

                <div className="relative z-20 max-w-7xl mx-auto px-6 text-center">
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={fadeInUp}
                    >
                        <h1 className="text-5xl md:text-8xl lg:text-9xl font-serif font-medium tracking-tighter leading-[0.9] mb-8 text-white">
                            Building Custom? <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-br from-blue-400 to-purple-600">Build Smarter.</span>
                        </h1>

                        <p className="text-lg md:text-2xl text-white/60 max-w-3xl mx-auto mb-12 leading-relaxed font-light">
                            We help you build faster, smarter, safer, <br className="hidden md:block" />
                            <span className="text-white font-medium">and we pay you an average of $10,000+ to do it.</span>
                        </p>

                        <div className="flex flex-col items-center gap-6">
                            <Link to="/login?mode=signup" className="group relative px-12 py-6 bg-white text-black font-bold uppercase tracking-[0.2em] text-sm transition-all hover:scale-105 active:scale-95 rounded-full overflow-hidden">
                                <span className="relative z-10">Get Started</span>
                                <div className="absolute inset-0 bg-gradient-to-r from-gray-100 to-white opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            </Link>
                            <span className="text-xs uppercase tracking-[0.2em] text-white/40 flex items-center gap-2">
                                <span className="w-1 h-1 bg-white/40 rounded-full"></span>
                                We don't charge you a dime
                                <span className="w-1 h-1 bg-white/40 rounded-full"></span>
                            </span>
                        </div>
                    </motion.div>
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1, duration: 1 }}
                    className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/20 animate-bounce"
                >
                    <ChevronDown size={32} />
                </motion.div>
            </section>

            {/* SECTION 2: THE MINEFIELD */}
            <section className="py-32 bg-[#050505] relative border-y border-white/5">
                <div className="max-w-4xl mx-auto px-6 text-center mb-24">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeInUp}
                    >
                        <span className="text-red-500 font-bold uppercase tracking-[0.2em] text-xs mb-6 block">The Minefield</span>
                        <h2 className="text-4xl md:text-6xl font-serif mb-8 leading-tight">
                            One Wrong Move Can <br /> <span className="text-red-500">Cost You Everything.</span>
                        </h2>
                        <p className="text-white/60 text-xl leading-relaxed">
                            Building a custom home isn't just expensive. It's a maze of technical decisions where a single mistake can wipe out hundreds of thousands of dollars. <br /><br />
                            <span className="text-white">And the scariest part? You won't even know you made the mistake until it's too late.</span>
                        </p>
                    </motion.div>
                </div>

                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                        {
                            title: "The Zoning Trap",
                            desc: "You fall in love with land. You buy it. You spend $40k on plans. Then you find out zoning doesn't allow what you want. The lot is useless. The plans are worthless.",
                            money: "-$40,000+",
                            icon: <Map className="text-red-500" />
                        },
                        {
                            title: "The Soil Surprise",
                            desc: "You start digging and discover the soil won't support your foundation. Now you need $75,000 in soil remediation. Your budget just exploded before you started.",
                            money: "-$75,000+",
                            icon: <AlertTriangle className="text-red-500" />
                        },
                        {
                            title: "The Setback Shock",
                            desc: "Your plans look perfect. But the county says your home is 3 feet too close to the line. Redesign everything. More architect fees. More engineering. More delays.",
                            money: "Indefinite Delay",
                            icon: <Ruler className="text-red-500" />
                        },
                        {
                            title: "The Permit Black Hole",
                            desc: "Your plans sit in review for 6 months because one detail was missed. Material costs go up 15%. Your construction loan is eating interest daily.",
                            money: "+15% Cost",
                            icon: <FileX className="text-red-500" />
                        }
                    ].map((trap, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-[#0A0A0A] p-8 border border-red-900/10 hover:border-red-500/30 transition-all rounded-xl group relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                <AlertTriangle size={100} />
                            </div>
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
                                    {trap.icon}
                                </div>
                                <h3 className="text-xl font-bold">{trap.title}</h3>
                            </div>
                            <p className="text-white/50 leading-relaxed mb-6">{trap.desc}</p>
                            <div className="text-red-500 font-serif text-lg">{trap.money}</div>
                        </motion.div>
                    ))}
                </div>
                <div className="text-center mt-12 text-white/30 text-sm uppercase tracking-widest">
                    This isn't rare. This is normal.
                </div>
            </section>

            {/* SECTION 3: THE TRUST TRAP */}
            <section className="py-32 bg-black relative border-b border-white/5">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeInUp}
                    >
                        <h2 className="text-4xl md:text-5xl font-serif mb-8 leading-tight">
                            Everyone You Rely On Has a <br /><span className="text-white/50 italic">Conflict of Interest.</span>
                        </h2>
                        <p className="text-white/60 text-lg leading-relaxed mb-8">
                            Now here's the really uncomfortable truth: The only people who know how to avoid those mistakes are the same people who profit when you make them.
                        </p>

                        <div className="space-y-8">
                            <div className="flex gap-4">
                                <div className="text-white/30 font-serif text-xl">01</div>
                                <div>
                                    <h4 className="text-white font-bold mb-2">Your Realtor</h4>
                                    <p className="text-white/40 text-sm">They want you to buy land—any land—for the commission. If the lot is a nightmare to build on, that's not their problem.</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="text-white/30 font-serif text-xl">02</div>
                                <div>
                                    <h4 className="text-white font-bold mb-2">Your Architect</h4>
                                    <p className="text-white/40 text-sm">Paid by the hour or percent of cost. More complex plans = more money. No incentive to keep it simple.</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="text-white/30 font-serif text-xl">03</div>
                                <div>
                                    <h4 className="text-white font-bold mb-2">Your Builder</h4>
                                    <p className="text-white/40 text-sm">Every answer they give ("Should we upgrade?") is filtered through: "How does this affect my profit?"</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    <div className="bg-[#080808] p-10 rounded-2xl border border-white/10 relative">
                        <div className="absolute -top-4 -right-4 bg-white text-black px-4 py-2 font-bold text-xs uppercase tracking-wider rounded-lg transform rotate-3">The Reality</div>
                        <h3 className="text-2xl font-serif mb-6 text-white">The Blind Trust Cost</h3>
                        <ul className="space-y-4 mb-8">
                            <li className="flex items-center justify-between text-white/50 border-b border-white/5 pb-2">
                                <span>Improper Land Purchase</span>
                                <span className="text-red-500">-$50,000</span>
                            </li>
                            <li className="flex items-center justify-between text-white/50 border-b border-white/5 pb-2">
                                <span>Over-Designed Plans</span>
                                <span className="text-red-500">-$25,000</span>
                            </li>
                            <li className="flex items-center justify-between text-white/50 border-b border-white/5 pb-2">
                                <span>Builder Change Orders</span>
                                <span className="text-red-500">-$35,000</span>
                            </li>
                            <li className="flex items-center justify-between text-white pb-2 font-bold mt-4">
                                <span>Total Wastage</span>
                                <span className="text-red-500">-$110,000</span>
                            </li>
                        </ul>
                        <p className="text-white/30 text-sm italic text-center">
                            "You're forced to trust people whose financial success depends on you spending more, not less."
                        </p>
                    </div>
                </div>
            </section>

            {/* SECTION 4: THE SOLUTION */}
            <section className="py-32 bg-[#050505] relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-blue-900/5 to-transparent"></div>
                <div className="max-w-7xl mx-auto px-6">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeInUp}
                        className="text-center mb-20"
                    >
                        <span className="text-blue-500 font-bold uppercase tracking-[0.2em] text-xs mb-6 block">The Solution</span>
                        <h2 className="text-4xl md:text-6xl font-serif mb-8">
                            What If You Actually <br /> <span className="text-blue-500">Knew What You Were Doing?</span>
                        </h2>
                        <p className="text-white/60 text-xl max-w-3xl mx-auto leading-relaxed">
                            That's what we built. An AI platform that gives you the knowledge and protection you need at every single step—so you don't have to blindly trust conflicting interests.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="p-10 border border-blue-500/20 bg-blue-500/5 rounded-2xl">
                            <h3 className="text-2xl font-bold mb-4 flex items-center gap-3">
                                <Search className="text-blue-500" /> Before You Buy Land
                            </h3>
                            <p className="text-white/60 leading-relaxed">
                                Our AI analyzes zoning, setback requirements, soil reports, and building restrictions. You'll know if a lot works for your project before you spend a dime.
                            </p>
                        </div>
                        <div className="p-10 border border-blue-500/20 bg-blue-500/5 rounded-2xl">
                            <h3 className="text-2xl font-bold mb-4 flex items-center gap-3">
                                <FileText className="text-blue-500" /> Before You Sign
                            </h3>
                            <p className="text-white/60 leading-relaxed">
                                Our AI audits their contract, compares their bid to market rates, and flags any language that leaves you exposed to surprise costs.
                            </p>
                        </div>
                        <div className="p-10 border border-blue-500/20 bg-blue-500/5 rounded-2xl">
                            <h3 className="text-2xl font-bold mb-4 flex items-center gap-3">
                                <Ruler className="text-blue-500" /> Before You Design
                            </h3>
                            <p className="text-white/60 leading-relaxed">
                                We show you what's realistic for your budget and location. No over-designing. No wasted fees on plans that won't get approved.
                            </p>
                        </div>
                        <div className="p-10 border border-blue-500/20 bg-blue-500/5 rounded-2xl">
                            <h3 className="text-2xl font-bold mb-4 flex items-center gap-3">
                                <Shield className="text-blue-500" /> During Construction
                            </h3>
                            <p className="text-white/60 leading-relaxed">
                                Every change order gets reviewed. Every "unforeseen issue" gets fact-checked. You're not operating on blind trust anymore—you're operating on data.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* SECTION 5: THE RESULTS */}
            <section className="py-24 bg-black border-y border-white/10">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12 text-center divide-y md:divide-y-0 md:divide-x divide-white/10">
                    <div className="p-6">
                        <div className="text-6xl font-serif text-white mb-2">$0</div>
                        <p className="text-white/40 uppercase tracking-widest text-xs">Cost to Use Platform</p>
                    </div>
                    <div className="p-6">
                        <div className="text-6xl font-serif text-white mb-2">$100k</div>
                        <p className="text-white/40 uppercase tracking-widest text-xs">Avg. Saved on Build</p>
                    </div>
                    <div className="p-6">
                        <div className="text-6xl font-serif text-green-500 mb-2">$15k</div>
                        <p className="text-white/40 uppercase tracking-widest text-xs">Avg. Cash Rebate</p>
                    </div>
                </div>
                <div className="text-center mt-12 text-white/30 text-sm">
                    We make money when you win. That's it.
                </div>
            </section>

            {/* SECTION 6: HOW IT WORKS */}
            <section className="py-32 bg-[#050505] relative">
                <div className="max-w-4xl mx-auto px-6">
                    <div className="text-center mb-24">
                        <span className="text-purple-500 font-bold uppercase tracking-[0.2em] text-xs mb-4 block">How It Works</span>
                        <h2 className="text-5xl md:text-7xl font-serif mb-8">From Idea to Move-In.</h2>
                        <p className="text-white/50 text-lg">All in one place. No jargon. No confusion.</p>
                    </div>

                    <div className="space-y-6">
                        {[
                            { title: "The Vision", desc: "Tell us what you want. Our AI helps you figure out budget and scope so you're not guessing." },
                            { title: "Get Financing", desc: "Soft credit check to see what you qualify for. Then lenders compete for your business." },
                            { title: "Find Land", desc: "We analyze lots for zoning issues, soil conditions, and setbacks before you offer." },
                            { title: "Hire Architect", desc: "We match you with top architects and give you a realistic scope. (Rebate Eligible)" },
                            { title: "Hire Builder", desc: "Multiple builders bid. Our AI compares them side-by-side and audits contracts. (Rebate Eligible)" },
                            { title: "Protect Budget", desc: "During construction, our AI reviews change orders and flags anything suspicious." },
                            { title: "Get Your Keys", desc: "Move into your dream home. We mail you a rebate check for being smart." },
                        ].map((step, i) => (
                            <div key={i} className="flex gap-6 items-start p-6 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/10">
                                <div className="text-2xl font-serif text-white/30 font-bold">0{i + 1}</div>
                                <div>
                                    <h3 className="text-xl font-bold mb-2 text-white">{step.title}</h3>
                                    <p className="text-white/50">{step.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* SECTION 7: WHY THIS WORKS */}
            <section className="py-32 bg-black border-y border-white/5">
                <div className="max-w-5xl mx-auto px-6 text-center">
                    <div className="inline-block p-4 rounded-full bg-green-500/10 mb-8">
                        <Coins className="text-green-500" size={32} />
                    </div>
                    <h2 className="text-4xl md:text-5xl font-serif mb-8">We Win When You Win. <br />That's The Whole Model.</h2>
                    <p className="text-white/60 text-lg leading-relaxed max-w-3xl mx-auto mb-12">
                        Most platforms say they're "free" then hit you with hidden fees. We don't. <br /><br />
                        Builders want qualified clients. Architects want the same. When we send them someone like you, they pay us a referral fee—just like a real estate agent. <br /><br />
                        <span className="text-white font-bold">We keep enough to run the platform. The rest goes to you as a thank-you.</span>
                    </p>
                </div>
            </section>

            {/* SECTION 8: CTA */}
            <section className="py-40 relative text-center overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1600607686527-6fb886090705?q=80&w=2600&auto=format&fit=crop')] bg-cover bg-center opacity-20 blur-sm"></div>
                <div className="absolute inset-0 bg-black/60"></div>

                <div className="relative z-10 max-w-3xl mx-auto px-6">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeInUp}
                    >
                        <h2 className="text-5xl md:text-8xl font-serif mb-8 text-white tracking-tighter">
                            Don't Build Blind.
                        </h2>
                        <p className="text-xl text-white/60 mb-12">
                            The difference between doing it right and doing it wrong is six figures and years of stress.
                        </p>
                        <div className="flex flex-col items-center gap-4">
                            <Link to="/login?mode=signup" className="inline-block px-16 py-8 bg-white text-black font-bold uppercase tracking-[0.2em] text-sm hover:scale-105 transition-transform shadow-[0_0_50px_rgba(255,255,255,0.3)] rounded-full">
                                Start For Free
                            </Link>
                            <span className="text-xs uppercase tracking-[0.2em] text-white/40">Takes 2 minutes. No payment info required.</span>
                        </div>
                    </motion.div>
                </div>
            </section>

        </div>
    );
};
