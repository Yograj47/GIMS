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
        <Card className="border-rose-300 bg-rose-50/30 rounded-[2rem] p-8 flex flex-col justify-center relative overflow-hidden border-2 border-dashed h-full">
            <div className="flex items-start gap-6 relative z-10">
                <div className="p-4 rounded-2xl bg-white shadow-md text-rose-600 animate-bounce">
                    <AlertCircle size={28} />
                </div>
                <div className="space-y-2">
                    <h4 className="text-lg font-black text-slate-800 tracking-tight">Critical Alert</h4>
                    <p className="text-sm font-medium text-slate-600 leading-relaxed">
                        <span className="font-black text-rose-600">{productName}</span> is almost empty! Only {remainingQty} left.
                    </p>
                    <Button 
                        onClick={onAction}
                        className="bg-rose-600 hover:bg-rose-700 text-white font-black text-xs px-6 rounded-xl h-10 shadow-lg shadow-rose-200 mt-2"
                    >
                        REORDER NOW
                    </Button>
                </div>
            </div>
        </Card>
    );
}