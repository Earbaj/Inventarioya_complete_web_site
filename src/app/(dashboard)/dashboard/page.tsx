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
  TrendingDown,
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
  Package,
  ReceiptText,
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
  const [recentSales, setRecentSales] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        console.log("Fetching /api/dashboard/stats and /api/sales...");
        const [statsData, salesData] = await Promise.all([
          DashboardService.getStats(),
          SalesService.getSales(),
        ]);
        console.log("📊 [Dashboard Stats Data Received]:", statsData);
        setStats(statsData);
        setRecentSales(
          statsData?.recentSales && statsData.recentSales.length > 0
            ? statsData.recentSales
            : (salesData || []).slice(0, 7)
        );
      } catch (err) {
        console.error("❌ [Dashboard Page Failed to load data]:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const totalSales = Number(stats?.totalSalesRevenue ?? stats?.totalRevenue ?? 0);
  const totalPaid = Number(stats?.totalPaidCollected ?? 0);
  const totalDue = Number(stats?.totalDueAmount ?? stats?.totalDueBalance ?? 0);
  const customerDue = Number(stats?.totalCustomerDue ?? 0);
  const totalExpenses = Number(stats?.totalExpenses ?? 0);
  const netProfit = Number(stats?.netProfit ?? 0);
  const isProfit = netProfit >= 0;

  const totalItems = stats?.totalItemsCount ?? 0;
  const lowStock = stats?.lowStockCount ?? stats?.lowStockItems ?? 0;
  const totalCustomers = stats?.totalCustomersCount ?? stats?.totalCustomers ?? 0;
  const totalInvoices = stats?.totalInvoicesCount ?? stats?.todayOrders ?? 0;

  const collectionRatio = totalSales > 0 ? Math.round((totalPaid / totalSales) * 100) : 0;

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <DashboardHeader title="Store Analytics & Executive Overview" />

      <main className="p-4 sm:p-6 space-y-6 max-w-7xl">
        {/* Primary Financial KPI Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Sales Revenue */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm relative overflow-hidden group hover:border-slate-700 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">Total Sales Revenue</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <ShoppingCart className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-black text-white tracking-tight">
                {formatCurrency(totalSales)}
              </p>
              <div className="mt-1 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Invoices Created</span>
                <span className="font-bold text-emerald-400">{totalInvoices} Orders</span>
              </div>
            </div>
          </div>

          {/* Card 2: Cash Collected */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm relative overflow-hidden group hover:border-slate-700 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">Collected Cash & Digital</span>
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-black text-white tracking-tight">
                {formatCurrency(totalPaid)}
              </p>
              <div className="mt-1 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Collection Rate</span>
                <span className="font-bold text-indigo-400">{collectionRatio}% of sales</span>
              </div>
            </div>
          </div>

          {/* Card 3: Total Due Amount */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm relative overflow-hidden group hover:border-slate-700 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">Total Market Due</span>
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <Wallet className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-black text-amber-400 tracking-tight">
                {formatCurrency(totalDue)}
              </p>
              <div className="mt-1 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Customer Due</span>
                <Link
                  href="/dashboard/customers"
                  className="font-bold text-amber-300 hover:underline"
                >
                  {formatCurrency(customerDue)} &rarr;
                </Link>
              </div>
            </div>
          </div>

          {/* Card 4: Net Profit or Net Loss */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm relative overflow-hidden group hover:border-slate-700 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">
                {netProfit > 0
                  ? "Net Profit (নিট লাভ)"
                  : netProfit < 0
                  ? "Net Loss (ঘাটতি / ক্ষতি)"
                  : "Net Balance (সমান)"}
              </span>
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  netProfit > 0
                    ? "bg-emerald-500/10 text-emerald-400"
                    : netProfit < 0
                    ? "bg-rose-500/10 text-rose-400"
                    : "bg-slate-800 text-slate-300"
                }`}
              >
                {netProfit >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              </div>
            </div>
            <div className="mt-3">
              <div className="flex items-center gap-2">
                <p
                  className={`text-2xl font-black tracking-tight ${
                    netProfit > 0
                      ? "text-emerald-400"
                      : netProfit < 0
                      ? "text-rose-400"
                      : "text-slate-200"
                  }`}
                >
                  {formatCurrency(Math.abs(netProfit))}
                </p>
                <span
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                    netProfit > 0
                      ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                      : netProfit < 0
                      ? "bg-rose-500/15 text-rose-400 border border-rose-500/20"
                      : "bg-slate-800 text-slate-400 border border-slate-700"
                  }`}
                >
                  {netProfit > 0 ? "Profit (লাভ)" : netProfit < 0 ? "Loss (ঘাটতি)" : "Balanced"}
                </span>
              </div>
              <div className="mt-1 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">
                  {netProfit < 0 ? "Loss after Expenses" : "Shop Expenses"}
                </span>
                <span className="font-semibold text-slate-300">
                  {formatCurrency(totalExpenses)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Secondary Store Operations Metrics (Counts & Urgencies) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Link
            href="/dashboard/inventory"
            className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center shrink-0">
                <Package className="w-4 h-4" />
              </div>
              <div>
                <p className="text-lg font-bold text-white group-hover:text-sky-400 transition-colors">
                  {totalItems}
                </p>
                <p className="text-[11px] text-slate-400">Catalog Products</p>
              </div>
            </div>
          </Link>

          <Link
            href="/dashboard/inventory"
            className={`p-4 rounded-xl border transition-all group ${
              lowStock > 0
                ? "bg-rose-500/5 border-rose-500/30 hover:border-rose-500/50"
                : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <p className="text-lg font-bold text-rose-400">
                  {lowStock}
                </p>
                <p className="text-[11px] text-slate-400">Low Stock Alert</p>
              </div>
            </div>
          </Link>

          <Link
            href="/dashboard/customers"
            className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <p className="text-lg font-bold text-white group-hover:text-purple-400 transition-colors">
                  {totalCustomers}
                </p>
                <p className="text-[11px] text-slate-400">Active Customers</p>
              </div>
            </div>
          </Link>

          <Link
            href="/dashboard/sales"
            className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                <ReceiptText className="w-4 h-4" />
              </div>
              <div>
                <p className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">
                  {totalInvoices}
                </p>
                <p className="text-[11px] text-slate-400">Sales Invoices</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Sales Trend Chart & AI Banner */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue Chart */}
          <div className="lg:col-span-2 p-4 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <h3 className="text-sm font-bold text-white">Weekly Sales Velocity</h3>
                <p className="text-xs text-slate-400">Daily sales revenue trends across all branch checkouts</p>
              </div>
              <span className="self-start sm:self-auto text-xs px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 font-medium">
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
          <div className="p-4 sm:p-6 rounded-2xl bg-gradient-to-br from-indigo-950/60 via-slate-900 to-purple-950/40 border border-indigo-500/30 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-purple-400 text-xs font-bold mb-2">
                <Sparkles className="w-4 h-4" />
                <span>Gemini AI Smart Advisor</span>
              </div>
              <h4 className="text-base font-bold text-white mb-2">
                Restock Alert: {lowStock} Items Under Stock Limit
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                You have {lowStock} out of {totalItems} items approaching critical inventory thresholds. Automated replenishment is recommended.
              </p>
              <div className="mt-4 p-3 rounded-xl bg-slate-900/80 border border-indigo-500/20 text-xs text-indigo-300">
                {netProfit < 0
                  ? `Current financial overview shows a Net Deficit / Loss of ${formatCurrency(Math.abs(netProfit))} with ${formatCurrency(totalExpenses)} in shop expenses recorded.`
                  : `Current financial overview shows a Net Profit of ${formatCurrency(netProfit)} with ${formatCurrency(totalExpenses)} in shop expenses recorded.`}
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
        <div className="p-4 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">Recent POS Invoices</h3>
              <p className="text-xs text-slate-400">
                Latest transactions from this store register ({recentSales.length} showing)
              </p>
            </div>
            <Link
              href="/dashboard/sales"
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
            >
              View All Invoices &rarr;
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-xs">
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
                {recentSales.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-500">
                      No invoices found yet.
                    </td>
                  </tr>
                ) : (
                  recentSales.map((inv) => (
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
                  ))
                )}
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
