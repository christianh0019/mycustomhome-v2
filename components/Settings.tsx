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
        legalBusinessName: user?.legalBusinessName || '',
        friendlyBusinessName: user?.friendlyBusinessName || '',
        businessEmail: user?.businessEmail || '',
        businessPhone: user?.businessPhone || '',
        businessAddress: user?.businessAddress || '',
        website: user?.website || '',
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
                legalBusinessName: formData.legalBusinessName,
                friendlyBusinessName: formData.friendlyBusinessName,
                businessEmail: formData.businessEmail,
                businessPhone: formData.businessPhone,
                businessAddress: formData.businessAddress,
                website: formData.website,
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
        <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-white p-6 md:p-12 pb-32 flex flex-col items-center transition-colors duration-300">

            {/* Header */}
            <div className="w-full max-w-2xl mb-12 flex justify-between items-end">
                <div className="space-y-2">
                    <h2 className="text-4xl md:text-5xl font-serif tracking-tighter">
                        {user.role === 'vendor' ? 'Business Profile' : 'Identity'}
                    </h2>
                    <div className="h-[1px] w-12 bg-zinc-300 dark:bg-white/30"></div>
                    <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 dark:text-white/40">
                        {user.role === 'vendor' ? 'Company Settings & Public Info' : 'Access Card & Clearance'}
                    </p>
                </div>
                <button
                    onClick={logout}
                    className="group flex items-center gap-2 px-6 py-3 border border-red-500/20 hover:bg-red-500/10 rounded-full transition-all"
                >
                    <span className="text-[10px] uppercase tracking-widest text-red-400 group-hover:text-red-300">Log Out</span>
                    <LogOut size={14} className="text-red-400 group-hover:text-red-300" />
                </button>
            </div>

            {/* ID Card / Business Card */}
            <div className="w-full max-w-2xl relative group perspective-1000">
                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 via-purple-500/20 to-blue-500/20 rounded-3xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>

                <div className="relative bg-white dark:bg-[#0A0A0A] border border-zinc-200 dark:border-white/10 rounded-3xl overflow-hidden p-8 md:p-12 shadow-2xl backdrop-blur-xl transition-colors duration-300">
                    {/* Holographic Texture */}
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none"></div>
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/5 blur-3xl rounded-full pointer-events-none"></div>

                    <div className="relative z-10 flex flex-col md:flex-row gap-8 md:gap-12 items-start">

                        {/* Avatar / Logo Section */}
                        <div className="flex flex-col items-center gap-4">
                            <div className="relative w-32 h-32 rounded-2xl overflow-hidden border border-white/10 shadow-lg group-hover:border-white/30 transition-all bg-black">
                                <img
                                    src={user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.friendlyBusinessName || user.name)}&background=random`}
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
                                <span className="text-[9px] uppercase tracking-widest text-emerald-500 font-bold">
                                    {user.role === 'vendor' ? 'Verified Business' : 'Clearance Level 1'}
                                </span>
                            </div>
                        </div>

                        {/* Details Section */}
                        <div className="flex-1 w-full space-y-8">

                            {/* Main Identity */}
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-xs uppercase tracking-[0.2em] text-zinc-400 dark:text-white/40 mb-1">
                                        {user.role === 'vendor' ? 'Company Name' : 'Operative Name'}
                                    </h3>
                                    {isEditing ? (
                                        <div className="space-y-4">
                                            {user.role === 'vendor' ? (
                                                <>
                                                    <div>
                                                        <label className="text-[10px] uppercase tracking-widest text-zinc-500 dark:text-zinc-500 mb-1 block">Friendly Business Name</label>
                                                        <input
                                                            value={formData.friendlyBusinessName}
                                                            onChange={e => setFormData({ ...formData, friendlyBusinessName: e.target.value })}
                                                            className="bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded px-3 py-2 text-xl font-serif text-zinc-900 dark:text-white w-full focus:outline-none focus:border-zinc-400 dark:focus:border-white/30"
                                                            placeholder="e.g. Acme Builders"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] uppercase tracking-widest text-zinc-500 dark:text-zinc-500 mb-1 block">Legal Entity Name</label>
                                                        <input
                                                            value={formData.legalBusinessName}
                                                            onChange={e => setFormData({ ...formData, legalBusinessName: e.target.value })}
                                                            className="bg-transparent border-b border-zinc-300 dark:border-white/10 text-sm text-zinc-900 dark:text-white w-full focus:outline-none focus:border-zinc-500 dark:focus:border-white/50"
                                                            placeholder="e.g. Acme Builders, LLC"
                                                        />
                                                    </div>
                                                </>
                                            ) : (
                                                <input
                                                    value={formData.name}
                                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                                    className="bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded px-3 py-2 text-xl font-serif text-zinc-900 dark:text-white w-full focus:outline-none focus:border-zinc-400 dark:focus:border-white/30"
                                                />
                                            )}
                                        </div>
                                    ) : (
                                        <>
                                            <h2 className="text-3xl font-serif text-zinc-900 dark:text-white tracking-wide">{user.friendlyBusinessName || user.name}</h2>
                                            {user.legalBusinessName && (
                                                <p className="text-[10px] text-zinc-400 uppercase tracking-wider mt-1">{user.legalBusinessName}</p>
                                            )}
                                        </>
                                    )}
                                </div>
                                <div className="text-right">
                                    <Fingerprint className="text-zinc-200 dark:text-white/10 w-12 h-12" />
                                </div>
                            </div>

                            {/* Business Contact Info (Vendor Only) or Personal Info (Homeowner) */}
                            {user.role === 'vendor' ? (
                                <div className="space-y-4">
                                    <h4 className="text-[10px] uppercase tracking-widest text-zinc-400 border-b border-zinc-200 dark:border-white/5 pb-2">Business Contact</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Email */}
                                        <div className="p-3 bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/5 rounded-lg">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Mail size={12} className="text-zinc-400" />
                                                <span className="text-[8px] uppercase tracking-widest text-zinc-500">Email</span>
                                            </div>
                                            {isEditing ? (
                                                <input
                                                    value={formData.businessEmail}
                                                    onChange={e => setFormData({ ...formData, businessEmail: e.target.value })}
                                                    className="bg-transparent w-full text-xs text-zinc-900 dark:text-white focus:outline-none border-b border-zinc-300 dark:border-white/10"
                                                    placeholder="contact@company.com"
                                                />
                                            ) : (
                                                <p className="text-xs text-zinc-900 dark:text-zinc-300 truncate">{user.businessEmail || user.email}</p>
                                            )}
                                        </div>

                                        {/* Phone */}
                                        <div className="p-3 bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/5 rounded-lg">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Phone size={12} className="text-zinc-400" />
                                                <span className="text-[8px] uppercase tracking-widest text-zinc-500">Phone</span>
                                            </div>
                                            {isEditing ? (
                                                <input
                                                    value={formData.businessPhone}
                                                    onChange={e => setFormData({ ...formData, businessPhone: e.target.value })}
                                                    className="bg-transparent w-full text-xs text-zinc-900 dark:text-white focus:outline-none border-b border-zinc-300 dark:border-white/10"
                                                    placeholder="(555) 123-4567"
                                                />
                                            ) : (
                                                <p className="text-xs text-zinc-900 dark:text-zinc-300">{user.businessPhone || user.phone || '—'}</p>
                                            )}
                                        </div>

                                        {/* Address */}
                                        <div className="p-3 bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/5 rounded-lg md:col-span-2">
                                            <div className="flex items-center gap-2 mb-1">
                                                <MapPin size={12} className="text-zinc-400" />
                                                <span className="text-[8px] uppercase tracking-widest text-zinc-500">Registered Address</span>
                                            </div>
                                            {isEditing ? (
                                                <input
                                                    value={formData.businessAddress}
                                                    onChange={e => setFormData({ ...formData, businessAddress: e.target.value })}
                                                    className="bg-transparent w-full text-xs text-zinc-900 dark:text-white focus:outline-none border-b border-zinc-300 dark:border-white/10"
                                                    placeholder="123 Builder Lane, Suite 100"
                                                />
                                            ) : (
                                                <p className="text-xs text-zinc-900 dark:text-zinc-300">{user.businessAddress || user.city || '—'}</p>
                                            )}
                                        </div>

                                        {/* Website */}
                                        <div className="p-3 bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/5 rounded-lg md:col-span-2">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Layers size={12} className="text-zinc-400" />
                                                <span className="text-[8px] uppercase tracking-widest text-zinc-500">Website</span>
                                            </div>
                                            {isEditing ? (
                                                <input
                                                    value={formData.website}
                                                    onChange={e => setFormData({ ...formData, website: e.target.value })}
                                                    className="bg-transparent w-full text-xs text-zinc-900 dark:text-white focus:outline-none border-b border-zinc-300 dark:border-white/10"
                                                    placeholder="https://acmebuilders.com"
                                                />
                                            ) : (
                                                <a href={user.website} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline truncate block">
                                                    {user.website || '—'}
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {/* Homeowner Personal Info Layout (Simplified) */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="p-3 bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/5 rounded-lg flex items-center gap-3">
                                            <Mail size={14} className="text-zinc-400 dark:text-zinc-500" />
                                            <div className="overflow-hidden">
                                                <p className="text-[8px] uppercase tracking-widest text-zinc-500 dark:text-zinc-600">Comms</p>
                                                <p className="text-xs text-zinc-900 dark:text-zinc-300 truncate">{user.email}</p>
                                            </div>
                                        </div>
                                        <div className="p-3 bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/5 rounded-lg flex items-center gap-3">
                                            <MapPin size={14} className="text-zinc-400 dark:text-zinc-500" />
                                            <div>
                                                <p className="text-[8px] uppercase tracking-widest text-zinc-500 dark:text-zinc-600">Location</p>
                                                {isEditing ? (
                                                    <input
                                                        value={formData.city}
                                                        onChange={e => setFormData({ ...formData, city: e.target.value })}
                                                        className="bg-transparent border-b border-zinc-300 dark:border-white/10 text-xs text-zinc-900 dark:text-zinc-300 w-full focus:outline-none focus:border-zinc-500 dark:focus:border-white/50"
                                                    />
                                                ) : (
                                                    <p className="text-xs text-zinc-900 dark:text-zinc-300">{user.city || 'Unknown Sector'}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Bio */}
                            <div className="p-4 bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/5 rounded-xl">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-[9px] uppercase tracking-widest text-zinc-400 dark:text-white/40 flex items-center gap-2">
                                        {user.role === 'vendor' ? 'Company Description' : 'Bio / Status'}
                                    </span>
                                </div>
                                {isEditing ? (
                                    <textarea
                                        value={formData.bio}
                                        onChange={e => setFormData({ ...formData, bio: e.target.value })}
                                        className="w-full bg-transparent border-none focus:ring-0 text-sm text-zinc-900 dark:text-zinc-300 resize-none h-20 placeholder:text-zinc-400 dark:placeholder:text-zinc-700"
                                        placeholder={user.role === 'vendor' ? "Describe your company..." : "Enter your status..."}
                                    />
                                ) : (
                                    <p className="text-sm text-zinc-600 dark:text-zinc-400 italic leading-relaxed">
                                        {user.bio || (user.role === 'vendor' ? "No company description set." : "No status update set.")}
                                    </p>
                                )}
                            </div>


                            <div className="pt-6 border-t border-zinc-200 dark:border-white/5 flex gap-4">
                                {isEditing ? (
                                    <>
                                        <button
                                            onClick={handleSave}
                                            disabled={isLoading}
                                            className="flex-1 py-3 bg-zinc-900 dark:bg-white text-white dark:text-black font-bold uppercase tracking-widest text-xs rounded hover:bg-zinc-800 dark:hover:bg-white/90 transition-colors flex items-center justify-center gap-2"
                                        >
                                            {isLoading ? 'Saving...' : <><Save size={14} /> {user.role === 'vendor' ? 'Update Profile' : 'Update Identity'}</>}
                                        </button>
                                        <button
                                            onClick={() => setIsEditing(false)}
                                            className="px-6 py-3 border border-zinc-300 dark:border-white/10 hover:bg-zinc-100 dark:hover:bg-white/5 text-xs uppercase tracking-widest rounded transition-colors text-zinc-600 dark:text-zinc-400"
                                        >
                                            Cancel
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="flex-1 py-3 bg-zinc-100 dark:bg-white/[0.05] hover:bg-zinc-200 dark:hover:bg-white text-zinc-900 dark:text-white hover:text-black border border-zinc-200 dark:border-white/10 font-bold uppercase tracking-widest text-xs rounded transition-all flex items-center justify-center gap-2"
                                    >
                                        Edit Profile
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Footer Deco */}
                    <div className="mt-8 pt-6 border-t border-zinc-200 dark:border-white/5 flex justify-between items-center opacity-50">
                        <div className="flex gap-4">
                            <CreditCard size={14} className="text-zinc-600" />
                            <Shield size={14} className="text-zinc-600" />
                        </div>
                        <p className="text-[8px] uppercase tracking-[0.3em] text-zinc-600">
                            {user.role === 'vendor' ? 'Verified Partner • Secure' : 'Encrypted • Secure • Private'}
                        </p>
                    </div>

                </div>
            </div>
        </div>
    );
};
