import { Trash2, Check, AlertTriangle} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { UserData } from "@/types/user";

interface UserListingProps {
  user: UserData;
  isSelf: boolean;
  isProtected: boolean;
  handleRoleChange: (userId: string, newRole: string) => void;
  openDeleteDialog: (id: string, name: string) => void;
}

export default function UserListing({ user, isSelf, isProtected, handleRoleChange, openDeleteDialog }: UserListingProps) {
  return (
    <tr data-record className="group hover:bg-muted transition-colors border-b border-slate-50 last:border-0">
      <td className="px-3 py-3 sm:px-5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-sm bg-brand-600 text-white flex items-center justify-center shadow-sm transition-colors shrink-0">
            <span className="font-black text-[10px] uppercase">{user.name.charAt(0)}</span>
          </div>
          <div className="flex flex-col">
            <p className="text-sm font-semibold text-foreground">
              {user.name} {isSelf && <span className="text-link ml-1 text-[8px] italic tracking-normal">(Self)</span>}
            </p>
            <p className="text-xs text-muted-foreground">
              {user.email}
            </p>
          </div>
        </div>
      </td>

      <td className="px-3 py-3 sm:px-5">
        <Select
          value={user.role}
          onValueChange={(value) => handleRoleChange(user._id, value)}
          disabled={isProtected || isSelf}
        >
          <SelectTrigger aria-label={`Role for ${user.name}`} className="h-8 w-32 rounded-sm border-border bg-card text-[10px] font-black uppercase tracking-widest text-muted-foreground focus:ring-1 focus:ring-brand-500 shadow-none transition-all">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="rounded-sm border-border">
            <SelectItem value="admin" className="text-[10px] font-black uppercase tracking-widest">Admin</SelectItem>
            <SelectItem value="owner" className="text-[10px] font-black uppercase tracking-widest">Owner / Manager</SelectItem>
            <SelectItem value="staff" className="text-[10px] font-black uppercase tracking-widest">Staff</SelectItem>
            <SelectItem value="accountant">Accountant</SelectItem>
            <SelectItem value="customer">Customer</SelectItem>
          </SelectContent>
        </Select>
      </td>

      <td className="px-3 py-3 sm:px-5">
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

      <td className="px-3 py-3 sm:px-5 text-right pr-8">
        <Button
          aria-label={`Delete ${user.name}`}
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