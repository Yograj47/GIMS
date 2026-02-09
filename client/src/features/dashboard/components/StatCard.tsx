import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function StatCard({ title, value, desc, trend, trendUp, icon, color, bgColor }: any) {
    return (
        <Card className="border-slate-300 rounded-3xl transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-white cursor-help group">
            <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                    <div className={cn("p-3 rounded-2xl transition-transform group-hover:rotate-12", bgColor, color)}>
                        {icon}
                    </div>
                    <div className={cn("text-[10px] font-black uppercase px-2 py-1 rounded-md", trendUp ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600")}>
                        {trend}
                    </div>
                </div>
                <h2 className="text-3xl font-black text-slate-800">{value}</h2>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mt-1">{title}</p>
                <p className="text-[10px] font-medium text-slate-400 mt-2 italic border-t border-slate-50 pt-2">{desc}</p>
            </CardContent>
        </Card>
    );
}