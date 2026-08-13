import { useEffect, useState } from "react";
import { Plus, Search, Scale } from "lucide-react";
import { useUnits } from "../hooks/useUnits";
import UnitFormModal from "../components/UnitFormModal";
import type { UnitFormData, UnitData } from "@/types/unit";
import { DataTable } from "@/components/common/DataTable";
import { getUnitColumns } from "../components/UnitColumns";
import { useDebounce } from "@/lib/debounce";
import { DeleteConfirmDialog } from "@/lib/deleteAlert";
import { AdminGate } from "@/features/auth/components/AdminGate";

export default function UnitPage() {
    const { units, fetchUnits, removeUnit, meta, addUnit, updateUnit, isLoading } = useUnits();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUnit, setSelectedUnit] = useState<UnitData | null>(null);
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
    const [searchQuery, setSearchQuery] = useState("");
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
    const debouncedSearch = useDebounce(searchQuery, 400);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchUnits(pagination.pageIndex + 1, pagination.pageSize, debouncedSearch);
        }, 400);
        return () => clearTimeout(timer);
    }, [fetchUnits, pagination.pageIndex, pagination.pageSize, debouncedSearch]);

    const handleAddClick = () => {
        setSelectedUnit(null);
        setIsModalOpen(true);
    };

    const handleEditClick = (unit: UnitData) => {
        setSelectedUnit(unit);
        setIsModalOpen(true);
    };

    const handleFormSubmit = async (data: UnitFormData) => {
        if (selectedUnit) {
            await updateUnit(selectedUnit._id, data);
        } else {
            await addUnit(data);
        }
        setIsModalOpen(false);
    };

    const handleDeleteClick = (unit: UnitData) => {
        setSelectedUnit(unit);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (selectedUnit) {
            await removeUnit(selectedUnit._id);
            setIsDeleteDialogOpen(false);
            setSelectedUnit(null);
        }
    }

    return (
        <div className="w-full flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-500">

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 border-b border-slate-200 pb-6">
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-blue-600 rounded-sm text-white shadow-sm">
                        <Scale size={18} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                            Measurement Registry (Unit)
                        </h1>
                        <p className="text-slate-500 text-xs mt-1">
                            Unit Specification & Scale Configuration
                        </p>
                    </div>
                </div>

                <AdminGate>
                    <button
                        onClick={handleAddClick}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-black text-[10px] uppercase tracking-[0.15em] px-6 h-10 rounded-sm transition-all active:scale-95 flex items-center gap-2"
                    >
                        <Plus size={14} strokeWidth={4} />
                        Define Unit
                    </button>
                </AdminGate>
            </div>

            <div className="mb-4 group">
                <div className="bg-white border border-slate-300 group-within:border-blue-600 rounded-sm p-2 flex items-center gap-3 transition-all">
                    <div className="pl-2 text-slate-400 group-within:text-blue-600 transition-colors">
                        <Search size={16} strokeWidth={3} />
                    </div>
                    <input
                        type="text"
                        placeholder="Search units..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="flex-1 bg-transparent border-none outline-none text-sm placeholder:text-slate-600 text-slate-900 font-medium"
                    />
                </div>
            </div>

            {/* 3. DATATABLE */}
            <div className="bg-white border border-slate-300 rounded-sm overflow-hidden">
                <DataTable
                    columns={getUnitColumns(handleEditClick, handleDeleteClick)}
                    data={units}
                    pageCount={meta?.totalPages || 0}
                    rowCount={meta?.totalItems || 0}
                    pagination={pagination}
                    setPagination={setPagination}
                    isLoading={isLoading}
                />

                <DeleteConfirmDialog
                    open={isDeleteDialogOpen}
                    onOpenChange={setIsDeleteDialogOpen}
                    onConfirm={confirmDelete}
                    title="Confirm Unit Deletion"
                    itemName={selectedUnit?.name || "this unit"}
                    isLoading={isLoading}
                />
            </div>

            <UnitFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleFormSubmit}
                initialData={selectedUnit}
                isLoading={isLoading}
            />
        </div >
    );
}