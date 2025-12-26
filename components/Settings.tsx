import React, { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';
import {
    User, Mail, MapPin, Phone, LogOut, Camera,
    Save, Shield, CreditCard, Layers, Fingerprint
} from 'lucide-react';

export const Settings: React.FC = () => {
    const { user, logout, updateProfile } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: user?.name || '',
        bio: user?.bio || '',
        phone: user?.phone || '',
        city: user?.city || '',
    });

    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!user) return null;

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsLoading(true);
        try {
            const fileName = `${user.id}-${Date.now()}`;
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(fileName, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(fileName);

            await updateProfile({ avatarUrl: publicUrl });
        } catch (error) {
            console.error('Avatar upload failed:', error);
            alert('Failed to update avatar.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        setIsLoading(true);
        try {
            await updateProfile({
                name: formData.name, // Note: AuthContext might need to sync this to auth.users metadata if we want perfection, but simple profile update is fine for now.
                bio: formData.bio,
                phone: formData.phone,
                city: formData.city, // Updating city might re-trigger scouting, which is fine.
            });
            setIsEditing(false);
        } catch (error) {
            console.error('Profile update failed:', error);
            alert('Failed to save profile.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white p-6 md:p-12 pb-32 flex flex-col items-center">

            {/* Header */}
            <div className="w-full max-w-2xl mb-12 flex justify-between items-end">
                <div className="space-y-2">
                    <h2 className="text-4xl md:text-5xl font-serif tracking-tighter">Identity</h2>
                    <div className="h-[1px] w-12 bg-white/30"></div>
                    <p className="text-[10px] uppercase tracking-[0.3em] text-white/40">Access Card & Clearance</p>
                </div>
                <button
                    onClick={logout}
                    className="group flex items-center gap-2 px-6 py-3 border border-red-500/20 hover:bg-red-500/10 rounded-full transition-all"
                >
                    <span className="text-[10px] uppercase tracking-widest text-red-400 group-hover:text-red-300">Log Out</span>
                    <LogOut size={14} className="text-red-400 group-hover:text-red-300" />
                </button>
            </div>

            {/* ID Card */}
            <div className="w-full max-w-2xl relative group perspective-1000">
                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 via-purple-500/20 to-blue-500/20 rounded-3xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>

                <div className="relative bg-[#0A0A0A] border border-white/10 rounded-3xl overflow-hidden p-8 md:p-12 shadow-2xl backdrop-blur-xl">
                    {/* Holographic Texture */}
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none"></div>
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/5 blur-3xl rounded-full pointer-events-none"></div>

                    <div className="relative z-10 flex flex-col md:flex-row gap-8 md:gap-12 items-start">

                        {/* Avatar Section */}
                        <div className="flex flex-col items-center gap-4">
                            <div className="relative w-32 h-32 rounded-2xl overflow-hidden border border-white/10 shadow-lg group-hover:border-white/30 transition-all bg-black">
                                <img
                                    src={user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`}
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                />
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
                                >
                                    <Camera className="text-white w-8 h-8" />
                                </div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleAvatarUpload}
                                    className="hidden"
                                    accept="image/*"
                                />
                                {isLoading && (
                                    <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                                        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                <span className="text-[9px] uppercase tracking-widest text-emerald-500 font-bold">Clearance Level 1</span>
                            </div>
                        </div>

                        {/* Details Section */}
                        <div className="flex-1 w-full space-y-6">

                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-xs uppercase tracking-[0.2em] text-white/40 mb-1">Operative Name</h3>
                                    {isEditing ? (
                                        <input
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            className="bg-white/5 border border-white/10 rounded px-3 py-2 text-xl font-serif text-white w-full focus:outline-none focus:border-white/30"
                                        />
                                    ) : (
                                        <h2 className="text-3xl font-serif text-white tracking-wide">{user.name}</h2>
                                    )}
                                </div>
                                <div className="text-right">
                                    <Fingerprint className="text-white/10 w-12 h-12" />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="p-4 bg-white/[0.03] border border-white/5 rounded-xl">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-[9px] uppercase tracking-widest text-white/40 flex items-center gap-2">
                                            <Layers size={10} /> Bio / Status
                                        </span>
                                    </div>
                                    {isEditing ? (
                                        <textarea
                                            value={formData.bio}
                                            onChange={e => setFormData({ ...formData, bio: e.target.value })}
                                            className="w-full bg-transparent border-none focus:ring-0 text-sm text-zinc-300 resize-none h-20 placeholder:text-zinc-700"
                                            placeholder="Enter your bio..."
                                        />
                                    ) : (
                                        <p className="text-sm text-zinc-400 italic leading-relaxed">
                                            {user.bio || "No status update set."}
                                        </p>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-3 bg-white/[0.03] border border-white/5 rounded-lg flex items-center gap-3">
                                        <Mail size={14} className="text-zinc-500" />
                                        <div className="overflow-hidden">
                                            <p className="text-[8px] uppercase tracking-widest text-zinc-600">Comms</p>
                                            <p className="text-xs text-zinc-300 truncate">{user.email}</p>
                                        </div>
                                    </div>
                                    <div className="p-3 bg-white/[0.03] border border-white/5 rounded-lg flex items-center gap-3">
                                        <MapPin size={14} className="text-zinc-500" />
                                        <div>
                                            <p className="text-[8px] uppercase tracking-widest text-zinc-600">Location</p>
                                            {isEditing ? (
                                                <input
                                                    value={formData.city}
                                                    onChange={e => setFormData({ ...formData, city: e.target.value })}
                                                    className="bg-transparent border-b border-white/10 text-xs text-zinc-300 w-full focus:outline-none focus:border-white/50"
                                                />
                                            ) : (
                                                <p className="text-xs text-zinc-300">{user.city || 'Unknown Sector'}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-white/5 flex gap-4">
                                {isEditing ? (
                                    <>
                                        <button
                                            onClick={handleSave}
                                            disabled={isLoading}
                                            className="flex-1 py-3 bg-white text-black font-bold uppercase tracking-widest text-xs rounded hover:bg-white/90 transition-colors flex items-center justify-center gap-2"
                                        >
                                            {isLoading ? 'Saving...' : <><Save size={14} /> Update Identity</>}
                                        </button>
                                        <button
                                            onClick={() => setIsEditing(false)}
                                            className="px-6 py-3 border border-white/10 hover:bg-white/5 text-xs uppercase tracking-widest rounded transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="flex-1 py-3 bg-white/[0.05] hover:bg-white text-white hover:text-black border border-white/10 font-bold uppercase tracking-widest text-xs rounded transition-all flex items-center justify-center gap-2"
                                    >
                                        Edit Profile
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Footer Deco */}
                    <div className="mt-8 pt-6 border-t border-white/5 flex justify-between items-center opacity-50">
                        <div className="flex gap-4">
                            <CreditCard size={14} className="text-zinc-600" />
                            <Shield size={14} className="text-zinc-600" />
                        </div>
                        <p className="text-[8px] uppercase tracking-[0.3em] text-zinc-600">Encrypted • Secure • Private</p>
                    </div>

                </div>
            </div>
        </div>
    );
};
