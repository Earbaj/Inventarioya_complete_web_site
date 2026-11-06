"use client";

import React, { useState, useMemo } from "react";
import { Invoice } from "@/types";
import { formatDate, downloadCsvFile, extractPersonName } from "@/lib/utils";
import { AuthService } from "@/lib/api/client";
import { dummyInvoice } from "./invoice/sampleInvoiceData";
import { InvoiceControlBar } from "./invoice/InvoiceControlBar";
import { StandardA4Invoice } from "./invoice/StandardA4Invoice";
import { CompactA4Invoice } from "./invoice/CompactA4Invoice";
import { Thermal80mmReceipt } from "./invoice/Thermal80mmReceipt";

export interface InvoicePrintModalProps {
  invoice: Invoice;
  onClose: () => void;
  initialMode?: "a4" | "compact" | "thermal";
}

/**
 * ইনভয়েস প্রিন্ট ও প্রিভিউ মডাল (Invoice Print & Preview Modal)
 * তিনটি ফরম্যাট (Standard A4, Compact A4, 80mm POS) রেন্ডার করে
 * এবং ডেমো প্রিভিউ টগল সুবিধা প্রদান করে।
 */
export function InvoicePrintModal({
  invoice,
  onClose,
  initialMode = "a4",
}: InvoicePrintModalProps) {
  const [printMode, setPrintMode] = useState<"a4" | "compact" | "thermal">(initialMode);
  const [isDemoData, setIsDemoData] = useState<boolean>(false);

  // Active invoice: use demo data when toggled
  const activeInv = isDemoData ? dummyInvoice : invoice;

  const user = AuthService.getCurrentUser();
  const shopName = user?.shopName || user?.name || "Inventarioya Store";
  const shopAddress = user?.address || "";
  const shopPhone = user?.phone || "";
  const shopEmail = user?.email || "";
  const logoUrl = user?.logoUrl || user?.avatarUrl;
  const personName = extractPersonName(user, shopName);
  const displayCashier =
    activeInv.cashierName &&
    !activeInv.cashierName.toLowerCase().includes("shop") &&
    !activeInv.cashierName.toLowerCase().includes("store") &&
    activeInv.cashierName !== shopName
      ? activeInv.cashierName
      : personName;

  const discountVal = Number(activeInv.discount || 0);
  const subtotalVal = Number(activeInv.subtotal || activeInv.originalSubtotal || 0);

  const discountPercentage = useMemo(() => {
    const explicitPct = (activeInv as any).discountPercent ?? (activeInv as any).discountPercentage;
    if (explicitPct != null && !isNaN(Number(explicitPct)) && Number(explicitPct) > 0) {
      return Number(explicitPct);
    }
    if (subtotalVal > 0 && discountVal > 0) {
      const calculated = (discountVal / subtotalVal) * 100;
      return Math.round(calculated * 10) / 10;
    }
    return 0;
  }, [activeInv, discountVal, subtotalVal]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCsv = () => {
    const rows = (activeInv.items || []).map((it, idx) => ({
      SL: idx + 1,
      InvoiceNumber: activeInv.invoiceNumber,
      ItemName: it.name || it.productName,
      Quantity: it.quantity,
      UnitPrice: it.unitPrice || it.price,
      Discount: it.discount || 0,
      Total: it.totalPrice || it.total,
      Subtotal: activeInv.subtotal,
      GrandTotal: activeInv.grandTotal,
      PaidAmount: activeInv.paidAmount,
      DueAmount: activeInv.dueAmount,
      CustomerName: activeInv.customerName,
      CustomerPhone: activeInv.customerPhone || "N/A",
      Cashier: activeInv.cashierName,
      Date: formatDate(activeInv.createdAt || activeInv.date),
      Status: activeInv.status,
    }));
    downloadCsvFile(rows, `Invoice_${activeInv.invoiceNumber}`);
  };

  const isPaid = activeInv.status === "PAID" || Number(activeInv.dueAmount) <= 0;
  const isPartial = activeInv.status === "PARTIAL" || (Number(activeInv.paidAmount) > 0 && Number(activeInv.dueAmount) > 0);
  const isRefunded = activeInv.status === "REFUNDED" || activeInv.isReturned === "full";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-2 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[96vh] overflow-hidden flex flex-col my-auto">
        {/* Top Control Bar (Hidden on Print) */}
        <InvoiceControlBar
          printMode={printMode}
          setPrintMode={setPrintMode}
          isDemoData={isDemoData}
          setIsDemoData={setIsDemoData}
          onExportCsv={handleExportCsv}
          onPrint={handlePrint}
          onClose={onClose}
        />

        {/* Scrollable Preview Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-950/60 print:p-0 print:bg-white print:overflow-visible">
          {printMode === "a4" ? (
            <StandardA4Invoice
              activeInv={activeInv}
              shopName={shopName}
              shopAddress={shopAddress}
              shopPhone={shopPhone}
              shopEmail={shopEmail}
              logoUrl={logoUrl}
              displayCashier={displayCashier}
              discountVal={discountVal}
              discountPercentage={discountPercentage}
              isPaid={isPaid}
              isPartial={isPartial}
              isRefunded={isRefunded}
            />
          ) : printMode === "compact" ? (
            <CompactA4Invoice
              activeInv={activeInv}
              shopName={shopName}
              shopAddress={shopAddress}
              shopPhone={shopPhone}
              shopEmail={shopEmail}
              logoUrl={logoUrl}
              displayCashier={displayCashier}
              discountVal={discountVal}
              discountPercentage={discountPercentage}
            />
          ) : (
            <Thermal80mmReceipt
              activeInv={activeInv}
              shopName={shopName}
              shopAddress={shopAddress}
              shopPhone={shopPhone}
              shopEmail={shopEmail}
              logoUrl={logoUrl}
              displayCashier={displayCashier}
              discountVal={discountVal}
              discountPercentage={discountPercentage}
            />
          )}
        </div>
      </div>
    </div>
  );
}
