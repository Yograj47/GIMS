import { Line } from 'react-chartjs-2';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ChartSectionProps {
    data: any; // Later we will type this properly with ChartData
    options: any;
}

export default function ChartSection({ data, options }: ChartSectionProps) {
    return (
        <Card className="xl:col-span-3 border-slate-300 shadow-xl shadow-slate-100/50 rounded-[2rem] overflow-hidden bg-white">
            <CardHeader className="flex flex-row items-center justify-between px-8 pt-8">
                <div>
                    <CardTitle className="text-xl font-black text-slate-800 tracking-tight">Sales vs Purchases</CardTitle>
                    <p className="text-[10px] font-black text-slate-400 mt-1 uppercase tracking-widest">7-Day Performance Window</p>
                </div>
                <div className="flex gap-4">
                    <LegendItem color="bg-indigo-600" label="STOCK IN" />
                    <LegendItem color="bg-emerald-500" label="STOCK OUT" />
                </div>
            </CardHeader>
            <CardContent className="px-6 pb-8 h-87.5">
                <Line data={data} options={options} />
            </CardContent>
        </Card>
    );
}

function LegendItem({ color, label }: { color: string; label: string }) {
    return (
        <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${color}`} />
            <span className="text-[10px] font-black text-slate-400">{label}</span>
        </div>
    );
}