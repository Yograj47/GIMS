import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Tag } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { categorySchema, type CategoryFormData, type CategoryData } from "@/types/Category";

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
        formState: { errors }
    } = useForm<CategoryFormData>({
        resolver: zodResolver(categorySchema),
        defaultValues: {
            name: "",
            description: ""
        }
    });

    // Effect to populate form when editing or clear when adding
    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                reset({
                    name: initialData.name,
                    description: initialData.description || ""
                });
            } else {
                reset({ name: "", description: "" });
            }
        }
    }, [initialData, reset, isOpen]);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-112.5 rounded-[2rem] border-none p-8 gap-6 shadow-2xl">
                <DialogHeader className="space-y-3">
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                        <Tag size={24} />
                    </div>
                    <DialogTitle className="text-2xl font-black text-slate-900 tracking-tight">
                        {initialData ? "Edit Category" : "New Category"}
                    </DialogTitle>
                    <p className="text-slate-500 text-sm font-medium">
                        {initialData ? "Update the details of your category below." : "Create a new grouping for your products."}
                    </p>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    {/* CATEGORY NAME */}
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                            Category Name
                        </Label>
                        <Input
                            {...register("name")}
                            placeholder="e.g. Beverages, Electronics..."
                            className="h-12 rounded-xl border-slate-200 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium"
                        />
                        {errors.name && (
                            <p className="text-[10px] text-red-500 font-bold uppercase ml-1">{errors.name.message}</p>
                        )}
                    </div>

                    {/* DESCRIPTION */}
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                            Description (Optional)
                        </Label>
                        <Textarea
                            {...register("description")}
                            placeholder="Provide a brief summary of this category..."
                            className="min-h-30 rounded-xl border-slate-200 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium resize-none"
                        />
                    </div>

                    <DialogFooter className="pt-4 sm:justify-end gap-2">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={onClose}
                            className="rounded-xl font-bold text-slate-500 hover:bg-slate-50"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="bg-blue-600 hover:bg-blue-700 h-12 rounded-xl px-8 font-black shadow-lg shadow-blue-100 min-w-35 transition-all active:scale-95"
                        >
                            {isLoading ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : initialData ? (
                                "Save Changes"
                            ) : (
                                "Create Category"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}