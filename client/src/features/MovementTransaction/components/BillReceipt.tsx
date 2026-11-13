import { useGlobalStore } from "@/store/globalStore";
import type { TransactionData } from "@/types/transaction";
import { formatInvoiceMoney, type SalesInvoice } from "@/types/billing";
import { useEffect } from "react";

export const BillReceipt = ({ txn, invoice }: { txn: TransactionData; invoice?: SalesInvoice | null }) => {

  const { settings, fetchSettings } = useGlobalStore();

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  return (
    <div className="mt-8 border-b-2 border-dashed border-slate-200 no-screen print:block hidden">
      <div className="text-center border-b pb-4 mb-4">
        <h2 className="text-xl font-bold uppercase tracking-tighter">{settings?.storeName}</h2>
        <p className="text-[10px]">{settings?.location} | Ph: {settings?.adminEmail}</p>
      </div>

      <div className="flex justify-between text-[10px] mb-4">
        <span>{invoice ? `Invoice ${invoice.number}` : `Receipt #${txn._id.slice(-6).toUpperCase()}`}</span>
        <span>{new Date(invoice?.createdAt ?? txn.createdAt).toLocaleDateString()}</span>
      </div>

      <table className="w-full text-xs mb-4">
        <thead className="border-b">
          <tr>
            <th className="text-left pb-1">Item</th>
            <th className="text-center pb-1">Qty</th>
            <th className="text-right pb-1">Total</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-dotted">
          {txn.items.map((item, idx) => (
            <tr key={idx} className="py-2">
              <td className="py-2 pr-2 break-words font-medium">{invoice?.items[idx]?.productName ?? item.product?.name ?? item.productName ?? item.productId}</td>
              <td className="whitespace-nowrap px-1 py-2 text-center tabular-nums">{invoice?.items[idx]?.quantity ?? item.qty}</td>
              <td className="whitespace-nowrap py-2 text-right tabular-nums">{invoice ? formatInvoiceMoney(invoice.items[idx]?.totalMinor ?? 0, invoice.currency) : `Rs. ${item.total}`}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="border-t pt-2 space-y-1">
        <div className="flex justify-between font-bold">
          <span>GRAND TOTAL</span>
          <span>{invoice ? formatInvoiceMoney(invoice.totalMinor, invoice.currency) : `Rs. ${txn.grandTotal}`}</span>
        </div>
        {invoice && (
          <div className="flex justify-between text-xs">
            <span>Balance due</span>
            <span>{formatInvoiceMoney(invoice.totalMinor - invoice.paidMinor, invoice.currency)}</span>
          </div>
        )}
        <p className="text-[9px] text-center mt-6">--- Thank You for Shopping! ---</p>
      </div>
    </div>
  );
};
