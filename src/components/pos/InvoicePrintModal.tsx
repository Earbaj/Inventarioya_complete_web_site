"use client";

import { useState, useMemo } from "react";
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
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";

import { useLanguage } from "@/context/LanguageContext";

interface InvoicePrintModalProps {
  invoice: Invoice;
  onClose: () => void;
  initialMode?: "a4" | "compact" | "thermal";
}

// Sample dummy invoice data for live format previews
const dummyInvoice: Invoice = {
  id: "demo-inv-001",
  invoiceNumber: "INV-20261101-0082",
  customerName: "আব্দুর রহিম (Rahim Traders)",
  customerPhone: "01712-345678",
  cashierName: "মোঃ ইমরান হোসেন",
  createdAt: new Date().toISOString(),
  date: new Date().toISOString(),
  branchName: "ঢাকা প্রধান শাখা (Main Branch)",
  subtotal: 3000,
  discount: 600,
  tax: 0,
  grandTotal: 2400,
  paidAmount: 2400,
  dueAmount: 0,
  paymentMethod: "CASH",
  status: "PAID",
  items: [
    {
      itemId: "d1",
      name: "প্রিমিয়াম বাসমতি চাল (Basmati Rice 5kg)",
      quantity: 2,
      unitPrice: 650,
      discount: 0,
      totalPrice: 1300,
    },
    {
      itemId: "d2",
      name: "সয়াবিন তেল বোতল (Pure Soybean Oil 5L)",
      quantity: 1,
      unitPrice: 950,
      discount: 0,
      totalPrice: 950,
    },
    {
      itemId: "d3",
      name: "স্পেশাল মসলা গুঁড়া প্যাক (Mixed Spices 500g)",
      quantity: 3,
      unitPrice: 250,
      discount: 0,
      totalPrice: 750,
    },
  ],
};

