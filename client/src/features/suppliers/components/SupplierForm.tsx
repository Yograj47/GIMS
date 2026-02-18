import { Controller, useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { User, MapPin, Notebook, Phone, Mail} from "lucide-react";
import { supplierSchema, type SupplierData, type SupplierFormData } from "@/types/Supplier"
import { useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface SupplierFormProps {
    initialData?: SupplierData;
    onSubmit: (data: SupplierFormData) => void;
}

export default function SupplierForm({ initialData, onSubmit}: SupplierFormProps) {

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
        if (initialData) reset({
            name: initialData.name,
            phone: initialData.phone,
            email: initialData.email,
            address: initialData.address,
            notes: initialData.notes,
            isActive: initialData.isActive,
        });
    }, [initialData, reset]);

    const labelStyle = "text-[13px] font-bold text-slate-700 flex items-center gap-2";
    const sectionHeaderStyle = "flex items-center gap-2 text-blue-600 mb-4";
    const errorStyle = "text-xs text-red-500 font-medium mt-1 ml-1";

    return (
        <form id="supplier-form" onSubmit={handleSubmit(onSubmit || (() => {}))} className="space-y-10">
            
            {/* SECTION 1: Identity */}
            <div className="space-y-4">
                <div className={sectionHeaderStyle}>
                    <User size={18} strokeWidth={2.5} />
                    <h2 className="font-black uppercase tracking-wider text-xs">Supplier Identity</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className={labelStyle}>Supplier Name <span className="text-red-500">*</span></label>
                        <Input {...register("name")} placeholder="e.g. ABC Wholesalers" className="rounded-xl border-slate-200 bg-slate-50/50 h-12" />
                        {errors.name && <p className={errorStyle}>{errors.name.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <label className={labelStyle}>
                            <Phone size={14} className="text-slate-400" /> Phone Number <span className="text-red-500">*</span>
                        </label>
                        <Input {...register("phone")} placeholder="+977-1-XXXXXXX" className="rounded-xl border-slate-200 bg-slate-50/50 h-12" />
                        {errors.phone && <p className={errorStyle}>{errors.phone.message}</p>}
                    </div>
                </div>
            </div>

            {/* SECTION 2: Location */}
            <div className="space-y-4 bg-blue-50/30 p-6 rounded-2xl border border-blue-100">
                <div className={sectionHeaderStyle}>
                    <MapPin size={18} strokeWidth={2.5} />
                    <h2 className="font-black uppercase tracking-wider text-xs">Contact & Location</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className={labelStyle}>
                            <Mail size={14} className="text-slate-400" /> Email Address
                        </label>
                        <Input {...register("email")} type="email" placeholder="supplier@example.com" className="rounded-xl border-blue-200 focus:ring-blue-500/20 h-12" />
                        {errors.email && <p className={errorStyle}>{errors.email.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <label className={labelStyle}>Full Address <span className="text-red-500">*</span></label>
                        <Input {...register("address")} placeholder="Street name, City, Area" className="rounded-xl border-blue-200 focus:ring-blue-500/20 h-12" />
                        {errors.address && <p className={errorStyle}>{errors.address.message}</p>}
                    </div>
                </div>
            </div>

            {/* SECTION 3: Notes */}
            <div className="space-y-4">
                <div className={sectionHeaderStyle}>
                    <Notebook size={18} strokeWidth={2.5} />
                    <h2 className="font-black uppercase tracking-wider text-xs">Internal Notes</h2>
                </div>
                <div className="space-y-2">
                    <Textarea 
                        {...register("notes")} 
                        placeholder="Add any specific delivery instructions or credit terms..." 
                        className="min-h-30 rounded-2xl border-slate-200 bg-slate-50/50 resize-none p-4" 
                    />
                </div>
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 pt-3">
              <div className="space-y-0.5">
                <Label className="text-sm font-bold text-slate-700">Active Status</Label>
                <p className="text-[10px] text-slate-500 font-medium">Disable to hide from selection menus.</p>
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