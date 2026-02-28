import React, { useMemo, useState } from 'react';
import { Search, X, Check, Package, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from "@/lib/utils";
import type { ProductData } from '@/types/Product';

interface AssignProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    Products: ProductData[];
    onAssign: (productIds: string[]) => Promise<void>;
}

export const AssignProductModal: React.FC<AssignProductModalProps> = ({
    isOpen, onClose, Products, onAssign
}) => {
    const [search, setSearch] = useState("");
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const toggleProduct = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const availableProducts = useMemo(() => {
        return Products.filter(p =>
            !p.supplier &&
            p.name.toLowerCase().includes(search.toLowerCase())
        );
    }, [Products, search]);

    const handleConfirm = async () => {
        setIsSubmitting(true);
        await onAssign(selectedIds);
        setIsSubmitting(false);
        setSelectedIds([]);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[80vh]">

                {/* Modal Header */}
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div>
                        <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Assign Inventory</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Select products to link to this partner</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                        <X size={20} className="text-slate-400" />
                    </button>
                </div>

                {/* Search Bar */}
                <div className="p-4 border-b border-slate-50">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search by SKU or Name..."
                            className="w-full bg-slate-100 border-none rounded-xl py-2.5 pl-10 pr-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                {/* Product List */}
                <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
                    {availableProducts.length > 0 ? (
                        availableProducts.map((product) => (
                            <div
                                key={product._id}
                                onClick={() => toggleProduct(product._id)}
                                className={cn(
                                    "flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-all border-2 mb-1",
                                    selectedIds.includes(product._id)
                                        ? "bg-indigo-50 border-indigo-200"
                                        : "bg-white border-transparent hover:bg-slate-50 hover:border-slate-100"
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={cn(
                                        "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                                        selectedIds.includes(product._id) ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-400"
                                    )}>
                                        <Package size={18} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-black text-slate-700 uppercase leading-none">{product.name}</p>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mt-1">Rate: ₹{product.basePrice}</p>
                                    </div>
                                </div>
                                {selectedIds.includes(product._id) && (
                                    <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-white">
                                        <Check size={14} strokeWidth={4} />
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="py-10 text-center text-slate-300">
                            <AlertCircle size={32} className="mx-auto mb-2 opacity-20" />
                            <p className="text-[10px] font-black uppercase tracking-widest">No available products</p>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex gap-3">
                    <Button variant="outline" onClick={onClose} className="flex-1 rounded-xl font-black uppercase text-[10px] tracking-widest">
                        Cancel
                    </Button>
                    <Button
                        disabled={selectedIds.length === 0 || isSubmitting}
                        onClick={handleConfirm}
                        className="flex-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-indigo-100"
                    >
                        {isSubmitting ? "Linking..." : `Link ${selectedIds.length} Selected`}
                    </Button>
                </div>
            </div>
        </div>
    );
};