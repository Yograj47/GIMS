import { BackButton } from "@/components/common/BackButton";

const NotFound = () => {
    return (
        <main className="grid min-h-dvh place-items-center bg-background px-4">
            <div className="w-full max-w-md space-y-4 rounded-xl border border-border bg-card p-6 text-center sm:p-8">
                <h1 className="text-xl font-semibold text-foreground">Page not found</h1>
                <p className="text-sm text-muted-foreground">
                    The page you are looking for does not exist or has been moved.
                </p>

                <BackButton
                    className="inline-flex min-h-10 items-center rounded-lg bg-brand-600 px-4 text-sm font-medium text-white hover:bg-brand-700"
                >Back</BackButton>
            </div>
        </main>
    );
};

export default NotFound;
