import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { ActivityLogData } from "@/types/activity-log";
import { cn } from "@/lib/utils";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";

interface LiveFeedProps {
    logs: ActivityLogData[];
    onViewAll: () => void;
}

export default function LiveFeedCard({ logs, onViewAll }: LiveFeedProps) {
    return (
        <Card className="border-input rounded-xl shadow-sm overflow-hidden bg-card">
            <div className="px-8 py-5 border-b border-input flex justify-between items-center bg-muted/30">
                <span className="text-[12px] font-black text-foreground uppercase tracking-[0.2em]">Activity Stream</span>
                <Button
                    onClick={onViewAll}
                    variant="ghost"
                    className="h-7 text-[9px] font-black text-link hover:bg-brand-50 px-3 uppercase tracking-widest border border-brand-300"
                >
                    View Logs
                </Button>
            </div>
            <div className="divide-y divide-border">
                {logs.length > 0 ? (
                    logs.map((log) => {
                        const type = log.type === "INVENTORY" ? "IN" : "OUT";
                        return (
                            <div key={log._id} className="px-8 py-4 flex items-center justify-between hover:bg-muted/50 transition-all cursor-pointer group">
                                <div className="flex items-center gap-4">
                                    <div className={cn(
                                        "w-9 h-9 rounded-lg flex items-center justify-center shrink-0",
                                        type === 'IN' ? "bg-brand-50 text-link" : "bg-emerald-50 text-emerald-600"
                                    )}>
                                        {type === 'IN' ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-foreground tracking-tight">{log.message}</p>
                                        <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-tighter mt-0.5">
                                            {log.performedBy?.name} • {new Date(log.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <p className="p-8 text-center text-[10px] font-bold text-subtle-foreground uppercase tracking-widest">No Logs</p>
                )}
            </div>
        </Card>
    );
}