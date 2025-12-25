
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export const LoginScreen: React.FC = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const { login, signup } = useAuth();
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            if (isLogin) {
                await login(email, password);
            } else {
                await signup(email, password);
            }
        } catch (err: any) {
            console.error(err);
            setError(err.message || "An error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex h-screen w-full bg-black items-center justify-center relative overflow-hidden">
            {/* Ambient Background Effects */}
            <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-white/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[400px] h-[400px] bg-white/5 rounded-full blur-[100px] pointer-events-none" />

            <div className="w-full max-w-md px-8 z-10">
                <div className="mb-12 text-center space-y-4">
                    <h1 className="text-3xl md:text-4xl font-light tracking-[0.2em] uppercase text-white">
                        MyCustomHome
                    </h1>
                    <p className="text-xs uppercase tracking-[0.4em] text-white/40">
                        {isLogin ? 'The Vault Access' : 'Join The Registry'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8 backdrop-blur-sm bg-white/[0.02] p-8 md:p-12 border border-white/10 rounded-2xl shadow-2xl relative">
                    {error && (
                        <div className="absolute top-0 left-0 right-0 -mt-12 text-center">
                            <span className="text-red-400 text-xs uppercase tracking-widest bg-red-900/20 px-3 py-1 border border-red-500/20 rounded">
                                {error}
                            </span>
                        </div>
                    )}

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase tracking-[0.2em] text-white/40 pl-1 block">
                                Email Address
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-transparent border-b border-white/20 py-3 text-white placeholder-white/10 focus:border-white focus:outline-none transition-colors duration-300 text-sm tracking-wider"
                                placeholder="CLIENT@EXAMPLE.COM"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase tracking-[0.2em] text-white/40 pl-1 block">
                                Password
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                minLength={6}
                                className="w-full bg-transparent border-b border-white/20 py-3 text-white placeholder-white/10 focus:border-white focus:outline-none transition-colors duration-300 text-sm tracking-wider"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    <div className="pt-4 space-y-4">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-white text-black py-4 px-6 uppercase tracking-[0.2em] text-xs font-bold hover:bg-white/90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
                        >
                            <span className={`relative z-10 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
                                {isLogin ? 'Enter The Vault' : 'Create Account'}
                            </span>
                            {isLoading && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                </div>
                            )}
                        </button>

                        <div className="text-center pt-2">
                            <button
                                type="button"
                                onClick={() => { setIsLogin(!isLogin); setError(null); }}
                                className="text-[10px] uppercase tracking-[0.2em] text-white/40 hover:text-white transition-colors"
                            >
                                {isLogin ? "Don't have an account? Sign Up" : "Already a member? Log In"}
                            </button>
                        </div>
                    </div>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-white/20">
                        Secured by Antigravity
                    </p>
                </div>
            </div>
        </div>
    );
};
