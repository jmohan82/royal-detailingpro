import { ReceiptScreen } from "@/components/receipt/receipt-screen";

export default async function ReceiptPage({
  params,
}: {
  params: Promise<{ invoiceId: string }>;
}) {
  const { invoiceId } = await params;
  return <ReceiptScreen invoiceId={invoiceId} />;
}
