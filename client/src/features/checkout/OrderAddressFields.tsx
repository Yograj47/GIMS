import { Input } from "@/components/ui/input";
import type { OrderContact } from "./checkout";

const provinces = ["Koshi", "Madhesh", "Bagmati", "Gandaki", "Lumbini", "Karnali", "Sudurpashchim"];

export default function OrderAddressFields({ contact }: { contact?: Partial<OrderContact> }) {
    return (
        <>
            <label className="grid gap-1.5 text-sm font-medium">Province
                <select name="province" required autoComplete="address-level1" defaultValue={contact?.province ?? ""}
                    className="h-9 w-full rounded-md border border-input bg-card px-3 text-foreground">
                    <option value="">Select province</option>
                    {provinces.map((province) => <option key={province}>{province}</option>)}
                </select>
            </label>
            <label className="grid gap-1.5 text-sm font-medium">District
                <Input name="district" required autoComplete="address-level2" maxLength={100}
                    placeholder="e.g. Kathmandu" defaultValue={contact?.district} />
            </label>
            <label className="grid gap-1.5 text-sm font-medium sm:col-span-2">Local address
                <Input name="address" required autoComplete="street-address" maxLength={500}
                    placeholder="Municipality, ward, street and nearby landmark" defaultValue={contact?.address} />
            </label>
        </>
    );
}
