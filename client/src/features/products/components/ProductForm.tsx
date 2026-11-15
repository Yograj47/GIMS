import { useForm, type Resolver, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { productSchema, type ProductFormData, type ProductData } from "@/types/product";
import { EntityField, EntitySection, entityInput } from "@/components/common/EntityField";
import type { CategoryData } from "@/types/category";
import type { UnitData } from "@/types/unit";
import { useEffect } from "react";
type ProductFormProps = {
    initialData?: ProductData;
    categories: CategoryData[];
    units: UnitData[];
    onSubmit?: (data: ProductFormData) => void;
};

export default function ProductForm({ initialData, categories, units, onSubmit }: ProductFormProps) {
    const { register, handleSubmit, reset, control, formState: { errors } } = useForm<ProductFormData>({
        resolver: zodResolver(productSchema) as Resolver<ProductFormData>,
        defaultValues: {
            name: initialData?.name ?? "",
            categoryId: initialData?.category?._id ?? "",
            unitId: initialData?.unit?._id ?? "",
            supplierId: initialData?.supplier?._id ?? "",
            quantity: initialData?.quantity ?? 0,
            threshold: initialData?.threshold ?? 10,
            basePrice: initialData?.basePrice ?? 0,
            sellingPrice: initialData?.sellingPrice ?? 0,
            isActive: initialData?.isActive ?? true,
        },
    });

    useEffect(() => {
        if (initialData) {
            reset({
                name: initialData.name,
                categoryId: initialData.category?._id,
                unitId: initialData.unit?._id,
                supplierId: initialData.supplier?._id,
                quantity: initialData.quantity,
                threshold: initialData.threshold,
                basePrice: initialData.basePrice,
                sellingPrice: initialData.sellingPrice,
                isActive: initialData.isActive,
            });
        }
    }, [initialData, reset]);

    const buyPrice = useWatch({ control, name: "basePrice" }) || 0;
    const sellPrice = useWatch({ control, name: "sellingPrice" }) || 0;
    const profit = sellPrice - buyPrice;
    const categoryOptions = categories.filter((item) => item.isActive || item._id === initialData?.category?._id);
    const unitOptions = units.filter((item) => item.isActive || item._id === initialData?.unit?._id);

    return (
        <form id="product-form" onSubmit={handleSubmit(onSubmit || (() => {}))}>
            <EntitySection title="Product details">
                <EntityField label="Product name (required)" hint="Use the name staff should search for at the register. Include the brand or size if it distinguishes this item." error={errors.name?.message}>
                    {(field) => <input {...field} {...register("name")} className={entityInput} placeholder="e.g. Dried green peas" />}
                </EntityField>
                <div className="grid gap-4 sm:grid-cols-2">
                    <EntityField label="Category (required)" hint="Groups this item with similar products in the catalog and reports." error={errors.categoryId?.message}>
                        {(field) => <select {...field} {...register("categoryId")} className={entityInput}>
                            <option value="">Choose a category</option>
                            {categoryOptions.map((item) => <option key={item._id} value={item._id}>{item.name}</option>)}
                        </select>}
                    </EntityField>
                    <EntityField label="Base measurement unit (required)" hint="Choose the unit used to track stock, such as kilograms. Set up sack and other pack conversions in Product units." error={errors.unitId?.message}>
                        {(field) => <select {...field} {...register("unitId")} className={entityInput}>
                            <option value="">Choose a unit</option>
                            {unitOptions.map((item) => <option key={item._id} value={item._id}>{item.name} ({item.shortForm})</option>)}
                        </select>}
                    </EntityField>
                </div>
            </EntitySection>

            <EntitySection title="Pricing">
                <div className="grid gap-4 sm:grid-cols-2">
                    <EntityField label="Cost price (NPR)" hint="What the store pays for one selected unit. If a 25 kg sack costs NPR 2,500 and the unit is kg, enter 100." error={errors.basePrice?.message}>
                        {(field) => <input {...field} type="number" min="0.01" step="0.01" {...register("basePrice", { valueAsNumber: true })} className={entityInput} />}
                    </EntityField>
                    <EntityField label="Selling price (NPR)" hint="What the customer pays for one selected unit. Enter a price at least as high as the cost price." error={errors.sellingPrice?.message}>
                        {(field) => <input {...field} type="number" min="0.01" step="0.01" {...register("sellingPrice", { valueAsNumber: true })} className={entityInput} />}
                    </EntityField>
                </div>
                <p className="border-l-2 border-ring bg-muted px-3 py-2 text-sm">Selling price less cost per unit <strong className="ml-2 tabular-nums">NPR {profit.toLocaleString("en-NP", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></p>
            </EntitySection>

            <EntitySection title="Stock">
                <div className="grid gap-4 sm:grid-cols-2">
                    <EntityField label={initialData ? "Current stock" : "Opening stock"} hint={initialData ? "Use stock movements or stock reconciliation to change the recorded quantity." : "Enter stock you already have in the base unit. Leave 0 if you will record the stock through supplier deliveries."} error={errors.quantity?.message}>
                        {(field) => <input {...field} type="number" min="0" step="any" {...register("quantity", { valueAsNumber: true })} readOnly={Boolean(initialData)} className={entityInput + " read-only:bg-muted"} />}
                    </EntityField>
                    <EntityField label="Low-stock threshold" hint="A low-stock warning appears at or below this quantity. Enter at least 10 base units." error={errors.threshold?.message}>
                        {(field) => <input {...field} type="number" min="10" step="any" {...register("threshold", { valueAsNumber: true })} className={entityInput} />}
                    </EntityField>
                </div>
            </EntitySection>
        </form>
    );
}
