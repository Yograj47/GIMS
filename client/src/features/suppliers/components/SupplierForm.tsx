import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supplierSchema, type SupplierType } from "@/types/Supplier";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface SupplierFormProps {
  initialData?: SupplierType;
  onSubmit: (data: SupplierType) => void;
  isLoading: boolean;
}

export default function SupplierForm({ initialData, onSubmit, isLoading }: SupplierFormProps) {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm<SupplierType>({
    resolver: zodResolver(supplierSchema) as Resolver<SupplierType>,
    defaultValues: initialData
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
      
      {/* SECTION 1: Supplier Information */}
      <section className="space-y-4">
        <h3 className="text-lg font-black text-slate-800 border-b border-slate-100 pb-2 uppercase tracking-tight">Supplier Identity</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500">Supplier Name <span className="text-red-500">*</span></label>
            <Input {...register("name")} placeholder="e.g., ABC Wholesalers" className="h-11 rounded-xl border-slate-200" />
            {errors.name && <p className="text-[10px] font-bold text-red-500 uppercase">{errors.name.message}</p>}
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500">Phone Number <span className="text-red-500">*</span></label>
            <Input {...register("phone")} placeholder="+977-1-XXXXXXX" className="h-11 rounded-xl border-slate-200" />
            {errors.phone && <p className="text-[10px] font-bold text-red-500 uppercase">{errors.phone.message}</p>}
          </div>
        </div>
      </section>

      {/* SECTION 2: Location & Contact */}
      <section className="space-y-4">
        <h3 className="font-black text-slate-800 border-b border-slate-100 pb-2 uppercase tracking-tight text-sm">Location Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500">Email Address</label>
            <Input type="email" placeholder="supplier@example.com" className="h-11 rounded-xl border-slate-200" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500">City <span className="text-red-500">*</span></label>
            <Input placeholder="e.g. Kathmandu" className="h-11 rounded-xl border-slate-200" />
          </div>
        </div>
        <div className="space-y-1.5 pt-2">
          <label className="text-xs font-bold text-slate-500">Full Address <span className="text-red-500">*</span></label>
          <Input {...register("address")} placeholder="Street name, Ward No, Area" className="h-11 rounded-xl border-slate-200" />
        </div>
      </section>

      {/* SECTION 3: Additional Notes */}
      <section className="space-y-4">
        <h3 className="text-lg font-black text-slate-800 border-b border-slate-100 pb-2 uppercase tracking-tight">Internal Notes</h3>
        <div className="space-y-1.5">
          <Textarea {...register("notes")} placeholder="Add any specific delivery instructions or credit terms..." className="min-h-30 rounded-xl resize-none border-slate-200 focus:ring-blue-500" />
        </div>
      </section>

      {/* ACTIONS */}
      <div className="flex items-center gap-4 pt-6">
        <Button 
            type="submit" 
            disabled={isLoading} 
            className="bg-blue-600 hover:bg-blue-700 px-12 h-12 rounded-xl font-bold text-sm shadow-md transition-all active:scale-95"
        >
          {isLoading ? <Loader2 className="animate-spin mr-2" size={18} /> : "Save Supplier"}
        </Button>
        <Button 
            type="button" 
            variant="outline" 
            onClick={() => navigate(-1)} 
            className="px-12 h-12 rounded-xl font-bold text-sm border-slate-200 text-slate-500 hover:bg-slate-50"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}