"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Loader2, SearchX } from "lucide-react";

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

    console.log(users);


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
        <div className="min-h-full space-y-6 animate-in fade-in duration-500 pb-10">

            {/* THEMED HEADER */}
            <div className="flex justify-between items-end border-b border-slate-100 pb-2">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">
                        Access Control<span className="text-blue-600">.</span>
                    </h1>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Personnel Management System</p>
                </div>
            </div>

            {/* THEMED TABLE CONTAINER */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm min-h-100 flex flex-col">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-white sticky top-0 z-40 border-b border-slate-200">
                        <tr className="text-[10px] font-black uppercase text-slate-500">
                            <th className="px-6 py-5">Personnel</th>
                            <th className="px-6 py-5">Clearance</th>
                            <th className="px-6 py-5 text-center">Status</th>
                            <th className="px-6 py-5 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 flex-1 overflow-auto">
                        {isLoading ? (
                            // LOADING STATE
                            <tr>
                                <td colSpan={4} className="py-20 text-center">
                                    <div className="flex flex-col items-center justify-center gap-3">
                                        <div className="relative">
                                            <Loader2 className="animate-spin text-blue-600" size={32} strokeWidth={2.5} />
                                            <div className="absolute inset-0 blur-sm bg-blue-400/20 animate-pulse rounded-full" />
                                        </div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Synchronizing Database...</p>
                                    </div>
                                </td>
                            </tr>
                        ) : users?.length === 0 ? (
                            // EMPTY STATE
                            <tr>
                                <td colSpan={4} className="py-24 text-center">
                                    <div className="flex flex-col items-center justify-center gap-4">
                                        <div className="w-16 h-16 rounded-3xl bg-slate-50 flex items-center justify-center border border-slate-100 shadow-inner">
                                            <SearchX className="text-slate-300" size={32} />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm font-black text-slate-900 uppercase tracking-tight">No Records Identified</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">System database is currently empty</p>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            // DATA STATE
                            users?.map((user) => {

                                return (
                                    <UserListing
                                        key={user._id}
                                        user={user}
                                        isSelf={user._id === currentUser?._id}
                                        isProtected={user.role === "admin" || user.role === "owner"}
                                        handleRoleChange={handleRoleChange}
                                        openDeleteDialog={openDeleteDialog}
                                    />
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Terminal Status Footer */}
            <div className="pt-2 border-t border-slate-100 flex justify-between items-center">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">
                    Terminal Status: {isLoading ? "Updating" : "Ready"}
                </p>
                <div className="flex items-center gap-2">
                    <div className={cn("h-1.5 w-1.5 rounded-full animate-pulse", isLoading ? "bg-amber-500" : "bg-emerald-500")} />
                    <p className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-tighter">
                        {users?.length || 0} Registered Personnel
                    </p>
                </div>
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