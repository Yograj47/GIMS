import { useState, type FormEvent } from "react";
import { BadgeCheck, KeyRound, LogOut, Mail, Pencil, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordUpdateModal } from "../auth/components/PasswordUpdateModal";
import { useUsers } from "../auth/hooks/useUsers";
import { useAuth } from "../auth/hooks/useAuth";
import { useAuthStore } from "@/store/authStore";
import type { UserRole } from "@/types/user";

const roles: Record<UserRole, { label: string; responsibilities: string[] }> = {
    admin: { label: "Admin", responsibilities: ["Store operations", "Billing and reports", "User and role management", "System settings"] },
    owner: { label: "Owner / Manager", responsibilities: ["Inventory and suppliers", "Store reports and billing", "Categories, units, and settings"] },
    staff: { label: "Staff", responsibilities: ["Counter sales", "Customer returns", "Online orders", "Customer contacts"] },
    accountant: { label: "Accountant", responsibilities: ["Sales invoices", "Supplier bills and credits", "Payments and inventory costs", "Financial reports"] },
    customer: { label: "Customer", responsibilities: ["Shop and track orders"] },
};

export default function ProfilePage() {
    const user = useAuthStore((state) => state.user);
    const { logout } = useAuth();
    const { isLoading, updateProfile } = useUsers();
    const [draft, setDraft] = useState<{ name: string; email: string } | null>(null);
    const [showPasswordModal, setShowPasswordModal] = useState(false);

    if (!user) return null;
    const { label, responsibilities } = roles[user.role];
    const initials = user.name.trim().split(/\s+/).slice(0, 2).map((part) => part.charAt(0)).join("").toUpperCase();

    async function saveProfile(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!draft || isLoading) return;
        try {
            if (await updateProfile(draft.name.trim(), draft.email.trim())) setDraft(null);
        } catch {
            // The API displays the error. Keep the edits available for retry.
        }
    }

    return (
        <div className="mx-auto w-full max-w-6xl space-y-5 px-4 py-6 sm:px-6 sm:py-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
                <Button type="button" variant="outline" onClick={logout}><LogOut aria-hidden="true" /> Sign out</Button>
            </div>

            <section aria-labelledby="profile-name" className="overflow-hidden rounded-xl border border-border bg-card">
                <div aria-hidden="true" className="h-24 bg-[radial-gradient(ellipse_at_85%_0%,var(--palette-ice),transparent_60%),linear-gradient(110deg,var(--palette-navy),var(--palette-blue)_52%,var(--palette-sky))] sm:h-32" />
                <div className="relative flex flex-col gap-3 px-5 pb-5 sm:flex-row sm:items-end sm:gap-4 sm:px-6">
                    <span aria-hidden="true" className="-mt-9 grid size-18 shrink-0 place-items-center rounded-full border-4 border-card bg-brand-soft text-2xl font-semibold text-brand-soft-foreground sm:-mt-10 sm:size-20">
                        {initials || "U"}
                    </span>
                    <div className="min-w-0 pt-0 sm:pt-3">
                        <h2 id="profile-name" className="flex items-center gap-2 text-xl font-semibold tracking-tight">
                            <span className="wrap-anywhere">{user.name}</span>
                            {user.isVerified && <><BadgeCheck aria-hidden="true" className="size-5 shrink-0 text-link" /><span className="sr-only">Verified account</span></>}
                        </h2>
                        <p className="mt-1 flex items-start gap-2 text-sm text-muted-foreground"><Mail aria-hidden="true" className="mt-0.5 size-4 shrink-0" /><span className="wrap-anywhere">{user.email}</span></p>
                    </div>
                    {!draft && <Button type="button" variant="outline" className="self-start sm:ml-auto sm:self-end" onClick={() => setDraft({ name: user.name, email: user.email })}><Pencil aria-hidden="true" /> Edit profile</Button>}
                </div>
            </section>

            <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
                <section aria-labelledby="details-heading" className="rounded-xl border border-border bg-card">
                    <h2 id="details-heading" className="border-b border-border px-5 py-4 font-semibold sm:px-6">Personal details</h2>
                    {draft ? (
                        <form onSubmit={saveProfile} className="space-y-4 p-5 sm:p-6">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <label className="grid gap-1.5 text-sm font-medium">Full name<Input autoFocus autoComplete="name" value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} required /></label>
                                <label className="grid gap-1.5 text-sm font-medium">Email address<Input type="email" autoComplete="email" value={draft.email} onChange={(event) => setDraft({ ...draft, email: event.target.value })} required /></label>
                            </div>
                            <div className="flex flex-wrap justify-end gap-2">
                                <Button type="button" variant="outline" disabled={isLoading} onClick={() => setDraft(null)}>Cancel</Button>
                                <Button type="submit" disabled={isLoading || !draft.name.trim()}>{isLoading ? "Saving…" : "Save changes"}</Button>
                            </div>
                        </form>
                    ) : (
                        <dl className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6">
                            <div><dt className="text-sm text-muted-foreground">Full name</dt><dd className="mt-1 wrap-anywhere font-medium">{user.name}</dd></div>
                            <div><dt className="text-sm text-muted-foreground">Email address</dt><dd className="mt-1 wrap-anywhere font-medium">{user.email}</dd></div>
                        </dl>
                    )}
                </section>

                <div className="space-y-5">
                    <section aria-labelledby="access-heading" className="rounded-xl border border-border bg-card p-5">
                        <h2 id="access-heading" className="flex items-center gap-2 font-semibold"><ShieldCheck aria-hidden="true" className="size-4 text-link" /> Workspace access</h2>
                        <p className="mt-3 inline-flex rounded-md bg-accent px-2.5 py-1 text-sm font-medium text-accent-foreground">{label}</p>
                        <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                            {responsibilities.map((item) => <li key={item}>{item}</li>)}
                        </ul>
                    </section>

                    <section aria-labelledby="security-heading" className="rounded-xl border border-border bg-card p-5">
                        <h2 id="security-heading" className="font-semibold">Account security</h2>
                        <Button type="button" variant="outline" className="mt-3" onClick={() => setShowPasswordModal(true)}><KeyRound aria-hidden="true" /> Change password</Button>
                    </section>
                </div>
            </div>
            <PasswordUpdateModal isOpen={showPasswordModal} onClose={() => setShowPasswordModal(false)} />
        </div>
    );
}
