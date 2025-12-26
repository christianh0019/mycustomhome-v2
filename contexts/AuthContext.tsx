import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '../types';
import { supabase } from '../services/supabase';

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    login: (email: string, password?: string) => Promise<void>;
    loginWithGoogle: () => Promise<void>;
    signup: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    updateProfile: (updates: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);

    // Helper to fetch profile from DB
    const fetchProfile = async (sessionUser: any) => {
        try {
            const { data: profile, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', sessionUser.id)
                .single();

            if (error && error.code !== 'PGRST116') {
                console.error('Error fetching profile:', error);
            }

            setUser({
                id: sessionUser.id,
                name: sessionUser.user_metadata.full_name || sessionUser.email?.split('@')[0] || 'Member',
                email: sessionUser.email || '',
                avatarUrl: sessionUser.user_metadata.avatar_url,
                hasOnboarded: profile?.has_onboarded ?? false,
                currentStage: profile?.current_stage ?? 0,
                role: (profile?.role as UserRole) || 'homeowner',
                city: profile?.city,
                budgetRange: profile?.budget_range,
                phone: profile?.phone,
                lenderName: profile?.lender_name,
                preApprovalInfo: profile?.pre_approval_info,
                // companyName: profile?.company_name // Would need to add this column
            });
        } catch (err) {
            console.error('Profile fetch failed', err);
        }
    };

    useEffect(() => {
        // Check active session
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
                fetchProfile(session.user);
            }
        });

        // Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) {
                fetchProfile(session.user);
            } else {
                setUser(null);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const login = async (email: string, password?: string) => {
        if (password) {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;
        } else {
            const { error } = await supabase.auth.signInWithOtp({ email });
            if (error) throw error;
            alert('Check your email for the login link!');
        }
    };

    const loginWithGoogle = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin + '/app'
            }
        });
        if (error) throw error;
    };

    const signup = async (email: string, password: string) => {
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: email.split('@')[0],
                    avatar_url: 'https://ui-avatars.com/api/?name=' + email + '&background=random'
                }
            }
        });
        if (error) throw error;
        alert('Account created! Please check your email to verify your account.');
    };

    const logout = async () => {
        await supabase.auth.signOut();
        setUser(null);
    };

    const updateProfile = async (updates: Partial<User>) => {
        if (!user) return;

        // Optimistic update
        setUser(prev => prev ? { ...prev, ...updates } : null);

        // DB Update Payload
        const dbUpdates: any = {};
        if (updates.hasOnboarded !== undefined) dbUpdates.has_onboarded = updates.hasOnboarded;
        if (updates.city !== undefined) dbUpdates.city = updates.city;
        if (updates.budgetRange !== undefined) dbUpdates.budget_range = updates.budgetRange;
        if (updates.currentStage !== undefined) dbUpdates.current_stage = updates.currentStage;
        if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
        if (updates.lenderName !== undefined) dbUpdates.lender_name = updates.lenderName;
        if (updates.preApprovalInfo !== undefined) dbUpdates.pre_approval_info = updates.preApprovalInfo;

        if (Object.keys(dbUpdates).length > 0) {
            const { error } = await supabase
                .from('profiles')
                .update(dbUpdates)
                .eq('id', user.id);

            if (error) console.error('Failed to update profile:', error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, loginWithGoogle, signup, logout, updateProfile }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
