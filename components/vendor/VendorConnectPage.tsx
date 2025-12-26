import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    CheckCircle, Shield, Building, MapPin, DollarSign,
    Calendar, AlertTriangle, Lock, FileText, ChevronRight
} from 'lucide-react';
import { supabase } from '../../services/supabase';
import { VendorInvite, Lead } from '../../types';

export const VendorConnectPage: React.FC = () => {
    const { token } = useParams<{ token: string }>();
    const [invite, setInvite] = useState<VendorInvite | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [accepted, setAccepted] = useState(false);

    // Mock Data for visual testing until Backend is live
    const mockLead: Lead = {
        id: '123',
        homeowner_id: '456',
        created_at: new Date().toISOString(),
        status: 'vetting',
        project_title: 'Contemporary Hillside Build',
        budget_range: '$1.4M - $1.6M',
        location_city: 'Austin',
        location_state: 'TX',
        scope_summary: '4,500 sqft custom home on sloped lot. Requires strict foundation engineering. Client has land under contract. Soil test pending. Modern aesthetic with extensive glass.',
        timeline: 'Break ground in Q3',
    };

    useEffect(() => {
        // In a real implementation, we would fetch the invite by token here
        // const { data, error } = await supabase...

        // Simulating fetch delay
        setTimeout(() => {
            if (token === 'demo-token' || token) {
                setInvite({
                    id: 'inv-123',
                    lead_id: 'lead-123',
                    lead: mockLead,
                    vendor_email: 'builder@example.com',
                    token: token || 'demo',
                    status: 'sent',
                    created_at: new Date().toISOString(),
                    expires_at: new Date(Date.now() + 86400000).toISOString() // Tomorrow
                });
                setLoading(false);
            } else {
                setError("Invalid or expired invite token.");
                setLoading(false);
            }
        }, 1000);
    }, [token]);

    const handleAccept = async () => {
        // Here we would call an API or update Supabase to mark as accepted
        setAccepted(true);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            </div>
        );
    }

    if (error || !invite || !invite.lead) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center text-white">
                <div className="text-center">
                    <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-serif mb-2">Invite Not Found</h1>
                    <p className="text-zinc-500">This link may have expired or is invalid.</p>
                </div>
            </div>
        );
    }

    const { lead } = invite;

    return (
        <div className="min-h-screen bg-[#030303] text-zinc-200 font-sans selection:bg-white/20 selection:text-white">

            {/* Header */}
            <div className="border-b border-white/5 bg-black/50 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Lock size={14} className="text-green-500" />
                        <span className="text-xs uppercase tracking-widest font-semibold text-zinc-400">Secure Breakdown</span>
                    </div>
                    <div className="text-xs text-zinc-600 font-mono">ID: {invite.id.slice(0, 8)}</div>
                </div>
            </div>

            <main className="max-w-3xl mx-auto px-6 py-12">

                {/* Hero Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#0A0A0A] border border-white/10 rounded-3xl p-8 mb-8 relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                        <Building size={120} />
                    </div>

                    <div className="relative z-10">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/5 mb-6">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-[10px] uppercase tracking-widest font-medium text-white/80">Active Opportunity</span>
                        </div>

                        <h1 className="text-3xl md:text-5xl font-serif text-white mb-6 leading-tight">
                            {lead.project_title}
                        </h1>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 border-t border-white/5 pt-8">
                            <div>
                                <div className="text-xs uppercase tracking-widest text-zinc-500 mb-1">Budget Est.</div>
                                <div className="text-lg text-white font-medium">{lead.budget_range}</div>
                            </div>
                            <div>
                                <div className="text-xs uppercase tracking-widest text-zinc-500 mb-1">Location</div>
                                <div className="text-lg text-white font-medium">{lead.location_city}, {lead.location_state}</div>
                            </div>
                            <div>
                                <div className="text-xs uppercase tracking-widest text-zinc-500 mb-1">Timeline</div>
                                <div className="text-lg text-white font-medium">{lead.timeline}</div>
                            </div>
                            <div>
                                <div className="text-xs uppercase tracking-widest text-zinc-500 mb-1">Status</div>
                                <div className="text-lg text-white font-medium capitalize">{lead.status}</div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Scope & Details */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-8"
                >
                    <div className="md:col-span-2 space-y-6">
                        <div className="bg-[#050505] border border-white/5 rounded-2xl p-6">
                            <h2 className="text-sm uppercase tracking-widest text-zinc-400 mb-4 flex items-center gap-2">
                                <FileText size={14} /> Scope Summary
                            </h2>
                            <p className="text-zinc-300 leading-relaxed text-lg font-light">
                                {lead.scope_summary}
                            </p>
                        </div>

                        {!accepted ? (
                            <div className="bg-gradient-to-br from-zinc-900 to-black border border-white/10 rounded-2xl p-8 text-center space-y-6">
                                <Lock className="w-8 h-8 text-zinc-500 mx-auto" />
                                <div>
                                    <h3 className="text-xl text-white font-medium mb-2">Client Details Redacted</h3>
                                    <p className="text-zinc-400 text-sm max-w-sm mx-auto">
                                        Accept this registered opportunity to reveal the client's contact information and unlock the full project dossier.
                                    </p>
                                </div>
                                <button
                                    onClick={handleAccept}
                                    className="w-full bg-white text-black py-4 rounded-xl font-bold uppercase tracking-widest text-sm hover:bg-zinc-200 transition-colors shadow-lg"
                                >
                                    Accept & Reveal Client
                                </button>
                                <div className="text-[10px] text-zinc-600 uppercase tracking-widest">
                                    By accepting, you agree to the Non-Disclosure Terms
                                </div>
                            </div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-green-900/10 border border-green-500/20 rounded-2xl p-8 space-y-6"
                            >
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className="text-xl text-white font-medium mb-1">Access Granted</h3>
                                        <p className="text-green-400 text-sm">You have been connected with this lead.</p>
                                    </div>
                                    <CheckCircle className="text-green-500" />
                                </div>

                                <div className="grid grid-cols-2 gap-4 bg-black/20 p-4 rounded-xl border border-white/5">
                                    <div>
                                        <div className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Client Name</div>
                                        <div className="text-white font-medium">Sarah & Tom Miller</div>
                                    </div>
                                    <div>
                                        <div className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Direct Phone</div>
                                        <div className="text-white font-medium">(512) 555-0123</div>
                                    </div>
                                    <div className="col-span-2">
                                        <div className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Email</div>
                                        <div className="text-white font-medium">sarah.miller@example.com</div>
                                    </div>
                                </div>

                                <button className="w-full bg-green-500 text-black py-4 rounded-xl font-bold uppercase tracking-widest text-sm hover:bg-green-400 transition-colors">
                                    Download Full Dossier (PDF)
                                </button>
                            </motion.div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <div className="bg-[#050505] border border-white/5 rounded-2xl p-6">
                            <h3 className="text-xs uppercase tracking-widest text-zinc-500 mb-4">Required Capabilities</h3>
                            <ul className="space-y-3">
                                <li className="flex items-start gap-2 text-sm text-zinc-300">
                                    <CheckCircle size={14} className="text-green-500 mt-1 shrink-0" />
                                    <span>Hillside Foundation exp.</span>
                                </li>
                                <li className="flex items-start gap-2 text-sm text-zinc-300">
                                    <CheckCircle size={14} className="text-green-500 mt-1 shrink-0" />
                                    <span>Modern/Steel Framing</span>
                                </li>
                                <li className="flex items-start gap-2 text-sm text-zinc-300">
                                    <CheckCircle size={14} className="text-green-500 mt-1 shrink-0" />
                                    <span>Budget Guarantee</span>
                                </li>
                            </ul>
                        </div>

                        <div className="bg-[#050505] border border-white/5 rounded-2xl p-6">
                            <h3 className="text-xs uppercase tracking-widest text-zinc-500 mb-4">Lead Score</h3>
                            <div className="flex items-end gap-2 mb-2">
                                <div className="text-4xl font-serif text-white">94</div>
                                <div className="text-sm text-green-500 mb-1.5">/ 100</div>
                            </div>
                            <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
                                <div className="bg-green-500 h-full w-[94%]" />
                            </div>
                            <p className="text-xs text-zinc-500 mt-3 leading-relaxed">
                                Highly qualified. Land secured. Financing pre-approved.
                            </p>
                        </div>
                    </div>

                </motion.div>

            </main>
        </div>
    );
};
