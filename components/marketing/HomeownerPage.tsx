
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Calculator, FileText, CheckCircle } from 'lucide-react';

export const HomeownerPage: React.FC = () => {
    return (
        <div className="pt-24 pb-32">
            <div className="max-w-7xl mx-auto px-6">
                <div className="mb-24 text-center max-w-3xl mx-auto">
                    <span className="text-blue-500 font-bold uppercase tracking-widest text-xs mb-4 block">Project Pilot</span>
                    <h1 className="text-5xl md:text-7xl font-serif font-bold mb-8">Build with Confidence.</h1>
                    <p className="text-xl text-white/50 leading-relaxed">
                        MyCustomHome replaces the "black box" of construction with a transparent, guided journey. From your first sketch to moving in.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-32">
                    <div className="p-12 bg-[#0A0A0A] border border-white/10 rounded-3xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-6 bg-white/5 border-l border-b border-white/10 rounded-bl-2xl">
                            <Calculator className="text-blue-500" />
                        </div>
                        <h3 className="text-3xl font-serif mb-6">Smart Budgeting</h3>
                        <p className="text-white/60 mb-8 leading-relaxed">
                            Stop guessing. Our AI analyzes local zoning data, material costs, and labor rates in your specific city (e.g. Dallas, Boulder) to give you a realistic project estimate before you spend a dime.
                        </p>
                        <ul className="space-y-3">
                            <li className="flex gap-3 text-sm text-white/40"><CheckCircle size={16} className="text-blue-500" /> Live Material Price Tracking</li>
                            <li className="flex gap-3 text-sm text-white/40"><CheckCircle size={16} className="text-blue-500" /> Permit Fee Estimation</li>
                            <li className="flex gap-3 text-sm text-white/40"><CheckCircle size={16} className="text-blue-500" /> Contingency Planning</li>
                        </ul>
                    </div>
                </div>

                {/* CTA */}
                <div className="text-center">
                    <Link to="/login?mode=signup" className="inline-flex items-center gap-4 px-12 py-6 bg-blue-600 hover:bg-blue-500 text-white font-bold uppercase tracking-widest transition-all rounded-full">
                        Start Your Free Scoping Session <ArrowRight />
                    </Link>
                </div>
            </div>
        </div>
    );
};
