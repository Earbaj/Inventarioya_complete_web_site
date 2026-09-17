"use client";

import { useState, useEffect } from "react";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { AIService, AuthService, CustomerService } from "@/lib/api/client";
import { AICustomerCreditScore } from "@/types";
import { formatCurrency, downloadCsvFile } from "@/lib/utils";
import { Users, Search, Download, Sparkles, Phone, ShieldCheck, X, FileSpreadsheet, Printer } from "lucide-react";

interface CustomerLedger {
  id: string;
  name: string;
  phone: string;
  totalPurchases: number;
  totalDue: number;
  lastPurchaseDate: string;
  status: "GOOD" | "RISK" | "VIP";
}

const mockCustomers: CustomerLedger[] = [
  { id: "cust_1", name: "Tanvir Ahmed", phone: "+880 1819-556677", totalPurchases: 28400, totalDue: 0, lastPurchaseDate: "2026-09-17", status: "VIP" },
  { id: "cust_2", name: "Mrs. Shahrin Islam", phone: "+880 1912-887766", totalPurchases: 14200, totalDue: 0, lastPurchaseDate: "2026-09-16", status: "GOOD" },
  { id: "cust_3", name: "Kazi Farhad", phone: "+880 1714-332211", totalPurchases: 45000, totalDue: 5500, lastPurchaseDate: "2026-09-15", status: "GOOD" },
  { id: "cust_4", name: "Mahfuzur Rahman", phone: "+880 1611-998877", totalPurchases: 8900, totalDue: 3800, lastPurchaseDate: "2026-09-10", status: "RISK" },
  { id: "cust_5", name: "Dr. Anisur Zaman", phone: "+880 1713-221100", totalPurchases: 62000, totalDue: 0, lastPurchaseDate: "2026-09-14", status: "VIP" },
];

