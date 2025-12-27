import React, { useEffect, useState } from 'react';

interface NewBadgeProps {
    featureId: string; // e.g., 'TheLedger'
    isUnlocked: boolean;
}

export const NewBadge: React.FC<NewBadgeProps> = ({ featureId, isUnlocked }) => {
    const [isNew, setIsNew] = useState(false);

    useEffect(() => {
        const checkStatus = () => {
            if (!isUnlocked) {
                setIsNew(false);
                return;
            }
            const seenFeatures = JSON.parse(localStorage.getItem('seen_features') || '[]');
            if (!seenFeatures.includes(featureId)) {
                setIsNew(true);
            } else {
                setIsNew(false);
            }
        };

        // Initial check
        checkStatus();

        // Listen for custom event
        const handleFeatureSeen = (e: Event) => {
            checkStatus();
        };

        window.addEventListener('feature-seen', handleFeatureSeen);
        return () => window.removeEventListener('feature-seen', handleFeatureSeen);
    }, [featureId, isUnlocked]);

    if (!isNew) return null;

    return (
        <span className="ml-2 px-1.5 py-0.5 bg-red-500 text-white text-[9px] font-bold rounded uppercase tracking-widest animate-pulse">
            New
        </span>
    );
};

// Helper to mark as seen
export const markFeatureAsSeen = (featureId: string) => {
    const seenFeatures = JSON.parse(localStorage.getItem('seen_features') || '[]');
    if (!seenFeatures.includes(featureId)) {
        seenFeatures.push(featureId);
        localStorage.setItem('seen_features', JSON.stringify(seenFeatures));

        // Dispatch custom event to notify all badges
        window.dispatchEvent(new Event('feature-seen'));
    }
};
