import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';
import { PilotService } from '../services/PilotService';
import { Recommendation } from '../types';

const CATEGORIES = ['Lender', 'Builder', 'Architect', 'Land Surveyor'];

export const Partners: React.FC = () => {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loadingCategory, setLoadingCategory] = useState<string | null>(null);
  const [selectedVendor, setSelectedVendor] = useState<Recommendation | null>(null);

  const [initialFetchDone, setInitialFetchDone] = useState(false);
  const autoScoutAttempted = React.useRef(false);

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

  const renderScoreRing = (score: number, label: string) => (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-12 h-12 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90">
          <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="2" fill="transparent" className="text-white/10" />
          <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="2" fill="transparent"
            className={score > 80 ? "text-emerald-500" : score > 60 ? "text-yellow-500" : "text-red-500"}
            strokeDasharray={125.6}
            strokeDashoffset={125.6 - (125.6 * score) / 100}
          />
        </svg>
        <span className="absolute text-[10px] font-bold">{score}</span>
      </div>
      <span className="text-[7px] uppercase tracking-wider text-white/40">{label}</span>
    </div>
  );

  return (
    <div className="p-6 md:p-12 lg:p-24 max-w-7xl mx-auto w-full breathing-fade pb-40 relative">
      <div className="mb-12 md:mb-16 flex justify-between items-end">
        <div>
          <h2 className="text-4xl md:text-6xl font-serif tracking-tighter mb-2">The Team</h2>
          <p className="text-[10px] md:text-[11px] uppercase tracking-[0.4em] text-white/30">
            {user?.city ? `Curated for ${user.city} • ${user.budgetRange}` : "AI Curated Vendors"}
          </p>
        </div>
        {/* Manual Triggers for other categories */}
        <div className="hidden md:flex gap-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              disabled={!!loadingCategory}
              onClick={() => handleResearch(cat)}
              className="px-4 py-2 border border-white/10 text-[9px] uppercase tracking-widest hover:bg-white hover:text-black transition-colors disabled:opacity-30"
            >
              {loadingCategory === cat ? 'Scouting...' : `Find ${cat}s`}
            </button>
          ))}
        </div>
      </div>

      {loadingCategory && (
        <div className="mb-12 p-8 border border-white/10 bg-white/[0.02] flex items-center gap-6 animate-pulse">
          <div className="w-12 h-12 rounded-full border-2 border-white/20 border-t-white animate-spin"></div>
          <div>
            <h3 className="text-xl font-serif">Scouting {loadingCategory}s in {user?.city}...</h3>
            <p className="text-[10px] uppercase tracking-widest text-white/50">Analyzing reputation, permit history, and price match.</p>
          </div>
        </div>
      )}

      <div className="space-y-16">
        {/* Group by Category */}
        {Array.from(new Set(recommendations.map(r => r.category))).map(cat => (
          <div key={cat}>
            <h3 className="text-2xl font-serif mb-8 flex items-center gap-3">
              {cat}s
              <span className="text-xs bg-white text-black px-2 py-0.5 rounded-full font-bold">{recommendations.filter(r => r.category === cat).length}</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendations.filter(r => r.category === cat).map(rec => (
                <div key={rec.id} onClick={() => handleOpenVendor(rec)} className="group relative bg-[#080808] border border-white/10 p-8 hover:border-white/30 transition-all flex flex-col justify-between min-h-[400px] cursor-pointer">
                  {rec.status === 'new' && (
                    <div className="absolute top-4 right-4 w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_red]"></div>
                  )}

                  <div>
                    <div className="flex items-center gap-4 mb-6">
                      <img src={rec.logo_url} className="w-12 h-12 rounded-lg bg-white/5" />
                      <h4 className="text-xl font-serif leading-tight">{rec.name}</h4>
                    </div>
                    <p className="text-sm text-white/60 leading-relaxed mb-8">{rec.description}</p>

                    {/* Scores */}
                    <div className="flex justify-between px-2 pb-8 border-b border-white/5">
                      {renderScoreRing(rec.scores.reputation, "Reputation")}
                      {renderScoreRing(rec.scores.affordability, "Cost Match")}
                      {renderScoreRing(rec.scores.locality, "Local")}
                    </div>
                  </div>

                  <div className="pt-6">
                    <button className="w-full py-3 bg-white/5 hover:bg-white hover:text-black border border-white/10 transition-colors text-[10px] uppercase tracking-widest font-bold">
                      View Dossier
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {recommendations.length === 0 && !loadingCategory && (
          <div className="p-20 border border-dashed border-white/10 text-center text-white/30">
            <p className="uppercase tracking-widest">No partners scouted yet.</p>
            <p className="text-xs mt-2">Complete your profile onboarding to start the search.</p>
          </div>
        )}
      </div>

      {/* MODAL */}
      {selectedVendor && (
        <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="w-full max-w-3xl bg-[#0A0A0A] border border-white/10 rounded-2xl overflow-hidden relative shadow-2xl animate-in zoom-in-95 duration-300">
            <button onClick={(e) => { e.stopPropagation(); setSelectedVendor(null); }} className="absolute top-6 right-6 text-white/40 hover:text-white transition-colors z-10">✕ CLOSE</button>

            <div className="p-8 md:p-12 pb-8 border-b border-white/5 flex gap-8 items-start">
              <img src={selectedVendor.logo_url} className="w-24 h-24 rounded-2xl bg-white/5" />
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h2 className="text-4xl font-serif tracking-tight">{selectedVendor.name}</h2>
                  {selectedVendor.verified_badge && (
                    <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1 text-[9px] uppercase tracking-widest rounded-full font-bold">Verified</span>
                  )}
                </div>
                <p className="text-lg text-white/60">{selectedVendor.category} • {user?.city}</p>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  {selectedVendor.phone ? (
                    <a href={`tel:${selectedVendor.phone}`} className="text-sm font-bold opacity-80 hover:opacity-100 flex items-center gap-2">
                      📞 {selectedVendor.phone}
                    </a>
                  ) : <span className="text-white/20 text-sm animate-pulse">Scanning contact info...</span>}
                  {selectedVendor.website ? (
                    <a href={selectedVendor.website} target="_blank" className="text-sm font-bold opacity-80 hover:opacity-100 flex items-center gap-2 underline">
                      🌐 Visit Website
                    </a>
                  ) : <span className="text-white/20 text-sm animate-pulse">Locating website...</span>}
                </div>
              </div>
            </div>

            <div className="p-8 md:p-12 grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-8">
                <h3 className="text-sm uppercase tracking-[0.2em] text-white/40">Pilot Analysis</h3>
                <div className="p-6 bg-white/[0.03] border border-white/5 rounded-xl space-y-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center text-xs">AI</div>
                    <p className="text-sm font-bold">Market Reputation</p>
                  </div>
                  <p className="text-sm leading-relaxed text-white/80">
                    {selectedVendor.reviews_summary || (
                      <span className="animate-pulse">Analyzing online reviews, license status, and permit history...</span>
                    )}
                  </p>
                </div>
                <p className="text-xs text-white/30 italic">
                  *Based on aggregated public data from Google, Houzz, and BBB.
                </p>
              </div>

              <div className="space-y-8">
                <h3 className="text-sm uppercase tracking-[0.2em] text-white/40">Performance Scores</h3>
                <div className="grid grid-cols-1 gap-6">
                  <div className="flex justify-between items-center bg-white/[0.02] p-4 border border-white/5 rounded-lg">
                    <span className="text-sm">Reputation</span>
                    <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-white" style={{ width: `${selectedVendor.scores.reputation}%` }} />
                    </div>
                  </div>
                  <div className="flex justify-between items-center bg-white/[0.02] p-4 border border-white/5 rounded-lg">
                    <span className="text-sm">Budget Match</span>
                    <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500" style={{ width: `${selectedVendor.scores.affordability}%` }} />
                    </div>
                  </div>
                  <div className="flex justify-between items-center bg-white/[0.02] p-4 border border-white/5 rounded-lg">
                    <span className="text-sm">Local Jobs</span>
                    <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500" style={{ width: `${selectedVendor.scores.locality}%` }} />
                    </div>
                  </div>
                </div>

                <button className="w-full py-4 bg-white text-black font-bold uppercase tracking-widest hover:scale-105 transition-all">
                  Start Conversation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
