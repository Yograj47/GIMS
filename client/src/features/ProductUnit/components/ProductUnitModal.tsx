"use client";

import React, { useEffect, useMemo } from 'react';
import { useForm, Controller, type Resolver } from 'react-hook-form';
import Select, { type StylesConfig } from 'react-select'; 
import { X, Scale, AlertCircle, Loader2 } from 'lucide-react';
import { productUnitSchema, type ProductUnitFormData } from '@/types/product-unit';
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

// Custom Styles for react-select to match your UI
const selectStyles: StylesConfig<any> = {
    control: (base, state) => ({
        ...base,
        minHeight: '36px',
        borderRadius: '6px',
        borderColor: state.isFocused ? '#2563eb' : '#e2e8f0', // blue-600 : slate-200
        boxShadow: state.isFocused ? '0 0 0 1px #2563eb' : 'none',
        '&:hover': {
            borderColor: state.isFocused ? '#2563eb' : '#cbd5e1',
        },
        fontSize: '14px',
        fontWeight: '500',
    }),
    option: (base, state) => ({
        ...base,
        fontSize: '13px',
        fontWeight: '500',
        backgroundColor: state.isSelected ? '#2563eb' : state.isFocused ? '#eff6ff' : 'white',
        color: state.isSelected ? 'white' : '#1e293b',
        '&:active': {
            backgroundColor: '#dbeafe',
        }
    }),
};

export const ProductUnitModal: React.FC<ProductUnitModalProps> = ({
    isOpen, onClose, onSubmit, productId, productName, initialData
}) => {
    const { units, fetchUnits } = useUnits();

    const { register, handleSubmit, control, watch, reset, formState: { errors, isSubmitting } } = useForm<ProductUnitFormData>({
        resolver: zodResolver(productUnitSchema) as Resolver<ProductUnitFormData>,
        defaultValues: { 
            productId, 
            multiplier: 1, 
            isDefault: false, 
            isFractionable: false, 
            isActive: true 
        }
    });

    const currentMultiplier = watch('multiplier');

    const unitOptions = useMemo(() => 
        units.map(u => ({
            value: u._id,
            label: `${u.name} (${u.shortForm})`
        })), [units]
    );

    useEffect(() => {
        if (isOpen) {
            fetchUnits(undefined, undefined, undefined, true);
            reset(initialData ? { ...initialData, productId } : { 
                productId, 
                multiplier: 1, 
                isDefault: false,
                isFractionable: false,
                isActive: true
            });
        }
    }, [isOpen, initialData, productId, reset, fetchUnits]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[2px] animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-105 rounded-md shadow-xl border border-slate-200 overflow-hidden">
                
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div>
                        <h2 className="text-sm font-bold text-slate-900">
                            {initialData ? 'Update Conversion' : 'Link New Unit'}
                        </h2>
                        <p className="text-[11px] text-blue-600 font-medium mt-0.5">{productName}</p>
                    </div>
                    <button onClick={onClose} className="p-1 hover:bg-white rounded border border-transparent hover:border-slate-200 text-slate-400 transition-all">
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
                    
                    {/* Unit Selection with React-Select */}
                    <div className="space-y-1.5">
                        <label className="text-[11px] font-semibold text-slate-500 ml-0.5">Measurement Unit</label>
                        <Controller
                            control={control}
                            name="unitId"
                            render={({ field: { onChange, value, ref } }) => (
                                <Select
                                    ref={ref}
                                    options={unitOptions}
                                    value={unitOptions.find(opt => opt.value === value)}
                                    onChange={(val) => onChange(val?.value)}
                                    placeholder="Search or select unit..."
                                    styles={selectStyles}
                                    classNamePrefix="react-select"
                                    isClearable
                                />
                            )}
                        />
                        {errors.unitId && (
                            <p className="text-[10px] text-rose-500 mt-1 flex items-center gap-1">
                                <AlertCircle size={10} /> {errors.unitId.message}
                            </p>
                        )}
                    </div>

                    {/* Multiplier */}
                    <div className="space-y-1.5">
                        <div className="flex justify-between items-center px-0.5">
                            <label className="text-[11px] font-semibold text-slate-500">Multiplier Factor</label>
                            <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-100 tabular-nums">
                                1 Unit = {currentMultiplier || 0} Base
                            </span>
                        </div>
                        <div className="relative">
                            <Scale className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <Input 
                                type="number" 
                                step="any" 
                                {...register("multiplier", { valueAsNumber: true })} 
                                className="pl-10 h-9 rounded-md border-slate-200 text-sm font-bold tabular-nums focus-visible:ring-blue-600 focus-visible:ring-1 focus-visible:border-blue-500" 
                            />
                        </div>
                    </div>

                    {/* Toggles */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center justify-between p-3 rounded-md border border-slate-100 bg-slate-50/50">
                            <div className="flex flex-col">
                                <span className="text-[11px] font-bold text-slate-700">Set as Base</span>
                                <span className="text-[9px] text-slate-400">Primary unit</span>
                            </div>
                            <Controller
                                control={control}
                                name="isDefault"
                                render={({ field }) => (
                                    <Switch 
                                        checked={field.value} 
                                        onCheckedChange={field.onChange} 
                                        className="scale-75 data-[state=checked]:bg-blue-600"
                                    />
                                )}
                            />
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-md border border-slate-100 bg-slate-50/50">
                            <div className="flex flex-col">
                                <span className="text-[11px] font-bold text-slate-700">Allow Decimals</span>
                                <span className="text-[9px] text-slate-400">Partial sales</span>
                            </div>
                            <Controller
                                control={control}
                                name="isFractionable"
                                render={({ field }) => (
                                    <Switch 
                                        checked={field.value} 
                                        onCheckedChange={field.onChange} 
                                        className="scale-75 data-[state=checked]:bg-blue-600"
                                    />
                                )}
                            />
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-2 flex gap-3">
                        <Button 
                            type="button" 
                            onClick={onClose} 
                            variant="ghost" 
                            className="flex-1 h-10 text-slate-500 font-semibold text-xs hover:bg-slate-50"
                        >
                            Discard
                        </Button>
                        <Button 
                            type="submit" 
                            disabled={isSubmitting} 
                            className="flex-1 h-10 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm rounded-md transition-all active:scale-95"
                        >
                            {isSubmitting ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : initialData ? (
                                'Save Changes'
                            ) : (
                                'Link Product Unit'
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};