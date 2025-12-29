
export interface MarketData {
    city: string;
    low: number;
    high: number;
    avg: number;
    description: string;
}

// Mock Database
const MOCK_DB: Record<string, MarketData> = {
    'aspen': { city: 'Aspen', low: 800, high: 2000, avg: 1200, description: "Ultra-luxury market with extreme labor/material premiums." },
    'denver': { city: 'Denver', low: 300, high: 550, avg: 400, description: "Standard metro pricing with competitive trade base." },
    'boulder': { city: 'Boulder', low: 400, high: 700, avg: 500, description: "High regulatory environment and premium expectations." },
    'greeley': { city: 'Greeley', low: 220, high: 350, avg: 275, description: "More affordable labor market." },
    'loveland': { city: 'Loveland', low: 250, high: 450, avg: 325, description: "Balanced market for custom homes." },
    'fort collins': { city: 'Fort Collins', low: 275, high: 500, avg: 350, description: "High demand area with steady trade availability." },
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

        const normalized = city.toLowerCase().trim();
        return MOCK_DB[normalized] || { ...DEFAULT_DATA, city };
    }
};
