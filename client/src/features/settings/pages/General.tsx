import { useEffect } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Store, Bell, Loader2, ShieldCheck, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch"; 
import { Label } from "@/components/ui/label";
import { generalSettingsSchema, type GeneralSettingsFormData } from "@/types/Setting";
import { useSettings } from "../hooks/useSettings";
import { cn } from "@/lib/utils";

export default function GeneralSettings() {
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

  useEffect(() => { fetchGeneral(); }, [fetchGeneral]);

  useEffect(() => {
    if (generalData) reset(generalData);
  }, [generalData, reset]);

  const onSubmit = async (data: GeneralSettingsFormData) => {
    await updateGeneral(data);
  };

  const isNotificationsEnabled = watch("enableEmailNotifications");

  return (
    <div className="w-full h-full flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-500 min-h-0 px-1 overflow-y-scroll">
      
      {/* HEADER SECTION */}
      <div className="flex items-end justify-between mb-8 shrink-0">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase ">
            System Settings<span className="text-blue-600">.</span>
          </h1>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mt-1">
            Global Environment Configuration
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-4xl space-y-4 pb-10">
        
        {/* SECTION 1: CORE IDENTITY */}
        <div className="group bg-white border-2 border-slate-100 rounded-[2rem] p-8 shadow-sm transition-all hover:border-slate-200">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-slate-900 text-white rounded-2xl shadow-lg rotate-3">
              <Store size={22} strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-lg uppercase tracking-tight">Core Identity</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Storefront & Location Specs</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Official Store Name</Label>
              <Input 
                {...register("storeName")} 
                placeholder="PRO-TECH SYSTEMS" 
                className="h-12 rounded-xl border-2 border-slate-100 bg-slate-50/50 font-bold focus:bg-white focus:border-slate-900 transition-all placeholder:text-slate-300" 
              />
              {errors.storeName && <p className="text-[10px] text-red-600 font-black uppercase italic ml-1">{errors.storeName.message}</p>}
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Operations Hub</Label>
              <Input 
                {...register("location")} 
                placeholder="KATHMANDU HQ" 
                className="h-12 rounded-xl border-2 border-slate-100 bg-slate-50/50 font-bold focus:bg-white focus:border-slate-900 transition-all placeholder:text-slate-300" 
              />
              {errors.location && <p className="text-[10px] text-red-600 font-black uppercase italic ml-1">{errors.location.message}</p>}
            </div>
          </div>
        </div>

        {/* SECTION 2: AUTOMATION & ALERTS */}
        <div className="group bg-white border-2 border-slate-100 rounded-[2rem] p-8 shadow-sm transition-all hover:border-slate-200">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg -rotate-3">
              <Bell size={22} strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-lg uppercase tracking-tight">Automation & Alerts</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Inventory Threshold Management</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border-2 border-slate-100">
              <div className="flex items-center gap-4">
                <div className={cn("p-2 rounded-lg transition-colors", isNotificationsEnabled ? "bg-blue-100 text-blue-600" : "bg-slate-200 text-slate-400")}>
                  <Mail size={18} />
                </div>
                <div className="space-y-0.5">
                  <Label className="text-sm font-black text-slate-800 uppercase tracking-tight">Email Protocols</Label>
                  <p className="text-[10px] text-slate-500 font-bold uppercase">Trigger notifications for low-stock events</p>
                </div>
              </div>
              <Switch 
                checked={isNotificationsEnabled}
                onCheckedChange={(checked) => setValue("enableEmailNotifications", checked, { shouldDirty: true })} 
                className="data-[state=checked]:bg-blue-600"
              />
            </div>

            {isNotificationsEnabled && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2 animate-in slide-in-from-top-4 duration-500">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Critical Threshold (Units)</Label>
                  <Input 
                    type="number" 
                    {...register("lowStockThreshold", { valueAsNumber: true })} 
                    className="h-12 rounded-xl border-2 border-slate-100 bg-slate-50/50 font-black focus:border-slate-900 transition-all" 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Admin Dispatch Email</Label>
                  <Input 
                    {...register("adminEmail")} 
                    placeholder="ADMIN@SYSTEM.COM" 
                    className="h-12 rounded-xl border-2 border-slate-100 bg-slate-50/50 font-bold focus:border-slate-900 transition-all" 
                  />
                  {errors.adminEmail && <p className="text-[10px] text-red-600 font-black uppercase italic ml-1">{errors.adminEmail.message}</p>}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* FOOTER ACTION */}
        <div className="flex justify-end pt-6">
          <Button 
            disabled={!isDirty || isLoading}
            type="submit" 
            className="bg-slate-900 hover:bg-blue-600 h-14 rounded-2xl px-12 font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-blue-100 transition-all active:scale-95 disabled:opacity-30 disabled:grayscale"
          >
            {isLoading ? <Loader2 className="animate-spin" size={20} /> : <ShieldCheck size={20} className="mr-2" />}
            Deploy Configuration
          </Button>
        </div>
      </form>
    </div>
  );
}