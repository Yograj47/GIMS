import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, UserPlus, FileEdit, Save, Info } from "lucide-react";
import SupplierForm from "../components/SupplierForm";
import { Button } from "@/components/ui/button";
import { useSuppliers } from "../hooks/useSuppliers";
import { useEffect } from "react";
import { Loading } from "@/lib/loader";

export default function ManageSupplier() {
    const { id } = useParams();
    const isEditMode = Boolean(id);
    const navigate = useNavigate();
    const { addSupplier, updateSupplier, fetchSupplierById, singleSupplier, isLoading } = useSuppliers();

    useEffect(() => {
        if (isEditMode && id) fetchSupplierById(id);
    }, [id, isEditMode, fetchSupplierById]);

    const handleSubmit = async (data: any) => {
        const success = isEditMode && id ? await updateSupplier(id, data) : await addSupplier(data);
        if (success) navigate("/suppliers");
    };

    if (isEditMode && !singleSupplier && isLoading) return <Loading fullPage />;

    return (
        <div className="min-h-full space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" className="rounded-xl" onClick={() => navigate("/suppliers")}>
                        <ArrowLeft size={18} />
                    </Button>
                    <div>
                        <div className="flex items-center gap-2">
                            {isEditMode ? <FileEdit className="text-blue-600" size={20} /> : <UserPlus className="text-blue-600" size={20} />}
                            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                                {isEditMode ? "Update Supplier" : "Register Supplier"}
                            </h1>
                        </div>
                        <p className="text-sm font-medium text-slate-500">
                            {isEditMode ? `Editing ${singleSupplier?.name}` : "Add a new vendor to your supply chain"}
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Card */}
                <div className="lg:col-span-2">
                    <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
                        <div className="p-8">
                            <SupplierForm 
                                initialData={isEditMode && singleSupplier ? singleSupplier : undefined} 
                                onSubmit={handleSubmit} 
                                isLoading={isLoading} 
                            />
                        </div>

                        {/* Action Footer */}
                        <div className="flex items-center justify-end gap-3 border-t border-slate-50 bg-slate-50/50 px-8 py-4">
                            <Button variant="outline" onClick={() => navigate(-1)} className="rounded-xl font-bold px-6">
                                Cancel
                            </Button>
                            <Button 
                                type="submit" 
                                form="supplier-form" 
                                disabled={isLoading} 
                                className="bg-blue-600 hover:bg-blue-700 rounded-xl font-bold px-8 shadow-lg shadow-blue-100"
                            >
                                {isLoading ? <Loading /> : <Save size={16} className="mr-2" />}
                                {isEditMode ? "Save Changes" : "Register Supplier"}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    <div className="bg-blue-600 rounded-2xl p-6 text-white shadow-xl">
                        <div className="flex items-center gap-2 mb-3">
                            <Info size={18} className="text-white" />
                            <h3 className="font-bold text-lg">Vendor Relations</h3>
                        </div>
                        <p className="text-blue-100 text-sm leading-relaxed">
                            Accurate contact details ensure that <span className="text-white font-medium">Purchase Orders</span> and <span className="text-white font-medium">Restock Alerts</span> reach your suppliers without delay.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}