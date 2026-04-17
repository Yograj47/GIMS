import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Lightbulb, ShieldAlert } from "lucide-react";
import SupplierForm from "../components/SupplierForm";
import { Button } from "@/components/ui/button";
import { useSuppliers } from "../hooks/useSuppliers";
import { useEffect } from "react";
import { Loading } from "@/lib/loader";
import type { SupplierFormData } from "@/types/Supplier";

export default function ManageSupplier() {
    const { id } = useParams();
    const isEditMode = Boolean(id);
    const navigate = useNavigate();
    const { addSupplier, updateSupplier, fetchSupplierById, singleSupplier, isLoading } = useSuppliers();

    useEffect(() => {
        if (isEditMode && id) fetchSupplierById(id);
    }, [id, isEditMode, fetchSupplierById]);

    const handleSubmit = async (data: SupplierFormData) => {
        let success = isEditMode && id
            ? await updateSupplier(id, data)
            : await addSupplier(data);
            
        if (success) navigate("/suppliers");
    };

    if (isEditMode && !singleSupplier && isLoading) return <Loading fullPage />;

    return (
        <div className="h-full animate-in fade-in duration-500">
            {/* Header*/}
            <div className="flex items-center justify-between border-b border-slate-200 pb-6">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate("/suppliers")}
                        className="text-slate-500 hover:text-blue-600 group"
                    >
                        <div className="w-8 h-8 rounded-sm bg-slate-100 flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                            <ArrowLeft size={16} strokeWidth={3} className="group-hover:-translate-x-1 transition-transform" />
                        </div>
                    </Button>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 tracking-tight uppercase">
                            {isEditMode ? "Modify Supplier" : "Vendor Entry"}
                        </h1>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                            {isEditMode ? `Registry ID: ${id?.slice(-8)}` : "Supply Chain Onboarding"}
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                {/* Main Form Section */}
                <div className="lg:col-span-2 bg-white border border-slate-300 rounded-sm shadow-sm overflow-hidden">
                    <div className="p-6">
                        <SupplierForm
                            initialData={isEditMode && singleSupplier ? singleSupplier : undefined}
                            onSubmit={handleSubmit}
                        />
                    </div>

                    {/* Action Footer: Standardized */}
                    <div className="flex items-center justify-end gap-2 bg-slate-50/50 border-t border-slate-300 px-6 py-4">
                        <Button
                            variant="outline"
                            type="button"
                            onClick={() => navigate("/suppliers")}
                            className="border-slate-200 text-[11px] font-bold uppercase h-9 px-4 rounded-sm"
                        >
                            Discard
                        </Button>
                        <Button
                            type="submit"
                            form="supplier-form"
                            disabled={isLoading}
                            className="bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold uppercase h-9 px-6 rounded-sm shadow-sm transition-all active:scale-95"
                        >
                            <Save size={14} className="mr-2" />
                            {isLoading ? "Processing..." : isEditMode ? "Commit Changes" : "Confirm Entry"}
                        </Button>
                    </div>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-4">
                    <div className="bg-slate-900 rounded-sm p-5 text-white shadow-lg">
                        <div className="flex items-center gap-2 mb-3 text-blue-400">
                            <Lightbulb size={16} strokeWidth={3} />
                            <h3 className="font-bold text-[11px] uppercase tracking-widest">Logistics Note</h3>
                        </div>
                        <p className="text-slate-400 text-xs leading-relaxed font-medium">
                            Accurate contact details are critical for <span className="text-white">Purchase Orders</span>. Automated restock alerts rely on the phone number provided here.
                        </p>
                    </div>

                    <div className="bg-white border border-slate-300 rounded-sm p-5">
                        <div className="flex items-center gap-2 mb-4 text-slate-900">
                            <ShieldAlert size={16} strokeWidth={3} />
                            <h3 className="font-bold text-[11px] uppercase tracking-widest">Compliance</h3>
                        </div>
                        <div className="space-y-4">
                            <div className="flex gap-3">
                                <div className="h-4 w-4 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[10px] font-black shrink-0">1</div>
                                <p className="text-slate-500 text-[11px] font-medium leading-tight uppercase">Email serves as the primary channel for digital invoicing.</p>
                            </div>
                            <div className="flex gap-3">
                                <div className="h-4 w-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-[10px] font-black shrink-0">2</div>
                                <p className="text-slate-500 text-[11px] font-medium leading-tight uppercase">Active status allows selection in procurement modules.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}