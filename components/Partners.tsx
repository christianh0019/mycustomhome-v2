import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';
import { PilotService } from '../services/PilotService';
import { Recommendation } from '../types';
import {
  Shield, Star, Zap, Briefcase, MapPin,
  ArrowUpRight, CheckCircle, Search, ExternalLink, Phone
} from 'lucide-react';

const CATEGORIES = ['Lender', 'Builder', 'Architect', 'Land Surveyor'];

export const Partners: React.FC = () => {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loadingCategory, setLoadingCategory] = useState<string | null>(null);
  const [selectedVendor, setSelectedVendor] = useState<Recommendation | null>(null);
  const [selectedTab, setSelectedTab] = useState('All');

  const [initialFetchDone, setInitialFetchDone] = useState(false);
  const autoScoutAttempted = useRef(false);

  // Fetch Recs
  const fetchRecommendations = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('recommendations')
      .select('*')
      .eq('user_id', user.id);

    if (data) setRecommendations(data as Recommendation[]);
    setInitialFetchDone(true);
  };

  useEffect(() => {
    fetchRecommendations();
  }, [user]);

  // Auto-trigger Lender research ONLY ONCE if missing and we have scope
  useEffect(() => {
    const checkAndResearch = async () => {
      if (!initialFetchDone || !user || autoScoutAttempted.current) return;

      // If user has city/budget but no Lenders, trigger it automatically for them
      if (user.city && user.budgetRange && !loadingCategory) {
        const hasLenders = recommendations.some(r => r.category === 'Lender');

        // Strict Logic: Only auto-scout if we have ZERO recommendations total (New User Experience)
        // If they deleted lenders but have builders, do NOT auto-scout again.
        if (!hasLenders && recommendations.length === 0) {
          autoScoutAttempted.current = true; // Mark as done immediately to prevent double firing
          await handleResearch('Lender');
        }
      }
    };
    checkAndResearch();
  }, [user, recommendations, initialFetchDone]);

  const handleResearch = async (category: string) => {
    if (!user || !user.city || !user.budgetRange) {
      alert("Please complete your profile (City & Budget) first!");
      return;
    }
    setLoadingCategory(category);
    try {
      const existingNames = recommendations.map(r => r.name);
      await PilotService.generateVendorRecommendations(user.id, category, user.city, user.budgetRange, existingNames);
      await fetchRecommendations();
    } catch (err) {
      console.error(err);
      alert("Scouting failed. Please try again or check your connection.");
    } finally {
      setLoadingCategory(null);
    }
  };

  const handleOpenVendor = async (vendor: Recommendation) => {
    setSelectedVendor(vendor);
    if (!vendor.reviews_summary || !vendor.percentage_match) { // If missing details, optimistic check
      // Trigger async enrichment
      await PilotService.enrichVendorData(vendor);
      // Silent re-fetch to update UI without closing modal
      const { data } = await supabase.from('recommendations').select('*').eq('id', vendor.id).single();
      if (data && selectedVendor?.id === vendor.id) {
        setSelectedVendor(data as Recommendation); // Update modal live
        fetchRecommendations(); // Update backing list
      }
    }
  };

  const getOverallScore = (r: Recommendation) => {
    // If backend provided a score, use it
    if (r.overall_score) return r.overall_score;

    // Fallback Frontend Calc
    const scores = [r.scores.reputation, r.scores.affordability, r.scores.locality];

    // If we have a rating, normalize it to 100 and include it
    if (r.rating && r.rating > 0) {
      scores.push(r.rating * 20); // 5 stars = 100
    }

    const total = scores.reduce((a, b) => a + b, 0);
    return Math.round(total / scores.length);
  };

  const sortedRecommendations = [...recommendations].sort((a, b) => getOverallScore(b) - getOverallScore(a));
  const filteredRecommendations = selectedTab === 'All'
    ? sortedRecommendations
    : sortedRecommendations.filter(r => r.category === selectedTab || r.category + 's' === selectedTab);

  return (
    <div className="p-6 md:p-12 lg:p-12 max-w-7xl mx-auto w-full min-h-screen text-zinc-100 pb-40">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
        <div className="space-y-3">
          <h2 className="text-4xl md:text-5xl font-serif tracking-tighter">The Team</h2>
          <div className="h-[1px] w-12 bg-white/30"></div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">
            {user?.city ? `Executive Board • ${user.city}` : "AI Curated Vendors"}
          </p>
        </div>

        <div className="flex flex-wrap gap-2 md:gap-4 items-center">
          {/* Filter Tabs */}
          <div className="bg-[#0A0A0A] border border-white/10 p-1.5 rounded-xl flex gap-1">
            {['All', 'Lender', 'Builder', 'Architect'].map(tab => (
              <button
                key={tab}
                onClick={() => setSelectedTab(tab)}
                className={`px-4 py-2 rounded-lg text-[9px] uppercase tracking-widest transition-all ${selectedTab === tab
                    ? 'bg-white text-black font-bold shadow-lg'
                    : 'text-zinc-500 hover:text-white hover:bg-white/5'
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Add Resource */}
          <div className="relative group z-20">
            <button className="px-5 py-3 bg-[#0A0A0A] text-white border border-white/10 hover:border-white/30 text-[9px] uppercase tracking-widest font-bold rounded-xl transition-all flex items-center gap-2">
              <Search size={12} /> Scout Talent
            </button>
            <div className="absolute right-0 top-full mt-2 w-48 bg-[#0A0A0A] border border-white/10 rounded-xl overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all transform translate-y-2 group-hover:translate-y-0 shadow-2xl">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => handleResearch(cat)}
                  disabled={!!loadingCategory}
                  className="w-full text-left px-4 py-3 text-[10px] uppercase tracking-wider text-zinc-400 hover:text-white hover:bg-white/5 transition-colors border-b border-white/5 last:border-0"
                >
                  Find {cat}s
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {loadingCategory && (
        <div className="mb-12 p-8 border border-white/10 bg-white/[0.02] flex items-center gap-6 animate-pulse rounded-2xl">
          <div className="w-12 h-12 rounded-full border-2 border-white/20 border-t-white animate-spin"></div>
          <div>
            <h3 className="text-xl font-serif">Scouting {loadingCategory}s in {user?.city}...</h3>
            <p className="text-[10px] uppercase tracking-widest text-white/50">Analyzing reputation, permit history, and price match.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRecommendations.map(rec => (
          <div
            key={rec.id}
            onClick={() => handleOpenVendor(rec)}
            className="group relative bg-[#0A0A0A] border border-white/5 p-8 hover:border-white/20 transition-all flex flex-col justify-between min-h-[380px] cursor-pointer hover:-translate-y-1 hover:shadow-2xl rounded-2xl overflow-hidden"
          >
            {/* Background Gradient Hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            {/* Header */}
            <div className="relative z-10 flex justify-between items-start mb-6">
              <div className="w-14 h-14 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center overflow-hidden">
                {rec.logo_url ? (
                  <img src={rec.logo_url} className="w-full h-full object-cover" />
                ) : (
                  <Briefcase className="text-white/20" />
                )}
              </div>
              {rec.rating && (
                <div className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded-full border border-white/5">
                  <Star size={10} className="text-yellow-500 fill-yellow-500" />
                  <span className="text-[10px] font-bold">{rec.rating}</span>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="relative z-10 flex-grow">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[9px] uppercase tracking-widest text-zinc-500">{rec.category}</span>
                {rec.verified_badge && <CheckCircle size={10} className="text-emerald-500" />}
              </div>
              <h4 className="text-2xl font-serif leading-tight text-white mb-3 group-hover:text-emerald-400 transition-colors">
                {rec.name}
              </h4>
              <p className="text-xs text-zinc-500 leading-relaxed line-clamp-3 mb-6">
                {rec.description}
              </p>

              {/* Metrics */}
              <div className="grid grid-cols-3 gap-2 border-t border-white/5 pt-6">
                <div>
                  <div className="text-[8px] uppercase tracking-widest text-zinc-600 mb-1">Score</div>
                  <div className="text-lg font-serif text-white">{getOverallScore(rec)}</div>
                </div>
                <div>
                  <div className="text-[8px] uppercase tracking-widest text-zinc-600 mb-1">Local</div>
                  <div className="text-lg font-serif text-white">{rec.scores.locality}%</div>
                </div>
                <div>
                  <div className="text-[8px] uppercase tracking-widest text-zinc-600 mb-1">Rep</div>
                  <div className="text-lg font-serif text-white">{rec.scores.reputation}%</div>
                </div>
              </div>
            </div>

            {/* Hover Action */}
            <div className="relative z-10 mt-6 pt-6 border-t border-white/5 flex items-center justify-between opacity-50 group-hover:opacity-100 transition-opacity">
              <span className="text-[9px] uppercase tracking-widest text-white">View Full Dossier</span>
              <ArrowUpRight size={14} className="text-white" />
            </div>

          </div>
        ))}

        {recommendations.length === 0 && !loadingCategory && (
          <div className="col-span-full p-20 border border-dashed border-white/10 text-center rounded-3xl bg-[#0A0A0A]">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 text-zinc-600">
              <Search size={24} />
            </div>
            <p className="uppercase tracking-widest text-zinc-500 text-sm font-bold">Boardroom Empty</p>
            <p className="text-xs text-zinc-600 mt-2 max-w-sm mx-auto">
              No partners have been scouted yet. Use the "Scout Talent" button to find vendors or complete your profile.
            </p>
          </div>
        )}
      </div>

      {/* MODAL */}
      {selectedVendor && (
        <div
          className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-300"
          onClick={() => setSelectedVendor(null)}
        >
          <div
            className="w-full max-w-4xl bg-[#0A0A0A] border border-white/10 rounded-3xl overflow-hidden relative shadow-2xl animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedVendor(null)}
              className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white text-white/40 hover:text-black transition-all z-20"
            >
              ✕
            </button>

            {/* Dossier Header */}
            <div className="p-8 md:p-12 pb-8 border-b border-white/5 flex flex-col md:flex-row gap-8 items-start bg-gradient-to-b from-white/[0.02] to-transparent relative">
              <div className="absolute top-0 right-0 p-32 opacity-[0.05] bg-emerald-500 blur-3xl rounded-full -translate-y-16 translate-x-16 pointer-events-none" />

              <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 shadow-2xl">
                {selectedVendor.logo_url ? <img src={selectedVendor.logo_url} className="w-full h-full object-cover rounded-2xl" /> : <Briefcase size={32} className="text-white/20" />}
              </div>

              <div className="space-y-4 flex-grow relative z-10">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-4xl md:text-5xl font-serif tracking-tighter text-white">{selectedVendor.name}</h2>
                    {selectedVendor.verified_badge && (
                      <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 px-3 py-1 text-[9px] uppercase tracking-widest rounded-full font-bold flex items-center gap-1">
                        <Shield size={10} /> Certified
                      </div>
                    )}
                  </div>
                  <p className="text-lg text-zinc-500">{selectedVendor.category} • {user?.city}</p>
                </div>

                <div className="flex flex-wrap gap-3">
                  {selectedVendor.rating > 0 && (
                    <div className="px-3 py-1.5 bg-white/5 rounded-lg border border-white/5 flex items-center gap-2">
                      <div className="flex text-yellow-500 text-xs">{'★'.repeat(Math.round(selectedVendor.rating))}</div>
                      <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                        {selectedVendor.rating} ({selectedVendor.review_count} Reviews)
                      </span>
                    </div>
                  )}
                  {selectedVendor.years_in_business && (
                    <div className="px-3 py-1.5 bg-white/5 rounded-lg border border-white/5 flex items-center gap-2 text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                      <div className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
                      {selectedVendor.years_in_business} Exp
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12">

              {/* Left (Analysis) */}
              <div className="md:col-span-7 p-8 md:p-12 space-y-10 border-b md:border-b-0 md:border-r border-white/5">

                <section>
                  <h3 className="text-xs uppercase tracking-widest text-zinc-500 mb-6 flex items-center gap-2"><Zap size={14} /> Executive Summary</h3>
                  <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl">
                    <p className="text-sm leading-7 text-zinc-300">
                      {selectedVendor.reviews_summary || <span className="animate-pulse">Running AI Market Analysis...</span>}
                    </p>
                  </div>
                </section>

                <div className="grid grid-cols-2 gap-4">
                  {selectedVendor.phone && (
                    <a href={`tel:${selectedVendor.phone}`} className="flex items-center justify-center gap-2 py-4 border border-white/10 rounded-xl hover:bg-white hover:text-black transition-all text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                      <Phone size={14} /> Call Office
                    </a>
                  )}
                  {selectedVendor.website && (
                    <a href={selectedVendor.website} target="_blank" className="flex items-center justify-center gap-2 py-4 border border-white/10 rounded-xl hover:bg-white hover:text-black transition-all text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                      Website <ExternalLink size={14} />
                    </a>
                  )}
                </div>

              </div>

              {/* Right (Scores & Actions) */}
              <div className="md:col-span-5 p-8 md:p-12 space-y-10 bg-[#0A0A0A]">

                <div className="flex items-center gap-6 pb-8 border-b border-white/5">
                  <div className="w-20 h-20 rounded-full border-4 border-emerald-500/20 flex items-center justify-center text-3xl font-serif text-white relative">
                    {getOverallScore(selectedVendor)}
                    <span className="absolute -top-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full text-[10px] flex items-center justify-center font-bold text-black border-2 border-black">A+</span>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white uppercase tracking-widest mb-1">Pilot Score</div>
                    <div className="text-[10px] text-zinc-500">Algorithm Match for {user?.budgetRange}</div>
                  </div>
                </div>

                <div className="space-y-6">
                  {['Reputation', 'Affordability', 'Locality'].map(k => {
                    const val = selectedVendor.scores[k.toLowerCase() as keyof typeof selectedVendor.scores];
                    return (
                      <div key={k} className="space-y-2">
                        <div className="flex justify-between text-[10px] uppercase tracking-widest">
                          <span className="text-zinc-500">{k}</span>
                          <span className="text-white font-bold">{val}/100</span>
                        </div>
                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-white transition-all duration-1000 ease-out" style={{ width: `${val}%` }} />
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className="pt-8">
                  <button
                    onClick={async (e) => {
                      e.stopPropagation();
                      if (!user) return;

                      const btn = e.currentTarget;
                      const originalText = btn.innerText;
                      btn.innerText = "Securing Invite...";
                      btn.disabled = true;

                      try {
                        const { error } = await supabase.from('leads').insert({
                          homeowner_id: user.id,
                          vendor_id: selectedVendor.id,
                          project_scope_snapshot: { city: user.city, budget: user.budgetRange },
                          status: 'invite_sent'
                        });

                        if (error) throw error;

                        btn.innerText = "Invite Sent to Office";
                        btn.classList.add('bg-emerald-600', 'border-emerald-600', 'text-white');
                        btn.classList.remove('bg-white', 'text-black');
                      } catch (err) {
                        console.error(err);
                        alert("Failed to send invite.");
                        btn.innerText = originalText;
                        btn.disabled = false;
                      }
                    }}
                    className="w-full py-5 bg-white text-black font-bold uppercase tracking-widest hover:scale-[1.02] transition-all shadow-xl rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Start Conversation
                  </button>
                  <p className="text-[9px] text-center text-zinc-600 mt-4 uppercase tracking-widest">
                    Anonymous Inquiry • No Spam • No Obligation
                  </p>
                </div>

              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
