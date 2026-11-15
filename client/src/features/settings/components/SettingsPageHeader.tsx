import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export { PageHeader as SettingsPageHeader } from "@/components/common/PageHeader";

export function SettingsSearch({ label, value, onChange }: {
    label: string;
    value: string;
    onChange: (value: string) => void;
}) {
    return (
        <div className="relative w-full sm:max-w-sm">
            <Search size={17} aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground" />
            <Input type="search" aria-label={label} placeholder={label} value={value}
                onChange={(event) => onChange(event.target.value)} className="h-9 bg-card pl-9" />
        </div>
    );
}
