import { cn } from "@/lib/utils";
import { ArrowDownLeft, ArrowUpRight, ChevronRight } from "lucide-react";

export default function MovementItem({ name, qty, type, time, user }: any) {
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
            <div className="text-right flex items-center gap-4">
                <div>
                    <p className={cn("text-base font-black", type === 'IN' ? "text-indigo-600" : "text-emerald-600")}>{qty}</p>
                    <p className="text-[9px] font-black text-slate-300 uppercase leading-none">{type === 'IN' ? 'Stock Added' : 'Stock Sold'}</p>
                </div>
                <ChevronRight size={14} className="text-slate-200 opacity-0 group-hover:opacity-100 transition-all" />
            </div>
        </div>
    );
}