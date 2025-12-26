
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

  // Fetch Recs
  const fetchRecommendations = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('recommendations')
      .select('*')
      .eq('user_id', user.id);

    if (data) setRecommendations(data as Recommendation[]);
  };

  useEffect(() => {
    fetchRecommendations();
  }, [user]);

  // Auto-trigger Lender research if missing and we have scope
  useEffect(() => {
    const checkAndResearch = async () => {
      // If user has city/budget but no Lenders, trigger it automatically for them
      if (user && user.city && user.budgetRange && !loadingCategory) {
        const hasLenders = recommendations.some(r => r.category === 'Lender');
        if (!hasLenders && recommendations.length === 0) { // Only auto-trigger on fresh account
          await handleResearch('Lender');
        }
      }
    };
    // Debounce slightly or just run
    checkAndResearch();
  }, [user, recommendations.length]); // Depend on length to avoid loops

  const handleResearch = async (category: string) => {
    if (!user || !user.city || !user.budgetRange) {
      alert("Please complete your profile (City & Budget) first!");
      return;
    }
    setLoadingCategory(category);
    await PilotService.generateVendorRecommendations(user.id, category, user.city, user.budgetRange);
    await fetchRecommendations();
    setLoadingCategory(null);
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
    <div className="p-6 md:p-12 lg:p-24 max-w-7xl mx-auto w-full breathing-fade pb-40">
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
              <span className="text-xs bg-white text-black px-2 py-0.5 rounded-full font-bold">3</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendations.filter(r => r.category === cat).map(rec => (
                <div key={rec.id} className="group relative bg-[#080808] border border-white/10 p-8 hover:border-white/30 transition-all flex flex-col justify-between min-h-[400px]">
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
                      Connect
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
    </div>
  );
};
