import React, { useEffect } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import { X, Scale } from 'lucide-react';
import { productUnitSchema, type ProductUnitFormData } from '@/types/ProductUnit';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useUnits } from '@/features/unit/hooks/useUnits';
import { Button } from '@/components/ui/button';

interface ProductUnitModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: ProductUnitFormData) => Promise<void>;
    productId: string;
    productName: string;
    initialData?: any; 
}

export const ProductUnitModal: React.FC<ProductUnitModalProps> = ({
    isOpen, onClose, onSubmit, productId, productName, initialData
}) => {
    const { units, fetchUnits } = useUnits();

    const { register, handleSubmit, setValue, watch, reset, formState: { errors, isSubmitting } } = useForm<ProductUnitFormData>({
        resolver: zodResolver(productUnitSchema) as Resolver<ProductUnitFormData>,
        defaultValues: { productId, multiplier: 1, isDefault: false, isFractionable: false, isActive: true }
    });

    useEffect(() => {
        if (isOpen) {
            fetchUnits(undefined, undefined, undefined, true);
            reset(initialData ? { ...initialData, productId } : { productId, multiplier: 1, isDefault: false });
        }
    }, [isOpen, initialData, productId, reset, fetchUnits]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
                <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div>
                        <h2 className="text-lg font-black text-slate-800">{initialData ? 'Update Unit' : 'Link New Unit'}</h2>
                        <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">{productName}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white rounded-xl text-slate-400"><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Select Unit (UOM)</label>
                        <select 
                            {...register("unitId")}
                            className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20"
                        >
                            <option value="">Choose a unit...</option>
                            {units.map((u) => <option key={u._id} value={u._id}>{u.name} ({u.shortForm})</option>)}
                        </select>
                        {errors.unitId && <p className="text-rose-500 text-[10px] font-bold mt-1 ml-1">{errors.unitId.message}</p>}
                    </div>

                    <div className="space-y-1">
                        <div className="flex justify-between items-center ml-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase">Multiplier</label>
                            <span className="text-[10px] text-indigo-500 font-bold bg-indigo-50 px-2 py-0.5 rounded-md italic">1 Unit = {watch('multiplier') || 0} Base Units</span>
                        </div>
                        <div className="relative">
                            <Scale className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <Input type="number" step="any" {...register("multiplier")} className="pl-12 h-11 rounded-xl font-bold" />
                        </div>
                        {errors.multiplier && <p className="text-rose-500 text-[10px] font-bold mt-1 ml-1">{errors.multiplier.message}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center justify-between p-3 rounded-2xl border border-slate-100 bg-slate-50/50">
                            <span className="text-[10px] font-black text-slate-700 uppercase">Base Unit</span>
                            <Switch checked={watch('isDefault')} onCheckedChange={(v) => setValue('isDefault', v)} />
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-2xl border border-slate-100 bg-slate-50/50">
                            <span className="text-[10px] font-black text-slate-700 uppercase">Fraction</span>
                            <Switch checked={watch('isFractionable')} onCheckedChange={(v) => setValue('isFractionable', v)} />
                        </div>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <Button type="button" onClick={onClose} variant="ghost" className="flex-1 font-bold text-slate-500">Cancel</Button>
                        <Button type="submit" disabled={isSubmitting} className="flex-1 bg-slate-900 text-white font-bold rounded-xl shadow-lg shadow-slate-200">
                            {isSubmitting ? 'Saving...' : initialData ? 'Update' : 'Save Unit'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};