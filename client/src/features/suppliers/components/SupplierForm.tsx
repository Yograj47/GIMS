import { Controller, useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { EntityField, EntitySection, entityInput } from "@/components/common/EntityField";
import { supplierSchema, type SupplierData, type SupplierFormData } from "@/types/supplier"
import { useEffect } from "react";
import { Switch } from "@/components/ui/switch";

interface SupplierFormProps {
    initialData?: SupplierData;
    onSubmit: (data: SupplierFormData) => void;
}

export default function SupplierForm({ initialData, onSubmit }: SupplierFormProps) {
    const { register, handleSubmit, control, reset, formState: { errors } } = useForm<SupplierFormData>({
        resolver: zodResolver(supplierSchema) as Resolver<SupplierFormData>,
        defaultValues: {
            name: initialData?.name ?? "",
            phone: initialData?.phone ?? "",
            email: initialData?.email ?? "",
            address: initialData?.address ?? "",
            notes: initialData?.notes ?? "",
            isActive: initialData?.isActive ?? true,
        }
    });

    useEffect(() => {
        if (initialData) reset(initialData);
    }, [initialData, reset]);

    return (
        <form id="supplier-form" onSubmit={handleSubmit(onSubmit)}>
            <EntitySection title="Supplier details">
                <EntityField label="Supplier name (required)" hint="Use the name shown on the supplier’s bills or delivery notes." error={errors.name?.message}>
                    {(field) => <input {...field} {...register("name")} autoComplete="organization" className={entityInput} />}
                </EntityField>
                <div className="grid gap-4 sm:grid-cols-2">
                    <EntityField label="Phone (required)" hint="Enter the main contact number using 10–15 digits, with no spaces or punctuation." error={errors.phone?.message}>
                        {(field) => <input {...field} {...register("phone")} type="tel" autoComplete="tel" maxLength={15} placeholder="e.g. 9800000000" className={entityInput} />}
                    </EntityField>
                    <EntityField label="Email (optional)" hint="Use the email address for billing or delivery questions." error={errors.email?.message}>
                        {(field) => <input {...field} {...register("email")} type="email" autoComplete="email" className={entityInput} />}
                    </EntityField>
                </div>
                <EntityField label="Address (required)" hint="Enter the supplier’s street or area and municipality so staff can identify the correct location." error={errors.address?.message}>
                    {(field) => <input {...field} {...register("address")} autoComplete="street-address" className={entityInput} />}
                </EntityField>
            </EntitySection>

            <EntitySection title="Purchasing">
                <EntityField label="Internal notes (optional)" hint="Record practical details such as payment terms, order cutoffs, or delivery days." error={errors.notes?.message}>
                    {(field) => <textarea {...field} {...register("notes")} rows={3} className={entityInput} />}
                </EntityField>
                <EntityField label="Active supplier" hint="Active suppliers can be selected when recording a delivery.">
                    {({ id, "aria-describedby": describedBy }) => (
                        <Controller control={control} name="isActive"
                            render={({ field }) => <Switch id={id} aria-describedby={describedBy} checked={field.value} onCheckedChange={field.onChange} />} />
                    )}
                </EntityField>
            </EntitySection>
        </form>
    );
}
