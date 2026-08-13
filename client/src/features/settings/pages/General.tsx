import { useEffect } from "react";
import { useForm, type Resolver, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Store, Bell, Loader2, ShieldCheck, Mail, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { generalSettingsSchema, type GeneralSettingsFormData } from "@/types/setting";
import { useSettings } from "../hooks/useSettings";
import { cn } from "@/lib/utils";

export default function GeneralSettings() {
  const { generalData, fetchGeneral, updateGeneral, isLoading } = useSettings();

  const {control, register, handleSubmit, setValue, reset, formState: { errors, isDirty } } = useForm<GeneralSettingsFormData>({
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

  const isNotificationsEnabled = useWatch({
    control,
    name: "enableEmailNotifications",
  });
  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-2 duration-500">

      {/* 1. HEADER SECTION - Minimalized */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 border-b border-slate-200 pb-6">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-blue-600 rounded-sm text-white shadow-sm">
            <Globe size={18} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              General Registry
            </h1>
            <p className="text-slate-500 text-xs mt-1">
              Global System Parameters & Localization
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-5xl">

        {/* SECTION 1: CORE IDENTITY - Sharp & Industrial */}
        <div className="bg-white border border-slate-200 rounded-sm overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
            <Store size={14} className="text-slate-900" strokeWidth={3} />
            <h3 className="font-bold text-slate-900 text-[11px] uppercase tracking-widest">Core Identity</h3>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em] ml-0.5">Store Identifier</Label>
              <Input
                {...register("storeName")}
                placeholder="PRO-TECH SYSTEMS"
                className="h-10 rounded-sm border-slate-200 bg-white font-bold text-xs uppercase focus-visible:ring-blue-600 transition-all placeholder:text-slate-300"
              />
              {errors.storeName && <p className="text-[9px] text-red-600 font-bold uppercase tracking-tighter mt-1">{errors.storeName.message}</p>}
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em] ml-0.5">Physical Hub</Label>
              <Input
                {...register("location")}
                placeholder="KATHMANDU HQ"
                className="h-10 rounded-sm border-slate-200 bg-white font-bold text-xs uppercase focus-visible:ring-blue-600 transition-all placeholder:text-slate-300"
              />
              {errors.location && <p className="text-[9px] text-red-600 font-bold uppercase tracking-tighter mt-1">{errors.location.message}</p>}
            </div>
          </div>
        </div>

        {/* SECTION 2: AUTOMATION - Matched to Stock Status Logic */}
        <div className="bg-white border border-slate-200 rounded-sm overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
            <Bell size={14} className="text-blue-600" strokeWidth={3} />
            <h3 className="font-bold text-slate-900 text-[11px] uppercase tracking-widest">Alert Protocols</h3>
          </div>

          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-sm">
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-10 h-10 rounded-sm flex items-center justify-center transition-all border",
                  isNotificationsEnabled ? "bg-white border-blue-200 text-blue-600 shadow-sm" : "bg-slate-100 border-slate-200 text-slate-400"
                )}>
                  <Mail size={18} />
                </div>
                <div>
                  <Label className="text-[11px] font-black text-slate-900 uppercase tracking-tight">Email Dispatch</Label>
                  <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter">Automated Low-Stock Transmissions</p>
                </div>
              </div>
              <Switch
                checked={isNotificationsEnabled}
                onCheckedChange={(checked) => setValue("enableEmailNotifications", checked, { shouldDirty: true })}
                className="data-[state=checked]:bg-blue-600 rounded-full"
              />
            </div>

            {isNotificationsEnabled && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.15em] ml-0.5">Critical Floor (Units)</Label>
                  <Input
                    type="number"
                    {...register("lowStockThreshold", { valueAsNumber: true })}
                    className="rounded-sm border-slate-200 font-black text-xs h-10"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.15em] ml-0.5">Primary Dispatch Target</Label>
                  <Input
                    {...register("adminEmail")}
                    placeholder="ADMIN@SYSTEM.COM"
                    className="rounded-sm border-slate-200 font-bold text-xs h-10 uppercase"
                  />
                  {errors.adminEmail && <p className="text-[9px] text-red-600 font-black uppercase tracking-tighter mt-1">{errors.adminEmail.message}</p>}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* FOOTER ACTION - Integrated & Professional */}
        <div className="flex justify-end pt-4">
          <Button
            disabled={!isDirty || isLoading}
            type="submit"
            className="bg-blue-600 hover:bg-slate-900 text-white h-10 rounded-sm px-8 font-black text-[10px] uppercase tracking-[0.2em] transition-all active:scale-95 disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="animate-spin" size={16} /> : <ShieldCheck size={16} className="mr-2" strokeWidth={3} />}
            Commit Changes
          </Button>
        </div>
      </form>
    </div>
  );
}