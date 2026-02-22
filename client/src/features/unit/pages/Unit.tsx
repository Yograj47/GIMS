import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { useUnits } from "../hooks/useUnits";
import UnitFormModal from "../components/UnitFormModal";
import type { UnitFormData, UnitData } from "@/types/Unit";
import { DataTable } from "@/components/common/DataTable";
import { getUnitColumns } from "../components/UnitColumns";

export default function UnitsPage() {
    const { units, fetchUnits, removeUnit, meta, addUnit, updateUnit, isLoading } = useUnits();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUnit, setSelectedUnit] = useState<UnitData | null>(null);
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

    useEffect(() => {
        fetchUnits(pagination.pageIndex + 1, pagination.pageSize);
    }, [fetchUnits, pagination.pageIndex, pagination.pageSize]);

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

    return (
        <div className="w-full space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            {/* --- Header Section --- */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Units</h2>
                    <p className="text-slate-600 text-sm font-bold">Manage measurement units and conversion properties.</p>
                </div>
                <button
                    onClick={handleAddClick}
                    className="bg-blue-600 hover:bg-blue-700 text-white h-12 px-6 rounded-xl font-black flex items-center gap-2 transition-all active:scale-95 shadow-md"
                >
                    <Plus size={18} strokeWidth={3} />
                    <span className="uppercase tracking-wider text-[11px]">Define Unit</span>
                </button>
            </div>

            {/* --- Table Container with Darker Borders --- */}
            <DataTable
                columns={getUnitColumns(handleEditClick, removeUnit)}
                data={units}
                pageCount={meta?.totalPages || 0}
                rowCount={meta?.totalItems || 0}
                pagination={pagination}
                setPagination={setPagination}
            />

            <UnitFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleFormSubmit}
                initialData={selectedUnit}
                isLoading={isLoading}
            />
        </div>
    );
}