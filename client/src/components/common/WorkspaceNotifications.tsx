import { Bell, Check, PackageX } from "lucide-react";
import { Link } from "react-router-dom";
import { useAlerts } from "@/features/alerts/hooks/useAlerts";
import { useId, useState } from "react";

export function WorkspaceNotifications({ onNavigate }: { onNavigate: () => void }) {
    const { activeAlerts, acknowledgeAlert } = useAlerts();
    const [open, setOpen] = useState(false);
    const id = useId();

    return (
        <div className="mb-2">
            <button type="button" aria-expanded={open} aria-controls={id} onClick={() => setOpen(!open)}
                className="flex min-h-10 w-full items-center gap-2.5 rounded-lg px-2.5 text-sm font-medium hover:bg-card">
                <Bell aria-hidden="true" className="size-4 text-link" />
                Notifications
                {activeAlerts.length > 0 && <span className="ml-auto rounded bg-accent px-1.5 text-xs text-accent-foreground">{activeAlerts.length}</span>}
            </button>
            <div id={id} hidden={!open} className="mt-1 rounded-lg border border-border bg-card text-sm">
                {activeAlerts.length === 0 ? <p className="p-3 text-muted-foreground">No active alerts.</p> : (
                    <ul className="max-h-32 divide-y divide-border overflow-y-auto">
                        {activeAlerts.map((alert) => (
                            <li key={alert._id} className="flex items-start gap-2 p-2">
                                <span className="min-w-0 flex-1 wrap-anywhere text-xs">{alert.message}</span>
                                <button type="button" aria-label="Acknowledge alert" onClick={() => void acknowledgeAlert(alert._id)}
                                    className="grid size-7 shrink-0 place-items-center rounded text-link hover:bg-muted"><Check aria-hidden="true" className="size-4" /></button>
                            </li>
                        ))}
                    </ul>
                )}
                <Link to="/reports/stock?level=low" onClick={() => { setOpen(false); onNavigate(); }}
                    className="flex min-h-9 items-center gap-2 border-t border-border px-2 text-xs font-medium text-link hover:bg-muted">
                    <PackageX aria-hidden="true" className="size-4" /> Review stock alerts
                </Link>
            </div>
        </div>
    );
}
