import { AppTab } from '../types';
import { useNavigation } from '../contexts/NavigationContext';
import { usePageContext } from '../contexts/PageContext';

export const useAIContext = () => {
    const { activeTab } = useNavigation();
    const { pageData } = usePageContext();

    // This function will gather "State" from various services or local storage
    // to feed to the AI prompt. 
    // Ideally, this connects to global stores (like Zustand or Contexts).
    // For now, we mock the retrieval based on activeTab.

    const getContext = () => {
        let baseContext = `User is currently viewing the ${activeTab} tab.`;

        switch (activeTab) {
            case AppTab.BudgetCreator:
                baseContext = "User is in the Budget Creator.";
                break;
            case AppTab.Roadmap:
                baseContext = "User is viewing the Roadmap.";
                break;
            case AppTab.TheVault:
                baseContext = "User is in The Vault.";
                break;
        }

        // Deep Context Injection
        if (Object.keys(pageData).length > 0) {
            baseContext += `\n\n[LIVE PAGE DATA]:\n${JSON.stringify(pageData, null, 2)}`;
        }

        return baseContext;
    };

    return {
        activeTab,
        currentContext: getContext()
    };
};
