import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { type ProductAPIResponse, productSchema, type ProductFormData } from "@/interface/Product";
import { TrendingUp, BadgeIndianRupee, Package, AlertCircle } from "lucide-react";

type ProductFormProps = {
    initialData?: ProductAPIResponse;
    onSubmit?: (data: ProductFormData) => void;
};

export default function ProductForm({ initialData, onSubmit }: ProductFormProps) {
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<ProductFormData>({
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

    // Watch prices to calculate profit in real-time
    const buyPrice = watch("basePrice") || 0;
    const sellPrice = watch("sellingPrice") || 0;
    const profit = sellPrice - buyPrice;
    const profitPercentage = buyPrice > 0 ? ((profit / buyPrice) * 100).toFixed(0) : 0;

    const inputStyle = "w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium";
    const labelStyle = "text-[13px] font-bold text-slate-700 flex items-center gap-2";
    const errorStyle = "text-xs text-red-500 font-medium mt-1 ml-1";

    return (
        <form id="product-form" onSubmit={handleSubmit(onSubmit || (() => {}))} className="w-full space-y-8">
            
            {/* Section 1: Basic Info */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 text-blue-600 mb-2">
                    <Package size={18} strokeWidth={2.5} />
                    <h2 className="font-black uppercase tracking-wider text-xs">General Information</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2 space-y-2">
                        <label className={labelStyle}>Product Name <span className="text-red-500">*</span></label>
                        <input {...register("name")} placeholder="e.g. Premium Basmati Rice" className={inputStyle} />
                        {errors.name && <p className={errorStyle}>{errors.name.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <label className={labelStyle}>Category <span className="text-red-500">*</span></label>
                        <select {...register("categoryId")} className={inputStyle}>
                            <option value="">Select category</option>
                            <option value="cat1">Grains</option>
                            <option value="cat2">Oils</option>
                        </select>
                        {errors.categoryId && <p className={errorStyle}>{errors.categoryId.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <label className={labelStyle}>Unit of Measure <span className="text-red-500">*</span></label>
                        <select {...register("unitId")} className={inputStyle}>
                            <option value="">Select unit</option>
                            <option value="u1">kg</option>
                            <option value="u2">Litre</option>
                        </select>
                        {errors.unitId && <p className={errorStyle}>{errors.unitId.message}</p>}
                    </div>
                </div>
            </div>

            {/* Section 2: Pricing & Profit Calculator */}
            <div className="space-y-4 bg-blue-50/30 p-6 rounded-2xl border border-blue-100">
                <div className="flex items-center gap-2 text-blue-600 mb-2">
                    <BadgeIndianRupee size={18} strokeWidth={2.5} />
                    <h2 className="font-black uppercase tracking-wider text-xs">Pricing & Profit</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className={labelStyle}>Buying Price (Cost)</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                            <input type="number" {...register("basePrice", { valueAsNumber: true })} className={`${inputStyle} pl-8`} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className={labelStyle}>Selling Price (Retail)</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-600 font-bold">₹</span>
                            <input type="number" {...register("sellingPrice", { valueAsNumber: true })} className={`${inputStyle} pl-8 border-blue-200 focus:ring-blue-500/20`} />
                        </div>
                    </div>

                    {/* LIVE PROFIT PREVIEW CARD */}
                    <div className={`md:col-span-2 flex items-center justify-between p-4 rounded-xl border-2 border-dashed transition-all ${
                        profit >= 0 ? "bg-emerald-50 border-emerald-200" : "bg-red-50 border-red-200"
                    }`}>
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${profit >= 0 ? "bg-emerald-500 text-white" : "bg-red-500 text-white"}`}>
                                <TrendingUp size={20} />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 leading-none mb-1">Estimated Profit</p>
                                <p className={`text-xl font-black ${profit >= 0 ? "text-emerald-700" : "text-red-700"}`}>
                                    ₹{profit} <span className="text-sm font-medium opacity-70">per unit</span>
                                </p>
                            </div>
                        </div>
                        {profit > 0 && (
                            <div className="text-right">
                                <p className="text-[10px] font-bold uppercase text-slate-500 mb-1">Margin</p>
                                <span className="bg-emerald-200 text-emerald-800 px-3 py-1 rounded-full font-black text-xs">
                                    {profitPercentage}%
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Section 3: Inventory */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 text-blue-600 mb-2">
                    <AlertCircle size={18} strokeWidth={2.5} />
                    <h2 className="font-black uppercase tracking-wider text-xs">Inventory Controls</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className={labelStyle}>Current Stock Amount</label>
                        <input type="number" {...register("quantity", { valueAsNumber: true })} className={inputStyle} />
                    </div>
                    <div className="space-y-2">
                        <label className={labelStyle}>Low Stock Alert at</label>
                        <input type="number" {...register("threshold", { valueAsNumber: true })} className={inputStyle} />
                    </div>
                </div>
            </div>
        </form>
    );
}