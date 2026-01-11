import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { type ProductAPIResponse, productSchema, type ProductFormData } from "@/interface/Product";

type ProductFormProps = {
    initialData?: ProductAPIResponse;
    onSubmit?: (data: ProductFormData) => void;
};

export default function ProductForm({ initialData, onSubmit }: ProductFormProps) {
    const {
        register,
        handleSubmit,
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

    const input = "w-full rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
    const error = "text-xs text-red-500 mt-1"

    const onInternalSubmit = (data: ProductFormData) => {
        if (onSubmit) {
            onSubmit(data);
        }
    };

    return (
        <form id="product-form" onSubmit={handleSubmit(onInternalSubmit)} className="w-full">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 p-2">

                {/* Product Name */}
                <div className="md:col-span-2 space-y-1">
                    <label className="text-sm font-medium text-gray-700">
                        Product Name <span className="text-red-500">*</span>
                    </label>
                    <input
                        {...register("name")}
                        placeholder="e.g. Basmati Rice"
                        className={input}
                    />
                    {errors.name && <p className={error}>{errors.name.message}</p>}
                </div>

                {/* Category */}
                <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">
                        Category <span className="text-red-500">*</span>
                    </label>
                    <select {...register("categoryId")} className={input}>
                        <option value="">Select category</option>
                        {/* categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>) */}
                    </select>
                    {errors.categoryId && <p className={error}>{errors.categoryId.message}</p>}
                </div>

                {/* Unit */}
                <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">
                        Unit <span className="text-red-500">*</span>
                    </label>
                    <select {...register("unitId")} className={input}>
                        <option value="">Select unit</option>
                    </select>
                    {errors.unitId && <p className={error}>{errors.unitId.message}</p>}
                </div>

                {/* Buy Price */}
                <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">Buy Price</label>
                    <input type="number" {...register("basePrice")} className={input} />
                    {errors.basePrice && <p className={error}>{errors.basePrice.message}</p>}
                </div>

                {/* Sell Price */}
                <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">Sell Price</label>
                    <input type="number" {...register("sellingPrice")} className={input} />
                    {errors.sellingPrice && <p className={error}>{errors.sellingPrice.message}</p>}
                </div>

                {/* Stock */}
                <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">
                        Current Stock <span className="text-red-500">*</span>
                    </label>
                    <input type="number" {...register("quantity")} className={input} />
                    {errors.quantity && <p className={error}>{errors.quantity.message}</p>}
                </div>

                {/* Threshold */}
                <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">
                        Minimum Threshold <span className="text-red-500">*</span>
                    </label>
                    <input type="number" {...register("threshold")} className={input} />
                    {errors.threshold && <p className={error}>{errors.threshold.message}</p>}
                </div>

                {/* Supplier */}
                <div className="md:col-span-2 space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">Supplier</label>
                    <select {...register("supplierId")} className={input}>
                        <option value="">Select supplier</option>
                    </select>
                </div>

            </div>
        </form>
    );
}
