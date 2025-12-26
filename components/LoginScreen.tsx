
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const LoginScreen: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { login, loginWithGoogle, signup, isAuthenticated } = useAuth();

    const [isLogin, setIsLogin] = useState(searchParams.get('mode') !== 'signup');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Redirect if already logged in
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/app');
        }
    }, [isAuthenticated, navigate]);

    // Update mode if URL changes
    useEffect(() => {
        setIsLogin(searchParams.get('mode') !== 'signup');
    }, [searchParams]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            if (isLogin) {
                await login(email, password);
                navigate('/app'); // Explicit redirect after login
            } else {
                await signup(email, password);
                navigate('/app'); // Explicit redirect after signup (if auto-confirm is off) or show message
            }
        } catch (err: any) {
            console.error(err);
            setError(err.message || "An error occurred");
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

                <div className="mb-8">
                    <button
                        onClick={() => loginWithGoogle()}
                        className="w-full flex items-center justify-center gap-3 bg-white text-black py-4 px-6 rounded-xl uppercase tracking-[0.2em] text-xs font-bold hover:bg-zinc-200 transition-all duration-300 transform hover:scale-[1.02]"
                    >
                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                            <path
                                fill="currentColor"
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                                fill="currentColor"
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                                fill="currentColor"
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            />
                            <path
                                fill="currentColor"
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            />
                        </svg>
                        Continue with Google
                    </button>

                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-white/10"></div>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase tracking-widest">
                            <span className="px-4 text-white/20 bg-[#060606]">Or continue with email</span>
                        </div>
                    </div>
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