export default function CustomersPage() {
  const [customers, setCustomers] = useState<CustomerLedger[]>(mockCustomers);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomerScore, setSelectedCustomerScore] = useState<AICustomerCreditScore | null>(null);
  const [evaluatingId, setEvaluatingId] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [selectedCustomerForPdf, setSelectedCustomerForPdf] = useState<CustomerLedger | null>(null);

  useEffect(() => {
    setUser(AuthService.getCurrentUser());
    async function loadCustomers() {
      try {
        const res = await CustomerService.getCustomers({ limit: 50 });
        if (res.data && res.data.length > 0) {
          const mapped: CustomerLedger[] = res.data.map((c) => {
            const dueNum = Number(c.closingBalance || c.totalDue || 0);
            const totalSpent = Number(c.totalPurchases || 0);
            return {
              id: c.id,
              name: c.name,
              phone: c.phone,
              totalPurchases: totalSpent,
              totalDue: dueNum < 0 ? Math.abs(dueNum) : 0,
              lastPurchaseDate: c.createdAt ? c.createdAt.split("T")[0] : "2026-09-17",
              status: dueNum < -1000 ? "RISK" : totalSpent > 25000 ? "VIP" : "GOOD",
            };
          });
          setCustomers(mapped);
        }
      } catch (err) {
        console.error("Failed to load customers", err);
      }
    }
    loadCustomers();
  }, []);

  const canExportExcel = user?.role === "admin" || user?.permissions?.canExportExcel !== false;
  const canEditCustomers = user?.role === "admin" || user?.permissions?.canEditCustomers !== false;

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery)
  );

  const totalPurchases = filtered.reduce((sum, c) => sum + (c.totalPurchases || 0), 0);
  const totalDue = filtered.reduce((sum, c) => sum + (c.totalDue || 0), 0);
  const customersWithDue = filtered.filter((c) => c.totalDue > 0).length;

  const handleExportCustomers = () => {
    downloadCsvFile(filtered, `Inventarioya_Customers_${new Date().toISOString().split("T")[0]}`);
  };

  const handleExportLedger = (cust: CustomerLedger) => {
    const singleLedger = [
      { CustomerId: cust.id, Name: cust.name, Phone: cust.phone, TotalSpent: cust.totalPurchases, DueAmount: cust.totalDue, LastDate: cust.lastPurchaseDate },
    ];
    downloadCsvFile(singleLedger, `Ledger_${cust.name.replace(/\s+/g, "_")}`);
  };

  const handleRunAICreditCheck = async (cust: CustomerLedger) => {
    setEvaluatingId(cust.id);
    try {
      const score = await AIService.getCustomerCreditScore(cust.id);
      setSelectedCustomerScore(score);
    } catch (err) {
      console.error(err);
    } finally {
      setEvaluatingId(null);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <DashboardHeader title="Customer Ledgers & AI Credit Scoring" />

      <main className="p-4 sm:p-6 space-y-6 max-w-7xl">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative max-w-sm flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search customer by name or phone..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                setSelectedCustomerForPdf(null);
                setShowPdfModal(true);
              }}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors shrink-0 shadow-sm"
              title="Print or view Customer Ledger and Due Summary Report"
            >
              <Printer className="w-4 h-4 text-white" />
              Print / PDF Report
            </button>

            {canExportExcel && (
              <button
                onClick={handleExportCustomers}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors shrink-0"
              >
                <Download className="w-4 h-4 text-emerald-400" />
                Export CSV
              </button>
            )}
          </div>
        </div>

        {/* Customers Table */}
        <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[750px] text-left text-xs">
              <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Customer Name</th>
                  <th className="py-3 px-4">Contact Phone</th>
                  <th className="py-3 px-4">Total Purchases</th>
                  <th className="py-3 px-4">Due Balance</th>
                  <th className="py-3 px-4">Last Active</th>
                  <th className="py-3 px-4">Gemini AI Credit Rating</th>
                  <th className="py-3 px-4 text-right">Actions (PDF / CSV)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filtered.map((cust) => (
                  <tr key={cust.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-semibold text-white">{cust.name}</td>
                    <td className="py-3 px-4 text-slate-400">{cust.phone}</td>
                    <td className="py-3 px-4 font-bold text-white">
                      {formatCurrency(cust.totalPurchases)}
                    </td>
                    <td className="py-3 px-4">
                      {cust.totalDue > 0 ? (
                        <span className="font-bold text-rose-400">
                          {formatCurrency(cust.totalDue)}
                        </span>
                      ) : (
                        <span className="text-emerald-400 font-medium">Cleared (৳0)</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-400">{cust.lastPurchaseDate}</td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleRunAICreditCheck(cust)}
                        disabled={evaluatingId === cust.id}
                        className="px-2.5 py-1 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-medium inline-flex items-center gap-1.5 transition-colors"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                        <span>
                          {evaluatingId === cust.id ? "Analyzing..." : "Calculate AI Score"}
                        </span>
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedCustomerForPdf(cust);
                            setShowPdfModal(true);
                          }}
                          className="p-1.5 rounded-lg bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-400 hover:text-indigo-300 border border-indigo-500/30 transition-colors"
                          title="Print / View Customer PDF Statement"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                        {canExportExcel && (
                          <button
                            onClick={() => handleExportLedger(cust)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                            title="Export CSV Statement"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* AI Credit Score Modal */}
      {selectedCustomerScore && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-purple-500/40 rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Gemini AI Credit Risk Report</h3>
                  <p className="text-[11px] text-slate-400">{selectedCustomerScore.customerName}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCustomerScore(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-center py-4 bg-slate-950/60 rounded-2xl border border-slate-800 my-4">
              <div className="text-4xl font-black text-purple-400 font-mono">
                {selectedCustomerScore.creditScore} / 100
              </div>
              <span className="inline-block mt-1 px-3 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400">
                {selectedCustomerScore.riskTier.replace("_", " ")}
              </span>
            </div>

            <div className="space-y-2 text-xs text-slate-300 mb-6">
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Recommended Credit Limit:</span>
                <span className="font-bold text-white">
                  {formatCurrency(selectedCustomerScore.maxCreditLimit)}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Repayment Probability:</span>
                <span className="font-bold text-emerald-400">
                  {selectedCustomerScore.repaymentProbability}
                </span>
              </div>
              <div className="pt-2">
                <span className="text-slate-400 block mb-1">AI Behavior Assessment:</span>
                <p className="text-slate-300 text-[11px] leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                  {selectedCustomerScore.summary}
                </p>
              </div>
            </div>

            <button
              onClick={() => setSelectedCustomerScore(null)}
              className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition-colors"
            >
              Close Assessment
            </button>
          </div>
        </div>
      )}

      {/* Customer Ledger & Statement Print / PDF Modal */}
      {showPdfModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-6 overflow-y-auto print:p-0 print:bg-white">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-4xl w-full max-h-[94vh] flex flex-col shadow-2xl overflow-hidden print:border-none print:shadow-none print:max-h-none print:w-full">
            {/* Top Action Bar (hidden in print) */}
            <div className="bg-slate-950 border-b border-slate-800 px-5 py-3.5 flex items-center justify-between print:hidden shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                  <Printer className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    {selectedCustomerForPdf ? "Customer Account Statement (PDF / Print)" : "Customer Ledger & Due Report (PDF / Print)"}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Preview document & click Print to save as PDF or send to printer
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  Print / Save as PDF
                </button>
                <button
                  onClick={() => setShowPdfModal(false)}
                  className="p-2 text-slate-400 hover:text-white rounded-lg transition-colors"
                  title="Close preview"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Document Preview Container */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-950/40 print:p-0 print:bg-white print:overflow-visible">
              <div
                id="printable-customer-report"
                className="bg-white text-slate-900 p-8 sm:p-10 rounded-xl shadow-lg mx-auto max-w-3xl min-h-[650px] text-xs font-sans space-y-6 print:shadow-none print:rounded-none print:p-4 print:max-w-none"
              >
                {/* Document Header */}
                <div className="border-b-2 border-slate-900 pb-5">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h1 className="text-xl font-black tracking-tight text-slate-900 uppercase">
                        Inventarioya Enterprise
                      </h1>
                      <p className="text-[11px] text-slate-700 font-semibold mt-0.5">
                        Smart Cloud POS & Inventory Management System
                      </p>
                      <p className="text-[10px] text-slate-500 mt-1">
                        Road 27, Dhanmondi, Dhaka-1209 | Phone: +880 1819-000000 | Web: inventarioya.com
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="inline-block bg-slate-900 text-white font-bold px-3 py-1 text-[11px] rounded uppercase tracking-wider mb-1.5">
                        {selectedCustomerForPdf ? "CUSTOMER STATEMENT" : "LEDGER & DUE SUMMARY"}
                      </span>
                      <p className="text-[11px] text-slate-700">
                        <span className="font-semibold">Statement Date:</span>{" "}
                        {new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                      </p>
                      <p className="text-[10px] text-slate-500">
                        Generated By: {user?.name || user?.role || "Accounts Admin"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Body: Single Customer Statement */}
                {selectedCustomerForPdf ? (
                  <div className="space-y-6">
                    {/* Customer Info Card */}
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase font-semibold block">Customer Name</span>
                        <span className="text-sm font-bold text-slate-900">{selectedCustomerForPdf.name}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase font-semibold block">Phone Number</span>
                        <span className="text-sm font-medium text-slate-800 font-mono">{selectedCustomerForPdf.phone}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase font-semibold block">Account Tier</span>
                        <span className="inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-800">
                          {selectedCustomerForPdf.status}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase font-semibold block">Last Transaction</span>
                        <span className="text-sm font-medium text-slate-800">{selectedCustomerForPdf.lastPurchaseDate}</span>
                      </div>
                    </div>

                    {/* Financial Summary Cards */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-lg border border-slate-200 bg-white shadow-xs">
                        <span className="text-[11px] text-slate-600 font-medium block">Total Lifetime Purchases</span>
                        <span className="text-2xl font-black text-slate-900 mt-1 block">
                          {formatCurrency(selectedCustomerForPdf.totalPurchases)}
                        </span>
                        <span className="text-[10px] text-slate-500 mt-1 block">Cumulative billing volume</span>
                      </div>
                      <div className={`p-4 rounded-lg border shadow-xs ${selectedCustomerForPdf.totalDue > 0 ? "border-rose-300 bg-rose-50/60" : "border-emerald-300 bg-emerald-50/60"}`}>
                        <span className="text-[11px] font-medium block text-slate-700">Current Outstanding Due (বাকি)</span>
                        <span className={`text-2xl font-black mt-1 block ${selectedCustomerForPdf.totalDue > 0 ? "text-rose-600" : "text-emerald-700"}`}>
                          {formatCurrency(selectedCustomerForPdf.totalDue)}
                        </span>
                        <span className={`text-[10px] font-semibold mt-1 block ${selectedCustomerForPdf.totalDue > 0 ? "text-rose-600" : "text-emerald-700"}`}>
                          {selectedCustomerForPdf.totalDue > 0 ? "● Payment Pending" : "✓ Account Fully Cleared (৳0)"}
                        </span>
                      </div>
                    </div>

                    {/* Statement Ledger Breakdown Table */}
                    <div className="border border-slate-200 rounded-lg overflow-hidden">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold uppercase text-[10px]">
                          <tr>
                            <th className="py-2.5 px-4">Account Description / Item Particulars</th>
                            <th className="py-2.5 px-4 text-center">Date</th>
                            <th className="py-2.5 px-4 text-right">Debit (Purchased)</th>
                            <th className="py-2.5 px-4 text-right">Credit (Paid)</th>
                            <th className="py-2.5 px-4 text-right">Net Due Balance</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-800">
                          <tr>
                            <td className="py-3 px-4 font-medium">Cumulative Account Purchases & Settlements</td>
                            <td className="py-3 px-4 text-center text-slate-600">{selectedCustomerForPdf.lastPurchaseDate}</td>
                            <td className="py-3 px-4 text-right font-semibold">{formatCurrency(selectedCustomerForPdf.totalPurchases)}</td>
                            <td className="py-3 px-4 text-right text-emerald-700 font-semibold">
                              {formatCurrency(Math.max(0, selectedCustomerForPdf.totalPurchases - selectedCustomerForPdf.totalDue))}
                            </td>
                            <td className="py-3 px-4 text-right font-black text-rose-600">
                              {formatCurrency(selectedCustomerForPdf.totalDue)}
                            </td>
                          </tr>
                        </tbody>
                        <tfoot className="bg-slate-50 font-bold border-t border-slate-200 text-slate-900">
                          <tr>
                            <td colSpan={4} className="py-2.5 px-4 text-right uppercase text-[10px] tracking-wider">Total Due Balance Payable:</td>
                            <td className="py-2.5 px-4 text-right text-sm text-rose-600">
                              {formatCurrency(selectedCustomerForPdf.totalDue)}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                ) : (
                  /* Body: Bulk Customer Ledger & Due Report */
                  <div className="space-y-6">
                    {/* Summary KPI Badges */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                        <span className="text-[10px] text-slate-500 uppercase font-semibold block">Total Customers</span>
                        <span className="text-xl font-bold text-slate-900 mt-0.5 block">{filtered.length}</span>
                      </div>
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                        <span className="text-[10px] text-slate-500 uppercase font-semibold block">Total Sales Volume</span>
                        <span className="text-xl font-bold text-slate-900 mt-0.5 block">{formatCurrency(totalPurchases)}</span>
                      </div>
                      <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg">
                        <span className="text-[10px] text-rose-700 uppercase font-semibold block">Total Outstanding Due</span>
                        <span className="text-xl font-black text-rose-600 mt-0.5 block">{formatCurrency(totalDue)}</span>
                      </div>
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                        <span className="text-[10px] text-slate-500 uppercase font-semibold block">Customers With Due</span>
                        <span className="text-xl font-bold text-amber-700 mt-0.5 block">{customersWithDue}</span>
                      </div>
                    </div>

                    {/* Bulk Ledger Table */}
                    <div className="border border-slate-200 rounded-lg overflow-hidden">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead className="bg-slate-100 border-b border-slate-300 text-slate-800 font-bold uppercase text-[10px]">
                          <tr>
                            <th className="py-2.5 px-3 w-8">#</th>
                            <th className="py-2.5 px-3">Customer Name</th>
                            <th className="py-2.5 px-3">Phone</th>
                            <th className="py-2.5 px-3 text-right">Total Purchases</th>
                            <th className="py-2.5 px-3 text-right">Outstanding Due</th>
                            <th className="py-2.5 px-3 text-center">Status</th>
                            <th className="py-2.5 px-3 text-right">Last Active</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 text-slate-800">
                          {filtered.map((cust, idx) => (
                            <tr key={cust.id} className={idx % 2 === 1 ? "bg-slate-50/70" : ""}>
                              <td className="py-2 px-3 text-slate-500 font-mono text-[10px]">{idx + 1}</td>
                              <td className="py-2 px-3 font-semibold text-slate-900">{cust.name}</td>
                              <td className="py-2 px-3 text-slate-600 font-mono text-[11px]">{cust.phone}</td>
                              <td className="py-2 px-3 text-right font-medium">{formatCurrency(cust.totalPurchases)}</td>
                              <td className="py-2 px-3 text-right font-bold">
                                {cust.totalDue > 0 ? (
                                  <span className="text-rose-600">{formatCurrency(cust.totalDue)}</span>
                                ) : (
                                  <span className="text-emerald-600 font-normal">৳0</span>
                                )}
                              </td>
                              <td className="py-2 px-3 text-center">
                                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700">
                                  {cust.status}
                                </span>
                              </td>
                              <td className="py-2 px-3 text-right text-slate-600 text-[11px]">{cust.lastPurchaseDate}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="bg-slate-100 border-t-2 border-slate-300 font-bold text-slate-900">
                          <tr>
                            <td colSpan={3} className="py-2.5 px-3 text-right uppercase text-[10px] tracking-wider">Total Summary:</td>
                            <td className="py-2.5 px-3 text-right">{formatCurrency(totalPurchases)}</td>
                            <td className="py-2.5 px-3 text-right text-rose-600">{formatCurrency(totalDue)}</td>
                            <td colSpan={2} className="py-2.5 px-3 text-right text-[10px] text-slate-500 font-normal">
                              {filtered.length} customers listed
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                )}

                {/* Footer Signatures */}
                <div className="pt-8 border-t border-slate-200 mt-8 space-y-6">
                  <div className="flex justify-between items-end pt-6">
                    <div className="text-center">
                      <div className="w-44 border-b border-slate-400 mb-1"></div>
                      <p className="text-[10px] font-semibold text-slate-700 uppercase tracking-wider">Prepared By (Accounts)</p>
                    </div>
                    <div className="text-center">
                      <div className="w-44 border-b border-slate-400 mb-1"></div>
                      <p className="text-[10px] font-semibold text-slate-700 uppercase tracking-wider">Authorized Signatory & Seal</p>
                    </div>
                  </div>
                  <div className="text-center border-t border-dashed border-slate-200 pt-3">
                    <p className="text-[9px] text-slate-400">
                      This is a system-generated financial document from Inventarioya Cloud POS & Inventory Management System.
                    </p>
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
