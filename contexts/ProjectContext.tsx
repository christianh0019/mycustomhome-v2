import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define the shape of our Project Data
export interface ProjectData {
    budget: {
        totalBudget: number;
        landCost: number;
        targetSqFt: number;
        includeSoftCosts: boolean;
        hasLand: boolean;
        city: string;
        marketData: { low: number; high: number } | null;
    };
    roadmap: {
        currentStage: number;
        completedStages: number[];
    };
}

// Default initial state
const defaultProjectData: ProjectData = {
    budget: {
        totalBudget: 800000, // Default start
        landCost: 200000,
        targetSqFt: 2500,
        includeSoftCosts: true,
        hasLand: true,
        city: '',
        marketData: null
    },
    roadmap: {
        currentStage: 1,
        completedStages: []
    }
};

interface ProjectContextType {
    projectData: ProjectData;
    updateBudget: (updates: Partial<ProjectData['budget']>) => void;
    updateRoadmap: (updates: Partial<ProjectData['roadmap']>) => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // Initialize from LocalStorage if available, else default
    const [projectData, setProjectData] = useState<ProjectData>(() => {
        const saved = localStorage.getItem('mycustomhome_project_data');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                // Merge parsed data with default to ensure new keys exist
                return {
                    budget: { ...defaultProjectData.budget, ...parsed.budget },
                    roadmap: { ...defaultProjectData.roadmap, ...parsed.roadmap }
                };
            } catch (e) {
                console.error("Failed to parse project data", e);
                return defaultProjectData;
            }
        }
        return defaultProjectData;
    });

    // Persist to LocalStorage whenever data changes
    useEffect(() => {
        localStorage.setItem('mycustomhome_project_data', JSON.stringify(projectData));
    }, [projectData]);

    const updateBudget = (updates: Partial<ProjectData['budget']>) => {
        setProjectData(prev => ({
            ...prev,
            budget: { ...prev.budget, ...updates }
        }));
    };

    const updateRoadmap = (updates: Partial<ProjectData['roadmap']>) => {
        setProjectData(prev => ({
            ...prev,
            roadmap: { ...prev.roadmap, ...updates }
        }));
    };

    return (
        <ProjectContext.Provider value={{ projectData, updateBudget, updateRoadmap }}>
            {children}
        </ProjectContext.Provider>
    );
};

export const useProjectContext = () => {
    const context = useContext(ProjectContext);
    if (context === undefined) {
        throw new Error('useProjectContext must be used within a ProjectProvider');
    }
    return context;
};
