import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { ActivityLogData } from "@/types/ActivityLog";
import MovementItem from "./MovementType";

interface LiveFeedProps {
    logs: ActivityLogData[];
    onViewAll: () => void;
}

export default function LiveFeedCard({ logs, onViewAll }: LiveFeedProps) {
    return (
        <Card className="border-slate-300 rounded-[2rem] shadow-sm overflow-hidden bg-white">
            <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Live Activity Log</span>
                <Button 
                    onClick={onViewAll}
                    variant="ghost" 
                    className="text-[10px] font-black text-indigo-600 hover:bg-indigo-50 px-4"
                >
                    View All Logs
                </Button>
            </div>
            <div className="divide-y divide-slate-50">
                {logs.length > 0 ? (
                    logs.map((log) => (
                        <MovementItem 
                            key={log._id}
                            name={log.message}
                            type={log.type === "INVENTORY" ? "IN" : "OUT"} // Logic based on your model
                            time={log.createdAt}
                            user={log.performedBy.name}
                        />
                    ))
                ) : (
                    <p className="p-8 text-center text-xs font-bold text-slate-400 uppercase">No recent activity</p>
                )}
            </div>
        </Card>
    );
}