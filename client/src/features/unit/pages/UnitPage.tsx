import { useEffect, useState } from "react";
import { Plus, Search } from "lucide-react";
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
        }, 400)

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
        <div className="w-full h-full flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-500 min-h-0 px-1">

            {/* 1. Header Section - Cleaner alignment */}
            <div className="flex items-end justify-between mb-4 shrink-0">
                <div>
                    <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase ">
                        Units<span className="text-blue-600">.</span>
                    </h2>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mt-1">
                        Measurement Configuration Engine
                    </p>
                </div>

                <button
                    onClick={handleAddClick}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-black text-[10px] uppercase tracking-widest px-6 py-3 rounded-xl transition-all active:scale-95 flex items-center gap-2 shadow-lg shadow-slate-200"
                >
                    <Plus size={14} strokeWidth={4} />
                    Define Unit
                </button>
            </div>

            {/* 2. Search Section - Matching the Sharp Theme */}
            <div className="mb-2 group shrink-0">
                <div className="bg-white border-2 border-slate-200 group-within:border-slate-800 rounded-2xl p-3 flex items-center gap-4 transition-all shadow-sm">
                    <div className="pl-2 text-slate-400 group-within:text-slate-800 transition-colors">
                        <Search size={20} strokeWidth={3} />
                    </div>
                    <input
                        type="text"
                        placeholder="SEARCH BY UNIT NAME OR SHORTCODE..."
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

            <div className="flex-1 min-h-0 bg-slate-50/50 rounded-3xl p-1">
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