"use client";

import { Invoice } from "@/types";
import { InvoicePrintModal } from "./InvoicePrintModal";

export { InvoicePrintModal };

interface ThermalReceiptProps {
  invoice: Invoice;
  onClose: () => void;
  initialMode?: "a4" | "compact" | "thermal" | "challan";
}

export function ThermalReceipt({ invoice, onClose, initialMode = "thermal" }: ThermalReceiptProps) {
  return (
    <InvoicePrintModal
      invoice={invoice}
      onClose={onClose}
      initialMode={initialMode}
    />
  );
}

