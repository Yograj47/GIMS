import { useEffect, useState } from "react";
import { AlertTriangle, Loader2, SearchX, ShieldCheck } from "lucide-react";

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
import UserListing from "../components/UserListing";

export default function UserManagement() {
    const { users, fetchUsers, isLoading, updateRole, user: currentUser } = useAuthStore();
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<{ id: string, name: string } | null>(null);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleRoleChange = async (userId: string, newRole: string) => {
        try {
            await updateRole(userId, newRole);
            toast.success("Access Level Updated");
        } catch (error) {
            toast.error("Update Failed");
        }
    };

    const openDeleteDialog = (id: string, name: string) => {
        setUserToDelete({ id, name });
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!userToDelete) return;
        try {
            toast.success(`User ${userToDelete.name} Purged`);
            setIsDeleteDialogOpen(false);
        } catch (error) {
            toast.error("Action Failed");
        }
    };

    return (
        <div className="h-full animate-in fade-in duration-500">
            <div className="max-w-400 mx-auto space-y-6">
                
                {/* 1. PRECISION HEADER (Stock Report Style) */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-slate-200 pb-6">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-blue-600 rounded-sm text-white shadow-sm">
                            <ShieldCheck size={20} />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900 tracking-tight uppercase">
                                Access Control
                            </h1>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                                Personnel Authorization • <span className="text-blue-600 italic">Audit Mode</span>
                            </p>
                        </div>
                    </div>

                    <div className="text-right hidden md:block">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Accounts</p>
                        <p className="text-xl font-black text-slate-900 tabular-nums leading-none">
                            {users?.length || 0}
                        </p>
                    </div>
                </div>

                {/* 2. PRECISION TABLE CONTAINER */}
                <div className="bg-white border border-slate-200 shadow-sm rounded-sm overflow-hidden min-h-100">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50/50 border-b border-slate-200">
                            <tr className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                <th className="px-6 py-4">Personnel / Identifier</th>
                                <th className="px-6 py-4">Clearance Level</th>
                                <th className="px-6 py-4 text-center">Status</th>
                                <th className="px-6 py-4 text-right pr-8">Audit Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={4} className="py-24 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <Loader2 className="animate-spin text-blue-600" size={24} strokeWidth={3} />
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Synchronizing Registry...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : users?.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="py-24 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <SearchX className="text-slate-200" size={32} />
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No Registered Personnel Identified</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                users?.map((user) => (
                                    <UserListing
                                        key={user._id}
                                        user={user}
                                        isSelf={user._id === currentUser?._id}
                                        isProtected={user.role === "admin"}
                                        handleRoleChange={handleRoleChange}
                                        openDeleteDialog={openDeleteDialog}
                                    />
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* 3. TERMINAL STATUS FOOTER */}
                <div className="flex justify-between items-center px-1">
                    <div className="flex items-center gap-3">
                        <div className={cn("h-2 w-2 rounded-full", isLoading ? "bg-amber-500 animate-pulse" : "bg-emerald-500")} />
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">
                            Registry Integrity: {isLoading ? "Scanning" : "Verified"}
                        </span>
                    </div>
                    <span className="text-[9px] font-mono font-bold text-slate-300 uppercase italic">
                        Authorized Access Only
                    </span>
                </div>
            </div>

            {/* Confirmation Dialog - Sharp corners matched */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent className="rounded-sm border-slate-200">
                    <AlertDialogHeader>
                        <div className="w-10 h-10 rounded-sm bg-rose-50 text-rose-600 flex items-center justify-center mb-4 border border-rose-100">
                            <AlertTriangle size={20} />
                        </div>
                        <AlertDialogTitle className="text-lg font-bold text-slate-900 uppercase tracking-tight">
                            Confirm Personnel Removal
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-slate-500 text-xs font-medium">
                            Purging <span className="text-slate-900 font-bold uppercase tracking-tight">{userToDelete?.name}</span> from the system is permanent. This cannot be reversed.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="gap-2 mt-4">
                        <AlertDialogCancel className="rounded-sm border-slate-200 font-bold text-[10px] uppercase tracking-widest h-9 px-4">
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            className="rounded-sm bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] uppercase tracking-widest h-9 px-4"
                        >
                            Delete Records
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}