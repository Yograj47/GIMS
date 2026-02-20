import { useMemo } from "react";
import { ArrowLeft, Trash2, Loader2, CreditCard, Info, ReceiptText, ShoppingCart, TrendingUp } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useForm, useFieldArray, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// UI Components (Assuming standard shadcn/ui or similar)
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ProductItemModal from "./ProductItemModal";

import { transactionSchema, type TransactionFormData } from "@/types/Transaction";
import { useMovementTransactions } from "../hooks/useMovementTransactions";

export default function MovementForm() {
    const [searchParams] = useSearchParams();
    const mode = searchParams.get('mode') || 'in';
    const isStockIn = mode === "in";
    const navigate = useNavigate();

    const { createTransaction, isLoading } = useMovementTransactions();

    const { register, control, handleSubmit, watch, setValue } = useForm<TransactionFormData>({
        resolver: zodResolver(transactionSchema) as Resolver<TransactionFormData>,
        defaultValues: {
            transactionType: isStockIn ? 'Purchase' : 'Sale',
            items: [],
            grandTotal: 0,
            isPaid: false,
            partyDetails: { name: "", phone: "" },
            notes: ""
        }
    });

    const { fields, append, remove } = useFieldArray({ control, name: "items" });
    const currentType = watch("transactionType");
    const watchedItems = watch("items");
    const showSettlement = currentType === "Purchase" || currentType === "Sale";

    const grandTotal = useMemo(() => {
        const total = watchedItems.reduce((sum, item) => sum + (item.total || 0), 0);
        setValue("grandTotal", total);
        return total;
    }, [watchedItems, setValue]);

    const onFormSubmit = async (data: TransactionFormData) => {
        const success = await createTransaction(data);
        if (success) navigate("/reports/transactions");
    };

    // Style Constants matching your image
    const sectionHeader = "flex items-center gap-2 text-[11px] font-black uppercase tracking-wider text-blue-600 mb-4";
    const cardBase = "bg-white border border-slate-200 rounded-xl p-6 shadow-sm mb-6";
    const labelBase = "text-sm font-bold text-slate-700 mb-1.5 block";
    const inputBase = "bg-slate-50 border-slate-200 rounded-lg h-12 focus:bg-white transition-all";

    return (
        <form onSubmit={handleSubmit(onFormSubmit)} className="p-8 max-w-350 mx-auto">
            
            {/* PAGE HEADER */}
            <div className="flex items-center gap-4 mb-8">
                <Button variant="outline" size="icon" onClick={() => navigate(-1)} className="rounded-full h-10 w-10 border-slate-200 bg-white">
                    <ArrowLeft size={18} />
                </Button>
                <div>
                    <h1 className="text-2xl font-black text-slate-900 leading-none mb-1">
                        {isStockIn ? "Inventory Entry" : "Inventory Release"}
                    </h1>
                    <p className="text-sm text-slate-500">Record a new stock movement for the main branch</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* LEFT: MAIN FORM */}
                <div className="lg:col-span-8">
                    
                    {/* SECTION 1: GENERAL INFO */}
                    <div className={cardBase}>
                        <div className={sectionHeader}>
                            <Info size={14} /> General Information
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className={labelBase}>Movement Reason *</label>
                                <select {...register("transactionType")} className={`w-full px-3 ${inputBase}`}>
                                    {isStockIn ? (
                                        <>
                                            <option value="Purchase">Purchase (New Stock)</option>
                                            <option value="Return">Sales Return</option>
                                            <option value="Adjustment">Stock Adjustment (+)</option>
                                        </>
                                    ) : (
                                        <>
                                            <option value="Sale">Sale (Outbound)</option>
                                            <option value="Damage">Damage / Expiry</option>
                                            <option value="Adjustment">Stock Adjustment (-)</option>
                                        </>
                                    )}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* SECTION 2: ITEMS */}
                    <div className={cardBase}>
                        <div className="flex justify-between items-center mb-6">
                            <div className={sectionHeader}><ShoppingCart size={14} /> Items Selection</div>
                            <ProductItemModal isStockIn={isStockIn} onAdd={(newItem) => append(newItem)} />
                        </div>

                        <div className="space-y-3 min-h-25">
                            {fields.length === 0 ? (
                                <div className="text-center py-10 border-2 border-dashed border-slate-100 rounded-xl">
                                    <p className="text-sm text-slate-400 font-medium">No items added yet. Click the button above to add products.</p>
                                </div>
                            ) : (
                                fields.map((field, index) => (
                                    <div key={field.id} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-lg group">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 bg-white border border-slate-200 rounded flex items-center justify-center font-bold text-slate-400">
                                                {(field as any).productName?.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900">{(field as any).productName}</p>
                                                <p className="text-xs text-slate-500">Rate: ₹{field.rate} | Qty: {field.qty} {field.unitName}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <p className="font-black text-slate-900">₹{field.total}</p>
                                            <button type="button" onClick={() => remove(index)} className="text-slate-300 hover:text-red-500 transition-colors">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* TOTAL PREVIEW */}
                        <div className="mt-6 pt-6 border-t border-slate-100 flex justify-end">
                            <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-4 flex items-center gap-4 min-w-60">
                                <div className="h-10 w-10 bg-emerald-500 rounded flex items-center justify-center text-white">
                                    <TrendingUp size={20} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-emerald-600 uppercase">Estimated Total</p>
                                    <p className="text-xl font-black text-emerald-700">₹{grandTotal}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SECTION 3: NOTES */}
                    <div className={cardBase}>
                        <div className={sectionHeader}><ReceiptText size={14} /> Additional Notes</div>
                        <textarea {...register("notes")} className={`${inputBase} w-full p-3 h-24 resize-none`} placeholder="Optional notes for internal tracking..." />
                    </div>
                </div>

                {/* RIGHT: SIDEBAR (SETTLEMENT) */}
                <div className="lg:col-span-4 space-y-6">
                    
                    {showSettlement ? (
                        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                            <div className="bg-blue-600 p-4 text-white">
                                <h2 className="font-black text-sm flex items-center gap-2">
                                    <CreditCard size={16} /> Settlement Details
                                </h2>
                            </div>
                            <div className="p-6 space-y-5">
                                <div className="flex gap-2 p-1 bg-slate-100 rounded-lg">
                                    <button type="button" onClick={() => setValue("isPaid", true)} className={`flex-1 py-2 rounded-md text-xs font-black transition-all ${watch("isPaid") ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}>PAID</button>
                                    <button type="button" onClick={() => setValue("isPaid", false)} className={`flex-1 py-2 rounded-md text-xs font-black transition-all ${!watch("isPaid") ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}>CREDIT</button>
                                </div>
                                <div>
                                    <label className={labelBase}>{isStockIn ? 'Supplier Name' : 'Customer Name'}</label>
                                    <Input {...register("partyDetails.name")} className={inputBase} placeholder="Enter name" />
                                </div>
                                <div>
                                    <label className={labelBase}>Phone Number</label>
                                    <Input {...register("partyDetails.phone")} className={inputBase} placeholder="Enter contact" />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 border-dashed text-center">
                            <Info size={24} className="mx-auto text-slate-300 mb-2" />
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-tight">No Payment Info Required</p>
                            <p className="text-[10px] text-slate-400 mt-1">This is an internal stock adjustment.</p>
                        </div>
                    )}

                    <Button 
                        type="submit" 
                        disabled={isLoading || fields.length === 0} 
                        className="w-full h-14 rounded-xl bg-blue-600 hover:bg-blue-700 text-base font-black shadow-lg shadow-blue-100"
                    >
                        {isLoading ? <Loader2 className="animate-spin mr-2" /> : "Complete Transaction"}
                    </Button>
                </div>
            </div>
        </form>
    );
}