"use client";

import { Trash2, Check, AlertTriangle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { UserData } from "@/types/Auth";

interface UserListingProps {
  user: UserData;
  isSelf: boolean;
  isProtected: boolean;
  handleRoleChange: (userId: string, newRole: string) => void;
  openDeleteDialog: (id: string, name: string) => void;
}

export default function UserListing({ user, isSelf, isProtected, handleRoleChange, openDeleteDialog }: UserListingProps) {
  return (
    <tr className="group hover:bg-slate-50/50 transition-colors">
      <td className="px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-600 text-white flex items-center justify-center font-black text-xs shadow-sm group-hover:bg-blue-600 transition-colors">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-black text-slate-800 uppercase tracking-tight">{user.name}</p>
            <p className="text-[10px] font-bold text-blue-600/60 font-mono tracking-tighter lowercase">{user.email}</p>
          </div>
        </div>
      </td>

      <td className="px-6 py-5">
        <Select
          defaultValue={user.role}
          onValueChange={(value) => handleRoleChange(user._id, value)}
          disabled={isProtected || isSelf}
        >
          <SelectTrigger className="h-9 w-32 rounded-xl border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-600">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="owner">Owner</SelectItem>
            <SelectItem value="staff">Staff</SelectItem>
          </SelectContent>
        </Select>
      </td>

      <td className="px-6 py-5">
        <div className="flex justify-center">
          <div className={cn(
            "flex items-center gap-1.5 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border",
            user.isVerified ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-amber-50 text-amber-600 border-amber-100"
          )}>
            {user.isVerified ? <Check size={12} /> : <AlertTriangle size={12} />}
            {user.isVerified ? "Verified" : "Pending"}
          </div>
        </div>
      </td>

      <td className="px-6 py-5 text-right">
        <Button
          onClick={() => openDeleteDialog(user._id, user.name)}
          variant="ghost"
          size="sm"
          disabled={isProtected || isSelf}
          className="hover:text-rose-600"
        >
          <Trash2 size={16} />
        </Button>
      </td>
    </tr>
  );
}