
import React from 'react';
import { Link } from 'react-router-dom';
import { Check, ArrowRight, Star } from 'lucide-react';
import { motion } from 'framer-motion';

export const HomePage: React.FC = () => {
    return (
        <div className="overflow-hidden">
            {/* HERO SECTION - Premium, Dark, Elegant */}
            <section className="relative min-h-screen flex items-center justify-center border-b border-white/5">
                <div className="absolute inset-0 bg-black">
                    {/* Subtle Grain or Gradient */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-white/[0.08] via-black to-black"></div>
                </div>

                <div className="max-w-6xl mx-auto px-6 relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1 }}
                    >
                        <h1 className="text-5xl md:text-7xl lg:text-9xl font-serif tracking-tighter mb-8 text-white leading-[0.9]">
                            Your Vision. <br />
                            <span className="text-white/30 italic font-light">Professionally Protected.</span>
                        </h1>
                        <p className="text-lg md:text-2xl text-white/50 max-w-3xl mx-auto mb-16 leading-relaxed font-light">
                            The private consultancy for custom home projects. We vet the builders, negotiate the contracts, and track the budget.
                            <br className="hidden md:block" /> You just turn the key.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-8 justify-center items-center">
                            <Link to="/login?mode=signup" className="group px-10 py-5 bg-white text-black font-bold uppercase tracking-[0.2em] text-xs hover:bg-gray-200 transition-all">
                                Begin Consultation
                            </Link>
                            <Link to="/vendors" className="text-xs uppercase tracking-[0.2em] font-medium text-white/50 hover:text-white transition-colors flex items-center gap-2">
                                For Vendors <ArrowRight size={14} className="group-hover:translate-x-1" />
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* THE PROBLEM / SOLUTION - High Contrast */}
            <section className="py-32 bg-[#050505]">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-24 items-center">
                        <div>
                            <span className="text-xs font-bold uppercase tracking-[0.2em] text-white/30 mb-6 block">The Reality</span>
                            <h2 className="text-4xl md:text-6xl font-serif text-white mb-8 leading-tight">
                                Building a custom home is <span className="text-red-500/80 italic">dangerous</span> without a consultant.
                            </h2>
                            <p className="text-white/50 text-lg leading-relaxed mb-8">
                                40% of custom builds go over budget. 30% end in litigation. The industry thrives on ambiguity. We are your firewall against the chaos.
                            </p>
                            <ul className="space-y-4">
                                <li className="flex items-center gap-4 text-white/40 text-sm uppercase tracking-wider">
                                    <div className="w-1 h-1 bg-red-500 rounded-full"></div> Unchecked Change Orders
                                </li>
                                <li className="flex items-center gap-4 text-white/40 text-sm uppercase tracking-wider">
                                    <div className="w-1 h-1 bg-red-500 rounded-full"></div> Predatory Lender Terms
                                </li>
                                <li className="flex items-center gap-4 text-white/40 text-sm uppercase tracking-wider">
                                    <div className="w-1 h-1 bg-red-500 rounded-full"></div> Unverified Contractors
                                </li>
                            </ul>
                        </div>
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/20 to-transparent rounded-2xl blur-2xl"></div>
                            <div className="relative bg-white/[0.03] border border-white/10 p-12 rounded-2xl">
                                <span className="text-xs font-bold uppercase tracking-[0.2em] text-blue-400 mb-6 block">The Solution</span>
                                <h3 className="text-3xl font-serif text-white mb-6">We sit on <span className="italic">your</span> side of the table.</h3>
                                <p className="text-white/60 mb-8 leading-relaxed">
                                    We aren't the builder. We aren't the bank. We are your dedicated consultants, using data and AI to force transparency and accountability.
                                </p>
                                <div className="space-y-6">
                                    {[
                                        "Guaranteed Fairness in Contracts",
                                        "Real-time Budget Auditing",
                                        "Top 1% Vendor Matching Only"
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-center gap-4">
                                            <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                                                <Check size={14} className="text-blue-400" />
                                            </div>
                                            <span className="text-white font-medium">{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* SOCIAL PROOF / LOGOS */}
            <section className="py-24 border-y border-white/5 bg-white/[0.01]">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-white/30 mb-12">Securing Projects Across Colorado</p>
                    <div className="flex flex-wrap justify-center gap-16 md:gap-32 opacity-20 hover:opacity-100 transition-opacity duration-500">
                        {['Aspen', 'Vail', 'Denver', 'Boulder', 'Cherry Hills'].map(city => (
                            <span key={city} className="text-2xl font-serif italic text-white">{city}</span>
                        ))}
                    </div>
                </div>
            </section>

            {/* VALUE GRID */}
            <section className="py-40">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/10 border border-white/10">
                        {[
                            { title: "Define", desc: "We build your scope and budget before you talk to a single builder." },
                            { title: "Match", desc: "We run a silent auction with the top rated builders in your specific city." },
                            { title: "Manage", desc: "Our platform tracks every dollar and milestone until you move in." },
                        ].map((feature, i) => (
                            <div key={i} className="bg-black p-16 hover:bg-[#050505] transition-colors group">
                                <span className="text-xs font-bold text-white/20 mb-8 block p-2 border border-white/10 w-fit rounded-full">{`0${i + 1}`}</span>
                                <h3 className="text-3xl font-serif text-white mb-6 group-hover:text-white transition-colors">{feature.title}</h3>
                                <p className="text-white/50 leading-relaxed max-w-xs">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FINAL CTA */}
            <section className="py-32 relative overflow-hidden">
                <div className="absolute inset-0 bg-white/5 opacity-50 blur-3xl"></div>
                <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
                    <h2 className="text-5xl md:text-7xl font-serif mb-12 text-white">Smart homeowners don't build alone.</h2>
                    <Link to="/login?mode=signup" className="inline-block px-12 py-6 bg-white text-black font-bold uppercase tracking-[0.2em] text-sm hover:scale-105 transition-transform">
                        Start Your Project
                    </Link>
                    <p className="mt-8 text-white/30 text-xs uppercase tracking-widest">Free for Homeowners • Verified by Experts</p>
                </div>
            </section>
        </div>
    );
};
