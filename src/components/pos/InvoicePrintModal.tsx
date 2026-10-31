"use client";

import { useState } from "react";
import { Invoice } from "@/types";
import { formatCurrency, formatDate, downloadCsvFile, extractPersonName } from "@/lib/utils";
import { AuthService } from "@/lib/api/client";
import {
  Printer,
  X,
  Download,
  FileText,
  Receipt,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

import { useLanguage } from "@/context/LanguageContext";

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
  const { txt, isBangla } = useLanguage();
  const [printMode, setPrintMode] = useState<"a4" | "thermal">(initialMode);

  const user = AuthService.getCurrentUser();
  const shopName = user?.shopName || user?.name || "Inventarioya Store";
  const shopAddress = user?.address || "";
  const shopPhone = user?.phone || "";
  const shopEmail = user?.email || "";
  const logoUrl = user?.logoUrl || user?.avatarUrl;
  const personName = extractPersonName(user, shopName);
  const displayCashier =
    invoice.cashierName &&
    !invoice.cashierName.toLowerCase().includes("shop") &&
    !invoice.cashierName.toLowerCase().includes("store") &&
    invoice.cashierName !== shopName
      ? invoice.cashierName
      : personName;

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
              <span>{txt("স্ট্যান্ডার্ড A4 ইনভয়েস (PDF)", "Standard A4 Invoice (PDF)")}</span>
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
              <span>{txt("৮০মিমি পিওএস রসিদ (Thermal)", "80mm POS Receipt")}</span>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCsv}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl border border-slate-700 flex items-center gap-1.5 transition-colors"
              title={txt("CSV ফাইল ডাউনলোড করুন", "Download items as CSV")}
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">{txt("CSV এক্সপোর্ট", "Export CSV")}</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow flex items-center gap-2 transition-colors"
              title={txt("প্রিন্ট দিন বা PDF সেভ করুন", "Print or save as PDF")}
            >
              <Printer className="w-4 h-4" />
              <span>{txt("প্রিন্ট / PDF সেভ", "Print / Save as PDF")}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors ml-1"
              title={txt("বন্ধ করুন", "Close modal")}
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
                  <div className="flex items-start gap-3.5">
                    {logoUrl && (
                      <img
                        src={logoUrl}
                        alt={shopName}
                        className="w-14 h-14 rounded-lg object-contain border border-slate-200 shrink-0"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = "none";
                        }}
                      />
                    )}
                    <div>
                      <h1 className="text-2xl font-black tracking-tight text-slate-900 uppercase">
                        {shopName}
                      </h1>
                      <p className="text-[11px] text-slate-700 font-semibold mt-0.5">
                        {txt("স্মার্ট ক্লাউড পিওএস ও রিটেল বিলিং", "Smart Cloud POS & Retail Billing")}
                      </p>
                      <p className="text-[11px] text-slate-600 mt-1">
                        {shopAddress || txt("ঢাকা, বাংলাদেশ", "Dhaka, Bangladesh")}
                      </p>
                      <p className="text-[11px] text-slate-600">
                        {txt("মোবাইল:", "Phone:")} {shopPhone || "+880 1700-000000"}
                      </p>
                      {shopEmail && (
                        <p className="text-[10px] text-slate-500">
                          {txt("ইমেইল:", "Email:")} {shopEmail}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="inline-block bg-slate-900 text-white font-extrabold px-3 py-1 text-[11px] rounded uppercase tracking-wider mb-2">
                      {txt("ক্যাশ মেমো ও ইনভয়েস", "RETAIL SALES INVOICE")}
                    </span>
                    <div className="text-[11px] text-slate-700 space-y-0.5">
                      <p>
                        <span className="font-semibold text-slate-900">{txt("ইনভয়েস নং:", "Invoice No:")}</span>{" "}
                        <span className="font-mono font-bold text-indigo-700">
                          {invoice.invoiceNumber || invoice.invoiceNo}
                        </span>
                      </p>
                      <p>
                        <span className="font-semibold text-slate-900">{txt("তারিখ ও সময়:", "Date & Time:")}</span>{" "}
                        {formatDate(invoice.createdAt || invoice.date)}
                      </p>
                      <div className="pt-1 flex items-center justify-end gap-1.5">
                        <span className="font-semibold text-[10px] text-slate-600">{txt("পেমেন্ট স্ট্যাটাস:", "Payment:")}</span>
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
                          {isPaid ? txt("পরিশোধিত", "PAID") : isPartial ? txt("আংশিক জমা", "PARTIAL") : txt("বকেয়া", "DUE")}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Customer & Register Information - Structured Table matching Customer Ledger */}
              <table className="w-full text-left text-xs border-collapse border border-slate-900">
                <tbody>
                  <tr>
                    <td className="w-1/6 bg-slate-100 font-bold uppercase text-[10px] text-slate-900 px-3 py-2 border border-slate-900">
                      {txt("ক্রেতার নাম:", "Customer Name:")}
                    </td>
                    <td className="w-2/6 font-bold text-slate-900 text-xs px-3 py-2 border border-slate-900">
                      {invoice.customerName}
                    </td>
                    <td className="w-1/6 bg-slate-100 font-bold uppercase text-[10px] text-slate-900 px-3 py-2 border border-slate-900">
                      {txt("ফোন নম্বর:", "Phone Number:")}
                    </td>
                    <td className="w-2/6 font-mono font-medium text-slate-900 px-3 py-2 border border-slate-900">
                      {invoice.customerPhone || txt("কাউন্টার / সাধারণ ক্রেতা", "Walk-in Customer")}
                    </td>
                  </tr>
                  <tr>
                    <td className="bg-slate-100 font-bold uppercase text-[10px] text-slate-900 px-3 py-2 border border-slate-900">
                      {txt("ক্যাশিয়ার / স্টাফ:", "Served By:")}
                    </td>
                    <td className="font-medium text-slate-900 text-xs px-3 py-2 border border-slate-900">
                      <span className="font-bold">{displayCashier}</span>
                      <span className="text-[10px] text-slate-600 font-normal ml-1">
                        ({invoice.createdByRole || "Admin"})
                      </span>
                    </td>
                    <td className="bg-slate-100 font-bold uppercase text-[10px] text-slate-900 px-3 py-2 border border-slate-900">
                      {txt("শাখা / কাউন্টার:", "Branch / Outlet:")}
                    </td>
                    <td className="font-medium text-slate-900 px-3 py-2 border border-slate-900">
                      {invoice.branchName || txt("মূল সেলস কাউন্টার", "Main POS Counter")}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Items Line Items Table */}
              <table className="w-full text-left text-xs border-collapse border border-slate-900">
                <thead className="bg-slate-100 border-b border-slate-900 text-slate-900 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="py-2 px-3 text-center w-10 border border-slate-900">#</th>
                    <th className="py-2 px-3 border border-slate-900">{txt("পণ্যের বিবরণ", "Item Description")}</th>
                    <th className="py-2 px-3 text-right border border-slate-900">{txt("একক দর", "Unit Price")}</th>
                    <th className="py-2 px-3 text-center border border-slate-900">{txt("পরিমাণ", "Qty")}</th>
                    {Number(invoice.discount) > 0 && (
                      <th className="py-2 px-3 text-right border border-slate-900">{txt("ছাড়", "Discount")}</th>
                    )}
                    <th className="py-2 px-3 text-right border border-slate-900">{txt("মোট মূল্য", "Total")}</th>
                  </tr>
                </thead>
                <tbody className="text-slate-800">
                  {invoice.items.map((item, idx) => {
                    const unitRate = Number(item.unitPrice ?? item.price ?? 0);
                    const lineTotal = Number(
                      item.totalPrice ?? item.total ?? unitRate * item.quantity
                    );
                    const itemDisc = Number(item.discount ?? 0);

                    return (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="py-2 px-3 text-center text-slate-600 font-mono text-[11px] border border-slate-300">
                          {idx + 1}
                        </td>
                        <td className="py-2 px-3 font-medium text-slate-900 border border-slate-300">
                          {item.name || item.productName}
                        </td>
                        <td className="py-2 px-3 text-right font-mono text-slate-700 border border-slate-300">
                          {formatCurrency(unitRate)}
                        </td>
                        <td className="py-2 px-3 text-center font-bold text-slate-900 border border-slate-300">
                          {item.quantity}
                        </td>
                        {Number(invoice.discount) > 0 && (
                          <td className="py-2 px-3 text-right text-emerald-700 font-mono border border-slate-300">
                            {itemDisc > 0 ? `-${formatCurrency(itemDisc)}` : "-"}
                          </td>
                        )}
                        <td className="py-2 px-3 text-right font-bold font-mono text-slate-900 border border-slate-300">
                          {formatCurrency(lineTotal)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Bill Financial Calculations & Totals */}
              <div className="pt-2 flex flex-col sm:flex-row justify-between items-start gap-4">
                {/* Left side: Payment Info & Terms/Notes */}
                <div className="w-full sm:w-1/2 space-y-3">
                  <div className="border border-slate-900 rounded-lg p-3 bg-slate-50 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold uppercase text-[10px] text-slate-600 tracking-wider">
                        {txt("পেমেন্ট মাধ্যম:", "Payment Method:")}
                      </span>
                      <span className="font-black uppercase text-slate-900 bg-white border border-slate-300 px-2 py-0.5 rounded text-[11px]">
                        {invoice.paymentMethod || "CASH"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold uppercase text-[10px] text-slate-600 tracking-wider">
                        {txt("পেমেন্ট স্ট্যাটাস:", "Payment Status:")}
                      </span>
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
                        {isPaid ? txt("পরিশোধিত", "PAID") : isPartial ? txt("আংশিক জমা", "PARTIAL") : txt("বকেয়া", "DUE")}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 bg-white border border-slate-300 rounded-lg text-[10px] text-slate-500 space-y-1">
                    <p className="font-bold text-slate-700 uppercase tracking-wider">{txt("শর্তাবলী / নোট:", "Terms & Conditions:")}</p>
                    <p>{txt("• বিক্রিত পণ্য ৭ দিনের মধ্যে ক্যাশ মেমো সহ পরিবর্তনযোগ্য।", "• Goods once sold can be exchanged within 7 days with invoice.")}</p>
                    <p>{txt("• ব্যবহারের পর বা ক্ষতিগ্রস্ত পণ্য ফেরত নেওয়া হয় না।", "• Damaged or used items are not eligible for exchange/refund.")}</p>
                  </div>
                </div>

                {/* Right side: Row-by-row Financial Breakdown */}
                <div className="w-full sm:w-1/2 sm:max-w-md ml-auto">
                  <div className="border border-slate-900 rounded-lg overflow-hidden text-xs">
                    {/* Row 1: Subtotal */}
                    <div className="flex justify-between items-center px-4 py-2 bg-slate-50 border-b border-slate-200">
                      <span className="font-bold text-slate-700">{txt("সাবটোটাল:", "Subtotal:")}</span>
                      <span className="font-mono font-bold text-slate-900 text-sm">
                        {formatCurrency(invoice.subtotal)}
                      </span>
                    </div>

                    {/* Row 2: Discount */}
                    <div className="flex justify-between items-center px-4 py-2 bg-white border-b border-slate-200">
                      <span className="font-bold text-emerald-700">{txt("ছাড় / ডিসকাউন্ট:", "Discount:")}</span>
                      <span className="font-mono font-bold text-emerald-700 text-sm">
                        {Number(invoice.discount) > 0 ? `-${formatCurrency(invoice.discount)}` : "৳ 0"}
                      </span>
                    </div>

                    {/* Row 3: Net Grand Total */}
                    <div className="flex justify-between items-center px-4 py-2.5 bg-slate-100 border-b-2 border-slate-900">
                      <span className="font-black text-slate-900 uppercase text-[11px] tracking-wide">
                        {txt("সর্বমোট বিল:", "Net Grand Total:")}
                      </span>
                      <span className="font-mono font-black text-indigo-700 text-lg">
                        {formatCurrency(invoice.grandTotal)}
                      </span>
                    </div>

                    {/* Row 4: Paid Amount */}
                    <div className="flex justify-between items-center px-4 py-2 bg-white border-b border-slate-200">
                      <span className="font-bold text-slate-700">{txt("পরিশোধিত টাকা:", "Paid Amount:")}</span>
                      <span className="font-mono font-bold text-emerald-700 text-sm">
                        {formatCurrency(invoice.paidAmount)}
                      </span>
                    </div>

                    {/* Row 5: Due Balance */}
                    <div className="flex justify-between items-center px-4 py-2 bg-slate-50">
                      <span className="font-bold text-slate-700">{txt("বকেয়া ব্যালেন্স (বাকি):", "Due Balance:")}</span>
                      {Number(invoice.dueAmount) > 0 ? (
                        <span className="font-mono font-black text-rose-600 text-sm">
                          {formatCurrency(invoice.dueAmount)}
                        </span>
                      ) : (
                        <span className="font-bold text-emerald-700 text-xs bg-emerald-100 px-2 py-0.5 rounded">
                          {txt("বাকি নেই (৳ 0)", "Cleared (৳ 0)")}
                        </span>
                      )}
                    </div>

                    {/* Optional: Change Return */}
                    {Number(invoice.paidAmount) > Number(invoice.grandTotal) && (
                      <div className="flex justify-between items-center px-4 py-1.5 bg-blue-50 border-t border-blue-200 text-blue-800">
                        <span className="font-bold text-[11px]">{txt("ফেরত দিন (Change):", "Change Return:")}</span>
                        <span className="font-mono font-black text-xs">
                          {formatCurrency(Number(invoice.paidAmount) - Number(invoice.grandTotal))}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Signature Lines */}
              <div className="pt-12 grid grid-cols-2 gap-8 text-center text-[10px] text-slate-600">
                <div>
                  <div className="border-t border-slate-400 mx-auto w-44 pt-1 font-semibold">
                    {txt("ক্রেতার স্বাক্ষর", "Customer Signature")}
                  </div>
                </div>
                <div>
                  <div className="border-t border-slate-400 mx-auto w-44 pt-1 font-semibold">
                    {txt("কর্তৃপক্ষের স্বাক্ষর", "Authorized Cashier Signature")}
                  </div>
                </div>
              </div>

              {/* Bottom Copyright */}
              <div className="text-center pt-4 border-t border-slate-200 text-[10px] text-slate-400">
                {txt("আমাদের সাথে কেনাকাটা করার জন্য ধন্যবাদ!", "Thank you for your business!")}{" "}
                {txt("তারিখ:", "Generated on")}{" "}
                {new Date().toLocaleDateString(isBangla ? "bn-BD" : "en-GB", { day: "2-digit", month: "short", year: "numeric" })}.
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
                  {logoUrl && (
                    <img
                      src={logoUrl}
                      alt={shopName}
                      className="w-10 h-10 mx-auto object-contain mb-1"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                  )}
                  <h2 className="text-sm font-bold tracking-wider uppercase">
                    {shopName}
                  </h2>
                  <p className="text-[10px] text-slate-600">{shopAddress || txt("ঢাকা, বাংলাদেশ", "Dhaka, Bangladesh")}</p>
                  <p className="text-[10px] text-slate-600">{txt("ফোন:", "Tel:")} {shopPhone || "+880 1700-000000"}</p>
                  {shopEmail && <p className="text-[9px] text-slate-500">{txt("ইমেইল:", "Email:")} {shopEmail}</p>}
                  <p className="text-[10px] font-bold mt-1 bg-slate-100 py-0.5">{txt("ক্যাশ রসিদ ও মেমো", "RETAIL POS RECEIPT")}</p>
                </div>

                {/* Metadata */}
                <div className="py-2.5 border-b border-dashed border-slate-400 text-[10px] space-y-0.5">
                  <div className="flex justify-between">
                    <span>{txt("ইনভয়েস:", "Invoice:")}</span>
                    <span className="font-bold">{invoice.invoiceNumber || invoice.invoiceNo}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{txt("তারিখ:", "Date:")}</span>
                    <span>{formatDate(invoice.createdAt || invoice.date)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{txt("কাস্টমার:", "Customer:")}</span>
                    <span className="font-semibold">{invoice.customerName}</span>
                  </div>
                  {invoice.customerPhone && (
                    <div className="flex justify-between">
                      <span>{txt("মোবাইল:", "Phone:")}</span>
                      <span>{invoice.customerPhone}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>{txt("ক্যাশিয়ার:", "Cashier:")}</span>
                    <span>{displayCashier}</span>
                  </div>
                  {invoice.branchName && (
                    <div className="flex justify-between">
                      <span>{txt("শাখা:", "Branch:")}</span>
                      <span>{invoice.branchName}</span>
                    </div>
                  )}
                </div>

                {/* Items */}
                <div className="py-2 border-b border-dashed border-slate-400">
                  <table className="w-full text-left text-[10px]">
                    <thead>
                      <tr className="border-b border-slate-300 font-bold">
                        <th className="py-1">{txt("পণ্য", "Item")}</th>
                        <th className="py-1 text-center">{txt("পরিমাণ", "Qty")}</th>
                        <th className="py-1 text-right">{txt("দর", "Rate")}</th>
                        <th className="py-1 text-right">{txt("মোট", "Total")}</th>
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
                    <span>{txt("সাবটোটাল:", "Subtotal:")}</span>
                    <span>{formatCurrency(invoice.subtotal)}</span>
                  </div>
                  {Number(invoice.discount) > 0 && (
                    <div className="flex justify-between text-emerald-700">
                      <span>{txt("ছাড় / ডিসকাউন্ট:", "Discount:")}</span>
                      <span>-{formatCurrency(invoice.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-xs font-bold pt-1 border-t border-slate-300">
                    <span>{txt("সর্বমোট বিল:", "Grand Total:")}</span>
                    <span>{formatCurrency(invoice.grandTotal)}</span>
                  </div>
                  <div className="flex justify-between pt-0.5">
                    <span>{txt(`জমা (${invoice.paymentMethod}):`, `Paid (${invoice.paymentMethod}):`)}</span>
                    <span>{formatCurrency(invoice.paidAmount)}</span>
                  </div>
                  {Number(invoice.dueAmount) > 0 && (
                    <div className="flex justify-between text-rose-600 font-bold">
                      <span>{txt("বকেয়া বাকি:", "Due Balance:")}</span>
                      <span>{formatCurrency(invoice.dueAmount)}</span>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="text-center pt-3 space-y-1">
                  <p className="text-[10px] font-bold">{txt("আমাদের সাথে কেনাকাটা করার জন্য ধন্যবাদ!", "Thank you for shopping with us!")}</p>
                  <p className="text-[9px] text-slate-500">
                    {txt("রসিদ ছাড়া বিক্রিত পণ্য ফেরতযোগ্য নহে।", "Goods once sold cannot be returned without receipt.")}
                  </p>
                  <div className="pt-2 text-[8px] tracking-widest text-slate-400 uppercase">
                    * {invoice.invoiceNumber || invoice.invoiceNo} *
                  </div>
                  <p className="text-[8px] text-slate-400">{txt("পাওয়ার্ড বাই Inventarioya ক্লাউড পিওএস", "Powered by Inventarioya Cloud POS")}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
