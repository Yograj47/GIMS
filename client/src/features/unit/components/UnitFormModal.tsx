import { useEffect } from "react";
import { useForm, Controller, type Resolver, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Scale, Loader2 } from "lucide-react";
import { unitSchema, type UnitFormData, type UnitData } from "@/types/Unit";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
    if (isBaseUnit) {
      setValue("multiplierToBase", 1);
    }
  }, [isBaseUnit, setValue]);

  useEffect(() => {
    if (isOpen) {
      reset(initialData || {
        name: "",
        shortForm: "",
        unitType: "count",
        multiplierToBase: 1,
        baseUnit: false,
        isFractional: false,
        isActive: true,
      });
    }
  }, [initialData, reset, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
        
        {/* Header Section */}
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h2 className="text-lg font-black text-slate-800">
              {initialData ? 'Update Configuration' : 'Define New Unit'}
            </h2>
            <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">
              Measurement Engine v1.0
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-xl text-slate-400 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
          
          {/* Name & Shortcode Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Full Name</label>
              <Input 
                {...register("name")} 
                placeholder="Kilogram" 
                className="h-11 rounded-xl font-bold border-slate-200 bg-slate-50/50 focus:bg-white transition-all" 
              />
              {errors.name && <p className="text-rose-500 text-[9px] font-bold mt-1 ml-1 uppercase">{errors.name.message}</p>}
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Shortcode</label>
              <Input 
                {...register("shortForm")} 
                placeholder="kg" 
                className="h-11 rounded-xl font-bold border-slate-200 bg-slate-50/50 focus:bg-white transition-all" 
              />
              {errors.shortForm && <p className="text-rose-500 text-[9px] font-bold mt-1 ml-1 uppercase">{errors.shortForm.message}</p>}
            </div>
          </div>

          {/* Type & Multiplier Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Category</label>
              <Controller
                control={control}
                name="unitType"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="h-11 rounded-xl font-bold border-slate-200 bg-slate-50/50 transition-all">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-slate-200 shadow-xl font-bold">
                      <SelectItem value="weight">Weight (Mass)</SelectItem>
                      <SelectItem value="volume">Volume (Liquid)</SelectItem>
                      <SelectItem value="count">Count (Pieces)</SelectItem>
                      <SelectItem value="pack">Pack (Bundles)</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Multiplier</label>
              <div className="relative">
                <Scale className={cn("absolute left-3 top-1/2 -translate-y-1/2", isBaseUnit ? "text-slate-300" : "text-slate-400")} size={16} />
                <Input 
                  type="number" 
                  step="any" 
                  {...register("multiplierToBase", { valueAsNumber: true })} 
                  disabled={isBaseUnit}
                  className={cn(
                    "pl-10 h-11 rounded-xl font-black transition-all",
                    isBaseUnit ? "bg-slate-100 text-slate-400 border-slate-100" : "bg-slate-50/50 border-slate-200"
                  )} 
                />
              </div>
            </div>
          </div>

          {/* Toggle Switches */}
          <div className="space-y-2">
            {[
              { id: "baseUnit", label: "Set as Base Unit", desc: "Primary reference for category" },
              { id: "isFractional", label: "Allow Decimals", desc: "Enable partial sales (e.g. 0.5)" },
              { id: "isActive", label: "Active Status", desc: "Availability in system" }
            ].map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 px-4 rounded-2xl border border-slate-100 bg-slate-50/30">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-slate-700 uppercase tracking-tight">{item.label}</span>
                  <span className="text-[8px] font-bold text-slate-400 uppercase">{item.desc}</span>
                </div>
                <Controller
                  control={control}
                  name={item.id as any}
                  render={({ field }) => (
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  )}
                />
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="pt-2 flex gap-3">
            <Button type="button" onClick={onClose} variant="ghost" className="flex-1 font-bold text-slate-500 hover:text-slate-800">
              Discard
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || isSubmitting} 
              className="flex-1 bg-slate-900 text-white font-bold rounded-xl shadow-lg shadow-slate-200 hover:bg-blue-600 transition-all active:scale-95"
            >
              {isLoading || isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                initialData ? 'Update Unit' : 'Save Unit'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}