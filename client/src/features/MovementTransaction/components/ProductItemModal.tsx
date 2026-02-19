import { useState, useEffect } from "react";
import { Plus, Package, Loader2, Search, Hash, IndianRupee, Tag } from "lucide-react";
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

    useEffect(() => {
        if (open && products.length === 0) {
            fetchProducts();
        }
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

    // UI Styles matching GroceryPro
    const sectionHeader = "flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-blue-600 mb-3 mt-2";

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button type="button" variant="outline" className="border-2 border-dashed h-11 border-blue-100 text-blue-600 hover:bg-blue-50 hover:border-blue-200 rounded-xl px-6 font-bold transition-all">
                    <Plus size={18} className="mr-2" /> Select Product
                </Button>
            </DialogTrigger>
            
            <DialogContent className="sm:max-w-112.5 rounded-[2rem] p-0 overflow-hidden border-none shadow-2xl">
                <div className="bg-blue-600 p-6 text-white">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-3 text-white">
                            <div className="bg-white/20 p-2 rounded-lg">
                                <Package className="w-5 h-5 text-white" />
                            </div>
                            <span className="font-black tracking-tight">Add Product to List</span>
                        </DialogTitle>
                    </DialogHeader>
                </div>

                <div className="p-8 space-y-6 bg-white">
                    {/* STEP 1: SELECT */}
                    <div>
                        <div className={sectionHeader}><Search size={14} /> 1. Search Item</div>
                        <Select
                            className="text-sm font-bold"
                            isLoading={productsLoading}
                            options={productOptions}
                            isSearchable
                            placeholder="Search by name..."
                            onChange={handleProductChange}
                            styles={{
                                control: (base, state) => ({
                                    ...base,
                                    borderRadius: '12px',
                                    padding: '6px',
                                    border: '2px solid',
                                    borderColor: state.isFocused ? '#2563eb' : '#f1f5f9',
                                    backgroundColor: '#f8fafc',
                                    boxShadow: 'none',
                                    '&:hover': { borderColor: '#cbd5e1' }
                                }),
                                placeholder: (base) => ({ ...base, color: '#94a3b8' })
                            }}
                        />
                    </div>

                    {/* STEP 2: QUANTITY & UNIT */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <div className={sectionHeader}><Hash size={14} /> 2. Quantity</div>
                            <div className="relative">
                                <Input 
                                    type="number" 
                                    className="font-black rounded-xl h-12 bg-slate-50 border-2 border-slate-50 focus:bg-white focus:border-blue-500 transition-all pl-4" 
                                    value={tempItem.qty} 
                                    onChange={(e) => handleQtyRateChange("qty", Number(e.target.value))} 
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400 uppercase">
                                    {tempItem.unitName || "PCS"}
                                </span>
                            </div>
                        </div>
                        <div>
                            <div className={sectionHeader}><IndianRupee size={14} /> 3. Rate</div>
                            <Input 
                                type="number" 
                                className="font-black rounded-xl h-12 bg-slate-50 border-2 border-slate-50 focus:bg-white focus:border-blue-500 transition-all text-emerald-600" 
                                value={tempItem.rate} 
                                onChange={(e) => handleQtyRateChange("rate", Number(e.target.value))} 
                            />
                        </div>
                    </div>

                    {/* SUB-TOTAL DISPLAY */}
                    <div className="bg-slate-900 rounded-2xl p-5 flex justify-between items-center group overflow-hidden relative">
                        <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform">
                            <Tag size={80} className="text-white" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Calculated Sub-total</p>
                            <p className="text-2xl font-black text-white">₹{(tempItem.total || 0).toLocaleString()}</p>
                        </div>
                        <div className="h-10 w-px bg-slate-800 mx-2"></div>
                        <div className="text-right">
                            <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest text-right">Unit</p>
                            <p className="text-sm font-bold text-blue-400 uppercase">{tempItem.unitName || "---"}</p>
                        </div>
                    </div>

                    {/* ACTION BUTTON */}
                    <Button 
                        type="button" 
                        disabled={!tempItem.productId || !tempItem.qty || productsLoading}
                        onClick={() => { onAdd(tempItem as Item); setOpen(false); }} 
                        className="w-full bg-blue-600 hover:bg-blue-700 h-14 rounded-2xl text-white font-black text-md shadow-xl shadow-blue-100 transition-all active:scale-95 flex gap-2"
                    >
                        {productsLoading ? <Loader2 className="animate-spin" /> : (
                            <>Confirm & Add Item <Plus size={20} /></>
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}