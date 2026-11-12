import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function Loading({ className }: { className?: string }) {
    return <Loader2 aria-hidden="true" className={cn("size-4 motion-safe:animate-spin", className)} />;
}
