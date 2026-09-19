"use client";

import { useState, useEffect, useMemo } from "react";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { SalesService, AuthService } from "@/lib/api/client";
import { Invoice } from "@/types";
import { formatCurrency, formatDate, downloadCsvFile } from "@/lib/utils";
import { InvoicePrintModal } from "@/components/pos/InvoicePrintModal";
import {
  Search,
  Download,
  Printer,
  Calendar,
  Filter,
  DollarSign,
  Receipt,
  FileText,
  TrendingUp,
  CreditCard,
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  X,
  User,
  ShoppingBag,
} from "lucide-react";

export default function SalesHistoryPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [dateFilter, setDateFilter] = useState("ALL"); // ALL, TODAY, LAST_7_DAYS, LAST_30_DAYS
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [modalMode, setModalMode] = useState<"a4" | "thermal">("a4");
  const [showSalesReportModal, setShowSalesReportModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  const loadSales = async (page = 1, limit = 50) => {
    setLoading(true);
    try {
      const res = await SalesService.getSales({
        page,
        limit,
        status: statusFilter !== "ALL" ? statusFilter : undefined,
        search: searchQuery.trim() || undefined,
      });

      if (res && res.data) {
        setInvoices(res.data);
        if (res.meta) {
          setTotalRecords(res.meta.total);
          setTotalPages(Math.ceil(res.meta.total / pageSize) || 1);
        } else {
          setTotalRecords(res.data.length);
          setTotalPages(Math.ceil(res.data.length / pageSize) || 1);
        }
      }
    } catch (err) {
      console.error("Failed to load sales", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setUser(AuthService.getCurrentUser());
    loadSales(1, 100);
  }, []);

  const canExportExcel =
    user?.role === "admin" || user?.permissions?.canExportExcel !== false;

  // Filter invoices locally based on search, status, and date filter
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const q = searchQuery.toLowerCase().trim();
      const invNum = (inv.invoiceNumber || inv.invoiceNo || "").toLowerCase();
      const custName = (inv.customerName || "").toLowerCase();
      const custPhone = inv.customerPhone || "";
      const cashier = (inv.cashierName || "").toLowerCase();

      const matchesSearch =
        !q ||
        invNum.includes(q) ||
        custName.includes(q) ||
        custPhone.includes(q) ||
        cashier.includes(q);

      const matchesStatus =
        statusFilter === "ALL" ||
        inv.status?.toUpperCase() === statusFilter.toUpperCase() ||
        inv.paymentStatus?.toUpperCase() === statusFilter.toUpperCase();

      let matchesDate = true;
      if (dateFilter !== "ALL") {
        const itemDate = new Date(inv.createdAt || inv.date || "");
        const now = new Date();
        if (dateFilter === "TODAY") {
          matchesDate = itemDate.toDateString() === now.toDateString();
        } else if (dateFilter === "LAST_7_DAYS") {
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(now.getDate() - 7);
          matchesDate = itemDate >= sevenDaysAgo;
        } else if (dateFilter === "LAST_30_DAYS") {
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(now.getDate() - 30);
          matchesDate = itemDate >= thirtyDaysAgo;
        }
      }

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [invoices, searchQuery, statusFilter, dateFilter]);

  // Overall Totals based on filtered list
  const totalSalesRevenue = filteredInvoices.reduce(
    (sum, inv) => sum + Number(inv.grandTotal || 0),
    0
  );
  const totalPaidAmount = filteredInvoices.reduce(
    (sum, inv) => sum + Number(inv.paidAmount || 0),
    0
  );
  const totalDueAmount = filteredInvoices.reduce(
    (sum, inv) => sum + Number(inv.dueAmount || 0),
    0
  );

  // Pagination for the table
  const paginatedInvoices = useMemo(() => {
    const startIdx = (currentPage - 1) * pageSize;
    return filteredInvoices.slice(startIdx, startIdx + pageSize);
  }, [filteredInvoices, currentPage, pageSize]);

  const computedTotalPages = Math.max(1, Math.ceil(filteredInvoices.length / pageSize));

  const handleExportCsv = () => {
    const exportData = filteredInvoices.map((inv, idx) => ({
      SL: idx + 1,
      InvoiceNumber: inv.invoiceNumber || inv.invoiceNo,
      Customer: inv.customerName,
      Phone: inv.customerPhone || "N/A",
      Date: formatDate(inv.createdAt || inv.date),
      Cashier: inv.cashierName,
      Branch: inv.branchName || "Main",
      ItemsCount: inv.items?.length || 0,
      Subtotal: inv.subtotal,
      Discount: inv.discount,
      GrandTotal: inv.grandTotal,
      PaidAmount: inv.paidAmount,
      DueAmount: inv.dueAmount,
      PaymentMethod: inv.paymentMethod,
      PaymentStatus: inv.status,
    }));
    downloadCsvFile(
      exportData,
      `Inventarioya_Sales_${new Date().toISOString().split("T")[0]}`
    );
  };

  const handleOpenInvoiceModal = (inv: Invoice, mode: "a4" | "thermal") => {
    setSelectedInvoice(inv);
    setModalMode(mode);
  };

  // Active Shop profile details for PDF / Receipts
  const activeUser = AuthService.getCurrentUser() || user;
  const pdfShopName = activeUser?.shopName || activeUser?.name || "Inventarioya Store";
  const pdfShopAddress = activeUser?.address || "";
  const pdfShopPhone = activeUser?.phone || "";
  const pdfShopEmail = activeUser?.email || "";
  const pdfLogoUrl = activeUser?.logoUrl || activeUser?.avatarUrl;

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <DashboardHeader title="Sales History & Invoicing Records" />

      <main className="p-4 sm:p-6 space-y-6 max-w-7xl">
        {/* KPI Financial Overview Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Total Invoices
              </span>
              <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                <ShoppingBag className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-white mt-2 font-mono">
              {filteredInvoices.length}
            </p>
            <p className="text-[10px] text-slate-500 mt-1">Recorded sales orders</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Total Revenue
              </span>
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-white mt-2 font-mono">
              {formatCurrency(totalSalesRevenue)}
            </p>
            <p className="text-[10px] text-slate-500 mt-1">Cumulative billed volume</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">
                Paid / Collected
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-emerald-400 mt-2 font-mono">
              {formatCurrency(totalPaidAmount)}
            </p>
            <p className="text-[10px] text-slate-500 mt-1">Cash & digital collections</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-rose-400 uppercase tracking-wider">
                Outstanding Due (বাকি)
              </span>
              <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
                <AlertCircle className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-rose-400 mt-2 font-mono">
              {formatCurrency(totalDueAmount)}
            </p>
            <p className="text-[10px] text-slate-500 mt-1">Pending customer balances</p>
          </div>
        </div>

        {/* Filter Controls & Action Bar */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-slate-900/60 p-3 sm:p-4 rounded-2xl border border-slate-800">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-1 max-w-3xl">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search by invoice #, customer name, phone, or cashier..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 shadow-inner"
              />
            </div>

            {/* Status Filter */}
            <select
              aria-label="Filter by Status"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none shrink-0"
            >
              <option value="ALL">All Status</option>
              <option value="PAID">Paid</option>
              <option value="PARTIAL">Partial</option>
              <option value="DUE">Due (বাকি)</option>
              <option value="REFUNDED">Refunded</option>
            </select>

            {/* Date Range Filter */}
            <select
              aria-label="Filter by Date"
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none shrink-0"
            >
              <option value="ALL">All Dates</option>
              <option value="TODAY">Today</option>
              <option value="LAST_7_DAYS">Last 7 Days</option>
              <option value="LAST_30_DAYS">Last 30 Days</option>
            </select>
          </div>

          {/* Action Buttons: Print Report & CSV */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => setShowSalesReportModal(true)}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm"
              title="Print executive sales summary report or save as PDF"
            >
              <Printer className="w-4 h-4" />
              <span>Print / PDF Report</span>
            </button>

            {canExportExcel && (
              <button
                onClick={handleExportCsv}
                className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm"
                title="Export filtered sales to CSV"
              >
                <Download className="w-4 h-4 text-emerald-400" />
                <span>Export CSV</span>
              </button>
            )}

            <button
              onClick={() => loadSales(1, 100)}
              className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white rounded-xl transition-colors"
              title="Refresh sales data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-indigo-400" : ""}`} />
            </button>
          </div>
        </div>

        {/* Invoices List Table */}
        <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left text-xs">
              <thead className="bg-slate-950/70 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Invoice #</th>
                  <th className="py-3.5 px-4">Date & Time</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Served By</th>
                  <th className="py-3.5 px-4 text-right">Total Amount</th>
                  <th className="py-3.5 px-4 text-right">Paid</th>
                  <th className="py-3.5 px-4 text-right">Due</th>
                  <th className="py-3.5 px-4 text-center">Method</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Print / PDF</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {loading ? (
                  <tr>
                    <td colSpan={10} className="py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <RefreshCw className="w-6 h-6 animate-spin text-indigo-500" />
                        <span className="text-xs">Loading sales and invoice records...</span>
                      </div>
                    </td>
                  </tr>
                ) : paginatedInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-12 text-center text-slate-500">
                      No invoices found matching current search or filters.
                    </td>
                  </tr>
                ) : (
                  paginatedInvoices.map((inv) => {
                    const isDue = Number(inv.dueAmount || 0) > 0;
                    const status = inv.status?.toUpperCase() || (isDue ? "DUE" : "PAID");

                    return (
                      <tr
                        key={inv.id}
                        className="hover:bg-slate-800/40 transition-colors group"
                      >
                        {/* Invoice Number */}
                        <td className="py-3.5 px-4">
                          <button
                            onClick={() => handleOpenInvoiceModal(inv, "a4")}
                            className="font-mono font-bold text-indigo-400 hover:text-indigo-300 hover:underline text-left block"
                            title="View / Print A4 Invoice"
                          >
                            {inv.invoiceNumber || inv.invoiceNo}
                          </button>
                          {inv.isReturned && inv.isReturned !== "none" && (
                            <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500/20 text-amber-400">
                              Returned ({inv.isReturned})
                            </span>
                          )}
                        </td>

                        {/* Date */}
                        <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap">
                          {formatDate(inv.createdAt || inv.date)}
                        </td>

                        {/* Customer */}
                        <td className="py-3.5 px-4">
                          <p className="font-semibold text-white">{inv.customerName}</p>
                          {inv.customerPhone ? (
                            <p className="text-[10px] text-slate-400 font-mono">
                              {inv.customerPhone}
                            </p>
                          ) : (
                            <span className="text-[10px] text-slate-500 italic">
                              Walk-in
                            </span>
                          )}
                        </td>

                        {/* Served By / Cashier */}
                        <td className="py-3.5 px-4 text-slate-300">
                          <p className="font-medium text-slate-200">{inv.cashierName}</p>
                          {inv.branchName && (
                            <p className="text-[10px] text-indigo-400 font-semibold">
                              {inv.branchName}
                            </p>
                          )}
                        </td>

                        {/* Grand Total */}
                        <td className="py-3.5 px-4 text-right font-black text-white font-mono">
                          {formatCurrency(inv.grandTotal)}
                        </td>

                        {/* Paid Amount */}
                        <td className="py-3.5 px-4 text-right text-emerald-400 font-bold font-mono">
                          {formatCurrency(inv.paidAmount)}
                        </td>

                        {/* Due Amount */}
                        <td className="py-3.5 px-4 text-right font-mono">
                          {isDue ? (
                            <span className="text-rose-400 font-bold">
                              {formatCurrency(inv.dueAmount)}
                            </span>
                          ) : (
                            <span className="text-slate-500">-</span>
                          )}
                        </td>

                        {/* Payment Method */}
                        <td className="py-3.5 px-4 text-center">
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300">
                            {inv.paymentMethod || "CASH"}
                          </span>
                        </td>

                        {/* Status Badge */}
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider inline-block ${
                              status === "PAID"
                                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                : status === "PARTIAL"
                                ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                                : status === "REFUNDED"
                                ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                                : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                            }`}
                          >
                            {status}
                          </span>
                        </td>

                        {/* Action Buttons */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenInvoiceModal(inv, "a4")}
                              className="px-2.5 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
                              title="Print or Save Standard A4 Tax Invoice as PDF"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span>Invoice (PDF)</span>
                            </button>

                            <button
                              onClick={() => handleOpenInvoiceModal(inv, "thermal")}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                              title="Print 80mm POS Thermal Slip"
                            >
                              <Receipt className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="p-4 border-t border-slate-800 bg-slate-950/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span>
                Showing{" "}
                <span className="font-bold text-white">
                  {filteredInvoices.length === 0
                    ? 0
                    : (currentPage - 1) * pageSize + 1}
                </span>{" "}
                to{" "}
                <span className="font-bold text-white">
                  {Math.min(currentPage * pageSize, filteredInvoices.length)}
                </span>{" "}
                of <span className="font-bold text-white">{filteredInvoices.length}</span> sales
              </span>
              <div className="h-3 w-px bg-slate-800 mx-2" />
              <select
                aria-label="Rows per page"
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-slate-300 text-xs focus:outline-none"
              >
                <option value={10}>10 per page</option>
                <option value={25}>25 per page</option>
                <option value={50}>50 per page</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Previous Page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="px-3 py-1 font-semibold text-white">
                Page {currentPage} of {computedTotalPages}
              </span>

              <button
                onClick={() => setCurrentPage((p) => Math.min(computedTotalPages, p + 1))}
                disabled={currentPage >= computedTotalPages}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Next Page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Modern Dual-Mode Invoice Print / PDF Modal */}
      {selectedInvoice && (
        <InvoicePrintModal
          invoice={selectedInvoice}
          initialMode={modalMode}
          onClose={() => setSelectedInvoice(null)}
        />
      )}

      {/* Executive Sales Summary Report Modal (Full Page Printable Report) */}
      {showSalesReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-3 sm:p-6 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[96vh] overflow-hidden flex flex-col my-auto">
            {/* Modal Header */}
            <div className="bg-slate-950 px-4 sm:px-6 py-3.5 border-b border-slate-800 flex items-center justify-between print:hidden">
              <div className="flex items-center gap-2">
                <Printer className="w-4 h-4 text-indigo-400" />
                <span className="font-bold text-xs">Executive Sales Summary Report</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow flex items-center gap-2 transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print / Save as PDF</span>
                </button>
                <button
                  onClick={() => setShowSalesReportModal(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-950/60 print:p-0 print:bg-white print:overflow-visible">
              <div
                id="printable-sales-report"
                className="bg-white text-slate-900 p-8 sm:p-10 rounded-xl shadow-xl mx-auto max-w-3xl min-h-[700px] text-xs font-sans space-y-6 print:shadow-none print:rounded-none print:p-4 print:max-w-none border border-slate-200 print:border-none"
              >
                {/* Header */}
                <div className="border-b-2 border-slate-900 pb-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-start gap-3.5">
                      {pdfLogoUrl && (
                        <img
                          src={pdfLogoUrl}
                          alt={pdfShopName}
                          className="w-14 h-14 rounded-lg object-contain border border-slate-200 shrink-0"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = "none";
                          }}
                        />
                      )}
                      <div>
                        <h1 className="text-xl font-black text-slate-900 uppercase">
                          {pdfShopName}
                        </h1>
                        <p className="text-[11px] text-slate-600 font-semibold">
                          Smart Cloud POS & Sales Ledger Audit
                        </p>
                        <p className="text-[10px] text-slate-600">
                          {[
                            pdfShopAddress,
                            pdfShopPhone ? `Phone: ${pdfShopPhone}` : null,
                            pdfShopEmail ? `Email: ${pdfShopEmail}` : null,
                          ]
                            .filter(Boolean)
                            .join(" | ") || "Cloud Connected POS"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="inline-block bg-slate-900 text-white font-bold px-3 py-1 text-[11px] rounded uppercase mb-1">
                        SALES SUMMARY REPORT
                      </span>
                      <p className="text-[10px] text-slate-600">
                        Report Date:{" "}
                        {new Date().toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                      <p className="text-[10px] text-slate-500">
                        Generated By: {activeUser?.name || "Admin"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* KPI Metrics */}
                <div className="grid grid-cols-4 gap-3">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold block">
                      Total Invoices
                    </span>
                    <span className="text-xl font-bold text-slate-900 mt-0.5 block">
                      {filteredInvoices.length}
                    </span>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold block">
                      Total Sales Volume
                    </span>
                    <span className="text-xl font-bold text-slate-900 mt-0.5 block">
                      {formatCurrency(totalSalesRevenue)}
                    </span>
                  </div>
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                    <span className="text-[10px] text-emerald-800 uppercase font-semibold block">
                      Collected (Paid)
                    </span>
                    <span className="text-xl font-bold text-emerald-700 mt-0.5 block">
                      {formatCurrency(totalPaidAmount)}
                    </span>
                  </div>
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg">
                    <span className="text-[10px] text-rose-700 uppercase font-semibold block">
                      Outstanding Due
                    </span>
                    <span className="text-xl font-black text-rose-600 mt-0.5 block">
                      {formatCurrency(totalDueAmount)}
                    </span>
                  </div>
                </div>

                {/* Table */}
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-100 border-b border-slate-200 text-slate-800 font-bold uppercase text-[10px]">
                      <tr>
                        <th className="py-2 px-3 text-center">SL</th>
                        <th className="py-2 px-3">Invoice #</th>
                        <th className="py-2 px-3">Date</th>
                        <th className="py-2 px-3">Customer</th>
                        <th className="py-2 px-3 text-right">Total</th>
                        <th className="py-2 px-3 text-right">Paid</th>
                        <th className="py-2 px-3 text-right">Due</th>
                        <th className="py-2 px-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-800">
                      {filteredInvoices.map((inv, idx) => (
                        <tr key={inv.id}>
                          <td className="py-1.5 px-3 text-center font-mono text-[10px]">
                            {idx + 1}
                          </td>
                          <td className="py-1.5 px-3 font-mono font-bold text-indigo-700">
                            {inv.invoiceNumber || inv.invoiceNo}
                          </td>
                          <td className="py-1.5 px-3 text-slate-600">
                            {formatDate(inv.createdAt || inv.date)}
                          </td>
                          <td className="py-1.5 px-3 font-medium">{inv.customerName}</td>
                          <td className="py-1.5 px-3 text-right font-mono font-bold">
                            {formatCurrency(inv.grandTotal)}
                          </td>
                          <td className="py-1.5 px-3 text-right font-mono text-emerald-700 font-semibold">
                            {formatCurrency(inv.paidAmount)}
                          </td>
                          <td className="py-1.5 px-3 text-right font-mono font-bold text-rose-600">
                            {Number(inv.dueAmount) > 0 ? formatCurrency(inv.dueAmount) : "-"}
                          </td>
                          <td className="py-1.5 px-3 text-center font-bold text-[10px]">
                            {inv.status}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-slate-100 font-bold border-t border-slate-300">
                      <tr>
                        <td colSpan={4} className="py-2 px-3 text-right uppercase text-[10px]">
                          Grand Totals:
                        </td>
                        <td className="py-2 px-3 text-right text-slate-900 font-mono">
                          {formatCurrency(totalSalesRevenue)}
                        </td>
                        <td className="py-2 px-3 text-right text-emerald-700 font-mono">
                          {formatCurrency(totalPaidAmount)}
                        </td>
                        <td className="py-2 px-3 text-right text-rose-600 font-mono">
                          {formatCurrency(totalDueAmount)}
                        </td>
                        <td className="py-2 px-3 text-center">-</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* Signatures */}
                <div className="pt-10 grid grid-cols-2 gap-8 text-center text-[10px] text-slate-600">
                  <div>
                    <div className="border-t border-slate-400 mx-auto w-40 pt-1 font-semibold">
                      Store Manager Signature
                    </div>
                  </div>
                  <div>
                    <div className="border-t border-slate-400 mx-auto w-40 pt-1 font-semibold">
                      Auditor / Accountant Signature
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
