import React, { createContext, useContext, useState, ReactNode } from 'react';

interface PageContextType {
    pageData: Record<string, any>;
    setPageData: (data: Record<string, any>) => void;
}

const PageContext = createContext<PageContextType | undefined>(undefined);

export const PageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [pageData, setPageData] = useState<Record<string, any>>({});

    return (
        <PageContext.Provider value={{ pageData, setPageData }}>
            {children}
        </PageContext.Provider>
    );
};

export const usePageContext = () => {
    const context = useContext(PageContext);
    if (context === undefined) {
        throw new Error('usePageContext must be used within a PageProvider');
    }
    return context;
};
