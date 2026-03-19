import { useEffect, useState } from "react";
import {
    Key, Camera, LogOut,X, Eye, EyeOff, Lock, CheckCircle2
} from "lucide-react";
import { useAuthStore } from "@/store/useAuth";
import { Loading } from "@/lib/loader";

export default function ProfilePage() {
    const [isEditing, setIsEditing] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const { fetchUser, isLoading, user, logout } = useAuthStore();

    useEffect(() => { fetchUser(); }, [fetchUser]);

    if (isLoading) return <Loading fullPage />;

    return (
        <div className="h-full bg-[#f1f5f9] animate-in fade-in duration-700">
            <div className="max-w-5xl mx-auto">
                
                <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-12 pb-12 border-b border-slate-200">
                    <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
                        <div className="relative">
                            <div className="w-24 h-24 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-600 text-3xl font-black overflow-hidden">
                                {user?.name ? user.name[0] : 'U'}
                            </div>
                            <button className="absolute -bottom-1 -right-1 p-2 bg-slate-600 text-white rounded-full shadow-lg hover:bg-blue-600 transition-all border-2 border-white">
                                <Camera size={14} />
                            </button>
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none">{user?.name}</h1>
                            <div className="flex items-center gap-3 mt-3">
                                <span className="px-2.5 py-1 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-md">
                                    {user?.role}
                                </span>
                                <span className="text-slate-500 font-bold text-sm tracking-tight">{user?.email}</span>
                            </div>
                        </div>
                    </div>

                    <button 
                        onClick={logout} 
                        className="px-6 py-3 bg-white border border-slate-200 text-slate-600 hover:text-rose-600 hover:border-rose-200 rounded-2xl transition-all text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-sm"
                    >
                        <LogOut size={16} /> Sign Out
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    
                    {/* --- MAIN CONTENT: Defined White Cards --- */}
                    <div className="lg:col-span-2 space-y-8">
                        <section className="bg-white rounded-[2rem] border border-slate-200 p-10 shadow-sm">
                            <div className="flex justify-between items-center mb-10">
                                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Identity Details</h3>
                                <button
                                    onClick={() => setIsEditing(!isEditing)}
                                    className="text-xs font-black text-blue-600 uppercase tracking-widest hover:underline decoration-2"
                                >
                                    {isEditing ? "Discard Changes" : "Edit Profile"}
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <InputGroup label="Full Name" disabled={!isEditing} value={user?.name} />
                                <InputGroup label="Email Address" disabled={!isEditing} value={user?.email} />
                            </div>

                            {isEditing && (
                                <button className="mt-10 px-8 py-4 bg-blue-700 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-blue-600 transition-all shadow-xl shadow-slate-200">
                                    Save Changes
                                </button>
                            )}
                        </section>

                        <section className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm">
                            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Security Configuration</h3>
                            <div className="flex flex-col md:flex-row items-center justify-between p-6 bg-slate-50 border border-slate-100 rounded-2xl gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-900 border border-slate-200 shadow-sm">
                                        <Key size={20} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-slate-900 uppercase tracking-tight">Login Password</p>
                                        <p className="text-[11px] text-slate-400 font-bold mt-0.5 uppercase tracking-tighter">Active Security Key</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowPasswordModal(true)}
                                    className="w-full md:w-auto px-6 py-3 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-slate-900 transition-all shadow-sm"
                                >
                                    Update Key
                                </button>
                            </div>
                        </section>
                    </div>

                    <div className="space-y-8">
                        <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-slate-300 relative overflow-hidden">
                            <CheckCircle2 className="absolute -right-4 -bottom-4 w-24 h-24 text-white/5" />
                            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-8">System Access</h4>
                            <div className="space-y-5">
                                {['Inventory Control', 'Financial Audit', 'Users Management'].map((perm) => (
                                    <div key={perm} className="flex items-center gap-4 group">
                                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                                            <CheckCircle2 size={14} className="text-blue-400" />
                                        </div>
                                        <span className="text-[11px] font-bold text-slate-200 uppercase tracking-tighter">{perm}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Sync Active</span>
                            </div>
                            <p className="text-xs font-black text-slate-900 uppercase">Primary Node</p>
                            <p className="text-[11px] font-bold text-slate-400 mt-1 font-mono">SECURE_TUNNEL_1.0</p>
                        </div>
                    </div>
                </div>
            </div>

            <PasswordUpdateModal isOpen={showPasswordModal} onClose={() => setShowPasswordModal(false)} />
        </div>
    );
}

function InputGroup({ label, disabled, value }: any) {
    return (
        <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">{label}</label>
            <input
                type="text"
                disabled={disabled}
                defaultValue={value}
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 focus:bg-white focus:ring-4 focus:ring-blue-100/50 focus:border-blue-500 outline-none transition-all disabled:opacity-60"
            />
        </div>
    );
}

function PasswordUpdateModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const [showPass, setShowPass] = useState(false);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
            <div 
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300" 
                onClick={onClose} 
            />

            <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl relative z-10 p-8 border border-slate-200 animate-in zoom-in-95 slide-in-from-bottom-8 duration-300">
                <button 
                    onClick={onClose} 
                    className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
                >
                    <X size={20} />
                </button>

                <div className="mb-8">
                    <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500 mb-4 border border-amber-100">
                        <Key size={24} />
                    </div>
                    <h2 className="text-xl font-black text-slate-800 tracking-tight">Security Update</h2>
                    <p className="text-xs text-slate-400 font-bold mt-1 uppercase tracking-widest">Update your login credentials</p>
                </div>

                <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Current Password</label>
                        <div className="relative group">
                            <input
                                type={showPass ? "text" : "password"}
                                className="w-full pl-11 pr-11 py-3.5 bg-slate-50 border border-slate-300 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-blue-50 focus:border-blue-400 outline-none transition-all"
                                placeholder="••••••••"
                            />
                            <Lock className="absolute left-4 top-4 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={18} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">New Password</label>
                        <div className="relative group">
                            <input
                                type={showPass ? "text" : "password"}
                                className="w-full pl-11 pr-11 py-3.5 bg-slate-50 border border-slate-300 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-blue-50 focus:border-blue-400 outline-none transition-all"
                                placeholder="Min. 8 characters"
                            />
                            <Lock className="absolute left-4 top-4 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={18} />
                            <button
                                type="button"
                                onClick={() => setShowPass(!showPass)}
                                className="absolute right-4 top-4 text-slate-300 transition-colors group-focus-within:text-slate-500"
                            >
                                {showPass ? <EyeOff  size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <button className="w-full mt-4 py-4 bg-blue-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 active:scale-95">
                        Confirm Changes
                    </button>
                </form>
            </div>
        </div>
    );
}