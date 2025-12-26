
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, Shield, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export const HomePage: React.FC = () => {
    return (
        <div className="overflow-hidden">
            {/* HERO SECTION */}
            <section className="relative min-h-[90vh] flex items-center justify-center border-b border-white/10">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/5 via-black to-black opacity-50"></div>

                <div className="max-w-5xl mx-auto px-6 relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <span className="inline-block py-1 px-3 border border-white/10 bg-white/5 rounded-full text-white/60 text-[10px] uppercase tracking-[0.2em] mb-8 backdrop-blur-md">
                            The Operating System for Custom Builds
                        </span>
                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-medium tracking-tight mb-8 leading-[0.9]">
                            Build your legacy, <br />
                            <span className="text-white/40">without the chaos.</span>
                        </h1>
                        <p className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto mb-12 leading-relaxed font-light">
                            MyCustomHome brings homeowners, builders, and lenders into a single, transparent workspace. Plan, budget, and execute your dream home with AI-powered guidance.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-6 justify-center">
                            <Link to="/login?mode=signup" className="px-8 py-4 bg-white text-black font-bold uppercase tracking-widest hover:scale-105 transition-transform">
                                Start Free Project
                            </Link>
                            <Link to="/vendors" className="px-8 py-4 border border-white/20 text-white font-bold uppercase tracking-widest hover:bg-white/5 transition-colors">
                                Join as Vendor
                            </Link>
                        </div>
                    </motion.div>
                </div>

                {/* Abstract UI Mockup */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[400px] border-x border-t border-white/10 bg-[#0A0A0A] rounded-t-3xl shadow-2xl opacity-50 translate-y-[30%] blur-[1px]"></div>
            </section>

            {/* TRUSTED BY */}
            <section className="py-12 border-b border-white/10 bg-white/[0.02]">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <p className="text-[10px] uppercase tracking-widest text-white/30 mb-8">Powering projects in</p>
                    <div className="flex justify-center gap-12 md:gap-24 opacity-30 grayscale items-center flex-wrap">
                        <span className="text-xl font-serif">Boulder</span>
                        <span className="text-xl font-serif">Denver</span>
                        <span className="text-xl font-serif">Aspen</span>
                        <span className="text-xl font-serif">Vail</span>
                        <span className="text-xl font-serif">Fort Collins</span>
                    </div>
                </div>
            </section>

            {/* SPLIT VALUE PROP */}
            <section className="py-32">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-24">
                        {/* For Homeowners */}
                        <div>
                            <span className="text-blue-400 text-xs font-bold uppercase tracking-widest mb-4 block">For Homeowners</span>
                            <h2 className="text-4xl font-serif mb-6">Your personal <br />Project Pilot.</h2>
                            <p className="text-white/50 leading-relaxed mb-8">
                                Stop managing your multi-million dollar project with spreadsheets and emails. Our AI Pilot helps you scope, budget, and find the perfect team.
                            </p>
                            <ul className="space-y-4 mb-8">
                                <li className="flex items-center gap-3 text-sm text-white/70">
                                    <CheckCircle size={16} className="text-blue-500" /> AI-Driven Budget Analysis
                                </li>
                                <li className="flex items-center gap-3 text-sm text-white/70">
                                    <CheckCircle size={16} className="text-blue-500" /> Verified Vendor Matching based on Style
                                </li>
                                <li className="flex items-center gap-3 text-sm text-white/70">
                                    <CheckCircle size={16} className="text-blue-500" /> Centralized Communication Vault
                                </li>
                            </ul>
                            <Link to="/homeowners" className="text-sm font-bold uppercase tracking-widest flex items-center gap-2 hover:gap-4 transition-all">
                                How it Works <ArrowRight size={14} />
                            </Link>
                        </div>

                        {/* For Vendors */}
                        <div>
                            <span className="text-yellow-500 text-xs font-bold uppercase tracking-widest mb-4 block">For Vendors</span>
                            <h2 className="text-4xl font-serif mb-6">High-intent leads, <br />zero friction.</h2>
                            <p className="text-white/50 leading-relaxed mb-8">
                                Receive detailed project scopes with budgets already verified. No more tire kickers. We connect you with homeowners who are ready to build.
                            </p>
                            <ul className="space-y-4 mb-8">
                                <li className="flex items-center gap-3 text-sm text-white/70">
                                    <Shield size={16} className="text-yellow-500" /> Pre-Vetted Project Scopes
                                </li>
                                <li className="flex items-center gap-3 text-sm text-white/70">
                                    <Shield size={16} className="text-yellow-500" /> Guaranteed Commission Agreements
                                </li>
                                <li className="flex items-center gap-3 text-sm text-white/70">
                                    <Shield size={16} className="text-yellow-500" /> Automated Document Management
                                </li>
                            </ul>
                            <Link to="/vendors" className="text-sm font-bold uppercase tracking-widest flex items-center gap-2 hover:gap-4 transition-all">
                                Partner Network <ArrowRight size={14} />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* FEATURES GRID */}
            <section className="py-32 bg-[#050505] border-y border-white/10">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center max-w-3xl mx-auto mb-20">
                        <h2 className="text-4xl md:text-5xl font-serif mb-6">The Modern Standard</h2>
                        <p className="text-white/50">Replacing the fragmented construction process with a unified operating system.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { title: "Smart Scoping", desc: "Our AI helps homeowners define their vision, budget, and timeline before they ever talk to a builder.", icon: Zap },
                            { title: "The Vault", desc: "Bank-grade storage for plans, permits, and contracts. Accessible by the whole team, forever.", icon: Shield },
                            { title: "Live Roadmap", desc: "Real-time Gantt charts and milestone tracking that keeps everyone accountable.", icon: CheckCircle },
                        ].map((feature, i) => (
                            <div key={i} className="p-10 border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-colors group">
                                <feature.icon className="w-8 h-8 text-white/30 mb-6 group-hover:text-white transition-colors" />
                                <h3 className="text-xl font-serif mb-4">{feature.title}</h3>
                                <p className="text-sm text-white/50 leading-relaxed">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};
