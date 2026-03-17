import type { TransactionData } from "@/types/Transaction";

export const BillReceipt = ({ txn }: { txn: TransactionData }) => {
  return (
    <div className="mt-8 border-b-2 border-dashed border-slate-200 no-screen print:block hidden">
      <div className="text-center border-b pb-4 mb-4">
        <h2 className="text-xl font-bold uppercase tracking-tighter">GROCERY PRO</h2>
        <p className="text-[10px]">123 Main St, Your City | Ph: 9876543210</p>
      </div>

      <div className="flex justify-between text-[10px] mb-4">
        <span>Invoice: #{txn._id.slice(-6).toUpperCase()}</span>
        <span>{new Date(txn.createdAt).toLocaleDateString()}</span>
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
              <td className="py-1 uppercase font-medium">{item.product?.name}</td>
              <td className="py-1 text-center">{item.qty}</td>
              <td className="py-1 text-right">Rs. {item.total}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="border-t pt-2 space-y-1">
        <div className="flex justify-between font-bold">
          <span>GRAND TOTAL</span>
          <span>Rs. {txn.grandTotal}</span>
        </div>
        <p className="text-[9px] text-center mt-6">--- Thank You for Shopping! ---</p>
      </div>
    </div>
  );
};