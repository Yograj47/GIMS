import { Search } from "lucide-react";
import { useEffect, useId, useState, type KeyboardEvent } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";
import { formatInvoiceMoney } from "@/types/billing";
import ShopProductPhoto from "./ShopProductPhoto";
import type { ShopProduct } from "./shopCart";

type Suggestions = { term: string; products: ShopProduct[]; failed?: boolean };

export default function ShopSearch({ initialQuery }: { initialQuery: string }) {
    const [query, setQuery] = useState(initialQuery);
    const [open, setOpen] = useState(false);
    const [active, setActive] = useState(-1);
    const [suggestions, setSuggestions] = useState<Suggestions>();
    const listId = useId();
    const navigate = useNavigate();
    const term = query.trim();
    const current = suggestions?.term === term ? suggestions : undefined;
    const matches = current?.products ?? [];
    const expanded = open && Boolean(term);

    useEffect(() => {
        if (!expanded) return;
        const controller = new AbortController();
        const timer = window.setTimeout(async () => {
            try {
                const { data } = await api.get<{ data: ShopProduct[] }>("/checkout/catalog", {
                    params: { q: term },
                    signal: controller.signal,
                });
                if (!controller.signal.aborted) setSuggestions({ term, products: data.data.slice(0, 5) });
            } catch {
                if (!controller.signal.aborted) setSuggestions({ term, products: [], failed: true });
            }
        }, 200);
        return () => { window.clearTimeout(timer); controller.abort(); };
    }, [expanded, term]);

    useEffect(() => {
        if (expanded && active >= 0) document.getElementById(`${listId}-${active}`)?.scrollIntoView({ block: "nearest" });
    }, [active, expanded, listId]);

    function submit(product?: ShopProduct) {
        if (!term) return;
        setOpen(false);
        setActive(-1);
        const params = new URLSearchParams({ q: term });
        const results = { pathname: "/shop", search: `?${params}`, hash: "#shop-results" };
        if (product) navigate(`/shop/products/${product.id}`, { state: { from: results } });
        else navigate(results);
    }

    function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
        if (event.key === "Escape" && expanded) {
            event.preventDefault();
            setOpen(false);
            setActive(-1);
        }
        if ((event.key === "ArrowDown" || event.key === "ArrowUp") && matches.length) {
            event.preventDefault();
            setOpen(true);
            setActive((index) => event.key === "ArrowDown"
                ? (index + 1) % matches.length
                : (index <= 0 ? matches.length - 1 : index - 1));
        }
    }

    return (
        <form role="search" className="relative order-last min-w-0 basis-full lg:order-none lg:min-w-48 lg:basis-auto lg:flex-1"
            onSubmit={(event) => { event.preventDefault(); submit(expanded ? matches[active] : undefined); }}
            onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget)) {
                    setOpen(false);
                    setActive(-1);
                }
            }}>
            <div className="flex h-9 items-center overflow-hidden rounded-full border border-border bg-card focus-within:border-ring">
                <input aria-label="Search groceries" role="combobox" aria-autocomplete="list" aria-controls={listId}
                    aria-expanded={expanded} aria-activedescendant={expanded && matches[active] ? `${listId}-${active}` : undefined}
                    autoComplete="off" maxLength={80} value={query} placeholder="Search groceries"
                    className="min-w-0 flex-1 bg-transparent px-4 text-sm outline-none placeholder:text-muted-foreground"
                    onFocus={() => setOpen(true)} onKeyDown={onKeyDown}
                    onChange={(event) => { setQuery(event.target.value); setActive(-1); setOpen(true); }} />
                <button type="submit" aria-label="Search" className="grid h-full w-11 place-items-center text-link hover:bg-muted">
                    <Search className="size-4" aria-hidden="true" />
                </button>
            </div>
            <div hidden={!expanded} className="absolute inset-x-0 top-full z-40 mt-2 rounded-xl border border-border bg-card p-1.5 shadow-lg">
                <ul id={listId} role="listbox" aria-label="Matching products" className="max-h-[45dvh] overflow-y-auto">
                    {matches.map((product, index) => {
                        const unit = product.units[0];
                        return (
                            <li key={product.id} id={`${listId}-${index}`} role="option" aria-selected={index === active}
                                className="flex cursor-pointer items-center gap-3 rounded-md p-2 text-sm hover:bg-muted aria-selected:bg-accent"
                                onMouseDown={(event) => event.preventDefault()} onClick={() => submit(product)}>
                                <ShopProductPhoto name={product.name} photo={product.cover} className="size-10 shrink-0 rounded-md" />
                                <div className="min-w-0">
                                    <p className="font-medium wrap-anywhere">{product.name}</p>
                                    {unit && <p className="text-xs text-muted-foreground">
                                        {formatInvoiceMoney(Math.round(product.price * unit.multiplier * 100), "NPR")} / {unit.name}
                                    </p>}
                                </div>
                            </li>
                        );
                    })}
                </ul>
                {expanded && !matches.length && <p role="status" className="p-3 text-sm text-muted-foreground">
                    {!current ? "Searching…" : current.failed ? "Suggestions are unavailable. Submit to search." : "No matching products."}
                </p>}
                <button type="button" onClick={() => submit()} className="w-full rounded-md border-t border-border p-2.5 text-left text-sm font-medium text-link hover:bg-muted">
                    See all results
                </button>
            </div>
        </form>
    );
}
