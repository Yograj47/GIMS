import { Line } from 'react-chartjs-2';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ChartData, ChartOptions } from 'chart.js';

interface ChartSectionProps {
    data: ChartData<'line'>; 
    options: ChartOptions<'line'>;
}

export default function ChartSection({ data, options }: ChartSectionProps) {
    return (
        <Card className="xl:col-span-3 border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between px-8 pt-8 pb-4">
                <div>
                    <CardTitle className="text-lg font-black text-slate-900 tracking-tight uppercase">Performance Analytics</CardTitle>
                    <p className="text-[10px] font-bold text-slate-600 mt-1 uppercase tracking-[0.2em]">7-Day Operational Window</p>
                </div>
                <div className="flex gap-6">
                    <LegendItem color="bg-blue-600" label="STOCK IN" />
                    <LegendItem color="bg-emerald-500" label="STOCK OUT" />
                </div>
            </CardHeader>
            <CardContent className="px-6 pb-6 h-87.5">
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