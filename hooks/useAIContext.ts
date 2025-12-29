import { useLocation } from 'react-router-dom';
import { AppTab } from '../types';
import { useNavigation } from '../contexts/NavigationContext';

export const useAIContext = () => {
    const { activeTab } = useNavigation();

    // This function will gather "State" from various services or local storage
    // to feed to the AI prompt. 
    // Ideally, this connects to global stores (like Zustand or Contexts).
    // For now, we mock the retrieval based on activeTab.

    const getContext = () => {
        switch (activeTab) {
            case AppTab.BudgetCreator:
                return "User is currently in the Budget Creator. They are adjusting sliders for Total Budget, Land Costs, and Home Size. They may need help understanding soft costs or feasibility.";
            case AppTab.Roadmap:
                return "User is viewing the Roadmap. They are tracking their progress through the 10 stages of home building.";
            case AppTab.TheVault:
                return "User is in The Vault, managing their documents.";
            default:
                return `User is currently viewing the ${activeTab} tab.`;
        }
    };

    return {
        activeTab,
        currentContext: getContext()
    };
};
