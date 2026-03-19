import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function StatCard({ title, value, desc, trend, trendUp, icon, color, bgColor }: any) {
    return (
        <Card className="border-slate-200 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-slate-200/50 bg-white group overflow-hidden">
            <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                    <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center shadow-sm", bgColor, color)}>
                        {icon}
                    </div>
                    <div className={cn("text-[9px] font-black uppercase px-2 py-1 rounded-md tracking-widest", 
                        trendUp ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-rose-50 text-rose-600 border border-rose-100")}>
                        {trend}
                    </div>
                </div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">{value}</h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{title}</p>
                <div className="mt-4 pt-4 border-t border-slate-50">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight opacity-70">{desc}</p>
                </div>
            </CardContent>
        </Card>
    );
}