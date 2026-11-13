import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Trash2, Loader2, ShoppingCart } from "lucide-react";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { useForm, useFieldArray, type Resolver, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

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
    const isStockIn = purpose === "Return";
    const navigate = useNavigate();

    const { fetchTransactions, transactions, createTransaction, isLoading } = useMovementTransactions();
    const [gatewayEnabled, setGatewayEnabled] = useState(false);
    const [checkoutMethod, setCheckoutMethod] = useState("cash");
    const [checkingOut, setCheckingOut] = useState(false);
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
    const watchedName = useWatch({ control, name: "partyDetails.name" });

    const showSettlement = currentType === "Return" || currentType === "Sale";
    
    const canEditRate = currentType !== "Sale" || checkoutMethod === "credit";
    const lineRate = (item: Item) => canEditRate ? item.rate : Math.round(item.pricePerBase * item.multiplier * 100) / 100;
    const lineTotalMinor = (item: Item) => Math.round(item.qty * Math.round(lineRate(item) * 100));
    const grandTotal = watchedItems.reduce((sum, item) => sum + lineTotalMinor(item), 0) / 100;
    const usedStock = new Map<string, number>();
    for (const item of watchedItems) {
        usedStock.set(item.productId, (usedStock.get(item.productId) ?? 0) + item.baseQuantity);
    }

    const onFormSubmit = async (data: TransactionFormData) => {
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
                } else if (order.transactionId) navigate(`/reports/transaction/${order.transactionId}`);
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
        const success = await createTransaction(data);
        if (success) navigate("/reports/transactions");
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

    useEffect(() => {
        if (purpose !== "Adjustment") {
            fetchTransactions();
        }
    }, [purpose, fetchTransactions]);

    const pastCustomers = useMemo(() => {
        const customers = transactions
            .filter(t => t.transactionType === "Sale")
            .map(t => t.partyDetails);

        return Array.from(new Map(customers.map(c => [c.name, c])).values());
    }, [transactions]);

    useEffect(() => {
        const match = pastCustomers.find(entity => entity.name === watchedName);
        if (match) {
            setValue("partyDetails.phone", match.phone);
        }
    }, [watchedName, pastCustomers, setValue]);

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

    const saving = isLoading || checkingOut;
    const totalLabel = formatInvoiceMoney(Math.round(grandTotal * 100), "NPR");
    const submitLabel = currentType === "Sale" && checkoutMethod === "cash" ? "Confirm cash sale"
        : currentType === "Sale" && checkoutMethod === "gateway" ? "Continue to payment" : "Record transaction";
    const field = "h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm";

    return (
        <main className="flex min-h-dvh w-full min-w-0 flex-col bg-market-paper lg:h-dvh">
            <header className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3 sm:px-6">
                <div className="flex items-center gap-3">
                    <Button type="button" variant="outline" size="icon" aria-label="Back to stock movements" onClick={() => navigate("/stock-movements")}><ArrowLeft size={18} /></Button>
                    <h1 className="text-xl font-semibold tracking-tight">{titles[purpose]}</h1>
                </div>
                <a href="#register-cart" className="text-sm font-medium text-brand-700 lg:hidden">Transaction · {fields.length} {fields.length === 1 ? "line" : "lines"}</a>
            </header>
            <div className="grid min-h-0 min-w-0 flex-1 items-start gap-4 p-3 sm:p-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] lg:overflow-y-auto">
                <RegisterCatalog inbound={isStockIn} usedStock={usedStock} onAdd={add} />
                <form id="register-cart" onSubmit={(event) => void handleSubmit(onFormSubmit)(event)}
                    className="min-w-0 scroll-mt-20 space-y-4 rounded-xl border border-slate-200 bg-white p-3 sm:p-5">
                    <div className="flex items-center gap-2">
                        <ShoppingCart size={18} className="text-brand-700" aria-hidden="true" />
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
                            <thead className="sticky top-0 bg-slate-100 text-xs text-slate-700"><tr><th className="p-3">Item</th><th className="p-3">Quantity</th><th className="p-3">Unit price</th><th className="p-3 text-right">Total</th><th><span className="sr-only">Remove</span></th></tr></thead>
                            <tbody>
                            {fields.map((line, index) => {
                                const item = watchedItems[index] ?? line;
                                return (
                                    <tr key={line.id} data-record>
                                        <th scope="row" className="min-w-24 p-3 text-sm font-semibold">
                                            {line.productName}<span className="block text-xs font-normal text-slate-600">{line.unitName}</span>
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
                    ) : <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-600">Add products from the catalog to start.</p>}
                    {showSettlement && (
                        <div className="grid gap-3">
                            {currentType === "Sale" ? (
                                <label className="grid gap-1 text-sm font-medium">Payment
                                    <select className={field} value={checkoutMethod} onChange={(event) => setCheckoutMethod(event.target.value)}>
                                        <option value="cash">Cash</option>
                                        {gatewayEnabled && <option value="gateway">Card or wallet via Khalti</option>}
                                        <option value="credit">Invoice on credit</option>
                                    </select>
                                </label>
                            ) : null}
                            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
                                <label className="grid gap-1 text-sm font-medium">Customer (optional)
                                    <Input list="register-contacts" {...register("partyDetails.name")} />
                                </label>
                                <label className="grid gap-1 text-sm font-medium">Phone (optional)
                                    <Input type="tel" {...register("partyDetails.phone")} />
                                </label>
                            </div>
                            <datalist id="register-contacts">{pastCustomers.map((party, index) => <option key={index} value={party?.name}>{party?.phone}</option>)}</datalist>
                        </div>
                    )}
                    <details className="text-sm">
                        <summary className="cursor-pointer text-brand-700">Add a note</summary>
                        <textarea aria-label="Transaction note" {...register("notes")} rows={2} className="mt-2 w-full rounded-lg border border-slate-200 p-2" />
                    </details>
                    <div className="flex justify-between gap-2 border-t border-slate-200 pt-3 font-semibold">
                        <span>Total</span><span className="tabular-nums">{totalLabel}</span>
                    </div>
                    <Button type="submit" className="w-full" disabled={saving || !fields.length}>
                        {saving && <Loader2 size={16} className="motion-safe:animate-spin" aria-hidden="true" />}
                        {saving ? "Recording…" : submitLabel}
                    </Button>
                </form>
            </div>
        </main>
    );
}
