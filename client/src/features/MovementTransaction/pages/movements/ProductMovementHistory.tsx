import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Package, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/common/DataTable";
import { useMovementTransactions } from "../../hooks/useMovementTransactions";
import { getProductHistoryColumns } from "../../components/ProductHistoryColumns";

export default function ProductMovementHistory() {
    const { productId } = useParams();
    const navigate = useNavigate();
    const { fetchProductMovements, productMovements, isLoading, meta } = useMovementTransactions();

    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10,
    });

    useEffect(() => {
        if (productId) {
            fetchProductMovements(productId, pagination.pageIndex + 1, pagination.pageSize);
        }
    }, [productId, pagination, fetchProductMovements]);

    // Derived Statistics
    const totalIn = useMemo(() => productMovements.filter(m => m.movementType === 'IN').reduce((acc, m) => acc + m.quantity, 0), [productMovements]);
    const totalOut = useMemo(() => productMovements.filter(m => m.movementType === 'OUT').reduce((acc, m) => acc + m.quantity, 0), [productMovements]);
    const productName = productMovements[0]?.product?.name || "Product Audit";

    const columns = useMemo(() => getProductHistoryColumns, []);

    return (
        <div className="min-h-full space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-10">
            {/* Navigation & Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-4">
                    <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={() => navigate(-1)}
                        className="rounded-2xl border-slate-200 hover:bg-white hover:text-indigo-600 shadow-sm h-12 w-12"
                    >
                        <ArrowLeft size={20} />
                    </Button>
                    <div className="space-y-0.5">
                        <h1 className="text-2xl font-black text-slate-800 tracking-tight uppercase flex items-center gap-2">
                           <History className="text-indigo-600" size={24} /> Movement History
                        </h1>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-1.5">
                            <Package size={12} className="text-slate-400" />
                            Tracing: <span className="text-indigo-500">{productName}</span>
                        </p>
                    </div>
                </div>

                {/* Quick Summary Cards */}
                <div className="flex gap-2">
                    <div className="bg-white p-1 rounded-2xl border border-slate-200 flex gap-1">
                        <div className="bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100 flex flex-col items-center min-w-20">
                            <span className="text-[9px] font-black text-emerald-600 uppercase">Total In</span>
                            <span className="text-sm font-black text-emerald-700">+{totalIn}</span>
                        </div>
                        <div className="bg-rose-50 px-4 py-2 rounded-xl border border-rose-100 flex flex-col items-center min-w-20">
                            <span className="text-[9px] font-black text-rose-600 uppercase">Total Out</span>
                            <span className="text-sm font-black text-rose-700">-{totalOut}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* The DataTable Component */}
            <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
                <DataTable
                    columns={columns}
                    data={productMovements || []}
                    rowCount={meta?.totalItems || 0}
                    pageCount={meta?.totalPages || 0}
                    pagination={pagination}
                    setPagination={setPagination}
                    isLoading={isLoading}
                />
            </div>
        </div>
    );
}