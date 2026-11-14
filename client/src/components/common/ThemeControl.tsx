import { useTheme } from "next-themes";

export function ThemeControl() {
    const { theme, setTheme } = useTheme();

    return (
        <select
            aria-label="Color theme"
            className="h-9 max-w-full rounded-md border border-input bg-card px-2 text-sm text-foreground"
            value={theme ?? "system"}
            onChange={(event) => setTheme(event.target.value)}
        >
            <option value="system">System</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
        </select>
    );
}
