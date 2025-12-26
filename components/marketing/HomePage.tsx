
import React from 'react';
import { Link } from 'react-router-dom';
import { Check, ArrowRight, Play, Shield, DollarSign, Users, Award } from 'lucide-react';
import { motion } from 'framer-motion';

export const HomePage: React.FC = () => {
    return (
        <div className="bg-black text-white font-sans selection:bg-white selection:text-black overflow-x-hidden">

            {/* HERO SECTION - High Impact, minimal distraction */}
            <section className="relative min-h-screen flex items-center justify-center pt-20">
                {/* Background Effects */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-gradient-to-b from-black via-black/90 to-black z-10"></div>
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1600607686527-6fb886090705?q=80&w=2787&auto=format&fit=crop')] bg-cover bg-center opacity-30 grayscale mix-blend-overlay"></div>
                </div>

                <div className="relative z-20 max-w-7xl mx-auto px-6 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="inline-flex items-center gap-2 border border-white/20 rounded-full px-4 py-1 mb-8 bg-white/5 backdrop-blur-sm">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-[10px] uppercase tracking-[0.2em] font-medium text-white/70">Accepting New Projects for 2025</span>
                        </div>

                        <h1 className="text-5xl md:text-8xl lg:text-9xl font-serif font-medium tracking-tighter leading-[0.9] mb-8 text-white">
                            BUILDING IS <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40">WAR.</span>
                        </h1>

                        <p className="text-lg md:text-2xl text-white/60 max-w-3xl mx-auto mb-12 leading-relaxed font-light">
                            Budget overruns. Contractor disputes. Delays. <br className="hidden md:block" />
                            You can go it alone and be conquered, or hire a consultant and win.
                        </p>

                        <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                            <Link to="/login?mode=signup" className="group relative px-10 py-5 bg-white text-black font-bold uppercase tracking-[0.2em] text-xs transition-all hover:scale-105 active:scale-95">
                                <span className="relative z-10">Start Your Project</span>
                                <div className="absolute inset-0 bg-white blur-lg opacity-50 group-hover:opacity-100 transition-opacity"></div>
                            </Link>

                            <a href="#system" className="text-xs uppercase tracking-[0.2em] text-white/50 hover:text-white transition-colors flex items-center gap-2">
                                See The System <ArrowRight size={14} />
                            </a>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* VIDEO / SOCIAL PROOF BAR */}
            <section className="border-y border-white/10 bg-[#050505]">
                <div className="max-w-7xl mx-auto px-6 py-8 flex flex-wrap justify-center md:justify-between items-center gap-8">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-white/30 hidden md:block">Securing Projects In:</p>
                    {['Aspen', 'Vail', 'Boulder', 'Cherry Hills', 'Denver'].map((city, i) => (
                        <span key={i} className="text-xl font-serif text-white/40 italic">{city}</span>
                    ))}
                </div>
            </section>

            {/* THE PROBLEM - "The Matrix" equivalent */}
            <section className="py-32 bg-black relative">
                <div className="max-w-5xl mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                        <div>
                            <h2 className="text-4xl md:text-6xl font-serif leading-none mb-8">
                                THE INDUSTRY IS <br />
                                <span className="text-red-500">RIGGED</span> AGAINST YOU.
                            </h2>
                            <p className="text-white/50 text-lg mb-8 leading-relaxed">
                                The builder wants to maximize margin. The bank wants to minimize risk. The architect wants to win awards.
                                <br /><br />
                                <strong>Who is fighting for you?</strong>
                                <br /><br />
                                Without a consultant, you are the prey. We are the apex predator that protects your interests.
                            </p>
                        </div>
                        <div className="space-y-4">
                            {[
                                { title: "The 'Variable' Budget", desc: "Builders bid low to win, then hit you with change orders.", icon: <DollarSign className="text-red-500" /> },
                                { title: "The Timeline Lie", desc: "Projects drag on for months or years without accountability.", icon: <Play className="text-red-500" /> },
                                { title: "The Quality Gap", desc: "Subcontractors cut corners when no one is watching.", icon: <Users className="text-red-500" /> },
                            ].map((item, i) => (
                                <div key={i} className="p-8 border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] transition-colors">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="p-2 bg-red-500/10 rounded-full">{item.icon}</div>
                                        <h3 className="text-lg font-bold uppercase tracking-wider">{item.title}</h3>
                                    </div>
                                    <p className="text-white/50 text-sm pl-12">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* THE SOLUTION - "The Real World" equivalent */}
            <section id="system" className="py-32 bg-[#050505] border-t border-white/10">
                <div className="max-w-7xl mx-auto px-6 text-center mb-24">
                    <span className="text-green-500 font-bold uppercase tracking-[0.2em] text-xs mb-4 block">The Solution</span>
                    <h2 className="text-5xl md:text-8xl font-serif mb-8">THE 3-STEP SYSTEM</h2>
                    <p className="text-white/50 max-w-2xl mx-auto text-lg">We don't just "help." We take command of the chaos.</p>
                </div>

                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-1">
                    {[
                        {
                            number: "01",
                            title: "Define & Budget",
                            desc: "Before you talk to a builder, we define 'Done'. We build a line-item budget that locks in your costs.",
                            details: ["Scope Development", "Feasibility Analysis", "Hard Bid Preparation"]
                        },
                        {
                            number: "02",
                            title: "The Silent Auction",
                            desc: "We force top-tier builders to compete for your project. No favorites. Just data-driven selection.",
                            details: ["Builder Vetting", "Bid Leveling", "Contract Negotiation"]
                        },
                        {
                            number: "03",
                            title: "Militant Management",
                            desc: "We utilize AI and on-site audits to track every dollar and day until you move in.",
                            details: ["Weekly Audits", "Payment Verification", "Quality Control"]
                        }
                    ].map((step, i) => (
                        <div key={i} className="bg-black border-r border-b border-white/10 p-12 min-h-[500px] flex flex-col hover:bg-white/[0.02] transition-all group">
                            <span className="text-4xl font-serif text-white/20 mb-8 group-hover:text-white transition-colors">{step.number}</span>
                            <h3 className="text-3xl font-serif mb-6">{step.title}</h3>
                            <p className="text-white/50 mb-12 leading-relaxed">{step.desc}</p>
                            <div className="mt-auto space-y-4 border-t border-white/10 pt-8">
                                {step.details.map((detail, j) => (
                                    <div key={j} className="flex items-center gap-3 text-sm text-white/70">
                                        <Check size={14} className="text-green-500" />
                                        {detail}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* RESULTS / TESTIMONIALS */}
            <section className="py-32 bg-black relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                        <div className="bg-white text-black p-12 md:p-16 flex flex-col justify-between">
                            <div>
                                <div className="flex gap-1 mb-8">
                                    {[1, 2, 3, 4, 5].map(s => <Award key={s} size={20} fill="black" />)}
                                </div>
                                <h3 className="text-3xl md:text-5xl font-serif mb-8 leading-tight">
                                    "Saved us $140,000 on the initial bid alone."
                                </h3>
                                <p className="text-black/60 text-lg mb-8">
                                    The builder tried to slip in a 15% 'administrative fee' on the lumber package. The consultant caught it immediately.
                                </p>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-black text-white flex items-center justify-center font-serif text-xl rounded-full">D</div>
                                <div>
                                    <div className="font-bold uppercase tracking-wider text-sm">David & Sarah</div>
                                    <div className="text-black/50 text-xs uppercase tracking-widest">Custom Build • Boulder, CO</div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-[#111] p-12 md:p-16 flex flex-col justify-between border border-white/10">
                            <div>
                                <div className="flex gap-1 mb-8">
                                    {[1, 2, 3, 4, 5].map(s => <Award key={s} size={20} className="text-white" fill="white" />)}
                                </div>
                                <h3 className="text-3xl md:text-5xl font-serif mb-8 leading-tight text-white">
                                    "The only person in the room who actually worked for me."
                                </h3>
                                <p className="text-white/50 text-lg mb-8">
                                    Building a home is stressful. Having MCH on my team made it manageable. They handled the hard conversations so I didn't have to.
                                </p>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white text-black flex items-center justify-center font-serif text-xl rounded-full">M</div>
                                <div>
                                    <div className="font-bold uppercase tracking-wider text-sm text-white">Michael R.</div>
                                    <div className="text-white/50 text-xs uppercase tracking-widest">Renovation • Cherry Hills, CO</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FINAL CTA - Urgent */}
            <section className="py-40 relative text-center">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1628143431636-f3cc832cb396?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center opacity-10 blur-sm"></div>
                <div className="relative z-10 max-w-4xl mx-auto px-6">
                    <h2 className="text-6xl md:text-9xl font-serif mb-12 text-white tracking-tighter">
                        ESCAPE THE <br /> CHAOS.
                    </h2>
                    <p className="text-xl text-white/60 mb-16 max-w-2xl mx-auto">
                        We only accept a limited number of clients per quarter to ensure maximum attention to detail.
                    </p>
                    <Link to="/login?mode=signup" className="inline-block px-16 py-8 bg-white text-black font-bold uppercase tracking-[0.2em] text-sm hover:scale-105 transition-transform shadow-[0_0_50px_rgba(255,255,255,0.3)]">
                        Apply For Consultation
                    </Link>
                </div>
            </section>

        </div>
    );
};
