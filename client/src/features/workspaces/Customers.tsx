import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { BackButton } from "@/components/common/BackButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/lib/debounce";
import api from "@/lib/api";

type Contact = { _id: string; name: string; phone: string };

export default function Customers() {
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [total, setTotal] = useState(0);
    const [reload, setReload] = useState(0);
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);
    const [failed, setFailed] = useState(false);
    const [message, setMessage] = useState("");
    const query = useDebounce(search, 300);
    useEffect(() => {
        const request = new AbortController();
        void Promise.resolve().then(async () => {
            if (request.signal.aborted) return;
            setLoading(true);
            setFailed(false);
            try {
                const { data } = await api.get<{ data: Contact[]; total: number }>("/customers", {
                    params: { search: query, page }, signal: request.signal,
                });
                if (!request.signal.aborted) {
                    setContacts(data.data);
                    setTotal(data.total);
                }
            } catch {
                if (!request.signal.aborted) setFailed(true);
            } finally {
                if (!request.signal.aborted) setLoading(false);
            }
        });
        return () => request.abort();
    }, [query, page, reload]);

    async function save(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (saving) return;
        const form = event.currentTarget;
        const values = new FormData(form);
        setSaving(true);
        setMessage("");
        try {
            await api.post("/customers", { name: values.get("name"), phone: values.get("phone") });
            form.reset();
            setSearch("");
            setPage(1);
            setReload((value) => value + 1);
            setMessage("Customer saved.");
        } catch {
            setMessage("Could not save the customer. Check the message and try again.");
        } finally {
            setSaving(false);
        }
    }

    return (
        <main className="mx-auto max-w-3xl space-y-5 p-4 sm:p-8">
            <BackButton className="text-sm text-link hover:underline" />
            <h1 className="text-2xl font-semibold">Customers</h1>
            <form onSubmit={save} className="grid gap-3 rounded-xl border bg-card p-4 sm:grid-cols-2">
                <h2 className="font-semibold sm:col-span-2">Add customer</h2>
                <label className="space-y-1 text-sm">Name<Input name="name" maxLength={120} required /></label>
                <label className="space-y-1 text-sm">Phone<Input name="phone" type="tel" pattern="\+?[0-9]{7,15}" placeholder="e.g. 9800000000" required /></label>
                <Button type="submit" disabled={saving}>{saving ? "Saving…" : "Save customer"}</Button>
                {message && <p role="status" className="text-sm sm:col-span-2">{message}</p>}
            </form>
            <section className="space-y-3 rounded-xl border bg-card p-4">
                <Input aria-label="Search customers" placeholder="Search by name or phone" value={search} maxLength={120} onChange={(event) => { setSearch(event.target.value); setPage(1); }} />
                {loading ? <p role="status">Loading customers…</p> : failed ? (
                    <Button variant="outline" onClick={() => setReload((value) => value + 1)}>Retry loading customers</Button>
                ) : contacts.length === 0 ? <p className="text-sm text-muted-foreground">No customers found.</p> : (
                    <ul className="divide-y">{contacts.map((contact) => <li key={contact._id} className="flex flex-wrap justify-between gap-2 py-3 text-sm"><span>{contact.name}</span><span>{contact.phone}</span></li>)}</ul>
                )}
                {total > 25 && <div className="flex items-center gap-3">
                    <Button variant="outline" disabled={page === 1 || loading} onClick={() => setPage(page - 1)}>Previous</Button>
                    <span className="text-sm">Page {page}</span>
                    <Button variant="outline" disabled={page * 25 >= total || loading} onClick={() => setPage(page + 1)}>Next</Button>
                </div>}
            </section>
        </main>
    );
}
