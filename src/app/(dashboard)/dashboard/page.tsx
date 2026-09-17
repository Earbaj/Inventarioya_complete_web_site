"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { DashboardService, SalesService } from "@/lib/api/client";
import { DashboardStats, Invoice } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ThermalReceipt } from "@/components/pos/ThermalReceipt";
import {
  TrendingUp,
  ShoppingCart,
  DollarSign,
  AlertTriangle,
  Users,
  Wallet,
  ArrowUpRight,
  Printer,
  Sparkles,
  Plus,
  ArrowRight,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export default function DashboardOverviewPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  useEffect(() => {
    async function loadStats() {
      try {
        console.log("Fetching /api/dashboard/stats...");
        const data = await DashboardService.getStats();
        console.log("📊 [Dashboard Page Received Stats Data]:", data);
        setStats(data);
      } catch (err) {
        console.error("❌ [Dashboard Page Failed to load stats]:", err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <DashboardHeader title="Store Analytics & Executive Overview" />

      <main className="p-6 space-y-6 max-w-7xl">
        {/* KPI Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">Today's Sales</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <ShoppingCart className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-extrabold text-white">
                {formatCurrency(stats?.todaySales ?? 34250)}
              </p>
              <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1 font-medium">
                <TrendingUp className="w-3 h-3" />
                <span>+14.2% from yesterday ({stats?.todayOrders ?? 28} orders)</span>
              </p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">Monthly Revenue</span>
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-extrabold text-white">
                {formatCurrency(stats?.monthlyRevenue ?? 1245000)}
              </p>
              <p className="text-[11px] text-indigo-400 mt-1 flex items-center gap-1 font-medium">
                <span>Net Profit: {formatCurrency(stats?.netProfit ?? 342000)}</span>
              </p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">Low Stock Alert</span>
              <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-extrabold text-rose-400">
                {stats?.lowStockItems ?? 3} Items
              </p>
              <Link href="/dashboard/inventory" className="text-[11px] text-rose-400 hover:underline mt-1 block">
                Restock needed urgently &rarr;
              </Link>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">Customer Dues</span>
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <Wallet className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-extrabold text-white">
                {formatCurrency(stats?.totalDueBalance ?? 18500)}
              </p>
              <Link href="/dashboard/customers" className="text-[11px] text-amber-400 hover:underline mt-1 block">
                View customer ledger & credit &rarr;
              </Link>
            </div>
          </div>
        </div>

        {/* Sales Trend Chart & AI Banner */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue Chart */}
          <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-white">Weekly Sales Velocity</h3>
                <p className="text-xs text-slate-400">Daily sales revenue trends across all branch checkouts</p>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 font-medium">
                Last 7 Days
              </span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={stats?.salesChartData || [
                    { date: "Mon", amount: 28500 },
                    { date: "Tue", amount: 31200 },
                    { date: "Wed", amount: 24800 },
                    { date: "Thu", amount: 39500 },
                    { date: "Fri", amount: 48900 },
                    { date: "Sat", amount: 54100 },
                    { date: "Sun", amount: 34250 },
                  ]}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "8px", fontSize: "12px" }}
                    formatter={(value: any) => [formatCurrency(Number(value)), "Revenue"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="amount"
                    stroke="#6366f1"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#salesGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Quick AI & POS Action Widget */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-950/60 via-slate-900 to-purple-950/40 border border-indigo-500/30 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-purple-400 text-xs font-bold mb-2">
                <Sparkles className="w-4 h-4" />
                <span>Gemini AI Smart Advisor</span>
              </div>
              <h4 className="text-base font-bold text-white mb-2">
                Stockout Warning: Cooking Oil
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Rupchanda Soyabean Oil 5L stock is down to 8 units. Based on current weekend velocity, it will run out in 4 days.
              </p>
              <div className="mt-4 p-3 rounded-xl bg-slate-900/80 border border-indigo-500/20 text-xs text-indigo-300">
                Recommended Action: Generate PO for 40 units to supplier Meghna Group.
              </div>
            </div>

            <div className="pt-6 space-y-2">
              <Link
                href="/dashboard/ai-advisor"
                className="w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors"
              >
                View Full AI Predictions
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/dashboard/pos"
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                Open POS Cash Register
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Invoices Table */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">Recent POS Invoices</h3>
              <p className="text-xs text-slate-400">Latest transactions from this branch register</p>
            </div>
            <Link
              href="/dashboard/sales"
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
            >
              View All Invoices &rarr;
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Time</th>
                  <th className="py-3 px-4">Items</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {(stats?.recentSales || []).map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-indigo-400">
                      {inv.invoiceNumber}
                    </td>
                    <td className="py-3 px-4 font-medium text-white">{inv.customerName}</td>
                    <td className="py-3 px-4 text-slate-400">{formatDate(inv.createdAt)}</td>
                    <td className="py-3 px-4 text-slate-300">{inv.items?.length || 1} items</td>
                    <td className="py-3 px-4 font-bold text-white">
                      {formatCurrency(inv.grandTotal)}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300">
                        {inv.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          inv.status === "PAID"
                            ? "bg-emerald-500/20 text-emerald-400"
                            : "bg-rose-500/20 text-rose-400"
                        }`}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedInvoice(inv)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition-colors"
                        title="Print Thermal Receipt"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Thermal Receipt Print Modal */}
      {selectedInvoice && (
        <ThermalReceipt
          invoice={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
        />
      )}
    </div>
  );
}
