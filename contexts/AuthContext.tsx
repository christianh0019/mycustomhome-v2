
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    login: (email: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        // Check localStorage for persisted session
        const storedUser = localStorage.getItem('mch_user');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error('Failed to parse user from local storage', e);
                localStorage.removeItem('mch_user');
            }
        }
    }, []);

    const login = (email: string) => {
        // Mock user data
        const mockUser: User = {
            id: 'user-1',
            name: 'Christian Hostetler', // Default mock name
            email: email,
            avatarUrl: 'https://ui-avatars.com/api/?name=Christian+Hostetler&background=random'
        };

        setUser(mockUser);
        localStorage.setItem('mch_user', JSON.stringify(mockUser));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('mch_user');
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
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
