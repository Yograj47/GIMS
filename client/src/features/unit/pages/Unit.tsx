import { useEffect, useState } from "react";
import { Plus, Trash2, Edit3, CheckCircle2, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useUnits } from "../hooks/useUnits";
import UnitFormModal from "../components/UnitFormModal";
import type { UnitFormData, UnitData } from "@/types/Unit";

export default function UnitsPage() {
    const { units, fetchUnits, removeUnit, addUnit, updateUnit, isLoading } = useUnits();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUnit, setSelectedUnit] = useState<UnitData | null>(null);

    useEffect(() => {
        fetchUnits();
    }, [fetchUnits]);

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
            <div className="bg-white border-2 border-slate-400 rounded-xl overflow-x-auto w-full">
                <table className="w-full text-left border-collapse">
                    <thead>
                        {/* Darker header background and thick border */}
                        <tr className="bg-slate-100 border-b-2 border-slate-400">
                            <th className="px-2 lg:px-8 py-5 text-[10px] font-black text-slate-800 uppercase tracking-[0.2em]">Unit / Short</th>
                            <th className="px-2 lg:px-8 py-5 text-[10px] font-black text-slate-800 uppercase tracking-[0.2em]">Type</th>
                            <th className="px-2 lg:px-8 py-5 text-[10px] font-black text-slate-800 uppercase tracking-[0.2em] text-center">Multiplier</th>
                            <th className="px-2 lg:px-8 py-5 text-[10px] font-black text-slate-800 uppercase tracking-[0.2em] text-center">Base</th>
                            <th className="px-2 lg:px-8 py-5 text-[10px] font-black text-slate-800 uppercase tracking-[0.2em] text-center">Fraction</th>
                            <th className="px-2 lg:px-8 py-5 text-[10px] font-black text-slate-800 uppercase tracking-[0.2em] text-center">Status</th>
                            <th className="px-2 lg:px-8 py-5 text-right"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y-2 divide-slate-200">
                        {units?.map((unit) => (
                            <tr key={unit._id} className="hover:bg-slate-50 transition-colors group">
                                <td className="px-8 py-5">
                                    <div className="flex flex-col">
                                        <span className="font-black text-slate-900 text-base">{unit.name}</span>
                                        <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-200 px-2 py-0.5 rounded w-fit mt-1">
                                            {unit.shortForm}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-2 lg:px-8 py-5">
                                    <Badge variant="outline" className="rounded-md border-2 border-slate-800 text-slate-900 font-black uppercase text-[9px] px-2">
                                        {unit.unitType}
                                    </Badge>
                                </td>
                                <td className="px-2 lg:px-8 py-5 text-center">
                                    <span className="font-mono font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-lg border border-blue-200">
                                        x{unit.multiplierToBase || 1}
                                    </span>
                                </td>
                                <td className="px-2 lg:px-8 py-5 text-center">
                                    {unit.baseUnit ? (
                                        <CheckCircle2 size={20} strokeWidth={3} className="text-slate-900 mx-auto" />
                                    ) : (
                                        <span className="text-slate-500 font-bold">-</span>
                                    )}
                                </td>
                                <td className="px-2 lg:px-8 py-5 text-center">
                                    {unit.isFractional ? (
                                        <CheckCircle2 size={20} strokeWidth={3} className="text-slate-900 mx-auto" />
                                    ) : (
                                        <XCircle size={20} strokeWidth={2} className="text-slate-500 mx-auto" />
                                    )}
                                </td>
                                <td className="px-2 lg:px-8 py-5 text-center">
                                    <div className={`w-3 h-3 rounded-full border-2 border-slate-900 mx-auto ${unit.isActive ? 'bg-emerald-400' : 'bg-slate-200'}`} />
                                </td>
                                <td className="px-2 lg:px-8 py-5 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button
                                            onClick={() => handleEditClick(unit)}
                                            className="p-2 border-2 border-transparent hover:border-slate-800 rounded-lg text-slate-400 hover:text-slate-900 transition-all"
                                        >
                                            <Edit3 size={18} strokeWidth={2.5} />
                                        </button>
                                        <button
                                            onClick={() => removeUnit(unit._id)}
                                            className="p-2 border-2 border-transparent hover:border-red-600 rounded-lg text-slate-400 hover:text-red-600 transition-all"
                                        >
                                            <Trash2 size={18} strokeWidth={2.5} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
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