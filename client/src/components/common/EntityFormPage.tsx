import type { ReactNode } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LoadingSkeleton } from "./LoadingSkeleton";

export function EntityFormPage({
    title, description, formId, submitLabel, saving,
    loading = false, loadError, onRetry, secondaryAction, children,
}: {
    title: string;
    description?: string;
    formId: string;
    submitLabel: string;
    saving: boolean;
    loading?: boolean;
    loadError?: string;
    onRetry?: () => void;
    secondaryAction?: ReactNode;
    children: ReactNode;
}) {
    const navigate = useNavigate();
    return (
        <main className="mx-auto min-h-dvh w-full max-w-6xl space-y-5 px-4 py-5 sm:px-8 sm:py-7">
            <div className="border-b-2 border-input pb-4">
                <button type="button" onClick={() => navigate(-1)} className="mb-3 inline-flex min-h-9 items-center gap-2 rounded-md text-sm font-medium text-link hover:underline">
                    <ArrowLeft size={16} aria-hidden="true" /> Back
                </button>
                <h1 className="text-xl font-semibold tracking-tight text-foreground">{title}</h1>
                {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
            </div>
            {loading ? <LoadingSkeleton layout="form" label={`Loading ${title.toLowerCase()}`} /> : loadError ? (
                <div className="space-y-3 rounded-sm border border-border bg-card p-5">
                    <p role="alert" className="text-sm text-foreground">{loadError}</p>
                    {onRetry && <Button variant="outline" onClick={onRetry}>Try again</Button>}
                </div>
            ) : (
                <section aria-busy={saving} className="rounded-sm border border-border bg-card">
                    <div className="p-4 sm:p-6">{children}</div>
                    <div className="flex flex-wrap items-center justify-end gap-2 border-t-2 border-input px-4 py-3 sm:px-6">
                        {secondaryAction && <div className="mr-auto">{secondaryAction}</div>}
                        <Button type="button" variant="outline" disabled={saving} onClick={() => navigate(-1)}>Cancel</Button>
                        <Button type="submit" form={formId} disabled={saving}>
                            {saving && <Loader2 size={16} className="motion-safe:animate-spin" aria-hidden="true" />}
                            {saving ? "Saving…" : submitLabel}
                        </Button>
                    </div>
                </section>
            )}
        </main>
    );
}
