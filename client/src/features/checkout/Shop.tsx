import { ArrowDownRight, ChevronLeft, ChevronRight, ClipboardCheck, ShoppingBag, Truck } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import groceryHero from "@/assets/shop-mint-pantry.png";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { Link, Navigate, useLocation, useSearchParams, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";

import type { ShopProduct } from "./shopCart";
import ShopProductCard from "./ShopProductCard";
import ShopProductPhoto from "./ShopProductPhoto";
import { ShopCatalogSkeleton, ShopCategoriesSkeleton } from "./ShopLoading";

type Catalog = {
    data: ShopProduct[];
    meta: { totalItems: number; pageSize: number; categories: { id: string; name: string }[] };
};

const gridClass = "grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4 lg:gap-5";

type Preview = { id: string; name: string; products: ShopProduct[] };

function useCatalogRequest<T>(path: string) {
    const [result, setResult] = useState<T>();
    const [error, setError] = useState(false);
    const [retry, setRetry] = useState(0);

    useEffect(() => {
        const controller = new AbortController();
        api.get<T>(path, { signal: controller.signal }).then(
            ({ data }) => { if (!controller.signal.aborted) setResult(data); },
            () => { if (!controller.signal.aborted) setError(true); },
        );
        return () => controller.abort();
    }, [path, retry]);

    return {
        result, error,
        retry: () => { setError(false); setRetry((value) => value + 1); },
    };
}

function CatalogLoading({ error, retry }: { error: boolean; retry: () => void }) {
    if (error) return (
        <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card p-4">
            <p role="alert" className="text-sm">Could not load the catalog.</p>
            <Button size="sm" variant="outline" onClick={retry}>Try again</Button>
        </div>
    );
    return <ShopCatalogSkeleton />;
}

function CategoryPreviews() {
    const { result, error, retry } = useCatalogRequest<{ data: Preview[] }>("/checkout/catalog/previews");
    const { hash } = useLocation();
    const categorySlider = useRef<HTMLDivElement>(null);
    const categories = result?.data ?? [];
    const featured = categories.filter(({ products }) => products.length > 0).slice(0, 4);

    function scrollCategories(direction: number) {
        const slider = categorySlider.current;
        if (!slider) return;
        slider.scrollBy({
            left: direction * slider.clientWidth * 0.75,
            behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
        });
    }

    useEffect(() => {
        if (result && hash.startsWith("#shop-category-")) {
            const target = document.getElementById(hash.slice(1)) ?? categorySlider.current;
            target?.scrollIntoView({ block: "start" });
        }
    }, [hash, result]);

    return (
        <div id="shop-categories" className="scroll-mt-36 space-y-8 sm:space-y-10">
            <section aria-labelledby="shop-category-heading" className="space-y-4 border-t border-border pt-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <h2 id="shop-category-heading" className="shop-display text-2xl font-semibold sm:text-3xl">Shop by category</h2>
                    <div className="flex items-center gap-2">
                        {categories.length > 1 && <>
                            <Button type="button" variant="outline" size="icon-sm" aria-label="Scroll to earlier categories" onClick={() => scrollCategories(-1)}>
                                <ChevronLeft aria-hidden="true" />
                            </Button>
                            <Button type="button" variant="outline" size="icon-sm" aria-label="Scroll to more categories" onClick={() => scrollCategories(1)}>
                                <ChevronRight aria-hidden="true" />
                            </Button>
                        </>}
                        <Button variant="outline" size="sm" asChild><Link to="/shop/all/#shop-results">All groceries</Link></Button>
                    </div>
                </div>
                {!result && !error && <ShopCategoriesSkeleton />}
                {categories.length > 0 && (
                    <div ref={categorySlider} className="flex snap-x snap-proximity gap-3 overflow-x-auto p-1 pb-3 [scrollbar-width:thin]">
                        {categories.map(({ id, name, products }) => (
                            <Link key={id} to={`/shop?category=${id}#shop-results`}
                                className="flex w-32 shrink-0 snap-start flex-col items-center gap-2 rounded-xl border border-border bg-card p-3 text-center text-sm font-medium hover:border-ring sm:w-40">
                                <ShopProductPhoto name={products[0]?.name ?? ""} photo={products[0]?.cover} className="size-16 rounded-full sm:size-20" />
                                <span className="wrap-anywhere">{name}</span>
                            </Link>
                        ))}
                    </div>
                )}
            </section>
            {!result && <CatalogLoading error={error} retry={retry} />}
            {featured.map(({ id, name, products }) => (
                <section key={id} id={`shop-category-${id}`} aria-labelledby={`shop-heading-${id}`} className="scroll-mt-36 border-t border-border pt-5">
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                        <h2 id={`shop-heading-${id}`} className="shop-display text-2xl font-semibold sm:text-3xl">{name}</h2>
                        <Button variant="outline" size="sm" asChild>
                            <Link to={`/shop?category=${id}#shop-results`}>View all <span className="sr-only">{name}</span><ChevronRight aria-hidden="true" /></Link>
                        </Button>
                    </div>
                    <div className={gridClass}>{products.map((product, index) => <ShopProductCard key={product.id} product={product} index={index} />)}</div>
                </section>
            ))}
        </div>
    );
}

function AllGroceryFilters({ params, categories }: { params: URLSearchParams; categories: Catalog["meta"]["categories"] }) {
    const navigate = useNavigate();
    const [error, setError] = useState("");
    const [category, setCategory] = useState(params.get("category") ?? "");

    return (
        <aside className="shop-filters h-fit rounded-xl border border-border bg-card p-4 lg:sticky lg:top-24" aria-labelledby="grocery-filters">
            <h2 id="grocery-filters" className="mb-4 text-lg font-semibold">Filters</h2>
            <form className="space-y-4" onSubmit={(event) => {
                event.preventDefault();
                const fields = new FormData(event.currentTarget);
                const next = new URLSearchParams();
                for (const key of ["q", "category", "minPrice", "maxPrice"]) {
                    const value = String(fields.get(key) ?? "").trim();
                    if (value) next.set(key, key === "minPrice" || key === "maxPrice" ? String(Number(value)) : value);
                }
                const min = next.get("minPrice");
                const max = next.get("maxPrice");
                if (min !== null && max !== null && Number(min) > Number(max)) {
                    setError("Minimum price must be at most the maximum price.");
                    return;
                }
                setError("");
                navigate(`/shop/all/${next.size ? `?${next}` : ""}#shop-results`);
            }}>
                <label className="grid gap-1.5 text-sm font-medium">
                    Search
                    <Input name="q" type="search" maxLength={80} defaultValue={params.get("q") ?? ""} placeholder="Search groceries" />
                </label>
                <label className="grid gap-1.5 text-sm font-medium">
                    Category
                    <select name="category" value={category} onChange={(event) => setCategory(event.target.value)} className="h-9 min-w-0 rounded-md border border-input bg-card px-2 text-sm">
                        <option value="">All categories</option>
                        {category && !categories.some(({ id }) => id === category) && <option value={category}>Selected category</option>}
                        {categories.map(({ id, name }) => <option key={id} value={id}>{name}</option>)}
                    </select>
                </label>
                <fieldset className="space-y-2">
                    <legend className="text-sm font-medium">Price per base unit (NPR)</legend>
                    <div className="grid grid-cols-2 gap-2">
                        <label className="grid gap-1 text-xs text-muted-foreground">Minimum<Input name="minPrice" type="number" min="0" max="9007199254740991" step="0.01" defaultValue={params.get("minPrice") ?? ""} /></label>
                        <label className="grid gap-1 text-xs text-muted-foreground">Maximum<Input name="maxPrice" type="number" min="0" max="9007199254740991" step="0.01" defaultValue={params.get("maxPrice") ?? ""} /></label>
                    </div>
                </fieldset>
                {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
                <div className="flex flex-wrap gap-2">
                    <Button type="submit" size="sm">Apply filters</Button>
                    <Button variant="ghost" size="sm" asChild><Link to="/shop/all/">Clear filters</Link></Button>
                </div>
            </form>
        </aside>
    );
}

function CatalogResults({ params, focusResults }: { params: URLSearchParams; focusResults: boolean }) {
    const { pathname } = useLocation();
    const showFilters = pathname.replace(/\/$/, "") === "/shop/all";
    const query = params.get("q")?.trim().slice(0, 80) ?? "";
    const category = params.get("category");
    const requestedPage = Number(params.get("page") ?? "1");
    const page = Number.isInteger(requestedPage) && requestedPage >= 1 && requestedPage <= 10000 ? requestedPage : 1;
    const request = new URLSearchParams({ page: String(page) });
    if (query) request.set("q", query);
    if (category) request.set("categoryId", category);
    if (showFilters) {
        for (const key of ["minPrice", "maxPrice"]) {
            const value = params.get(key);
            if (value) request.set(key, value);
        }
    }
    const { result, error, retry } = useCatalogRequest<Catalog>(`/checkout/catalog?${request}`);
    const heading = useRef<HTMLHeadingElement>(null);
    const totalPages = result ? Math.ceil(result.meta.totalItems / result.meta.pageSize) : 0;
    const categoryName = result?.meta.categories.find(({ id }) => id === category)?.name;
    const title = showFilters ? "All groceries" : query ? `Results for “${query}”` : category ? categoryName ?? "Category products" : "All groceries";

    useEffect(() => {
        if (!focusResults) return;
        heading.current?.focus({ preventScroll: true });
        heading.current?.scrollIntoView({ block: "start" });
    }, [focusResults]);

    function pageLink(next: number) {
        const nextParams = new URLSearchParams(params);
        nextParams.set("page", String(next));
        return `${pathname}?${nextParams}#shop-results`;
    }

    return (
        <main id="shop-results" className="mx-auto w-full max-w-7xl flex-1 space-y-4 px-4 py-6 sm:px-6">
            <Link to={categoryName ? `/shop#shop-category-${category}` : "/shop#shop-categories"} className="inline-flex items-center gap-1 text-sm font-medium text-link hover:underline">
                <ChevronLeft className="size-4" aria-hidden="true" /> Browse groceries
            </Link>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h1 ref={heading} tabIndex={-1} className="shop-display scroll-mt-36 text-3xl font-semibold tracking-tight">{title}</h1>
                {result && <p className="text-sm text-muted-foreground">{result.meta.totalItems} products</p>}
            </div>
            <div className={showFilters ? "grid items-start gap-5 lg:grid-cols-[15rem_minmax(0,1fr)]" : undefined}>
                {showFilters && <AllGroceryFilters params={params} categories={result?.meta.categories ?? []} />}
                <div className="min-w-0 space-y-4">
                    {!result && <CatalogLoading error={error} retry={retry} />}
                    {result && (result.data.length ? (
                        <div className={gridClass}>
                            {result.data.map((product, index) => <ShopProductCard key={product.id} product={product} index={index} />)}
                        </div>
                    ) : (
                        <div className="rounded-xl border border-border bg-card p-5">
                            <p>{showFilters ? "No groceries match these filters. Adjust your search, category, or price range." : query ? "No matching products. Try a shorter search or browse by category." : "No products are available in this listing."}</p>
                        </div>
                    ))}
                    {totalPages > 1 && (
                        <nav aria-label="Catalog pages" className="flex items-center justify-between gap-2 border-t border-border pt-4">
                            {page > 1 ? <Button size="sm" variant="outline" asChild><Link to={pageLink(page - 1)}><ChevronLeft aria-hidden="true" /> Previous</Link></Button> : <Button size="sm" variant="outline" disabled>Previous</Button>}
                            <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
                            {page < totalPages ? <Button size="sm" variant="outline" asChild><Link to={pageLink(page + 1)}>Next <ChevronRight aria-hidden="true" /></Link></Button> : <Button size="sm" variant="outline" disabled>Next</Button>}
                        </nav>
                    )}
                </div>
            </div>
        </main>
    );
}

const orderingSteps = [
    { title: "Fill your cart", description: "Choose your groceries, select a quantity, and add them to your cart.", Icon: ShoppingBag },
    { title: "Choose pickup or delivery", description: "Select how you want to receive your order, then choose a payment method at checkout.", Icon: Truck },
    { title: "Track your order", description: "Open Orders in your account to check payment and follow your order status.", Icon: ClipboardCheck },
];

function HowOrderingWorks() {
    const section = useRef<HTMLElement>(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const element = section.current;
        if (!element || typeof IntersectionObserver === "undefined") return;
        const observer = new IntersectionObserver(([entry]) => {
            if (!entry.isIntersecting) return;
            setVisible(true);
            observer.disconnect();
        }, { threshold: 0.25 });
        observer.observe(element);
        return () => observer.disconnect();
    }, []);

    return (
        <section ref={section} data-visible={visible} aria-labelledby="shop-how-heading"
            className="shop-ordering rounded-2xl border border-border bg-card px-5 py-6 sm:px-8 sm:py-8">
            <h2 id="shop-how-heading" className="shop-display text-2xl font-semibold tracking-tight sm:text-center sm:text-3xl">How ordering works</h2>
            <ol className="shop-ordering-steps relative mt-5 grid gap-5 sm:mt-7 sm:grid-cols-3">
                {orderingSteps.map(({ title, description, Icon }, index) => (
                    <li key={title} className="relative flex items-start gap-3 sm:flex-col sm:items-center sm:gap-2 sm:text-center">
                        <span className="shop-ordering-icon grid size-12 shrink-0 place-items-center rounded-full border border-border bg-secondary text-link"
                            style={{ animationDelay: `${index * 240}ms` }}>
                            <Icon className="size-5" aria-hidden="true" />
                        </span>
                        <div>
                            <h3 className="text-sm font-semibold sm:text-base">{title}</h3>
                            <p className="mt-1 max-w-xs text-sm leading-relaxed text-muted-foreground">{description}</p>
                        </div>
                    </li>
                ))}
            </ol>
        </section>
    );
}

function ShopHome() {
    const signedInCustomer = useAuthStore((state) => state.user?.role === "customer");
    const [showHeroPhoto, setShowHeroPhoto] = useState(true);
    const { hash } = useLocation();

    useEffect(() => {
        if (hash === "#shop-categories") document.getElementById("shop-categories")?.scrollIntoView();
    }, [hash]);

    return (
        <main className="mx-auto w-full max-w-7xl flex-1 space-y-6 px-4 py-4 sm:space-y-8 sm:px-6 sm:py-6">
            <section className={`shop-hero grid overflow-hidden rounded-2xl ${showHeroPhoto ? "sm:grid-cols-[0.95fr_1.15fr]" : ""}`}>
                <div className="shop-hero-copy flex flex-col items-start justify-center px-6 py-8 sm:px-9 lg:px-12">
                    <h1 className="shop-display max-w-[10ch] text-4xl font-semibold leading-[.98] tracking-tight sm:text-5xl lg:text-7xl">The everyday pantry.</h1>
                    <p className="mt-4 max-w-xs text-sm leading-relaxed sm:text-base">Explore grains, beans, and other grocery staples by unit price.</p>
                    <Button asChild className="shop-browse mt-5 rounded-full">
                        <a href="#shop-categories">Browse groceries <ArrowDownRight aria-hidden="true" /></a>
                    </Button>
                </div>
                {showHeroPhoto && (
                    <div className="shop-hero-frame relative h-44 overflow-hidden sm:h-auto sm:min-h-72">
                        <img src={groceryHero} alt="" fetchPriority="high" width={1536} height={1024}
                            onError={() => setShowHeroPhoto(false)}
                            className="shop-hero-photo absolute inset-0 h-full w-full object-cover" />
                    </div>
                )}
            </section>
            <HowOrderingWorks />
            <CategoryPreviews />
            {signedInCustomer && (
                <section aria-labelledby="shop-faq-heading" className="rounded-xl border border-border bg-card p-5 sm:p-6">
                    <h2 id="shop-faq-heading" className="shop-display text-2xl font-semibold">Frequently asked questions</h2>
                    <div className="mt-2 divide-y divide-border">
                        <details className="py-3">
                            <summary className="cursor-pointer text-sm font-medium">Why does an item show zero available?</summary>
                            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">Items with low stock are unavailable for online orders.</p>
                        </details>
                        <details className="py-3">
                            <summary className="cursor-pointer text-sm font-medium">Can I pay in cash?</summary>
                            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">Yes. Choose cash at checkout and pay when you pick up your order or receive your delivery.</p>
                        </details>
                    </div>
                </section>
            )}
        </main>
    );
}

export default function Shop() {
    const [params] = useSearchParams();
    const { hash, key, pathname } = useLocation();
    const product = params.get("product");
    if (product) return <Navigate to={`/shop/products/${encodeURIComponent(product)}`} replace />;
    const listing = pathname.replace(/\/$/, "") === "/shop/all" ||
        params.has("all") || params.has("category") || params.has("q");
    return listing
        ? <CatalogResults key={key} params={params} focusResults={hash === "#shop-results"} />
        : <ShopHome />;
}
