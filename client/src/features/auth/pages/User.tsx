"use client";

import { useEffect, useState } from "react";
import { Search, Trash2, Loader2, Check, AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useAuthStore } from "@/store/useAuth";

export default function UserManagement() {
    const { users, fetchUsers, isLoading, updateRole, user: currentUser } = useAuthStore();
    const [searchTerm, setSearchTerm] = useState("");

    // State for Delete Dialog
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<{ id: string, name: string } | null>(null);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleRoleChange = async (userId: string, newRole: string) => {
        try {
            await updateRole(userId, newRole);
            toast.success("User role updated successfully");
        } catch (error) {
            toast.error("Failed to update role");
        }
    };

    const openDeleteDialog = (id: string, name: string) => {
        setUserToDelete({ id, name });
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!userToDelete) return;

        try {
            toast.success(`User ${userToDelete.name} deleted`);
            setIsDeleteDialogOpen(false);
        } catch (error) {
            toast.error("Failed to delete user");
        }
    };

    const filteredUsers = users?.filter(u =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    return (
        <div className="min-h-full space-y-6 animate-in fade-in duration-500 pb-10">
            {/* Header & Search (Same as before) */}
            <div className="flex justify-between items-end">
                <div className="space-y-1">
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight">User Management</h1>
                    <p className="text-sm font-medium text-slate-500 italic">Manage access levels and permissions</p>
                </div>
                {isLoading && <Loader2 className="animate-spin text-indigo-600" size={20} />}
            </div>

            <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <Input
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search users..."
                        className="pl-10 h-11 border-none bg-transparent font-medium focus-visible:ring-0 shadow-none text-slate-600"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                            <th className="px-6 py-4">User Details</th>
                            <th className="px-6 py-4">Role Assignment</th>
                            <th className="px-6 py-4 text-center">Verification</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {filteredUsers.map((user) => (
                            <tr key={user._id} className="group hover:bg-slate-50/30 transition-colors">
                                <td className="px-6 py-5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center border border-slate-200 uppercase font-bold text-xs">
                                            {user.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-700">{user.name}</p>
                                            <p className="text-[11px] font-medium text-slate-400">{user.email}</p>
                                        </div>
                                    </div>
                                </td>

                                <td className="px-6 py-5">
                                    <Select
                                        defaultValue={user.role}
                                        onValueChange={(value) => handleRoleChange(user._id, value)}
                                        disabled={user.role === "admin" || user.role === "owner" || user._id === currentUser?._id} // Prevent changing role of Admin/Owner or self
                                    >
                                        <SelectTrigger className="h-9 w-32.5 rounded-xl border-slate-200 text-xs font-bold text-slate-600">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl border-slate-200" >
                                            <SelectItem value="admin" className="text-xs font-bold text-rose-600">Admin</SelectItem>
                                            <SelectItem value="owner" className="text-xs font-bold text-indigo-600">Owner</SelectItem>
                                            <SelectItem value="staff" className="text-xs font-bold text-slate-600">Staff</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </td>

                                <td className="px-6 py-5">
                                    <div className="flex justify-center">
                                        <div className={cn(
                                            "flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tight",
                                            user.isVerified ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                                        )}>
                                            {user.isVerified && <Check size={12} />}
                                            {user.isVerified ? "Verified" : "Pending"}
                                        </div>
                                    </div>
                                </td>

                                <td className="px-6 py-5 text-right">
                                    <Button
                                        onClick={() => openDeleteDialog(user._id, user.name)}
                                        variant="ghost"
                                        size="sm"
                                        disabled={user.role === "admin" || user.role === "owner" || user._id === currentUser?._id} // Prevent changing role of Admin/Owner or self
                                        className="rounded-xl h-9 w-9 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50 disabled:pointer-events-none disabled:opacity-50"
                                    >
                                        <Trash2 size={16} />
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Confirmation Dialog */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent className="rounded-2xl border-slate-200">
                    <AlertDialogHeader>
                        <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
                            <AlertTriangle size={24} />
                        </div>
                        <AlertDialogTitle className="text-xl font-black text-slate-800">
                            Are you absolutely sure?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-slate-500 font-medium">
                            This will permanently delete <span className="text-slate-900 font-bold">{userToDelete?.name}</span> and remove their access to the system. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="gap-2">
                        <AlertDialogCancel className="rounded-xl border-slate-200 font-bold text-slate-600">
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold"
                        >
                            Delete User
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}