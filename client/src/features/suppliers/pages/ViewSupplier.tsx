import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Pencil, ArrowLeft, Phone, Mail, MapPin, Package, TrendingUp, SearchX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Loading } from '@/lib/loader';
import { useSuppliers } from '../hooks/useSuppliers';

export default function SupplierView() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { singleSupplier, productData, fetchSupplierById, isLoading } = useSuppliers();

    useEffect(() => {
        if (id) fetchSupplierById(id);
    }, [id, fetchSupplierById]);

    // Destructure data for cleaner JSX
    const { name, phone, email, address, notes } = singleSupplier || {};

    // --- FALLBACK UI: IF SUPPLIER NOT FOUND ---
    if (!isLoading && !singleSupplier) {
        return (
            <div className="h-[70vh] flex flex-col items-center justify-center text-center space-y-4 animate-in fade-in zoom-in duration-300">
                <div className="p-6 bg-slate-50 rounded-full text-slate-300">
                    <SearchX size={64} strokeWidth={1.5} />
                </div>
                <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Supplier Not Found</h2>
                    <p className="text-slate-500 font-medium max-w-xs mx-auto">
                        We couldn't find a vendor with ID: <span className="text-blue-600 font-bold">{id}</span>.
                    </p>
                </div>
                <Button
                    variant="outline"
                    onClick={() => navigate('/suppliers')}
                    className="rounded-xl font-bold border-slate-200"
                >
                    <ArrowLeft className="mr-2" size={18} />
                    Return to Directory
                </Button>
            </div>
        );
    }

    if (isLoading) return <Loading fullPage />;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header Controls */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => navigate('/suppliers')}
                    className="flex items-center gap-2 text-slate-400 hover:text-slate-900 font-bold transition-all group"
                >
                    <div className="p-2 bg-white border border-slate-200 rounded-lg group-hover:border-slate-300">
                        <ArrowLeft size={18} strokeWidth={3} />
                    </div>
                    <span className="text-sm uppercase tracking-widest">Back to Directory</span>
                </button>
                <Button
                    onClick={() => navigate(`/suppliers/edit/${id}`)}
                    className="bg-blue-600 hover:bg-blue-700 rounded-xl font-bold gap-2 shadow-lg shadow-blue-100"
                >
                    <Pencil size={16} strokeWidth={2.5} />
                    Edit Details
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* SIDEBAR: Profile Card */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm sticky top-6">
                        <div className="flex flex-col items-center text-center pb-6 border-b border-slate-100">
                            <div className="w-24 h-24 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center text-4xl font-black mb-4 border border-blue-100 shadow-inner">
                                {name?.charAt(0)}
                            </div>
                            <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">{name}</h1>
                            <div className="mt-2 flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Active Supplier</p>
                            </div>
                        </div>

                        <div className="py-6 space-y-5">
                            <ContactItem icon={<Phone size={18} />} label="Phone" value={phone || 'N/A'} />
                            <ContactItem icon={<Mail size={18} />} label="Email" value={email || 'No email provided'} />
                            <ContactItem icon={<MapPin size={18} />} label="Address" value={address || 'No address provided'} />
                        </div>

                        {notes && (
                            <div className="pt-5 border-t border-slate-100">
                                <p className="text-[10px] font-black text-slate-400 uppercase mb-3 tracking-widest">Vendor Notes</p>
                                <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-100 italic text-slate-600 text-sm leading-relaxed">
                                    "{notes}"
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* MAIN CONTENT: Products */}
                <div className="lg:col-span-2">
                    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden min-h-100">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-600 rounded-lg text-white">
                                    <Package size={20} />
                                </div>
                                <h2 className="font-black text-slate-900 tracking-tight text-lg">Product Catalog</h2>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Inventory Count</span>
                                <span className="text-blue-600 font-black text-xl">{productData?.length || 0}</span>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-slate-50/50">
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Product Details</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Purchase Rate</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Retail Price</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {productData && productData.length > 0 ? (
                                        productData.map((product) => (
                                            <tr key={product._id} className="hover:bg-slate-50/50 transition-colors group">
                                                <td className="px-6 py-4">
                                                    <p className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{product.name}</p>
                                                    <p className="text-[10px] font-medium text-slate-400">Stock: {product.stock} units</p>
                                                </td>
                                                <td className="px-6 py-4 font-bold text-slate-500 text-sm">₹{product.basePrice}</td>
                                                <td className="px-6 py-4 text-right">
                                                    <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg font-black text-sm border border-blue-100">
                                                        ₹{product.sellingPrice}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={3} className="py-32 text-center">
                                                <div className="flex flex-col items-center gap-3">
                                                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
                                                        <TrendingUp size={32} />
                                                    </div>
                                                    <p className="font-bold text-slate-400">No products mapped to this supplier</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ContactItem({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
    return (
        <div className="flex items-center gap-4">
            <div className="p-2.5 bg-slate-50 rounded-xl text-slate-400 border border-slate-100">
                {icon}
            </div>
            <div>
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none mb-1">{label}</p>
                <p className="text-sm font-bold text-slate-700 break-all">{value}</p>
            </div>
        </div>
    );
}