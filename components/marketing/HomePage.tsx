
import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import {
    ArrowRight, Check, Shield, Zap, TrendingUp, Cpu, Coins, Lock,
    Search, Heart, Map, Home, FileText, Users, ChevronDown, DollarSign,
    AlertTriangle, EyeOff, Gavel
} from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';

export const HomePage: React.FC = () => {
    const targetRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: targetRef,
        offset: ["start end", "end start"]
    });

    const fadeInUp = {
        hidden: { opacity: 0, y: 40 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
    };

    const staggerContainer = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2
            }
        }
    };

    return (
        <div className="bg-black text-white font-sans selection:bg-white selection:text-black overflow-x-hidden">

            {/* HERO SECTION */}
            <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/90 to-black z-10"></div>
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center opacity-50 grayscale mix-blend-overlay"></div>
                </div>

                <div className="relative z-20 max-w-7xl mx-auto px-6 text-center">
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={fadeInUp}
                    >
                        <div className="inline-flex items-center gap-2 border border-white/20 rounded-full px-4 py-1 mb-8 bg-white/5 backdrop-blur-sm">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-[10px] uppercase tracking-[0.2em] font-medium text-white/70">The AI Home Platform</span>
                        </div>

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

            {/* TICKER / SOCIAL PROOF */}
            <section className="bg-[#050505] border-y border-white/5 py-8 overflow-hidden">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8">
                    <span className="text-[10px] uppercase tracking-[0.2em] text-white/30 whitespace-nowrap">Securing Projects In:</span>
                    <div className="flex gap-12 overflow-hidden mask-linear-fade">
                        {['Aspen', 'Vail', 'Boulder', 'Cherry Hills', 'Denver', 'Fort Collins', 'Breckenridge'].map((city, i) => (
                            <span key={i} className="text-lg font-serif text-white/40 italic whitespace-nowrap">{city}</span>
                        ))}
                    </div>
                </div>
            </section>

            {/* THE UNFAIR TRUTH (NEW SECTION) */}
            <section className="py-32 bg-black relative border-b border-white/5">
                <div className="max-w-4xl mx-auto px-6 text-center mb-20">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeInUp}
                    >
                        <span className="text-red-500 font-bold uppercase tracking-[0.2em] text-xs mb-6 block">The Reality</span>
                        <h2 className="text-4xl md:text-6xl font-serif mb-8 leading-tight">
                            The System is Designed to <br /><span className="italic text-white/50">Confuse You.</span>
                        </h2>
                        <p className="text-white/60 text-xl leading-relaxed">
                            You are building your first custom home. Your builder has built 50.
                            <br />
                            You are playing a game where everyone else knows the cards.
                        </p>
                    </motion.div>
                </div>

                <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        {
                            icon: <EyeOff size={32} className="text-white" />,
                            title: "You Don't Know Costs",
                            desc: "They know exactly what materials and labor cost. You only know what they tell you. This gap is where their profit hides."
                        },
                        {
                            icon: <AlertTriangle size={32} className="text-white" />,
                            title: "Conflict of Interest",
                            desc: "You rely on them for advice, but every question you ask is answered by someone who makes money from the answer."
                        },
                        {
                            icon: <Gavel size={32} className="text-white" />,
                            title: "The Change Order Trap",
                            desc: "They bid low to win the job, then use 'unforeseen' issues to hit you with massive bills once you're trapped in the contract."
                        }
                    ].map((item, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.2 }}
                            className="bg-[#080808] p-10 rounded-2xl border border-white/5 hover:border-white/20 transition-colors"
                        >
                            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-8">
                                {item.icon}
                            </div>
                            <h3 className="text-xl font-serif mb-4">{item.title}</h3>
                            <p className="text-white/50 leading-relaxed">{item.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* THE REBATE - "Paid to Build" */}
            <section className="py-32 bg-[#050505] border-y border-white/10 overflow-hidden">
                <div className="max-w-7xl mx-auto px-6">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={staggerContainer}
                        className="text-center mb-24"
                    >
                        <motion.span variants={fadeInUp} className="text-green-500 font-bold uppercase tracking-[0.2em] text-xs mb-4 block">The Solution</motion.span>
                        <motion.h2 variants={fadeInUp} className="text-5xl md:text-8xl font-serif mb-8">
                            GET PAID TO BUILD.
                        </motion.h2>
                        <motion.p variants={fadeInUp} className="text-white/60 text-xl max-w-2xl mx-auto">
                            We level the playing field. And we put cash back in your pocket.
                        </motion.p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="col-span-1 md:col-span-2 bg-[#0A0A0A] border border-white/10 rounded-2xl p-12 relative overflow-hidden group"
                        >
                            <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:opacity-20 transition-opacity">
                                <DollarSign size={200} />
                            </div>
                            <div className="relative z-10">
                                <div className="text-green-500 text-6xl md:text-8xl font-serif mb-6">$10,000+</div>
                                <h3 className="text-2xl font-bold mb-4">Average Cash Rebates</h3>
                                <p className="text-white/50 text-lg max-w-md">
                                    We negotiate bulk rates with builders and suppliers. Instead of keeping the difference, we pass it back to you as a check at closing.
                                </p>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.4 }}
                            className="bg-white text-black rounded-2xl p-12 flex flex-col justify-center"
                        >
                            <h3 className="text-2xl font-serif mb-6">Why It's Free</h3>
                            <p className="text-black/60 mb-8 leading-relaxed">
                                Builders pay us a referral fee for bringing them a qualified client (you). We keep the lights on, and share the rest with you.
                            </p>
                            <div className="mt-auto pt-8 border-t border-black/10">
                                <div className="text-sm font-bold uppercase tracking-wider mb-1">Your Cost</div>
                                <div className="text-4xl font-serif">$0.00</div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* THE 7-STAGE JOURNEY */}
            <section className="py-32 bg-black relative" ref={targetRef}>
                <div className="max-w-4xl mx-auto px-6">
                    <div className="text-center mb-24">
                        <span className="text-purple-500 font-bold uppercase tracking-[0.2em] text-xs mb-4 block">The Roadmap</span>
                        <h2 className="text-5xl md:text-7xl font-serif mb-8">From Vision to Keys.</h2>
                        <p className="text-white/50 text-lg">Your AI Assistant guides you every step of the way.</p>
                    </div>

                    <div className="relative">
                        {/* Connecting Line */}
                        <div className="absolute left-8 top-8 bottom-8 w-px bg-white/10 hidden md:block"></div>

                        <div className="space-y-12">
                            {[
                                { number: "01", title: "Vision", desc: "Tell us your dream. Our AI creates the budget and plan.", icon: <Heart size={20} /> },
                                { number: "02", title: "Pre-Approval", desc: "See if you qualify instantly. No paperwork nightmares.", icon: <Check size={20} /> },
                                { number: "03", title: "Lending", desc: "Lenders compete for your business. You get the best rate.", icon: <TrendingUp size={20} /> },
                                { number: "04", title: "Land", desc: "We find the perfect lot for your custom home.", icon: <Map size={20} /> },
                                { number: "05", title: "Design", desc: "Meet top architects and get rebates on their fees.", icon: <Home size={20} /> },
                                { number: "06", title: "Builder", desc: "Builders bid on your project. We compare them for you.", icon: <Users size={20} /> },
                                { number: "07", title: "Protect", desc: "We audit every bill to keep your budget safe.", icon: <Lock size={20} /> },
                            ].map((step, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true, margin: "-100px" }}
                                    transition={{ duration: 0.5, delay: i * 0.1 }}
                                    className="relative pl-0 md:pl-24"
                                >
                                    {/* Timeline Node */}
                                    <div className="absolute left-0 top-0 w-16 h-16 bg-[#111] border border-white/10 rounded-full hidden md:flex items-center justify-center z-10">
                                        <span className="text-white/30 font-serif">{step.number}</span>
                                    </div>

                                    <div className="bg-[#111] border border-white/10 p-8 rounded-2xl hover:border-white/30 transition-colors group">
                                        <div className="flex items-start justify-between mb-4">
                                            <h3 className="text-2xl font-bold flex items-center gap-3">
                                                {step.title}
                                                {i >= 4 && i <= 5 && <span className="text-[10px] bg-green-500/10 text-green-500 px-2 py-1 rounded border border-green-500/20 uppercase tracking-wider">Rebate Eligible</span>}
                                            </h3>
                                            <div className="text-white/20 group-hover:text-white transition-colors">
                                                {step.icon}
                                            </div>
                                        </div>
                                        <p className="text-white/50 leading-relaxed">{step.desc}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* FINAL CTA */}
            <section className="py-40 relative text-center overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center opacity-20 blur-sm"></div>
                <div className="absolute inset-0 bg-black/60"></div>

                <div className="relative z-10 max-w-3xl mx-auto px-6">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeInUp}
                    >
                        <h2 className="text-5xl md:text-8xl font-serif mb-8 text-white tracking-tighter">
                            Ready to Build Smarter?
                        </h2>
                        <p className="text-xl text-white/60 mb-12">
                            Join the platform that pays you to build.
                        </p>
                        <div className="flex flex-col items-center gap-4">
                            <Link to="/login?mode=signup" className="inline-block px-16 py-8 bg-white text-black font-bold uppercase tracking-[0.2em] text-sm hover:scale-105 transition-transform shadow-[0_0_50px_rgba(255,255,255,0.3)] rounded-full">
                                Get Started
                            </Link>
                            <span className="text-xs uppercase tracking-[0.2em] text-white/40">We don't charge you a dime</span>
                        </div>
                    </motion.div>
                </div>
            </section>

        </div>
    );
};
