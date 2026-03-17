import { useEffect, useState } from "react";
import {
    User, Mail, ShieldCheck, Key, Camera, Save, LogOut,
    ShieldAlert, X, Eye, EyeOff, Lock, CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/useAuth";
import { Loading } from "@/lib/loader";

export default function ProfilePage() {
    const [isEditing, setIsEditing] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const { fetchUser, isLoading, user, logout } = useAuthStore();

    useEffect(() => {
        fetchUser();
    }, [fetchUser])

    if (isLoading) {
        return <Loading fullPage />
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10 pt-4 px-4">

            {/* Header Section */}
            <div className="flex flex-col md:flex-row items-center gap-6 p-8 border-b border-slate-200 ">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 opacity-50 transition-transform group-hover/header:scale-110 duration-700" />

                <div className="relative">
                    <div className="w-24 h-24 rounded-3xl bg-linear-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white text-3xl font-black shadow-xl shadow-blue-100 ring-4 ring-white">
                        {user?.name[0]}
                    </div>
                    <button className="absolute -bottom-2 -right-2 p-2 bg-white rounded-xl shadow-lg border border-slate-100 text-slate-600 hover:text-blue-600 hover:scale-110 transition-all">
                        <Camera size={16} />
                    </button>
                </div>

                <div className="flex-1 text-center md:text-left">
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight">{user?.name}</h1>
                    <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-2">
                        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest border border-blue-100">
                            <ShieldCheck size={12} /> {user?.role}
                        </span>
                    </div>
                </div>

                <button onClick={logout} className="px-6 py-3 bg-rose-50 text-rose-600 border border-rose-100 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all flex items-center gap-2 group">
                    <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" /> Sign Out
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm relative">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                <User size={16} className="text-blue-500" /> Account Details
                            </h3>
                            <button
                                onClick={() => setIsEditing(!isEditing)}
                                className={cn(
                                    "text-xs font-black uppercase tracking-widest px-4 py-2 rounded-xl transition-all",
                                    isEditing ? "bg-slate-100 text-slate-600" : "text-blue-600 hover:bg-blue-50"
                                )}
                            >
                                {isEditing ? "Cancel" : "Edit Profile"}
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                                <div className="relative group">
                                    <input
                                        type="text"
                                        disabled={!isEditing}
                                        defaultValue={user?.name}
                                        className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:ring-4 focus:ring-blue-50 focus:border-blue-200 outline-none transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                                    />
                                    <User className="absolute left-4 top-4 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={18} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                                <div className="relative group">
                                    <input
                                        type="email"
                                        disabled={!isEditing}
                                        defaultValue={user?.email}
                                        className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:ring-4 focus:ring-blue-50 focus:border-blue-200 outline-none transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                                    />
                                    <Mail className="absolute left-4 top-4 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={18} />
                                </div>
                            </div>
                        </div>

                        {isEditing && (
                            <button className="mt-10 w-full md:w-auto px-10 py-4 bg-blue-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-100 transition-all transform active:scale-95">
                                <Save size={16} /> Save Changes
                            </button>
                        )}
                    </div>

                    {/* Security Section */}
                    <div className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
                            <Lock size={16} className="text-amber-500" /> Security & Access
                        </h3>
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 rounded-[1.5rem] bg-slate-50 border border-slate-100 group">
                            <div className="flex gap-4 items-center">
                                <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-100 text-amber-500">
                                    <Key size={20} />
                                </div>
                                <div>
                                    <p className="text-sm font-black text-slate-800 uppercase tracking-tight">Password Management</p>
                                    <p className="text-[11px] text-slate-400 font-bold mt-0.5">Last updated 3 months ago</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowPasswordModal(true)}
                                className="px-6 py-3 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all shadow-sm"
                            >
                                Update Password
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                    <div className="bg-slate-900 rounded-[2rem] p-8 text-white shadow-xl relative overflow-hidden group">
                        <ShieldAlert className="absolute -right-6 -bottom-6 w-32 h-32 text-white/5 group-hover:rotate-12 transition-transform duration-1000" />
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] mb-6 text-slate-500">System Permissions</h3>
                        <div className="space-y-4">
                            {['Inventory Control', 'Financial Audit', 'User Management', 'Branch Configuration'].map((perm) => (
                                <div key={perm} className="flex items-center gap-3">
                                    <CheckCircle2 size={16} className="text-blue-400" />
                                    <span className="text-xs font-bold text-slate-300">{perm}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-emerald-50 rounded-[2rem] border border-emerald-100 p-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-100/50 rounded-full -mr-12 -mt-12" />
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] mb-3 text-emerald-600">Connection Status</h3>
                        <p className="text-[11px] font-bold text-emerald-800/80 leading-relaxed uppercase tracking-tight">
                            Main Branch Server: <span className="text-emerald-600">Online</span>
                        </p>
                        <div className="mt-4 flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 rounded-lg w-fit">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Secure Sync Active</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Password Modal */}
            <PasswordUpdateModal
                isOpen={showPasswordModal}
                onClose={() => setShowPasswordModal(false)}
            />
        </div>
    );
}

// 2. Separate Password Modal Component
function PasswordUpdateModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const [showPass, setShowPass] = useState(false);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />

            <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl relative z-10 p-8 border border-slate-200 animate-in zoom-in-95 slide-in-from-bottom-8 duration-300">
                <button onClick={onClose} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all">
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
                                className="w-full pl-11 pr-11 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-blue-50 focus:border-blue-200 outline-none transition-all"
                                placeholder="••••••••"
                            />
                            <Lock className="absolute left-4 top-4 text-slate-300" size={18} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">New Password</label>
                        <div className="relative group">
                            <input
                                type={showPass ? "text" : "password"}
                                className="w-full pl-11 pr-11 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-blue-50 focus:border-blue-200 outline-none transition-all"
                                placeholder="Min. 8 characters"
                            />
                            <Lock className="absolute left-4 top-4 text-slate-300" size={18} />
                            <button
                                type="button"
                                onClick={() => setShowPass(!showPass)}
                                className="absolute right-4 top-4 text-slate-300 hover:text-slate-600 transition-colors"
                            >
                                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <button className="w-full mt-4 py-4 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-blue-600 transition-all shadow-xl shadow-slate-100 active:scale-95">
                        Confirm Changes
                    </button>
                </form>
            </div>
        </div>
    );
}