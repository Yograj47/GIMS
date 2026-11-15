import { useAuthStore } from "@/store/authStore";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Banknote, CreditCard, Receipt, Trash2, Loader2, ShoppingCart } from "lucide-react";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { useForm, useFieldArray, type Resolver, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RegisterCatalog } from "./RegisterCatalog";
import { formatInvoiceMoney } from "@/types/billing";

import { transactionSchema, type Item, type TransactionFormData } from "@/types/transaction";
import { useMovementTransactions } from "../hooks/useMovementTransactions";
import api from "@/lib/api";
import { checkoutPost, checkoutTokenKey, goToPayment } from "@/features/checkout/checkout";

type Purpose = "Sale" | "Return" | "Adjustment";
const titles = { Sale: "Sales register", Return: "Customer return", Adjustment: "Stock adjustment" };

export default function MovementForm({ purpose }: { purpose?: Purpose }) {
    const [searchParams] = useSearchParams();
    if (!purpose) return <Navigate replace to={searchParams.get("mode") === "out" ? "/stock-movements/sale" : "/stock-movements/purchase"} />;
    return <MovementRegister key={purpose} purpose={purpose} />;
}

function MovementRegister({ purpose }: { purpose: Purpose }) {
    const staff = useAuthStore((state) => state.user?.role === "staff");
    const isStockIn = purpose === "Return";
    const navigate = useNavigate();

    const { createTransaction, isLoading } = useMovementTransactions();
    const [gatewayEnabled, setGatewayEnabled] = useState(false);
    const [checkoutMethod, setCheckoutMethod] = useState<"cash" | "gateway" | "credit">("cash");
    const [checkoutOpen, setCheckoutOpen] = useState(false);
    const [cashReceived, setCashReceived] = useState("");
    const [customerPhone, setCustomerPhone] = useState("");
    const [customerName, setCustomerName] = useState("");
    const [lookup, setLookup] = useState<"idle" | "loading" | "found" | "new" | "failed">("idle");
    const phone = customerPhone.trim();
    const validPhone = /^\+?[0-9]{7,15}$/.test(phone);
    const submitLock = useRef(false);
    const [checkingOut, setCheckingOut] = useState(false);
    const [savingCustomer, setSavingCustomer] = useState(false);
    const checkoutRequest = useRef<{ signature: string; token: string } | null>(null);

    const { register, control, handleSubmit, setValue, getValues, formState: { errors } } = useForm<TransactionFormData>({
        resolver: zodResolver(transactionSchema) as Resolver<TransactionFormData>,
        defaultValues: {
            transactionType: purpose,
            items: [],
            grandTotal: 0,
            isPaid: false,
            partyDetails: { name: "", phone: "" },
            notes: ""
        }
    });

    const { fields, append, remove } = useFieldArray({ control, name: "items" });
    const currentType = useWatch({ control, name: "transactionType" });
    const watchedItems = useWatch({ control, name: "items" });
    useEffect(() => {
        if (!checkoutOpen || !validPhone) return;
        const request = new AbortController();
        const timer = window.setTimeout(async () => {
            try {
                const { data } = await api.get<{ data: { name: string } | null }>("/customers/lookup", {
                    params: { phone }, signal: request.signal,
                });
                if (request.signal.aborted) return;
                setCustomerName(data.data?.name ?? "");
                setLookup(data.data ? "found" : "new");
            } catch {
                if (!request.signal.aborted) setLookup("failed");
            }
        }, 300);
        return () => { window.clearTimeout(timer); request.abort(); };
    }, [checkoutOpen, phone, validPhone]);

    const sale = purpose === "Sale";
    
    const canEditRate = currentType !== "Sale";
    const lineRate = (item: Item) => canEditRate ? item.rate : Math.round(item.pricePerBase * item.multiplier * 100) / 100;
    const lineTotalMinor = (item: Item) => Math.round(item.qty * Math.round(lineRate(item) * 100));
    const grandTotal = watchedItems.reduce((sum, item) => sum + lineTotalMinor(item), 0) / 100;
    const usedStock = new Map<string, number>();
    for (const item of watchedItems) {
        usedStock.set(item.productId, (usedStock.get(item.productId) ?? 0) + item.baseQuantity);
    }

    const recordTransaction = async (data: TransactionFormData) => {

        if (data.transactionType === "Sale" && checkoutMethod !== "credit") {
            if (checkingOut) return;
            const payload = {
                items: data.items.map((item) => ({ productId: item.productId, unitId: item.unitId, quantity: item.qty })),
                fulfillment: "counter",
                paymentMethod: checkoutMethod,
                customer: data.partyDetails,
            };
            const signature = JSON.stringify(payload);
            if (checkoutRequest.current?.signature !== signature) checkoutRequest.current = { signature, token: crypto.randomUUID() };
            const token = checkoutRequest.current.token;
            setCheckingOut(true);
            try {
                const order = await checkoutPost("counter", { ...payload, token });
                if (checkoutMethod === "gateway") {
                    sessionStorage.setItem(checkoutTokenKey, token);
                    try { await goToPayment(token); } catch { navigate("/checkout/return"); }
                } else if (order.transactionId) navigate(`/reports/transaction/${order.transactionId}`, { replace: true });
            } catch {
                // The API shows stock and payment errors.
            } finally {
                setCheckingOut(false);
            }
            return;
        }
        data = {
            ...data,
            grandTotal,
            items: data.items.map((item) => ({ ...item, total: lineTotalMinor(item) / 100 })),
            isPaid: data.transactionType === "Sale" ? false : data.isPaid,
        };
        const transaction = await createTransaction(data);
        if (transaction) {
            if (data.transactionType === "Sale") navigate(`/reports/transaction/${transaction._id}`, { replace: true });
            else if (staff) navigate("/stock-movements/sale", { replace: true });
            else navigate(-1);
        }
    };

    useEffect(() => {
        if (isStockIn) return;
        let active = true;
        api.get<{ data: { gatewayEnabled: boolean } }>("/checkout/methods").then(
            ({ data }) => { if (active) setGatewayEnabled(data.data.gatewayEnabled); },
            () => { /* Cash checkout remains available. */ },
        );
        return () => { active = false; };
    }, [isStockIn]);

    function updateQuantity(index: number, qty: number) {
        const item = getValues(`items.${index}`);
        setValue(`items.${index}.qty`, qty, { shouldValidate: true });
        setValue(`items.${index}.baseQuantity`, qty * item.multiplier, { shouldValidate: true });
        setValue(`items.${index}.total`, Math.round(qty * item.rate * 100) / 100);
    }

    function add(item: Item) {
        const currentItems = getValues("items");
        const index = currentItems.findIndex((line) => line.productId === item.productId && line.unitId === item.unitId);
        if (index === -1) append(item);
        else updateQuantity(index, currentItems[index].qty + item.qty);
    }

    const saving = isLoading || checkingOut || savingCustomer;
    const totalLabel = formatInvoiceMoney(Math.round(grandTotal * 100), "NPR");
    const totalMinor = Math.round(grandTotal * 100);
    const cashMinor = /^\d+(?:\.\d{1,2})?$/.test(cashReceived) ? Math.round(Number(cashReceived) * 100) : 0;
    const cashValid = Number.isSafeInteger(cashMinor) && cashMinor >= totalMinor;
    const needsCustomer = !validPhone || (lookup !== "found" && lookup !== "new") || !customerName.trim();
    const paymentOptions = [
        { value: "cash", label: "Cash", icon: Banknote },
        { value: "gateway", label: "Card or wallet via Khalti", icon: CreditCard },
        { value: "credit", label: "Credit sale", icon: Receipt },
    ] as const;

    async function confirmCheckout() {
        if (submitLock.current || saving || needsCustomer || (sale && (totalMinor <= 0 || (checkoutMethod === "cash" && !cashValid)))) return;
        submitLock.current = true;
        setSavingCustomer(true);
        try {
            await handleSubmit(async (data) => {
                let name = customerName.trim();
                if (lookup === "new") {
                    const response = await api.put<{ data: { name: string } }>("/customers/lookup", { name, phone });
                    name = response.data.data.name;
                    setCustomerName(name);
                    setLookup("found");
                }
                await recordTransaction({ ...data, partyDetails: { name, phone } });
            })();
        } catch {
            // The API displays the error and the cashier can retry.
        } finally {
            setSavingCustomer(false);
            submitLock.current = false;
        }
    }

    const field = "h-10 w-full rounded-lg border border-border bg-card px-3 text-sm";

    return (
        <main className={`flex w-full min-w-0 flex-col bg-background lg:h-dvh ${staff ? "" : "min-h-dvh"}`}>
            <header className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-3 border-b border-border bg-card px-4 py-3 sm:px-6">
                <div className="flex items-center gap-3">
                    {!staff && <Button type="button" variant="outline" size="icon" aria-label="Back" onClick={() => navigate(-1)}><ArrowLeft size={18} /></Button>}
                    <h1 className="text-xl font-semibold tracking-tight">{titles[purpose]}</h1>
                </div>
            </header>
            <div className="grid min-h-0 min-w-0 flex-1 items-start gap-4 p-3 sm:p-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] lg:overflow-y-auto">
                <RegisterCatalog inbound={isStockIn} usedStock={usedStock} onAdd={add} />
                <form id="register-cart" onSubmit={(event) => void handleSubmit((data) => {
                    if (purpose === "Adjustment") return recordTransaction(data);
                    setCashReceived("");
                    setLookup(validPhone ? "loading" : "idle");
                    setCheckoutOpen(true);
                })(event)}
                    className="min-w-0 scroll-mt-20 space-y-4 rounded-xl border border-border bg-card p-3 sm:p-5">
                    <div className="flex items-center gap-2">
                        <ShoppingCart size={18} className="text-link" aria-hidden="true" />
                        <h2 className="font-semibold">Current transaction</h2>
                    </div>
                    {purpose === "Adjustment" && <label className="grid gap-1 text-sm font-medium">Reason for stock removal
                        <select {...register("transactionType")} className={field}>
                            <option value="Adjustment">Stock adjustment (out)</option>
                            <option value="Damage">Damage or waste</option>
                        </select>
                    </label>}
                    {fields.length ? (
                        <div role="region" aria-label="Transaction items" tabIndex={0} className="overflow-auto lg:max-h-[48dvh]">
                        <table className="records-table w-full text-left text-sm">
                            <thead className="sticky top-0 bg-secondary text-xs text-foreground"><tr><th className="p-3">Item</th><th className="p-3">Quantity</th><th className="p-3">Unit price</th><th className="p-3 text-right">Total</th><th><span className="sr-only">Remove</span></th></tr></thead>
                            <tbody>
                            {fields.map((line, index) => {
                                const item = watchedItems[index] ?? line;
                                return (
                                    <tr key={line.id} data-record>
                                        <th scope="row" className="min-w-24 p-3 text-sm font-semibold">
                                            {line.productName}<span className="block text-xs font-normal text-muted-foreground">{line.unitName}</span>
                                        </th>
                                        <td className="p-3">
                                            <Input type="number" min={item.isFractionable ? "0.001" : "1"} step={item.isFractionable ? "any" : "1"} className="w-20" value={item.qty || ""}
                                                aria-label={`Quantity for ${line.productName}`} onChange={(event) => updateQuantity(index, Number(event.target.value))} required />
                                            {(errors.items?.[index]?.qty || errors.items?.[index]?.baseQuantity) && <p role="alert" className="text-xs text-red-700">Check quantity</p>}
                                        </td>
                                        <td className="whitespace-nowrap p-3 tabular-nums">
                                            {canEditRate ? <Input type="number" min="0" step="0.01" aria-label={`Unit price for ${line.productName}`} className="w-24" value={item.rate}
                                                onChange={(event) => setValue(`items.${index}.rate`, Number(event.target.value))} /> : formatInvoiceMoney(Math.round(lineRate(item) * 100), "NPR")}
                                        </td>
                                        <td className="whitespace-nowrap p-3 text-right font-semibold tabular-nums">{formatInvoiceMoney(lineTotalMinor(item), "NPR")}</td>
                                        <td className="p-2"><Button type="button" size="icon-sm" variant="ghost" className="text-red-700" aria-label={`Remove ${line.productName}`} onClick={() => remove(index)}><Trash2 size={15} /></Button></td>
                                    </tr>
                                );
                            })}
                            </tbody>
                        </table>
                        </div>
                    ) : <p className="rounded-lg bg-muted p-4 text-sm text-muted-foreground">Add products from the catalog to start.</p>}
                    <details className="text-sm">
                        <summary className="cursor-pointer text-link">Add a note</summary>
                        <textarea aria-label="Transaction note" {...register("notes")} rows={2} className="mt-2 w-full rounded-lg border border-border p-2" />
                    </details>
                    <div className="flex justify-between gap-2 border-t border-border pt-3 font-semibold">
                        <span>Total</span><span className="tabular-nums">{totalLabel}</span>
                    </div>
                    <Button type="submit" className="w-full" disabled={saving || !fields.length || (purpose === "Sale" && totalMinor <= 0)}>
                        {saving && <Loader2 size={16} className="motion-safe:animate-spin" aria-hidden="true" />}
                        {saving ? "Recording..." : sale ? "Go to checkout" : isStockIn ? "Review return" : "Record transaction"}
                    </Button>
                </form>
            </div>
            {purpose !== "Adjustment" && (
                <Dialog open={checkoutOpen} onOpenChange={(open) => { if (!saving) setCheckoutOpen(open); }}>
                    <DialogContent showCloseButton={!saving} className="gap-5">
                        <div>
                            <DialogTitle>{sale ? "Counter checkout" : "Confirm customer return"}</DialogTitle>
                            <DialogDescription>{sale ? "Confirm the customer and choose a payment method." : "Confirm who is returning these items."}</DialogDescription>
                        </div>
                        <div className="flex items-center justify-between gap-3 rounded-lg bg-muted px-4 py-3">
                            <span className="text-sm">{sale ? "Amount due" : "Return value"}</span>
                            <strong className="text-xl tabular-nums">{totalLabel}</strong>
                        </div>
                        <fieldset disabled={saving} className="grid gap-2">
                            <legend className="mb-2 text-sm font-medium">Customer details</legend>
                            <label className="grid gap-1 text-sm">Phone number
                                <Input type="tel" autoComplete="tel" maxLength={16} required value={customerPhone} onChange={(event) => {
                                    if (event.target.value.trim() !== phone) {
                                        setCustomerName("");
                                        setLookup("loading");
                                    }
                                    setCustomerPhone(event.target.value);
                                }} />
                            </label>
                            {!validPhone ? <p className="text-sm text-muted-foreground">Enter 7–15 digits, with an optional country prefix starting with +.</p>
                                : lookup === "failed" ? <p role="alert" className="text-sm text-destructive">Customer lookup failed. Reopen checkout to retry.</p>
                                : lookup === "loading" ? <p role="status" className="text-sm">Looking up customer…</p>
                                : <label className="grid gap-1 text-sm">Customer name
                                    <Input required maxLength={120} readOnly={lookup === "found"} value={customerName} onChange={(event) => setCustomerName(event.target.value)} />
                                </label>}
                            {validPhone && lookup === "new" && <p className="text-sm text-muted-foreground">New number. Enter the customer’s name to register them at checkout.</p>}
                        </fieldset>
                        {sale && <fieldset disabled={saving} className="grid gap-2">
                            <legend className="mb-2 text-sm font-medium">Payment method</legend>
                            {paymentOptions.filter(({ value }) => value !== "gateway" || gatewayEnabled).map(({ value, label, icon: Icon }) => (
                                <label key={value} className="flex cursor-pointer items-center gap-3 rounded-lg border border-border px-3 py-2.5 has-checked:border-ring has-checked:bg-accent">
                                    <input type="radio" name="counter-payment" checked={checkoutMethod === value} onChange={() => setCheckoutMethod(value)} />
                                    <Icon aria-hidden="true" className="size-4 text-link" />
                                    <span className="text-sm font-medium">{label}</span>
                                </label>
                            ))}
                        </fieldset>}
                        {sale && checkoutMethod === "cash" && (
                            <div className="grid gap-2">
                                <label className="grid gap-1 text-sm font-medium">Cash received (NPR)
                                    <Input inputMode="decimal" value={cashReceived} disabled={saving} onChange={(event) => setCashReceived(event.target.value)} placeholder="0.00" />
                                </label>
                                <Button type="button" variant="ghost" size="sm" className="justify-self-start" disabled={saving} onClick={() => setCashReceived(grandTotal.toFixed(2))}>Use exact amount</Button>
                                <p aria-live="polite" className="text-sm font-medium">Change due: {cashValid ? formatInvoiceMoney(cashMinor - totalMinor, "NPR") : "â€”"}</p>
                            </div>
                        )}
                        <div className="flex flex-wrap justify-end gap-2">
                            <Button variant="outline" disabled={saving} onClick={() => setCheckoutOpen(false)}>Back to items</Button>
                            <Button disabled={saving || needsCustomer || (sale && checkoutMethod === "cash" && !cashValid)} onClick={() => void confirmCheckout()}>
                                {saving ? "Processingâ€¦" : !sale ? "Record return" : checkoutMethod === "cash" ? "Confirm cash payment" : checkoutMethod === "gateway" ? "Continue to Khalti" : "Record credit sale"}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </main>
    );
}
