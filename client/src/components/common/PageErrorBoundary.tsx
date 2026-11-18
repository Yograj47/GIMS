import { Component, type ReactNode } from "react";
import { Button } from "@/components/ui/button";

export default class PageErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
    state = { failed: false };

    static getDerivedStateFromError() {
        return { failed: true };
    }

    render() {
        if (!this.state.failed) return this.props.children;
        return (
            <main className="grid min-h-dvh place-items-center bg-background px-5 text-foreground">
                <div role="alert" className="max-w-md space-y-3">
                    <h1 className="text-2xl font-semibold">This page couldn’t load</h1>
                    <p className="text-sm text-muted-foreground">Reload the page to try again.</p>
                    <Button onClick={() => window.location.reload()}>Reload page</Button>
                </div>
            </main>
        );
    }
}
