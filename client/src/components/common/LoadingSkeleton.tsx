import { Box } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const rowWidths = ["w-3/4", "w-1/2", "w-2/3", "w-1/3"];

export function LoadingSkeleton({
    layout = "table",
    label = "Loading page",
}: {
    layout?: "table" | "form" | "dashboard";
    label?: string;
}) {
    return (
        <section role="status" className="space-y-6">
            <span className="sr-only">{label}</span>
            <div aria-hidden="true" className="space-y-6">
                <div className="flex items-center gap-3 border-b border-slate-200 pb-5">
                    <Skeleton className="size-10 shrink-0 rounded-lg bg-brand-100" />
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-36 max-w-full" />
                        <Skeleton className="h-2.5 w-52 max-w-full" />
                    </div>
                    <Skeleton className="hidden h-9 w-24 sm:block" />
                </div>

                {layout === "dashboard" && (
                    <div className="grid gap-4 sm:grid-cols-3">
                        {rowWidths.slice(0, 3).map((width) => (
                            <div key={width} className="space-y-3 rounded-xl border border-slate-200 bg-white p-5">
                                <Skeleton className="h-3 w-20" />
                                <Skeleton className="h-7 w-24" />
                                <Skeleton className={`h-2.5 ${width}`} />
                            </div>
                        ))}
                    </div>
                )}

                <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-6">
                    {layout === "form" ? (
                        <div className="grid gap-5 sm:grid-cols-2">
                            {rowWidths.map((width) => (
                                <div key={width} className="space-y-2">
                                    <Skeleton className={`h-3 ${width}`} />
                                    <Skeleton className="h-10 w-full" />
                                </div>
                            ))}
                        </div>
                    ) : layout === "dashboard" ? (
                        <Skeleton className="h-40 w-full sm:h-56" />
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {rowWidths.map((width) => (
                                <div key={width} className="grid grid-cols-3 items-center gap-4 py-4">
                                    <Skeleton className={`h-3 ${width}`} />
                                    <Skeleton className="h-3 w-2/3" />
                                    <Skeleton className="ml-auto h-5 w-1/2 rounded-full" />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}

export function StartupSkeleton({ label = "Loading GroceryPro" }: { label?: string }) {
    return (
        <div role="status" className="grid min-h-dvh place-items-center bg-brand-950 px-5 py-8">
            <span className="sr-only">{label}</span>
            <div aria-hidden="true" className="w-full max-w-sm">
                <div className="mb-7 flex items-center justify-center gap-3">
                    <span className="grid size-11 place-items-center rounded-xl bg-brand-600 text-white shadow-lg shadow-brand-950/50">
                        <Box className="size-6" />
                    </span>
                    <span className="text-xl font-bold tracking-tight text-white">
                        Grocery<span className="text-brand-400">Pro</span>
                    </span>
                </div>
                <AuthPlaceholder />
            </div>
        </div>
    );
}

function AuthPlaceholder() {
    return (
        <div aria-hidden="true" className="space-y-4 rounded-2xl border border-slate-700/70 bg-slate-800/40 p-5 sm:p-6">
            <Skeleton className="h-4 w-2/5 bg-slate-700" />
            <Skeleton className="h-3 w-3/5 bg-slate-700" />
            <Skeleton className="mt-6 h-9 w-full bg-slate-700" />
            <Skeleton className="h-9 w-full bg-slate-700" />
            <Skeleton className="h-9 w-full bg-brand-900/70" />
        </div>
    );
}

export function AuthSkeleton({ label = "Loading page" }: { label?: string }) {
    return (
        <div role="status">
            <span className="sr-only">{label}</span>
            <AuthPlaceholder />
        </div>
    );
}
