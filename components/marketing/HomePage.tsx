
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, Shield, Zap, TrendingUp, Cpu, Coins, Lock, Search, Heart, Map, Home, FileText, Users } from 'lucide-react';


export const HomePage: React.FC = () => {
    return (
        <div className="bg-black text-white font-sans selection:bg-white selection:text-black overflow-x-hidden">

            {/* HERO SECTION - "Build Smarter" */}
            <section className="relative min-h-screen flex items-center justify-center pt-20">
                {/* Clean, Premium Background */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-gradient-to-b from-black via-black/90 to-black z-10"></div>
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center opacity-40 grayscale mix-blend-overlay"></div>
                </div>

                <div className="relative z-20 max-w-7xl mx-auto px-6 text-center">
                    <div>
                        <div className="inline-flex items-center gap-2 border border-white/20 rounded-full px-4 py-1 mb-8 bg-white/5 backdrop-blur-sm">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-[10px] uppercase tracking-[0.2em] font-medium text-white/70">The AI Home Platform</span>
                        </div>

                        <h1 className="text-5xl md:text-8xl lg:text-9xl font-serif font-medium tracking-tighter leading-[0.9] mb-8 text-white">
                            Building Custom? <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-br from-blue-400 to-purple-600">Build Smarter.</span>
                        </h1>

                        <p className="text-lg md:text-2xl text-white/60 max-w-3xl mx-auto mb-12 leading-relaxed font-light">
                            We help you build your home faster, smarter, safer, <br className="hidden md:block" />
                            <span className="text-white">and we pay you to do it.</span>
                        </p>

                        <div className="flex flex-col items-center gap-4">
                            <Link to="/login?mode=signup" className="group relative px-12 py-6 bg-white text-black font-bold uppercase tracking-[0.2em] text-sm transition-all hover:scale-105 active:scale-95 rounded-full">
                                <span className="relative z-10">Get Started</span>
                                <div className="absolute inset-0 bg-white blur-lg opacity-50 group-hover:opacity-100 transition-opacity rounded-full"></div>
                            </Link>
                            <span className="text-xs uppercase tracking-[0.2em] text-white/40">We don't charge you a dime</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* VALUE GRID - "Smarter, Faster, Safer, Paid" */}
            <section className="py-24 bg-[#050505] border-y border-white/10">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <span className="text-blue-500 font-bold uppercase tracking-[0.2em] text-xs mb-4 block">Why Build With Us?</span>
                        <h2 className="text-4xl md:text-5xl font-serif">A Better Way to Build.</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            {
                                icon: <Cpu className="text-blue-500" size={32} />,
                                title: "Smarter",
                                desc: "No guessing. Our AI finds the best land, lenders, and pros for your specific project."
                            },
                            {
                                icon: <Shield className="text-blue-500" size={32} />,
                                title: "Safer",
                                desc: "We audit every contract and change order so you never overpay or get tricked."
                            },
                            {
                                icon: <Zap className="text-blue-500" size={32} />,
                                title: "Faster",
                                desc: "We guide you step-by-step. Your project never gets stuck waiting for answers."
                            },
                            {
                                icon: <Coins className="text-green-500" size={32} />,
                                title: "Profitable",
                                desc: "We charge the industry, not you. You get cash rebates just for using our platform."
                            },
                        ].map((item, i) => (
                            <div key={i} className="p-8 bg-white/[0.03] border border-white/10 rounded-2xl hover:bg-white/[0.05] transition-colors">
                                <div className="mb-6">{item.icon}</div>
                                <h3 className="text-xl font-serif mb-4">{item.title}</h3>
                                <p className="text-white/50 text-sm leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* THE 7-STAGE JOURNEY - "From Idea to Keys" */}
            <section className="py-32 bg-black relative">
                <div className="max-w-4xl mx-auto px-6">
                    <div className="text-center mb-24">
                        <span className="text-purple-500 font-bold uppercase tracking-[0.2em] text-xs mb-4 block">The Roadmap</span>
                        <h2 className="text-5xl md:text-7xl font-serif mb-8">From Idea to Keys.</h2>
                        <p className="text-white/50 text-lg">Your AI Assistant guides you every step of the way.</p>
                    </div>

                    <div className="space-y-4">
                        {[
                            { number: "01", title: "Vision", desc: "Tell us your dream. Our AI creates the budget and plan.", icon: <Heart size={20} /> },
                            { number: "02", title: "Pre-Approval", desc: "See if you qualify instantly. No paperwork nightmares.", icon: <Check size={20} /> },
                            { number: "03", title: "Lending", desc: "Lenders compete for you. You get the best rate.", icon: <TrendingUp size={20} /> },
                            { number: "04", title: "Land", desc: "We find the perfect lot for your custom home.", icon: <Map size={20} /> },
                            { number: "05", title: "Design", desc: "Meet top architects and get rebates on their fees.", icon: <Home size={20} /> },
                            { number: "06", title: "Builder", desc: "Builders bid on your project. We compare them for you.", icon: <Users size={20} /> },
                            { number: "07", title: "Protect", desc: "We audit every bill to keep your budget safe.", icon: <Lock size={20} /> },
                        ].map((step, i) => (
                            <div key={i} className="group relative flex items-center bg-white/[0.03] border border-white/10 p-6 rounded-xl hover:border-white/30 transition-all overflow-hidden">
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <div className="flex-shrink-0 w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mr-6 text-white/30 font-serif text-lg group-hover:text-white group-hover:bg-white/10 transition-colors">
                                    {step.number}
                                </div>
                                <div className="flex-grow">
                                    <h3 className="text-lg font-bold mb-1 flex items-center gap-2">
                                        {step.title}
                                        {i === 4 && <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded uppercase tracking-wider">Rebate</span>}
                                    </h3>
                                    <p className="text-white/50 text-sm">{step.desc}</p>
                                </div>
                                <div className="text-white/20 group-hover:text-white transition-colors">
                                    {step.icon}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* TRANSPARENCY SECTION - "How is this free?" */}
            <section className="py-24 bg-[#080808] border-t border-white/10">
                <div className="max-w-5xl mx-auto px-6 text-center">
                    <div className="inline-block p-4 rounded-full bg-green-500/10 mb-8">
                        <Coins className="text-green-500" size={32} />
                    </div>
                    <h2 className="text-4xl font-serif mb-6">How We Don't Charge You a Dime</h2>
                    <p className="text-white/60 text-lg leading-relaxed max-w-3xl mx-auto mb-12">
                        Builders spend huge amounts of money on marketing to find clients.
                        We save them that money by bringing them ready-to-build clients like you.
                        <br /><br />
                        <span className="text-white font-medium">The Win-Win:</span> They pay us a fee. We share that fee with you.
                        You get a better home for less money.
                    </p>
                </div>
            </section>

            {/* FINAL CTA */}
            <section className="py-40 relative text-center overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center opacity-20 blur-sm"></div>
                <div className="relative z-10 max-w-3xl mx-auto px-6">
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
                </div>
            </section>

        </div>
    );
};
