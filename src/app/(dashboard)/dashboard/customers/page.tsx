"use client";

import { useState } from "react";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { AIService } from "@/lib/api/client";
import { AICustomerCreditScore } from "@/types";
import { formatCurrency, downloadCsvFile } from "@/lib/utils";
import { Users, Search, Download, Sparkles, Phone, ShieldCheck, X, FileSpreadsheet } from "lucide-react";

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

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery)
  );

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

      <main className="p-6 space-y-6 max-w-7xl">
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

          <button
            onClick={handleExportCustomers}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            Export Customers & Due Balances
          </button>
        </div>

        {/* Customers Table */}
        <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Customer Name</th>
                  <th className="py-3 px-4">Contact Phone</th>
                  <th className="py-3 px-4">Total Purchases</th>
                  <th className="py-3 px-4">Due Balance</th>
                  <th className="py-3 px-4">Last Active</th>
                  <th className="py-3 px-4">Gemini AI Credit Rating</th>
                  <th className="py-3 px-4 text-right">Ledger CSV</th>
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
                      <button
                        onClick={() => handleExportLedger(cust)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                        title="Export Statement"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
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
    </div>
  );
}
