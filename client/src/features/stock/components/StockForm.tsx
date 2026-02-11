import { useState } from "react";
import { Plus, ArrowLeft, Wallet, Trash2, Package } from "lucide-react";
import { Dialog,  DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate, useSearchParams } from "react-router-dom";

import type { Item, TransactionInput } from "@/types/Transaction";

export default function StockMovementForm() {
    const [searchParams] = useSearchParams();
    const mode = searchParams.get('mode') || 'in';
    const isStockIn = mode === "in";
    const navigate = useNavigate();

    const [formData, setFormData] = useState<Partial<TransactionInput>>({
        transactionType: isStockIn ? 'Purchase' : 'Sale',
        items: [],
        isPaid: false,
        partyDetails: { name: "", phone: "" },
        notes: ""
    });

    // MODAL STATE: Using Item type for the "Add Product" form
    const [tempItem, setTempItem] = useState<Partial<Item>>({
        productId: "",
        unitId: "",
        qty: 0,
        rate: 0
    });

    const [showProductModal, setShowProductModal] = useState(false);

    const handleAddItem = () => {
        if (!tempItem.productId || !tempItem.qty || tempItem.qty <= 0 || !tempItem.unitId) return;

        const newItem: Item = {
            productId: tempItem.productId!,
            unitId: tempItem.unitId!,
            qty: tempItem.qty!,
            rate: tempItem.rate || 0,
            total: (tempItem.qty || 0) * (tempItem.rate || 0)
        };

        setFormData(prev => ({
            ...prev,
            items: [...(prev.items || []), newItem]
        }));

        setShowProductModal(false);
        setTempItem({ productId: "", qty: 0, rate: 0, unitId: "" });
    };

    const removeItem = (index: number) => {
        setFormData(prev => ({
            ...prev,
            items: prev.items?.filter((_, i) => i !== index)
        }));
    };

    const grandTotal = formData.items?.reduce((sum, item) => sum + item.total, 0) || 0;

    // Only showing the return block for brevity - applies to your existing state logic
return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500 pb-20">
        {/* Navigation Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" className="rounded-xl hover:bg-slate-100" onClick={() => navigate("/stock-movements")}>
                    <ArrowLeft size={20} className="text-slate-400" />
                </Button>
                <div>
                    <h1 className="text-xl font-black text-slate-900 tracking-tight leading-none">
                        {isStockIn ? "Inventory Entry (Inward)" : "Inventory Release (Outward)"}
                    </h1>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                        Mode: {formData.transactionType}
                    </p>
                </div>
            </div>
            {/* Status indicator */}
            <div className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${isStockIn ? 'bg-blue-50 text-blue-600' : 'bg-rose-50 text-rose-600'}`}>
                Stock {mode}
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                    <div className="p-6 space-y-6">
                        {/* Transaction Type Select */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Type of Movement</label>
                            <select
                                value={formData.transactionType}
                                onChange={(e) => setFormData({ ...formData, transactionType: e.target.value as any })}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                            >
                                {isStockIn ? (
                                    <>
                                        <option value="Purchase">Purchase (Buy from Supplier)</option>
                                        <option value="Return">Sales Return (Customer Back)</option>
                                        <option value="Fixed">Adjustment (Manual Addition)</option>
                                    </>
                                ) : (
                                    <>
                                        <option value="Sale">Sale (Sell to Customer)</option>
                                        <option value="Return">Purchase Return (Back to Supplier)</option>
                                        <option value="Damage">Damage (Wastage)</option>
                                        <option value="Fixed">Adjustment (Manual Reduction)</option>
                                    </>
                                )}
                            </select>
                        </div>

                        {/* Product Management Area */}
                        <div className="pt-4 space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="font-black text-slate-800 text-sm tracking-tight flex items-center gap-2">
                                    <Package size={16} className="text-blue-500" /> Items Summary
                                </h3>
                                <Dialog open={showProductModal} onOpenChange={setShowProductModal}>
                                    <DialogTrigger asChild>
                                        <Button variant="outline" className="rounded-xl border-dashed border-slate-300 hover:border-blue-400 hover:text-blue-600 font-bold text-xs h-9">
                                            <Plus size={16} className="mr-1.5" /> Add Product
                                        </Button>
                                    </DialogTrigger>
                                    {/* Modal Content stays the same logic-wise, just wrap in better spacing */}
                                </Dialog>
                            </div>

                            <div className="border border-slate-100 rounded-xl overflow-hidden bg-slate-50/30">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                                            <th className="px-6 py-4">Item Details</th>
                                            <th className="px-6 py-4">Quantity</th>
                                            <th className="px-6 py-4">Subtotal</th>
                                            <th className="px-6 py-4 text-right">Remove</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {formData.items?.length === 0 ? (
                                            <tr><td colSpan={4} className="py-16 text-center text-slate-400 text-sm italic">No products added to this movement.</td></tr>
                                        ) : (
                                            formData.items?.map((item, i) => (
                                                <tr key={i} className="text-sm font-semibold text-slate-700 bg-white group hover:bg-slate-50 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <span className="font-bold text-slate-900">{item.productId}</span>
                                                        <p className="text-[10px] text-slate-400 font-medium">Rate: ₹{item.rate}</p>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {item.qty} <span className="text-[10px] font-black text-slate-300 uppercase">{item.unitId}</span>
                                                    </td>
                                                    <td className="px-6 py-4 font-black text-blue-600">₹{item.total.toLocaleString()}</td>
                                                    <td className="px-6 py-4 text-right">
                                                        <button onClick={() => removeItem(i)} className="p-2 text-slate-300 hover:text-rose-500 transition-colors">
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Total & Action Bar */}
                    <div className="flex items-center justify-between bg-slate-600 px-8 py-5 text-white">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-200">Total Payable</span>
                            <span className="text-2xl font-black tracking-tighter">₹{grandTotal.toLocaleString()}</span>
                        </div>
                        <Button className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold h-12 px-8 shadow-lg shadow-blue-900/20">
                            Process Transaction
                        </Button>
                    </div>
                </div>
            </div>

            {/* SIDEBAR */}
            <aside className="space-y-6">
                {(formData.transactionType === 'Purchase' || formData.transactionType === 'Sale') && (
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
                        <div className="space-y-3">
                            <h3 className="font-black text-slate-800 text-xs uppercase tracking-widest flex items-center gap-2">
                                <Wallet size={14} className="text-slate-400" /> Settlement Status
                            </h3>
                            <div className="flex bg-slate-100 p-1.5 rounded-xl border border-slate-200">
                                <button 
                                    onClick={() => setFormData({ ...formData, isPaid: true })} 
                                    className={`flex-1 py-2 rounded-lg text-xs font-black transition-all ${formData.isPaid ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400'}`}
                                >
                                    PAID
                                </button>
                                <button 
                                    onClick={() => setFormData({ ...formData, isPaid: false })} 
                                    className={`flex-1 py-2 rounded-lg text-xs font-black transition-all ${!formData.isPaid ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-400'}`}
                                >
                                    CREDIT
                                </button>
                            </div>
                        </div>

                        <div className="space-y-3 pt-2">
                            <h3 className="font-black text-slate-800 text-xs uppercase tracking-widest">
                                {formData.transactionType === 'Purchase' ? "Supplier Details" : "Customer Details"}
                            </h3>
                            {formData.transactionType === 'Purchase' ? (
                                <select
                                    className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-bold text-slate-700 outline-none"
                                    value={formData.partyDetails?.name}
                                    onChange={(e) => setFormData({ ...formData, partyDetails: { ...formData.partyDetails, name: e.target.value } })}
                                >
                                    <option value="">Select Supplier</option>
                                    <option value="Supplier A">Supplier A</option>
                                </select>
                            ) : (
                                <div className="space-y-2">
                                    <Input 
                                        placeholder="Name" 
                                        className="h-11 text-xs font-bold bg-slate-50 border-slate-200" 
                                        value={formData.partyDetails?.name}
                                        onChange={(e) => setFormData({ ...formData, partyDetails: { ...formData.partyDetails, name: e.target.value } })}
                                    />
                                    <Input 
                                        placeholder="Phone (Optional)" 
                                        className="h-11 text-xs font-bold bg-slate-50 border-slate-200"
                                        value={formData.partyDetails?.phone}
                                        onChange={(e) => setFormData({ ...formData, partyDetails: { ...formData.partyDetails, phone: e.target.value } })}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                )}

                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                    <h3 className="font-black text-slate-800 text-xs uppercase tracking-widest mb-4">Internal Notes</h3>
                    <textarea
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        placeholder="Write details like 'Damaged during unloading'..."
                        className="w-full h-28 bg-slate-50 border border-slate-100 rounded-xl p-4 text-xs font-bold text-slate-600 focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all resize-none"
                    />
                </div>
            </aside>
        </div>
    </div>
);
}