import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import {
    ArrowRight, Ban, DollarSign, Wallet, Users, CheckCircle,
    XCircle, PhoneOff, MousePointerClick, ShieldCheck
} from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';

export const VendorPage: React.FC = () => {
    const formRef = useRef<HTMLDivElement>(null);

    const scrollToForm = () => {
        formRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Shared Animation Variants
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

    return (
        <div className="text-zinc-100 font-sans selection:bg-white/20 selection:text-white overflow-x-hidden relative min-h-screen">

            {/* UNIFIED GLOBAL BACKGROUND (Parallax) */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-zinc-800/15 via-[#030303] to-[#030303]"></div>
            </div>

            {/* HERO SECTION */}
            <section className="relative z-10 min-h-[85vh] flex items-center justify-center py-32">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={staggerContainer}
                    >
                        <motion.div variants={fadeInUp} className="flex justify-center mb-10">
                            <div className="inline-flex items-center gap-2 border border-white/5 rounded-full px-4 py-1.5 bg-white/[0.02] backdrop-blur-md">
                                <ShieldCheck size={14} className="text-white/70" />
                                <span className="text-[11px] uppercase tracking-[0.2em] font-medium text-white/60">Verified Partner Network</span>
                            </div>
                        </motion.div>

                        <motion.h1 variants={fadeInUp} className="text-5xl md:text-8xl lg:text-9xl font-serif font-medium tracking-tighter leading-[0.95] mb-12 text-white mix-blend-screen">
                            Stop Chasing <br />
                            <span className="text-[#a1a1aa]">Tire Kickers.</span>
                        </motion.h1>

                        <motion.p variants={fadeInUp} className="text-xl md:text-2xl text-zinc-300 max-w-3xl mx-auto mb-14 leading-relaxed font-light tracking-wide">
                            We build the house (digitally). You build it (physically). <br />
                            <span className="text-zinc-100 font-normal">We bring you clients who are financed, vetted, and ready to break ground.</span>
                        </motion.p>

                        <motion.div variants={fadeInUp} className="flex flex-col items-center gap-6">
                            <button
                                onClick={scrollToForm}
                                className="group relative px-12 py-5 bg-white text-black font-semibold text-sm tracking-widest uppercase transition-all hover:bg-zinc-200 rounded-full overflow-hidden hover:scale-105 active:scale-95 duration-300"
                            >
                                <span className="relative z-10">Apply For Access</span>
                            </button>
                            <div className="flex items-center gap-4 text-sm text-zinc-500">
                                <span>Already received an invite?</span>
                                <Link to="/login" className="text-white border-b border-white/20 hover:border-white pb-0.5 transition-colors">Sign In Here</Link>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* PROBLEM SECTION */}
            <section className="relative z-10 py-32">
                <div className="max-w-7xl mx-auto px-6">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeInUp}
                        className="text-center mb-24"
                    >
                        <h2 className="text-4xl md:text-6xl font-serif mb-8">The "Agency" Trap</h2>
                        <p className="text-zinc-400 text-xl max-w-2xl mx-auto">
                            Marketing agencies charge you retainers to send you leads that go nowhere.
                        </p>
                    </motion.div>

                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={staggerContainer}
                        className="grid grid-cols-1 md:grid-cols-3 gap-8"
                    >
                        {[
                            {
                                title: "The Tire Kicker",
                                desc: "The 'dreamer' who takes 3 meetings, asks for free sketches, and then admits they can't get a loan.",
                                icon: <PhoneOff className="text-red-500" />
                            },
                            {
                                title: "The Ad Money Pit",
                                desc: "Spending $3,000/mo on Facebook ads only to get 50 leads that are spam or solicitors.",
                                icon: <Wallet className="text-red-500" />
                            },
                            {
                                title: "The Uneducated",
                                desc: "Clients who want a $2M home on a $500k budget and blame YOU when the math doesn't work.",
                                icon: <XCircle className="text-red-500" />
                            }
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                variants={fadeInUp}
                                className="bg-[#050505] p-10 rounded-3xl border border-white/5 hover:border-red-500/20 transition-colors group"
                            >
                                <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-red-500/20 transition-colors">
                                    {item.icon}
                                </div>
                                <h3 className="text-2xl font-serif text-white mb-4">{item.title}</h3>
                                <p className="text-zinc-400 leading-relaxed">{item.desc}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* SOLUTION SECTION */}
            <section className="relative z-10 py-32">
                <div className="max-w-7xl mx-auto px-6">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeInUp}
                        className="text-center mb-24"
                    >
                        <h2 className="text-4xl md:text-6xl font-serif mb-8">
                            We Do The <span className="text-green-500">Heavy Lifting.</span>
                        </h2>
                        <p className="text-zinc-400 text-xl max-w-2xl mx-auto">
                            By the time you meet them, the project is real.
                        </p>
                    </motion.div>

                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={staggerContainer}
                        className="grid grid-cols-1 md:grid-cols-2 gap-6"
                    >
                        {[
                            {
                                title: "Financing Secured",
                                desc: "We verify proof of funds or construction loan pre-approval before making the intro.",
                                icon: <DollarSign className="text-green-500" />
                            },
                            {
                                title: "Land Vetted",
                                desc: "We run zoning, soil, and utility checks so you don't waste time on unbuildable lots.",
                                icon: <CheckCircle className="text-green-500" />
                            },
                            {
                                title: "Scope Locked",
                                desc: "Our AI helps them define a realistic budget and scope that matches their land constraints.",
                                icon: <Users className="text-green-500" />
                            },
                            {
                                title: "Commission Guaranteed",
                                desc: "Our agreements protect your referral fees and ensure secure payment.",
                                icon: <ShieldCheck className="text-green-500" />
                            }
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                variants={fadeInUp}
                                className="flex gap-6 p-8 rounded-2xl bg-[#050505] border border-white/5 hover:border-green-500/20 transition-colors group"
                            >
                                <div className="flex-shrink-0 mt-1">
                                    {item.icon}
                                </div>
                                <div>
                                    <h3 className="text-xl font-medium text-white mb-2">{item.title}</h3>
                                    <p className="text-zinc-400 text-sm leading-relaxed">{item.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>

                    <div className="flex justify-center mt-16">
                        <button
                            onClick={scrollToForm}
                            className="inline-flex items-center gap-2 text-green-500 border-b border-green-500/50 pb-1 hover:text-green-400 hover:border-green-400 transition-colors uppercase tracking-widest text-xs"
                        >
                            See If You Qualify <ArrowRight size={14} />
                        </button>
                    </div>
                </div>
            </section>

            {/* APPLICATION FORM */}
            <section ref={formRef} className="relative z-10 py-32 bg-black border-t border-white/5">
                <div className="max-w-3xl mx-auto px-6">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeInUp}
                        className="text-center mb-16"
                    >
                        <h2 className="text-4xl md:text-5xl font-serif mb-6">Join The Network</h2>
                        <p className="text-zinc-400">
                            We are currently accepting new Builders, Architects, and Lenders.
                        </p>
                    </motion.div>

                    <motion.form
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeInUp}
                        className="bg-[#050505] p-8 md:p-12 rounded-3xl border border-white/5 shadow-2xl"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                            <div className="space-y-2">
                                <label className="text-xs uppercase tracking-widest text-zinc-500">First Name</label>
                                <input type="text" className="w-full bg-zinc-900/50 border border-white/10 rounded-lg p-4 text-white focus:outline-none focus:border-white/30 transition-colors" placeholder="John" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs uppercase tracking-widest text-zinc-500">Last Name</label>
                                <input type="text" className="w-full bg-zinc-900/50 border border-white/10 rounded-lg p-4 text-white focus:outline-none focus:border-white/30 transition-colors" placeholder="Doe" />
                            </div>
                        </div>

                        <div className="space-y-2 mb-8">
                            <label className="text-xs uppercase tracking-widest text-zinc-500">Company Name</label>
                            <input type="text" className="w-full bg-zinc-900/50 border border-white/10 rounded-lg p-4 text-white focus:outline-none focus:border-white/30 transition-colors" placeholder="Acme Builders Inc." />
                        </div>

                        <div className="space-y-2 mb-8">
                            <label className="text-xs uppercase tracking-widest text-zinc-500">Primary Trade</label>
                            <select className="w-full bg-zinc-900/50 border border-white/10 rounded-lg p-4 text-white focus:outline-none focus:border-white/30 transition-colors appearance-none">
                                <option>Custom Home Builder</option>
                                <option>Architect / Designer</option>
                                <option>Construction Lender</option>
                                <option>Land Developer</option>
                            </select>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                            <div className="space-y-2">
                                <label className="text-xs uppercase tracking-widest text-zinc-500">Work Email</label>
                                <input type="email" className="w-full bg-zinc-900/50 border border-white/10 rounded-lg p-4 text-white focus:outline-none focus:border-white/30 transition-colors" placeholder="john@company.com" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs uppercase tracking-widest text-zinc-500">Mobile Phone</label>
                                <input type="tel" className="w-full bg-zinc-900/50 border border-white/10 rounded-lg p-4 text-white focus:outline-none focus:border-white/30 transition-colors" placeholder="(555) 123-4567" />
                            </div>
                        </div>

                        <button type="submit" className="w-full py-5 bg-white text-black font-bold uppercase tracking-widest text-sm hover:bg-zinc-200 transition-all rounded-xl shadow-lg">
                            Request Invite
                        </button>

                        <p className="text-center text-zinc-500 text-xs mt-6">
                            By clicking Request Invite, you agree to our Terms of Service.
                        </p>
                    </motion.form>
                </div>
            </section>

        </div>
    );
};
