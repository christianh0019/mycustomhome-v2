
import React from 'react';
import { useAuth } from '../contexts/AuthContext';

export const Settings: React.FC = () => {
    const { user, logout } = useAuth();

    if (!user) return null;

    return (
        <div className="h-full flex flex-col bg-black text-white p-6 md:p-12 max-w-4xl mx-auto w-full">
            {/* Header */}
            <header className="mb-12 space-y-2">
                <h2 className="text-2xl md:text-3xl font-light tracking-[0.1em]">PROFILE</h2>
                <div className="w-20 h-[1px] bg-white/20"></div>
            </header>

            <div className="space-y-12">
                {/* User Card */}
                <section className="flex flex-col md:flex-row items-center md:items-start gap-8 p-8 border border-white/10 bg-white/[0.02] backdrop-blur-sm">
                    <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-white/10">
                        <img
                            src={user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`}
                            alt={user.name}
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="flex-1 text-center md:text-left space-y-2">
                        <h3 className="text-xl font-light tracking-wide">{user.name}</h3>
                        <p className="text-xs uppercase tracking-[0.2em] text-white/40">{user.email}</p>
                        <div className="pt-2">
                            <span className="inline-block px-3 py-1 border border-white/10 text-[10px] uppercase tracking-widest text-white/60">
                                Member since 2025
                            </span>
                        </div>
                    </div>
                </section>

                {/* Action Buttons */}
                <section className="space-y-4">
                    <button
                        onClick={logout}
                        className="w-full md:w-auto px-8 py-4 border border-red-500/50 text-red-400 hover:bg-red-500/10 transition-colors uppercase tracking-[0.2em] text-xs"
                    >
                        Log Out
                    </button>
                </section>
            </div>
        </div>
    );
};
