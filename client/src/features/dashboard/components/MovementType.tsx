import { cn } from "@/lib/utils";
import { ArrowDownLeft, ArrowUpRight} from "lucide-react";

export default function MovementItem({ name, type, time, user }: any) {
    return (
        <div className="px-8 py-5 flex items-center justify-between hover:bg-slate-50/50 transition-all cursor-pointer group">
            <div className="flex items-center gap-4">
                <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110",
                    type === 'IN' ? "bg-indigo-50 text-indigo-600" : "bg-emerald-50 text-emerald-600"
                )}>
                    {type === 'IN' ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                </div>
                <div>
                    <p className="text-sm font-black text-slate-700">{name}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{user} • {time}</p>
                </div>
            </div>
        </div>
    );
}