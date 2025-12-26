
// ... (previous imports)

export const Partners: React.FC = () => {
  // ... (previous state)
  const [selectedTab, setSelectedTab] = useState('All');

  // ... (logic)

  // Calculate Overall Score (Dynamic)
  const getOverallScore = (r: Recommendation) => {
    if (r.overall_score) return r.overall_score;
    // Fallback calc
    const base = (r.scores.reputation + r.scores.affordability + r.scores.locality) / 3;
    const ratingBonus = (r.rating || 0) * 10;
    return Math.round((base + ratingBonus) / 2); // normalized roughly
  };

  const sortedRecommendations = [...recommendations].sort((a, b) => getOverallScore(b) - getOverallScore(a));
  const filteredRecommendations = selectedTab === 'All'
    ? sortedRecommendations
    : sortedRecommendations.filter(r => r.category === selectedTab || r.category + 's' === selectedTab); // handle 'Lender' vs 'Lenders' mismatch if any

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
          {/* Clean Tab Bar */}
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

          {/* Add Resource Dropdown (Simplified) */}
          <div className="relative group">
            <button className="px-4 py-3 bg-white text-black text-[10px] uppercase tracking-widest font-bold rounded-lg hover:bg-white/90 transition-colors">
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

      {/* LOADING STATE */}
      {loadingCategory && (/* ... same ... */)}

      {/* GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRecommendations.map(rec => (
          <div key={rec.id} onClick={() => handleOpenVendor(rec)} className="group relative bg-[#080808] border border-white/10 p-8 hover:border-white/30 transition-all flex flex-col justify-between min-h-[400px] cursor-pointer hover:-translate-y-1">
            {/* ... card content same as before ... */}
            {/* ... Add rating star if available ... */}
            {rec.rating ? (
              <div className="absolute top-8 right-8 flex items-center gap-1 bg-white/10 px-2 py-1 rounded-full">
                <span className="text-yellow-400 text-xs">★</span>
                <span className="text-xs font-bold">{rec.rating}</span>
                <span className="text-[8px] text-white/50">({rec.review_count})</span>
              </div>
            ) : null}
          </div>
        ))}
      </div>

      {/* MODAL with new stats */}
      {selectedVendor && (
        /* ... Portal wrapper logic handled by rendering at root ... */
        <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-300">
          {/* ... Close button ... */}
          <div className="w-full max-w-3xl bg-[#0A0A0A] border border-white/10 rounded-2xl overflow-hidden relative shadow-2xl animate-in zoom-in-95 duration-300">
            {/* ... Header ... */}

            {/* NEW STATS ROW */}
            <div className="px-12 py-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
              <div className='flex gap-8'>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-white/40 mb-1">Overall Rating</p>
                  <div className="flex items-end gap-2">
                    <span className="text-3xl font-serif">{selectedVendor.rating || '--'}</span>
                    <div className="flex text-yellow-500 mb-1 text-sm">
                      {'★'.repeat(Math.round(selectedVendor.rating || 0))}
                      <span className="text-white/20">{'★'.repeat(5 - Math.round(selectedVendor.rating || 0))}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-white/40 mb-1">Verified Reviews</p>
                  <p className="text-3xl font-serif">{selectedVendor.review_count || '--'}</p>
                </div>
              </div>
              {/* Overall Score Circle */}
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-widest text-white/40">Pilot Score</p>
                  <p className="text-xs text-white/30">Algorithm Match</p>
                </div>
                <div className="w-16 h-16 rounded-full border-2 border-white/20 flex items-center justify-center text-xl font-bold bg-white/5">
                  {getOverallScore(selectedVendor)}
                </div>
              </div>
            </div>

            {/* ... Main Content ... */}
          </div>
        </div>
      )}
    </div>
  );
};
