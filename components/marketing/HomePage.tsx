import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import {
    ArrowRight, Check, Shield, Zap, TrendingUp, Cpu, Coins, Lock,
    Search, Heart, Map, Home, FileText, Users, ChevronDown, DollarSign,
    AlertTriangle, EyeOff, Gavel, FileX, Ruler, HardHat, Sparkles
} from 'lucide-react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';

export const HomePage: React.FC = () => {

    // Animation Variants
    const fadeInUp = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } }
    };

    const staggerContainer = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15,
                delayChildren: 0.2
            }
        }
    };

    // Data for the 7 Stages Scroll Effect
    const stages = [
        {
            title: "The Vision",
            subtitle: "Define before you design.",
            desc: "Most people rush to an architect and waste $15k on drawings they can't afford to build. We use AI to reverse-engineer your budget first.",
            benefit: "Benefit: You never fall in love with a home you can't afford.",
            cta: "Define Your Scope"
        },
        {
            title: "Get Financing",
            subtitle: "Lenders compete for your rate.",
            desc: "Instead of begging one bank for a loan, our network of construction lenders competes to fund your build. You pick the best terms.",
            benefit: "Benefit: Save 0.5% - 1.0% on your rate (worth ~$50k+).",
            cta: "Compare Rates"
        },
        {
            title: "Find Land",
            subtitle: "Deep analysis checks (Zoning/Soil).",
            desc: "We run a 50-point automated check on any plot of land. Zoning, setbacks, soil composition, utility access—we check it all before you sign.",
            benefit: "Benefit: Avoid the 'unbuildable lot' nightmare.",
            cta: "Analyze a Lot"
        },
        {
            title: "Hire Architect",
            subtitle: "Match with pros + Rebate eligible.",
            desc: "We match you with vetted architects who understand your budget. Plus, because we brought them the deal, they give us a referral fee.",
            benefit: "Benefit: We pass 50-100% of that referral fee back to you.",
            cta: "Find an Architect"
        },
        {
            title: "Hire Builder",
            subtitle: "Compare bids side-by-side. 0% markup.",
            desc: "Get 3 standardized bids from top-rated local builders. Our AI normalizes them so you can compare apples to apples.",
            benefit: "Benefit: Stop builders from hiding profit in 'allowances'.",
            cta: "Get Bids"
        },
        {
            title: "Protect Budget",
            subtitle: "Active monitoring of change orders.",
            desc: "Construction is chaos. We act as your 'Change Order Guard', reviewing every extra cost the builder tries to charge you.",
            benefit: "Benefit: Save an average of 15% on construction overages.",
            cta: "Start Protection"
        },
        {
            title: "Get Your Keys",
            subtitle: "Move in. Receive your rebate check.",
            desc: "The moment you get your certificate of occupancy, we cut you a check for your accumulated rebates.",
            benefit: "Benefit: Use the cash for furniture, landscaping, or a vacation.",
            cta: "Calculate Rebate"
        },
    ];

    return (
        <div className="bg-[#030303] text-zinc-100 font-sans selection:bg-white/20 selection:text-white overflow-x-hidden relative">

            {/* UNIFIED GLOBAL BACKGROUND - Fixed simple spotlight */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1400px] h-[800px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-800/20 via-[#030303] to-[#030303]"></div>
            </div>

            {/* HER0 - Elegant, Centered, Spotlight */}
            <section className="relative z-10 min-h-[90vh] flex items-center justify-center py-32">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={staggerContainer}
                    >
                        <motion.div variants={fadeInUp} className="flex justify-center mb-10">
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                className="inline-flex items-center gap-2 border border-white/5 rounded-full px-4 py-1.5 bg-white/[0.02] backdrop-blur-md"
                            >
                                <Sparkles size={14} className="text-white/70" />
                                <span className="text-[11px] uppercase tracking-[0.2em] font-medium text-white/60">The AI Home Platform</span>
                            </motion.div>
                        </motion.div>

                        <motion.h1 variants={fadeInUp} className="text-5xl md:text-8xl lg:text-9xl font-serif font-medium tracking-tighter leading-[0.95] mb-12 text-white mix-blend-screen">
                            Building Custom? <br />
                            <span className="text-[#a1a1aa]">Build Smarter.</span>
                        </motion.h1>

                        <motion.p variants={fadeInUp} className="text-xl md:text-2xl text-zinc-300 max-w-3xl mx-auto mb-14 leading-relaxed font-light tracking-wide">
                            We help you build faster, smarter, safer, <br className="hidden md:block" />
                            <span className="text-zinc-100 font-normal">and we pay you an average of $10,000+ to do it.</span>
                        </motion.p>

                        <motion.div variants={fadeInUp} className="flex flex-col items-center gap-8">
                            <Link to="/login?mode=signup" className="group relative px-12 py-5 bg-white text-black font-semibold text-sm tracking-widest uppercase transition-all hover:bg-zinc-200 rounded-full overflow-hidden hover:scale-105 active:scale-95 duration-300">
                                <span className="relative z-10">Get Started</span>
                            </Link>
                            <span className="text-[11px] uppercase tracking-[0.2em] text-zinc-500">No Cost • No Card Required</span>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* SECTION 2: THE MINEFIELD - Red/Black, Bento Grid */}
            <section className="relative z-10 py-32">
                <div className="max-w-7xl mx-auto px-6 mb-24">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                        variants={fadeInUp}
                        className="text-center"
                    >
                        <h2 className="text-4xl md:text-7xl font-serif mb-8 leading-tight">
                            One Wrong Move Can <br /> <span className="text-red-500/90">Cost You Everything.</span>
                        </h2>
                        <p className="text-zinc-300 text-lg md:text-xl max-w-3xl mx-auto mb-12">
                            A maze of technical decisions where a single mistake wipes out six figures. <br />
                            <span className="text-zinc-100">And you won't know until it's too late.</span>
                        </p>
                        <Link to="/login?mode=signup" className="inline-flex items-center gap-2 text-white border-b border-red-500/50 pb-1 hover:text-red-400 hover:border-red-400 transition-colors uppercase tracking-widest text-xs">
                            Avoid These Traps <ArrowRight size={14} />
                        </Link>
                    </motion.div>
                </div>

                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    variants={staggerContainer}
                    className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-6"
                >
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
                            variants={fadeInUp}
                            whileHover={{ scale: 1.02, backgroundColor: "rgba(255, 50, 50, 0.02)" }}
                            className="group relative bg-[#080808] p-10 md:p-12 border border-white/[0.03] hover:border-red-500/20 transition-all rounded-[2rem] overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-red-500/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            <div className="relative z-10 flex flex-col h-full justify-between gap-8">
                                <div>
                                    <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center mb-8 group-hover:bg-red-500/20 transition-colors">
                                        {trap.icon}
                                    </div>
                                    <h3 className="text-3xl font-medium text-white mb-4">{trap.title}</h3>
                                    <p className="text-zinc-400 text-lg leading-relaxed">{trap.desc}</p>
                                </div>
                                <div className="text-red-500 font-mono text-sm tracking-wider uppercase border-t border-white/5 pt-6 flex justify-between items-center bg-black/20 p-4 rounded-xl">
                                    <span>Financial Impact</span>
                                    <span className="font-bold text-lg">{trap.value}</span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </section>

            {/* SECTION 3: THE TRUST TRAP - Centered Layout */}
            <section className="relative z-10 py-32">
                <div className="max-w-7xl mx-auto px-6">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                        variants={staggerContainer}
                        className="text-center"
                    >
                        <motion.h2 variants={fadeInUp} className="text-4xl md:text-7xl font-serif mb-16 px-4">
                            Everyone You Rely On Has a <br /><span className="text-white/40 italic">Conflict of Interest.</span>
                        </motion.h2>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left mb-16">
                            {[
                                { role: "Realtor", motive: "Commission", desc: "Wants you to buy any land so they get paid. Not their job to check if it's buildable." },
                                { role: "Architect", motive: "Complexity", desc: "Paid by % of cost. More expensive designs = higher fees. No incentive to save you money." },
                                { role: "Builder", motive: "Profit", desc: "Every piece of advice they give is filtered through one question: 'Does this make me more money?'" }
                            ].map((person, i) => (
                                <motion.div
                                    key={i}
                                    variants={fadeInUp}
                                    whileHover={{ y: -10 }}
                                    className="p-10 rounded-3xl bg-[#050505] border border-white/[0.05] hover:border-white/10 transition-colors"
                                >
                                    <div className="text-xs uppercase tracking-[0.2em] text-zinc-400 mb-6 font-semibold">{person.role}</div>
                                    <div className="text-2xl text-white mb-4 font-serif">{person.motive}</div>
                                    <div className="text-zinc-400 leading-relaxed">{person.desc}</div>
                                </motion.div>
                            ))}
                        </div>

                        <Link to="/login?mode=signup" className="px-8 py-4 border border-white/10 rounded-full text-white uppercase tracking-widest text-xs hover:bg-white hover:text-black transition-all">
                            Get Unbiased Advice
                        </Link>

                        <motion.div variants={fadeInUp} className="mt-20 inline-flex flex-col items-center p-8 border border-white/5 rounded-2xl bg-white/[0.01]">
                            <div className="text-zinc-300 text-lg mb-3 italic">"The only people who know how to avoid mistakes..."</div>
                            <div className="text-white text-xl md:text-2xl font-medium">...are the same people who profit when you make them.</div>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* SECTION 4: THE SOLUTION - Green/Black, High Tech */}
            <section className="relative z-10 py-32">
                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                        variants={fadeInUp}
                        className="text-center mb-24"
                    >
                        <h2 className="text-4xl md:text-7xl font-serif mb-8">
                            What If You Actually <br /> <span className="text-green-500/90">Knew What You Were Doing?</span>
                        </h2>
                        <p className="text-zinc-300 text-xl max-w-2xl mx-auto mb-10">
                            Reclaim control with AI that audits every contract, land deal, and bid. <br />
                            <span className="text-white">Don't operate on trust. Operate on data.</span>
                        </p>
                        <Link to="/login?mode=signup" className="inline-flex items-center gap-2 text-green-500 border-b border-green-500/50 pb-1 hover:text-green-400 hover:border-green-400 transition-colors uppercase tracking-widest text-xs">
                            See The Technology <ArrowRight size={14} />
                        </Link>
                    </motion.div>

                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-50px" }}
                        variants={staggerContainer}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                    >
                        {[
                            { title: "Land Analysis", desc: "Zoning, Soil, & Setback checks before you offer.", icon: <Search /> },
                            { title: "Contract Audit", desc: "We flag language that exposes you to surprise costs.", icon: <FileText /> },
                            { title: "Bid Compare", desc: "See exactly where builders are padding their numbers.", icon: <Users /> },
                            { title: "Change Guard", desc: "Real-time auditing of every change order.", icon: <Shield /> }
                        ].map((feat, i) => (
                            <motion.div
                                key={i}
                                variants={fadeInUp}
                                whileHover={{ scale: 1.05, backgroundColor: "#060606" }}
                                className="bg-[#050505] p-10 rounded-[2rem] border border-white/[0.05] hover:border-green-500/30 transition-all group cursor-default"
                            >
                                <div className="text-zinc-500 group-hover:text-green-500 transition-colors mb-8 transform group-hover:scale-110 duration-300 origin-left">
                                    {feat.icon}
                                </div>
                                <h3 className="text-xl font-medium text-white mb-3">{feat.title}</h3>
                                <p className="text-zinc-400 text-sm leading-relaxed">{feat.desc}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* SECTION 5: THE RESULTS - Big Type */}
            <section className="relative z-10 py-32">
                <div className="max-w-7xl mx-auto px-6">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={staggerContainer}
                        className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center"
                    >
                        {[
                            { label: "Platform Cost", value: "$0", color: "text-white" },
                            { label: "Avg. Build Savings", value: "$100k", color: "text-white" },
                            { label: "Avg. Cash Rebate", value: "$15k", color: "text-green-500" }
                        ].map((stat, i) => (
                            <motion.div
                                key={i}
                                variants={fadeInUp}
                                className="flex flex-col items-center justify-center p-8 border-r border-white/[0.03] last:border-r-0 md:border-b-0 border-b last:border-b-0"
                            >
                                <div className={`text-7xl md:text-9xl font-serif tracking-tighter mb-6 ${stat.color}`}>{stat.value}</div>
                                <div className="text-xs uppercase tracking-[0.2em] text-zinc-400 font-semibold mb-8">{stat.label}</div>
                                <Link to="/login?mode=signup" className="text-xs text-white/50 border-b border-white/20 hover:text-white hover:border-white transition-colors pb-0.5">
                                    See How
                                </Link>
                            </motion.div>
                        ))}
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        className="text-center mt-16 text-zinc-500 text-xs uppercase tracking-widest"
                    >
                        We make money when you win. That's it.
                    </motion.div>
                </div>
            </section>

            {/* SECTION 6: HOW IT WORKS - SCROLL REVEAL TIMELINE */}
            <section className="relative z-10 py-32 px-6">
                <div className="max-w-5xl mx-auto">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeInUp}
                        className="text-center mb-32"
                    >
                        <h2 className="text-5xl md:text-7xl font-serif mb-6">From Idea to Move-In.</h2>
                        <p className="text-zinc-400 text-xl">One seamless process. Integrated protection.</p>
                    </motion.div>

                    <div className="space-y-12">
                        {stages.map((stage, i) => (
                            <StageCard key={i} index={i} stage={stage} />
                        ))}
                    </div>

                    <div className="flex justify-center mt-24">
                        <Link to="/login?mode=signup" className="px-10 py-5 bg-zinc-900 border border-zinc-800 text-white font-semibold uppercase tracking-widest text-xs hover:bg-zinc-800 transition-all rounded-full">
                            Start Your Journey
                        </Link>
                    </div>
                </div>
            </section>

            {/* SECTION 8: CTA - Elegant Finish */}
            <section className="relative z-10 py-32 text-center">
                <div className="relative z-10 max-w-4xl mx-auto px-6">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeInUp}
                    >
                        <h2 className="text-6xl md:text-9xl font-serif mb-16 text-white/90 tracking-tighter">
                            Don't Build Blind.
                        </h2>

                        <div className="flex flex-col items-center gap-8">
                            <Link to="/login?mode=signup" className="px-16 py-6 bg-white text-black font-bold uppercase tracking-widest text-sm hover:bg-zinc-200 transition-all rounded-full hover:scale-105 active:scale-95 duration-300 shadow-[0_0_50px_-10px_rgba(255,255,255,0.3)]">
                                Start For Free
                            </Link>
                            <span className="text-[11px] uppercase tracking-[0.2em] text-zinc-500">Takes 2 minutes</span>
                        </div>
                    </motion.div>
                </div>
            </section>

        </div>
    );
};

