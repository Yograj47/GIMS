import { 
  Plus, ArrowUpRight, ArrowDownLeft, Package, AlertCircle, 
  Activity, Truck, ChevronRight, 
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Chart.js Setup
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, Title, Tooltip, Filler, Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler, Legend);

export default function InteractiveDashboard() {
    const chartData = {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [
            {
                fill: true,
                label: 'Stock In',
                data: [40, 35, 55, 45, 70, 50, 65],
                borderColor: 'rgb(79, 70, 229)',
                backgroundColor: 'rgba(79, 70, 229, 0.05)',
                tension: 0.4,
                borderWidth: 3,
                pointRadius: 2,
                pointHoverRadius: 6,
            },
            {
                fill: true,
                label: 'Stock Out',
                data: [30, 45, 35, 60, 40, 65, 55],
                borderColor: 'rgb(16, 185, 129)',
                backgroundColor: 'rgba(16, 185, 129, 0.05)',
                tension: 0.4,
                borderWidth: 3,
                pointRadius: 2,
                pointHoverRadius: 6,
            }
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: '#1e293b',
                padding: 12,
                cornerRadius: 8,
            }
        },
        scales: {
            x: { grid: { display: false }, ticks: { color: '#94a3b8', font: { weight: '600' } } },
            y: { grid: { color: '#f1f5f9' }, ticks: { color: '#94a3b8' } }
        }
    };

    return (
        <div className="min-h-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10 px-1">
            
            {/* 1. Header with Active Pulse */}
            <div className="flex justify-between items-end">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Live System Active</span>
                    </div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">Business Intelligence</h1>
                    <p className="text-sm font-medium text-slate-500 italic">Tracking your shop movements in real-time</p>
                </div>
                <Button className="rounded-2xl bg-indigo-600 hover:bg-indigo-700 h-12 px-6 font-bold shadow-lg shadow-indigo-100 transition-all hover:scale-105 active:scale-95">
                    <Plus className="mr-2" size={20} /> New Entry
                </Button>
            </div>

            {/* 2. Enhanced Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard 
                    title="Stock Value" 
                    value="Rs 4.2M" 
                    desc="Total value of goods in shop"
                    trend="+5.4% up" 
                    trendUp={true} 
                    icon={<Package size={22} />} 
                    color="text-indigo-600" 
                    bgColor="bg-indigo-50" 
                />
                <StatCard 
                    title="Low Items" 
                    value="12" 
                    desc="Products needing reorder"
                    trend="Requires attention" 
                    trendUp={false} 
                    icon={<AlertCircle size={22} />} 
                    color="text-rose-600" 
                    bgColor="bg-rose-50" 
                />
                <StatCard 
                    title="Today's Flow" 
                    value="84%" 
                    desc="Speed of stock movement"
                    trend="+12% vs yesterday" 
                    trendUp={true} 
                    icon={<Activity size={22} />} 
                    color="text-emerald-600" 
                    bgColor="bg-emerald-50" 
                />
            </div>

            {/* 3. Interactive Main Section */}
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                <Card className="xl:col-span-3 border-slate-200 shadow-xl shadow-slate-100/50 rounded-[2rem] overflow-hidden bg-white">
                    <CardHeader className="flex flex-row items-center justify-between px-8 pt-8">
                        <div>
                            <CardTitle className="text-xl font-black text-slate-800">Sales vs Purchases</CardTitle>
                            <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-tighter">7-Day Performance Window</p>
                        </div>
                        <div className="flex gap-4">
                            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-indigo-600" /> <span className="text-[10px] font-black text-slate-400">STOCK IN</span></div>
                            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500" /> <span className="text-[10px] font-black text-slate-400">STOCK OUT</span></div>
                        </div>
                    </CardHeader>
                    <CardContent className="px-6 pb-8 h-87.5">
                        <Line data={chartData} options={chartOptions as any} />
                    </CardContent>
                </Card>

                {/* Right Column: Interaction Hub */}
                <div className="space-y-4">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Quick Actions</h3>
                    <ActionTile icon={<Plus />} label="Add Product" color="bg-indigo-600" />
                    <ActionTile icon={<ArrowUpRight />} label="Record Outflow" color="bg-emerald-500" />
                    <ActionTile icon={<Truck />} label="Suppliers" color="bg-slate-800" />
                </div>
            </div>

            {/* 4. Live Feed Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-slate-200 rounded-[2rem] shadow-sm overflow-hidden bg-white">
                    <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                        <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Live Activity Log</span>
                        <Button variant="ghost" className="text-[10px] font-black text-indigo-600 hover:bg-indigo-50 px-4">View All Logs</Button>
                    </div>
                    <div className="divide-y divide-slate-50">
                        <MovementItem name="Premium Basmati Rice" qty="120kg" type="IN" time="2m ago" user="Admin" />
                        <MovementItem name="Sunflower Oil (5L)" qty="40L" type="OUT" time="15m ago" user="Staff" />
                        <MovementItem name="Organic Wheat Flour" qty="50kg" type="IN" time="1h ago" user="Admin" />
                    </div>
                </Card>

                {/* Interactive Alert Card */}
                <Card className="border-rose-100 bg-rose-50/30 rounded-[2rem] p-8 flex flex-col justify-center relative overflow-hidden group border-2 border-dashed">
                    <div className="flex items-start gap-6 relative z-10">
                        <div className="p-4 rounded-2xl bg-white shadow-md text-rose-600 animate-bounce transition-all">
                            <AlertCircle size={28} />
                        </div>
                        <div className="space-y-2">
                            <h4 className="text-lg font-black text-slate-800">Critical Alert</h4>
                            <p className="text-sm font-medium text-slate-600">
                                <span className="font-black text-rose-600">Sugar</span> is almost empty! Only 5kg left. Order more to keep sales running.
                            </p>
                            <Button className="bg-rose-600 text-white font-black text-xs px-6 rounded-xl h-10 shadow-lg shadow-rose-200 mt-2">
                                REORDER NOW
                            </Button>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}

