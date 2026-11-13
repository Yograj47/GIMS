import { useEffect } from "react";
import { useForm, type Resolver, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Store, Bell, Loader2, Mail, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { generalSettingsSchema, type GeneralSettingsFormData } from "@/types/setting";
import { useSettings } from "../hooks/useSettings";
import { SettingsPageHeader } from "../components/SettingsPageHeader";

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
    <div className="min-w-0">
      <SettingsPageHeader title="General settings" description="Manage your store details and stock alert preferences." icon={Globe} />
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-4xl space-y-5">
        <section className="rounded-xl border border-slate-200 bg-white">
          <h2 className="flex items-center gap-2 border-b border-slate-200 px-4 py-3 text-sm font-semibold sm:px-6">
            <Store size={17} className="text-brand-700" aria-hidden="true" /> Store details
          </h2>
          <div className="grid gap-4 p-4 sm:p-6 xl:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="settings-store-name">Store name</Label>
              <Input id="settings-store-name" {...register("storeName")} />
              {errors.storeName && <p role="alert" className="text-sm text-red-700">{errors.storeName.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="settings-location">Store location</Label>
              <Input id="settings-location" {...register("location")} />
              {errors.location && <p role="alert" className="text-sm text-red-700">{errors.location.message}</p>}
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white">
          <h2 className="flex items-center gap-2 border-b border-slate-200 px-4 py-3 text-sm font-semibold sm:px-6">
            <Bell size={17} className="text-brand-700" aria-hidden="true" /> Stock alerts
          </h2>
          <div className="space-y-5 p-4 sm:p-6">
            <div className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 p-3 sm:p-4">
              <div className="flex min-w-0 items-center gap-3">
                <Mail size={19} className="hidden shrink-0 text-brand-700 sm:block" aria-hidden="true" />
                <div>
                  <Label htmlFor="settings-email-alerts">Email notifications</Label>
                  <p className="mt-1 text-sm text-slate-600">Send an email when stock runs low.</p>
                </div>
              </div>
              <Switch id="settings-email-alerts" checked={isNotificationsEnabled}
                onCheckedChange={(checked) => setValue("enableEmailNotifications", checked, { shouldDirty: true })} />
            </div>
            {isNotificationsEnabled && (
              <div className="grid gap-4 xl:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="settings-low-stock">Low-stock threshold</Label>
                  <Input id="settings-low-stock" type="number" min={0} {...register("lowStockThreshold", { valueAsNumber: true })} />
                  {errors.lowStockThreshold && <p role="alert" className="text-sm text-red-700">{errors.lowStockThreshold.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="settings-admin-email">Alert recipient email</Label>
                  <Input id="settings-admin-email" type="email" {...register("adminEmail")} />
                  {errors.adminEmail && <p role="alert" className="text-sm text-red-700">{errors.adminEmail.message}</p>}
                </div>
              </div>
            )}
          </div>
        </section>
        <div className="flex justify-end">
          <Button type="submit" disabled={!isDirty || isLoading} className="w-full sm:w-auto">
            {isLoading && <Loader2 className="motion-safe:animate-spin" size={16} aria-hidden="true" />}
            {isLoading ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
