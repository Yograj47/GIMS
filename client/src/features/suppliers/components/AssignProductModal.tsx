import React, { useMemo, useState, useEffect } from 'react';
import { Search, X, Check, Package, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from "@/lib/utils";
import type { ProductData } from '@/types/Product';

interface AssignProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    Products: ProductData[];
    onAssign: (productIds: string[]) => Promise<void>;
    excludeIds: string[];
}

export const AssignProductModal: React.FC<AssignProductModalProps> = ({
    isOpen, onClose, Products, onAssign, excludeIds
}) => {
    const [search, setSearch] = useState("");
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => { if (!isOpen) { setSelectedIds([]); setSearch(""); } }, [isOpen]);

    const toggleProduct = (id: string) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const availableProducts = useMemo(() => {
        return Products.filter(p => !excludeIds.includes(p._id) && p.name.toLowerCase().includes(search.toLowerCase()));
    }, [Products, search, excludeIds]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-[2px] animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-md rounded-xl border border-slate-200 shadow-2xl flex flex-col max-h-[70vh] overflow-hidden">
                
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-[0.2em]">Link Inventory</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors"><X size={16} /></button>
                </div>

                {/* Search */}
                <div className="p-4 bg-slate-50/50 border-b border-slate-100">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                        <input
                            type="text"
                            placeholder="Filter items..."
                            className="w-full bg-white border border-slate-200 rounded-lg py-2 pl-9 pr-4 text-xs font-bold outline-none focus:border-indigo-500 transition-colors"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto p-2">
                    {availableProducts.length > 0 ? (
                        availableProducts.map((product) => (
                            <div
                                key={product._id}
                                onClick={() => toggleProduct(product._id)}
                                className={cn(
                                    "flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all border mb-1",
                                    selectedIds.includes(product._id)
                                        ? "bg-indigo-50 border-indigo-200 shadow-sm"
                                        : "bg-white border-transparent hover:bg-slate-50"
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={cn(
                                        "w-8 h-8 rounded-md flex items-center justify-center transition-colors",
                                        selectedIds.includes(product._id) ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-400"
                                    )}>
                                        <Package size={14} />
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-black text-slate-700 uppercase leading-none">{product.name}</p>
                                        <p className="text-[9px] font-bold text-slate-400 mt-1 font-mono">₹{product.basePrice}</p>
                                    </div>
                                </div>
                                {selectedIds.includes(product._id) && <Check size={14} className="text-indigo-600" strokeWidth={4} />}
                            </div>
                        ))
                    ) : (
                        <div className="py-12 text-center">
                            <AlertCircle size={24} className="mx-auto text-slate-200 mb-2" />
                            <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">No matching SKUs</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex gap-2">
                    <Button variant="ghost" onClick={onClose} className="flex-1 text-[10px] font-black uppercase tracking-widest h-10">Cancel</Button>
                    <Button
                        disabled={selectedIds.length === 0 || isSubmitting}
                        onClick={async () => { setIsSubmitting(true); await onAssign(selectedIds); setIsSubmitting(false); onClose(); }}
                        className="flex-2 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black uppercase tracking-widest h-10 shadow-none rounded-lg"
                    >
                        {isSubmitting ? "Processing..." : `Link ${selectedIds.length} Items`}
                    </Button>
                </div>
            </div>
        </div>
    );
};