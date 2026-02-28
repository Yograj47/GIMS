import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Pencil, ArrowLeft, Phone, Mail, MapPin,
    Package, SearchX, Trash2, Plus, ShieldCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Loading } from '@/lib/loader';
import { useSuppliers } from '../hooks/useSuppliers';
import { cn } from "@/lib/utils";
import { AssignProductModal } from '../components/AssignProductModal';
import { useProducts } from '@/features/products/hooks/useProducts';

/**
 * @desc Complete Supplier View with Fixed Layout & Ledger Theme
 */
export default function SupplierView() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const { singleSupplier, productData, fetchSupplierById, removeSupplier, isLoading, removeProductFromSupplier, assignProducts } = useSuppliers();

    const { products, fetchProducts } = useProducts();
    const [isAssigning, setIsAssigning] = useState(false);

    useEffect(() => {
        if (id) fetchSupplierById(id);
        fetchProducts(undefined, undefined, undefined, undefined, true);
    }, [id, fetchSupplierById, fetchProducts]);

    const handleSupplierDeletion = async (supplierId: string) => {
        if (window.confirm("Are you sure? This will terminate the partner record permanently.")) {
            const success = await removeSupplier(supplierId);
            if (success) navigate('/suppliers');
        }
    };

    const handleAssignProducts = async (productIds: string[]) => {
        if (!id) return;
        const success = await assignProducts(id, productIds);
        if (success) {
            setIsAssigning(false);
        }
    };

    const handleUnassignProduct = async (productId: string) => {
        if (!id) return;
        if (window.confirm("Remove this product from the supplier's catalog?")) {
            await removeProductFromSupplier(id, productId);
        }
    };

    if (isLoading) return <Loading fullPage />;

    if (!singleSupplier) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center text-center animate-in fade-in duration-300">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-200 mb-4 border border-slate-100">
                    <SearchX size={32} />
                </div>
                <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">Record Not Found</h2>
                <Button onClick={() => navigate('/suppliers')} variant="link" className="text-indigo-600 font-bold text-xs uppercase mt-2">
                    <ArrowLeft className="mr-2" size={14} strokeWidth={3} /> Return to Directory
                </Button>
            </div>
        );
    }

    const { name, phone, email, address, notes } = singleSupplier;

    return (
        <div className="max-w-400 mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-10">

            {/* --- TOP NAVIGATION BAR --- */}
            <div className="flex items-center justify-between px-1">
                <button
                    onClick={() => navigate('/suppliers')}
                    className="flex items-center gap-3 text-slate-400 hover:text-indigo-600 transition-all group"
                >
                    <div className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center group-hover:border-indigo-100 group-hover:bg-indigo-50 transition-all">
                        <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" strokeWidth={3} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Exit</span>
                </button>

                <div className='flex gap-2'>
                    <Button
                        variant="outline"
                        onClick={() => handleSupplierDeletion(id!)}
                        className="border-slate-200 text-rose-500 hover:bg-rose-50 hover:border-rose-100 rounded-xl font-black text-[10px] uppercase tracking-widest px-4 h-10"
                    >
                        <Trash2 size={14} className="mr-2" /> Delete
                    </Button>
                    <Button
                        onClick={() => navigate(`/suppliers/edit/${id}`)}
                        className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-black text-[10px] uppercase tracking-widest px-5 h-10 shadow-lg shadow-slate-200"
                    >
                        <Pencil size={14} className="mr-2" /> Edit Partner
                    </Button>
                </div>
            </div>

            {/* --- MAIN CONTENT GRID --- */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                {/* SIDEBAR: Profile Card (Sticky to prevent scroll bypass) */}
                <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-6">
                    <div className="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm relative overflow-hidden">
                        <div className="absolute -top-2.5 -right-2.5 opacity-5">
                            <ShieldCheck size={120} />
                        </div>

                        <div className="flex flex-col items-center text-center pb-6 border-b border-slate-50 relative z-10">
                            <div className="w-20 h-20 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-3xl font-black mb-4 shadow-xl border-4 border-white">
                                {name?.charAt(0)}
                            </div>
                            <h1 className="text-xl font-black text-slate-800 uppercase tracking-tighter leading-tight">{name}</h1>
                            <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full mt-2">
                                Verified Partner
                            </span>
                        </div>

                        <div className="py-4 space-y-1">
                            <ContactItem icon={<Phone size={14} />} label="Direct Line" value={phone} isMono />
                            <ContactItem icon={<Mail size={14} />} label="Email Address" value={email} />
                            <ContactItem icon={<MapPin size={14} />} label="HQ Location" value={address} />
                        </div>

                        {notes && (
                            <div className="mt-4 pt-4 border-t border-slate-50">
                                <p className="text-[9px] font-black text-slate-300 uppercase mb-2 tracking-widest">Internal Notes</p>
                                <div className="bg-slate-50/50 p-4 rounded-xl text-slate-500 text-xs font-bold leading-relaxed italic border border-slate-100">
                                    "{notes}"
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* MAIN: Product Catalog (Constrained height with internal scroll) */}
                <div className="lg:col-span-8">
                    <div className="bg-white border border-slate-200 rounded-[2rem] shadow-sm flex flex-col max-h-[calc(100vh-160px)] overflow-hidden">

                        {/* Catalog Header */}
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/30 shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-indigo-600 shadow-sm">
                                    <Package size={20} strokeWidth={2.5} />
                                </div>
                                <div>
                                    <h2 className="font-black text-slate-800 uppercase text-sm tracking-tight">Catalog</h2>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Linked SKU Inventory</p>
                                </div>
                            </div>

                            <Button
                                onClick={() => setIsAssigning(true)}
                                className="bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl font-black text-[10px] uppercase tracking-widest h-9 px-4 shadow-md shadow-indigo-100 transition-all active:scale-95"
                            >
                                <Plus size={14} className="mr-1" strokeWidth={4} /> Assign Product
                            </Button>
                        </div>

                        {/* Scrollable Table Content */}
                        <div className="overflow-y-auto flex-1 custom-scrollbar">
                            <table className="w-full text-left border-collapse">
                                <thead className="sticky top-0 bg-white/95 backdrop-blur-sm z-10 border-b border-slate-100">
                                    <tr>
                                        <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Product Details</th>
                                        <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Base Rate</th>
                                        <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Retail Price</th>
                                        <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {productData && productData.length > 0 ? (
                                        productData.map((product) => (
                                            <tr key={product._id} className="hover:bg-slate-50/50 transition-all group">
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col">
                                                        <span className="font-black text-slate-700 uppercase text-xs tracking-tight">{product.name}</span>
                                                        <span className="text-[9px] font-bold text-slate-400 uppercase mt-0.5 italic">Stock: {product.stock}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="text-[10px] font-black text-slate-500 bg-slate-100 px-2 py-1 rounded-md border border-slate-200 font-mono">
                                                        ₹{product.basePrice}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="font-black text-indigo-600 text-xs">₹{product.sellingPrice}</span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleUnassignProduct(product._id)}
                                                        className="h-8 w-8 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                                                    >
                                                        <Trash2 size={14} strokeWidth={2.5} />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={4} className="py-20 text-center">
                                                <Package size={32} className="mx-auto text-slate-100 mb-2" strokeWidth={1} />
                                                <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">No Products Assigned</p>
                                            </td>
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
            />
        </div>
    );
}

/**
 * --- Helper Components ---
 */
function ContactItem({ icon, label, value, isMono }: { icon: React.ReactNode, label: string, value?: string, isMono?: boolean }) {
    return (
        <div className="flex items-center gap-4 p-3 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 group">
            <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 shrink-0 shadow-sm group-hover:text-indigo-600 group-hover:border-indigo-100 transition-colors">
                {icon}
            </div>
            <div className="min-w-0">
                <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-0.5">{label}</p>
                <p className={cn(
                    "text-[13px] font-black text-slate-700 truncate leading-none",
                    isMono && "font-mono text-indigo-600 tracking-tighter"
                )}>
                    {value || '---'}
                </p>
            </div>
        </div>
    );
}