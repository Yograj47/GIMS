import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/common/DataTable";
import { useMovementTransactions } from "../../MovementTransaction/hooks/useMovementTransactions";
import { getProductHistoryColumns } from "../components/ProductHistoryColumns";

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
        <div className="h-full bg-slate-50/50 animate-in fade-in duration-500">
            <div className="max-w-400 mx-auto space-y-6">

                {/* 1. COMPACT NAVIGATION HEADER */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 pb-6">
                    <div className="flex items-start gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate(-1)}
                            className="text-slate-500 hover:text-blue-600 group"
                        >
                            <div className="w-8 h-8 rounded-sm bg-slate-100 flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                                <ArrowLeft size={16} strokeWidth={3} className="group-hover:-translate-x-1 transition-transform" />
                            </div>
                        </Button>
                        <div className="space-y-1">
                            <h1 className="text-xl font-bold text-slate-900 tracking-tight uppercase flex items-center gap-2">
                                Audit Logs: <span className="text-blue-600">{productName}</span>
                            </h1>
                            <div className="flex items-center gap-3">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                    Product ID: <span className="font-mono text-slate-600">{productId?.slice(-8).toUpperCase()}</span>
                                </p>
                                <div className="h-1 w-1 rounded-full bg-slate-300" />
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    Mode: <span className="text-emerald-600 italic">Live Ledger</span>
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* 2. PRECISION STATS (The "Status Bar") */}
                    <div className="flex items-center bg-white border border-slate-200 rounded-sm p-1 shadow-sm">
                        <div className="px-4 py-1.5 border-r border-slate-100 flex flex-col">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Gross Inflow</span>
                            <span className="text-sm font-black text-emerald-600 tabular-nums">+{totalIn}</span>
                        </div>
                        <div className="px-4 py-1.5 flex flex-col">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Gross Outflow</span>
                            <span className="text-sm font-black text-rose-600 tabular-nums">-{totalOut}</span>
                        </div>
                    </div>
                </div>

                {/* 3. TABLE AREA */}
                <div className="bg-white border border-slate-200 rounded-sm overflow-hidden shadow-sm">
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

                {/* 4. SYSTEM FOOTER */}
                <div className="flex justify-between items-center opacity-50 px-2">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em]">Secure_Audit_Trail</p>
                    <p className="text-[9px] font-mono font-bold text-slate-400">P_LOG_REF: {new Date().getTime()}</p>
                </div>
            </div>
        </div>
    );
}