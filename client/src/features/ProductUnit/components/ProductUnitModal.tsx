import { EntityField, entityInput } from "@/components/common/EntityField";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";

import React, { useEffect } from 'react';
import { useForm, Controller, type Resolver } from 'react-hook-form';
import { productUnitSchema, type ProductUnitFormData } from '@/types/product-unit';
import { zodResolver } from '@hookform/resolvers/zod';
import { Switch } from '@/components/ui/switch';
import { useUnits } from '@/features/unit/hooks/useUnits';
import { Button } from '@/components/ui/button';

interface ProductUnitConversion {
    _id: string;
    unitId: string;
    unitName: string;
    shortForm: string;
    multiplier: number;
    isDefault: boolean;
    isFractionable: boolean;
    isActive: boolean;
}

interface ProductUnitModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: ProductUnitFormData) => Promise<void>;
    productId: string;
    productName: string;
    initialData?: ProductUnitConversion;
}

export const ProductUnitModal: React.FC<ProductUnitModalProps> = ({
    isOpen, onClose, onSubmit, productId, productName, initialData
}) => {
    const { units, fetchUnits } = useUnits();

    const { register, handleSubmit, control, reset, formState: { errors, isSubmitting } } = useForm<ProductUnitFormData>({
        resolver: zodResolver(productUnitSchema) as Resolver<ProductUnitFormData>,
        defaultValues: {
            productId,
            unitId: "",
            multiplier: 1,
            isDefault: false,
            isFractionable: false,
            isActive: true
        }
    });

    useEffect(() => {
        if (isOpen) {
            fetchUnits(undefined, undefined, undefined, true);
            reset(initialData ? { ...initialData, productId } : {
                productId,
                unitId: "",
                multiplier: 1,
                isDefault: false,
                isFractionable: false,
                isActive: true
            });
        }
    }, [isOpen, initialData, productId, reset, fetchUnits]);

    const saving = isSubmitting;
    return (
        <Dialog open={isOpen} onOpenChange={(open) => { if (!open && !saving) onClose(); }}>
            <DialogContent showCloseButton={!saving} className="rounded-sm sm:max-w-xl">
                <div className="border-b-2 border-input pb-3">
                    <DialogTitle>{initialData ? "Edit product unit" : "Add product unit"}</DialogTitle>
                    <DialogDescription>Set the conversion for {productName}.</DialogDescription>
                </div>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <fieldset disabled={saving} className="space-y-4">
                        <EntityField label="Measurement unit" hint="Choose the unit staff will select when entering quantities." error={errors.unitId?.message}>
                            {(field) => <select {...field} {...register("unitId")} className={entityInput}>
                                <option value="">Choose a unit</option>
                                {units.filter((unit) => unit.isActive || unit._id === initialData?.unitId).map((unit) =>
                                    <option key={unit._id} value={unit._id}>{unit.name} ({unit.shortForm})</option>)}
                            </select>}
                        </EntityField>
                        <EntityField label="Base units per selected unit" hint="If one sack contains 25 kg and kg is the product base unit, enter 25." error={errors.multiplier?.message}>
                            {(field) => <input {...field} {...register("multiplier", { valueAsNumber: true })} className={entityInput} type="number" min="1" step="any" />}
                        </EntityField>
                        <EntityField label="Default unit" hint="Preselect this unit when staff add the product to a transaction.">
                            {(props) => <Controller name="isDefault" control={control} render={({ field }) =>
                                <Switch {...props} checked={field.value} onCheckedChange={field.onChange} />} />}
                        </EntityField>
                        <EntityField label="Allow fractional quantities" hint="Use when staff can enter quantities such as half a kilogram.">
                            {(props) => <Controller name="isFractionable" control={control} render={({ field }) =>
                                <Switch {...props} checked={field.value} onCheckedChange={field.onChange} />} />}
                        </EntityField>
                        <EntityField label="Active" hint="Make this conversion available for new transactions.">
                            {(props) => <Controller name="isActive" control={control} render={({ field }) =>
                                <Switch {...props} checked={field.value} onCheckedChange={field.onChange} />} />}
                        </EntityField>
                    </fieldset>
                    <div className="flex justify-end gap-2 border-t-2 border-input pt-3">
                        <Button type="button" variant="outline" disabled={saving} onClick={onClose}>Cancel</Button>
                        <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save product unit"}</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
