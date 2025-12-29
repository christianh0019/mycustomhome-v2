
export interface MarketData {
    city: string;
    low: number;
    high: number;
    avg: number;
    description: string;
}

// Mock Database
const MOCK_DB: Record<string, MarketData> = {
    // Colorado
    'aspen': { city: 'Aspen, CO', low: 1000, high: 2500, avg: 1600, description: "Ultra-luxury market. High premiums for labor scarcity and materials." },
    'denver': { city: 'Denver, CO', low: 275, high: 450, avg: 350, description: "Competitive metro market. Trade availability is steady." },
    'boulder': { city: 'Boulder, CO', low: 450, high: 750, avg: 550, description: "Strict regulations and high demand drive premium pricing." },
    'fort collins': { city: 'Fort Collins, CO', low: 250, high: 450, avg: 325, description: "Steady market with moderate growth." },
    'colorado springs': { city: 'Colorado Springs, CO', low: 250, high: 400, avg: 300, description: "More affordable labor pool compared to Denver." },
    'vail': { city: 'Vail, CO', low: 800, high: 1800, avg: 1200, description: "Resort market with significant logistical premiums." },

    // Major US Hubs
    'austin': { city: 'Austin, TX', low: 300, high: 500, avg: 400, description: "High demand tech hub. Material costs are volatile." },
    'nashville': { city: 'Nashville, TN', low: 225, high: 400, avg: 300, description: "Booming market but labor is catching up." },
    'phoenix': { city: 'Phoenix, AZ', low: 275, high: 450, avg: 350, description: "Material availability is good, labor can be tight." },
    'seattle': { city: 'Seattle, WA', low: 450, high: 750, avg: 575, description: "High labor costs and complex site conditions common." },
    'miami': { city: 'Miami, FL', low: 400, high: 700, avg: 525, description: "Hurrican code requirements drive up hard costs." },
    'los angeles': { city: 'Los Angeles, CA', low: 500, high: 900, avg: 650, description: "Strict permitting and high labor rates." },
    'san francisco': { city: 'San Francisco, CA', low: 600, high: 1000, avg: 800, description: "Extremely challenging logistics and regulations." },
    'new york': { city: 'New York, NY', low: 500, high: 1000, avg: 750, description: "Union labor dominance and complex logistics." },
    'dallas': { city: 'Dallas, TX', low: 250, high: 450, avg: 325, description: "Competitive market with good supply chain access." },
};

const DEFAULT_DATA: MarketData = {
    city: 'Unknown',
    low: 250,
    high: 500,
    avg: 325,
    description: "Based on national custom home averages."
};

export const LocationCostService = {
    /**
     * Simulates an AI lookup for local construction costs.
     */
    getMarketData: async (city: string): Promise<MarketData> => {
        // Simulate network delay for "AI" feel
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Simple fuzzy match or direct lookup
        const normalized = city.toLowerCase().trim();

        // Exact match
        if (MOCK_DB[normalized]) {
            return MOCK_DB[normalized];
        }

        // Partial match (e.g. "Denver" in "Denver, CO")
        const foundKey = Object.keys(MOCK_DB).find(key => normalized.includes(key));
        if (foundKey) {
            return MOCK_DB[foundKey];
        }

        // Fallback
        return {
            ...DEFAULT_DATA,
            city: city, // Keep user's input
            description: "City not found in database. Showing National Averages."
        };
    }
};
