
export const DEFAULT_SOFT_COST_PCT = 0.20; // 20% default

export interface BudgetBreakdown {
    totalBudget: number;
    landCost: number;
    softCostEstimate: number;
    hardConstructionBudget: number;
    hardCostPerSqFt: number;
}

export type FeasibilityStatus = 'Unrealistic' | 'Tight' | 'Comfortable' | 'Luxury';

/**
 * Calculates the "Hard Construction Budget" by stripping away land and soft costs.
 */
export const calculateBudgetBreakdown = (
    totalBudget: number,
    landCost: number,
    sqFt: number,
    includeSoftCosts: boolean = true
): BudgetBreakdown => {
    // 1. Deduct Land
    const budgetAfterLand = Math.max(0, totalBudget - landCost);

    // 2. Calculate Soft Costs (applied to the remaining amount or total? Usually total project context, 
    // but for simplicity in this tool, we often estimate soft costs as % of total construction. 
    // Let's take % of the budgetAfterLand to be safe, or user might prefer % of total.)
    // Method: Soft Costs are typically ~20% of the TOTAL project (excluding land). 
    // So if we have X amount left for "House + Soft", then House = X / 1.20

    let softCostEstimate = 0;
    let hardConstructionBudget = budgetAfterLand;

    if (includeSoftCosts) {
        // X = Hard + Soft
        // Soft = 20% of X? Or 20% of Hard? 
        // Industry rule of thumb: Soft costs are ~15-20% of CONSTRUCTION cost.
        // So TotalConstruction = Hard * 1.20
        // Hard = TotalAvailable / 1.20
        hardConstructionBudget = budgetAfterLand / (1 + DEFAULT_SOFT_COST_PCT);
        softCostEstimate = budgetAfterLand - hardConstructionBudget;
    }

    // 3. Per Sq Ft
    const hardCostPerSqFt = sqFt > 0 ? hardConstructionBudget / sqFt : 0;

    return {
        totalBudget,
        landCost,
        softCostEstimate,
        hardConstructionBudget,
        hardCostPerSqFt
    };
};

/**
 * Determines status based on local market data.
 */
export const getFeasibilityStatus = (
    costPerSqFt: number,
    marketLow: number, // e.g. 250
    marketHigh: number // e.g. 450
): { status: FeasibilityStatus; color: string; message: string } => {

    if (costPerSqFt < marketLow) {
        return {
            status: 'Unrealistic',
            color: 'text-red-500',
            message: `At $${Math.round(costPerSqFt)}/ft, you are below the local minimum of $${marketLow}/ft. This is high risk.`
        };
    }

    if (costPerSqFt < (marketLow + 50)) {
        return {
            status: 'Tight',
            color: 'text-yellow-500',
            message: `At $${Math.round(costPerSqFt)}/ft, you are in the entry-level range. Standard finishes only.`
        };
    }

    if (costPerSqFt > marketHigh) {
        return {
            status: 'Luxury',
            color: 'text-purple-400',
            message: `At $${Math.round(costPerSqFt)}/ft, you can build a true luxury home with premium finishes.`
        };
    }

    return {
        status: 'Comfortable',
        color: 'text-emerald-500',
        message: `At $${Math.round(costPerSqFt)}/ft, you are in the sweet spot for a quality custom home.`
    };
};
