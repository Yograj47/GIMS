import { useEffect, useMemo } from "react";
import { ArrowLeft, Trash2, Loader2, CreditCard, Info, ReceiptText, ShoppingCart, PackagePlus, PackageMinus, Hash } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useForm, useFieldArray, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ProductItemModal from "./ProductItemModal";

import { transactionSchema, type Item, type TransactionFormData } from "@/types/Transaction";
import { useMovementTransactions } from "../hooks/useMovementTransactions";
import { cn } from "@/lib/utils";
import { useSuppliers } from "@/features/suppliers/hooks/useSuppliers";

export default function MovementForm() {
    const [searchParams] = useSearchParams();
    const mode = searchParams.get('mode') || 'in';
    const isStockIn = mode === "in";
    const navigate = useNavigate();
    const { Suppliers, fetchSuppliers } = useSuppliers();

    const { fetchTransactions, transactions, createTransaction, isLoading } = useMovementTransactions();


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

    useEffect(() => {
        if (isStockIn) {
            fetchSuppliers()
        } else {
            fetchTransactions();
        }
    }, [isStockIn, fetchTransactions, fetchSuppliers])

    const pastCustomers = useMemo(() => {

        const customers = transactions
            .filter(t => t.transactionType === "Sale")
            .map(t => t.partyDetails)

        return Array.from(new Map(customers.map(c => [c.name, c])).values())
    }, [transactions]);


    const watchedName = watch("partyDetails.name");

    useEffect(() => {
        const list = isStockIn ? Suppliers : pastCustomers;
        const match = list.find(entity => entity.name === watchedName);
        if (match) {
            setValue("partyDetails.phone", match.phone);
        }
    }, [watchedName, isStockIn, Suppliers, pastCustomers, setValue]);

    const handleAddProduct = (newItem: Item) => {
    const existingIndex = fields.findIndex(
        (item) => item.productId === newItem.productId && item.unitId === newItem.unitId
    );

    if (existingIndex > -1) {
        const currentQty = Number(watchedItems[existingIndex].qty);
        const newQty = currentQty + Number(newItem.qty);
        const newTotal = newQty * Number(newItem.rate);

        setValue(`items.${existingIndex}.qty`, newQty);
        setValue(`items.${existingIndex}.total`, newTotal);
    } else {
        append(newItem);
    }
};

    const themeColor = isStockIn ? "text-blue-600" : "text-rose-600";
    const themeBg = isStockIn ? "bg-blue-600 hover:bg-blue-700" : "bg-rose-700 hover:bg-rose-700";

    return (
        <form onSubmit={handleSubmit(onFormSubmit)} className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">

            {/* --- TOP BAR / HEADER --- */}
            <div className="flex items-center justify-between border-b border-slate-300 pb-6">
                <div className="flex items-center gap-4">
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
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className={cn("text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest text-white", themeBg)}>
                                {isStockIn ? "Inflow" : "Outflow"}
                            </span>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Inventory Module</span>
                        </div>
                        <h1 className="text-3xl text-slate-900 tracking-tighter">
                            {isStockIn ? "Stock Entry" : "Stock Release"}
                        </h1>
                    </div>
                </div>

                <div className="hidden md:flex flex-col items-end">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">System Timestamp</span>
                    <span className="text-xs font-mono font-bold text-slate-600">{new Date().toLocaleDateString()}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                {/* LEFT COLUMN: PRIMARY INPUTS */}
                <div className="lg:col-span-8 space-y-6">

                    {/* SECTION: CONFIGURATION */}
                    <section className="bg-white border border-slate-300 rounded-xl p-5 overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-2 opacity-[0.03]">
                            {isStockIn ? <PackagePlus size={80} /> : <PackageMinus size={80} />}
                        </div>
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-5 flex items-center gap-2">
                            <Info size={14} /> Movement Parameters
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Transaction Category *</label>
                                <select
                                    {...register("transactionType")}
                                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold focus:ring-2 focus:ring-indigo-500/10 outline-none transition-all"
                                >
                                    {isStockIn ? (
                                        <>
                                            <option value="Purchase">Purchase (Restock)</option>
                                            <option value="Return">Sales Return</option>
                                            <option value="Adjustment">Stock Adjustment (+)</option>
                                        </>
                                    ) : (
                                        <>
                                            <option value="Sale">Sale (Direct)</option>
                                            <option value="Damage">Wastage / Damage</option>
                                            <option value="Adjustment">Stock Adjustment (-)</option>
                                        </>
                                    )}
                                </select>
                            </div>
                        </div>
                    </section>

                    {/* SECTION: ITEM LEDGER */}
                    <section className="bg-white border border-slate-300 rounded-xl overflow-hidden">
                        <div className="px-5 py-4 border-b border-slate-300 flex items-center justify-between bg-slate-50/30">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                                <ShoppingCart size={14} /> Item Selection List
                            </h3>
                            <ProductItemModal isStockIn={isStockIn} onAdd={(newItem) => handleAddProduct(newItem)} />
                        </div>

                        <div className="divide-y divide-slate-100 min-h-30">
                            {fields.length === 0 ? (
                                <div className="py-12 text-center">
                                    <Hash size={24} className="mx-auto text-slate-200 mb-2" />
                                    <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em]">Waiting for entries...</p>
                                </div>
                            ) : (
                                fields.map((field, index) => (
                                    <div key={field.id} className="flex items-center justify-between p-4 hover:bg-slate-50/50 transition-colors group">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 bg-slate-100 border border-slate-300 rounded-lg flex items-center justify-center font-mono font-black text-slate-400">
                                                {String(index + 1).padStart(2, '0')}
                                            </div>
                                            <div>
                                                <p className="text-xs font-black text-slate-800 uppercase tracking-tight">{(field as any).productName}</p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                                                    Rate: ₹{watchedItems[index].rate} <span className="mx-1">×</span> Qty: {watchedItems[index].qty} {field.unitName}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <p className="font-mono font-black text-xs text-slate-700">₹{watchedItems[index].total}</p>
                                            <button
                                                type="button"
                                                onClick={() => remove(index)}
                                                className="text-slate-300 hover:text-rose-500 transition-colors"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* SUB-TOTAL BAR */}
                        <div className="p-5 border-t border-slate-200 bg-slate-50/30 flex justify-end">
                            <div className="flex items-center gap-4">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Aggregate Total</span>
                                <span className={cn("text-xl font-mono font-black", themeColor)}>₹{grandTotal}</span>
                            </div>
                        </div>
                    </section>

                    {/* SECTION: NOTES */}
                    <section className="bg-white border border-slate-300 rounded-xl p-5">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 flex items-center gap-2">
                            <ReceiptText size={14} /> Internal Remarks (Optional)
                        </h3>
                        <textarea
                            {...register("notes")}
                            className="w-full bg-slate-50 border border-slate-300 rounded-lg p-3 text-xs font-bold focus:bg-white outline-none transition-all h-20 resize-none"
                            placeholder="Specify details for this movement..."
                        />
                    </section>
                </div>

                {/* RIGHT COLUMN: SETTLEMENT SIDEBAR */}
                <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-8">

                    {showSettlement ? (
                        <div className="bg-white border border-slate-300 rounded-xl overflow-hidden shadow-sm">
                            <div className={cn("px-5 py-3 text-white flex items-center justify-between", themeBg)}>
                                <h2 className="font-black text-[10px] uppercase tracking-widest flex items-center gap-2">
                                    <CreditCard size={14} /> Party Info
                                </h2>
                                <ActivityIndicator />
                            </div>


                            <div className="p-5 space-y-5">
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Payment Status</label>
                                    <div className="flex gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200">
                                        <button
                                            type="button"
                                            onClick={() => setValue("isPaid", true)}
                                            className={cn(
                                                "flex-1 py-2 rounded-md text-[10px] font-black tracking-widest transition-all",
                                                watch("isPaid") ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                                            )}
                                        >
                                            PAID / SETTLED
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setValue("isPaid", false)}
                                            className={cn(
                                                "flex-1 py-2 rounded-md text-[10px] font-black tracking-widest transition-all",
                                                !watch("isPaid") ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                                            )}
                                        >
                                            CREDIT / DEBT
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-4 pt-2 border-t border-slate-100">
                                    <div className="space-y-1.5 relative">
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex justify-between">
                                            <span>{isStockIn ? "Supplier" : "Customer"}</span>
                                            {watch("partyDetails.name") && <span className="text-emerald-500 animate-in zoom-in">Verified</span>}
                                        </label>
                                        <div className="relative group">
                                            <Input
                                                list="user-list"
                                                {...register("partyDetails.name")}
                                                className="h-10 text-xs rounded-lg border-slate-300 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 transition-all pl-9"
                                                placeholder="Search or type name..."
                                            />
                                            <Info size={14} className="absolute left-3 top-3 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                                        </div>
                                        <datalist id="user-list">
                                            {(isStockIn ? Suppliers : pastCustomers).map((party, idx) => (
                                                <option key={idx} value={party?.name}>
                                                    {party?.phone}
                                                </option>
                                            ))}
                                        </datalist>
                                    </div>

                                    {/* Contact Input */}
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Contact Number</label>
                                        <div className="relative">
                                            <Input
                                                {...register("partyDetails.phone")}
                                                className="h-10 text-xs rounded-lg border-slate-300 bg-slate-50/50 focus:bg-white transition-all pl-9"
                                                placeholder="+977"
                                            />
                                            <span className="absolute left-3 top-2.5 text-slate-400 font-mono text-[10px] font-bold">#</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-slate-50 border border-slate-300 border-dashed rounded-xl p-8 text-center">
                            <div className="w-10 h-10 bg-white border border-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                <Info size={16} className="text-slate-300" />
                            </div>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Internal Adj.</p>
                            <p className="text-[10px] text-slate-400 font-bold mt-1 leading-tight">No external settlement required for this category.</p>
                        </div>
                    )}

                    <Button
                        type="submit"
                        disabled={isLoading || fields.length === 0}
                        className={cn(
                            "w-full h-12 rounded-xl text-[12px] font-black uppercase shadow-none",
                            themeBg, "hover:opacity-90 text-white"
                        )}
                    >
                        {isLoading ? <Loader2 className="animate-spin mr-2" size={14} /> : "Finalize Transaction"}
                    </Button>
                </div>
            </div>
        </form>
    );
}

function ActivityIndicator() {
    return (
        <div className="flex gap-1">
            <div className="w-1 h-1 rounded-full bg-white/40 animate-pulse"></div>
            <div className="w-1 h-1 rounded-full bg-white/60 animate-pulse [animation-delay:0.2s]"></div>
            <div className="w-1 h-1 rounded-full bg-white animate-pulse [animation-delay:0.4s]"></div>
        </div>
    );
}