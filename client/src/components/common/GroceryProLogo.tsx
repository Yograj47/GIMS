import { cn } from "@/lib/utils";

export function GroceryProLogo({ className, name = "GroceryPro" }: { className?: string; name?: string }) {
    return (
        <span className={cn("inline-flex items-center gap-2.5 font-semibold tracking-tight", className)}>
            <img src="/grocerypro.svg" alt="" width={36} height={36} className="size-9 shrink-0" />
            <span className="min-w-0 break-words">{name}</span>
        </span>
    );
}
