import type { BusinessProfile } from "@/types/business";
import type { Invoice } from "@/types/billing";

interface ReceiptDocumentProps {
  invoice: Invoice;
  profile: BusinessProfile | null;
}

/**
 * The actual printable receipt — sized for a 58mm (2") thermal roll. Uses "Rs." instead of the
 * ₹ glyph because most ESC/POS thermal printer fonts don't carry the Rupee sign.
 */
export function ReceiptDocument({ invoice, profile }: ReceiptDocumentProps) {
  return (
    <div
      id="receipt-print-area"
      className="w-[58mm] bg-white px-2 py-3 text-black"
      style={{ fontFamily: "var(--font-geist-mono, monospace)" }}
    >
      <div className="text-center">
        <p className="text-[11px] font-bold uppercase">{profile?.name || "Royal DetailingPro"}</p>
        {profile?.address && (
          <p className="whitespace-pre-line text-[9px] leading-tight">{profile.address}</p>
        )}
        {profile?.phone && <p className="text-[9px]">Ph: {profile.phone}</p>}
        {profile?.gstNumber && <p className="text-[9px]">GSTIN: {profile.gstNumber}</p>}
      </div>

      <div className="my-2 border-t border-dashed border-black" />

      <div className="text-[9px] leading-snug">
        <Row label="Invoice #" value={invoice.invoiceNumber} />
        <Row label="Date" value={invoice.billingDate} />
        <Row label="Customer" value={invoice.customerName} />
        <Row label="Mobile" value={invoice.customerMobile} />
        <Row label="Vehicle" value={invoice.vehiclePlate} />
      </div>

      <div className="my-2 border-t border-dashed border-black" />

      <table className="w-full text-[9px] leading-snug">
        <thead>
          <tr className="border-b border-black">
            <th className="pb-0.5 text-left font-normal">Item</th>
            <th className="pb-0.5 text-right font-normal">Qty</th>
            <th className="pb-0.5 text-right font-normal">Rate</th>
            <th className="pb-0.5 text-right font-normal">Amt</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((item, index) => (
            <tr key={`${item.itemId}-${index}`}>
              <td className="py-0.5 pr-1">{item.name}</td>
              <td className="py-0.5 text-right">{item.quantity}</td>
              <td className="py-0.5 text-right">{item.price.toFixed(2)}</td>
              <td className="py-0.5 text-right">{(item.quantity * item.price).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="my-2 border-t border-dashed border-black" />

      <div className="text-[9px] leading-snug">
        <Row label="Subtotal" value={invoice.subtotal.toFixed(2)} />
        <Row label="Discount" value={`-${invoice.discountAmount.toFixed(2)}`} />
        <Row label="Tax" value={`+${invoice.taxAmount.toFixed(2)}`} />
        <div className="mt-1 flex justify-between border-t border-black pt-1 text-[11px] font-bold">
          <span>TOTAL</span>
          <span>Rs. {invoice.grandTotal.toFixed(2)}</span>
        </div>
        <div className="mt-1 flex justify-between">
          <span>Payment</span>
          <span>{invoice.paymentMode}</span>
        </div>
      </div>

      <div className="my-2 border-t border-dashed border-black" />

      <p className="text-center text-[9px]">Thank you for your visit!</p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-2">
      <span>{label}</span>
      <span className="text-right">{value}</span>
    </div>
  );
}
