"use client";

import { useState } from "react";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { Invoice } from "@/types";
import { ThermalReceipt } from "@/components/pos/ThermalReceipt";
import { useLanguage } from "@/context/LanguageContext";
import { useDashboardData } from "@/hooks/useDashboardData";
import { OverviewFinancialCards } from "@/components/dashboard/OverviewFinancialCards";
import { OverviewOperationPills } from "@/components/dashboard/OverviewOperationPills";
import { SalesVelocityChart } from "@/components/dashboard/SalesVelocityChart";
import { PaymentBreakdownDonut } from "@/components/dashboard/PaymentBreakdownDonut";
import { RecentInvoicesTable } from "@/components/dashboard/RecentInvoicesTable";

/**
 * দোকানের প্রধান ড্যাশবোর্ড ও এক্সিকিউটিভ ওভারভিউ (Main Dashboard Overview Page)
 * সামগ্রিক রেভিনিউ কেপিআই, সাপ্তাহিক/মাসিক বিক্রয় ট্রেন্ড চার্ট, পেমেন্ট ব্রেকডাউন ও সাম্প্রতিক ইনভয়েস দেখায়।
 */
export default function DashboardOverviewPage() {
  const { txt } = useLanguage();
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  // কাস্টম ড্যাশবোর্ড ডাটা হুক
  const {
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
  } = useDashboardData();

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <DashboardHeader
        title={txt(
          "দোকানের হিসাব ও সামগ্রিক অ্যানালিটিক্স",
          "Store Analytics & Executive Overview"
        )}
      />

      <main className="p-4 sm:p-6 space-y-6 max-w-7xl">
        {/* ১. প্রধান আর্থিক কেপিআই কার্ডস (রেভিনিউ, আদায়, বকেয়া, নিট লাভ) */}
        <OverviewFinancialCards
          loading={loading}
          totalSales={totalSales}
          totalInvoices={totalInvoices}
          totalPaid={totalPaid}
          collectionRatio={collectionRatio}
          totalDue={totalDue}
          customerDue={customerDue}
          netProfit={netProfit}
          totalExpenses={totalExpenses}
        />

        {/* ২. অপারেশনাল মেট্রিক্স ও শর্টকাট পিলস (পণ্য, লো-স্টক, কাস্টমার, অর্ডার) */}
        <OverviewOperationPills
          loading={loading}
          totalItems={totalItems}
          lowStock={lowStock}
          totalCustomers={totalCustomers}
          totalInvoices={totalInvoices}
        />

        {/* ৩. সেলস ট্রেন্ড বার চার্ট ও পেমেন্ট ব্রেকডাউন ডোনাট চার্ট */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* সাপ্তাহিক / মাসিক বিক্রয় বার চার্ট */}
          <SalesVelocityChart
            chartData={chartData}
            chartTimeframe={chartTimeframe}
            setChartTimeframe={setChartTimeframe}
            totalPeriodSales={totalPeriodSales}
            activeDaysCount={activeDaysCount}
            maxSalesDay={maxSalesDay}
          />

          {/* পেমেন্ট ও বকেয়া অনুপাত ডোনাট চার্ট */}
          <PaymentBreakdownDonut
            paymentBreakdownData={paymentBreakdownData}
            totalSales={totalSales}
            collectionRatio={collectionRatio}
          />
        </div>

        {/* ৪. সাম্প্রতিক পিওএস ইনভয়েস টেবিল */}
        <RecentInvoicesTable
          loading={loading}
          recentSales={recentSales}
          onSelectInvoice={(inv) => setSelectedInvoice(inv)}
        />
      </main>

      {/* থার্মাল রসিদ প্রিন্ট মোডাল */}
      {selectedInvoice && (
        <ThermalReceipt
          invoice={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
        />
      )}
    </div>
  );
}
