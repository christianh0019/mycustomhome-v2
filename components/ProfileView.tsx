
import React from 'react';
import { HomeownerProfile } from './HomeownerProfile';
import { VendorProfile } from './VendorProfile';

interface ProfileViewProps {
    profileId: string;
    // matchId is needed for HomeownerProfile (to save notes)
    matchId?: string;
    profileRole: 'homeowner' | 'business' | 'contact' | 'admin';
    onClose: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ profileId, matchId, profileRole, onClose }) => {
    // Controller Logic based on the TARGET PROFILE'S role.

    // If the profile I am looking at is a Homeowner, render HomeownerProfile
    if (profileRole === 'homeowner') {
        return (
            <HomeownerProfile
                profileId={profileId}
                matchId={matchId}
                onClose={onClose}
            />
        );
    }

    // Otherwise, render VendorProfile
    return (
        <VendorProfile
            profileId={profileId}
            onClose={onClose}
        />
    );
};
