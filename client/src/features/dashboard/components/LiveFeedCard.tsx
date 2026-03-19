import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { ActivityLogData } from "@/types/ActivityLog";
import { cn } from "@/lib/utils";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";

interface LiveFeedProps {
    logs: ActivityLogData[];
    onViewAll: () => void;
}

export default function LiveFeedCard({ logs, onViewAll }: LiveFeedProps) {
    return (
        <Card className="border-slate-200 rounded-xl shadow-sm overflow-hidden bg-white">
            <div className="px-8 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
                <span className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em]">Activity Stream</span>
                <Button
                    onClick={onViewAll}
                    variant="ghost"
                    className="h-7 text-[9px] font-black text-blue-600 hover:bg-blue-50 px-3 uppercase tracking-widest border border-blue-100"
                >
                    View Ledger
                </Button>
            </div>
            <div className="divide-y divide-slate-50">
                {logs.length > 0 ? (
                    logs.map((log) => {
                        const type = log.type === "INVENTORY" ? "IN" : "OUT";
                        return (
                            <div key={log._id} className="px-8 py-4 flex items-center justify-between hover:bg-slate-50/50 transition-all cursor-pointer group">
                                <div className="flex items-center gap-4">
                                    <div className={cn(
                                        "w-9 h-9 rounded-lg flex items-center justify-center shrink-0",
                                        type === 'IN' ? "bg-blue-50 text-blue-600" : "bg-emerald-50 text-emerald-600"
                                    )}>
                                        {type === 'IN' ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-800 tracking-tight">{log.message}</p>
                                        <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-tighter mt-0.5">
                                            {log.performedBy.name} • {new Date(log.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <p className="p-8 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">No recent transactions</p>
                )}
            </div>
        </Card>
    );
}