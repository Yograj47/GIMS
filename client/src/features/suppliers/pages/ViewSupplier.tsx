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

    const { name, phone, email, address, notes } = singleSupplier || {};

    if (!isLoading && !singleSupplier) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center text-center animate-in fade-in duration-300">
                <div className="p-5 bg-slate-50 rounded-full text-slate-200 mb-4">
                    <SearchX size={48} />
                </div>
                <h2 className="text-xl font-bold text-slate-800">Supplier Not Found</h2>
                <p className="text-slate-500 mb-6">Could not find record for ID: {id}</p>
                <Button onClick={() => navigate('/suppliers')} variant="outline" className="rounded-lg">
                    <ArrowLeft className="mr-2" size={16} /> Return to Directory
                </Button>
            </div>
        );
    }

    if (isLoading) return <Loading fullPage />;

    return (
        <div className="mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* Header Area */}
            <div className="flex items-center justify-between pb-2">
                <button
                    onClick={() => navigate('/suppliers')}
                    className="flex items-center gap-2 text-slate-400 hover:text-slate-600 transition-colors group"
                >
                    <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="text-xs font-bold uppercase tracking-widest">Directory</span>
                </button>
                <Button
                    onClick={() => navigate(`/suppliers/edit/${id}`)}
                    className="bg-blue-600 hover:bg-blue-700 rounded-lg font-bold shadow-md shadow-blue-100"
                >
                    <Pencil size={14} className="mr-2" /> Edit Details
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Sidebar Card */}
                <div className="lg:col-span-1">
                    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm sticky top-6">
                        <div className="flex flex-col items-center text-center pb-6 border-b border-slate-50">
                            <div className="w-20 h-20 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-3xl font-bold mb-4 shadow-lg">
                                {name?.charAt(0)}
                            </div>
                            <h1 className="text-xl font-bold text-slate-800 leading-tight">{name}</h1>
                            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mt-2 bg-emerald-50 px-2 py-0.5 rounded">Active Partner</p>
                        </div>

                        <div className="py-6 space-y-4">
                            <ContactItem icon={<Phone size={16} />} label="Phone" value={phone || 'N/A'} />
                            <ContactItem icon={<Mail size={16} />} label="Email" value={email || 'No email'} />
                            <ContactItem icon={<MapPin size={16} />} label="Address" value={address || 'No address'} />
                        </div>

                        {notes && (
                            <div className="pt-4 border-t border-slate-50">
                                <p className="text-[10px] font-bold text-slate-400 uppercase mb-2 tracking-widest">Internal Notes</p>
                                <div className="bg-slate-50 p-3 rounded-lg text-slate-600 text-xs leading-relaxed italic border border-slate-100">
                                    "{notes}"
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="lg:col-span-2">
                    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden h-fit">
                        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <div className="flex items-center gap-2">
                                <Package size={18} className="text-blue-600" />
                                <h2 className="font-bold text-slate-800">Product Catalog</h2>
                            </div>
                            <span className="text-xs font-bold text-slate-400 bg-white px-2 py-1 rounded border border-slate-100">
                                {productData?.length || 0} Total Items
                            </span>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/30">
                                        <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Product</th>
                                        <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Base Rate</th>
                                        <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Retail</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {productData && productData.length > 0 ? (
                                        productData.map((product) => (
                                            <tr key={product._id} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <p className="font-semibold text-slate-700">{product.name}</p>
                                                    <p className="text-[10px] text-slate-400 font-medium">Stock: {product.stock}</p>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-500 font-medium">₹{product.basePrice}</td>
                                                <td className="px-6 py-4 text-right">
                                                    <span className="font-bold text-slate-800 text-sm">₹{product.sellingPrice}</span>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={3} className="py-20 text-center">
                                                <TrendingUp size={32} className="mx-auto text-slate-200 mb-2" />
                                                <p className="text-sm font-medium text-slate-400">No products assigned</p>
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
        <div className="flex items-start gap-3">
            <div className="mt-0.5 text-slate-400">{icon}</div>
            <div>
                <p className="text-[10px] font-bold text-slate-300 uppercase tracking-tight">{label}</p>
                <p className="text-sm font-semibold text-slate-600 leading-tight">{value}</p>
            </div>
        </div>
    );
}