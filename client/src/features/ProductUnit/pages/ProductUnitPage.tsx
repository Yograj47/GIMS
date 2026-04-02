import { useEffect, useState } from "react";
import { Trash2, Edit3, CheckCircle2, Search, Scale } from "lucide-react";
import { useProductUnits } from "../hooks/useProductUnits";
import { Button } from "@/components/ui/button";
import { ProductUnitModal } from "../components/ProductUnitModal";
import type { ProductUnitFormData } from "@/types/ProductUnit";
import { DataTable } from "@/components/common/DataTable";
import { getProductUnitColumns } from "../components/ProductUnitColumn";
import { AdminGate } from "@/features/auth/components/AdminGate";
import { useDebounce } from "@/lib/debounce";
import { DeleteConfirmDialog } from "@/lib/deleteAlert";

export default function ProductUnitPage() {
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
    const debouncedSearchQuery = useDebounce(searchQuery, 400);

    // DELETE STATES
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [unitToDelete, setUnitToDelete] = useState<{ unitId: string; productId: string; unitName: string } | null>(null);

    useEffect(() => {
        fetchGroupedUnits(pagination.pageIndex + 1, pagination.pageSize, debouncedSearchQuery);
    }, [fetchGroupedUnits, pagination.pageIndex, pagination.pageSize, debouncedSearchQuery]);

    const handleFormSubmit = async (data: ProductUnitFormData) => {
        const success = context?.initialData
            ? await updateProductUnit(context.initialData._id, data)
            : await addProductUnit(data);

        if (success) {
            setIsModalOpen(false);
            setContext(null);
        }
    };

    // Triggered when clicking Trash icon in expanded row
    const openDeleteDialog = (unitId: string, productId: string, unitName: string) => {
        setUnitToDelete({ unitId, productId, unitName });
        setIsDeleteDialogOpen(true);
    }

    const confirmDelete = async () => {
        if (unitToDelete) {
            await removeProductUnit(unitToDelete.unitId, unitToDelete.productId);
            setIsDeleteDialogOpen(false);
            setUnitToDelete(null);
        }
    }

    return (
        <div className="w-full flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 border-b border-slate-300 pb-6">
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-blue-600 rounded-md text-white shadow-sm">
                        <Scale size={18} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Unit Conversions</h1>
                        <p className="text-slate-500 text-xs mt-1">Manage product-specific measurement multipliers</p>
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="mb-4 group">
                <div className="bg-white border border-slate-300 group-within:border-blue-600 rounded-md p-2 flex items-center gap-3 transition-all">
                    <div className="pl-2 text-slate-400 group-within:text-blue-600">
                        <Search size={16} strokeWidth={2.5} />
                    </div>
                    <input
                        type="text"
                        placeholder="Search by product name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="flex-1 bg-transparent border-none outline-none text-sm placeholder:text-slate-600 text-slate-900 font-medium"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white border border-slate-300 rounded-md overflow-hidden">
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
                        <div className="p-4 bg-slate-50 border-t border-slate-100">
                            {row.original.conversions.length > 0 ? (
                                <div className="rounded-md border border-slate-200 bg-white overflow-hidden shadow-sm">
                                    <div className="grid grid-cols-12 gap-4 px-6 py-2.5 bg-slate-50 text-[11px] font-bold text-slate-500 border-b">
                                        <div className="col-span-4">Unit Name</div>
                                        <div className="col-span-3 text-center">Multiplier</div>
                                        <div className="col-span-3 text-center">Protocol</div>
                                        <AdminGate>
                                            <div className="col-span-2 text-right">Actions</div>
                                        </AdminGate>
                                    </div>
                                    <div className="divide-y divide-slate-100">
                                        {row.original.conversions.map((conv: any) => (
                                            <div key={conv._id} className="grid grid-cols-12 gap-4 px-6 py-3 items-center hover:bg-blue-50/30 transition-colors">
                                                <div className="col-span-4 flex items-center gap-2 font-semibold text-slate-700 text-sm">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                                                    {conv.unitName} <span className="text-xs text-slate-400 font-normal">({conv.shortName})</span>
                                                </div>
                                                <div className="col-span-3 flex justify-center">
                                                    <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[11px] font-bold border border-blue-100 tabular-nums">
                                                        × {conv.multiplier}
                                                    </span>
                                                </div>
                                                <div className="col-span-3 flex justify-center">
                                                    {conv.isDefault ? (
                                                        <span className="flex items-center gap-1 text-emerald-600 text-[11px] font-bold">
                                                            <CheckCircle2 size={12} /> Base Unit
                                                        </span>
                                                    ) : (
                                                        <span className="text-[11px] text-slate-400 font-medium">Secondary</span>
                                                    )}
                                                </div>
                                                <AdminGate>
                                                    <div className="col-span-2 flex justify-end gap-1">
                                                        <Button 
                                                            size="icon" 
                                                            variant="ghost" 
                                                            className="h-7 w-7 text-slate-400 hover:text-blue-600" 
                                                            onClick={() => {
                                                                setContext({ id: row.original._id, name: row.original.productName, initialData: conv });
                                                                setIsModalOpen(true);
                                                            }}
                                                        >
                                                            <Edit3 size={14} />
                                                        </Button>
                                                        <Button 
                                                            size="icon" 
                                                            variant="ghost" 
                                                            className="h-7 w-7 text-slate-400 hover:text-rose-600" 
                                                            disabled={conv.isDefault} 
                                                            onClick={() => openDeleteDialog(conv._id, row.original._id, conv.unitName)}
                                                        >
                                                            <Trash2 size={14} />
                                                        </Button>
                                                    </div>
                                                </AdminGate>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="py-6 text-center bg-white rounded-md border border-dashed border-slate-200">
                                    <p className="text-xs text-slate-400 font-medium">No conversion units mapped</p>
                                </div>
                            )}
                        </div>
                    )}
                />
            </div>

            {/* Global Dialogs */}
            <DeleteConfirmDialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
                onConfirm={confirmDelete}
                title="Confirm Unit Deletion"
                itemName={unitToDelete?.unitName || "this unit"}
                isLoading={isLoading}
            />

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
}