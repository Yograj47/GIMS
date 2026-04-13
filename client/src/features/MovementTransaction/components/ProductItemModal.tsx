import { useState, useEffect } from "react";
import { Plus, Package, Loader2, Tag } from "lucide-react";
import Select from "react-select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Item } from "@/types/Transaction";
import { useProducts } from "@/features/products/hooks/useProducts";

interface ProductItemModalProps {
    isStockIn: boolean;
    onAdd: (item: Item) => void;
}

export default function ProductItemModal({ isStockIn, onAdd }: ProductItemModalProps) {
    const [open, setOpen] = useState(false);
    const { products, fetchProducts, isLoading: productsLoading } = useProducts();

    const initialItem: Partial<Item> = {
        productName: "", productId: "", unitId: "", unitName: "", multiplier: 1, qty: 1, rate: 0, total: 0
    };

    const [tempItem, setTempItem] = useState<Partial<Item>>(initialItem);
    const selectedProduct = products.find(p => p._id === tempItem.productId);
    const availableStock = selectedProduct?.quantity || 0;

    useEffect(() => {
        if (open && products.length === 0) fetchProducts();
        if (!open) setTempItem(initialItem);
    }, [open]);

    const filterProduct = products.filter(p => p.quantity > 0 || isStockIn);

    const productOptions = filterProduct.map(p => ({
        value: p._id,
        label: `${p.name} (Available: ${p.quantity})`,
        productData: p
    }));


    const handleProductChange = (selectedOption: any) => {
        if (!selectedOption) return;
        const product = selectedOption.productData;
        const rate = isStockIn ? product.basePrice : product.sellingPrice;

        setTempItem({
            ...tempItem,
            productName: product.name,
            productId: product._id,
            unitId: product.unit?._id || "",
            unitName: product.unit?.name || "Unit",
            multiplier: product.unit?.multiplierToBase || 1,
            rate,
            total: (tempItem.qty || 1) * rate
        });
    };

    const handleQtyRateChange = (field: "qty" | "rate", value: number) => {
        const updatedItem = { ...tempItem, [field]: value };
        updatedItem.total = (updatedItem.qty || 0) * (updatedItem.rate || 0);
        setTempItem(updatedItem);
    };

    const isInvalidStock = !isStockIn && tempItem.productId && (tempItem.qty || 0) > availableStock;

    const labelStyle = "text-sm font-bold text-slate-700 mb-1.5 block";

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    type="button"
                    variant="outline"
                    className="h-11 border-2 border-dashed border-blue-200 text-blue-600 rounded-xl px-6 font-bold transition-all"
                >
                    <Plus size={18} className="mr-2" /> Select Product
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-md rounded-2xl p-0 overflow-hidden border-none shadow-2xl bg-white">
                {/* --- STANDARD HEADER --- */}
                <div className="px-8 pt-8 pb-4">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-3 text-slate-900 text-xl font-black tracking-tight">
                            <div className="bg-blue-50 p-2 rounded-lg">
                                <Package className="w-5 h-5 text-blue-600" />
                            </div>
                            Add Item to Table
                        </DialogTitle>
                    </DialogHeader>
                </div>

                <div className="px-8 pb-8 space-y-6">
                    {/* PRODUCT SEARCH */}
                    <div>
                        <label className={labelStyle}>Search Product</label>
                        <Select
                            className="text-sm font-medium"
                            isLoading={productsLoading}
                            options={productOptions}
                            isSearchable
                            placeholder="Search by name or SKU..."
                            onChange={handleProductChange}
                            styles={{
                                control: (base, state) => ({
                                    ...base,
                                    borderRadius: '12px',
                                    padding: '4px',
                                    border: '1px solid',
                                    borderColor: state.isFocused ? '#2563eb' : '#e2e8f0',
                                    backgroundColor: '#f8fafc',
                                    boxShadow: 'none',
                                    '&:hover': { borderColor: '#cbd5e1' }
                                })
                            }}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* QUANTITY */}
                        <div>
                            <label className={labelStyle}>Quantity</label>
                            <div className="relative">
                                <Input
                                    type="number"
                                    min="1"
                                    className="font-bold rounded-xl h-12 bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-500 transition-all pl-4 pr-12"
                                    value={tempItem.qty}
                                    onChange={(e) => handleQtyRateChange("qty", Math.max(0, Number(e.target.value)))}
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400 uppercase">
                                    {tempItem.unitName || "PCS"}
                                </span>
                            </div>
                        </div>

                        {/* RATE */}
                        <div>
                            <label className={labelStyle}>Unit Rate</label>
                            <div className="relative">
                                <Input
                                    type="number"
                                    className="font-bold rounded-xl h-12 bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-500 transition-all pl-8"
                                    value={tempItem.rate}
                                    onChange={(e) => handleQtyRateChange("rate", Number(e.target.value))}
                                />
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">₹</span>
                            </div>
                        </div>
                    </div>

                    {/* --- TOTAL DISPLAY--- */}
                    <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 flex justify-between items-center group relative overflow-hidden">
                        <div className="absolute -right-2 -bottom-2 opacity-10 group-hover:scale-110 transition-transform">
                            <Tag size={60} className="text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase text-emerald-600 tracking-wider mb-1">Total Amount</p>
                            <p className="text-2xl font-black text-emerald-700">₹{(tempItem.total || 0).toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-black uppercase text-emerald-600 tracking-wider mb-1">Unit</p>
                            <p className="text-sm font-bold text-emerald-700 uppercase">{tempItem.unitName || "---"}</p>
                        </div>
                    </div>

                    {/* ACTION BUTTON */}
                    <Button
                        type="button"
                        disabled={!tempItem.productId || !tempItem.qty || productsLoading === true || isInvalidStock === true}
                        onClick={() => { onAdd(tempItem as Item); setOpen(false); }}
                   className="w-full bg-blue-600 hover:bg-blue-700 h-14 rounded-2xl text-white font-black text-base shadow-xl shadow-blue-100 transition-all active:scale-95 flex gap-2" >
                        {productsLoading ? (
                            <Loader2 className="animate-spin" />
                        ) : isInvalidStock ? (
                            "Insufficient Stock"
                        ) : (
                            <>Add Item <Plus size={18} /></>
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}