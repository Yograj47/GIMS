import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, X } from "lucide-react";
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
                
                {/* Header */}
                <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div>
                        <h2 className="text-lg font-black text-slate-800">
                            {initialData ? "Update Category" : "Define New Category"}
                        </h2>
                        <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">
                            Classification Engine v1.0
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white rounded-xl text-slate-400 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
                    
                    {/* Name */}
                    <div className="space-y-1">
                        <Label className="text-[10px] font-black text-slate-400 uppercase ml-1">Category Name</Label>
                        <Input
                            {...register("name")}
                            placeholder="e.g. Beverages"
                            className="h-11 rounded-xl border-slate-200 bg-slate-50/50 font-bold focus:border-slate-900 transition-all"
                        />
                        {errors.name && <p className="text-rose-500 text-[9px] font-bold mt-1 ml-1 uppercase">{errors.name.message}</p>}
                    </div>

                    {/* Description */}
                    <div className="space-y-1">
                        <Label className="text-[10px] font-black text-slate-400 uppercase ml-1">Description</Label>
                        <Textarea
                            {...register("description")}
                            placeholder="Brief category summary..."
                            className="min-h-24 rounded-xl border-slate-200 bg-slate-50/50 font-bold focus:border-slate-900 transition-all resize-none"
                        />
                    </div>

                    {/* Active Status */}
                    <div className="flex items-center justify-between p-3 px-4 rounded-2xl border border-slate-100 bg-slate-50/30">
                        <div className="space-y-0.5">
                            <Label className="text-[10px] font-black text-slate-700 uppercase">System Status</Label>
                            <p className="text-[8px] text-slate-400 font-bold uppercase tracking-tight">Toggle category availability</p>
                        </div>
                        <Controller
                            control={control}
                            name="isActive"
                            render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} />}
                        />
                    </div>

                    {/* Actions */}
                    <div className="pt-2 flex gap-3">
                        <Button type="button" onClick={onClose} variant="ghost" className="flex-1 font-bold text-slate-500">
                            Discard
                        </Button>
                        <Button 
                            type="submit" 
                            disabled={isLoading || isSubmitting} 
                            className="flex-1 bg-slate-900 text-white font-bold rounded-xl shadow-lg shadow-slate-200 hover:bg-blue-600 transition-all active:scale-95"
                        >
                            {isLoading || isSubmitting ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                initialData ? "Update Configuration" : "Initialize Category"
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}