// Extracted Component for Scroll Effect
const StageCard = ({ index, stage }: { index: number, stage: any }) => {
    return (
        <motion.div
            initial={{ opacity: 0.3, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ margin: "-20% 0px -20% 0px", amount: 0.5 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col md:flex-row gap-8 p-10 rounded-[2.5rem] bg-[#050505] border border-white/[0.05] hover:border-white/10 transition-colors group"
        >
            <div className="flex-shrink-0">
                <div className="text-4xl font-serif text-white/20 group-hover:text-white/40 transition-colors font-medium">0{index + 1}</div>
            </div>
            <div className="flex-1">
                <h3 className="text-3xl font-medium text-white mb-2">{stage.title}</h3>
                <div className="text-lg text-zinc-400 mb-6 font-light">{stage.subtitle}</div>

                {/* Expandable Content for "Deep Explanation" */}
                {/* We use standard block here, but the opacity trigger makes it 'reveal' as you scroll focus */}
                <div className="space-y-6">
                    <p className="text-zinc-300 leading-relaxed text-lg max-w-2xl">{stage.desc}</p>
                    <div className="flex flex-col md:flex-row md:items-center gap-6 pt-4 border-t border-white/[0.05]">
                        <span className="text-green-400 font-medium tracking-wide text-sm">{stage.benefit}</span>
                        <Link to="/login?mode=signup" className="text-xs uppercase tracking-widest text-zinc-500 hover:text-white transition-colors flex items-center gap-2">
                            {stage.cta} <ArrowRight size={12} />
                        </Link>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}