export function InvoicePrintModal({
  invoice,
  onClose,
  initialMode = "a4",
}: InvoicePrintModalProps) {
  const { txt, isBangla } = useLanguage();
  const [printMode, setPrintMode] = useState<"a4" | "compact" | "thermal">(initialMode);
  const [isDemoData, setIsDemoData] = useState<boolean>(false);

  // Active invoice: use demo data when toggled or fallback if invoice has no items
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
        <div className="bg-slate-950 px-4 sm:px-6 py-3.5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 print:hidden shrink-0">
          {/* Format Toggle with 3 Formats */}
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setPrintMode("a4")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                printMode === "a4"
                  ? "bg-indigo-600 text-white shadow-sm font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{txt("স্ট্যান্ডার্ড A4", "Standard A4")}</span>
            </button>

            <button
              type="button"
              onClick={() => setPrintMode("compact")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                printMode === "compact"
                  ? "bg-indigo-600 text-white shadow-sm font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>{txt("কম্প্যাক্ট A4", "Compact A4")}</span>
            </button>

            <button
              type="button"
              onClick={() => setPrintMode("thermal")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                printMode === "thermal"
                  ? "bg-indigo-600 text-white shadow-sm font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>{txt("৮০মিমি পিওএস", "80mm POS")}</span>
            </button>
          </div>

          {/* Action Buttons & Dummy Data Toggle */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsDemoData(!isDemoData)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all border cursor-pointer ${
                isDemoData
                  ? "bg-amber-400 border-amber-300 text-black font-extrabold shadow-sm"
                  : "bg-slate-800 border-slate-700 text-slate-300 hover:text-white"
              }`}
              title={txt("ডামি ডাটা দিয়ে প্রিভিউ টেস্ট করুন", "Toggle dummy sample preview")}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isDemoData ? txt("ডেমো ডাটা অন", "Demo Preview ON") : txt("ডেমো প্রিভিউ", "Demo Preview")}</span>
            </button>

            <button
              onClick={handleExportCsv}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
              title={txt("CSV ফাইল ডাউনলোড করুন", "Download items as CSV")}
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">{txt("CSV এক্সপোর্ট", "Export CSV")}</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow flex items-center gap-2 transition-colors cursor-pointer"
              title={txt("প্রিন্ট দিন বা PDF সেভ করুন", "Print or save as PDF")}
            >
              <Printer className="w-4 h-4" />
              <span>{txt("প্রিন্ট / PDF সেভ", "Print / Save as PDF")}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors ml-1 cursor-pointer"
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
                          {activeInv.invoiceNumber || activeInv.invoiceNo}
                        </span>
                      </p>
                      <p>
                        <span className="font-semibold text-slate-900">{txt("তারিখ ও সময়:", "Date & Time:")}</span>{" "}
                        {formatDate(activeInv.createdAt || activeInv.date)}
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
                      {activeInv.customerName}
                    </td>
                    <td className="w-1/6 bg-slate-100 font-bold uppercase text-[10px] text-slate-900 px-3 py-2 border border-slate-900">
                      {txt("ফোন নম্বর:", "Phone Number:")}
                    </td>
                    <td className="w-2/6 font-mono font-medium text-slate-900 px-3 py-2 border border-slate-900">
                      {activeInv.customerPhone || txt("কাউন্টার / সাধারণ ক্রেতা", "Walk-in Customer")}
                    </td>
                  </tr>
                  <tr>
                    <td className="bg-slate-100 font-bold uppercase text-[10px] text-slate-900 px-3 py-2 border border-slate-900">
                      {txt("ক্যাশিয়ার / স্টাফ:", "Served By:")}
                    </td>
                    <td className="font-medium text-slate-900 text-xs px-3 py-2 border border-slate-900">
                      <span className="font-bold">{displayCashier}</span>
                      <span className="text-[10px] text-slate-600 font-normal ml-1">
                        ({activeInv.createdByRole || "Admin"})
                      </span>
                    </td>
                    <td className="bg-slate-100 font-bold uppercase text-[10px] text-slate-900 px-3 py-2 border border-slate-900">
                      {txt(" শাখা / কাউন্টার:", "Branch / Outlet:")}
                    </td>
                    <td className="font-medium text-slate-900 px-3 py-2 border border-slate-900">
                      {activeInv.branchName || txt("মূল সেলস কাউন্টার", "Main POS Counter")}
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
                    {Number(activeInv.discount) > 0 && (
                      <th className="py-2 px-3 text-right border border-slate-900">{txt("ছাড়", "Discount")}</th>
                    )}
                    <th className="py-2 px-3 text-right border border-slate-900">{txt("মোট মূল্য", "Total")}</th>
                  </tr>
                </thead>
                <tbody className="text-slate-800">
                  {activeInv.items.map((item, idx) => {
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
                        {Number(activeInv.discount) > 0 && (
                          <td className="py-2 px-3 text-right text-emerald-700 font-mono border border-slate-300">
                            {itemDisc > 0 ? (
                              <span>
                                -{formatCurrency(itemDisc)}
                                {(() => {
                                  const itemPct =
                                    (item as any).discountPercent ||
                                    (item.discountType === "percent" || item.discountType === "percentage"
                                      ? Number(item.discount)
                                      : unitRate * item.quantity > 0
                                      ? Math.round((itemDisc / (unitRate * item.quantity)) * 100 * 10) / 10
                                      : 0);
                                  return itemPct > 0 ? ` (${itemPct}%)` : "";
                                })()}
                              </span>
                            ) : (
                              "-"
                            )}
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

              {/* Bill Financial Calculations & Totals (Full Width matching Items Table) */}
              <div className="w-full">
                <table className="w-full text-left text-xs border-collapse border border-slate-900">
                  <tbody className="text-slate-900">
                    {/* Row 1: Subtotal */}
                    <tr className="border-b border-slate-200">
                      <td className="py-2 px-3 font-medium text-slate-900 bg-slate-50 w-1/2">
                        {txt("সাবটোটাল:", "Subtotal:")}
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                        {formatCurrency(activeInv.subtotal)}
                      </td>
                    </tr>

                    {/* Row 2: Discount */}
                    <tr className="border-b border-slate-200">
                      <td className="py-2 px-3 font-medium text-slate-900 bg-white">
                        {txt("ছাড় / ডিসকাউন্ট:", "Discount:")}
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-emerald-700">
                        {discountVal > 0 ? (
                          <span>
                            -{formatCurrency(discountVal)}
                            {discountPercentage > 0 && (
                              <span className="ml-1 text-[11px] font-semibold text-emerald-700">
                                ({discountPercentage}%)
                              </span>
                            )}
                          </span>
                        ) : (
                          "৳ 0"
                        )}
                      </td>
                    </tr>

                    {/* Row 3: Net Grand Total */}
                    <tr className="border-b-2 border-slate-900 bg-slate-100 font-bold">
                      <td className="py-2 px-3 font-bold text-slate-900 uppercase text-[11px] tracking-wide">
                        {txt("সর্বমোট বিল:", "Net Grand Total:")}
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                        {formatCurrency(activeInv.grandTotal)}
                      </td>
                    </tr>

                    {/* Row 4: Paid Amount */}
                    <tr className="border-b border-slate-200">
                      <td className="py-2 px-3 font-medium text-slate-900 bg-white">
                        {txt("পরিশোধিত টাকা:", "Paid Amount:")}
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-emerald-700">
                        {formatCurrency(activeInv.paidAmount)}
                      </td>
                    </tr>

                    {/* Row 5: Due Balance */}
                    <tr className="bg-slate-50">
                      <td className="py-2 px-3 font-medium text-slate-900">
                        {txt("বকেয়া ব্যালেন্স (বাকি):", "Due Balance:")}
                      </td>
                      <td className="py-2 px-3 text-right">
                        {Number(activeInv.dueAmount) > 0 ? (
                          <span className="font-mono font-bold text-rose-600">
                            {formatCurrency(activeInv.dueAmount)}
                          </span>
                        ) : (
                          <span className="font-bold text-emerald-700 text-xs bg-emerald-100 px-2 py-0.5 rounded inline-block">
                            {txt("বাকি নেই (৳ 0)", "Cleared (৳ 0)")}
                          </span>
                        )}
                      </td>
                    </tr>

                    {/* Optional: Change Return */}
                    {Number(activeInv.paidAmount) > Number(activeInv.grandTotal) && (
                      <tr className="bg-blue-50 border-t border-blue-200 text-blue-900">
                        <td className="py-1.5 px-3 font-medium text-[11px]">
                          {txt("ফেরত দিন (Change):", "Change Return:")}
                        </td>
                        <td className="py-1.5 px-3 text-right font-mono font-bold text-xs">
                          {formatCurrency(Number(activeInv.paidAmount) - Number(activeInv.grandTotal))}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
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
          ) : printMode === "compact" ? (
            /* =====================================================================
               A4 COMPACT INVOICE VIEW (PRINTABLE AS PDF)
               - Smaller font & reduced padding for space efficiency
               - Compact 4-column customer meta strip
               - Financial totals: Subtotal, Discount (with percentage), Grand Total ONLY
               - "Paid Amount" and "Due Balance" rows completely removed
               - "Thank you for your business!" footer line completely removed
               ===================================================================== */
            <div
              id="printable-compact-invoice"
              className="bg-white text-slate-900 p-6 sm:p-8 rounded-xl shadow-xl mx-auto max-w-3xl text-[11px] font-sans space-y-4 print:shadow-none print:rounded-none print:p-2 print:max-w-none border border-slate-200 print:border-none"
            >
              {/* Header: Company & Compact Invoice Meta */}
              <div className="border-b-2 border-slate-900 pb-3 flex justify-between items-start gap-4">
                <div className="flex items-start gap-2.5">
                  {logoUrl && (
                    <img
                      src={logoUrl}
                      alt={shopName}
                      className="w-11 h-11 rounded-lg object-contain border border-slate-200 shrink-0"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                  )}
                  <div>
                    <h1 className="text-xl font-black tracking-tight text-slate-900 uppercase">
                      {shopName}
                    </h1>
                    <p className="text-[10px] text-slate-600 mt-0.5">
                      {shopAddress || txt("ঢাকা, বাংলাদেশ", "Dhaka, Bangladesh")} • {txt("ফোন:", "Tel:")} {shopPhone || "+880 1700-000000"}
                    </p>
                    {shopEmail && (
                      <p className="text-[9px] text-slate-500">
                        {txt("ইমেইল:", "Email:")} {shopEmail}
                      </p>
                    )}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="inline-block bg-slate-900 text-white font-black px-2 py-0.5 text-[9px] rounded uppercase tracking-wider mb-1">
                    {txt("কম্প্যাক্ট ইনভয়েস", "COMPACT SALES INVOICE")}
                  </span>
                  <div className="text-[10px] text-slate-700 space-y-0.5">
                    <p>
                      <span className="font-semibold text-slate-900">{txt("ইনভয়েস:", "Inv:")}</span>{" "}
                      <span className="font-mono font-bold text-indigo-700">
                        {activeInv.invoiceNumber || activeInv.invoiceNo}
                      </span>
                    </p>
                    <p>
                      <span className="font-semibold text-slate-900">{txt("তারিখ:", "Date:")}</span>{" "}
                      {formatDate(activeInv.createdAt || activeInv.date)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Customer & Register Info: Compact Strip */}
              <div className="bg-slate-50 border border-slate-300 rounded-lg p-2.5 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px]">
                <div>
                  <span className="text-slate-500 block uppercase font-bold text-[8.5px] tracking-wide">
                    {txt("ক্রেতার নাম", "Customer Name")}
                  </span>
                  <span className="font-bold text-slate-900 truncate block">
                    {activeInv.customerName || txt("সাধারণ ক্রেতা", "Walk-in")}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block uppercase font-bold text-[8.5px] tracking-wide">
                    {txt("ফোন নম্বর", "Phone Number")}
                  </span>
                  <span className="font-mono font-medium text-slate-900 truncate block">
                    {activeInv.customerPhone || "N/A"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block uppercase font-bold text-[8.5px] tracking-wide">
                    {txt("ক্যাশিয়ার / স্টাফ", "Served By")}
                  </span>
                  <span className="font-medium text-slate-900 truncate block">
                    {displayCashier}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block uppercase font-bold text-[8.5px] tracking-wide">
                    {txt("কাউন্টার / শাখা", "Branch / Outlet")}
                  </span>
                  <span className="font-medium text-slate-900 truncate block">
                    {activeInv.branchName || txt("মূল কাউন্টার", "Main Counter")}
                  </span>
                </div>
              </div>

              {/* Items Table (Tight padding, smaller font) */}
              <table className="w-full text-left text-[10.5px] border-collapse border border-slate-900">
                <thead className="bg-slate-100 border-b border-slate-900 text-slate-900 font-bold uppercase text-[9.5px]">
                  <tr>
                    <th className="py-1.5 px-2.5 text-center w-8 border border-slate-900">#</th>
                    <th className="py-1.5 px-2.5 border border-slate-900">{txt("পণ্যের বিবরণ", "Item Description")}</th>
                    <th className="py-1.5 px-2.5 text-right border border-slate-900">{txt("একক দর", "Rate")}</th>
                    <th className="py-1.5 px-2.5 text-center border border-slate-900">{txt("পরিমাণ", "Qty")}</th>
                    {Number(activeInv.discount) > 0 && (
                      <th className="py-1.5 px-2.5 text-right border border-slate-900">{txt("ছাড়", "Discount")}</th>
                    )}
                    <th className="py-1.5 px-2.5 text-right border border-slate-900">{txt("মোট মূল্য", "Total")}</th>
                  </tr>
                </thead>
                <tbody className="text-slate-800">
                  {activeInv.items.map((item, idx) => {
                    const unitRate = Number(item.unitPrice ?? item.price ?? 0);
                    const lineTotal = Number(
                      item.totalPrice ?? item.total ?? unitRate * item.quantity
                    );
                    const itemDisc = Number(item.discount ?? 0);

                    return (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="py-1.5 px-2.5 text-center text-slate-600 font-mono text-[10px] border border-slate-300">
                          {idx + 1}
                        </td>
                        <td className="py-1.5 px-2.5 font-medium text-slate-900 border border-slate-300">
                          {item.name || item.productName}
                        </td>
                        <td className="py-1.5 px-2.5 text-right font-mono text-slate-700 border border-slate-300">
                          {formatCurrency(unitRate)}
                        </td>
                        <td className="py-1.5 px-2.5 text-center font-bold text-slate-900 border border-slate-300">
                          {item.quantity}
                        </td>
                        {Number(activeInv.discount) > 0 && (
                          <td className="py-1.5 px-2.5 text-right text-emerald-700 font-mono border border-slate-300">
                            {itemDisc > 0 ? (
                              <span>
                                -{formatCurrency(itemDisc)}
                                {(() => {
                                  const itemPct =
                                    (item as any).discountPercent ||
                                    (item.discountType === "percent" || item.discountType === "percentage"
                                      ? Number(item.discount)
                                      : unitRate * item.quantity > 0
                                      ? Math.round((itemDisc / (unitRate * item.quantity)) * 100 * 10) / 10
                                      : 0);
                                  return itemPct > 0 ? ` (${itemPct}%)` : "";
                                })()}
                              </span>
                            ) : (
                              "-"
                            )}
                          </td>
                        )}
                        <td className="py-1.5 px-2.5 text-right font-bold font-mono text-slate-900 border border-slate-300">
                          {formatCurrency(lineTotal)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Bill Financial Calculations & Totals (ONLY Subtotal, Discount, Grand Total) */}
              <div className="w-full">
                <table className="w-full text-left text-[11px] border-collapse border border-slate-900">
                  <tbody className="text-slate-900">
                    {/* Row 1: Subtotal */}
                    <tr className="border-b border-slate-200">
                      <td className="py-1.5 px-3 font-medium text-slate-800 bg-slate-50 w-1/2">
                        {txt("সাবটোটাল:", "Subtotal:")}
                      </td>
                      <td className="py-1.5 px-3 text-right font-mono font-bold text-slate-900">
                        {formatCurrency(activeInv.subtotal)}
                      </td>
                    </tr>

                    {/* Row 2: Discount */}
                    <tr className="border-b border-slate-200">
                      <td className="py-1.5 px-3 font-medium text-slate-800 bg-white">
                        {txt("ছাড় / ডিসকাউন্ট:", "Discount:")}
                      </td>
                      <td className="py-1.5 px-3 text-right font-mono font-bold text-emerald-700">
                        {discountVal > 0 ? (
                          <span>
                            -{formatCurrency(discountVal)}
                            {discountPercentage > 0 && (
                              <span className="ml-1 text-[10px] font-semibold text-emerald-700">
                                ({discountPercentage}%)
                              </span>
                            )}
                          </span>
                        ) : (
                          "৳ 0"
                        )}
                      </td>
                    </tr>

                    {/* Row 3: Net Grand Total (Final Row in Compact) */}
                    <tr className="border-b-2 border-slate-900 bg-slate-100 font-bold">
                      <td className="py-2 px-3 font-bold text-slate-900 uppercase text-[11px] tracking-wide">
                        {txt("সর্বমোট বিল:", "Net Grand Total:")}
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-base text-slate-900">
                        {formatCurrency(activeInv.grandTotal)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Signature Lines (Compact, no thank you line) */}
              <div className="pt-8 pb-2 grid grid-cols-2 gap-8 text-center text-[9.5px] text-slate-500">
                <div>
                  <div className="border-t border-slate-400 mx-auto w-36 pt-1 font-semibold">
                    {txt("ক্রেতার স্বাক্ষর", "Customer Signature")}
                  </div>
                </div>
                <div>
                  <div className="border-t border-slate-400 mx-auto w-36 pt-1 font-semibold">
                    {txt("কর্তৃপক্ষের স্বাক্ষর", "Authorized Signature")}
                  </div>
                </div>
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
                    <span className="font-bold">{activeInv.invoiceNumber || activeInv.invoiceNo}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{txt("তারিখ:", "Date:")}</span>
                    <span>{formatDate(activeInv.createdAt || activeInv.date)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{txt("কাস্টমার:", "Customer:")}</span>
                    <span className="font-semibold">{activeInv.customerName}</span>
                  </div>
                  {activeInv.customerPhone && (
                    <div className="flex justify-between">
                      <span>{txt("মোবাইল:", "Phone:")}</span>
                      <span>{activeInv.customerPhone}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>{txt("ক্যাশিয়ার:", "Cashier:")}</span>
                    <span>{displayCashier}</span>
                  </div>
                  {activeInv.branchName && (
                    <div className="flex justify-between">
                      <span>{txt("শাখা:", "Branch:")}</span>
                      <span>{activeInv.branchName}</span>
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
                      {activeInv.items.map((item, idx) => (
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
                    <span>{formatCurrency(activeInv.subtotal)}</span>
                  </div>
                  {discountVal > 0 && (
                    <div className="flex justify-between text-emerald-700">
                      <span>{txt("ছাড় / ডিসকাউন্ট:", "Discount:")}</span>
                      <span>
                        -{formatCurrency(discountVal)}
                        {discountPercentage > 0 && ` (${discountPercentage}%)`}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-xs font-bold pt-1 border-t border-slate-300">
                    <span>{txt("সর্বমোট বিল:", "Grand Total:")}</span>
                    <span>{formatCurrency(activeInv.grandTotal)}</span>
                  </div>
                  <div className="flex justify-between pt-0.5">
                    <span>{txt(`জমা (${activeInv.paymentMethod || "CASH"}):`, `Paid (${activeInv.paymentMethod || "CASH"}):`)}</span>
                    <span>{formatCurrency(activeInv.paidAmount)}</span>
                  </div>
                  {Number(activeInv.dueAmount) > 0 && (
                    <div className="flex justify-between text-rose-600 font-bold">
                      <span>{txt("বকেয়া বাকি:", "Due Balance:")}</span>
                      <span>{formatCurrency(activeInv.dueAmount)}</span>
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
                    * {activeInv.invoiceNumber || activeInv.invoiceNo} *
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
