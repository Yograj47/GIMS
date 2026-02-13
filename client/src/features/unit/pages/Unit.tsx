import { useEffect, useState } from "react";
import { Plus, Trash2, Edit3, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useUnits } from "../hooks/useUnits";
import UnitFormModal from "../components/UnitFormModal"; 
import type { UnitFormData, UnitData } from "@/types/Unit";

export default function UnitsPage() {
    const { units, fetchUnits, removeUnit, addUnit, updateUnit, isLoading } = useUnits();

    // --- Modal State Management ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUnit, setSelectedUnit] = useState<UnitData | null>(null);

    useEffect(() => { 
        fetchUnits(); 
    }, [fetchUnits]);

    // Handle opening modal for a new unit
    const handleAddClick = () => {
        setSelectedUnit(null);
        setIsModalOpen(true);
    };

    // Handle opening modal for editing an existing unit
    const handleEditClick = (unit: UnitData) => {
        setSelectedUnit(unit);
        setIsModalOpen(true);
    };

    // Unified submit handler for the modal
    const handleFormSubmit = async (data: UnitFormData) => {
        if (selectedUnit) {
            await updateUnit(selectedUnit._id, data);
        } else {
            await addUnit(data);
        }
        setIsModalOpen(false);
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Units</h2>
                    <p className="text-slate-500 text-sm font-medium">Manage measurement units and conversion properties.</p>
                </div>
                <Button 
                    onClick={handleAddClick}
                    className="bg-blue-600 hover:bg-blue-700 h-11 rounded-xl font-bold gap-2 transition-all active:scale-95"
                >
                    <Plus size={18} /> Define Unit
                </Button>
            </div>

            <div className="bg-white border border-slate-200 rounded-[2rem] overflow-hidden shadow-sm">
                <table className="w-full text-left">
                    <thead className="bg-slate-50/50 border-b border-slate-100">
                        <tr>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Unit / Short</th>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</th>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Base</th>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Fraction</th>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                            <th className="px-8 py-5 text-right"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {units?.map((unit) => (
                            <tr key={unit._id} className="hover:bg-slate-50/30 transition-colors group">
                                <td className="px-8 py-5">
                                    <div className="flex flex-col">
                                        <span className="font-bold text-slate-800">{unit.name}</span>
                                        <span className="text-[10px] font-mono font-bold text-blue-500 uppercase">{unit.shortForm}</span>
                                    </div>
                                </td>
                                <td className="px-8 py-5">
                                    <Badge variant="outline" className="rounded-md border-slate-200 text-slate-500 capitalize">{unit.unitType}</Badge>
                                </td>
                                <td className="px-8 py-5 text-center">
                                    {unit.baseUnit ? <CheckCircle2 size={16} className="text-emerald-500 mx-auto" /> : <span className="text-slate-300">-</span>}
                                </td>
                                <td className="px-8 py-5 text-center">
                                    {unit.isFractional ? <CheckCircle2 size={16} className="text-blue-500 mx-auto" /> : <XCircle size={16} className="text-slate-200 mx-auto" />}
                                </td>
                                <td className="px-8 py-5 text-center">
                                    <div className={`w-2 h-2 rounded-full mx-auto ${unit.isActive ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-300'}`} />
                                </td>
                                <td className="px-8 py-5 text-right">
                                    <div className="flex justify-end gap-1">
                                        <button 
                                            onClick={() => handleEditClick(unit)}
                                            className="p-2 text-slate-300 hover:text-blue-600 transition-colors"
                                        >
                                            <Edit3 size={16} />
                                        </button>
                                        <button 
                                            onClick={() => removeUnit(unit._id)} 
                                            className="p-2 text-slate-300 hover:text-red-600 transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal Component */}
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