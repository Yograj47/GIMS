import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import axios from "axios";
import { Loading } from "@/lib/loader";
import type { SupplierType } from "@/types/Supplier";
import SupplierForm from "../components/SupplierForm";

export default function ManageSupplier() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [initialData, setInitialData] = useState<SupplierType | undefined>(undefined);
  const [isPageLoading, setIsPageLoading] = useState(!!id);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      const fetchSupplier = async () => {
        try {
          const { data } = await axios.get(`/api/v1/suppliers/${id}`);
          setInitialData(data.data);
        } catch (error) {
          toast.error("Error: Could not find supplier record.");
          navigate("/suppliers");
        } finally {
          setIsPageLoading(false);
        }
      };
      fetchSupplier();
    }
  }, [id, navigate]);

  const handleSubmit = async (formData: SupplierType) => {
    setIsSubmitting(true);
    try {
      if (id) {
        await axios.put(`/api/v1/suppliers/${id}`, formData);
        toast.success("Supplier updated.");
      } else {
        await axios.post("/api/v1/suppliers", formData);
        toast.success("Supplier successfully added to system.");
      }
      navigate("/suppliers");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Submit failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isPageLoading) return <Loading fullPage />;

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
          initialData={initialData} 
          onSubmit={handleSubmit} 
          isLoading={isSubmitting} 
        />
      </div>
    </div>
  );
}