// --- Interaction Helper Components ---

function StatCard({ title, value, desc, trend, trendUp, icon, color, bgColor }: any) {
    return (
        <Card className="border-slate-200 rounded-3xl transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-white cursor-help group">
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

function ActionTile({ icon, label, color }: any) {
    return (
        <button className="w-full p-5 rounded-2xl bg-white border border-slate-200 flex items-center justify-between group hover:border-indigo-500 transition-all hover:shadow-lg active:scale-95">
            <div className="flex items-center gap-4">
                <div className={cn("p-2 rounded-xl text-white shadow-md", color)}>
                    {icon}
                </div>
                <span className="text-sm font-black text-slate-700">{label}</span>
            </div>
            <ChevronRight size={18} className="text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
        </button>
    );
}

function MovementItem({ name, qty, type, time, user }: any) {
    return (
        <div className="px-8 py-5 flex items-center justify-between hover:bg-slate-50/50 transition-all cursor-pointer group">
            <div className="flex items-center gap-4">
                <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110",
                    type === 'IN' ? "bg-indigo-50 text-indigo-600" : "bg-emerald-50 text-emerald-600"
                )}>
                    {type === 'IN' ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                </div>
                <div>
                    <p className="text-sm font-black text-slate-700">{name}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{user} • {time}</p>
                </div>
            </div>
            <div className="text-right flex items-center gap-4">
                <div>
                    <p className={cn("text-base font-black", type === 'IN' ? "text-indigo-600" : "text-emerald-600")}>{qty}</p>
                    <p className="text-[9px] font-black text-slate-300 uppercase leading-none">{type === 'IN' ? 'Stock Added' : 'Stock Sold'}</p>
                </div>
                <ChevronRight size={14} className="text-slate-200 opacity-0 group-hover:opacity-100 transition-all" />
            </div>
        </div>
    );
}