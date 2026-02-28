import { Edit3, Layers } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import type { ProductData } from "@/types/Product";
import type { NavigateFunction } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const getProductColumns = (navigate: NavigateFunction): ColumnDef<ProductData>[] => [
    {
        accessorKey: "name",
        header: "Product Details",
        cell: ({ row }) => {
            const product = row.original;
            const isLowStock = product.quantity <= product.threshold;
            return (
                <div className="flex items-center gap-4 group">
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 font-black text-xs border transition-all shadow-sm ${
                        isLowStock 
                        ? "bg-red-50 text-red-500 border-red-100 group-hover:bg-red-500 group-hover:text-white" 
                        : "bg-blue-50 text-blue-600 border-blue-100 group-hover:bg-blue-600 group-hover:text-white"
                    }`}>
                        {product.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex flex-col">
                        <span className="font-black text-slate-900 text-sm uppercase tracking-tight">
                            {product.name}
                        </span>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5 flex items-center gap-1">
                            SKU-{product._id.slice(-6).toUpperCase()}
                        </span>
                    </div>
                </div>
            );
        },
    },
    {
        accessorKey: "category.name",
        header: "Category",
        cell: ({ row }) => (
            <div className="flex items-center gap-2">
                <Layers size={14} className="text-slate-300" />
                <Badge variant="secondary" className="bg-slate-100 text-slate-600 border-none font-black text-[10px] uppercase px-2 py-0.5 rounded-md tracking-tighter">
                    {row.original.category.name}
                </Badge>
            </div>
        ),
    },
    {
        accessorKey: "quantity",
        header: "Stock Level",
        cell: ({ row }) => {
            const product = row.original;
            const isLowStock = product.quantity <= product.threshold;
            return (
                <div className="flex flex-col gap-1.5 min-w-25">
                    <div className="flex items-center gap-2">
                        <span className={`text-sm font-black ${isLowStock ? "text-red-600" : "text-slate-900"}`}>
                            {product.quantity} {product.unit.name}
                        </span>
                        {isLowStock && (
                            <Badge className="bg-red-50 text-red-600 hover:bg-red-50 border-none text-[9px] font-black h-4 px-1">
                                LOW
                            </Badge>
                        )}
                    </div>
                    <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                        <div
                            className={`h-full transition-all duration-500 ${isLowStock ? "bg-red-500" : "bg-blue-500"}`}
                            style={{ width: `${Math.min((product.quantity / (product.threshold * 2)) * 100, 100)}%` }}
                        />
                    </div>
                </div>
            );
        },
    },
    {
        id: "pricing",
        header: () => <div className="text-right">Pricing (INR)</div>,
        cell: ({ row }) => {
            const product = row.original;
            return (
                <div className="flex items-center gap-4 justify-end">
                    <div className="flex flex-col items-end">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Buy</span>
                        <span className="text-xs font-bold text-slate-500">₹{product.basePrice}</span>
                    </div>
                    <div className="flex flex-col items-end border-l border-slate-100 pl-4">
                        <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest">Sell</span>
                        <span className="text-sm font-black text-slate-900">₹{product.sellingPrice}</span>
                    </div>
                </div>
            );
        },
    },
    {
        id: "actions",
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => (
            <div className="text-right">
                <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-xl hover:bg-slate-100 h-9 w-9 p-0 text-slate-400 hover:text-blue-600"
                    onClick={(e) => {
                        e.stopPropagation(); // Prevent row expansion if applicable
                        navigate(`/products/edit/${row.original._id}`);
                    }}
                >
                    <Edit3 size={16} strokeWidth={2.5} />
                </Button>
            </div>
        ),
    },
];