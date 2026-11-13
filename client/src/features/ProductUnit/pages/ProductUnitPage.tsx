import { SettingsPageHeader, SettingsSearch } from "@/features/settings/components/SettingsPageHeader";
import { useEffect, useState } from "react";
import { Trash2, Edit3, CheckCircle2, Scale } from "lucide-react";
import { useProductUnits } from "../hooks/useProductUnits";
import { Button } from "@/components/ui/button";
import { ProductUnitModal } from "../components/ProductUnitModal";
import type { ProductUnitFormData } from "@/types/product-unit";
import { DataTable } from "@/components/common/DataTable";
import { getProductUnitColumns } from "../components/ProductUnitColumn";
import { AdminGate } from "@/features/auth/components/AdminGate";
import { useDebounce } from "@/lib/debounce";
import { DeleteConfirmDialog } from "@/lib/deleteAlert";

interface ProductUnitConversion {
    _id: string;
    unitId: string;
    unitName: string;
    shortName: string;
    multiplier: number;
    isDefault: boolean;
    isFractionable: boolean;
    isActive: boolean;
}

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
    const [context, setContext] = useState<{ id: string; name: string; initialData?: ProductUnitConversion } | null>(null);
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
    const [searchQuery, setSearchQuery] = useState("");
    const debouncedSearchQuery = useDebounce(searchQuery, 400);

    // DELETE STATES
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [unitToDelete, setUnitToDelete] = useState<{ unitId: string; productId: string; unitName: string } | null>(null);

    // Track previous search to reset page index safely during render
    const [prevSearch, setPrevSearch] = useState(debouncedSearchQuery);
    if (prevSearch !== debouncedSearchQuery) {
        setPrevSearch(debouncedSearchQuery);
        setPagination(prev => ({ ...prev, pageIndex: 0 }));
    }

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
        <div className="min-w-0">
            <SettingsPageHeader title="Product units" description="Set the units and conversion rates available for each product." icon={Scale} />
            <SettingsSearch label="Search products" value={searchQuery} onChange={(value) => {
                setSearchQuery(value);
                setPagination((previous) => ({ ...previous, pageIndex: 0 }));
            }} />

            <div className="min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white">
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
                            {row.original.conversions?.length > 0 ? (
                                <div className="rounded-md border border-slate-200 bg-white overflow-hidden shadow-sm">
                                    <div className="hidden grid-cols-12 gap-3 px-4 py-2.5 md:grid bg-slate-50 text-[11px] font-bold text-slate-500 border-b">
                                        <div className="col-span-4">Unit Name</div>
                                        <div className="col-span-3 text-center">Multiplier</div>
                                        <div className="col-span-3 text-center">Unit type</div>
                                        <AdminGate>
                                            <div className="col-span-2 text-right">Actions</div>
                                        </AdminGate>
                                    </div>
                                    <div className="divide-y divide-slate-100">
                                        {row.original.conversions.map((conv:ProductUnitConversion) => (
                                            <div key={conv._id} className="grid grid-cols-2 gap-2 px-3 py-3 items-center md:grid-cols-12 md:gap-3 md:px-4 hover:bg-brand-50/30 transition-colors">
                                                <div className="col-span-2 flex flex-wrap items-center md:col-span-4 gap-2 font-semibold text-slate-700 text-sm">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-brand-400" />
                                                    {conv.unitName} <span className="text-xs text-slate-400 font-normal">({conv.shortName})</span>
                                                </div>
                                                <div className="flex md:col-span-3 md:justify-center">
                                                    <span className="px-2 py-0.5 rounded bg-brand-50 text-brand-700 text-[11px] font-bold border border-brand-100 tabular-nums">
                                                        × {conv.multiplier}
                                                    </span>
                                                </div>
                                                <div className="flex md:col-span-3 md:justify-center">
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
                                                            aria-label="Edit conversion"
                                                            variant="ghost"
                                                            className="size-9 text-slate-600 hover:text-brand-600"
                                                            onClick={() => {
                                                                setContext({ id: row.original._id, name: row.original.productName, initialData: conv });
                                                                setIsModalOpen(true);
                                                            }}
                                                        >
                                                            <Edit3 size={14} />
                                                        </Button>
                                                        <Button 
                                                            size="icon"
                                                            aria-label="Delete conversion"
                                                            variant="ghost"
                                                            className="size-9 text-slate-600 hover:text-rose-600"
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
