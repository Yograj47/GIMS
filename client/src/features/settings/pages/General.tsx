import { useEffect } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Store, Bell, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch"; 
import { Label } from "@/components/ui/label";
import { generalSettingsSchema, type GeneralSettingsFormData } from "@/types/Setting";
import { useSettings } from "../hooks/useSettings";

export default function GeneralSettings() {
  // 1. Hook Integration
  const { generalData, fetchGeneral, updateGeneral, isLoading } = useSettings();

  const { register, handleSubmit, setValue, watch, reset, formState: { errors, isDirty } } = useForm<GeneralSettingsFormData>({
    resolver: zodResolver(generalSettingsSchema) as Resolver<GeneralSettingsFormData>,
    defaultValues: {
      storeName: "",
      location: "",
      enableEmailNotifications: true,
      lowStockThreshold: 10,
      adminEmail: ""
    }
  });

  // 2. Fetch data on mount
  useEffect(() => {
    fetchGeneral();
  }, [fetchGeneral]);

  // 3. Sync form with fetched data
  useEffect(() => {
    if (generalData) {
      reset(generalData);
    }
  }, [generalData, reset]);

  const onSubmit = async (data: GeneralSettingsFormData) => {
    await updateGeneral(data);
  };

  return (
    <div className="max-w-3xl space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">General Settings</h2>
        <p className="text-slate-500 text-sm font-medium">Configure your store identity and notification preferences.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* STORE IDENTITY */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-50">
            <Store size={18} className="text-blue-600" />
            <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Store Identity</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-500 uppercase tracking-tighter">Store Name</Label>
              <Input {...register("storeName")} placeholder="Enter store name" className="h-11 rounded-xl border-slate-200 focus:ring-blue-500/10" />
              {errors.storeName && <p className="text-[10px] text-red-500 font-bold uppercase">{errors.storeName.message}</p>}
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-500 uppercase tracking-tighter">Primary Location</Label>
              <Input {...register("location")} placeholder="e.g. Kathmandu" className="h-11 rounded-xl border-slate-200 focus:ring-blue-500/10" />
              {errors.location && <p className="text-[10px] text-red-500 font-bold uppercase">{errors.location.message}</p>}
            </div>
          </div>
        </div>

        {/* NOTIFICATIONS */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-50">
            <Bell size={18} className="text-orange-500" />
            <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Notifications & Alerts</h3>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50/50 rounded-xl border border-slate-100">
            <div className="space-y-0.5">
              <Label className="text-sm font-bold text-slate-700">Low Stock Email Alerts</Label>
              <p className="text-[11px] text-slate-500 font-medium">Receive an email when products fall below threshold.</p>
            </div>
            <Switch 
              checked={watch("enableEmailNotifications")}
              onCheckedChange={(checked) => setValue("enableEmailNotifications", checked, { shouldDirty: true })} 
            />
          </div>

          {watch("enableEmailNotifications") && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 animate-in slide-in-from-top-2 duration-300">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-500 uppercase tracking-tighter">Alert Threshold</Label>
                <Input 
                   type="number" 
                   {...register("lowStockThreshold", { valueAsNumber: true })} 
                   className="h-11 rounded-xl border-slate-200 focus:ring-blue-500/10" 
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-500 uppercase tracking-tighter">Recipient Email</Label>
                <Input {...register("adminEmail")} placeholder="admin@store.com" className="h-11 rounded-xl border-slate-200 focus:ring-blue-500/10" />
                {errors.adminEmail && <p className="text-[10px] text-red-500 font-bold uppercase">{errors.adminEmail.message}</p>}
              </div>
            </div>
          )}
        </div>

        {/* SAVE BUTTON */}
        <div className="flex justify-end pt-4">
          <Button 
            disabled={!isDirty || isLoading}
            type="submit" 
            className="bg-blue-600 hover:bg-blue-700 h-12 rounded-xl px-10 font-black shadow-lg shadow-blue-100 gap-2 transition-all active:scale-95 disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            Save Configuration
          </Button>
        </div>
      </form>
    </div>
  );
}