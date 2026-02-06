import { Search, Shield, Mail, UserCircle, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function UserManagement() {
    // Mock data based on your provided images
    const users = [
        { name: "Surendra Yadav", email: "surendra@grocery.local", role: "Owner", status: "Active" },
        { name: "Ram Kumar", email: "ram@grocery.local", role: "Manager", status: "Active" },
        { name: "Sita Sharma", email: "sita@grocery.local", role: "Staff", status: "Active" },
        { name: "John Doe", email: "john@grocery.local", role: "Staff", status: "Inactive" },
    ];

    return (
        <div className="min-h-full space-y-6 animate-in fade-in duration-500 pb-10">
            {/* Header Section */}
            <div className="flex justify-between items-end">
                <div className="space-y-1">
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight">User Management</h1>
                    <p className="text-sm font-medium text-slate-500 italic">View and manage system access levels</p>
                </div>
            </div>

            {/* Search Bar - Professional Slate Style */}
            <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <Input 
                        placeholder="Search users by name, email or role..." 
                        className="pl-10 h-11 border-none bg-transparent font-medium focus-visible:ring-0 shadow-none text-slate-600"
                    />
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                            <th className="px-6 py-4">Name</th>
                            <th className="px-6 py-4">Email</th>
                            <th className="px-6 py-4">Role</th>
                            <th className="px-6 py-4 text-center">Status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {users.map((user, idx) => (
                            <tr key={idx} className="group hover:bg-slate-50/30 transition-colors">
                                <td className="px-6 py-5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
                                            <UserCircle size={20} />
                                        </div>
                                        <span className="text-sm font-bold text-slate-700">{user.name}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <div className="flex items-center gap-2 text-slate-500">
                                        <Mail size={14} className="text-slate-300" />
                                        <span className="text-xs font-medium">{user.email}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <div className="flex items-center gap-1.5 text-slate-600">
                                        <Shield size={14} className="text-indigo-400" />
                                        <span className="text-xs font-bold">{user.role}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <div className="flex justify-center">
                                        <span className={cn(
                                            "px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-tight",
                                            user.status === 'Active' 
                                                ? "bg-emerald-50 text-emerald-600" 
                                                : "bg-slate-100 text-slate-400"
                                        )}>
                                            {user.status}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-5 text-right">
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="rounded-xl h-9 w-9 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Pagination Footer - Matches Reports & Transactions */}
                <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Page 1 of 2 (20 users)
                    </span>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="h-9 w-9 rounded-xl border-slate-200 p-0 text-slate-400" disabled>
                            <ChevronLeft size={18} />
                        </Button>
                        <Button size="sm" className="h-9 w-9 rounded-xl bg-indigo-600 text-white font-black text-xs shadow-md shadow-indigo-100">
                            1
                        </Button>
                        <Button variant="outline" size="sm" className="h-9 w-9 rounded-xl border-slate-200 text-slate-600 font-black text-xs hover:bg-white hover:text-indigo-600">
                            2
                        </Button>
                        <Button variant="outline" size="sm" className="h-9 w-9 rounded-xl border-slate-200 p-0 text-slate-600 hover:bg-white hover:text-indigo-600">
                            <ChevronRight size={18} />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}