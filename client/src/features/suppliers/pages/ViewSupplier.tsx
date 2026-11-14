import { BackButton } from "@/components/common/BackButton";
import { useEffect, useState, useMemo } from 'react';
import { NavLink, Navigate, useLocation, useParams, useNavigate } from 'react-router-dom';
import { Pencil, ArrowLeft, Package, SearchX, Trash2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { useSuppliers } from '../hooks/useSuppliers';
import { cn } from "@/lib/utils";
import { AssignProductModal } from '../components/AssignProductModal';
import { useProducts } from '@/features/products/hooks/useProducts';
import { DeleteConfirmDialog } from '@/lib/deleteAlert';
import { useAuthStore } from '@/store/authStore';

export default function SupplierView({ section = "overview" }: { section?: "overview" | "catalog" }) {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { hash } = useLocation();
    const user = useAuthStore((state) => state.user);
    const { singleSupplier, productData, fetchSupplierById, removeSupplier, isLoading, removeProductFromSupplier, assignProducts } = useSuppliers();
    const { products, fetchProducts, isLoading: productsLoading } = useProducts();
    const [isAssigning, setIsAssigning] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);


    useEffect(() => {
        if (id) void fetchSupplierById(id).catch(() => {});
    }, [id, fetchSupplierById]);

    useEffect(() => {
        if (section !== "overview") void fetchProducts(undefined, undefined, undefined, undefined, undefined, true);
    }, [section, fetchProducts]);

    const assignedProductIds = useMemo(() => productData?.map(p => p._id) || [], [productData]);
    const canWrite = user?.role === "admin" || user?.role === "owner";
    const catalogProducts = products.filter((product) => assignedProductIds.includes(product._id));

    const handleAssignProducts = async (productIds: string[]) => {
        if (!id) return;
        const success = await assignProducts(id, productIds);
        if (success) {
            setIsAssigning(false);
        }
    };


    const confirmDelete = async () => {
        if (!id) return;
        if (!await removeSupplier(id)) return;
        setIsDeleteDialogOpen(false);
        navigate("/suppliers");
    }

    const profilePath = `/suppliers/v/${id}`;
    if (section === "overview" && hash === "#receiving") {
        return <Navigate replace to={`/stock-movements/${canWrite ? "purchase" : "supplier-return"}?supplierId=${id}`} />;
    }

    if (isLoading) return <LoadingSkeleton layout="dashboard" label="Loading supplier" />;
    if (!singleSupplier) return <NotFoundState onBack={() => navigate(-1)} />;

    const sections = [
        { label: "Overview", to: profilePath },
        { label: "Product catalog", to: `${profilePath}/catalog` },
        ...(canWrite && singleSupplier.isActive ? [{ label: "Receive delivery", to: `/stock-movements/purchase?supplierId=${id}` }] : []),
        { label: "Stock lots", to: `/stock-movements/supplier-lots?supplierId=${id}` },
        { label: "Supplier returns", to: `/stock-movements/supplier-return?supplierId=${id}` },
        ...(user?.isVerified && canWrite ? [{ label: "Supplier billing", to: `${profilePath}/billing` }] : []),
    ];

    return (
        <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-500">
            {/* Header / Actions */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-input pb-6">
                <div>
                    <BackButton
                        className="text-[10px] font-bold uppercase tracking-widest text-subtle-foreground hover:text-link flex items-center gap-2 mb-2 transition-colors"
                    ><ArrowLeft size={12} aria-hidden="true" /> Back</BackButton>
                    <h1 className="text-3xl font-black text-foreground tracking-tighter uppercase">{singleSupplier.name}</h1>
                    <p className="mt-1 text-sm text-muted-foreground">{singleSupplier.isActive ? "Active" : "Inactive"}</p>
                </div>

                {section === "overview" && canWrite && <div className="flex flex-wrap gap-2">
                    <Button
                        variant="outline"
                        onClick={() => navigate(`/suppliers/edit/${id}`)}
                        className="h-9 text-[10px] font-bold uppercase tracking-widest border-input hover:bg-muted"
                    >
                        <Pencil size={14} className="mr-2" /> Edit supplier
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setIsDeleteDialogOpen(true)}
                        className="text-red-600 hover:bg-red-50 hover:text-red-500 text-[11px] font-bold uppercase gap-2 transition-colors"
                    >
                        <Trash2 size={14} className="mr-2" /> Delete supplier
                    </Button>

                    <DeleteConfirmDialog
                        open={isDeleteDialogOpen}
                        onOpenChange={setIsDeleteDialogOpen}
                        onConfirm={confirmDelete}
                        title="Confirm Supplier Deletion"
                        itemName={singleSupplier?.name || "Supplier"}
                        isLoading={isLoading}
                    />
                </div>}
            </div>

            <nav aria-label="Supplier sections" className="flex flex-wrap gap-2 border-b border-border pb-3">
                {sections.map(({ label, to }) => (
                    <NavLink key={to} to={to} end className={({ isActive }) => cn(
                        "rounded-md px-3 py-2 text-sm font-medium",
                        isActive ? "bg-brand-100 text-link" : "text-muted-foreground hover:bg-secondary",
                    )}>{label}</NavLink>
                ))}
            </nav>

            {section === "overview" && (
                <div className="grid gap-4 md:grid-cols-2">
                    <section className="bg-muted/50 border border-input rounded-xl p-5">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-subtle-foreground mb-4">Contact details</h3>
                        <div className="space-y-4">
                            <InfoRow label="Phone" value={singleSupplier.phone} isMono />
                            <InfoRow label="Email" value={singleSupplier.email} />
                            <InfoRow label="Address" value={singleSupplier.address} />
                        </div>
                    </section>

                    {singleSupplier.notes && (
                        <section className="border-l-2 border-brand-500 pl-4 py-1">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-subtle-foreground mb-2">Notes</h3>
                            <p className="text-xs text-muted-foreground leading-relaxed italic">"{singleSupplier.notes}"</p>
                        </section>
                    )}
                </div>
            )}

            {section !== "overview" && productsLoading && <LoadingSkeleton label="Loading products" />}
            {section === "catalog" && !productsLoading && (
                <div>
                    <div className="border border-input rounded-xl overflow-hidden bg-card">
                        <div className="px-6 py-4 border-b border-input flex items-center justify-between bg-muted/30">
                            <div className="flex items-center gap-2">
                                <Package size={16} className="text-subtle-foreground" />
                                <h2 className="text-[11px] font-black uppercase tracking-widest text-foreground">Linked products</h2>
                            </div>
                        {canWrite && <Button
                                onClick={() => setIsAssigning(true)}
                                className="h-8 text-[9px] font-black uppercase tracking-widest bg-brand-600 hover:bg-brand-700 shadow-none rounded-lg"
                            >
                                <Plus size={12} className="mr-1" strokeWidth={4} /> Assign
                        </Button>}
                        </div>

                        <div className="overflow-x-auto">
                            <table className="records-table w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-muted/50 border-b border-input">
                                        <th className="px-6 py-3 text-[9px] font-black text-subtle-foreground uppercase tracking-widest">Product</th>
                                        <th className="px-6 py-3 text-[9px] font-black text-subtle-foreground uppercase tracking-widest text-center">Base Cost</th>
                                        <th className="px-6 py-3 text-[9px] font-black text-subtle-foreground uppercase tracking-widest text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {catalogProducts.length ? (
                                        catalogProducts.map((product) => (
                                            <tr key={product._id} data-record className="hover:bg-muted/30 transition-colors group">
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-semibold text-foreground">{product.name}</span>
                                                        <span className="text-xs text-muted-foreground">Stock: {product.quantity} units</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="text-xs font-mono font-bold text-muted-foreground">{product.basePrice.toLocaleString()}</span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    {canWrite && <button
                                                        aria-label={`Remove ${product.name} from supplier catalog`}
                                                        onClick={() => void removeProductFromSupplier(singleSupplier._id, product._id)}
                                                        className="text-slate-300 hover:text-rose-500 transition-colors"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>}
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
            )}

            {section === "catalog" && canWrite && <AssignProductModal
                isOpen={isAssigning}
                onClose={() => setIsAssigning(false)}
                Products={products}
                onAssign={handleAssignProducts}
                excludeIds={assignedProductIds}
            />}
        </div>
    );
}

const InfoRow = ({ label, value, isMono }: { label: string, value?: string, isMono?: boolean }) => (
    <div>
        <p className="text-[9px] font-bold text-subtle-foreground uppercase tracking-widest mb-1">{label}</p>
        <p className={cn("text-xs font-bold text-foreground", isMono && "font-mono text-link")}>{value || "N/A"}</p>
    </div>
);

const NotFoundState = ({ onBack }: { onBack: () => void }) => (
    <div className="h-[60vh] flex flex-col items-center justify-center text-center">
        <SearchX size={40} className="text-slate-200 mb-4" />
        <h2 className="text-sm font-black text-foreground uppercase tracking-widest">Entry Not Found</h2>
        <Button onClick={onBack} variant="link" className="text-link text-[10px] font-bold uppercase mt-2">Back</Button>
    </div>
);
