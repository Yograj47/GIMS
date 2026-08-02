import { Trash2, Check, AlertTriangle} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { UserData } from "@/types/auth";

interface UserListingProps {
  user: UserData;
  isSelf: boolean;
  isProtected: boolean;
  handleRoleChange: (userId: string, newRole: string) => void;
  openDeleteDialog: (id: string, name: string) => void;
}

export default function UserListing({ user, isSelf, isProtected, handleRoleChange, openDeleteDialog }: UserListingProps) {
  return (
    <tr className="group hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0">
      {/* 1. PERSONNEL IDENTIFIER (Matched to Product/SKU Style) */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-sm bg-blue-600 text-white flex items-center justify-center shadow-sm transition-colors shrink-0">
            <span className="font-black text-[10px] uppercase">{user.name.charAt(0)}</span>
          </div>
          <div className="flex flex-col">
            <p className="text-[12px] font-black text-slate-600 uppercase tracking-tight leading-none mb-1">
              {user.name} {isSelf && <span className="text-blue-600 ml-1 text-[8px] italic tracking-normal">(Self)</span>}
            </p>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
              UID · {user._id}
            </p>
          </div>
        </div>
      </td>

      {/* 2. CLEARANCE LEVEL (Select aligned with Filter style) */}
      <td className="px-6 py-4">
        <Select
          defaultValue={user.role}
          onValueChange={(value) => handleRoleChange(user._id, value)}
          disabled={isProtected || isSelf}
        >
          <SelectTrigger className="h-8 w-32 rounded-sm border-slate-200 bg-white text-[10px] font-black uppercase tracking-widest text-slate-600 focus:ring-1 focus:ring-blue-500 shadow-none transition-all">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="rounded-sm border-slate-200">
            <SelectItem value="admin" className="text-[10px] font-black uppercase tracking-widest">Admin</SelectItem>
            <SelectItem value="owner" className="text-[10px] font-black uppercase tracking-widest">Owner</SelectItem>
            <SelectItem value="staff" className="text-[10px] font-black uppercase tracking-widest">Staff</SelectItem>
          </SelectContent>
        </Select>
      </td>

      {/* 3. VERIFICATION STATUS (Matched to Stock Status Badges) */}
      <td className="px-6 py-4">
        <div className="flex justify-center">
          <div className={cn(
            "flex items-center gap-1.5 px-2 py-0.5 rounded-sm text-[9px] font-black uppercase tracking-widest border tabular-nums",
            user.isVerified 
              ? "bg-emerald-50 text-emerald-700 border-emerald-100" 
              : "bg-amber-50 text-amber-600 border-amber-100"
          )}>
            {user.isVerified ? <Check size={10} strokeWidth={4} /> : <AlertTriangle size={10} strokeWidth={4} />}
            {user.isVerified ? "Verified" : "Pending"}
          </div>
        </div>
      </td>

      {/* 4. ACTIONS (Matched to Audit History button) */}
      <td className="px-6 py-4 text-right pr-8">
        <Button
          onClick={() => openDeleteDialog(user._id, user.name)}
          variant="ghost"
          size="sm"
          disabled={isProtected || isSelf}
          className="h-8 w-8 p-0 rounded-sm text-slate-300 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-all"
        >
          <Trash2 size={14} strokeWidth={2.5} />
        </Button>
      </td>
    </tr>
  );
}