```
// ... (previous imports)

export const Partners: React.FC = () => {
  // ... (previous state)
  const [selectedVendor, setSelectedVendor] = useState<Recommendation | null>(null);

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
                    <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500" style={{ width: `${ selectedVendor.scores.affordability }% ` }} />
                    </div>
                  </div>
                  <div className="flex justify-between items-center bg-white/[0.02] p-4 border border-white/5 rounded-lg">
                    <span className="text-sm">Local Jobs</span>
                    <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500" style={{ width: `${ selectedVendor.scores.locality }% ` }} />
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
