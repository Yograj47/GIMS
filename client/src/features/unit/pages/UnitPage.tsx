import { SettingsPageHeader, SettingsSearch } from "@/features/settings/components/SettingsPageHeader";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Plus, Scale } from "lucide-react";
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
        <div className="min-w-0">
            <SettingsPageHeader title="Measurement units" description="Set up the units used to measure inventory." icon={Scale}>
                <AdminGate><Button onClick={() => { handleAddClick(); }}><Plus size={16} /> Add unit</Button></AdminGate>
            </SettingsPageHeader>
            <SettingsSearch label="Search units" value={searchQuery} onChange={(value) => {
                setSearchQuery(value);
                setPagination((previous) => ({ ...previous, pageIndex: 0 }));
            }} />

            <div className="min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white">
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