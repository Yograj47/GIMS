import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Scale } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { unitSchema, type UnitFormData, type UnitData } from "@/types/Unit";

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
    formState: { errors },
  } = useForm<UnitFormData>({
    resolver: zodResolver(unitSchema),
    defaultValues: {
      name: "",
      shortForm: "",
      unitType: "count",
      baseUnit: false,
      isFractional: false,
      isActive: true,
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        reset(initialData);
      } else {
        reset({
          name: "",
          shortForm: "",
          unitType: "count",
          baseUnit: false,
          isFractional: false,
          isActive: true,
        });
      }
    }
  }, [initialData, reset, isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-125 rounded-[2rem] border-none p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
        <DialogHeader className="space-y-3">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
            <Scale size={24} />
          </div>
          <DialogTitle className="text-2xl font-black text-slate-900 tracking-tight">
            {initialData ? "Edit Unit" : "Define New Unit"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-2">
          {/* NAME & SHORT FORM */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</Label>
              <Input {...register("name")} placeholder="Kilogram" className="h-11 rounded-xl border-slate-200" />
              {errors.name && <p className="text-[10px] text-red-500 font-bold uppercase">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Short Form</Label>
              <Input {...register("shortForm")} placeholder="kg" className="h-11 rounded-xl border-slate-200" />
              {errors.shortForm && <p className="text-[10px] text-red-500 font-bold uppercase">{errors.shortForm.message}</p>}
            </div>
          </div>

          {/* UNIT TYPE DROPDOWN */}
          <div className="space-y-2">
            <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Measurement Type</Label>
            <Controller
              control={control}
              name="unitType"
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className="h-11 rounded-xl border-slate-200">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="weight">Weight (Mass)</SelectItem>
                    <SelectItem value="volume">Volume (Liquid)</SelectItem>
                    <SelectItem value="count">Count (Pieces)</SelectItem>
                    <SelectItem value="pack">Pack (Bundles)</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {/* SWITCHES SECTION */}
          <div className="space-y-3 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-bold text-slate-700">Base Unit</Label>
                <p className="text-[10px] text-slate-500 font-medium">Is this the primary unit for its type?</p>
              </div>
              <Controller
                control={control}
                name="baseUnit"
                render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} />}
              />
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 pt-3">
              <div className="space-y-0.5">
                <Label className="text-sm font-bold text-slate-700">Allow Fractional</Label>
                <p className="text-[10px] text-slate-500 font-medium">Can this be sold in decimals (e.g., 0.5 kg)?</p>
              </div>
              <Controller
                control={control}
                name="isFractional"
                render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} />}
              />
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
          </div>

          <DialogFooter className="pt-2 sm:justify-end gap-2">
            <Button type="button" variant="ghost" onClick={onClose} className="rounded-xl font-bold text-slate-500">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 h-12 rounded-xl px-8 font-black shadow-lg shadow-blue-100 min-w-35"
            >
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : initialData ? "Save Changes" : "Create Unit"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}