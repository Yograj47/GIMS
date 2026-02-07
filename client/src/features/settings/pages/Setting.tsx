import React, { useState } from "react";
import { 
  Store, LayoutGrid, Ruler, Users, Save, Globe, 
  MapPin, Phone, Mail, ChevronRight 
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState("general");

    const tabs = [
        { id: "general", label: "General", icon: <Store size={18} />, desc: "Store info & contact" },
        { id: "category", label: "Categories", icon: <LayoutGrid size={18} />, desc: "Product groupings" },
        { id: "unit", label: "Units", icon: <Ruler size={18} />, desc: "KG, Liters, Packets" },
        { id: "users", label: "Users", icon: <Users size={18} />, desc: "Staff & permissions" },
    ];

    return (
        <div className="min-h-full space-y-6 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-black text-slate-800 tracking-tight">Settings</h1>
                <p className="text-sm font-medium text-slate-500">Configure your grocery system preferences.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Internal Settings Sidebar */}
                <div className="space-y-2">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-200 group",
                                activeTab === tab.id 
                                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" 
                                    : "bg-white border border-slate-100 text-slate-600 hover:border-indigo-300 hover:bg-indigo-50/30"
                            )}
                        >
                            <div className="flex items-center gap-3 text-left">
                                <div className={cn(
                                    "p-2 rounded-xl",
                                    activeTab === tab.id ? "bg-white/20" : "bg-slate-50 group-hover:bg-white"
                                )}>
                                    {tab.icon}
                                </div>
                                <div>
                                    <p className="text-sm font-bold">{tab.label}</p>
                                    <p className={cn(
                                        "text-[10px] font-medium opacity-70",
                                        activeTab === tab.id ? "text-indigo-100" : "text-slate-400"
                                    )}>
                                        {tab.desc}
                                    </p>
                                </div>
                            </div>
                            <ChevronRight size={14} className={cn(
                                "transition-transform",
                                activeTab === tab.id ? "translate-x-1" : "opacity-0"
                            )} />
                        </button>
                    ))}
                </div>

                {/* Main Content Area */}
                <div className="lg:col-span-3">
                    <Card className="border-slate-200 rounded-[2rem] shadow-sm bg-white overflow-hidden">
                        <CardContent className="p-8">
                            {activeTab === "general" && <GeneralSettings />}
                            {activeTab === "category" && <SimpleListManager title="Product Categories" placeholder="e.g. Grains, Oils, Spices" />}
                            {activeTab === "unit" && <SimpleListManager title="Measurement Units" placeholder="e.g. KG, Liter, Pkt" />}
                            {activeTab === "users" && <div className="text-center py-10 text-slate-400 font-bold">User Management Content Goes Here</div>}
                        </CardContent>
                        
                        <div className="px-8 py-4 bg-slate-50/50 border-t border-slate-100 flex justify-end">
                            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-8 font-bold">
                                <Save size={18} className="mr-2" /> Save Changes
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}

// --- Sub-Components for Clarity ---

function GeneralSettings() {
    return (
        <div className="space-y-6">
            <h3 className="text-xl font-black text-slate-800">Shop Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SettingsInput label="Store Name" icon={<Store size={16}/>} defaultValue="Your Grocery Store" />
                <SettingsInput label="Email Address" icon={<Mail size={16}/>} defaultValue="contact@grocery.com" />
                <SettingsInput label="Phone Number" icon={<Phone size={16}/>} defaultValue="+977-1-XXXXXXX" />
                <SettingsInput label="Store Location" icon={<MapPin size={16}/>} defaultValue="Kathmandu, Nepal" />
            </div>
        </div>
    );
}

function SettingsInput({ label, icon, defaultValue }: any) {
    return (
        <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
            <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors">
                    {icon}
                </div>
                <input 
                    className="w-full bg-slate-50 border-none rounded-2xl py-3 pl-12 pr-4 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                    defaultValue={defaultValue}
                />
            </div>
        </div>
    );
}

function SimpleListManager({ title, placeholder }: any) {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-black text-slate-800">{title}</h3>
                <Button variant="outline" className="rounded-xl border-indigo-100 text-indigo-600 font-bold text-xs h-9">
                    + Add New
                </Button>
            </div>
            <div className="space-y-3">
                <input className="w-full bg-slate-50 border-dashed border-2 border-slate-200 rounded-2xl p-4 text-sm text-slate-400 italic outline-none" placeholder={placeholder} />
                <div className="p-4 bg-white border border-slate-100 rounded-2xl flex justify-between items-center group hover:border-indigo-200">
                    <span className="font-bold text-slate-700">Sample Item</span>
                    <Button variant="ghost" className="text-rose-500 hover:text-rose-600 text-xs font-black">Delete</Button>
                </div>
            </div>
        </div>
    );
}