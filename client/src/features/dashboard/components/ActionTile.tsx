import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import React from "react";

interface ActionTileProps {
    icon: React.ReactNode;
    label: string;
    color: string;
    onClick: () => void;
}

export default function ActionTile({ icon, label, color, onClick }: ActionTileProps) {
    return (
        <button
            onClick={onClick}
            className="w-full p-4 rounded-xl bg-white border border-slate-300 flex items-center justify-between group transition-all duration-200 hover:border-blue-500 hover:shadow-md active:scale-[0.98] relative overflow-hidden"
        >
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="flex items-center gap-4">
                <div className={cn(
                    "p-2 rounded-lg text-white shadow-md transition-transform group-hover:scale-110",
                    color
                )}>
                    {icon}
                </div>
                <div className="text-left justify-center">
                    <span className="block font-bold text-[12px] text-slate-900 uppercase tracking-tight">
                        {label}
                    </span>
                    <span className="block text-[9px] font-bold text-slate-600 uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity">
                        Execute Command
                    </span>
                </div>
            </div>

            <div className="flex items-center">
                <ChevronRight
                    size={16}
                    className="text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all"
                />
            </div>
        </button>
    );
}