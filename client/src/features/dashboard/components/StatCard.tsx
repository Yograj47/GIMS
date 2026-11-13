import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
    title: string;
    value: string | number;
    desc: string;
    trend?: string;
    trendUp?: boolean;
    icon: React.ReactNode;
    color: string;
    bgColor: string;
}

export default function StatCard({ title, value, desc, trend, trendUp, icon, color, bgColor }: StatCardProps) {
    return (
        <Card className="min-w-0 border-slate-200 bg-white py-0 shadow-none">
            <CardContent className="p-4 sm:p-5">
                <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
                    <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center shadow-sm", bgColor, color)}>
                        {icon}
                    </div>
                    {trend && <div className={cn("rounded-md px-2 py-1 text-xs font-medium",
                        trendUp ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-rose-50 text-rose-600 border border-rose-100")}>
                        {trend}
                    </div>}
                </div>
                <h2 className="text-sm font-medium text-slate-600">{title}</h2>
                <p className="mt-1 break-words text-2xl font-semibold tracking-tight text-slate-950 tabular-nums">{value}</p>
                <p className="mt-2 text-xs text-slate-600">{desc}</p>
            </CardContent>
        </Card>
    );
}
