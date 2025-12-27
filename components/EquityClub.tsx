import React, { useState, useEffect } from 'react';
import {
  CreditCard, TrendingUp, Lock, CheckCircle, Wallet,
  ArrowUpRight, ShieldCheck, Diamond, Building, ChevronRight
} from 'lucide-react';
import { OnboardingModal } from './OnboardingModal';
import { markFeatureAsSeen } from './NewBadge';
import { AppTab } from '../types';

export const EquityClub: React.FC = () => {
  // Tour State
  const [showTour, setShowTour] = useState(false);

  // Check Local Storage for Tour
  useEffect(() => {
    const TOUR_KEY = 'has_seen_equity_tour';
    const hasSeen = localStorage.getItem(TOUR_KEY);

    if (!hasSeen) {
      setShowTour(true);
    }
  }, []);

  const handleTourClose = () => {
    const TOUR_KEY = 'has_seen_equity_tour';
    localStorage.setItem(TOUR_KEY, 'true');
    setShowTour(false);
    markFeatureAsSeen(AppTab.EquityClub);
  };

  return (
    <div className="p-6 md:p-12 lg:p-12 max-w-7xl mx-auto w-full min-h-screen text-zinc-100 pb-32">
      <OnboardingModal
        isOpen={showTour}
        onClose={handleTourClose}
        title="The Treasure Chest"
        description="Your home is an asset. We help you maximize its value from day one."
        features={[
          "Unfair Equity: Access wholesale pricing not available to the public.",
          "Builder Rebates: Get cash back on materials and finishes.",
          "Asset Tracking: Watch your net worth grow as construction progresses."
        ]}
        type="TAB_WELCOME"
      />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
        <div className="space-y-3">
          <h2 className="text-4xl md:text-5xl font-serif tracking-tighter">The Treasure Chest</h2>
          <div className="h-[1px] w-12 bg-white/30"></div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">Equity Rewards & Rebates</p>
        </div>

        <div className="flex gap-4">
          <div className="bg-[#0A0A0A] border border-white/10 px-6 py-3 rounded-2xl flex items-center gap-4">
            <div className="flex flex-col text-right">
              <span className="text-[9px] uppercase tracking-widest text-zinc-500">Total Value</span>
              <span className="text-2xl font-serif text-white">$14,250.00</span>
            </div>
          </div>
          <div className="bg-[#0A0A0A] border border-white/10 px-6 py-3 rounded-2xl flex items-center gap-4">
            <div className="flex flex-col text-right">
              <span className="text-[9px] uppercase tracking-widest text-zinc-500">Status</span>
              <span className="text-xs uppercase tracking-widest text-emerald-400 font-bold flex items-center gap-2 justify-end">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Active
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Left Column: The Card & Breakdown */}
        <div className="lg:col-span-8 space-y-8">

          {/* THE BLACK CARD */}
          <div className="relative h-[280px] md:h-[320px] rounded-3xl overflow-hidden group shadow-2xl transition-transform hover:scale-[1.01]">
            {/* Background Texture */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a1a] to-black"></div>
            <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent"></div>

            {/* Content */}
            <div className="relative h-full p-8 md:p-10 flex flex-col justify-between z-10">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="text-[10px] uppercase tracking-[0.4em] text-white/40">Membership Tier</div>
                  <div className="text-xl font-serif italic text-white/90 flex items-center gap-2">
                    <Diamond size={16} className="text-white/60" /> Preferred Partner
                  </div>
                </div>
                <img src="https://ui-avatars.com/api/?name=User&background=333&color=fff" className="w-10 h-10 rounded-full opacity-50 grayscale" alt="chip" />
              </div>

              <div className="space-y-2">
                <div className="text-[10px] uppercase tracking-[0.4em] text-white/40">Available Balance</div>
                <div className="text-5xl md:text-6xl font-serif text-white tracking-tight text-shadow-glow">
                  $14,250.00
                </div>
              </div>

              <div className="flex justify-between items-end border-t border-white/10 pt-6">
                <div className="flex gap-4">
                  <div className="space-y-1">
                    <div className="text-[8px] uppercase tracking-widest text-white/30">Account Holder</div>
                    <div className="text-xs font-medium tracking-widest text-white/60">CHRISTIAN HOSTETLER</div>
                  </div>
                  <div className="space-y-1 pl-6 border-l border-white/10">
                    <div className="text-[8px] uppercase tracking-widest text-white/30">Member Since</div>
                    <div className="text-xs font-medium tracking-widest text-white/60">2024</div>
                  </div>
                </div>
                <ShieldCheck className="text-emerald-500/50 w-8 h-8" />
              </div>
            </div>
          </div>

          {/* Ledger / Transactions */}
          <div className="bg-[#0A0A0A] border border-white/5 rounded-3xl p-8">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-lg font-serif">Ledger History</h3>
              <button className="text-[10px] uppercase tracking-widest text-white/40 hover:text-white transition-colors">Download PDF</button>
            </div>

            <div className="space-y-4">
              {[
                { title: 'Builder Introduction Bonus', date: 'Oct 24, 2024', amount: '+$5,000.00', status: 'Cleared', icon: Building },
                { title: 'Architect Referral Reward', date: 'Oct 12, 2024', amount: '+$2,500.00', status: 'Cleared', icon: Wallet },
                { title: 'Lender Origination Rebate', date: 'Pending', amount: '+$6,750.00', status: 'Pending', icon: TrendingUp },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-full ${item.status === 'Pending' ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                      <item.icon size={18} />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white/90">{item.title}</div>
                      <div className="text-[10px] text-white/40 uppercase tracking-wider">{item.date}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-serif ${item.status === 'Pending' ? 'text-white/40' : 'text-white'}`}>{item.amount}</div>
                    <div className={`text-[9px] uppercase tracking-widest ${item.status === 'Pending' ? 'text-amber-500/70' : 'text-emerald-500/70'}`}>{item.status}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Tiers & Actions */}
        <div className="lg:col-span-4 space-y-8">

          {/* Pending Actions */}
          <div className="bg-gradient-to-br from-zinc-900 to-black border border-white/10 rounded-3xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10"><Wallet size={80} /></div>
            <h3 className="text-sm font-medium text-white mb-2 relative z-10">Withdrawal Ready</h3>
            <p className="text-xs text-zinc-400 mb-6 leading-relaxed relative z-10">
              You have $7,500.00 in cleared funds available for direct deposit or application towards closing costs.
            </p>
            <button className="w-full py-4 bg-white text-black font-bold uppercase tracking-widest text-xs rounded-xl hover:bg-zinc-200 transition-colors shadow-lg relative z-10 flex items-center justify-center gap-2">
              Connect Bank <ArrowUpRight size={14} />
            </button>
            <div className="mt-4 text-[9px] text-center text-zinc-600 uppercase tracking-widest relative z-10">
              Secured by Stripe Connect
            </div>
          </div>

          {/* Progress Tiers */}
          <div className="bg-[#0A0A0A] border border-white/5 rounded-3xl p-6">
            <h3 className="text-sm font-medium text-white mb-6">Unlockable Tiers</h3>
            <div className="space-y-6">

              {/* Active Tier */}
              <div className="relative pl-6 border-l-2 border-emerald-500">
                <div className="text-[10px] uppercase tracking-widest text-emerald-500 font-bold mb-1">Current Tier</div>
                <h4 className="text-white font-serif text-lg">Preferred Partner</h4>
                <p className="text-xs text-zinc-500 mt-1">10% Rebate on all referred vendor fees.</p>
                <div className="mt-3 flex items-center gap-2 text-[10px] text-emerald-500 uppercase tracking-wider">
                  <CheckCircle size={12} /> Active
                </div>
              </div>

              {/* Locked Tier */}
              <div className="relative pl-6 border-l-2 border-white/10 opacity-50">
                <div className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-1">Next Tier</div>
                <h4 className="text-white font-serif text-lg">Equity Club Elite</h4>
                <p className="text-xs text-zinc-500 mt-1">15% Rebate + Concierge Service.</p>
                <div className="mt-3 flex items-center gap-2 text-[10px] text-zinc-500 uppercase tracking-wider">
                  <Lock size={12} /> Locked (Requires $25k)
                </div>
              </div>

              {/* Locked Tier 2 */}
              <div className="relative pl-6 border-l-2 border-white/10 opacity-50">
                <div className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-1">Top Tier</div>
                <h4 className="text-white font-serif text-lg">Founder's Circle</h4>
                <p className="text-xs text-zinc-500 mt-1">Equity participation in platform.</p>
                <div className="mt-3 flex items-center gap-2 text-[10px] text-zinc-500 uppercase tracking-wider">
                  <Lock size={12} /> Invite Only
                </div>
              </div>

            </div>

            <button className="w-full mt-8 py-3 bg-white/5 border border-white/5 text-zinc-400 hover:text-white uppercase tracking-widest text-[10px] rounded-xl hover:bg-white/10 transition-colors flex items-center justify-center gap-2">
              View Tier Requirements
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
