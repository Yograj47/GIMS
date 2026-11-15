import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

const modes = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Monitor },
];

export function ThemeControl({ icons = false }: { icons?: boolean }) {
    const { theme, setTheme } = useTheme();
    const selected = theme ?? "system";

    if (icons) return (
        <div role="group" aria-label="Color theme" className="inline-flex gap-0.5 rounded-lg border border-border bg-muted p-0.5">
            {modes.map(({ value, label, icon: Icon }) => (
                <button key={value} type="button" aria-label={`${label} theme`} title={`${label} theme`}
                    aria-pressed={selected === value} onClick={() => setTheme(value)}
                    className={cn("grid size-8 place-items-center rounded-md text-muted-foreground hover:text-foreground",
                        selected === value && "bg-card text-link shadow-sm")}>
                    <Icon className="size-4" aria-hidden="true" />
                </button>
            ))}
        </div>
    );

    return (
        <select aria-label="Color theme" className="h-9 max-w-full rounded-md border border-input bg-card px-2 text-sm text-foreground"
            value={selected} onChange={(event) => setTheme(event.target.value)}>
            {modes.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
        </select>
    );
}
