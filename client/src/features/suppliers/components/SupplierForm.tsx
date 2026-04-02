import { Controller, useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { User, MapPin, Notebook, Phone, Mail, Power } from "lucide-react";
import { supplierSchema, type SupplierData, type SupplierFormData } from "@/types/Supplier"
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

    const inputStyle = "w-full rounded-sm border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 transition-all font-medium placeholder:text-slate-300";
    const labelStyle = "text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2";
    const sectionTitle = "font-black uppercase tracking-[0.15em] text-[10px] text-blue-600 mb-4 flex items-center gap-2";

    return (
        <form id="supplier-form" onSubmit={handleSubmit(onSubmit)} className="w-full space-y-8">
            
            {/* Section 1: Basic Identity */}
            <div>
                <div className={sectionTitle}>
                    <User size={14} strokeWidth={3} /> Partner Identity
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="md:col-span-2 space-y-2">
                        <label className={labelStyle}>Full Company Name <span className="text-red-500">*</span></label>
                        <input {...register("name")} placeholder="Legal entity name..." className={inputStyle} />
                        {errors.name && <p className="text-[10px] text-red-500 font-bold mt-1 uppercase">{errors.name.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <label className={labelStyle}><Phone size={12}/> Direct Contact <span className="text-red-500">*</span></label>
                        <input {...register("phone")} placeholder="+977-1-XXXXXXX" className={inputStyle} />
                        {errors.phone && <p className="text-[10px] text-red-500 font-bold mt-1 uppercase">{errors.phone.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <label className={labelStyle}><Mail size={12}/> Email Registry</label>
                        <input {...register("email")} type="email" placeholder="vendor@domain.com" className={inputStyle} />
                    </div>
                </div>
            </div>

            {/* Section 2: Geographic Parameters (Styled like Product Valuation Box) */}
            <div className="bg-slate-50 border border-slate-300 p-5 rounded-sm">
                <div className={sectionTitle}>
                    <MapPin size={14} strokeWidth={3} /> Geographic Parameters
                </div>
                <div className="space-y-2">
                    <label className={labelStyle}>Full Physical Address <span className="text-red-500">*</span></label>
                    <input {...register("address")} placeholder="Warehouse location, Street, City..." className={inputStyle} />
                    {errors.address && <p className="text-[10px] text-red-500 font-bold mt-1 uppercase">{errors.address.message}</p>}
                </div>
            </div>

            {/* Section 3: Internal Notes */}
            <div>
                <div className={sectionTitle}>
                    <Notebook size={14} strokeWidth={3} /> Procurement Notes
                </div>
                <textarea 
                    {...register("notes")} 
                    placeholder="Enter credit terms, delivery windows, or historical notes..." 
                    className={`${inputStyle} min-h-25 resize-none`}
                />
            </div>

            {/* Status Check */}
            <div className="flex items-center justify-between p-4 bg-white border border-slate-300 rounded-sm">
                <div className="flex items-center gap-3">
                    <Power size={18} className="text-slate-400" />
                    <div>
                        <p className="text-[9px] font-bold uppercase text-slate-400 leading-none mb-1">System Visibility</p>
                        <p className="text-sm font-black text-slate-900 uppercase">Partner Active Status</p>
                    </div>
                </div>
                <Controller
                    control={control}
                    name="isActive"
                    render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} />}
                />
            </div>
        </form>
    );
}