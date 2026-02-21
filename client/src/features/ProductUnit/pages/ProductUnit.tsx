import React, { useEffect, useState } from "react";
import { Layers, Search, Plus, Trash2, Edit3, Scale, CheckCircle2 } from "lucide-react";
import { useProductUnits } from "../hooks/useProductUnits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ProductUnitModal } from "../components/ProductUnitModal";
import type { ProductUnitFormData } from "@/types/ProductUnit";

export const ProductUnitListing: React.FC = () => {
    const { groupedUnits, isLoading, fetchGroupedUnits, addProductUnit, updateProductUnit, removeProductUnit } = useProductUnits();
    const [searchTerm, setSearchTerm] = useState("");
    const [expandedProduct, setExpandedProduct] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Tracks which product and unit we are working on
    const [context, setContext] = useState<{ id: string; name: string; initialData?: any } | null>(null);

    useEffect(() => {
        fetchGroupedUnits();
    }, [fetchGroupedUnits]);

    const handleOpenAdd = (id: string, name: string) => {
        setContext({ id, name });
        setIsModalOpen(true);
    };

    const handleOpenEdit = (productId: string, productName: string, unitData: any) => {
        setContext({ id: productId, name: productName, initialData: unitData });
        setIsModalOpen(true);
    };

    const handleFormSubmit = async (data: ProductUnitFormData) => {
        let success = false;
        if (context?.initialData) {
            success = await updateProductUnit(context.initialData._id, data);
        } else {
            success = await addProductUnit(data);
        }

        if (success) {
            setIsModalOpen(false);
            setContext(null);
        }
    };

    const filteredGroups = groupedUnits.filter(group =>
        group.productName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 space-y-6 max-w-6xl mx-auto">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                        <Layers className="text-indigo-600" size={24} />
                        Unit Conversions
                    </h1>
                    <p className="text-sm text-slate-500 font-medium tracking-tight">Manage multipliers and base units per product</p>
                </div>
            </div>

            <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
                <Input
                    placeholder="Search by product name..."
                    className="pl-12 h-12 bg-white border-slate-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-indigo-500/20"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="space-y-3">
                {filteredGroups.map((group) => (
                    <div key={group._id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                        <div
                            onClick={() => setExpandedProduct(expandedProduct === group._id ? null : group._id)}
                            className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-bold">{group.productName.charAt(0)}</div>
                                <div>
                                    <h3 className="font-bold text-slate-700">{group.productName}</h3>
                                    <p className="text-[11px] text-slate-400 font-black uppercase tracking-wider">{group.conversions.length} Units Defined</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Button
                                    onClick={(e) => { e.stopPropagation(); handleOpenAdd(group._id, group.productName); }}
                                    size="sm" variant="ghost" className="h-8 rounded-lg text-indigo-600 font-bold bg-indigo-50 hover:bg-indigo-100"
                                >
                                    <Plus size={14} className="mr-1" /> Add Unit
                                </Button>
                                <Scale size={18} className={cn("text-slate-300 transition-transform", expandedProduct === group._id && "rotate-12 text-indigo-500")} />
                            </div>
                        </div>

                        {/* Nested Conversion Table - Now Using Grid for Perfect Alignment */}
                        {expandedProduct === group._id && (
                            <div className="px-4 pb-4 animate-in slide-in-from-top-2 duration-200">
                                <div className="rounded-2xl border border-slate-100 bg-slate-50/50 overflow-hidden shadow-inner">
                                    {/* Grid Header */}
                                    <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-slate-100/50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                                        <div className="col-span-4">Unit Name</div>
                                        <div className="col-span-3 text-center">Multiplier</div>
                                        <div className="col-span-3 text-center">Status</div>
                                        <div className="col-span-2 text-right">Actions</div>
                                    </div>

                                    {/* Grid Body */}
                                    <div className="divide-y divide-slate-100 bg-white">
                                        {group.conversions.map((conv) => (
                                            <div key={conv._id} className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-slate-50/80 transition-colors group">
                                                {/* Unit Info */}
                                                <div className="col-span-4 flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                                                    <span className="font-bold text-slate-700 text-sm">{conv.unitName}</span>
                                                    <span className="text-[10px] font-medium text-slate-400">({conv.shortName})</span>
                                                </div>

                                                {/* Multiplier Badge */}
                                                <div className="col-span-3 flex justify-center">
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-black border border-indigo-100">
                                                        x{conv.multiplier}
                                                    </span>
                                                </div>

                                                {/* Status Label */}
                                                <div className="col-span-3 flex justify-center">
                                                    {conv.isDefault ? (
                                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase border border-emerald-100">
                                                            <CheckCircle2 size={12} /> Base Unit
                                                        </span>
                                                    ) : (
                                                        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-tight">Secondary</span>
                                                    )}
                                                </div>

                                                {/* Actions */}
                                                <div className="col-span-2 flex justify-end gap-1">
                                                    <Button
                                                        onClick={(e) => { e.stopPropagation(); handleOpenEdit(group._id, group.productName, conv); }}
                                                        variant="ghost"
                                                        className="h-8 w-8 p-0 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-lg transition-all"
                                                    >
                                                        <Edit3 size={14} />
                                                    </Button>
                                                    <Button
                                                        onClick={(e) => { e.stopPropagation(); removeProductUnit(conv._id, group._id); }}
                                                        disabled={conv.isDefault}
                                                        variant="ghost"
                                                        className="h-8 w-8 p-0 text-slate-300 hover:text-rose-600 hover:bg-white disabled:opacity-20 rounded-lg"
                                                    >
                                                        <Trash2 size={14} />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <ProductUnitModal
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setContext(null); }}
                onSubmit={handleFormSubmit}
                productId={context?.id || ""}
                productName={context?.name || ""}
                initialData={context?.initialData}
            />
        </div>
    );
};