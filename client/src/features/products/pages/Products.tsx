import { PageHeader } from "@/components/common/PageHeader";
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

const selectStyle = "h-9 w-full min-w-0 rounded-lg border border-border bg-card px-3 text-sm focus-visible:outline-2 focus-visible:outline-ring";
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
        <div className="mx-auto min-w-0 max-w-[90rem] space-y-3">
            <PageHeader title="Products" icon={PackageSearch}>
                <AdminGate allowedRoles={["admin", "owner"]}>
                    <Button asChild size="sm"><Link to="/products/add"><Plus size={16} /> Add product</Link></Button>
                </AdminGate>
            </PageHeader>

            <DataTable columns={columns} data={response?.data ?? []} isLoading={loading}
                toolbar={(
                <div role="group" aria-label="Product search and filters" className="grid items-end gap-2 xl:grid-cols-[minmax(12rem,1fr)_minmax(0,2fr)_auto]">
                    <div className="flex flex-wrap items-center gap-2">
                        <div className="relative min-w-0 flex-1">
                            <Search size={17} aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground" />
                            <Input id="product-search" aria-label="Search by product name" placeholder="Search products" value={search}
                                onChange={(event) => { setSearch(event.target.value); firstPage(); }}
                                className="h-9 rounded-lg pr-10 pl-9" />
                            {search && <button type="button" aria-label="Clear search" onClick={() => { setSearch(""); firstPage(); document.getElementById("product-search")?.focus(); }}
                                className="absolute inset-y-0 right-0 grid w-10 place-items-center text-muted-foreground hover:text-link"><X size={16} /></button>}
                        </div>
                        <Button type="button" variant="outline" aria-expanded={showFilters} aria-controls="product-filters"
                            className="h-9 xl:hidden" onClick={() => setShowFilters(!showFilters)}>
                            <SlidersHorizontal size={16} /> Filters{filterCount > 0 && ` (${filterCount})`}
                        </Button>
                    </div>
                    <div id="product-filters" className={`${showFilters ? "grid" : "hidden"} grid-cols-1 gap-2 sm:grid-cols-3 xl:grid`}>
                        <select aria-label="Category" className={selectStyle} value={category} onChange={(event) => { setCategory(event.target.value); firstPage(); }}>
                                <option value="">All categories</option>
                                {categories?.map((item) => <option key={item._id} value={item._id}>{item.name}</option>)}
                            </select>
                        <select aria-label="Stock status" className={selectStyle} value={stock} onChange={(event) => { setStock(event.target.value); firstPage(); }}>
                                <option value="">All stock levels</option>
                                {Object.entries(stockLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                            </select>
                        <select aria-label="Sort by" className={selectStyle} value={sort} onChange={(event) => { setSort(event.target.value); firstPage(); }}>
                                <option value="recent">Newest first</option>
                                <option value="name">Name A–Z</option>
                                <option value="stock">Lowest stock first</option>
                            </select>
                    </div>
                    {(hasFilters || sort !== "recent") && <Button variant="ghost" size="sm" onClick={() => { clear(); setSort("recent"); }}>Reset filters</Button>}
                </div>

                )}
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
