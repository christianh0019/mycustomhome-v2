
import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

export const PublicLayout: React.FC = () => {
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);
    const location = useLocation();

    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-white selection:text-black">
            {/* Navbar */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
                <div className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-3">
                        <img src="/logo.png" alt="My Custom Home Consultant" className="h-16 w-auto" />
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-8">
                        <Link to="/" className={`text-xs uppercase tracking-[0.2em] font-medium hover:text-white transition-colors ${location.pathname === '/' ? 'text-white' : 'text-white/50'}`}>Pro Consultant</Link>
                        <Link to="/vendors" className={`text-xs uppercase tracking-[0.2em] font-medium hover:text-white transition-colors ${location.pathname === '/vendors' ? 'text-white' : 'text-white/50'}`}>For Vendors</Link>
                    </div>

                    <div className="hidden md:flex items-center gap-6">
                        <Link to="/login" className="text-xs uppercase tracking-[0.2em] font-medium text-white/50 hover:text-white transition-colors">Client Login</Link>
                        <Link to="/login?mode=signup" className="px-8 py-3 bg-white text-black text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-white/90 transition-colors">Start Project</Link>
                    </div>

                    {/* Mobile Menu Toggle */}
                    <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                        {isMenuOpen ? <X /> : <Menu />}
                    </button>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="md:hidden absolute top-24 left-0 right-0 bg-black border-b border-white/10 p-8 flex flex-col gap-8 animate-in slide-in-from-top-4 z-50">
                        <Link to="/" onClick={() => setIsMenuOpen(false)} className="text-2xl font-serif">Pro Consultant</Link>
                        <Link to="/vendors" onClick={() => setIsMenuOpen(false)} className="text-2xl font-serif">For Vendors</Link>
                        <hr className="border-white/10" />
                        <Link to="/login" onClick={() => setIsMenuOpen(false)} className="text-xl font-serif text-white/60">Client Login</Link>
                        <Link to="/login?mode=signup" onClick={() => setIsMenuOpen(false)} className="py-4 bg-white text-black text-center font-bold uppercase tracking-widest text-xs">Start Project</Link>
                    </div>
                )}
            </nav>

            {/* Main Content */}
            <main className="pt-20">
                <Outlet />
            </main>

            {/* Footer */}
            <footer className="bg-[#050505] border-t border-white/10 py-24">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
                    <div className="col-span-1 md:col-span-2">
                        <img src="/logo.png" alt="My Custom Home Consultant" className="h-12 w-auto mb-8 opacity-50 grayscale" />
                        <p className="text-white/40 max-w-sm leading-relaxed text-sm">
                            The premier consultancy for discerning homeowners. We simplify the complex journey of custom home building through intelligence and transparency.
                        </p>
                    </div>
                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-widest mb-6">Platform</h4>
                        <div className="flex flex-col gap-4 text-white/40 text-sm">
                            <Link to="/homeowners" className="hover:text-white transition-colors">Project Pilot</Link>
                            <Link to="/vendors" className="hover:text-white transition-colors">Vendor Network</Link>
                            <Link to="/login" className="hover:text-white transition-colors">Log In</Link>
                        </div>
                    </div>
                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-widest mb-6">Legal</h4>
                        <div className="flex flex-col gap-4 text-white/40 text-sm">
                            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                            <a href="#" className="hover:text-white transition-colors">Contact Support</a>
                        </div>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto px-6 mt-20 pt-8 border-t border-white/5 text-center text-white/20 text-[10px] uppercase tracking-[0.2em]">
                    © {new Date().getFullYear()} My Custom Home Consultant. All rights reserved.
                </div>
            </footer>
        </div>
    );
};
