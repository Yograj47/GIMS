"use client";

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, X, LayoutGrid, ShieldAlert } from "lucide-react";
import { categorySchema, type CategoryFormData, type CategoryData } from "@/types/Category";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface CategoryFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: CategoryFormData) => Promise<void>;
    initialData?: CategoryData | null;
    isLoading?: boolean;
}

export default function CategoryFormModal({
    isOpen,
    onClose,
    onSubmit,
    initialData,
    isLoading
}: CategoryFormModalProps) {

    const {
        register,
        handleSubmit,
        reset,
        control,
        formState: { errors, isSubmitting }
    } = useForm<CategoryFormData>({
        resolver: zodResolver(categorySchema),
        defaultValues: {
            name: "",
            description: "",
            isActive: true
        }
    });

    useEffect(() => {
        if (isOpen) {
            reset(initialData || { name: "", description: "", isActive: true });
        }
    }, [initialData, reset, isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[2px] animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-105 rounded-sm shadow-2xl overflow-hidden border border-slate-200 shadow-slate-900/20">
                
                {/* 1. HEADER - Sharp & Minimal */}
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/80">
                    <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-blue-600 rounded-sm text-white">
                            <LayoutGrid size={14} />
                        </div>
                        <h2 className="text-[11px] font-black text-slate-600 uppercase tracking-widest">
                            {initialData ? "Edit Classification" : "New Category Registry"}
                        </h2>
                    </div>
                    <button onClick={onClose} className="p-1 hover:bg-white border border-transparent hover:border-slate-200 rounded-sm text-slate-400 transition-all">
                        <X size={16} />
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
                    
                    {/* Identifier Name */}
                    <div className="space-y-1.5">
                        <Label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-0.5">Classification Name</Label>
                        <Input
                            {...register("name")}
                            placeholder="e.g. Raw materials"
                            className="h-10 rounded-sm border-slate-200 bg-white font-bold text-xs focus-visible:ring-blue-600 focus-visible:ring-1 focus-visible:border-blue-500 transition-all placeholder:text-slate-300"
                        />
                        {errors.name && (
                            <div className="flex items-center gap-1 mt-1 ml-0.5 text-rose-500">
                                <ShieldAlert size={10} />
                                <p className="text-[9px] font-black uppercase tracking-tighter">{errors.name.message}</p>
                            </div>
                        )}
                    </div>

                    {/* Technical Definition */}
                    <div className="space-y-1.5">
                        <Label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-0.5">Technical Definition</Label>
                        <Textarea
                            {...register("description")}
                            placeholder="Provide brief specs..."
                            className="min-h-25 rounded-sm border-slate-200 bg-white font-bold text-xs focus-visible:ring-blue-600 focus-visible:ring-1 focus-visible:border-blue-500 transition-all resize-none placeholder:text-slate-300 tabular-nums"
                        />
                    </div>

                    {/* Availability Switch - Industrial Card Style */}
                    <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-sm">
                        <div className="flex flex-col">
                            <Label className="text-[10px] font-black text-slate-900 uppercase tracking-tight">System Status</Label>
                            <span className="text-[8px] text-slate-400 font-bold uppercase tracking-tighter italic">Live in Registry</span>
                        </div>
                        <Controller
                            control={control}
                            name="isActive"
                            render={({ field }) => (
                                <Switch 
                                    checked={field.value} 
                                    onCheckedChange={field.onChange} 
                                    className="data-[state=checked]:bg-blue-600 scale-90"
                                />
                            )}
                        />
                    </div>

                    {/* ACTIONS - Flattened Hierarchy */}
                    <div className="pt-2 flex gap-2">
                        <Button 
                            type="button" 
                            onClick={onClose} 
                            variant="outline" 
                            className="flex-1 h-10 rounded-sm border-slate-200 text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all text-slate-500"
                        >
                            Discard
                        </Button>
                        <Button 
                            type="submit" 
                            disabled={isLoading || isSubmitting} 
                            className="flex-1 h-10 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-sm hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50"
                        >
                            {isLoading || isSubmitting ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                initialData ? "Commit Updates" : "Initialize Node"
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}