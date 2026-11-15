import { EntityField, entityInput } from "@/components/common/EntityField";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { useEffect } from "react";
import { useForm, Controller, type Resolver, useWatch} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { unitSchema, type UnitData, type UnitFormData } from "@/types/unit";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
interface UnitFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: UnitFormData) => Promise<void>;
  initialData?: UnitData | null;
  isLoading?: boolean;
}

export default function UnitFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading,
}: UnitFormModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<UnitFormData>({
    resolver: zodResolver(unitSchema) as Resolver<UnitFormData>,
    defaultValues: {
      name: "",
      shortForm: "",
      unitType: "count",
      multiplierToBase: 1,
      baseUnit: false,
      isFractional: false,
      isActive: true,
    },
  });

  const isBaseUnit = useWatch({ control, name: "baseUnit" });

  useEffect(() => {
    if (isBaseUnit) setValue("multiplierToBase", 1);
  }, [isBaseUnit, setValue]);

  useEffect(() => {
    if (isOpen) {
      reset(
        initialData
          ? {
            name: initialData.name,
            shortForm: initialData.shortForm,
            unitType: initialData.unitType,
            multiplierToBase: initialData.multiplierToBase,
            baseUnit: initialData.baseUnit,
            isFractional: initialData.isFractional,
            isActive: initialData.isActive,
          }
          : {
            name: "",
            shortForm: "",
            unitType: "count",
            multiplierToBase: 1,
            baseUnit: false,
            isFractional: false,
            isActive: true,
          }
      );
    }
  }, [initialData, reset, isOpen]);

    const saving = isLoading || isSubmitting;
    return (
        <Dialog open={isOpen} onOpenChange={(open) => { if (!open && !saving) onClose(); }}>
            <DialogContent showCloseButton={!saving} className="rounded-sm sm:max-w-xl">
                <div className="border-b-2 border-input pb-3">
                    <DialogTitle>{initialData ? "Edit measurement unit" : "Add measurement unit"}</DialogTitle>
                    <DialogDescription>Define a reusable unit for products and conversions.</DialogDescription>
                </div>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <fieldset disabled={saving} className="space-y-4">
                        <EntityField label="Unit name" hint="Enter the full name, such as Kilogram." error={errors.name?.message}>
                            {(field) => <input {...field} {...register("name")} className={entityInput}  />}
                        </EntityField>
                        <EntityField label="Symbol" hint="Use the short form shown on receipts, such as kg." error={errors.shortForm?.message}>
                            {(field) => <input {...field} {...register("shortForm")} className={entityInput} maxLength={10} />}
                        </EntityField>
                        <EntityField label="Measurement type" hint="Choose what this unit measures." error={errors.unitType?.message}>
                            {(field) => <select {...field} {...register("unitType")} className={entityInput}>
                                <option value="count">Count</option><option value="weight">Weight</option>
                                <option value="volume">Volume</option><option value="pack">Pack</option>
                            </select>}
                        </EntityField>
                        <EntityField label="Multiplier to base" hint="Enter how many reference units one unit represents. A base unit has a multiplier of 1." error={errors.multiplierToBase?.message}>
                            {(field) => <input {...field} {...register("multiplierToBase", { valueAsNumber: true })} className={entityInput} type="number" min="1" step="any" readOnly={isBaseUnit} />}
                        </EntityField>
                        <EntityField label="Base unit" hint="Use this as the reference unit for the measurement type.">
                            {(props) => <Controller name="baseUnit" control={control} render={({ field }) =>
                                <Switch {...props} checked={field.value} onCheckedChange={field.onChange} />} />}
                        </EntityField>
                        <EntityField label="Allow fractions" hint="Use for quantities such as 0.5 kg.">
                            {(props) => <Controller name="isFractional" control={control} render={({ field }) =>
                                <Switch {...props} checked={field.value} onCheckedChange={field.onChange} />} />}
                        </EntityField>
                        <EntityField label="Active" hint="Active units are available when configuring products.">
                            {(props) => <Controller name="isActive" control={control} render={({ field }) =>
                                <Switch {...props} checked={field.value} onCheckedChange={field.onChange} />} />}
                        </EntityField>
                    </fieldset>
                    <div className="flex justify-end gap-2 border-t-2 border-input pt-3">
                        <Button type="button" variant="outline" disabled={saving} onClick={onClose}>Cancel</Button>
                        <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save measurement unit"}</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
