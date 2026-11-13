import type { ReactNode } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LoadingSkeleton } from "./LoadingSkeleton";

export function EntityFormPage({
    title, description, backTo, backLabel, formId, submitLabel, saving,
    loading = false, loadError, onRetry, secondaryAction, children,
}: {
    title: string;
    description?: string;
    backTo: string;
    backLabel: string;
    formId: string;
    submitLabel: string;
    saving: boolean;
    loading?: boolean;
    loadError?: string;
    onRetry?: () => void;
    secondaryAction?: ReactNode;
    children: ReactNode;
}) {
    return (
        <div className="w-full min-w-0 space-y-5">
            <header className="border-b border-slate-200 pb-5">
                <Link to={backTo} className="mb-3 inline-flex min-h-9 items-center gap-2 rounded-md text-sm font-medium text-brand-700 hover:underline">
                    <ArrowLeft size={16} aria-hidden="true" /> {backLabel}
                </Link>
                <h1 className="text-xl font-semibold tracking-tight text-slate-950">{title}</h1>
                {description && <p className="mt-1 text-sm text-slate-600">{description}</p>}
            </header>
            {loading ? <LoadingSkeleton layout="form" label={`Loading ${title.toLowerCase()}`} /> : loadError ? (
                <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-5">
                    <p role="alert" className="text-sm text-slate-700">{loadError}</p>
                    {onRetry && <Button variant="outline" onClick={onRetry}>Try again</Button>}
                </div>
            ) : (
                <section aria-busy={saving} className="rounded-xl border border-slate-200 bg-white">
                    <div className="p-4 sm:p-6">{children}</div>
                    <div className="flex flex-wrap items-center justify-end gap-2 border-t border-slate-200 px-4 py-3 sm:px-6">
                        {secondaryAction && <div className="mr-auto">{secondaryAction}</div>}
                        <Button variant="outline" asChild><Link to={backTo}>Cancel</Link></Button>
                        <Button type="submit" form={formId} disabled={saving}>
                            {saving && <Loader2 size={16} className="motion-safe:animate-spin" aria-hidden="true" />}
                            {saving ? "Saving…" : submitLabel}
                        </Button>
                    </div>
                </section>
            )}
        </div>
    );
}
