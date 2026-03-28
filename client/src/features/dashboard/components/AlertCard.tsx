import { AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface AlertCardProps {
    productName: string;
    remainingQty: string;
    onAction: () => void;
}

export default function AlertCard({ productName, remainingQty, onAction }: AlertCardProps) {
    return (
        <Card className="border-rose-600 bg-rose-100/20 rounded-xl p-8 flex flex-col justify-center relative overflow-hidden border-2 border-dashed h-full">
            <div className="flex items-center gap-5 relative z-10">
                <div className="w-14 h-14 shrink-0 rounded-xl bg-white shadow-md flex items-center justify-center text-rose-600 border border-rose-100">
                    <AlertCircle size={28} />
                </div>
                <div>
                    <h4 className="text-[10px] font-black text-rose-400 uppercase tracking-[0.2em] mb-1">Stock Alert</h4>
                    <p className="text-lg font-black text-slate-900 tracking-tight leading-tight uppercase">
                        {productName} 
                    </p>
                    <p className="text-[10px] font-bold text-slate-500 uppercase mt-1">Critical: {remainingQty} units left</p>
                </div>
            </div>
            <Button 
                onClick={onAction}
                className="w-full mt-8 bg-sky-500 hover:bg-sky-600 text-white font-black text-[12px] uppercase tracking-[0.2em] h-12 rounded-lg shadow-lg shadow-blue-200"
            >
                Restock Asset
            </Button>
        </Card>
    );
}