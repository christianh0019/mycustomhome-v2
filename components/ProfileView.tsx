
import React from 'react';
import { HomeownerProfile } from './HomeownerProfile';
import { VendorProfile } from './VendorProfile';

interface ProfileViewProps {
    profileId: string;
    // matchId is needed for HomeownerProfile (to save notes)
    matchId?: string;
    viewerRole: 'homeowner' | 'business' | 'contact' | 'admin';
    onClose: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ profileId, matchId, viewerRole, onClose }) => {
    // Controller Logic

    // If a Business/Vendor is viewing, they are looking at a Homeowner Profile
    if (viewerRole === 'business' || viewerRole === 'consultant') {
        return (
            <HomeownerProfile
                profileId={profileId}
                matchId={matchId}
                onClose={onClose}
            />
        );
    }

    // If a Homeowner is viewing, they are looking at a Vendor Profile
    // (Or if admin/contact views, default to Vendor view for now as safe fallback, or handle explicitly)
    return (
        <VendorProfile
            profileId={profileId}
            onClose={onClose}
        />
    );
};
