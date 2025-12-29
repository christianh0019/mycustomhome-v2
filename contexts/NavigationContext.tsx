
import { AppTab } from '../types';
import { createContext, useContext, useState, ReactNode } from 'react';

interface NavigationContextType {
    activeTab: AppTab;
    setActiveTab: (tab: AppTab) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const NavigationProvider = ({ children }: { children: ReactNode }) => {
    const [activeTab, setActiveTab] = useState<AppTab>(AppTab.Dashboard); // Default

    return (
        <NavigationContext.Provider value={{ activeTab, setActiveTab }}>
            {children}
        </NavigationContext.Provider>
    );
};

export const useNavigation = () => {
    const context = useContext(NavigationContext);
    if (!context) {
        throw new Error('useNavigation must be used within a NavigationProvider');
    }
    return context;
};
