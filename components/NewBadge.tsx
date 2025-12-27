import React, { useEffect, useState } from 'react';

interface NewBadgeProps {
    featureId: string; // e.g., 'TheLedger'
    isUnlocked: boolean;
}

export const NewBadge: React.FC<NewBadgeProps> = ({ featureId, isUnlocked }) => {
    const [isNew, setIsNew] = useState(false);

    useEffect(() => {
        if (!isUnlocked) {
            setIsNew(false);
            return;
        }

        // Check local storage for "seen_features"
        const seenFeatures = JSON.parse(localStorage.getItem('seen_features') || '[]');
        if (!seenFeatures.includes(featureId)) {
            setIsNew(true);
        }
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
        // We could trigger a global event here if we needed instant updates across components,
        // but for Sidebar, re-render on click usually suffices if we handle it there.
    }
};
