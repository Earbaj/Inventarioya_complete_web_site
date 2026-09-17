"use client";

import { useState } from "react";
import { Invoice } from "@/types";
import { formatCurrency, formatDate, downloadCsvFile } from "@/lib/utils";
import {
  Printer,
  X,
  Download,
  FileText,
  Receipt,
  CheckCircle2,
  AlertCircle,
  Building2,
  User,
  Phone,
} from "lucide-react";

interface InvoicePrintModalProps {
  invoice: Invoice;
  onClose: () => void;
  initialMode?: "a4" | "thermal";
}

export function InvoicePrintModal({
  invoice,
  onClose,
  initialMode = "a4",
}: InvoicePrintModalProps) {
  const [printMode, setPrintMode] = useState<"a4" | "thermal">(initialMode);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCsv = () => {
    const rows = (invoice.items || []).map((it, idx) => ({
      SL: idx + 1,
      InvoiceNumber: invoice.invoiceNumber,
      ItemName: it.name || it.productName,
      Quantity: it.quantity,
      UnitPrice: it.unitPrice || it.price,
      Discount: it.discount || 0,
      Total: it.totalPrice || it.total,
      Subtotal: invoice.subtotal,
      GrandTotal: invoice.grandTotal,
      PaidAmount: invoice.paidAmount,
      DueAmount: invoice.dueAmount,
      CustomerName: invoice.customerName,
      CustomerPhone: invoice.customerPhone || "N/A",
      Cashier: invoice.cashierName,
      Date: formatDate(invoice.createdAt || invoice.date),
      Status: invoice.status,
    }));
    downloadCsvFile(rows, `Invoice_${invoice.invoiceNumber}`);
  };

  const isPaid = invoice.status === "PAID" || Number(invoice.dueAmount) <= 0;
  const isPartial = invoice.status === "PARTIAL" || (Number(invoice.paidAmount) > 0 && Number(invoice.dueAmount) > 0);
  const isRefunded = invoice.status === "REFUNDED" || invoice.isReturned === "full";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-2 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[96vh] overflow-hidden flex flex-col my-auto">
        {/* Top Control Bar (Hidden on Print) */}
        <div className="bg-slate-950 px-4 sm:px-6 py-3.5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 print:hidden shrink-0">
          {/* Format Toggle */}
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setPrintMode("a4")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                printMode === "a4"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Standard A4 Invoice (PDF)</span>
            </button>
            <button
              onClick={() => setPrintMode("thermal")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                printMode === "thermal"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>80mm POS Receipt</span>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCsv}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl border border-slate-700 flex items-center gap-1.5 transition-colors"
              title="Download items as CSV"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow flex items-center gap-2 transition-colors"
              title="Print or save as PDF"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save as PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors ml-1"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Preview Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-950/60 print:p-0 print:bg-white print:overflow-visible">
          {printMode === "a4" ? (
            /* =====================================================================
               A4 STANDARD INVOICE VIEW (PRINTABLE AS PDF)
               ===================================================================== */
            <div
              id="printable-invoice"
              className="bg-white text-slate-900 p-8 sm:p-10 rounded-xl shadow-xl mx-auto max-w-3xl min-h-[700px] text-xs font-sans space-y-6 print:shadow-none print:rounded-none print:p-4 print:max-w-none border border-slate-200 print:border-none"
            >
              {/* Header: Company & Invoice Meta */}
              <div className="border-b-2 border-slate-900 pb-5">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-black flex items-center justify-center text-sm">
                        IY
                      </div>
                      <h1 className="text-xl font-black tracking-tight text-slate-900 uppercase">
                        Dhaka Mega Superstore
                      </h1>
                    </div>
                    <p className="text-[11px] text-slate-600 font-medium mt-1">
                      Powered by Inventarioya Enterprise Cloud POS
                    </p>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Road 27, Dhanmondi, Dhaka-1209 | Phone: +880 1711-223344
                    </p>
                    <p className="text-[10px] text-slate-500">
                      BIN / Tax ID: 001928472-0101 | Email: support@inventarioya.com
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="inline-block bg-slate-900 text-white font-extrabold px-3 py-1 text-[11px] rounded uppercase tracking-wider mb-2">
                      RETAIL TAX INVOICE
                    </span>
                    <div className="text-[11px] text-slate-700 space-y-0.5">
                      <p>
                        <span className="font-semibold text-slate-900">Invoice No:</span>{" "}
                        <span className="font-mono font-bold text-indigo-700">
                          {invoice.invoiceNumber || invoice.invoiceNo}
                        </span>
                      </p>
                      <p>
                        <span className="font-semibold text-slate-900">Date & Time:</span>{" "}
                        {formatDate(invoice.createdAt || invoice.date)}
                      </p>
                      <div className="pt-1 flex items-center justify-end gap-1.5">
                        <span className="font-semibold text-[10px] text-slate-600">Payment:</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold inline-flex items-center gap-1 ${
                            isPaid
                              ? "bg-emerald-100 text-emerald-800"
                              : isPartial
                              ? "bg-amber-100 text-amber-800"
                              : isRefunded
                              ? "bg-purple-100 text-purple-800"
                              : "bg-rose-100 text-rose-800"
                          }`}
                        >
                          {isPaid ? (
                            <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                          ) : (
                            <AlertCircle className="w-3 h-3" />
                          )}
                          {invoice.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Billed To & Served By Info */}
              <div className="grid grid-cols-2 gap-4">
                {/* Customer Box */}
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-1.5 text-slate-500 text-[10px] uppercase font-bold tracking-wider mb-1">
                    <User className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Customer Information (ক্রেতা)</span>
                  </div>
                  <p className="text-sm font-bold text-slate-900">{invoice.customerName}</p>
                  {invoice.customerPhone ? (
                    <p className="text-[11px] text-slate-700 font-mono mt-0.5 flex items-center gap-1">
                      <Phone className="w-3 h-3 text-slate-400" />
                      {invoice.customerPhone}
                    </p>
                  ) : (
                    <p className="text-[10px] text-slate-500 italic mt-0.5">Counter / Walk-in Sale</p>
                  )}
                  {invoice.customerId && invoice.customerId !== "walk-in" && (
                    <p className="text-[9px] text-slate-400 font-mono mt-1">ID: {invoice.customerId}</p>
                  )}
                </div>

                {/* Sales Staff / Branch Box */}
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-right">
                  <div className="flex items-center justify-end gap-1.5 text-slate-500 text-[10px] uppercase font-bold tracking-wider mb-1">
                    <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Store Register & Served By</span>
                  </div>
                  <p className="text-sm font-bold text-slate-900">{invoice.cashierName}</p>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Role: <span className="font-semibold uppercase">{invoice.createdByRole || "Admin"}</span>
                  </p>
                  {invoice.branchName && (
                    <p className="text-[10px] text-indigo-700 font-semibold mt-0.5">
                      Branch: {invoice.branchName}
                    </p>
                  )}
                </div>
              </div>

              {/* Items Line Items Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100 border-b border-slate-200 text-slate-800 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="py-2.5 px-3 text-center w-10">#</th>
                      <th className="py-2.5 px-3">Item Description</th>
                      <th className="py-2.5 px-3 text-right">Unit Price</th>
                      <th className="py-2.5 px-3 text-center">Qty</th>
                      {Number(invoice.discount) > 0 && (
                        <th className="py-2.5 px-3 text-right">Discount</th>
                      )}
                      <th className="py-2.5 px-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-800">
                    {invoice.items.map((item, idx) => {
                      const unitRate = Number(item.unitPrice ?? item.price ?? 0);
                      const lineTotal = Number(
                        item.totalPrice ?? item.total ?? unitRate * item.quantity
                      );
                      const itemDisc = Number(item.discount ?? 0);

                      return (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="py-2 px-3 text-center text-slate-500 font-mono text-[11px]">
                            {idx + 1}
                          </td>
                          <td className="py-2 px-3 font-medium text-slate-900">
                            {item.name || item.productName}
                          </td>
                          <td className="py-2 px-3 text-right font-mono text-slate-700">
                            {formatCurrency(unitRate)}
                          </td>
                          <td className="py-2 px-3 text-center font-bold text-slate-900">
                            {item.quantity}
                          </td>
                          {Number(invoice.discount) > 0 && (
                            <td className="py-2 px-3 text-right text-emerald-700 font-mono">
                              {itemDisc > 0 ? `-${formatCurrency(itemDisc)}` : "-"}
                            </td>
                          )}
                          <td className="py-2 px-3 text-right font-bold font-mono text-slate-900">
                            {formatCurrency(lineTotal)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Bill Financial Calculations & Totals */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pt-2">
                {/* Notes & Payment Method Details */}
                <div className="space-y-2 text-slate-600 text-[11px] max-w-sm">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                    <p className="font-semibold text-slate-800 uppercase text-[10px]">
                      Payment & Terms:
                    </p>
                    <p className="text-[10px]">
                      Method: <span className="font-bold text-slate-900">{invoice.paymentMethod}</span>
                    </p>
                    <p className="text-[10px]">
                      Goods once sold cannot be returned without original printed or digital tax invoice.
                    </p>
                    {invoice.isReturned && invoice.isReturned !== "none" && (
                      <p className="text-[10px] text-amber-700 font-bold">
                        Return Status: {invoice.isReturned.toUpperCase()} (Refunded: {formatCurrency(invoice.totalRefunded || 0)})
                      </p>
                    )}
                  </div>
                </div>

                {/* Totals Table */}
                <div className="w-full sm:w-72 bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal:</span>
                    <span className="font-mono font-medium">{formatCurrency(invoice.subtotal)}</span>
                  </div>

                  {Number(invoice.discount) > 0 && (
                    <div className="flex justify-between text-emerald-700 font-medium">
                      <span>Discount:</span>
                      <span className="font-mono">-{formatCurrency(invoice.discount)}</span>
                    </div>
                  )}

                  {Number(invoice.tax) > 0 && (
                    <div className="flex justify-between text-slate-600">
                      <span>VAT / Tax:</span>
                      <span className="font-mono">{formatCurrency(invoice.tax)}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center text-sm font-black text-slate-900 pt-2 border-t border-slate-300">
                    <span>Net Grand Total:</span>
                    <span className="font-mono text-indigo-700 text-base">
                      {formatCurrency(invoice.grandTotal)}
                    </span>
                  </div>

                  <div className="flex justify-between text-slate-700 pt-1">
                    <span>Paid Amount ({invoice.paymentMethod}):</span>
                    <span className="font-mono font-bold text-emerald-700">
                      {formatCurrency(invoice.paidAmount)}
                    </span>
                  </div>

                  {Number(invoice.dueAmount) > 0 ? (
                    <div className="flex justify-between items-center text-rose-600 font-black pt-1 border-t border-dashed border-rose-200">
                      <span>Outstanding Due (বাকি):</span>
                      <span className="font-mono text-sm">{formatCurrency(invoice.dueAmount)}</span>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center text-emerald-700 font-semibold pt-1 border-t border-dashed border-slate-200 text-[11px]">
                      <span>Due Balance:</span>
                      <span>Cleared (৳0)</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Signature Lines */}
              <div className="pt-12 grid grid-cols-2 gap-8 text-center text-[10px] text-slate-600">
                <div>
                  <div className="border-t border-slate-400 mx-auto w-44 pt-1 font-semibold">
                    Customer Signature
                  </div>
                </div>
                <div>
                  <div className="border-t border-slate-400 mx-auto w-44 pt-1 font-semibold">
                    Authorized Cashier Signature
                  </div>
                </div>
              </div>

              {/* Bottom Copyright */}
              <div className="text-center pt-4 border-t border-slate-200 text-[10px] text-slate-400">
                Thank you for your business! Generated on{" "}
                {new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}.
              </div>
            </div>
          ) : (
            /* =====================================================================
               80MM POS THERMAL RECEIPT VIEW
               ===================================================================== */
            <div className="flex justify-center">
              <div
                id="thermal-receipt"
                className="bg-white text-slate-900 p-6 rounded-xl shadow-xl max-w-xs w-full text-xs font-mono leading-relaxed print:shadow-none print:rounded-none print:p-2"
              >
                {/* Receipt Header */}
                <div className="text-center pb-3 border-b border-dashed border-slate-400">
                  <h2 className="text-sm font-bold tracking-wider uppercase">
                    Dhaka Mega Superstore
                  </h2>
                  <p className="text-[10px] text-slate-600">Road 27, Dhanmondi, Dhaka</p>
                  <p className="text-[10px] text-slate-600">Tel: +880 1711-223344</p>
                  <p className="text-[10px] text-slate-600">BIN: 001928472-0101</p>
                  <p className="text-[10px] font-bold mt-1 bg-slate-100 py-0.5">RETAIL POS RECEIPT</p>
                </div>

                {/* Metadata */}
                <div className="py-2.5 border-b border-dashed border-slate-400 text-[10px] space-y-0.5">
                  <div className="flex justify-between">
                    <span>Invoice:</span>
                    <span className="font-bold">{invoice.invoiceNumber || invoice.invoiceNo}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Date:</span>
                    <span>{formatDate(invoice.createdAt || invoice.date)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Customer:</span>
                    <span className="font-semibold">{invoice.customerName}</span>
                  </div>
                  {invoice.customerPhone && (
                    <div className="flex justify-between">
                      <span>Phone:</span>
                      <span>{invoice.customerPhone}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Cashier:</span>
                    <span>{invoice.cashierName}</span>
                  </div>
                  {invoice.branchName && (
                    <div className="flex justify-between">
                      <span>Branch:</span>
                      <span>{invoice.branchName}</span>
                    </div>
                  )}
                </div>

                {/* Items */}
                <div className="py-2 border-b border-dashed border-slate-400">
                  <table className="w-full text-left text-[10px]">
                    <thead>
                      <tr className="border-b border-slate-300 font-bold">
                        <th className="py-1">Item</th>
                        <th className="py-1 text-center">Qty</th>
                        <th className="py-1 text-right">Rate</th>
                        <th className="py-1 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {invoice.items.map((item, idx) => (
                        <tr key={idx}>
                          <td className="py-1 pr-1 font-sans text-[10px] font-medium leading-tight">
                            {item.name || item.productName}
                          </td>
                          <td className="py-1 text-center">{item.quantity}</td>
                          <td className="py-1 text-right">
                            {formatCurrency(item.unitPrice ?? item.price ?? 0)}
                          </td>
                          <td className="py-1 text-right font-semibold">
                            {formatCurrency(
                              item.totalPrice ??
                                item.total ??
                                Number(item.unitPrice ?? item.price ?? 0) * item.quantity
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Summary */}
                <div className="py-2 border-b border-dashed border-slate-400 space-y-1 text-[10px]">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(invoice.subtotal)}</span>
                  </div>
                  {Number(invoice.discount) > 0 && (
                    <div className="flex justify-between text-emerald-700">
                      <span>Discount:</span>
                      <span>-{formatCurrency(invoice.discount)}</span>
                    </div>
                  )}
                  {Number(invoice.tax) > 0 && (
                    <div className="flex justify-between">
                      <span>Vat / Tax:</span>
                      <span>{formatCurrency(invoice.tax)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-xs font-bold pt-1 border-t border-slate-300">
                    <span>Grand Total:</span>
                    <span>{formatCurrency(invoice.grandTotal)}</span>
                  </div>
                  <div className="flex justify-between pt-0.5">
                    <span>Paid ({invoice.paymentMethod}):</span>
                    <span>{formatCurrency(invoice.paidAmount)}</span>
                  </div>
                  {Number(invoice.dueAmount) > 0 && (
                    <div className="flex justify-between text-rose-600 font-bold">
                      <span>Due Balance:</span>
                      <span>{formatCurrency(invoice.dueAmount)}</span>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="text-center pt-3 space-y-1">
                  <p className="text-[10px] font-bold">Thank you for shopping with us!</p>
                  <p className="text-[9px] text-slate-500">
                    Goods once sold cannot be returned without receipt.
                  </p>
                  <div className="pt-2 text-[8px] tracking-widest text-slate-400 uppercase">
                    * {invoice.invoiceNumber || invoice.invoiceNo} *
                  </div>
                  <p className="text-[8px] text-slate-400">Powered by Inventarioya Cloud POS</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
