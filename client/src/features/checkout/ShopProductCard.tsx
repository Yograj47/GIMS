import { ArrowUpRight } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { formatInvoiceMoney } from "@/types/billing";
import ShopProductPhoto from "./ShopProductPhoto";
import type { ShopProduct } from "./shopCart";

export default function ShopProductCard({ product, index, compact = false }: { product: ShopProduct; index: number; compact?: boolean }) {
    const from = useLocation();
    const unit = product.units[0];

    return (
        <article style={{ animationDelay: `${index * 45}ms` }} className="shop-card min-w-0 rounded-xl border border-border bg-card">
            <Link to={`/shop/products/${product.id}`} state={{ from }} className={`flex h-full overflow-hidden rounded-xl hover:text-link focus-visible:outline-offset-2 ${compact ? "items-center gap-3 p-2.5" : "flex-col"}`}>
                <ShopProductPhoto name={product.name} photo={product.cover} className={compact ? "size-16 shrink-0 rounded-lg" : "aspect-square"} />
                <div className={`flex min-w-0 flex-1 flex-col ${compact ? "gap-1" : "gap-2 p-3 lg:p-4"}`}>
                    <div className="flex items-start justify-between gap-2">
                        <h3 className={`text-sm font-semibold wrap-anywhere ${compact ? "" : "sm:text-base"}`}>{product.name}</h3>
                        <ArrowUpRight className="mt-0.5 size-4 shrink-0 text-link" aria-hidden="true" />
                    </div>
                    {unit && <p className={`mt-auto text-muted-foreground ${compact ? "text-xs" : "text-sm"}`}>
                        <span className="font-semibold text-foreground">{formatInvoiceMoney(Math.round(product.price * unit.multiplier * 100), "NPR")}</span> / {unit.name}
                    </p>}
                    {product.available <= 0 && <p className="text-xs text-muted-foreground">Out of stock online</p>}
                </div>
            </Link>
        </article>
    );
}
