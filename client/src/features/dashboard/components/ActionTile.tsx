import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";

export default function ActionTile({ icon, label, color }: any) {
    return (
        <button className="w-full p-5 rounded-2xl bg-white border border-slate-300 flex items-center justify-between group hover:border-indigo-500 transition-all hover:shadow-lg active:scale-95">
            <div className="flex items-center gap-4">
                <div className={cn("p-2 rounded-xl text-white shadow-md", color)}>
                    {icon}
                </div>
                <span className="text-sm font-black text-slate-700">{label}</span>
            </div>
            <ChevronRight size={18} className="text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
        </button>
    );
}