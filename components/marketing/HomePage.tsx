
import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import {
    ArrowRight, Check, Shield, Zap, TrendingUp, Cpu, Coins, Lock,
    Search, Heart, Map, Home, FileText, Users, ChevronDown, DollarSign,
    AlertTriangle, EyeOff, Gavel, FileX, Ruler, HardHat, Sparkles
} from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';

export const HomePage: React.FC = () => {
    const targetRef = useRef<HTMLDivElement>(null);

    // Animation Variants - Slower, smoother 'Framer-like' feel
    const fadeInUp = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } }
    };

    const staggerContainer = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    };

    return (
        <div className="bg-[#030303] text-zinc-100 font-sans selection:bg-white/20 selection:text-white overflow-x-hidden">

            {/* HER0 - Elegant, Centered, Spotlight */}
            <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
                {/* Ambient Background */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-white/[0.02] rounded-[100%] blur-[120px] pointer-events-none"></div>
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-900/20 via-[#030303] to-[#030303]"></div>

                <div className="relative z-20 max-w-5xl mx-auto px-6 text-center">
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={staggerContainer}
                    >
                        <motion.div variants={fadeInUp} className="flex justify-center mb-8">
                            <div className="inline-flex items-center gap-2 border border-white/5 rounded-full px-3 py-1 bg-white/[0.02] backdrop-blur-md">
                                <Sparkles size={12} className="text-white/70" />
                                <span className="text-[10px] uppercase tracking-[0.2em] font-medium text-white/50">The AI Home Platform</span>
                            </div>
                        </motion.div>

                        <motion.h1 variants={fadeInUp} className="text-6xl md:text-8xl lg:text-9xl font-serif font-medium tracking-tighter leading-[0.9] mb-10 text-white mix-blend-screen">
                            Building Custom? <br />
                            <span className="text-[#a1a1aa]">Build Smarter.</span>
                        </motion.h1>

                        <motion.p variants={fadeInUp} className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-12 leading-relaxed font-light tracking-wide">
                            We help you build faster, smarter, safer, <br className="hidden md:block" />
                            <span className="text-zinc-200 font-normal">and we pay you an average of $10,000+ to do it.</span>
                        </motion.p>

                        <motion.div variants={fadeInUp} className="flex flex-col items-center gap-6">
                            <Link to="/login?mode=signup" className="group relative px-10 py-5 bg-white text-black font-semibold text-sm tracking-widest uppercase transition-all hover:bg-zinc-200 rounded-full overflow-hidden">
                                <span className="relative z-10">Get Started</span>
                            </Link>
                            <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-600">No Cost • No Card Required</span>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* SECTION 2: THE MINEFIELD - Red/Black, Bento Grid */}
            <section className="py-32 relative">
                <div className="max-w-6xl mx-auto px-6 mb-24">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeInUp}
                        className="text-center"
                    >
                        <h2 className="text-4xl md:text-7xl font-serif mb-6 leading-tight">
                            One Wrong Move Can <br /> <span className="text-red-500/90">Cost You Everything.</span>
                        </h2>
                        <p className="text-zinc-500 text-lg md:text-xl max-w-2xl mx-auto">
                            A maze of technical decisions where a single mistake wipes out six figures. <br />
                            <span className="text-zinc-300">And you won't know until it's too late.</span>
                        </p>
                    </motion.div>
                </div>

                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                        {
                            title: "The Zoning Trap",
                            desc: "Buying land that you can't build on. The lot is useless. The plans are worthless. You're out $40k+.",
                            value: "-$40,000",
                            icon: <Map className="text-red-500" strokeWidth={1} />
                        },
                        {
                            title: "The Soil Surprise",
                            desc: "Digging starts, bad soil found. Now comes a $75k remediation bill. Budget exploded on day one.",
                            value: "-$75,000",
                            icon: <AlertTriangle className="text-red-500" strokeWidth={1} />
                        },
                        {
                            title: "The Setback Shock",
                            desc: "3 feet too close to the property line. Redesign everything. Re-permit everything. Months lost.",
                            value: "Indefinite Delay",
                            icon: <Ruler className="text-red-500" strokeWidth={1} />
                        },
                        {
                            title: "The Permit Black Hole",
                            desc: "One missed detail in the plans traps you in review for 6 months while material costs rise 15%.",
                            value: "+15% Cost",
                            icon: <FileX className="text-red-500" strokeWidth={1} />
                        }
                    ].map((trap, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1, duration: 0.6 }}
                            className="group relative bg-[#080808] p-10 border border-white/[0.03] hover:border-red-500/20 transition-all rounded-3xl overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-red-500/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="relative z-10 flex flex-col h-full justify-between">
                                <div>
                                    <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center mb-6">
                                        {trap.icon}
                                    </div>
                                    <h3 className="text-2xl font-medium text-white mb-3">{trap.title}</h3>
                                    <p className="text-zinc-500 leading-relaxed mb-8">{trap.desc}</p>
                                </div>
                                <div className="text-red-500 font-mono text-sm tracking-wider uppercase border-t border-white/5 pt-6 flex justify-between items-center">
                                    <span>Financial Impact</span>
                                    <span className="font-bold">{trap.value}</span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* SECTION 3: THE TRUST TRAP - Centered Layout */}
            <section className="py-40 bg-black border-y border-white/[0.03]">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeInUp}
                    >
                        <h2 className="text-4xl md:text-6xl font-serif mb-12">
                            Everyone You Rely On Has a <br /><span className="text-white/40 italic">Conflict of Interest.</span>
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
                            {[
                                { role: "Realtor", motive: "Commission", desc: "Wants you to buy any land so they get paid. Not their job to check if it's buildable." },
                                { role: "Architect", motive: "Complexity", desc: "Paid by % of cost. More expensive designs = higher fees. No incentive to save you money." },
                                { role: "Builder", motive: "Profit", desc: "Every piece of advice they give is filtered through one question: 'Does this make me more money?'" }
                            ].map((person, i) => (
                                <div key={i} className="p-8 rounded-3xl bg-[#050505] border border-white/[0.05]">
                                    <div className="text-xs uppercase tracking-[0.2em] text-zinc-600 mb-4">{person.role}</div>
                                    <div className="text-lg text-white mb-2">{person.motive}</div>
                                    <div className="text-zinc-500 text-sm leading-relaxed">{person.desc}</div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-20 inline-flex flex-col items-center">
                            <div className="text-zinc-400 text-lg mb-2 italic">"The only people who know how to avoid mistakes..."</div>
                            <div className="text-white text-xl">...are the same people who profit when you make them.</div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* SECTION 4: THE SOLUTION - Green/Black, High Tech */}
            <section className="py-32 relative overflow-hidden">
                {/* Subtle Green Glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-green-500/[0.03] rounded-full blur-[120px] pointer-events-none"></div>

                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeInUp}
                        className="text-center mb-24"
                    >
                        <h2 className="text-4xl md:text-7xl font-serif mb-8">
                            What If You Actually <br /> <span className="text-green-500/90">Knew What You Were Doing?</span>
                        </h2>
                        <p className="text-zinc-400 text-xl max-w-2xl mx-auto">
                            Reclaim control with AI that audits every contract, land deal, and bid. <br />
                            <span className="text-white">Don't operate on trust. Operate on data.</span>
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { title: "Land Analysis", desc: "Zoning, Soil, & Setback checks before you offer.", icon: <Search /> },
                            { title: "Contract Audit", desc: "We flag language that exposes you to surprise costs.", icon: <FileText /> },
                            { title: "Bid Compare", desc: "See exactly where builders are padding their numbers.", icon: <Users /> },
                            { title: "Change Guard", desc: "Real-time auditing of every change order.", icon: <Shield /> }
                        ].map((feat, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1, duration: 0.5 }}
                                className="bg-[#050505] p-8 rounded-3xl border border-white/[0.05] hover:border-green-500/30 transition-colors group"
                            >
                                <div className="text-zinc-600 group-hover:text-green-500 transition-colors mb-6">
                                    {feat.icon}
                                </div>
                                <h3 className="text-lg font-medium text-white mb-2">{feat.title}</h3>
                                <p className="text-zinc-500 text-sm">{feat.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* SECTION 5: THE RESULTS - Big Type */}
            <section className="py-32 bg-[#020202] border-y border-white/[0.03]">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
                    {[
                        { label: "Platform Cost", value: "$0", color: "text-white" },
                        { label: "Avg. Build Savings", value: "$100k", color: "text-white" },
                        { label: "Avg. Cash Rebate", value: "$15k", color: "text-green-500" }
                    ].map((stat, i) => (
                        <div key={i} className="flex flex-col items-center justify-center p-8 border-r border-white/[0.03] last:border-r-0">
                            <div className={`text-7xl md:text-8xl font-serif tracking-tighter mb-4 ${stat.color}`}>{stat.value}</div>
                            <div className="text-xs uppercase tracking-[0.2em] text-zinc-600">{stat.label}</div>
                        </div>
                    ))}
                </div>
                <div className="text-center mt-12 text-zinc-700 text-xs uppercase tracking-widest">
                    We make money when you win. That's it.
                </div>
            </section>

            {/* SECTION 6: HOW IT WORKS - Timeline */}
            <section className="py-40 relative px-6">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-24">
                        <h2 className="text-5xl md:text-6xl font-serif mb-6">From Idea to Move-In.</h2>
                        <p className="text-zinc-500">All in one place. No jargon. No games.</p>
                    </div>

                    <div className="space-y-4">
                        {[
                            { title: "The Vision", desc: "AI helps define budget & scope." },
                            { title: "Get Financing", desc: "Lenders compete for your rate." },
                            { title: "Find Land", desc: "Deep analysis checks (Zoning/Soil) before purchase." },
                            { title: "Hire Architect", desc: "Match with pros + Rebate eligible." },
                            { title: "Hire Builder", desc: "Compare bids side-by-side. 0% markup." },
                            { title: "Protect Budget", desc: "Active monitoring of all change orders." },
                            { title: "Get Your Keys", desc: "Move in. Receive your rebate check." },
                        ].map((step, i) => (
                            <div key={i} className="flex items-center gap-8 p-6 rounded-3xl hover:bg-white/[0.02] border border-transparent hover:border-white/[0.05] transition-all group">
                                <div className="text-xl font-mono text-zinc-700 group-hover:text-white transition-colors">0{i + 1}</div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-medium text-zinc-300 group-hover:text-white transition-colors">{step.title}</h3>
                                </div>
                                <div className="text-zinc-600 text-sm text-right hidden md:block">
                                    {step.desc}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* SECTION 8: CTA - Elegant Finish */}
            <section className="py-40 relative text-center">
                <div className="relative z-10 max-w-3xl mx-auto px-6">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeInUp}
                    >
                        <h2 className="text-6xl md:text-8xl font-serif mb-12 text-white/90 tracking-tighter">
                            Don't Build Blind.
                        </h2>

                        <div className="flex flex-col items-center gap-6">
                            <Link to="/login?mode=signup" className="px-12 py-5 bg-white text-black font-semibold uppercase tracking-widest text-xs hover:bg-zinc-200 transition-colors rounded-full animate-pulse-slow">
                                Start For Free
                            </Link>
                            <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-600">Takes 2 minutes</span>
                        </div>
                    </motion.div>
                </div>
            </section>

        </div>
    );
};
