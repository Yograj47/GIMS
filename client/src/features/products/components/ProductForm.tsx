import { useForm, type Resolver, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { productSchema, type ProductFormData, type ProductData } from "@/types/Product";
import { TrendingUp, BadgeIndianRupee, Package, AlertCircle, Percent } from "lucide-react";
import type { CategoryData } from "@/types/Category";
import type { UnitData } from "@/types/Unit";
import { useEffect } from "react";
import Select from "react-select";

type ProductFormProps = {
    initialData?: ProductData;
    categories: CategoryData[];
    units: UnitData[];
    onSubmit?: (data: ProductFormData) => void;
};

export default function ProductForm({ initialData, categories, units, onSubmit }: ProductFormProps) {
    const { register, handleSubmit, watch, reset, control, formState: { errors } } = useForm<ProductFormData>({
        resolver: zodResolver(productSchema) as Resolver<ProductFormData>,
        defaultValues: {
            name: initialData?.name ?? "",
            categoryId: initialData?.category?._id ?? "",
            unitId: initialData?.unit?._id ?? "",
            supplierId: initialData?.supplier?._id ?? "",
            quantity: initialData?.quantity ?? 0,
            threshold: initialData?.threshold ?? 0,
            basePrice: initialData?.basePrice ?? 0,
            sellingPrice: initialData?.sellingPrice ?? 0,
            isActive: initialData?.isActive ?? true,
        },
    });

    const categoryOptions = categories?.map(c => ({ value: c._id, label: c.name })) || [];
    const unitOptions = units?.map(u => ({ value: u._id, label: `${u.name} (${u.shortForm})` })) || [];

    const customSelectStyles = {
        control: (base: any, state: any) => ({
            ...base,
            borderRadius: '0.125rem',
            padding: '2px',
            fontSize: '13px',
            border: state.isFocused ? '1px solid #2563eb' : '1px solid #e2e8f0',
            boxShadow: 'none',
            backgroundColor: 'white',
            '&:hover': { border: '1px solid #cbd5e1' }
        }),
    };

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

    const buyPrice = watch("basePrice") || 0;
    const sellPrice = watch("sellingPrice") || 0;
    const profit = sellPrice - buyPrice;
    const profitPercentage = buyPrice > 0 ? ((profit / buyPrice) * 100).toFixed(1) : 0;

    const inputStyle = "w-full rounded-sm border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 transition-all font-medium placeholder:text-slate-300";
    const labelStyle = "text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2";
    const sectionTitle = "font-black uppercase tracking-[0.15em] text-[10px] text-blue-600 mb-4 flex items-center gap-2";

    return (
        <form id="product-form" onSubmit={handleSubmit(onSubmit || (() => { }))} className="w-full space-y-8">
            {/* Section 1: Basic Info */}
            <div>
                <div className={sectionTitle}>
                    <Package size={14} strokeWidth={3} /> Basic Identity
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="md:col-span-2 space-y-2">
                        <label className={labelStyle}>Full Product Name <span className="text-red-500">*</span></label>
                        <input {...register("name")} placeholder="Search or enter product name..." className={inputStyle} />
                        {errors.name && <p className="text-[10px] text-red-500 font-bold mt-1 uppercase">{errors.name.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <label className={labelStyle}>Classification <span className="text-red-500">*</span></label>
                        <Controller
                            name="categoryId"
                            control={control}
                            render={({ field }) => (
                                <Select
                                    {...field}
                                    options={categoryOptions}
                                    value={categoryOptions.find(opt => opt.value === field.value)}
                                    onChange={(val) => field.onChange(val?.value)}
                                    styles={customSelectStyles}
                                    isClearable
                                />
                            )}
                        />
                        {errors.categoryId && <p className="text-[10px] text-red-500 font-bold mt-1 uppercase">{errors.categoryId.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <label className={labelStyle}>Standard Unit <span className="text-red-500">*</span></label>
                        <Controller
                            name="unitId"
                            control={control}
                            render={({ field }) => (
                                <Select
                                    {...field}
                                    options={unitOptions}
                                    value={unitOptions.find(opt => opt.value === field.value)}
                                    onChange={(val) => field.onChange(val?.value)}
                                    styles={customSelectStyles}
                                    isClearable
                                />
                            )}
                        />
                        {errors.unitId && <p className="text-[10px] text-red-500 font-bold mt-1 uppercase">{errors.unitId.message}</p>}
                    </div>
                </div>
            </div>

            {/* Section 2: Pricing Logic */}
            <div className="bg-slate-50 border border-slate-200 p-5 rounded-sm">
                <div className={sectionTitle}>
                    <BadgeIndianRupee size={14} strokeWidth={3} /> Valuation Logic
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                        <label className={labelStyle}>Base Cost (Unit)</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">Rs.</span>
                            <input type="number" {...register("basePrice", { valueAsNumber: true })} className={`${inputStyle} pl-10`} />
                            {errors.basePrice && <p className="text-[10px] text-red-500 font-bold mt-1 uppercase">{errors.basePrice.message}</p>}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className={labelStyle}>Market Price (Retail)</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600 font-bold text-xs">Rs.</span>
                            <input type="number" {...register("sellingPrice", { valueAsNumber: true })} className={`${inputStyle} pl-10 border-blue-100`} />
                            {errors.sellingPrice && <p className="text-[10px] text-red-500 font-bold mt-1 uppercase">{errors.sellingPrice.message}</p>}
                        </div>
                    </div>

                    <div className={`md:col-span-2 flex items-center justify-between p-4 bg-white border ${profit >= 0 ? "border-emerald-100" : "border-red-100"}`}>
                        <div className="flex items-center gap-3">
                            <TrendingUp size={18} className={profit >= 0 ? "text-emerald-500" : "text-red-500"} />
                            <div>
                                <p className="text-[9px] font-bold uppercase text-slate-400 leading-none mb-1">Projected Net Margin</p>
                                <p className={`text-lg font-black ${profit >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                                    Rs.{profit.toLocaleString()}
                                </p>
                            </div>
                        </div>
                        <div className="text-right flex items-center gap-2">
                            <Percent size={12} className="text-slate-300" />
                            <span className={`px-2 py-0.5 rounded-sm font-black text-[11px] ${profit >= 0 ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
                                {profitPercentage}%
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Section 3: Stock Control */}
            <div>
                <div className={sectionTitle}>
                    <AlertCircle size={14} strokeWidth={3} /> Stock Parameters
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                        <label className={labelStyle}>In-Hand Quantity</label>
                        <input type="number" {...register("quantity", { valueAsNumber: true })} className={inputStyle} />
                    </div>
                    <div className="space-y-2">
                        <label className={labelStyle}>Critical Alert Level</label>
                        <input type="number" {...register("threshold", { valueAsNumber: true })} className={inputStyle} />
                        {errors.threshold && <p className="text-[10px] text-red-500 font-bold mt-1 uppercase">{errors.threshold.message}</p>}
                    </div>
                </div>
            </div>
        </form>
    );
}