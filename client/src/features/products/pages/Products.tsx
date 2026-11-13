import { useEffect, useMemo, useState } from "react";
import { PackageSearch, Plus, Search, SlidersHorizontal, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/common/DataTable";
import { useDebounce } from "@/lib/debounce";
import { useCategories } from "@/features/category/hooks/useCategories";
import { AdminGate } from "@/features/auth/components/AdminGate";
import type { ApiResponse } from "@/types/api";
import type { ProductData } from "@/types/product";
import { getProductColumns } from "../components/ProductColumns";
import { productService } from "../api/product.service";

const selectStyle = "h-11 w-full min-w-0 rounded-lg border border-slate-200 bg-white px-3 text-sm focus-visible:outline-2 focus-visible:outline-brand-600";
const stockLabels = { healthy: "Healthy", low: "Low stock", out: "Out of stock" };

export default function Products() {
    const navigate = useNavigate();
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("");
    const [stock, setStock] = useState("");
    const [sort, setSort] = useState("recent");
    const [showFilters, setShowFilters] = useState(false);
    const [retry, setRetry] = useState(0);
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
    const [result, setResult] = useState<{ key: string; response?: ApiResponse<ProductData[]> }>();
    const { categories, fetchCategories } = useCategories();
    const query = useDebounce(search.trim(), 350);
    const { pageIndex, pageSize } = pagination;
    const key = JSON.stringify([pageIndex, pageSize, query, category, stock, sort, retry]);

    useEffect(() => { void fetchCategories(undefined, undefined, undefined, true); }, [fetchCategories]);
    useEffect(() => {
        const controller = new AbortController();
        productService.getAll(pageIndex + 1, pageSize, query, category, stock, false, sort, controller.signal).then(
            (response) => { if (!controller.signal.aborted) setResult({ key, response: response.success ? response : undefined }); },
            () => { if (!controller.signal.aborted) setResult({ key }); },
        );
        return () => controller.abort();
    }, [pageIndex, pageSize, query, category, stock, sort, key]);

    const loading = search.trim() !== query || result?.key !== key;
    const response = result?.response;
    const failed = !loading && !response;
    const total = response?.meta?.totalItems ?? 0;
    const filterCount = Number(Boolean(category)) + Number(Boolean(stock));
    const hasFilters = Boolean(search.trim() || filterCount);
    const columns = useMemo(() => getProductColumns(navigate), [navigate]);

    function firstPage() {
        setPagination((previous) => previous.pageIndex === 0 ? previous : { ...previous, pageIndex: 0 });
    }

    function clear() {
        setSearch("");
        setCategory("");
        setStock("");
        firstPage();
    }

    return (
        <div className="mx-auto min-w-0 max-w-[90rem] space-y-5">
            <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-5">
                <div className="flex items-center gap-3">
                    <span className="grid size-10 place-items-center rounded-lg bg-brand-100 text-brand-700"><PackageSearch size={19} aria-hidden="true" /></span>
                    <h1 className="text-xl font-semibold tracking-tight text-slate-950">Products</h1>
                </div>
                <AdminGate allowedRoles={["owner"]}>
                    <Button asChild><Link to="/products/add"><Plus size={16} /> Add product</Link></Button>
                </AdminGate>
            </header>

            <section aria-label="Product search and filters" className="space-y-3 rounded-xl border border-slate-200 bg-white p-3 sm:p-4">
                <div className="flex flex-wrap items-center gap-2">
                    <div className="relative min-w-0 flex-1">
                        <Search size={17} aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-slate-500" />
                        <Input id="product-search" aria-label="Search by product name" placeholder="Search products" value={search}
                            onChange={(event) => { setSearch(event.target.value); firstPage(); }}
                            className="h-11 rounded-lg pr-10 pl-9" />
                        {search && <button type="button" aria-label="Clear search" onClick={() => { setSearch(""); firstPage(); document.getElementById("product-search")?.focus(); }}
                            className="absolute inset-y-0 right-0 grid w-10 place-items-center text-slate-600 hover:text-brand-700"><X size={16} /></button>}
                    </div>
                    <Button type="button" variant="outline" aria-expanded={showFilters} aria-controls="product-filters"
                        className="h-11 lg:hidden" onClick={() => setShowFilters(!showFilters)}>
                        <SlidersHorizontal size={16} /> Filters{filterCount > 0 && ` (${filterCount})`}
                    </Button>
                </div>
                <div id="product-filters" className={`${showFilters ? "grid" : "hidden"} grid-cols-1 gap-3 sm:grid-cols-3 lg:grid`}>
                    <label className="grid min-w-0 gap-1 text-sm font-medium text-slate-700">Category
                        <select className={selectStyle} value={category} onChange={(event) => { setCategory(event.target.value); firstPage(); }}>
                            <option value="">All categories</option>
                            {categories?.map((item) => <option key={item._id} value={item._id}>{item.name}</option>)}
                        </select>
                    </label>
                    <label className="grid min-w-0 gap-1 text-sm font-medium text-slate-700">Stock status
                        <select className={selectStyle} value={stock} onChange={(event) => { setStock(event.target.value); firstPage(); }}>
                            <option value="">All stock levels</option>
                            {Object.entries(stockLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                        </select>
                    </label>
                    <label className="grid min-w-0 gap-1 text-sm font-medium text-slate-700">Sort by
                        <select className={selectStyle} value={sort} onChange={(event) => { setSort(event.target.value); firstPage(); }}>
                            <option value="recent">Newest first</option>
                            <option value="name">Name A–Z</option>
                            <option value="stock">Lowest stock first</option>
                        </select>
                    </label>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                    <p role="status" className="text-slate-600">{loading ? "Loading products…" : failed ? "Product results unavailable" : `${total.toLocaleString()} ${total === 1 ? "product" : "products"}`}</p>
                    {(hasFilters || sort !== "recent") && <Button variant="ghost" size="sm" onClick={() => { clear(); setSort("recent"); }}>Reset search and filters</Button>}
                </div>
            </section>

            <DataTable columns={columns} data={response?.data ?? []} isLoading={loading}
                rowCount={total} pageCount={response?.meta?.totalPages ?? 0}
                pagination={pagination} setPagination={setPagination}
                emptyState={failed ? (
                    <><p>Couldn’t load products.</p><Button variant="outline" size="sm" onClick={() => setRetry((value) => value + 1)}>Try again</Button></>
                ) : hasFilters ? (
                    <><p>No products match your search and filters.</p><Button variant="outline" size="sm" onClick={clear}>Clear search and filters</Button></>
                ) : <p>No products have been added yet.</p>}
            />
        </div>
    );
}
