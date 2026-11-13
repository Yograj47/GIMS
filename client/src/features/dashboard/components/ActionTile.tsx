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
            className="flex min-h-14 w-full items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white p-3 transition-colors hover:border-brand-500 hover:bg-brand-50"
        >
            <div className="flex min-w-0 items-center gap-2">
                <div className={cn(
                    "shrink-0 rounded-lg p-2 text-white",
                    color
                )}>
                    {icon}
                </div>
                <div className="text-left justify-center">
                    <span className="block font-bold text-[12px] text-slate-900 uppercase tracking-tight">
                        {label}
                    </span>
                </div>
            </div>

            <div className="flex items-center">
                <ChevronRight
                    size={16}
                    className="text-slate-400"
                />
            </div>
        </button>
    );
}
