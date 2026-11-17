import { useState, type FormEvent, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CircleCheck, Mail, MapPin, Package, Pencil, Phone, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { userService } from "@/features/auth/api/user.service";
import { useAuthStore } from "@/store/authStore";
import { notify } from "@/lib/toast";
import type { UserData } from "@/types/user";
import OrderAddressFields from "./OrderAddressFields";

type ProfileEdit = "contact" | "address";

export default function ShopProfile() {
    const { user, fetchUser } = useAuthStore();
    const [editing, setEditing] = useState<ProfileEdit | null>(null);
    const [busy, setBusy] = useState(false);

    if (!user) return null;
    const address = user.deliveryAddress;
    const initials = user.name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join("");

    async function save(name: string | undefined, email: string | undefined, contact: Pick<UserData, "phone" | "deliveryAddress">) {
        if (busy) return;
        setBusy(true);
        try {
            await userService.updateProfile(name, email, contact);
            await fetchUser();
            setEditing(null);
            notify.success("Profile saved");
        } catch {
            // API errors are displayed by the API client.
        } finally {
            setBusy(false);
        }
    }

    function saveContact(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const fields = new FormData(event.currentTarget);
        void save(String(fields.get("name")), String(fields.get("email")), {
            phone: String(fields.get("phone")).trim() || null,
        });
    }

    function saveAddress(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const fields = new FormData(event.currentTarget);
        void save(undefined, undefined, {
            deliveryAddress: {
                province: String(fields.get("province")),
                district: String(fields.get("district")),
                address: String(fields.get("address")),
            },
        });
    }

    function editActions(label: string) {
        return (
            <div className="flex flex-wrap justify-end gap-2 border-t border-border pt-3">
                <Button type="button" variant="ghost" size="sm" disabled={busy} onClick={() => setEditing(null)}>Cancel</Button>
                <Button type="submit" size="sm" disabled={busy}>{busy ? "Saving…" : label}</Button>
            </div>
        );
    }

    return (
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-7 sm:px-6 sm:py-9">
            <h1 className="shop-display mb-5 text-3xl font-semibold tracking-tight sm:text-4xl">My account</h1>
            <div className="grid items-start gap-4 lg:grid-cols-[minmax(15rem,0.38fr)_minmax(0,1fr)] lg:gap-6">
                <aside className="overflow-hidden rounded-lg border border-border bg-card" aria-label="Account overview">
                    <div className="flex items-center gap-3 bg-accent/30 p-4 lg:block lg:p-5">
                        <div aria-hidden="true" className="grid size-12 shrink-0 place-items-center rounded-full bg-primary text-lg font-semibold uppercase text-primary-foreground lg:mb-3">
                            {initials || <UserRound className="size-5" />}
                        </div>
                        <div className="min-w-0">
                            <p className="shop-display text-xl font-semibold wrap-anywhere">{user.name}</p>
                            {user.isVerified && <p className="mt-1 flex items-center gap-1.5 text-xs font-medium text-link">
                                <CircleCheck aria-hidden="true" className="size-3.5" /> Email verified
                            </p>}
                        </div>
                    </div>
                    <Link to="/shop/orders" className="flex items-center gap-2.5 border-t border-border px-4 py-3 text-sm font-semibold hover:bg-muted lg:px-5">
                        <Package aria-hidden="true" className="size-4 text-link" /> Order history
                        <ArrowRight aria-hidden="true" className="ml-auto size-4 text-link" />
                    </Link>
                </aside>

                <div className="min-w-0 space-y-4">
                    <section aria-labelledby="profile-contact" className="rounded-lg border border-border bg-card p-4 sm:p-5">
                        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                            <h2 id="profile-contact" className="flex items-center gap-2 text-lg font-semibold">
                                <UserRound aria-hidden="true" className="size-4 text-link" /> Contact information
                            </h2>
                            {editing !== "contact" && <Button type="button" variant="outline" size="sm" disabled={busy} onClick={() => setEditing("contact")}>
                                <Pencil aria-hidden="true" /> Edit contact
                            </Button>}
                        </div>
                        {editing === "contact" ? (
                            <form onSubmit={saveContact} className="space-y-4">
                                <div className="grid gap-3 sm:grid-cols-2">
                                    <label className="grid gap-1.5 text-sm font-medium">Full name
                                        <Input name="name" autoComplete="name" defaultValue={user.name} required minLength={2} maxLength={100} />
                                    </label>
                                    <label className="grid gap-1.5 text-sm font-medium">Mobile number
                                        <Input name="phone" type="tel" autoComplete="tel" maxLength={30} defaultValue={user.phone ?? ""} placeholder="e.g. 9841234567" />
                                    </label>
                                    <label className="grid gap-1.5 text-sm font-medium sm:col-span-2">Email address
                                        <Input name="email" autoComplete="email" type="email" defaultValue={user.email} required aria-describedby="profile-email-hint" />
                                        <span id="profile-email-hint" className="text-xs font-normal text-muted-foreground">Changing your email requires verification.</span>
                                    </label>
                                </div>
                                {editActions("Save contact")}
                            </form>
                        ) : (
                            <dl className="grid gap-x-5 gap-y-3 border-t border-border pt-4 sm:grid-cols-2">
                                <ProfileDetail label="Full name" icon={<UserRound aria-hidden="true" className="size-3.5" />}>{user.name}</ProfileDetail>
                                <ProfileDetail label="Mobile number" icon={<Phone aria-hidden="true" className="size-3.5" />}>{user.phone || "No number saved"}</ProfileDetail>
                                <ProfileDetail label="Email address" icon={<Mail aria-hidden="true" className="size-3.5" />}>{user.email}</ProfileDetail>
                            </dl>
                        )}
                    </section>

                    <section aria-labelledby="profile-address" className="rounded-lg border border-border bg-card p-4 sm:p-5">
                        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                            <h2 id="profile-address" className="flex items-center gap-2 text-lg font-semibold">
                                <MapPin aria-hidden="true" className="size-4 text-link" /> Delivery address
                            </h2>
                            {editing !== "address" && <Button type="button" variant="outline" size="sm" disabled={busy} onClick={() => setEditing("address")}>
                                {address ? "Edit address" : "Add address"}
                            </Button>}
                        </div>
                        {editing === "address" ? (
                            <form onSubmit={saveAddress} className="space-y-4">
                                <div className="grid gap-3 sm:grid-cols-2"><OrderAddressFields contact={address ?? undefined} /></div>
                                {address && <Button type="button" variant="ghost" size="sm" disabled={busy}
                                    onClick={() => void save(undefined, undefined, { deliveryAddress: null })}>Remove saved address</Button>}
                                {editActions("Save address")}
                            </form>
                        ) : (
                            <div className="border-t border-border pt-4 text-sm">
                                {address ? <>
                                    <p className="font-medium wrap-anywhere">{address.address}</p>
                                    <p className="mt-0.5 text-muted-foreground">{address.district}, {address.province}</p>
                                </> : <p className="text-muted-foreground">No delivery address saved.</p>}
                                <p className="mt-2 text-xs text-muted-foreground">Your saved address fills in automatically at delivery checkout.</p>
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </main>
    );
}

function ProfileDetail({ label, icon, children }: { label: string; icon: ReactNode; children: ReactNode }) {
    return (
        <div className="min-w-0">
            <dt className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">{icon}{label}</dt>
            <dd className="mt-1 text-sm font-medium wrap-anywhere">{children}</dd>
        </div>
    );
}
