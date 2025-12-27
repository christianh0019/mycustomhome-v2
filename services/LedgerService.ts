import { BudgetCategory, Transaction, LedgerSummary } from '../types';

const MOCK_CATEGORIES: BudgetCategory[] = [
    { id: '1', name: 'Land & Site Work', budgeted: 150000, committed: 145000, paid: 145000 },
    { id: '2', name: 'Foundation & Concrete', budgeted: 65000, committed: 62000, paid: 31000 },
    { id: '3', name: 'Framing & Lumber', budgeted: 120000, committed: 115000, paid: 80000 },
    { id: '4', name: 'Exterior Finishes', budgeted: 85000, committed: 40000, paid: 0 },
    { id: '5', name: 'Plumbing & HVAC', budgeted: 90000, committed: 88000, paid: 22000 },
    { id: '6', name: 'Electrical', budgeted: 45000, committed: 0, paid: 0 },
    { id: '7', name: 'Interior Finishes', budgeted: 150000, committed: 20000, paid: 5000 },
    { id: '8', name: 'Contingency', budgeted: 50000, committed: 0, paid: 0 },
];

const MOCK_TRANSACTIONS: Transaction[] = [
    { id: 't1', date: '2025-10-12', vendor: 'Heritage Title Co', description: 'Land Closing', amount: 145000, category_id: '1', status: 'cleared' },
    { id: 't2', date: '2025-10-25', vendor: 'City Services', description: 'Building Permit Fee', amount: 3500, category_id: '1', status: 'cleared' },
    { id: 't3', date: '2025-11-05', vendor: 'Austin Concrete', description: 'Foundation Draw 1 (Materials)', amount: 20000, category_id: '2', status: 'cleared' },
    { id: 't4', date: '2025-11-15', vendor: 'Austin Concrete', description: 'Foundation Draw 2 (Labor)', amount: 11000, category_id: '2', status: 'cleared' },
    { id: 't5', date: '2025-11-20', vendor: '84 Lumber', description: 'Framing Package Deposit', amount: 40000, category_id: '3', status: 'pending' },
];

export const LedgerService = {
    getSummary: async (): Promise<LedgerSummary> => {
        // Calculate totals dynamically from categories
        const total_budgeted = MOCK_CATEGORIES.reduce((sum, cat) => sum + cat.budgeted, 0);
        const total_committed = MOCK_CATEGORIES.reduce((sum, cat) => sum + cat.committed, 0);
        const total_paid = MOCK_CATEGORIES.reduce((sum, cat) => sum + cat.paid, 0);

        return {
            total_loan: 850000, // Hardcoded Loan Limit for now
            total_budgeted,
            total_committed,
            total_paid,
            cash_on_hand: 205000 // Mock cash balance
        };
    },

    getCategories: async (): Promise<BudgetCategory[]> => {
        return new Promise(resolve => setTimeout(() => resolve(MOCK_CATEGORIES), 500));
    },

    getTransactions: async (): Promise<Transaction[]> => {
        return new Promise(resolve => setTimeout(() => resolve(MOCK_TRANSACTIONS), 500));
    },

    // Future: Method to add transaction via AI Vault upload
    addTransaction: async (tx: Partial<Transaction>) => {
        console.log("Adding mock transaction", tx);
        return true;
    }
};
