import { Line } from 'react-chartjs-2';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ChartData, ChartOptions } from 'chart.js';

interface ChartSectionProps {
    data: ChartData<'line'>; 
    options: ChartOptions<'line'>;
}

export default function ChartSection({ data, options }: ChartSectionProps) {
    return (
        <Card className="xl:col-span-3 border-border">
            <CardHeader className="flex flex-wrap items-center justify-between gap-3 px-3 sm:px-6">
                <div>
                    <CardTitle className="text-lg font-black text-foreground tracking-tight uppercase">Performance Analytics</CardTitle>
                    <p className="text-[10px] font-bold text-muted-foreground mt-1 uppercase tracking-[0.2em]">7-Day Operational Window</p>
                </div>
                <div className="flex gap-6">
                    <LegendItem color="bg-chart-1" label="STOCK IN" />
                    <LegendItem color="bg-chart-2" label="STOCK OUT" />
                </div>
            </CardHeader>
            <CardContent className="h-60 min-w-0 px-3 sm:h-80 sm:px-6">
                <Line data={data} options={options} />
            </CardContent>
        </Card>
    );
}

function LegendItem({ color, label }: { color: string; label: string }) {
    return (
        <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${color}`} />
            <span className="text-[10px] font-black text-subtle-foreground">{label}</span>
        </div>
    );
}
