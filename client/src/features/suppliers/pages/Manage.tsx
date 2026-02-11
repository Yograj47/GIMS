import { useParams, useNavigate } from "react-router-dom";
import SupplierForm from "../components/SupplierForm";
import type { SupplierFormData } from "@/types/Supplier";
import { useSuppliers } from "../hooks/useSuppliers";
import { useEffect } from "react";
import { Loading } from "@/lib/loader";

export default function ManageSupplier() {
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const navigate = useNavigate();
  const {
    addSupplier,
    updateSupplier,
    fetchSupplierById,
    singleSupplier,
    isLoading
  } = useSuppliers();


  useEffect(() => {
    if (isEditMode && id) {
      fetchSupplierById(id)
    }
  }, [id, fetchSupplierById])

  const handleSubmit = async (data: SupplierFormData) => {
    let success = false;

    if (isEditMode && id) {
      success = await updateSupplier(id, data);
    } else {
      success = await addSupplier(data);
    }

    if (success) {
      navigate("/suppliers");
    }
  };

  if (isEditMode && !singleSupplier && isLoading) {
    return <Loading fullPage />;
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="mb-8 border-l-4 border-blue-600 pl-6">
        <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">
          Inventory Administration
        </p>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          {id ? "Modify Supplier" : "Register Supplier"}
        </h1>
      </div>

      <div className="bg-white border border-slate-200 rounded-[2rem] p-10 shadow-sm shadow-slate-100/50">
        <SupplierForm
          initialData={isEditMode && singleSupplier ? singleSupplier : undefined}
          onSubmit={handleSubmit}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}