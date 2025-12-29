
export interface MarketData {
    city: string;
    low: number;
    high: number;
    avg: number;
    description: string;
}

// Mock Database
// Regional Cost Multipliers (Base: National Avg ~ $350/sqft)
const STATE_MULTIPLIERS: Record<string, number> = {
    'CA': 1.45, 'NY': 1.6, 'MA': 1.35, 'HI': 1.5, 'AK': 1.3,
    'CO': 1.15, 'WA': 1.25, 'OR': 1.15, 'DC': 1.3, 'NJ': 1.25,
    'TX': 0.95, 'FL': 1.05, 'AZ': 1.0, 'NV': 1.1, 'TN': 0.95,
    'NC': 0.9, 'SC': 0.9, 'GA': 0.9, 'IL': 1.1, 'OH': 0.9,
    'MI': 0.95, 'PA': 1.05, 'VA': 0.95, 'MD': 1.05,
    // Add defaults for others implicitly as 1.0
};

// "Tier 1" Luxury/Resort Markets (City Name Match)
const LUXURY_MARKETS = [
    'aspen', 'vail', 'jackson hole', 'park city', 'malibu', 'beverly hills',
    'hamptons', 'miami beach', 'scottsdale', 'santa barbara', 'naples',
    'telluride', 'breckenridge', 'steamboat', 'montecito'
];

// Manual Overrides for Specific "Unusual" Markets
const MARKET_OVERRIDES: Record<string, MarketData> = {
    'aspen, co': { city: 'Aspen, CO', low: 1200, high: 2800, avg: 1800, description: "Ultra-luxury resort market. Extreme premiums for labor/logistics." },
    'vail, co': { city: 'Vail, CO', low: 1000, high: 2200, avg: 1500, description: "High-alpine resort market with significant construction challenges." },
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

        // 1. Check Overrides (Exact Match)
        if (MARKET_OVERRIDES[normalized]) {
            return MARKET_OVERRIDES[normalized];
        }

        // 2. Fetch Live Details from OpenMeteo
        try {
            // Intelligent Parsing: "City, State" -> name="City", text match state
            let searchTerm = city;
            let expectedState = '';

            if (city.includes(',')) {
                const parts = city.split(',');
                searchTerm = parts[0].trim();
                expectedState = parts[1].trim().toLowerCase();
            } else {
                // Handle "Dallas TX" format
                const words = city.trim().split(' ');
                const lastWord = words[words.length - 1];
                if (words.length > 1 && lastWord.length === 2 && /^[a-zA-Z]+$/.test(lastWord)) {
                    expectedState = lastWord.toLowerCase();
                    searchTerm = words.slice(0, -1).join(' ');
                }
            }

            const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(searchTerm)}&count=10&language=en&format=json`);
            const data = await response.json();

            if (data.results && data.results.length > 0) {
                // Find best match matching state if provided
                let place = data.results[0]; // Default to first matches

                if (expectedState) {
                    const match = data.results.find((p: any) => {
                        const stateName = (p.admin1 || '').toLowerCase();
                        const stateCode = (p.admin1_code || '').toLowerCase();
                        return stateName.includes(expectedState) || stateCode === expectedState;
                    });
                    if (match) place = match;
                }

                const stateCode = place.admin1_code || ''; // e.g. "CO", "TX"
                const country = place.country_code;
                const isUS = country === 'US';

                // Base Cost (National)
                let baseLow = 275;
                let baseHigh = 550;

                // Apply State Multiplier (US Only)
                let locationFactor = 1.0;
                if (isUS && stateCode && STATE_MULTIPLIERS[stateCode]) {
                    locationFactor = STATE_MULTIPLIERS[stateCode];
                } else if (!isUS) {
                    locationFactor = 1.1; // International buffer
                }

                // Luxury/Resort premium check
                const isLuxury = LUXURY_MARKETS.some(m => normalized.includes(m));
                if (isLuxury) locationFactor *= 1.4;

                // Calculate
                const low = Math.round(baseLow * locationFactor);
                const high = Math.round(baseHigh * locationFactor);
                const avg = Math.round((low + high) / 2);

                const desc = isLuxury
                    ? `Identified as a high-demand luxury market in ${place.admin1}. Expect premium labor and material costs.`
                    : `Based on regional construction multipliers for ${place.admin1 || country}.`;

                return {
                    city: `${place.name}, ${place.admin1_code || place.country_code}`,
                    low, high, avg,
                    description: desc
                };
            }
        } catch (e) {
            console.error("Live fetch failed", e);
        }

        // 3. Fallback
        return {
            ...DEFAULT_DATA,
            city: city,
            description: "Could not verify location data. Using National Averages."
        };
    },

    /**
     * Returns a list of matching city names via OpenMeteo Geocoding API.
     */
    searchCities: async (query: string): Promise<string[]> => {
        if (!query || query.length < 2) return [];

        try {
            const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=en&format=json`);
            const data = await response.json();

            if (!data.results) return [];

            return data.results.map((place: any) => {
                const state = place.admin1 || '';
                const country = place.country_code || '';
                // Format: "City, State" (US) or "City, Country" (International)
                if (country === 'US' && state) {
                    return `${place.name}, ${place.admin1_code || state}`;
                }
                return `${place.name}, ${country}`;
            });
        } catch (error) {
            console.error("City search failed", error);
            // Fallback to overrides if partial match
            const normalized = query.toLowerCase();
            return Object.values(MARKET_OVERRIDES)
                .filter(data => data.city.toLowerCase().includes(normalized))
                .map(data => data.city);
        }
    }
};
