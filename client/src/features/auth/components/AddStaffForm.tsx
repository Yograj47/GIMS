import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { notify } from "@/lib/toast";
import { userService } from "../api/user.service";

export default function AddStaffForm({ onClose, onCreated }: {
    onClose: () => void;
    onCreated: () => void;
}) {
    const [isSaving, setIsSaving] = useState(false);

    const submit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const fields = new FormData(event.currentTarget);
        setIsSaving(true);
        try {
            await userService.createStaff({
                name: String(fields.get("name")),
                email: String(fields.get("email")),
                password: String(fields.get("password")),
            });
            notify.success("Staff account created");
            onCreated();
        } catch {
            // The API client displays the error.
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <form onSubmit={submit} aria-labelledby="add-staff-title" className="space-y-4 rounded-lg border border-border bg-card p-5">
            <div>
                <h2 id="add-staff-title" className="font-semibold">Add staff</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                    Use the staff member’s email. They’ll verify it after their first workspace sign-in.
                </p>
            </div>
            <div className="grid gap-4 lg:grid-cols-3">
                <label className="grid gap-1.5 text-sm font-medium">
                    Full name
                    <Input name="name" autoComplete="off" required minLength={2} maxLength={100} />
                </label>
                <label className="grid gap-1.5 text-sm font-medium">
                    Staff email
                    <Input name="email" type="email" autoComplete="off" required />
                </label>
                <label className="grid gap-1.5 text-sm font-medium">
                    Initial password
                    <Input name="password" type="password" autoComplete="new-password" required minLength={6} maxLength={72} />
                </label>
            </div>
            <div className="flex flex-wrap justify-end gap-2">
                <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>Cancel</Button>
                <Button type="submit" disabled={isSaving}>{isSaving ? "Creating…" : "Create staff account"}</Button>
            </div>
        </form>
    );
}
