import { useState } from "react";
import { Plus, ArrowLeft, Wallet, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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

    return (
        <div className="min-h-full space-y-4 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" className="rounded-xl" onClick={() => navigate("/movement")}>
                        <ArrowLeft size={18} />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                            {isStockIn ? "Stock Entry (In)" : "Stock Release (Out)"}
                        </h1>
                        <p className="text-sm font-medium text-slate-500">
                            {isStockIn ? "Purchase or Return In" : "Sale, Damage, or Return Out"}
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                        <div className="p-8 space-y-8">

                            <select
                                value={formData.transactionType}
                                onChange={(e) => setFormData({ ...formData, transactionType: e.target.value as any })}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-bold outline-none"
                            >
                                {isStockIn ? (
                                    <>
                                        <option value="Purchase">Purchase (Stock In)</option>
                                        <option value="Return">Return (Inward/Sales Return)</option>
                                        <option value="Fixed">Fixed (Add to Stock)</option>
                                    </>
                                ) : (
                                    <>
                                        <option value="Sale">Sale (Stock Out)</option>
                                        <option value="Return">Return (Outward/Purchase Return)</option>
                                        <option value="Damage">Damage (Remove from Stock)</option>
                                        <option value="Fixed">Fixed (Reduce from Stock)</option>
                                    </>
                                )}
                            </select>

                            {/* PRODUCT TABLE */}
                            <div className="space-y-4 pt-4 border-t border-slate-50">
                                <div className="flex justify-between items-center">
                                    <h2 className="font-black uppercase tracking-wider text-xs text-blue-600">Product List</h2>
                                    <Dialog open={showProductModal} onOpenChange={setShowProductModal}>
                                        <DialogTrigger asChild>
                                            <Button variant="outline" className="rounded-xl border-blue-200 text-blue-600 font-bold text-xs">
                                                <Plus size={16} className="mr-1" /> Add Product
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="rounded-2xl max-w-md">
                                            <DialogHeader><DialogTitle className="font-black">Add Item</DialogTitle></DialogHeader>
                                            <div className="space-y-4 py-2">
                                                <div className="space-y-1">
                                                    <label className="text-[11px] font-bold text-slate-400 uppercase">Product ID / Name</label>
                                                    <Input
                                                        value={tempItem.productId}
                                                        onChange={(e) => setTempItem({ ...tempItem, productId: e.target.value })}
                                                        placeholder="SKU-10293" className="rounded-xl"
                                                    />
                                                </div>
                                                <div className="grid grid-cols-3 gap-3">
                                                    <div className="col-span-1"><Input type="number" placeholder="Qty" onChange={(e) => setTempItem({ ...tempItem, qty: Number(e.target.value) })} /></div>
                                                    <div className="col-span-1">
                                                        <select
                                                            className="w-full h-10 rounded-md border border-slate-200 text-sm px-2"
                                                            value={tempItem.unitId}
                                                            onChange={(e) => setTempItem({ ...tempItem, unitId: e.target.value })}
                                                        >
                                                            <option value="kg">kg</option>
                                                            <option value="pcs">pcs</option>
                                                            <option value="box">box</option>
                                                        </select>
                                                    </div>
                                                    <div className="col-span-1"><Input type="number" placeholder="Rate" onChange={(e) => setTempItem({ ...tempItem, rate: Number(e.target.value) })} /></div>
                                                </div>
                                                <Button onClick={handleAddItem} className="w-full bg-blue-600 rounded-xl font-bold">Add to List</Button>
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                </div>

                                <div className="border border-slate-100 rounded-xl overflow-hidden">
                                    <table className="w-full text-left">
                                        <thead className="bg-slate-50/80">
                                            <tr className="text-[10px] font-black text-slate-400 uppercase border-b border-slate-100">
                                                <th className="px-6 py-4">Item</th>
                                                <th className="px-6 py-4">Qty/Unit</th>
                                                <th className="px-6 py-4">Total</th>
                                                <th className="px-6 py-4 text-right">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {formData.items?.length === 0 ? (
                                                <tr><td colSpan={4} className="py-12 text-center text-slate-400 text-sm italic">No items added yet</td></tr>
                                            ) : (
                                                formData.items?.map((item, i) => (
                                                    <tr key={i} className="text-sm font-bold text-slate-700">
                                                        <td className="px-6 py-4">{item.productId}</td>
                                                        <td className="px-6 py-4">{item.qty} <span className="text-[10px] text-slate-400 uppercase">{item.unitId}</span></td>
                                                        <td className="px-6 py-4 text-blue-600 font-black">₹{item.total.toLocaleString()}</td>
                                                        <td className="px-6 py-4 text-right">
                                                            <button onClick={() => removeItem(i)} className="text-slate-300 hover:text-red-500"><Trash2 size={16} /></button>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* FINAL ACTIONS */}
                        <div className="flex items-center justify-between border-t border-slate-50 bg-slate-50/50 px-8 py-4">
                            <span className="text-xl font-black text-slate-900 tracking-tighter">Total: ₹{grandTotal.toLocaleString()}</span>
                            <Button className="bg-blue-600 hover:bg-blue-700 rounded-xl font-bold px-10">Finish Transaction</Button>
                        </div>
                    </div>
                </div>

                {/* SIDEBAR */}
                <aside className="space-y-6">
                    {(formData.transactionType === 'Purchase' || formData.transactionType === 'Sale') && (
                        <>
                            {/* Settlement Section */}
                            <div className={`rounded-2xl p-6 shadow-xl transition-all ${formData.isPaid ? 'bg-emerald-600' : 'bg-rose-600'} text-white`}>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-bold">Settlement</h3>
                                    <Wallet size={20} className="opacity-80" />
                                </div>
                                <div className="flex bg-white/20 p-1 rounded-xl mb-6">
                                    <button onClick={() => setFormData({ ...formData, isPaid: true })} className={`flex-1 py-2 rounded-lg text-xs font-black ${formData.isPaid ? 'bg-white text-emerald-600' : 'text-white/70'}`}>PAID</button>
                                    <button onClick={() => setFormData({ ...formData, isPaid: false })} className={`flex-1 py-2 rounded-lg text-xs font-black ${!formData.isPaid ? 'bg-white text-rose-600' : 'text-white/70'}`}>CREDIT</button>
                                </div>
                            </div>

                            {/* Dynamic Party Information */}
                            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
                                <h3 className="font-bold text-slate-900 text-sm">
                                    {formData.transactionType === 'Purchase' ? "Supplier Details" : "Customer Details"}
                                </h3>

                                {formData.transactionType === 'Purchase' ? (
                                    /* DROPDOWN FOR SUPPLIERS */
                                    <select
                                        className="w-full h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-bold outline-none"
                                        value={formData.partyDetails?.name}
                                        onChange={(e) => setFormData({ ...formData, partyDetails: { ...formData.partyDetails, name: e.target.value } })}
                                    >
                                        <option value="">Select Supplier</option>
                                        <option value="Supplier A">Supplier A</option>
                                        <option value="Supplier B">Supplier B</option>
                                        {/* Map your suppliers from API here */}
                                    </select>
                                ) : (
                                    /* MANUAL ENTRY FOR SALE */
                                    <div className="space-y-3">
                                        <Input
                                            placeholder="Customer Name"
                                            value={formData.partyDetails?.name}
                                            onChange={(e) => setFormData({ ...formData, partyDetails: { ...formData.partyDetails, name: e.target.value } })}
                                            className="h-10 text-xs font-bold"
                                        />
                                        <Input
                                            placeholder="Phone (Optional)"
                                            value={formData.partyDetails?.phone}
                                            onChange={(e) => setFormData({ ...formData, partyDetails: { ...formData.partyDetails, phone: e.target.value } })}
                                            className="h-10 text-xs font-bold"
                                        />
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    {/* Internal Note (Always Visible) */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-6">
                        <h3 className="font-bold text-slate-900 text-sm mb-4">Internal Note</h3>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            placeholder="Reason for movement (e.g., 'Broken during transit')"
                            className="w-full h-24 bg-slate-50 rounded-xl p-3 text-xs font-bold outline-none resize-none"
                        />
                    </div>
                </aside>
            </div>
        </div>
    );
}