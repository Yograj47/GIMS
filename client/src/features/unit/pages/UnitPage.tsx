import { useEffect, useState } from "react";
import { Plus, Search, Scale } from "lucide-react";
import { useUnits } from "../hooks/useUnits";
import UnitFormModal from "../components/UnitFormModal";
import type { UnitFormData, UnitData } from "@/types/Unit";
import { DataTable } from "@/components/common/DataTable";
import { getUnitColumns } from "../components/UnitColumns";

export default function UnitPage() {
    const { units, fetchUnits, removeUnit, meta, addUnit, updateUnit, isLoading } = useUnits();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUnit, setSelectedUnit] = useState<UnitData | null>(null);
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchUnits(pagination.pageIndex + 1, pagination.pageSize, searchQuery);
        }, 400);
        return () => clearTimeout(timer);
    }, [fetchUnits, pagination.pageIndex, pagination.pageSize, searchQuery]);

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
        <div className="w-full flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-500">

            {/* 1. HEADER - Unified Registry Style */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 border-b border-slate-200 pb-6">
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-blue-600 rounded-sm text-white shadow-sm">
                        <Scale size={18} />
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-slate-900 tracking-tight uppercase leading-none">
                            Measurement Registry (Unit)
                        </h1>
                        <p className="text-slate-400 text-[9px] font-bold uppercase tracking-[0.2em] mt-1.5">
                            Unit Specification & Scale Configuration
                        </p>
                    </div>
                </div>

                <button
                    onClick={handleAddClick}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-black text-[10px] uppercase tracking-[0.15em] px-6 h-10 rounded-sm transition-all active:scale-95 flex items-center gap-2"
                >
                    <Plus size={14} strokeWidth={4} />
                    Define Unit 
                </button>
            </div>

            {/* 2. SEARCH - Sharp Industrial */}
            <div className="mb-4 group">
                <div className="bg-white border border-slate-200 group-within:border-blue-600 rounded-sm p-2 flex items-center gap-3 transition-all">
                    <div className="pl-2 text-slate-400 group-within:text-blue-600 transition-colors">
                        <Search size={16} strokeWidth={3} />
                    </div>
                    <input
                        type="text"
                        placeholder="SEARCH BY NAME OR CODE..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="flex-1 bg-transparent border-none outline-none font-bold text-[11px] uppercase tracking-widest placeholder:text-slate-300 text-slate-900"
                    />
                </div>
            </div>

            {/* 3. DATATABLE - Flattened */}
            <div className="bg-white border border-slate-200 rounded-sm overflow-hidden shadow-sm">
                <DataTable
                    columns={getUnitColumns(handleEditClick, removeUnit)}
                    data={units}
                    pageCount={meta?.totalPages || 0}
                    rowCount={meta?.totalItems || 0}
                    pagination={pagination}
                    setPagination={setPagination}
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
        </div>
    );
}