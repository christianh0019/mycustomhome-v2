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
  const [selectedTab, setSelectedTab] = useState('All');

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
      <div className="mb-12 md:mb-16 flex flex-col md:flex-row justify-between items-end gap-6">
        <div>
          <h2 className="text-4xl md:text-6xl font-serif tracking-tighter mb-2">The Team</h2>
          <p className="text-[10px] md:text-[11px] uppercase tracking-[0.4em] text-white/30">
            {user?.city ? `Curated for ${user.city} • ${user.budgetRange}` : "AI Curated Vendors"}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex bg-white/5 p-1 rounded-lg">
            {['All', 'Lender', 'Builder', 'Architect'].map(tab => (
              <button
                key={tab}
                onClick={() => setSelectedTab(tab)}
                className={`px-4 py-2 text-[10px] uppercase tracking-widest rounded-md transition-all ${selectedTab === tab ? 'bg-white text-black font-bold' : 'text-white/50 hover:text-white'}`}
              >
                {tab}s
              </button>
            ))}
          </div>

          <div className="relative group">
            <button className="px-4 py-3 bg-white text-black text-[10px] uppercase tracking-widest font-bold rounded-lg hover:bg-white/90 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.2)]">
              + Add Resource
            </button>
            <div className="absolute right-0 top-full mt-2 w-48 bg-[#111] border border-white/10 rounded-xl overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all transform translate-y-2 group-hover:translate-y-0 z-50 shadow-2xl">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => handleResearch(cat)}
                  disabled={!!loadingCategory}
                  className="w-full text-left px-4 py-3 text-xs text-white/60 hover:text-white hover:bg-white/5 transition-colors border-b border-white/5 last:border-0"
                >
                  Find {cat}s
                </button>
              ))}
            </div>
          </div>
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRecommendations.map(rec => (
          <div key={rec.id} onClick={() => handleOpenVendor(rec)} className="group relative bg-[#080808] border border-white/10 p-8 hover:border-white/30 transition-all flex flex-col justify-between min-h-[400px] cursor-pointer hover:-translate-y-1 hover:shadow-[0_10px_40px_-10px_rgba(255,255,255,0.1)]">
            {rec.status === 'new' && (
              <div className="absolute top-4 left-4 flex gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse shadow-[0_0_10px_blue]"></div>
                <span className="text-[9px] uppercase tracking-widest text-blue-400">New Insight</span>
              </div>
            )}

            {rec.rating ? (
              <div className="absolute top-4 right-4 flex items-center gap-1 bg-white/5 border border-white/10 px-2 py-1 rounded-full backdrop-blur-md">
                <span className="text-yellow-400 text-[10px]">★</span>
                <span className="text-[10px] font-bold">{rec.rating}</span>
              </div>
            ) : null}

            <div>
              <div className="flex items-center gap-4 mb-6 mt-4">
                <img src={rec.logo_url} className="w-12 h-12 rounded-lg bg-white/5" />
                <div>
                  <h4 className="text-xl font-serif leading-tight">{rec.name}</h4>
                  {rec.verified_badge && <span className="text-[9px] text-yellow-500 uppercase tracking-widest">★ Certified Partner</span>}
                </div>
              </div>
              <p className="text-sm text-white/60 leading-relaxed mb-8 line-clamp-3">{rec.description}</p>

              <div className="flex justify-between px-2 pb-8 border-b border-white/5">
                {renderScoreRing(rec.scores.reputation, "Reputation")}
                {renderScoreRing(rec.scores.affordability, "Cost Match")}
                {renderScoreRing(rec.scores.locality, "Local")}
              </div>
            </div>

            <div className="pt-6">
              <button className="w-full py-3 bg-white/5 group-hover:bg-white group-hover:text-black border border-white/10 transition-colors text-[10px] uppercase tracking-widest font-bold">
                View Dossier
              </button>
            </div>
          </div>
        ))}

        {recommendations.length === 0 && !loadingCategory && (
          <div className="col-span-full p-20 border border-dashed border-white/10 text-center text-white/30">
            <p className="uppercase tracking-widest">No partners scouted yet.</p>
            <p className="text-xs mt-2">Complete your profile onboarding to start the search or use "Add Resource".</p>
          </div>
        )}
      </div>

      {selectedVendor && (
        <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300" onClick={() => setSelectedVendor(null)}>
          <div className="w-full max-w-3xl bg-[#0A0A0A] border border-white/10 rounded-2xl overflow-hidden relative shadow-2xl animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
            <button onClick={() => setSelectedVendor(null)} className="absolute top-6 right-6 text-white/40 hover:text-white transition-colors z-10">✕ CLOSE</button>

            <div className="p-8 md:p-12 pb-8 border-b border-white/5 flex gap-8 items-start bg-gradient-to-br from-white/[0.03] to-transparent">
              <img src={selectedVendor.logo_url} className="w-24 h-24 rounded-2xl bg-white/5 shadow-2xl" />
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h2 className="text-4xl font-serif tracking-tight">{selectedVendor.name}</h2>
                  {selectedVendor.verified_badge && (
                    <span className="bg-yellow-500 text-black border border-yellow-400 px-3 py-1 text-[9px] uppercase tracking-widest rounded-full font-bold shadow-[0_0_15px_rgba(234,179,8,0.4)]">
                      Certified Partner
                    </span>
                  )}
                </div>
                <p className="text-lg text-white/60">{selectedVendor.category} • {user?.city}</p>
                <div className="flex gap-6 mt-4">
                  {selectedVendor.rating ? (
                    <div>
                      <div className="flex items-center gap-1 text-yellow-400 text-lg">
                        {'★'.repeat(Math.round(selectedVendor.rating))}
                        <span className="text-white/20">{'★'.repeat(5 - Math.round(selectedVendor.rating))}</span>
                      </div>
                      <p className="text-[10px] uppercase tracking-widest text-white/40">{selectedVendor.rating} Rating ({selectedVendor.review_count || 0} Reviews)</p>
                    </div>
                  ) : <span className="text-[10px] uppercase tracking-widest text-white/30">No public ratings found</span>}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="p-8 md:p-12 space-y-8 border-r border-white/5">
                <h3 className="text-sm uppercase tracking-[0.2em] text-white/40">Pilot Analysis</h3>
                <div className="p-6 bg-white/[0.02] border border-white/5 rounded-xl">
                  <p className="text-sm leading-relaxed text-white/80">
                    {selectedVendor.reviews_summary || <span className="animate-pulse">Analyzing market reputation...</span>}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {selectedVendor.phone ? (
                    <a href={`tel:${selectedVendor.phone}`} className="flex items-center justify-center py-4 border border-white/10 hover:bg-white hover:text-black transition-all text-xs font-bold uppercase tracking-widest">
                      {selectedVendor.phone}
                    </a>
                  ) : null}
                  {selectedVendor.website ? (
                    <a href={selectedVendor.website} target="_blank" className="flex items-center justify-center py-4 border border-white/10 hover:bg-white hover:text-black transition-all text-xs font-bold uppercase tracking-widest">
                      Website ↗
                    </a>
                  ) : null}
                </div>
              </div>

              <div className="p-8 md:p-12 space-y-8">
                <h3 className="text-sm uppercase tracking-[0.2em] text-white/40">Performance Scores</h3>

                <div className="flex items-center gap-4 mb-8">
                  <div className="w-16 h-16 rounded-full border-2 border-white/20 flex items-center justify-center text-xl font-bold bg-white/5">
                    {getOverallScore(selectedVendor)}
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-white/40">Pilot Score</p>
                    <p className="text-xs text-white/30">Algorithm Match</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {['Reputation', 'Affordability', 'Locality'].map(k => {
                    const val = selectedVendor.scores[k.toLowerCase() as keyof typeof selectedVendor.scores];
                    return (
                      <div key={k} className="flex flex-col gap-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-white/60">{k}</span>
                          <span className="font-bold">{val}/100</span>
                        </div>
                        <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-white transition-all duration-1000 ease-out" style={{ width: `${val}%` }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
                <button className="w-full py-4 bg-white text-black font-bold uppercase tracking-widest hover:scale-105 transition-all shadow-lg mt-8">
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
