import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Pencil, ArrowLeft, Package, SearchX, Trash2, Plus, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Loading } from '@/lib/loader';
import { useSuppliers } from '../hooks/useSuppliers';
import { cn } from "@/lib/utils";
import { AssignProductModal } from '../components/AssignProductModal';
import { useProducts } from '@/features/products/hooks/useProducts';
import { DeleteConfirmDialog } from '@/lib/deleteAlert';

export default function SupplierView() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { singleSupplier, productData, fetchSupplierById, removeSupplier, isLoading, removeProductFromSupplier, assignProducts } = useSuppliers();
    const { products, fetchProducts } = useProducts();
    const [isAssigning, setIsAssigning] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);


    useEffect(() => {
        if (id) fetchSupplierById(id);
        fetchProducts(undefined, undefined, undefined, undefined, undefined, true);
    }, [id, fetchSupplierById, fetchProducts]);

    const assignedProductIds = useMemo(() => productData?.map(p => p._id) || [], [productData]);

    const handleAssignProducts = async (productIds: string[]) => {
        if (!id) return;
        const success = await assignProducts(id, productIds);
        if (success) {
            setIsAssigning(false);
            fetchSupplierById(id);
        }
    };
    

    const confirmDelete = async () => {
        if (!id) return;
        await removeSupplier(id);
        setIsDeleteDialogOpen(false);
        navigate("/suppliers");
    }

    if (isLoading) return <Loading fullPage />;
    if (!singleSupplier) return <NotFoundState onBack={() => navigate('/suppliers')} />;

    return (
        <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-500">
            {/* Header / Actions */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-300 pb-6">
                <div>
                    <button
                        onClick={() => navigate('/suppliers')}
                        className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-indigo-600 flex items-center gap-2 mb-2 transition-colors"
                    >
                        <ArrowLeft size={12} strokeWidth={3} /> Back to Directory
                    </button>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">{singleSupplier.name}</h1>
                    <p className="text-xs text-slate-500 font-medium mt-1 flex items-center gap-2">
                        <ShieldCheck size={14} className="text-emerald-500" /> Authorized Supplier Partner
                    </p>
                </div>

                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={() => navigate(`/suppliers/edit/${id}`)}
                        className="h-9 text-[10px] font-bold uppercase tracking-widest border-slate-300 hover:bg-slate-50"
                    >
                        <Pencil size={14} className="mr-2" /> Edit Record
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setIsDeleteDialogOpen(true)}
                        className="text-red-600 hover:bg-red-50 hover:text-red-500 text-[11px] font-bold uppercase gap-2 transition-colors"
                    >
                        <Trash2 size={14} className="mr-2" /> Terminate
                    </Button>

                    <DeleteConfirmDialog
                        open={isDeleteDialogOpen}
                        onOpenChange={setIsDeleteDialogOpen}
                        onConfirm={confirmDelete}
                        title="Confirm Supplier Deletion"
                        itemName={singleSupplier?.name || "Supplier"}
                        isLoading={isLoading}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Sidebar: Profile Info */}
                <div className="space-y-6">
                    <section className="bg-slate-50/50 border border-slate-300 rounded-xl p-5">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">Contact Intelligence</h3>
                        <div className="space-y-4">
                            <InfoRow label="Direct Phone" value={singleSupplier.phone} isMono />
                            <InfoRow label="Email Channel" value={singleSupplier.email} />
                            <InfoRow label="Base Location" value={singleSupplier.address} />
                        </div>
                    </section>

                    {singleSupplier.notes && (
                        <section className="border-l-2 border-indigo-500 pl-4 py-1">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Internal Brief</h3>
                            <p className="text-xs text-slate-600 leading-relaxed italic">"{singleSupplier.notes}"</p>
                        </section>
                    )}
                </div>

                {/* Main: Catalog Table */}
                <div className="lg:col-span-2">
                    <div className="border border-slate-300 rounded-xl overflow-hidden bg-white">
                        <div className="px-6 py-4 border-b border-slate-300 flex items-center justify-between bg-slate-50/30">
                            <div className="flex items-center gap-2">
                                <Package size={16} className="text-slate-400" />
                                <h2 className="text-[11px] font-black uppercase tracking-widest text-slate-800">Linked Inventory</h2>
                            </div>
                            <Button
                                onClick={() => setIsAssigning(true)}
                                className="h-8 text-[9px] font-black uppercase tracking-widest bg-indigo-600 hover:bg-indigo-700 shadow-none rounded-lg"
                            >
                                <Plus size={12} className="mr-1" strokeWidth={4} /> Assign
                            </Button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/50 border-b border-slate-300">
                                        <th className="px-6 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">SKU/Item</th>
                                        <th className="px-6 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Base Cost</th>
                                        <th className="px-6 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {products?.length ? (
                                        products.filter((p) => p.supplier?._id === id).map((product) => (
                                            <tr key={product._id} className="hover:bg-slate-50/30 transition-colors group">
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col">
                                                        <span className="text-xs font-bold text-slate-900 uppercase tracking-tight">{product.name}</span>
                                                        <span className="text-[10px] text-slate-400 font-medium">Stock: {product.quantity} units</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="text-xs font-mono font-bold text-slate-600">₹{product.basePrice}</span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button
                                                        onClick={() => removeProductFromSupplier(id!, product._id)}
                                                        className="text-slate-300 hover:text-rose-500 transition-colors"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={3} className="py-12 text-center text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em]">No products linked</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <AssignProductModal
                isOpen={isAssigning}
                onClose={() => setIsAssigning(false)}
                Products={products}
                onAssign={handleAssignProducts}
                excludeIds={assignedProductIds}
            />
        </div>
    );
}

const InfoRow = ({ label, value, isMono }: { label: string, value?: string, isMono?: boolean }) => (
    <div>
        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <p className={cn("text-xs font-bold text-slate-800", isMono && "font-mono text-indigo-600")}>{value || "N/A"}</p>
    </div>
);

const NotFoundState = ({ onBack }: { onBack: () => void }) => (
    <div className="h-[60vh] flex flex-col items-center justify-center text-center">
        <SearchX size={40} className="text-slate-200 mb-4" />
        <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">Entry Not Found</h2>
        <Button onClick={onBack} variant="link" className="text-indigo-600 text-[10px] font-bold uppercase mt-2">Return to Directory</Button>
    </div>
);