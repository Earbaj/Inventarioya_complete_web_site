import { useEffect, useState, useMemo } from "react";
import { DashboardService, SalesService } from "@/lib/api/client";
import { DashboardStats, Invoice } from "@/types";
import { useLanguage } from "@/context/LanguageContext";

/**
 * ড্যাশবোর্ড ওভারভিউ ডাটা ও চার্ট ক্যালকুলেশন হুক (Dashboard Data Hook)
 * নির্বাচিত ব্রাঞ্চের পরিসংখ্যান, সাম্প্রতিক বিক্রয় তালিকা এবং চার্টের সাপ্তাহিক/মাসিক ডাটা প্রক্রিয়া করে।
 */
export function useDashboardData() {
  const { txt } = useLanguage();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [allSales, setAllSales] = useState<Invoice[]>([]);
  const [recentSales, setRecentSales] = useState<Invoice[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<string>("ALL");
  const [loading, setLoading] = useState(true);
  const [chartTimeframe, setChartTimeframe] = useState<"weekly" | "monthly">("weekly");

  const loadData = async (activeBranch?: string) => {
    try {
      const branchToFilter =
        activeBranch !== undefined
          ? activeBranch
          : typeof window !== "undefined"
          ? localStorage.getItem("selected_branch_id") || "ALL"
          : "ALL";

      const [statsData, salesData] = await Promise.all([
        DashboardService.getStats({ branchId: branchToFilter }),
        SalesService.getSales({ branchId: branchToFilter, limit: 100 }),
      ]);
      setStats(statsData);
      const salesList = Array.isArray(salesData) ? salesData : salesData?.data || [];
      setAllSales(salesList);

      const filtered =
        branchToFilter && branchToFilter !== "ALL"
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
    const savedBranch =
      typeof window !== "undefined"
        ? localStorage.getItem("selected_branch_id") || "ALL"
        : "ALL";
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

  const totalItems = stats?.totalItemsCount ?? 0;
  const lowStock = stats?.lowStockCount ?? stats?.lowStockItems ?? 0;
  const totalCustomers = stats?.totalCustomersCount ?? stats?.totalCustomers ?? 0;
  const totalInvoices =
    stats?.totalInvoicesCount ?? (allSales.length > 0 ? allSales.length : stats?.todayOrders ?? 0);

  const collectionRatio = totalSales > 0 ? Math.round((totalPaid / totalSales) * 100) : 0;

  // সাপ্তাহিক (৭ দিন) ও মাসিক (৩০ দিন) বিক্রয়ের ডাটা চার্টের জন্য প্রস্তুত করা
  const chartData = useMemo(() => {
    const dayNamesBn = ["রবি", "সোম", "মঙ্গল", "বুধ", "বৃহঃ", "শুক্র", "শনি"];
    const dayNamesEn = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    const isWeekly = chartTimeframe === "weekly";
    const daysCount = isWeekly ? 7 : 30;

    const days: {
      date: string;
      fullDate: string;
      dayName: string;
      amount: number;
      orders: number;
      timestamp: number;
    }[] = [];

    const now = new Date();
    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const dayOfWeek = d.getDay();

      const label = isWeekly
        ? txt(dayNamesBn[dayOfWeek], dayNamesEn[dayOfWeek])
        : d.toLocaleDateString("en-US", { month: "short", day: "numeric" });

      days.push({
        date: label,
        fullDate: dateStr,
        dayName: txt(dayNamesBn[dayOfWeek], dayNamesEn[dayOfWeek]),
        amount: 0,
        orders: 0,
        timestamp: d.getTime(),
      });
    }

    allSales.forEach((sale) => {
      const saleDateStr = (sale.createdAt || sale.date || "").split("T")[0];
      const targetDay = days.find((d) => d.fullDate === saleDateStr);
      if (targetDay) {
        targetDay.amount += Number(sale.grandTotal || 0);
        targetDay.orders += 1;
      }
    });

    return days;
  }, [allSales, chartTimeframe, txt]);

  const totalPeriodSales = useMemo(
    () => chartData.reduce((sum, d) => sum + d.amount, 0),
    [chartData]
  );

  const activeDaysCount = useMemo(
    () => chartData.filter((d) => d.amount > 0).length,
    [chartData]
  );

  const maxSalesDay = useMemo(() => {
    if (!chartData.some((d) => d.amount > 0)) return null;
    return [...chartData].sort((a, b) => b.amount - a.amount)[0];
  }, [chartData]);

  // পেমেন্ট মাধ্যম ভিত্তিক ব্রেকডাউন (নগদ, ডিজিটাল, বাকি)
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
        digitalTotal += paid;
      }
      dueTotal += due;
    });

    if (cashTotal === 0 && digitalTotal === 0 && dueTotal === 0 && totalSales > 0) {
      cashTotal = totalPaid;
      dueTotal = totalDue;
    }

    const totalCalculated = cashTotal + digitalTotal + dueTotal;

    return [
      {
        name: txt("নগদ আদায়", "Cash Collected"),
        value: cashTotal,
        color: "#10b981",
        percentage: totalCalculated > 0 ? Math.round((cashTotal / totalCalculated) * 100) : 0,
      },
      {
        name: txt("ডিজিটাল পেমেন্ট", "Digital / Bank"),
        value: digitalTotal,
        color: "#6366f1",
        percentage:
          totalCalculated > 0 ? Math.round((digitalTotal / totalCalculated) * 100) : 0,
      },
      {
        name: txt("বকেয়া / বাকি", "Due / Credit"),
        value: dueTotal,
        color: "#f43f5e",
        percentage: totalCalculated > 0 ? Math.round((dueTotal / totalCalculated) * 100) : 0,
      },
    ].filter((item) => item.value >= 0);
  }, [allSales, recentSales, totalSales, totalPaid, totalDue, txt]);

  return {
    loading,
    totalSales,
    totalPaid,
    totalDue,
    customerDue,
    totalExpenses,
    netProfit,
    totalItems,
    lowStock,
    totalCustomers,
    totalInvoices,
    collectionRatio,
    recentSales,
    chartData,
    chartTimeframe,
    setChartTimeframe,
    totalPeriodSales,
    activeDaysCount,
    maxSalesDay,
    paymentBreakdownData,
  };
}
