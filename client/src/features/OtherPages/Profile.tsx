import { useEffect, useState } from "react";
import {
    Key, Camera, LogOut, CheckCircle2
} from "lucide-react";
import { useAuthStore } from "@/store/useAuth";
import { Loading } from "@/lib/loader";
import { InputGroup } from "@/components/common/InputGroup";
import { PasswordUpdateModal } from "../auth/components/PasswordUpdateModal";

export default function ProfilePage() {
    const [isEditing, setIsEditing] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const { fetchUser, isLoading, user, logout, updateProfile } = useAuthStore();
    const [updatedData, setUpdatedData] = useState({ userId: user?._id || "", name: user?.name || "", email: user?.email || "" });

    useEffect(() => { fetchUser(); }, [fetchUser]);

    useEffect(() => {
        if (user) {
            setUpdatedData({
                userId: user._id,
                name: user.name,
                email: user.email
            });
        }
    }, [user]);

    const handleProfileUpdate = async () => {
        try {
            await updateProfile(updatedData.userId, updatedData.name, updatedData.email);
            console.log(updatedData);

        } catch (error) {
            console.error("Error updating profile:", error);
        } finally {
            setIsEditing(false);
        }
    };

    const SYSTEM_ACCESS_MAPPING = [
        {
            role: "admin",
            permissions: [
                "Full Inventory Control",
                "Financial Audit & Write",
                "User Management",
                "System Configuration",
                "Security Monitoring",
                "Root Access Control"
            ]
        },
        {
            role: "owner",
            permissions: [
                "Inventory Control", // Maps from product:read/write/delete
                "Vendor Registry",    // Maps from supplier:read/write/delete
                "Financial Audit",    // Maps from transaction:read
                "Data Reporting",     // Maps from report:read
                "Security Monitoring", // Maps from alert:read/write
                "System Configuration" // Maps from generalSetting:read/write
            ]
        },
        {
            role: "staff",
            permissions: [
                "Ledger Management",  // Maps from transaction:read/write/audit
                "Inventory View-Only", // Maps from product:read/category:read
                "Vendor Registry",     // Maps from supplier:read
                "Security Monitoring", // Maps from alert:read/write
                "System Settings View" // Maps from generalSetting:read
            ]
        }
    ];

    const currentAccess = SYSTEM_ACCESS_MAPPING.find(
        (item) => item.role === user?.role?.toLowerCase()
    );

    if (isLoading) return <Loading fullPage />;

    return (
        <div className="h-full bg-[#f1f5f9] p-2 animate-in fade-in duration-700">
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
                                <InputGroup label="Full Name" disabled={!isEditing} value={updatedData.name} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUpdatedData({ ...updatedData, name: e.target.value })} />
                                <InputGroup label="Email Address" disabled={!isEditing} value={updatedData.email} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUpdatedData({ ...updatedData, email: e.target.value })} />
                            </div>

                            {isEditing && (
                                <button onClick={handleProfileUpdate} className="mt-10 px-8 py-4 bg-blue-700 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-blue-600 transition-all shadow-xl shadow-slate-200">
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
                                {currentAccess?.permissions.map((perm) => (
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

            <PasswordUpdateModal isOpen={showPasswordModal} onClose={() => setShowPasswordModal(false)} user={user} />
        </div>
    );
}



