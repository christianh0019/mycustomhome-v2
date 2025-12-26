
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
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <Link to="/" className="text-2xl font-serif font-bold tracking-tighter">
                        MCH
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-8">
                        <Link to="/" className={`text-sm uppercase tracking-widest hover:text-white transition-colors ${location.pathname === '/' ? 'text-white' : 'text-white/60'}`}>Home</Link>
                        <Link to="/homeowners" className={`text-sm uppercase tracking-widest hover:text-white transition-colors ${location.pathname === '/homeowners' ? 'text-white' : 'text-white/60'}`}>For Homeowners</Link>
                        <Link to="/vendors" className={`text-sm uppercase tracking-widest hover:text-white transition-colors ${location.pathname === '/vendors' ? 'text-white' : 'text-white/60'}`}>For Vendors</Link>
                    </div>

                    <div className="hidden md:flex items-center gap-4">
                        <Link to="/login" className="text-sm uppercase tracking-widest text-white/60 hover:text-white transition-colors">Log In</Link>
                        <Link to="/login?mode=signup" className="px-6 py-2 bg-white text-black text-xs font-bold uppercase tracking-widest hover:bg-gray-200 transition-colors">Start Project</Link>
                    </div>

                    {/* Mobile Menu Toggle */}
                    <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                        {isMenuOpen ? <X /> : <Menu />}
                    </button>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="md:hidden absolute top-20 left-0 right-0 bg-black border-b border-white/10 p-6 flex flex-col gap-6 animate-in slide-in-from-top-4">
                        <Link to="/" onClick={() => setIsMenuOpen(false)} className="text-lg font-serif">Home</Link>
                        <Link to="/homeowners" onClick={() => setIsMenuOpen(false)} className="text-lg font-serif">For Homeowners</Link>
                        <Link to="/vendors" onClick={() => setIsMenuOpen(false)} className="text-lg font-serif">For Vendors</Link>
                        <hr className="border-white/10" />
                        <Link to="/login" onClick={() => setIsMenuOpen(false)} className="text-lg font-serif">Log In</Link>
                        <Link to="/login?mode=signup" onClick={() => setIsMenuOpen(false)} className="py-4 bg-white text-black text-center font-bold uppercase tracking-widest">Start Project</Link>
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
                        <h3 className="text-4xl font-serif font-bold mb-6">MCH</h3>
                        <p className="text-white/40 max-w-sm leading-relaxed">
                            The modern operating system for custom home building. We connect visionary homeowners with elite builders, lenders, and architects.
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
                <div className="max-w-7xl mx-auto px-6 mt-20 pt-8 border-t border-white/5 text-center text-white/20 text-xs uppercase tracking-widest">
                    © {new Date().getFullYear()} MyCustomHome. All rights reserved.
                </div>
            </footer>
        </div>
    );
};
