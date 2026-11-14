import { useEffect } from "react";
import { useForm, Controller, type Resolver, useWatch} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Loader2, AlertCircle } from "lucide-react";
import { unitSchema, type UnitData, type UnitFormData } from "@/types/unit";
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
    if (isBaseUnit) setValue("multiplierToBase", 1);
  }, [isBaseUnit, setValue]);

  useEffect(() => {
    if (isOpen) {
      reset(
        initialData
          ? {
            name: initialData.name,
            shortForm: initialData.shortForm,
            unitType: initialData.unitType,
            multiplierToBase: initialData.multiplierToBase,
            baseUnit: initialData.baseUnit,
            isFractional: initialData.isFractional,
            isActive: initialData.isActive,
          }
          : {
            name: "",
            shortForm: "",
            unitType: "count",
            multiplierToBase: 1,
            baseUnit: false,
            isFractional: false,
            isActive: true,
          }
      );
    }
  }, [initialData, reset, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 grid place-items-center overflow-y-auto overscroll-contain p-4 bg-slate-900/40 backdrop-blur-[2px] animate-in fade-in duration-200"><div className="bg-card w-full max-w-110 rounded-md shadow-xl border border-border">

      <div className="px-6 py-4 border-b border-border flex justify-between items-center">
        <div>
          <h2 className="text-sm font-bold text-foreground">
            {initialData ? "Edit Unit" : "New Unit"}
          </h2>
          <p className="text-[11px] text-muted-foreground">Configure measurement settings</p>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-muted rounded text-subtle-foreground transition-colors">
          <X size={18} />
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">

        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2 space-y-1.5">
            <label className="text-[11px] font-medium text-muted-foreground ml-0.5">Unit Name</label>
            <Input
              {...register("name")}
              placeholder="e.g. Kilogram"
              className="h-9 rounded-md border-border text-sm focus-visible:ring-ring focus-visible:ring-1 focus-visible:border-brand-500 transition-all"
            />
            {errors.name && (
              <p className="text-[10px] text-rose-500 mt-1 flex items-center gap-1">
                <AlertCircle size={10} /> {errors.name.message}
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-muted-foreground ml-0.5">Symbol</label>
            <Input
              {...register("shortForm")}
              placeholder="e.g. kg"
              className="h-9 rounded-md border-border text-sm font-medium focus-visible:ring-1 text-center"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-muted-foreground ml-0.5">Type</label>
            <Controller
              control={control}
              name="unitType"
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className="h-9 rounded-md border-border text-sm focus-visible:ring-ring focus-visible:ring-1 focus-visible:border-brand-500">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent className="z-200 rounded-md border-border shadow-lg text-sm">
                    <SelectItem value="weight">Weight</SelectItem>
                    <SelectItem value="volume">Volume</SelectItem>
                    <SelectItem value="count">Count</SelectItem>
                    <SelectItem value="pack">Pack</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-muted-foreground ml-0.5">Multiplier</label>
            <div className="relative">
              <Input
                type="number"
                step="any"
                {...register("multiplierToBase", { valueAsNumber: true })}
                disabled={isBaseUnit}
                className={cn(
                  "h-9 rounded-md text-sm tabular-nums text-right pr-3",
                  isBaseUnit ? "bg-muted text-subtle-foreground border-border" : "bg-card border-border focus-visible:ring-ring focus-visible:ring-1 focus-visible:border-brand-500"
                )}
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] text-subtle-foreground">×</span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          {[
            { id: "baseUnit", label: "Master Base Unit", desc: "Reference for this type" },
            { id: "isFractional", label: "Allow Fractions", desc: "Enable decimal quantities" },
            { id: "isActive", label: "Active Status", desc: "Available for selection" }
          ].map((item) => (
            <div key={item.id} className="flex items-center justify-between p-3 bg-muted/50 border border-border rounded-md">
              <div className="flex flex-col">
                <span className="text-[11px] font-semibold text-foreground">{item.label}</span>
                <span className="text-[10px] text-subtle-foreground">{item.desc}</span>
              </div>
              <Controller
                control={control}
                name={item.id as "name" | "shortForm" | "unitType" | "multiplierToBase" | "baseUnit" | "isFractional" | "isActive"}render={({ field }) => (
                  <Switch
                    checked={field.value as boolean}
                    onCheckedChange={field.onChange}
                    className="data-[state=checked]:bg-brand-600 scale-75"
                  />
                )}
              />
            </div>
          ))}
        </div>

        <div className="pt-2 flex gap-3">
          <Button type="button" onClick={onClose} variant="ghost" className="flex-1 h-10 text-muted-foreground font-medium hover:bg-muted">
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading || isSubmitting}
            className="flex-1 h-10 bg-brand-600 hover:bg-brand-700 text-white font-semibold transition-all active:scale-95 shadow-sm rounded-md"
          >
            {isLoading || isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              initialData ? "Save Changes" : "Create Unit"
            )}
          </Button>
        </div>
      </form>
    </div>
    </div>
  );
}