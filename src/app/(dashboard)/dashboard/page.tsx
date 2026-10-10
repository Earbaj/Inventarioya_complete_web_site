"use client";

import { useEffect, useState, useMemo } from "react";
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
  Calendar,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Legend,
  LabelList,
} from "recharts";

import { useLanguage } from "@/context/LanguageContext";
import { ShimmerCard, ShimmerTableRows, ShimmerItem } from "@/components/ui/ShimmerSkeleton";

export default function DashboardOverviewPage() {
  const { locale, txt } = useLanguage();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [allSales, setAllSales] = useState<Invoice[]>([]);
  const [recentSales, setRecentSales] = useState<Invoice[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<string>("ALL");
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [chartTimeframe, setChartTimeframe] = useState<"weekly" | "monthly">("weekly");

  const loadData = async (activeBranch?: string) => {
    try {
      const branchToFilter = activeBranch !== undefined 
        ? activeBranch 
        : (typeof window !== "undefined" ? localStorage.getItem("selected_branch_id") || "ALL" : "ALL");

      const [statsData, salesData] = await Promise.all([
        DashboardService.getStats({ branchId: branchToFilter }),
        SalesService.getSales({ branchId: branchToFilter, limit: 100 }),
      ]);
      setStats(statsData);
      const salesList = Array.isArray(salesData) ? salesData : salesData?.data || [];
      setAllSales(salesList);

      const filtered = branchToFilter && branchToFilter !== "ALL"
        ? salesList.filter((s: Invoice) => !s.branchId || s.branchId === branchToFilter)
        : salesList;

      setRecentSales(filtered.slice(0, 7));
    } catch (err) {
      console.error("❌ [Dashboard Page Failed to load data]:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const savedBranch = typeof window !== "undefined" ? localStorage.getItem("selected_branch_id") || "ALL" : "ALL";
    setSelectedBranchId(savedBranch);
    loadData(savedBranch);

    const onBranchChanged = (e: any) => {
      const newBranchId = e?.detail?.branchId || "ALL";
      setSelectedBranchId(newBranchId);
      loadData(newBranchId);
    };

    window.addEventListener("branchChanged", onBranchChanged);
    return () => window.removeEventListener("branchChanged", onBranchChanged);
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
  const totalInvoices = stats?.totalInvoicesCount ?? (allSales.length > 0 ? allSales.length : (stats?.todayOrders ?? 0));

  const collectionRatio = totalSales > 0 ? Math.round((totalPaid / totalSales) * 100) : 0;

  // Real sales calculation for Weekly (7 days) and Monthly (30 days)
  const chartData = useMemo(() => {
    const dayNamesBn = ["রবি", "সোম", "মঙ্গল", "বুধ", "বৃহঃ", "শুক্র", "শনি"];
    const dayNamesEn = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    const isWeekly = chartTimeframe === "weekly";
    const daysCount = isWeekly ? 7 : 30;

    const days: {
      date: string;
      shortDate: string;
      fullDate: string;
      dayName: string;
      amount: number;
      orders: number;
      hasSales: boolean;
    }[] = [];

    const now = new Date();

    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const dayOfWeek = d.getDay();
      const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      const dayName = locale === "bn" ? dayNamesBn[dayOfWeek] : dayNamesEn[dayOfWeek];
      
      const dayNum = d.getDate();
      const monthShort = d.toLocaleDateString(locale === "bn" ? "bn-BD" : "en-US", { month: "short" });
      const shortDate = `${dayNum} ${monthShort}`;

      days.push({
        date: isWeekly ? dayName : shortDate,
        shortDate,
        fullDate: dateKey,
        dayName,
        amount: 0,
        orders: 0,
        hasSales: false,
      });
    }

    // Populate with real invoices from store
    const sourceInvoices = allSales.length > 0 ? allSales : recentSales;
    if (sourceInvoices.length > 0) {
      sourceInvoices.forEach((inv) => {
        if (!inv) return;
        const invDateStr = inv.createdAt || inv.date;
        if (!invDateStr) return;

        const invDate = new Date(invDateStr);
        if (isNaN(invDate.getTime())) return;
        const invKey = `${invDate.getFullYear()}-${String(invDate.getMonth() + 1).padStart(2, "0")}-${String(invDate.getDate()).padStart(2, "0")}`;

        const targetDay = days.find((day) => day.fullDate === invKey);
        if (targetDay) {
          const invAmount = Number(
            inv.netGrandTotal ?? inv.grandTotal ?? inv.netTotal ?? inv.paidAmount ?? 0
          );
          targetDay.amount += invAmount;
          targetDay.orders += 1;
          targetDay.hasSales = targetDay.amount > 0;
        }
      });
    } else if (
      isWeekly &&
      stats?.salesChartData &&
      Array.isArray(stats.salesChartData) &&
      stats.salesChartData.length > 0 &&
      stats.salesChartData.some((d) => d.amount > 0)
    ) {
      return stats.salesChartData.map((item, idx) => ({
        date: item.date,
        shortDate: item.date,
        fullDate: (item as any).fullDate || days[idx]?.fullDate || item.date,
        dayName: days[idx]?.dayName || item.date,
        amount: Number(item.amount || 0),
        orders: Number((item as any).orders || 0),
        hasSales: Number(item.amount || 0) > 0,
      }));
    }

    return days;
  }, [chartTimeframe, stats?.salesChartData, allSales, recentSales, locale]);

  const totalPeriodSales = useMemo(() => {
    return chartData.reduce((acc, d) => acc + d.amount, 0);
  }, [chartData]);

  const activeDaysCount = useMemo(() => {
    return chartData.filter((d) => d.amount > 0).length;
  }, [chartData]);

  const maxSalesDay = useMemo(() => {
    if (!chartData.some((d) => d.amount > 0)) return null;
    return [...chartData].sort((a, b) => b.amount - a.amount)[0];
  }, [chartData]);

  const hasAnyPeriodSales = totalPeriodSales > 0;

  // Custom Top Label above bars
  const renderCustomBarLabel = (props: any) => {
    const { x, y, width, value } = props;
    if (x === undefined || y === undefined) return null;

    const isWeekly = chartTimeframe === "weekly";
    const numVal = Number(value || 0);

    // In monthly view, only show labels on days with sales to prevent 30 overlapping texts
    if (!isWeekly && numVal <= 0) return null;

    const hasVal = numVal > 0;
    const text = hasVal
      ? numVal >= 1000
        ? `৳${(numVal / 1000).toFixed(numVal >= 10000 ? 0 : 1)}k`
        : `৳${numVal}`
      : "৳০";

    return (
      <text
        x={x + width / 2}
        y={y - 8}
        fill={hasVal ? "#10b981" : "#64748b"}
        textAnchor="middle"
        fontSize={isWeekly ? 10 : 8.5}
        fontWeight={hasVal ? 700 : 500}
        className="select-none font-mono tracking-tight"
      >
        {text}
      </text>
    );
  };

  // Payment Breakdown for Donut/Pie Chart
  const paymentBreakdownData = useMemo(() => {
    const sourceInvoices = allSales.length > 0 ? allSales : recentSales;

    let cashTotal = 0;
    let digitalTotal = 0;
    let dueTotal = 0;

    sourceInvoices.forEach((inv) => {
      const paid = Number(inv.paidAmount || 0);
      const due = Number(inv.dueAmount || 0);
      const method = (inv.paymentMethod || "CASH").toUpperCase();

      if (method === "CASH") {
        cashTotal += paid;
      } else {
        // BKASH, NAGAD, CARD, BANK
        digitalTotal += paid;
      }
      dueTotal += due;
    });

    // If no invoices yet but stats exist
    if (cashTotal === 0 && digitalTotal === 0 && dueTotal === 0 && totalSales > 0) {
      cashTotal = totalPaid;
      dueTotal = totalDue;
    }

    const totalCalculated = cashTotal + digitalTotal + dueTotal;

    return [
      {
        name: txt("নগদ আদায়", "Cash Collected"),
        value: cashTotal,
        color: "#10b981", // Emerald
        percentage: totalCalculated > 0 ? Math.round((cashTotal / totalCalculated) * 100) : 0,
      },
      {
        name: txt("ডিজিটাল পেমেন্ট", "Digital / Bank"),
        value: digitalTotal,
        color: "#6366f1", // Indigo
        percentage: totalCalculated > 0 ? Math.round((digitalTotal / totalCalculated) * 100) : 0,
      },
      {
        name: txt("বকেয়া / বাকি", "Due / Credit"),
        value: dueTotal,
        color: "#f43f5e", // Rose
        percentage: totalCalculated > 0 ? Math.round((dueTotal / totalCalculated) * 100) : 0,
      },
    ].filter((item) => item.value >= 0);
  }, [allSales, recentSales, totalSales, totalPaid, totalDue, txt]);

  const hasPaymentData = paymentBreakdownData.some((item) => item.value > 0);

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <DashboardHeader title={txt("দোকানের হিসাব ও সামগ্রিক অ্যানালিটিক্স", "Store Analytics & Executive Overview")} />

      <main className="p-4 sm:p-6 space-y-6 max-w-7xl">
        {/* Primary Financial KPI Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <ShimmerCard />
            <ShimmerCard />
            <ShimmerCard />
            <ShimmerCard />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Total Sales Revenue */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm relative overflow-hidden group hover:border-slate-700 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">{txt("মোট বিক্রয় রেভিনিউ", "Total Sales Revenue")}</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <ShoppingCart className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-black text-white tracking-tight">
                {formatCurrency(totalSales)}
              </p>
              <div className="mt-1 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">{txt("মোট ইনভয়েস অর্ডার", "Invoices Created")}</span>
                <span className="font-bold text-emerald-400">{totalInvoices} {txt("টি অর্ডার", "Orders")}</span>
              </div>
            </div>
          </div>

          {/* Card 2: Cash Collected */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm relative overflow-hidden group hover:border-slate-700 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">{txt("নগদ ও ডিজিটাল আদায়", "Collected Cash & Digital")}</span>
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-black text-white tracking-tight">
                {formatCurrency(totalPaid)}
              </p>
              <div className="mt-1 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">{txt("কালেকশন হার", "Collection Rate")}</span>
                <span className="font-bold text-indigo-400">{collectionRatio}% {txt("বিক্রয়ের", "of sales")}</span>
              </div>
            </div>
          </div>

          {/* Card 3: Total Due Amount */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm relative overflow-hidden group hover:border-slate-700 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">{txt("সর্বমোট বকেয়া / বাকি", "Total Market Due")}</span>
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <Wallet className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-black text-amber-400 tracking-tight">
                {formatCurrency(totalDue)}
              </p>
              <div className="mt-1 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">{txt("কাস্টমার বাকি", "Customer Due")}</span>
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
                  ? txt("প্রকৃত নিট লাভ (Net Profit)", "Net Profit")
                  : netProfit < 0
                  ? txt("প্রকৃত নিট ক্ষতি (Net Loss)", "Net Loss")
                  : txt("ব্যালেন্সড (সমান)", "Net Balance")}
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
                  {netProfit > 0 ? txt("লাভ", "Profit") : netProfit < 0 ? txt("ঘাটতি", "Loss") : txt("সমান", "Balanced")}
                </span>
              </div>
              <div className="mt-1 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">
                  {netProfit < 0 ? txt("খরচ বাদে ঘাটতি", "Loss after Expenses") : txt("দোকান খরচ", "Shop Expenses")}
                </span>
                <span className="font-semibold text-slate-300">
                  {formatCurrency(totalExpenses)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

        {/* Secondary Store Operations Metrics (Counts & Urgencies) */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <ShimmerItem height="68px" rounded="rounded-xl" />
            <ShimmerItem height="68px" rounded="rounded-xl" />
            <ShimmerItem height="68px" rounded="rounded-xl" />
            <ShimmerItem height="68px" rounded="rounded-xl" />
          </div>
        ) : (
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
                <p className="text-[11px] text-slate-400">{txt("মোট পণ্য ক্যাটালগ", "Catalog Products")}</p>
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
                <p className="text-[11px] text-slate-400">{txt("লো-স্টক সতর্কতা", "Low Stock Alert")}</p>
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
                <p className="text-[11px] text-slate-400">{txt("সক্রিয় কাস্টমার", "Active Customers")}</p>
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
                <p className="text-[11px] text-slate-400">{txt("সেলস ইনভয়েস", "Sales Invoices")}</p>
              </div>
            </div>
          </Link>
        </div>
        )}

        {/* Sales Trend Chart & AI Banner */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue Chart with Weekly / Monthly switch & distinct active/inactive day colors */}
          <div className="lg:col-span-2 p-4 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm flex flex-col justify-between">
            <div>
              {/* Header: Title, Metrics, and Timeframe Switcher */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-emerald-400" />
                      {chartTimeframe === "weekly"
                        ? txt("সাপ্তাহিক বিক্রয় পারফরম্যান্স", "Weekly Sales Velocity")
                        : txt("মাসিক বিক্রয় পারফরম্যান্স", "Monthly Sales Performance")}
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-400 border border-indigo-500/20">
                      {chartTimeframe === "weekly" ? txt("গত ৭ দিন", "Last 7 Days") : txt("গত ৩০ দিন", "Last 30 Days")}
                    </span>
                  </div>

                  {/* Summary row */}
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-xs text-slate-400">
                    <span>
                      {txt("মোট বিক্রয়:", "Total Revenue:")}{" "}
                      <strong className="text-emerald-400 font-bold font-mono">
                        {formatCurrency(totalPeriodSales)}
                      </strong>
                    </span>
                    <span className="text-slate-600">•</span>
                    <span>
                      {txt("বিক্রয়ের দিন:", "Active Selling Days:")}{" "}
                      <strong className="text-white font-medium">
                        {activeDaysCount}/{chartData.length} {txt("দিন", "days")}
                      </strong>
                    </span>
                    {maxSalesDay && maxSalesDay.amount > 0 && (
                      <>
                        <span className="text-slate-600 hidden sm:inline">•</span>
                        <span className="hidden sm:inline">
                          {txt("সর্বোচ্চ দিন:", "Peak Day:")}{" "}
                          <strong className="text-amber-400 font-semibold font-mono">
                            {maxSalesDay.date} ({formatCurrency(maxSalesDay.amount)})
                          </strong>
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Right controls: Legend & Timeframe Switch */}
                <div className="flex items-center gap-2.5 self-start sm:self-auto">
                  {/* Legend Indicator */}
                  <div className="hidden md:flex items-center gap-3 text-[11px] text-slate-400 bg-slate-950/70 px-2.5 py-1 rounded-lg border border-slate-800">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-500/50" />
                      <span className="text-emerald-400/90 font-medium">{txt("বিক্রয় হয়েছে", "Sale > ৳০")}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-slate-500" />
                      <span>{txt("বিক্রয় হয়নি", "No Sale (৳০)")}</span>
                    </div>
                  </div>

                  {/* Toggle Switch */}
                  <div className="inline-flex p-1 rounded-xl bg-slate-950 border border-slate-800 shadow-inner">
                    <button
                      type="button"
                      onClick={() => setChartTimeframe("weekly")}
                      className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                        chartTimeframe === "weekly"
                          ? "bg-indigo-600 text-white shadow-sm"
                          : "text-slate-400 hover:text-white hover:bg-slate-900"
                      }`}
                    >
                      {txt("সাপ্তাহিক", "Weekly")}
                    </button>
                    <button
                      type="button"
                      onClick={() => setChartTimeframe("monthly")}
                      className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                        chartTimeframe === "monthly"
                          ? "bg-indigo-600 text-white shadow-sm"
                          : "text-slate-400 hover:text-white hover:bg-slate-900"
                      }`}
                    >
                      {txt("মাসিক", "Monthly")}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Chart Area */}
            <div className="h-64 sm:h-72 w-full relative mt-2">
              {!hasAnyPeriodSales && (
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/90 border border-slate-700/80 text-xs font-medium text-slate-300 shadow-md backdrop-blur-sm">
                    <span className="w-2 h-2 rounded-full bg-slate-500" />
                    <span>
                      {chartTimeframe === "weekly"
                        ? txt("গত ৭ দিনে কোনো বিক্রয় সম্পন্ন হয়নি (৳০.০০)", "No sales recorded in the last 7 days (৳0.00)")
                        : txt("গত ৩০ দিনে কোনো বিক্রয় সম্পন্ন হয়নি (৳০.০০)", "No sales recorded in the last 30 days (৳0.00)")}
                    </span>
                  </div>
                </div>
              )}

              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 22, right: 10, left: -15, bottom: 0 }}
                  barSize={chartTimeframe === "weekly" ? 36 : 13}
                >
                  <defs>
                    {/* Vibrant Emerald Gradient for Active Sales Days */}
                    <linearGradient id="activeBarGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#34d399" stopOpacity={1} />
                      <stop offset="65%" stopColor="#10b981" stopOpacity={0.9} />
                      <stop offset="100%" stopColor="#059669" stopOpacity={0.8} />
                    </linearGradient>

                    {/* Subtle Muted Gradient for Inactive / Zero Sales Days */}
                    <linearGradient id="zeroBarGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#475569" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#1e293b" stopOpacity={0.25} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    stroke="#64748b" 
                    fontSize={11} 
                    tickLine={false} 
                    axisLine={{ stroke: '#334155' }}
                    interval={chartTimeframe === "monthly" ? 3 : 0}
                  />
                  <YAxis
                    stroke="#64748b"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: '#334155' }}
                    domain={[0, (dataMax: number) => (dataMax > 0 ? Math.ceil(dataMax * 1.25) : 1000)]}
                    tickFormatter={(val) => `৳${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                  />
                  <Tooltip
                    cursor={{ fill: "rgba(99, 102, 241, 0.08)", radius: 8 }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        const isZero = data.amount === 0;
                        return (
                          <div className="bg-slate-900/95 border border-slate-700/80 p-3.5 rounded-xl shadow-2xl backdrop-blur-md text-xs min-w-[210px]">
                            <div className="flex items-center justify-between gap-3 mb-2 pb-2 border-b border-slate-800">
                              <span className="font-semibold text-slate-300">
                                {data.fullDate} {data.dayName ? `(${data.dayName})` : ""}
                              </span>
                              {isZero ? (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 font-medium">
                                  {txt("বিক্রয় নেই", "No Sale")}
                                </span>
                              ) : (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                  {txt("বিক্রয় হয়েছে", "Active Sale")}
                                </span>
                              )}
                            </div>

                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between gap-4">
                                <span className="text-slate-400">{txt("মোট বিক্রয়:", "Total Sales:")}</span>
                                <span className={`font-bold font-mono text-sm ${isZero ? "text-slate-400" : "text-emerald-400"}`}>
                                  {formatCurrency(data.amount)}
                                </span>
                              </div>
                              <div className="flex items-center justify-between gap-4">
                                <span className="text-slate-400">{txt("ইনভয়েস সংখ্যা:", "Orders:")}</span>
                                <span className="text-white font-mono font-medium">
                                  {data.orders} {txt("টি", "orders")}
                                </span>
                              </div>
                              {!isZero && data.orders > 0 && (
                                <div className="flex items-center justify-between gap-4 text-[11px] pt-1 border-t border-slate-800/60">
                                  <span className="text-slate-500">{txt("গড় অর্ডার সাইজ:", "Avg Order:")}</span>
                                  <span className="text-slate-300 font-mono">
                                    {formatCurrency(Math.round(data.amount / data.orders))}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar
                    dataKey="amount"
                    minPointSize={chartTimeframe === "weekly" ? 10 : 6}
                    radius={[7, 7, 2, 2]}
                    animationDuration={600}
                  >
                    <LabelList
                      dataKey="amount"
                      position="top"
                      content={renderCustomBarLabel}
                    />
                    {chartData.map((entry, index) => {
                      const isZero = entry.amount === 0;
                      return (
                        <Cell
                          key={`cell-${index}`}
                          fill={isZero ? "url(#zeroBarGradient)" : "url(#activeBarGradient)"}
                          stroke={isZero ? "#334155" : "#10b981"}
                          strokeWidth={isZero ? 1 : 1.5}
                          className="transition-all hover:brightness-125 cursor-pointer"
                        />
                      );
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Payment & Revenue Breakdown Donut/Pie Chart */}
          <div className="p-4 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  <h3 className="text-sm font-bold text-white">
                    {txt("পেমেন্ট ও বকেয়া অনুপাত", "Payment Breakdown")}
                  </h3>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
                  {collectionRatio}% {txt("আদায়", "Collected")}
                </span>
              </div>
              <p className="text-xs text-slate-400 mb-4">
                {txt("নগদ, ডিজিটাল পেমেন্ট ও বকেয়া বিক্রয়ের তুলনামূলক চার্ট", "Cash, digital channels & outstanding customer credit distribution")}
              </p>

              {/* Donut Chart Container */}
              <div className="h-44 w-full relative flex items-center justify-center">
                {!hasPaymentData ? (
                  <div className="text-center text-slate-500 text-xs">
                    {txt("কোনো পেমেন্ট তথ্য পাওয়া যায়নি", "No transaction records found yet")}
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#0f172a",
                          borderColor: "#334155",
                          borderRadius: "10px",
                          fontSize: "12px",
                        }}
                        formatter={(val: any, name: any) => [
                          `${formatCurrency(Number(val))}`,
                          name,
                        ]}
                      />
                      <Pie
                        data={paymentBreakdownData}
                        cx="50%"
                        cy="50%"
                        innerRadius={48}
                        outerRadius={68}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {paymentBreakdownData.map((entry, index) => (
                          <Cell
                            key={`pie-cell-${index}`}
                            fill={entry.color}
                            stroke="#0f172a"
                            strokeWidth={2}
                          />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                )}

                {/* Center KPI in Donut */}
                {hasPaymentData && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-[10px] text-slate-400 uppercase font-medium">
                      {txt("মোট বিক্রয়", "Total")}
                    </span>
                    <span className="text-xs font-bold text-white font-mono">
                      {formatCurrency(totalSales)}
                    </span>
                  </div>
                )}
              </div>

              {/* Legend & Breakdown Details */}
              <div className="mt-3 space-y-2 pt-2 border-t border-slate-800/80">
                {paymentBreakdownData.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-slate-300 font-medium">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-white font-semibold">
                        {formatCurrency(item.value)}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-mono w-9 text-right">
                        {item.percentage}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick POS Shortcut */}
            <div className="pt-4">
              <Link
                href="/dashboard/pos"
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-emerald-600/20 active:scale-95"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                {txt("পিওএস ক্যাশ রেজিস্টার খুলুন", "Open POS Cash Register")}
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Invoices Table */}
        <div className="p-4 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">{txt("সাম্প্রতিক পিওএস ইনভয়েস", "Recent POS Invoices")}</h3>
              <p className="text-xs text-slate-400">
                {txt(`দোকানের সর্বশেষ লেনদেনসমূহ (${recentSales.length} টি দেখানো হচ্ছে)`, `Latest transactions from this store register (${recentSales.length} showing)`)}
              </p>
            </div>
            <Link
              href="/dashboard/sales"
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
            >
              {txt("সকল ইনভয়েস দেখুন", "View All Invoices")} &rarr;
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-xs">
              <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">{txt("ইনভয়েস #", "Invoice #")}</th>
                  <th className="py-3 px-4">{txt("কাস্টমার", "Customer")}</th>
                  <th className="py-3 px-4">{txt("সময়", "Time")}</th>
                  <th className="py-3 px-4">{txt("আইটেম", "Items")}</th>
                  <th className="py-3 px-4">{txt("টাকা", "Amount")}</th>
                  <th className="py-3 px-4">{txt("পেমেন্ট মাধ্যম", "Payment")}</th>
                  <th className="py-3 px-4">{txt("স্ট্যাটাস", "Status")}</th>
                  <th className="py-3 px-4 text-right">{txt("রসিদ প্রিন্ট", "Receipt")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {loading ? (
                  <ShimmerTableRows rows={5} cols={8} />
                ) : recentSales.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-500">
                      {txt("এখনও কোনো ইনভয়েস তৈরি হয়নি।", "No invoices found yet.")}
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
                    <td className="py-3 px-4 text-slate-300">{inv.items?.length || 1} {txt("টি", "items")}</td>
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
                        {inv.status === "PAID" ? txt("পরিশোধিত", "PAID") : inv.status === "PARTIAL" ? txt("আংশিক", "PARTIAL") : txt("বকেয়া", "DUE")}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedInvoice(inv)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition-colors"
                        title={txt("থার্মাল রসিদ প্রিন্ট করুন", "Print Thermal Receipt")}
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
