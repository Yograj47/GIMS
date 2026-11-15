import { EntityField, entityInput } from "@/components/common/EntityField";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { categorySchema, type CategoryFormData, type CategoryData } from "@/types/category";
import { Button } from "@/components/ui/button";
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

    const saving = isLoading || isSubmitting;
    return (
        <Dialog open={isOpen} onOpenChange={(open) => { if (!open && !saving) onClose(); }}>
            <DialogContent showCloseButton={!saving} className="rounded-sm sm:max-w-xl">
                <div className="border-b-2 border-input pb-3">
                    <DialogTitle>{initialData ? "Edit category" : "Add category"}</DialogTitle>
                    <DialogDescription>Group related products for inventory and reporting.</DialogDescription>
                </div>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <fieldset disabled={saving} className="space-y-4">
                        <EntityField label="Category name" hint="Use a short name staff will recognize, such as Pantry staples." error={errors.name?.message}>
                            {(field) => <input {...field} {...register("name")} className={entityInput} placeholder="e.g. Pantry staples" />}
                        </EntityField>
                        <EntityField label="Description (optional)" hint="Describe which products belong in this category." error={errors.description?.message}>
                            {(field) => <textarea {...field} {...register("description")} className={entityInput} rows={3} />}
                        </EntityField>
                        <EntityField label="Active" hint="Active categories can be selected when adding products.">
                            {(props) => <Controller name="isActive" control={control} render={({ field }) =>
                                <Switch {...props} checked={field.value} onCheckedChange={field.onChange} />} />}
                        </EntityField>
                    </fieldset>
                    <div className="flex justify-end gap-2 border-t-2 border-input pt-3">
                        <Button type="button" variant="outline" disabled={saving} onClick={onClose}>Cancel</Button>
                        <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save category"}</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
