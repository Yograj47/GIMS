import { Package } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { productMediaUrl } from "@/lib/productMedia";
import type { ProductPhoto } from "@/types/product";

const samplePhotos = [
    "basmati rice", "black beans", "chickpeas", "dried green peas",
    "millet", "pearl barley", "rolled oats", "split mung beans",
    "whole wheat flour", "red lentils", "red kidney beans",
];

export default function ShopProductPhoto({ name, photo, className, eager = false }: {
    name: string; photo?: ProductPhoto; className?: string; eager?: boolean;
}) {
    const [failedId, setFailedId] = useState<string>();
    if (photo && failedId !== photo.mediaId) {
        return <div className={cn("overflow-hidden bg-muted", className)}>
            <img src={productMediaUrl(photo.mediaId)} alt={photo.altText || name}
                loading={eager ? "eager" : "lazy"} decoding="async"
                onError={() => setFailedId(photo.mediaId)} className="size-full object-cover" />
        </div>;
    }
    const normalized = name.toLowerCase().trim();
    const photoName = normalized.endsWith("(demo)") ? normalized.replace(/\s*\(demo\)$/, "").split(" — ")[0].trim() : normalized;
    const tile = samplePhotos.indexOf(photoName);

    return tile >= 0 ? (
        <div aria-hidden="true"
            className={cn("bg-muted bg-[url('/shop/pantry-samples.png')] bg-size-[400%_300%] bg-no-repeat", className)}
            style={{ backgroundPosition: `${(tile % 4) * 100 / 3}% ${Math.floor(tile / 4) * 50}%` }}
        />
    ) : (
        <div aria-hidden="true" className={cn("grid place-items-center bg-muted text-muted-foreground", className)}>
            <Package className="size-5" />
        </div>
    );
}
