import { useState, useEffect, useMemo } from "react";
import { Plus, Package } from "lucide-react";
import Select from "react-select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Item } from "@/types/Transaction";
import type { SellingUnit } from "@/types/Product";
import { useProducts } from "@/features/products/hooks/useProducts";

interface ProductItemModalProps {
    isStockIn: boolean;
    onAdd: (item: Item) => void;
}

export default function ProductItemModal({ isStockIn, onAdd }: ProductItemModalProps) {
    const [open, setOpen] = useState(false);
    const { products, fetchProducts, isLoading: productsLoading } = useProducts();

    const initialItem: Partial<Item> = {
        productName: "", productId: "", unitId: "", unitName: "",
        multiplier: 1, pricePerBase: 0, qty: 1, rate: 0, total: 0,
    };

    const [tempItem, setTempItem] = useState<Partial<Item>>(initialItem);

    const selectedProduct = products.find(p => p._id === tempItem.productId);

    useEffect(() => {
        if (open && products.length === 0) fetchProducts();
        if (!open) setTempItem(initialItem);
    }, [open]);

    // Build unit options from sellingUnits — works for any number of units
    const unitOptions = useMemo(() => {
        if (!selectedProduct) return [];

        const bulkPrice = isStockIn ? selectedProduct.basePrice : selectedProduct.sellingPrice;
        // price per 1 base unit (KG) — this is the anchor for all rate calculations
        const pricePerBase = bulkPrice / selectedProduct.unit.multiplierToBase;

        return selectedProduct.sellingUnits.map((pu: SellingUnit) => ({
            key: pu._id,
            label: `${pu.unitId.name} (${pu.unitId.shortForm})`,
            unitId: pu.unitId._id,
            unitName: pu.unitId.name,
            multiplier: pu.multiplier,             // e.g. 25 for Sack, 1 for KG
            rate: pricePerBase * pu.multiplier,    // e.g. 96*25=2400 for Sack, 96*1=96 for KG
            pricePerBase,
        }));
    }, [selectedProduct, isStockIn]);

    const handleProductChange = (selectedOption: any) => {
        if (!selectedOption) return;
        const product = selectedOption.productData;

        const bulkPrice = isStockIn ? product.basePrice : product.sellingPrice;
        const pricePerBase = bulkPrice / product.unit.multiplierToBase;

        // Default to isDefault unit, fall back to first
        const defaultPU: SellingUnit =
            product.sellingUnits.find((pu: SellingUnit) => pu.isDefault) ??
            product.sellingUnits[0];

        if (!defaultPU) return;

        const rate = pricePerBase * defaultPU.multiplier;

        setTempItem({
            productName: product.name,
            productId: product._id,
            unitId: defaultPU.unitId._id,
            unitName: defaultPU.unitId.name,
            multiplier: defaultPU.multiplier,
            pricePerBase,
            qty: 1,
            rate,
            total: rate,
        });
    };

    const handleUnitSelect = (opt: typeof unitOptions[0]) => {
        setTempItem(prev => ({
            ...prev,
            unitId: opt.unitId,
            unitName: opt.unitName,
            multiplier: opt.multiplier,
            pricePerBase: opt.pricePerBase,
            rate: opt.rate,
            total: (prev.qty || 1) * opt.rate,
        }));
    };

    const handleQtyRateChange = (field: "qty" | "rate", value: number) => {
        setTempItem(prev => {
            const updated = { ...prev, [field]: value };
            updated.total = (updated.qty || 0) * (updated.rate || 0);
            return updated;
        });
    };

    // Stock impact in base units (KG): qty × multiplier
    // 2 Sacks × 25 = 50 KG,  10 KG × 1 = 10 KG
    const stockImpact = (tempItem.qty || 0) * (tempItem.multiplier || 1);
    const isInvalidStock = !isStockIn && !!tempItem.productId && stockImpact > (selectedProduct?.quantity || 0);

    const productOptions = products
        .filter(p => p.quantity > 0 || isStockIn)
        .map(p => ({
            value: p._id,
            label: `${p.name} (Stock: ${p.quantity} ${p.baseUnit?.shortForm || p.unit.shortForm})`,
            productData: p,
        }));

    const labelStyle = "text-sm font-bold text-slate-700 mb-1.5 block";

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button type="button" variant="outline"
                    className="h-11 border-2 border-dashed border-blue-200 text-blue-600 rounded-xl px-6 font-bold">
                    <Plus size={18} className="mr-2" /> Select Product
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-md rounded-2xl p-0 overflow-hidden shadow-2xl bg-white">
                <div className="px-8 pt-8 pb-4">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-3 text-slate-900 text-xl font-black">
                            <div className="bg-blue-50 p-2 rounded-lg">
                                <Package className="w-5 h-5 text-blue-600" />
                            </div>
                            Add Item to Table
                        </DialogTitle>
                    </DialogHeader>
                </div>

                <div className="px-8 pb-8 space-y-5">
                    {/* Product search */}
                    <div>
                        <label className={labelStyle}>Search Product</label>
                        <Select
                            isLoading={productsLoading}
                            options={productOptions}
                            isSearchable
                            placeholder="Select product..."
                            onChange={handleProductChange}
                            styles={{ control: (base) => ({ ...base, borderRadius: '12px', backgroundColor: '#f8fafc' }) }}
                        />
                    </div>

                    {/* Dynamic unit selector */}
                    {unitOptions.length > 1 && (
                        <div>
                            <label className={labelStyle}>Selling Unit</label>
                            <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
                                {unitOptions.map(opt => (
                                    <Button
                                        key={opt.key}
                                        type="button"
                                        variant={tempItem.unitId === opt.unitId ? "default" : "ghost"}
                                        className={`flex-1 rounded-lg text-xs font-bold h-9 transition-all ${tempItem.unitId === opt.unitId
                                            ? "bg-slate-900 text-white shadow-sm"
                                            : "text-slate-500"
                                            }`}
                                        onClick={() => handleUnitSelect(opt)}
                                    >
                                        {opt.label}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Qty & Rate */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelStyle}>Quantity</label>
                            <div className="relative">
                                <Input type="number" step="0.1" value={tempItem.qty} className="pr-14 font-bold rounded-xl h-12 bg-slate-50"
                                    onChange={e => handleQtyRateChange("qty", Number(e.target.value))} />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400 uppercase">
                                    {tempItem.unitName}
                                </span>
                            </div>
                        </div>
                        <div>
                            <label className={labelStyle}>Unit Rate</label>
                            <div className="relative">
                                <Input type="number" value={tempItem.rate} className="pl-7 font-bold rounded-xl h-12 bg-slate-50"
                                    onChange={e => handleQtyRateChange("rate", Number(e.target.value))} />
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">₹</span>
                            </div>
                        </div>
                    </div>

                    {/* Total + stock impact */}
                    <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 flex justify-between items-center">
                        <div>
                            <p className="text-[10px] font-black uppercase text-emerald-600 mb-1">Total Amount</p>
                            <p className="text-2xl font-black text-emerald-700">
                                ₹{Number(tempItem.total || 0).toFixed(2)}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-black uppercase text-emerald-600 mb-1">Stock Impact</p>
                            <p className="text-sm font-bold text-emerald-700">{stockImpact} KG</p>
                        </div>
                    </div>

                    {isInvalidStock && (
                        <p className="text-xs font-bold text-rose-500 text-center">
                            Only {selectedProduct?.quantity} KG available — this order needs {stockImpact} KG
                        </p>
                    )}

                    <Button
                        type="button"
                        disabled={!tempItem.productId || !tempItem.qty || !!isInvalidStock}
                        onClick={() => {
                            const itemWithBase = {
                                ...tempItem,
                                baseQuantity: (tempItem.qty || 0) * (tempItem.multiplier || 1),
                            };
                            onAdd(itemWithBase as Item);
                            setOpen(false);
                        }}
                        className="w-full bg-blue-600 hover:bg-blue-700 h-14 rounded-2xl text-white font-black shadow-xl"
                    >
                        {isInvalidStock ? "Insufficient Stock" : "Add Item"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}