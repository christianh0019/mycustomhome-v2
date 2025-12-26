
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Mail, DollarSign } from 'lucide-react';

export const VendorPage: React.FC = () => {
    return (
        <div className="pt-24 pb-32">
            <div className="max-w-7xl mx-auto px-6">
                <div className="mb-24 text-center max-w-3xl mx-auto">
                    <span className="text-yellow-500 font-bold uppercase tracking-widest text-xs mb-4 block">Partner Network</span>
                    <h1 className="text-5xl md:text-7xl font-serif font-bold mb-8">No More Tire Kickers.</h1>
                    <p className="text-xl text-white/50 leading-relaxed">
                        Join the elite network of custom builders and lenders. We deliver detailed, budget-verified project scopes directly to your inbox.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-32">
                    {[
                        { icon: Mail, title: "Blind Invites", desc: "Receive anonymous project briefs. See the budget ($1.5M+) and location (Dallas) before you commit." },
                        { icon: ShieldCheck, title: "Verified Reputation", desc: "We pull your BBB and Google ratings automatically to showcase your excellence to homeowners." },
                        { icon: DollarSign, title: "Guaranteed Fees", desc: "Our platform ensures commission alignment before contact info is exchanged." }
                    ].map((item, i) => (
                        <div key={i} className="p-8 border border-white/10 bg-white/[0.02]">
                            <item.icon className="w-8 h-8 text-yellow-500 mb-6" />
                            <h3 className="text-xl font-serif mb-4">{item.title}</h3>
                            <p className="text-sm text-white/50 leading-relaxed">{item.desc}</p>
                        </div>
                    ))}
                </div>

                {/* CTA */}
                <div className="text-center">
                    <Link to="/login?mode=signup&role=vendor" className="inline-flex items-center gap-4 px-12 py-6 bg-yellow-500 hover:bg-yellow-400 text-black font-bold uppercase tracking-widest transition-all rounded-full">
                        Apply to Network <ArrowRight />
                    </Link>
                </div>
            </div>
        </div>
    );
};
