import { notify } from "@/lib/toast";
import { Eye, EyeOff, Key, Lock, X } from "lucide-react";
import { useState } from "react";
import { useUsers } from "../hooks/useUsers";

export function PasswordUpdateModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void; }) {
    const [showPass, setShowPass] = useState(false);
    const { updatePassword } = useUsers();
    const [updatedPassword, setUpdatedPassword] = useState({ currentPassword: "", newPassword: "" });

    const handlePasswordUpdate = async () => {
        try {
            if (updatedPassword.currentPassword === updatedPassword.newPassword) {
                notify.warning("New password cannot be the same as the current password.");
                return;
            }
            await updatePassword(updatedPassword.currentPassword, updatedPassword.newPassword);
        } finally {
            setShowPass(false);
            setUpdatedPassword({ currentPassword: "", newPassword: "" });
            onClose();
        }
    };

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
                                value={updatedPassword?.currentPassword}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUpdatedPassword({ ...updatedPassword, currentPassword: e.target.value })}
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
                                value={updatedPassword?.newPassword}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUpdatedPassword({ ...updatedPassword, newPassword: e.target.value })}
                            />
                            <Lock className="absolute left-4 top-4 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={18} />
                            <button
                                type="button"
                                onClick={() => setShowPass(!showPass)}
                                className="absolute right-4 top-4 text-slate-300 transition-colors group-focus-within:text-slate-500"
                            >
                                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <button onClick={handlePasswordUpdate} className="w-full mt-4 py-4 bg-blue-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 active:scale-95">
                        Confirm Changes
                    </button>
                </form>
            </div>
        </div>
    );
}