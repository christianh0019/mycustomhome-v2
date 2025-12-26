import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    ArrowRight, Ban, DollarSign, Wallet, Users, CheckCircle,
    XCircle, PhoneOff, MousePointerClick, ShieldCheck,
    Hammer, PencilRuler, Banknote, Map
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type TradeType = 'builder' | 'architect' | 'lender' | 'realtor';

export const VendorPage: React.FC = () => {
    const formRef = useRef<HTMLDivElement>(null);
    const [activeTrade, setActiveTrade] = useState<TradeType>('builder');

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

    // Content Data for Trades
    const tradeContent = {
        builder: {
            headline: "Stop Chasing Tire Kickers.",
            subhead: "We build the house digitally. You build it physically. We bring you clients who are financed, vetted, and ready to break ground.",
            pains: [
                { title: "The Tire Kicker", desc: "The 'dreamer' who takes 3 meetings, asks for free estimates, and then admits they can't get a loan.", icon: <PhoneOff className="text-red-500" /> },
                { title: "The Ad Money Pit", desc: "Spending $3,000/mo on leads only to get 50 spam calls and zero contracts.", icon: <Wallet className="text-red-500" /> },
                { title: "The Uneducated", desc: "Clients who want a $2M home on a $500k budget and blame YOU when the math doesn't work.", icon: <XCircle className="text-red-500" /> }
            ],
            solutions: [
                { title: "Financing Secured", desc: "We verify construction loan pre-approval before making the intro.", icon: <DollarSign className="text-green-500" /> },
                { title: "Land Vetted", desc: "We run zoning/soil checks so you don't waste time on unbuildable lots.", icon: <CheckCircle className="text-green-500" /> },
                { title: "Scope Locked", desc: "Our AI locks a realistic budget/scope before you ever estimate it.", icon: <ShieldCheck className="text-green-500" /> },
                { title: "Commission Guaranteed", desc: "Our agreements protect your fees and ensure secure payment.", icon: <Users className="text-green-500" /> }
            ]
        },
        architect: {
            headline: "Design For Budgets That Exist.",
            subhead: "Stop designing dream homes that get slashed by builders. We give you strict budget parameters before you draw a line.",
            pains: [
                { title: "The Value Engineer", desc: "Watching your beautiful design get butchered because the client's budget was never realistic.", icon: <PencilRuler className="text-red-500" /> },
                { title: "The Scope Creep", desc: "Clients who add 'just one more thing' until the project is unbuildable.", icon: <XCircle className="text-red-500" /> },
                { title: "The Unpaid Consultant", desc: "Giving away hours of advice on zoning/feasibility before getting a contract.", icon: <PhoneOff className="text-red-500" /> }
            ],
            solutions: [
                { title: "Budget-First Brief", desc: "We reverse-engineer the budget to give you clear cost-to-build constraints.", icon: <DollarSign className="text-green-500" /> },
                { title: "Feasibility Checks", desc: "We handle the boring zoning/setback analysis automatically.", icon: <CheckCircle className="text-green-500" /> },
                { title: "Builder Aligned", desc: "We match you with builders who respect the design intent.", icon: <Users className="text-green-500" /> },
                { title: "Pre-Sold Clients", desc: "Clients come to you knowing your fees and value.", icon: <ShieldCheck className="text-green-500" /> }
            ]
        },
        lender: {
            headline: "The Deal That Actually Closes.",
            subhead: "We package the Borrower, the Builder, and the Land into one clean file. You just fund it.",
            pains: [
                { title: "The Messy File", desc: "Chasing borrowers for tax returns and contractor bids for months.", icon: <XCircle className="text-red-500" /> },
                { title: "The Bad Builder", desc: "Loans dying because the builder isn't approved or walks off the job.", icon: <Hammer className="text-red-500" /> },
                { title: "The Appraisal Gap", desc: "Projects that appraise $200k under cost because of poor planning.", icon: <Wallet className="text-red-500" /> }
            ],
            solutions: [
                { title: "Packaged Applications", desc: "We organize the entire loan package (Borrower + Builder + Plans).", icon: <CheckCircle className="text-green-500" /> },
                { title: "Vetted Builders", desc: "We only pair borrowers with verifiable, high-quality builders.", icon: <ShieldCheck className="text-green-500" /> },
                { title: "Realistic Budgets", desc: "Our AI ensures the cost-to-build aligns with market values.", icon: <DollarSign className="text-green-500" /> },
                { title: "Change Order Guard", desc: "We monitor construction draw requests to prevent fraud.", icon: <ShieldCheck className="text-green-500" /> }
            ]
        },
        realtor: {
            headline: "Turn Land Buyers Into Home Builders.",
            subhead: "Stop being a 'Dirt Sherpa'. We turn your complex land leads into simple custom home closes.",
            pains: [
                { title: "The Dirt Sherpa", desc: "Showing raw land to 50 buyers who have no idea how complex building is.", icon: <Map className="text-red-500" /> },
                { title: "The Fearful Buyer", desc: "Deals dying because the buyer is scared of utility costs or soil issues.", icon: <PhoneOff className="text-red-500" /> },
                { title: "The Low Commission", desc: "Doing 10x the work of a home sale for 10% of the commission.", icon: <Wallet className="text-red-500" /> }
            ],
            solutions: [
                { title: "Instant Feasibility", desc: "Run our 'Land Check' on any lot to show buyers it's buildable instantly.", icon: <CheckCircle className="text-green-500" /> },
                { title: "The 'Build' Partner", desc: "You sell the dirt. We handle the entire build process. You look like a hero.", icon: <Users className="text-green-500" /> },
                { title: "Higher Velocity", desc: "Close land deals in weeks, not months, by removing uncertainty.", icon: <DollarSign className="text-green-500" /> },
                { title: "Referral Revenue", desc: "Earn fees for referring clients into the build network.", icon: <ShieldCheck className="text-green-500" /> }
            ]
        }
    };

    const activeContent = tradeContent[activeTrade];

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

                        {/* TRADE SWITCHER */}
                        <motion.div variants={fadeInUp} className="flex flex-wrap justify-center gap-2 mb-12">
                            {[
                                { id: 'builder', label: 'Builders', icon: Hammer },
                                { id: 'architect', label: 'Architects', icon: PencilRuler },
                                { id: 'lender', label: 'Lenders', icon: Banknote },
                                { id: 'realtor', label: 'Realtors', icon: Map },
                            ].map((trade) => (
                                <button
                                    key={trade.id}
                                    onClick={() => setActiveTrade(trade.id as TradeType)}
                                    className={`flex items-center gap-2 px-6 py-3 rounded-full text-xs uppercase tracking-widest transition-all ${activeTrade === trade.id
                                            ? 'bg-white text-black font-bold scale-105'
                                            : 'bg-white/5 text-zinc-500 hover:bg-white/10 hover:text-zinc-300'
                                        }`}
                                >
                                    <trade.icon size={14} />
                                    {trade.label}
                                </button>
                            ))}
                        </motion.div>

                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTrade}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.3 }}
                            >
                                <h1 className="text-5xl md:text-8xl lg:text-9xl font-serif font-medium tracking-tighter leading-[0.95] mb-12 text-white mix-blend-screen max-w-5xl mx-auto">
                                    {activeContent.headline}
                                </h1>

                                <p className="text-xl md:text-2xl text-zinc-300 max-w-3xl mx-auto mb-14 leading-relaxed font-light tracking-wide">
                                    {activeContent.subhead}
                                </p>
                            </motion.div>
                        </AnimatePresence>

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
                            Why the old way of finding clients is broken.
                        </p>
                    </motion.div>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTrade}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.5 }}
                            className="grid grid-cols-1 md:grid-cols-3 gap-8"
                        >
                            {activeContent.pains.map((item, i) => (
                                <motion.div
                                    key={i}
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
                    </AnimatePresence>
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

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTrade}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.5 }}
                            className="grid grid-cols-1 md:grid-cols-2 gap-6"
                        >
                            {activeContent.solutions.map((item, i) => (
                                <div
                                    key={i}
                                    className="flex gap-6 p-8 rounded-2xl bg-[#050505] border border-white/5 hover:border-green-500/20 transition-colors group"
                                >
                                    <div className="flex-shrink-0 mt-1">
                                        {item.icon}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-medium text-white mb-2">{item.title}</h3>
                                        <p className="text-zinc-400 text-sm leading-relaxed">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </motion.div>
                    </AnimatePresence>

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
                            We are currently accepting new partners.
                        </p>
                    </motion.div>

                    <motion.form
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeInUp}
                        className="bg-[#050505] p-8 md:p-12 rounded-3xl border border-white/5 shadow-2xl"
                    >
                        {/* TRADE SELECTOR IN FORM */}
                        <div className="space-y-4 mb-8">
                            <label className="text-xs uppercase tracking-widest text-zinc-500">I am a...</label>
                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    { id: 'builder', label: 'Builder' },
                                    { id: 'architect', label: 'Architect' },
                                    { id: 'lender', label: 'Lender' },
                                    { id: 'realtor', label: 'Realtor' },
                                ].map((opt) => (
                                    <button
                                        key={opt.id}
                                        type="button"
                                        onClick={() => setActiveTrade(opt.id as TradeType)}
                                        className={`py-4 rounded-xl border text-sm font-medium transition-all ${activeTrade === opt.id
                                                ? 'bg-white text-black border-white'
                                                : 'bg-zinc-900/50 text-zinc-400 border-white/10 hover:bg-zinc-800'
                                            }`}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>

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
                            <input type="text" className="w-full bg-zinc-900/50 border border-white/10 rounded-lg p-4 text-white focus:outline-none focus:border-white/30 transition-colors" placeholder="Acme Inc." />
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
