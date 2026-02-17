import { useEffect, useState, useMemo } from "react";
import { Plus, ArrowLeft, Trash2, Package, Loader2 } from "lucide-react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useForm, useFieldArray, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// Types & Hooks
import { notify } from "@/lib/toast";
import { useTransactions } from "@/features/transactions/hooks/useTransactions";
import { transactionSchema, type TransactionFormData, type Item } from "@/types/Transaction";
import { useProducts } from "@/features/products/hooks/useProducts";

export default function StockMovementForm() {
    const [searchParams] = useSearchParams();
    const mode = searchParams.get('mode') || 'in';
    const isStockIn = mode === "in";
    const navigate = useNavigate();
    const [showProductModal, setShowProductModal] = useState(false);

    // 1. Setup React Hook Form
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

    // 2. Setup Field Array for Items
    const { fields, append, remove } = useFieldArray({
        control,
        name: "items"
    });

    const { fetchProducts, products } = useProducts();
    const { createStockTransaction, isLoading } = useTransactions();

    // 3. Temporary state for the Modal only
    const [tempItem, setTempItem] = useState<Partial<Item>>({
        productId: "", unitId: "", qty: 1, rate: 0
    });

    useEffect(() => { fetchProducts(); }, []);

    // 4. Watch items to calculate Grand Total automatically
    const watchedItems = watch("items");
    const grandTotal = useMemo(() => {
        const total = watchedItems.reduce((sum, item) => sum + (item.total || 0), 0);
        setValue("grandTotal", total);
        return total;
    }, [watchedItems, setValue]);

    const handleAddItem = () => {
        if (!tempItem.productId || !tempItem.qty || tempItem.qty <= 0 || !tempItem.unitId) {
            return notify.error("Please fill all item fields correctly");
        }

        append({
            productId: tempItem.productId as string,
            unitId: tempItem.unitId as string,
            qty: tempItem.qty as number,
            rate: tempItem.rate || 0,
            total: (tempItem.qty || 0) * (tempItem.rate || 0)
        });

        setShowProductModal(false);
        setTempItem({ productId: "", qty: 1, rate: 0, unitId: "" });
    };

    const onFormSubmit = async (data: TransactionFormData) => {
        const success = await createStockTransaction(data);
        if (success) navigate("/inventory/transactions");
    };

    return (
        <form onSubmit={handleSubmit(onFormSubmit)} className="max-w-6xl mx-auto space-y-6 pb-20">
            {/* Header */}
            <div className="flex items-center justify-between border-b pb-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" type="button" onClick={() => navigate(-1)}>
                        <ArrowLeft size={20} />
                    </Button>
                    <div>
                        <h1 className="text-xl font-black">{isStockIn ? "Inventory Entry" : "Inventory Release"}</h1>
                        <p className="text-xs font-bold text-slate-400 uppercase">Mode: {watch("transactionType")}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
                        <div className="p-6 space-y-6">
                            {/* Transaction Type Select */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Type</label>
                                <select
                                    {...register("transactionType")}
                                    className="w-full rounded-xl border bg-slate-50 px-4 py-3 text-sm font-bold outline-none"
                                >
                                    {isStockIn ? (
                                        <>
                                            <option value="Purchase">Purchase</option>
                                            <option value="Return">Sales Return</option>
                                            <option value="Fixed">Adjustment (+)</option>
                                        </>
                                    ) : (
                                        <>
                                            <option value="Sale">Sale</option>
                                            <option value="Damage">Damage</option>
                                            <option value="Fixed">Adjustment (-)</option>
                                        </>
                                    )}
                                </select>
                            </div>

                            {/* Items Table */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <h3 className="font-black text-sm flex items-center gap-2"><Package size={16} /> Items</h3>

                                    <Dialog open={showProductModal} onOpenChange={setShowProductModal}>
                                        <DialogTrigger asChild>
                                            <Button type="button" variant="outline" className="border-dashed h-9">
                                                <Plus size={16} className="mr-1" /> Add Product
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader><DialogTitle>Add Item</DialogTitle></DialogHeader>
                                            <div className="space-y-4 py-4">
                                                <select
                                                    className="w-full h-11 rounded-xl border bg-slate-50 px-3"
                                                    value={tempItem.productId}
                                                    onChange={(e) => {
                                                        const p = products.find(x => x._id === e.target.value);
                                                        setTempItem({
                                                            ...tempItem,
                                                            productId: e.target.value,
                                                            unitId: p?.unit?._id || "",
                                                            rate: isStockIn ? p?.basePrice : p?.sellingPrice
                                                        });
                                                    }}
                                                >
                                                    <option value="">Select Product</option>
                                                    {products.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                                                </select>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <Input type="number" placeholder="Qty" value={tempItem.qty} onChange={e => setTempItem({ ...tempItem, qty: Number(e.target.value) })} />
                                                    <Input placeholder="Unit" value={tempItem.unitId} readOnly className="bg-slate-100" />
                                                </div>
                                                <Input type="number" placeholder="Rate" value={tempItem.rate} onChange={e => setTempItem({ ...tempItem, rate: Number(e.target.value) })} />
                                                <Button type="button" onClick={handleAddItem} className="w-full bg-blue-600 text-white">Add to List</Button>
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                </div>

                                <div className="border rounded-2xl overflow-hidden shadow-sm">
                                    <table className="w-full text-left">
                                        <thead className="bg-slate-50 text-[10px] font-black uppercase">
                                            <tr>
                                                <th className="px-6 py-4">Item</th>
                                                <th className="px-6 py-4">Qty</th>
                                                <th className="px-6 py-4">Total</th>
                                                <th className="px-6 py-4 text-right">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {fields.map((field, index) => (
                                                <tr key={field.id} className="text-sm font-semibold">
                                                    <td className="px-6 py-4">
                                                        {products.find(p => p._id === field.productId)?.name || "Unknown"}
                                                    </td>
                                                    <td className="px-6 py-4">{field.qty} {field.unitId}</td>
                                                    <td className="px-6 py-4 text-blue-600 font-black">₹{field.total.toLocaleString()}</td>
                                                    <td className="px-6 py-4 text-right">
                                                        <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="text-rose-500">
                                                            <Trash2 size={16} />
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* Summary Footer */}
                        <div className="flex items-center justify-between bg-slate-800 px-8 py-5 text-white">
                            <div>
                                <p className="text-[10px] font-black uppercase text-slate-400">Grand Total</p>
                                <p className="text-2xl font-black">₹{grandTotal.toLocaleString()}</p>
                            </div>
                            <Button type="submit" disabled={isLoading || fields.length === 0} className="bg-blue-600 px-8">
                                {isLoading ? <Loader2 className="animate-spin mr-2" /> : "Process Transaction"}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <aside className="space-y-6">
                    <div className="bg-white border rounded-2xl p-6 shadow-sm space-y-4">
                        <h3 className="font-black text-xs uppercase">Settlement</h3>
                        <div className="flex bg-slate-100 p-1 rounded-xl">
                            <button type="button" onClick={() => setValue("isPaid", true)} className={`flex-1 py-2 rounded-lg text-xs font-black ${watch("isPaid") ? 'bg-white text-emerald-600' : 'text-slate-400'}`}>PAID</button>
                            <button type="button" onClick={() => setValue("isPaid", false)} className={`flex-1 py-2 rounded-lg text-xs font-black ${!watch("isPaid") ? 'bg-white text-rose-600' : 'text-slate-400'}`}>CREDIT</button>
                        </div>
                        <Input {...register("partyDetails.name")} placeholder="Party Name" className="text-xs font-bold" />
                        <Input {...register("partyDetails.phone")} placeholder="Phone Number" className="text-xs font-bold" />
                        <textarea {...register("notes")} placeholder="Notes..." className="w-full h-24 bg-slate-50 border rounded-xl p-3 text-xs font-bold outline-none" />
                    </div>
                </aside>
            </div>
        </form>
    );
}