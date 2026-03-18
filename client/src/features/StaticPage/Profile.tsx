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
        <div className="max-w-5xl mx-auto py-12 px-6 animate-in fade-in duration-700">
            
            {/* --- MINIMALIST HEADER --- */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-16">
                <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
                    <div className="relative group">
                        <div className="w-24 h-24 rounded-full bg-slate-100 border-2 border-white shadow-sm flex items-center justify-center text-slate-400 text-3xl font-medium overflow-hidden">
                            {user?.name[0]}
                        </div>
                        <button className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-md border border-slate-100 text-slate-400 hover:text-blue-600 transition-all">
                            <Camera size={14} />
                        </button>
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{user?.name}</h1>
                        <p className="text-slate-500 font-medium text-sm mt-1">{user?.email}</p>
                        <span className="inline-block mt-3 px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-widest rounded-md border border-blue-100">
                            {user?.role}
                        </span>
                    </div>
                </div>

                <button 
                    onClick={logout} 
                    className="flex items-center gap-2 px-5 py-2.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all text-sm font-semibold"
                >
                    <LogOut size={18} /> Sign Out
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                
                {/* --- MAIN SETTINGS --- */}
                <div className="lg:col-span-2 space-y-12">
                    <section>
                        <div className="flex justify-between items-end mb-6 border-b border-slate-100 pb-4">
                            <h3 className="text-sm font-bold text-slate-900">Personal Information</h3>
                            <button
                                onClick={() => setIsEditing(!isEditing)}
                                className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors"
                            >
                                {isEditing ? "Cancel" : "Edit Profile"}
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                            <InputGroup label="Full Name" disabled={!isEditing} value={user?.name} />
                            <InputGroup label="Email Address" disabled={!isEditing} value={user?.email} />
                        </div>

                        {isEditing && (
                            <button className="mt-8 px-6 py-3 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-blue-600 transition-all shadow-lg shadow-slate-200">
                                Save Changes
                            </button>
                        )}
                    </section>

                    <section>
                        <h3 className="text-sm font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4">Security</h3>
                        <div className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 shadow-sm">
                                    <Key size={18} />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-700">Password</p>
                                    <p className="text-xs text-slate-500">Last updated 3 months ago</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowPasswordModal(true)}
                                className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-lg hover:border-slate-300 transition-all"
                            >
                                Update
                            </button>
                        </div>
                    </section>
                </div>

                {/* --- SIDE INFO --- */}
                <div className="space-y-8">
                    <div className="p-6 bg-slate-900 rounded-[2rem] text-white">
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-6">Access Level</h4>
                        <div className="space-y-4">
                            {['Inventory', 'Finance', 'Users'].map((perm) => (
                                <div key={perm} className="flex items-center gap-3 text-sm font-medium">
                                    <CheckCircle2 size={16} className="text-blue-400" /> {perm} Access
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="p-6 border border-slate-200 rounded-[2rem]">
                        <div className="flex items-center gap-2 text-emerald-600 mb-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-xs font-bold uppercase tracking-wider">System Status</span>
                        </div>
                        <p className="text-xs text-slate-500 font-medium">Branch Server: 104.22.1.9</p>
                    </div>
                </div>
            </div>

            <PasswordUpdateModal isOpen={showPasswordModal} onClose={() => setShowPasswordModal(false)} />
        </div>
    );
}

function InputGroup({ label, disabled, value }: any) {
    return (
        <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-tight ml-1">{label}</label>
            <input
                type="text"
                disabled={disabled}
                defaultValue={value}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all disabled:bg-slate-50 disabled:text-slate-400"
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