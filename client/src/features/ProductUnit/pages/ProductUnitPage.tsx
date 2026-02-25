import { useEffect, useState } from "react";
import { Trash2, Edit3, CheckCircle2, Search } from "lucide-react";
import { useProductUnits } from "../hooks/useProductUnits";
import { Button } from "@/components/ui/button";
import { ProductUnitModal } from "../components/ProductUnitModal";
import type { ProductUnitFormData } from "@/types/ProductUnit";
import { DataTable } from "@/components/common/DataTable";
import { getProductUnitColumns } from "../components/ProductUnitColumn";

export default function ProductUnitPage(){
    const {
        groupedUnits,
        isLoading,
        fetchGroupedUnits,
        addProductUnit,
        updateProductUnit,
        removeProductUnit,
        meta
    } = useProductUnits();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [context, setContext] = useState<{ id: string; name: string; initialData?: any } | null>(null);
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchGroupedUnits(pagination.pageIndex + 1, pagination.pageSize, searchQuery);
        }, 400);

        return () => clearTimeout(timer);
    }, [fetchGroupedUnits, pagination.pageIndex, pagination.pageSize, searchQuery]);

    const handleFormSubmit = async (data: ProductUnitFormData) => {
        const success = context?.initialData
            ? await updateProductUnit(context.initialData._id, data)
            : await addProductUnit(data);

        if (success) {
            setIsModalOpen(false);
            setContext(null);
        }
    };

    return (
        <div className="w-full h-full flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-500 min-h-0 px-1">
            <div className="flex items-end justify-between mb-4 shrink-0">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase ">
                        Unit Conversions<span className="text-blue-600">.</span>
                    </h1>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Manage multipliers per product</p>
                </div>
            </div>

            {/* Search Bar - Matching UnitPage UI */}
            <div className="mb-2 group shrink-0">
                <div className="bg-white border-2 border-slate-200 group-within:border-slate-800 rounded-2xl p-3 flex items-center gap-4 transition-all shadow-sm">
                    <div className="pl-2 text-slate-400 group-within:text-slate-800 transition-colors">
                        <Search size={20} strokeWidth={3} />
                    </div>
                    <input
                        type="text"
                        placeholder="SEARCH BY PRODUCT NAME..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="flex-1 bg-transparent border-none outline-none font-black text-xs uppercase tracking-widest placeholder:text-slate-300 text-slate-800"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery("")}
                            className="pr-2 text-slate-300 hover:text-red-500 font-bold text-xs"
                        >
                            CLEAR
                        </button>
                    )}
                </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
                <DataTable
                    columns={getProductUnitColumns((id, name) => {
                        setContext({ id, name });
                        setIsModalOpen(true);
                    })}
                    data={groupedUnits}
                    isLoading={isLoading}
                    pageCount={meta?.totalPages || 0}
                    rowCount={meta?.totalItems || 0}
                    pagination={pagination}
                    setPagination={setPagination}
                    renderExpandedRow={(row) => (
                        <div className="p-4 bg-slate-50/50 border-t border-slate-100">
                            {row.original.conversions.length > 0 ? (
                                <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-inner">
                                    <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b">
                                        <div className="col-span-4">Unit</div>
                                        <div className="col-span-3 text-center">Multiplier</div>
                                        <div className="col-span-3 text-center">Status</div>
                                        <div className="col-span-2 text-right">Actions</div>
                                    </div>
                                    <div className="divide-y divide-slate-100">
                                        {row.original.conversions.map((conv: any) => (
                                            <div key={conv._id} className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-slate-50/50 transition-colors">
                                                <div className="col-span-4 flex items-center gap-2 font-bold text-slate-700 text-sm">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                                                    {conv.unitName} <span className="text-[10px] text-slate-400">({conv.shortName})</span>
                                                </div>
                                                <div className="col-span-3 flex justify-center">
                                                    <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[10px] font-black border border-indigo-100">x{conv.multiplier}</span>
                                                </div>
                                                <div className="col-span-3 flex justify-center">
                                                    {conv.isDefault ? (
                                                        <span className="flex items-center gap-1 text-emerald-600 text-[10px] font-black uppercase"><CheckCircle2 size={12} /> Base</span>
                                                    ) : (
                                                        <span className="text-[10px] font-bold text-slate-300 uppercase">Secondary</span>
                                                    )}
                                                </div>
                                                <div className="col-span-2 flex justify-end gap-1">
                                                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => {
                                                        setContext({ id: row.original._id, name: row.original.productName, initialData: conv });
                                                        setIsModalOpen(true);
                                                    }}><Edit3 size={12} /></Button>
                                                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-slate-300 hover:text-rose-600" disabled={conv.isDefault} onClick={() => removeProductUnit(conv._id, row.original._id)}><Trash2 size={12} /></Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="py-8 text-center bg-white rounded-2xl border border-dashed border-slate-200">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No units defined yet</p>
                                </div>
                            )}
                        </div>
                    )}
                />
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