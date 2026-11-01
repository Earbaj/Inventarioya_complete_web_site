"use client";

import { useState, useEffect, useMemo } from "react";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { SalesService, AuthService, BranchesService, ReturnsService } from "@/lib/api/client";
import { Invoice, Branch, ReturnRecord } from "@/types";
import { formatCurrency, formatDate, downloadCsvFile, extractPersonName } from "@/lib/utils";
import { InvoicePrintModal } from "@/components/pos/InvoicePrintModal";
import { ReturnProcessModal } from "@/components/sales/ReturnProcessModal";
import { ChevronDown } from "lucide-react";
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
  Store,
  MoreVertical,
  RotateCcw,
  Eye,
  PackageMinus,
  ArrowDownRight,
  SlidersHorizontal,
} from "lucide-react";

import { useLanguage } from "@/context/LanguageContext";
import { ShimmerTableRows, ShimmerCard } from "@/components/ui/ShimmerSkeleton";

export default function SalesHistoryPage() {
  const { txt } = useLanguage();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [branchFilter, setBranchFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [dateFilter, setDateFilter] = useState("ALL"); // ALL, TODAY, LAST_7_DAYS, LAST_30_DAYS
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [modalMode, setModalMode] = useState<"a4" | "compact" | "thermal">("a4");
  const [showSalesReportModal, setShowSalesReportModal] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  // Returns Module States
  const [activeTab, setActiveTab] = useState<"sales" | "returns">("sales");
  const [returnModalInvoice, setReturnModalInvoice] = useState<Invoice | null>(null);
  const [returnsList, setReturnsList] = useState<ReturnRecord[]>([]);
  const [loadingReturns, setLoadingReturns] = useState(false);
  const [returnSuccessMsg, setReturnSuccessMsg] = useState<string | null>(null);

  const [returnsSearchQuery, setReturnsSearchQuery] = useState("");

  const loadReturns = async () => {
    setLoadingReturns(true);
    try {
      const res = await ReturnsService.getReturns({ page: 1, limit: 50 });
      setReturnsList(res.data || []);
    } catch (err) {
      console.error("Failed to load returns history", err);
    } finally {
      setLoadingReturns(false);
    }
  };

  const filteredReturns = useMemo(() => {
    const q = returnsSearchQuery.toLowerCase().trim();
    if (!q) return returnsList;
    return returnsList.filter((r) => {
      const invNo = (r.invoiceNumber || "").toLowerCase();
      const cName = (r.customerName || "").toLowerCase();
      const cPhone = (r.customerPhone || "").toLowerCase();
      const method = (r.refundMethod || "").toLowerCase();
      const reason = (r.reason || "").toLowerCase();
      return (
        invNo.includes(q) ||
        cName.includes(q) ||
        cPhone.includes(q) ||
        method.includes(q) ||
        reason.includes(q)
      );
    });
  }, [returnsList, returnsSearchQuery]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (!(e.target as HTMLElement).closest(".action-menu-container")) {
        setActiveMenuId(null);
      }
    }
    if (activeMenuId) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [activeMenuId]);

  const loadSales = async (page = 1, limit = 50, branch = branchFilter) => {
    setLoading(true);
    try {
      const isCustom = branch && branch !== "ALL" && branch !== "br_001" && branch !== "main";
      const res = await SalesService.getSales({
        page,
        limit,
        status: statusFilter !== "ALL" ? statusFilter : undefined,
        search: searchQuery.trim() || undefined,
        branchId: isCustom ? branch : undefined,
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
    const initialBranch = typeof window !== "undefined" ? localStorage.getItem("selected_branch_id") || "ALL" : "ALL";
    setBranchFilter(initialBranch);
    loadSales(1, 100, initialBranch);
    loadReturns();

    // Load branches for filtering
    BranchesService.getBranches()
      .then((b) => setBranches(Array.isArray(b) ? b : []))
      .catch(() => {});

    // Listen to header branch changes
    const onBranchChanged = (e: any) => {
      const newBranch = e?.detail?.branchId || "ALL";
      setBranchFilter(newBranch);
      loadSales(1, 100, newBranch);
    };
    window.addEventListener("branchChanged", onBranchChanged);
    return () => window.removeEventListener("branchChanged", onBranchChanged);
  }, []);

  const canExportExcel =
    user?.role === "admin" || user?.permissions?.canExportExcel !== false;

  // Filter invoices locally based on search, status, date filter, and branch filter
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

      const isRet =
        inv.isReturned === "partially_returned" ||
        inv.isReturned === "fully_returned" ||
        inv.isReturned === "partial" ||
        inv.isReturned === "full";
      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "RETURNED"
          ? isRet || inv.status?.toUpperCase() === "REFUNDED"
          : inv.status?.toUpperCase() === statusFilter.toUpperCase() ||
            inv.paymentStatus?.toUpperCase() === statusFilter.toUpperCase());

      // Branch filter check
      let matchesBranch = true;
      if (branchFilter !== "ALL") {
        const branchObj = branches.find((b) => b.id === branchFilter);
        const isMain = branchObj?.isMainBranch || branchFilter === "br_001" || branchFilter === "main";
        const branchName = branchObj ? branchObj.name.toLowerCase() : "";
        const invBranchId = inv.branchId || "";
        const invBranchName = (inv.branchName || "").toLowerCase();

        if (isMain) {
          // If Main branch selected, include sales with main branch ID, null, empty, or matching main name
          matchesBranch =
            !invBranchId ||
            invBranchId === branchFilter ||
            invBranchId === "br_001" ||
            invBranchId === "main" ||
            (branchName && invBranchName.includes(branchName));
        } else {
          matchesBranch =
            invBranchId === branchFilter ||
            (branchName && invBranchName.includes(branchName));
        }
      }

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

      return matchesSearch && matchesStatus && matchesBranch && matchesDate;
    });
  }, [invoices, searchQuery, statusFilter, dateFilter, branchFilter, branches]);

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

  const handleOpenInvoiceModal = (inv: Invoice, mode: "a4" | "compact" | "thermal") => {
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
  const personName = extractPersonName(activeUser, pdfShopName);
  const userRole = (activeUser?.role || "").toLowerCase();
  const canProcessReturn = userRole === "admin" || userRole === "superadmin" || activeUser?.permissions?.canProcessReturn !== false;

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <DashboardHeader title={txt("বিক্রয় ইতিহাস ও ইনভয়েস রেকর্ড", "Sales History & Invoicing Records")} />

      <main className="p-4 sm:p-6 space-y-6 max-w-7xl">
        {/* Return Success Alert Banner */}
        {returnSuccessMsg && (
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium flex items-center justify-between gap-2 shadow-lg">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{returnSuccessMsg}</span>
            </div>
            <button
              onClick={() => setReturnSuccessMsg(null)}
              className="text-emerald-400/80 hover:text-emerald-300 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* View Switcher Tabs (Sales Invoices vs Return History) */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
          <button
            type="button"
            onClick={() => setActiveTab("sales")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === "sales"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                : "bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800"
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>{txt("বিক্রয় ইনভয়েস তালিকা", "Sales Invoices")}</span>
            <span className="px-1.5 py-0.2 rounded-full bg-slate-400/50 text-[10px]">
              {filteredInvoices.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("returns");
              loadReturns();
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === "returns"
                ? "bg-amber-600 text-white shadow-lg shadow-amber-600/30"
                : "bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800"
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{txt("পণ্য ফেরত হিস্ট্রি (Returns Log)", "Returns History")}</span>
            {returnsList.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-slate-950/50 text-[10px]">
                {returnsList.length}
              </span>
            )}
          </button>
        </div>

        {activeTab === "sales" ? (
          <>
            {/* KPI Financial Overview Cards */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <ShimmerCard />
            <ShimmerCard />
            <ShimmerCard />
            <ShimmerCard />
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  {txt("মোট ইনভয়েস", "Total Invoices")}
                </span>
                <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-black text-white mt-2 font-mono">
                {filteredInvoices.length}
              </p>
              <p className="text-[10px] text-slate-500 mt-1">{txt("রেকর্ডকৃত বিক্রয় অর্ডার", "Recorded sales orders")}</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  {txt("মোট রেভিনিউ / বিক্রয়", "Total Revenue")}
                </span>
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-black text-white mt-2 font-mono">
                {formatCurrency(totalSalesRevenue)}
              </p>
              <p className="text-[10px] text-slate-500 mt-1">{txt("সর্বমোট বিক্রয়কৃত পরিমাণ", "Cumulative billed volume")}</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">
                  {txt("পরিশোধিত / আদায়কৃত", "Paid / Collected")}
                </span>
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-black text-emerald-400 mt-2 font-mono">
                {formatCurrency(totalPaidAmount)}
              </p>
              <p className="text-[10px] text-slate-500 mt-1">{txt("নগদ ও ডিজিটাল আদায়", "Cash & digital collections")}</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-rose-400 uppercase tracking-wider">
                  {txt("মোট বাকি (বকেয়া)", "Outstanding Due (Due)")}
                </span>
                <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
                  <AlertCircle className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-black text-rose-400 mt-2 font-mono">
                {formatCurrency(totalDueAmount)}
              </p>
              <p className="text-[10px] text-slate-500 mt-1">{txt("কাস্টমারদের কাছে বাকি", "Pending customer balances")}</p>
            </div>
          </div>
        )}

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
                placeholder={txt("ইনভয়েস #, কাস্টমারের নাম, ফোন বা ক্যাশিয়ার দিয়ে খুঁজুন...", "Search by invoice #, customer name, phone, or cashier...")}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 shadow-inner"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <select
            
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="appearance-none bg-slate-900 border border-slate-800 text-slate-300 text-xs rounded-xl pl-3 pr-9 py-2 focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">{txt("সকল স্ট্যাটাস", "All Status")}</option>
              <option value="PAID">{txt("পরিশোধিত (Paid)", "Paid")}</option>
              <option value="PARTIAL">{txt("আংশিক (Partial)", "Partial")}</option>
              <option value="DUE">{txt("বাকি (Due)", "Due")}</option>
              <option value="RETURNED">{txt("ফেরতকৃত (Returned)", "Returned")}</option>
              <option value="REFUNDED">{txt("রিফান্ডকৃত (Refunded)", "Refunded")}</option>
            </select>
            <ChevronDown
    size={14}
    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
  />
            </div>

            {/* Branch Filter */}
            {branches.length > 0 && (
              <div className="relative">
                <select
                  value={branchFilter}
                  onChange={(e) => {
                    setBranchFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="appearance-none bg-slate-900 border border-slate-800 text-slate-300 text-xs rounded-xl pl-3 pr-9 py-2 focus:outline-none focus:border-indigo-500 max-w-[150px] truncate"
                >
                  <option value="ALL">{txt("সকল শাখা (All Branches)", "All Branches")}</option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} {b.isMainBranch ? "★" : ""}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={14}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
              </div>
            )}

            {/* Date Range Filter */}
            <div className="relative">
              <select
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="appearance-none bg-slate-900 border border-slate-800 text-slate-300 text-xs rounded-xl pl-3 pr-9 py-2 focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">{txt("সকল তারিখ", "All Dates")}</option>
              <option value="TODAY">{txt("আজকের বিক্রয়", "Today")}</option>
              <option value="LAST_7_DAYS">{txt("গত ৭ দিন", "Last 7 Days")}</option>
              <option value="LAST_30_DAYS">{txt("গত ৩০ দিন", "Last 30 Days")}</option>
            </select>
            <ChevronDown
    size={14}
    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
  />
            </div>
          </div>

          {/* Action Buttons: Print Report & CSV */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => setShowSalesReportModal(true)}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm"
              title={txt("বিক্রয় সারসংক্ষেপ রিপোর্ট প্রিন্ট বা PDF ডাউনলোড করুন", "Print executive sales summary report or save as PDF")}
            >
              <Printer className="w-4 h-4" />
              <span>{txt("রিপোর্ট প্রিন্ট / PDF", "Print / PDF Report")}</span>
            </button>

            {canExportExcel && (
              <button
                onClick={handleExportCsv}
                className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm"
                title={txt("ফিল্টারকৃত বিক্রয় তালিকা CSV ডাউনলোড", "Export filtered sales to CSV")}
              >
                <Download className="w-4 h-4 text-emerald-400" />
                <span>{txt("CSV এক্সপোর্ট", "Export CSV")}</span>
              </button>
            )}

            <button
              onClick={() => loadSales(1, 100)}
              className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white rounded-xl transition-colors"
              title={txt("বিক্রয় ডাটা রিফ্রেশ করুন", "Refresh sales data")}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-indigo-400" : ""}`} />
            </button>
          </div>
        </div>

        {/* Invoices List Table */}
        <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto min-h-[320px]">
            <table className="w-full min-w-[800px] text-left text-xs">
              <thead className="bg-slate-950/70 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">{txt("ইনভয়েস #", "Invoice #")}</th>
                  <th className="py-3.5 px-4">{txt("তারিখ ও সময়", "Date & Time")}</th>
                  <th className="py-3.5 px-4">{txt("কাস্টমার", "Customer")}</th>
                  <th className="py-3.5 px-4">{txt("ক্যাশিয়ার", "Served By")}</th>
                  <th className="py-3.5 px-4 text-right">{txt("মোট মূল্য", "Total Amount")}</th>
                  <th className="py-3.5 px-4 text-right">{txt("পরিশোধ", "Paid")}</th>
                  <th className="py-3.5 px-4 text-right">{txt("বাকি", "Due")}</th>
                  <th className="py-3.5 px-4 text-center">{txt("স্ট্যাটাস", "Status")}</th>
                  <th className="py-3.5 px-4 text-right">{txt("অ্যাকশন / প্রিন্ট", "Action / Print")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {loading ? (
                  <ShimmerTableRows rows={8} cols={9} />
                ) : paginatedInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-500">
                      {txt("বর্তমান সার্চ বা ফিল্টারে কোনো ইনভয়েস পাওয়া যায়নি।", "No invoices found matching current search or filters.")}
                    </td>
                  </tr>
                ) : (
                  paginatedInvoices.map((inv, idx) => {
                    const isDue = Number(inv.dueAmount || 0) > 0;
                    const status = inv.status?.toUpperCase() || (isDue ? "DUE" : "PAID");
                    const invKey = inv.id || inv.invoiceNumber || String(idx);

                    return (
                      <tr
                        key={invKey}
                        className="hover:bg-slate-800/40 transition-colors group"
                      >
                        {/* Invoice Number */}
                        <td className="py-3.5 px-4">
                          <button
                            onClick={() => handleOpenInvoiceModal(inv, "a4")}
                            className="font-mono font-bold text-indigo-400 hover:text-indigo-300 hover:underline text-left block"
                            title={txt("A4 ইনভয়েস দেখুন / প্রিন্ট করুন", "View / Print A4 Invoice")}
                          >
                            {inv.invoiceNumber || inv.invoiceNo}
                          </button>
                          {inv.isReturned === "partially_returned" ? (
                            <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                              {txt("আংশিক ফেরত", "Partial Ret.")}{Number(inv.totalRefunded) > 0 ? ` (-৳${inv.totalRefunded})` : ""}
                            </span>
                          ) : inv.isReturned === "fully_returned" ? (
                            <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded text-[9px] font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30">
                              {txt("সম্পূর্ণ ফেরত", "Fully Returned")}
                            </span>
                          ) : inv.isReturned && inv.isReturned !== "none" ? (
                            <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500/20 text-amber-400">
                              {txt("ফেরতকৃত", "Returned")}
                            </span>
                          ) : null}
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
                              {txt("সাধারণ ক্রেতা", "Walk-in")}
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

                        {/* Status Badge */}
                        <td className="py-3.5 px-4 text-center">
                          {inv.isReturned === "fully_returned" ? (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider inline-block bg-purple-500/20 text-purple-400 border border-purple-500/30">
                              {txt("ফেরত সম্পন্ন", "RETURNED")}
                            </span>
                          ) : inv.isReturned === "partially_returned" ? (
                            <div className="flex flex-col items-center gap-0.5">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider inline-block ${
                                  status === "PAID"
                                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                    : status === "PARTIAL"
                                    ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                                    : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                                }`}
                              >
                                {status === "PAID"
                                  ? txt("পরিশোধিত", "PAID")
                                  : status === "PARTIAL"
                                  ? txt("আংশিক", "PARTIAL")
                                  : txt("বাকি", "DUE")}
                              </span>
                              <span className="px-1.5 py-0.2 rounded text-[8px] font-bold bg-amber-500/10 text-amber-300">
                                {txt("আংশিক ফেরত", "Partial Ret.")}
                              </span>
                            </div>
                          ) : (
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
                              {status === "PAID"
                                ? txt("পরিশোধিত", "PAID")
                                : status === "PARTIAL"
                                ? txt("আংশিক", "PARTIAL")
                                : status === "REFUNDED"
                                ? txt("রিফান্ড", "REFUNDED")
                                : txt("বাকি", "DUE")}
                            </span>
                          )}
                        </td>

                        {/* Action Buttons (MoreVertical Dropdown) */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="relative inline-block text-left action-menu-container">
                            <button
                              type="button"
                              onClick={() => setActiveMenuId(activeMenuId === invKey ? null : invKey)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                              title={txt("প্রিন্ট ও ইনভয়েস অপশন", "Print & Invoice Options")}
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>

                            {activeMenuId === invKey && (
                              <div className="absolute right-0 top-full mt-1 w-56 rounded-xl bg-slate-900 border border-slate-700/80 shadow-2xl z-50 py-1 overflow-hidden backdrop-blur-md text-left divide-y divide-slate-800/80">
                                <div className="py-1">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveMenuId(null);
                                      handleOpenInvoiceModal(inv, "a4");
                                    }}
                                    className="w-full px-3 py-2 text-left text-xs font-semibold text-slate-200 hover:bg-indigo-600/20 hover:text-indigo-300 flex items-center gap-2.5 transition-colors cursor-pointer"
                                  >
                                    <FileText className="w-3.5 h-3.5 text-indigo-400" />
                                    <span>{txt("স্ট্যান্ডার্ড ইনভয়েস (A4)", "Standard A4 Invoice")}</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveMenuId(null);
                                      handleOpenInvoiceModal(inv, "compact");
                                    }}
                                    className="w-full px-3 py-2 text-left text-xs font-semibold text-slate-200 hover:bg-blue-600/20 hover:text-blue-300 flex items-center gap-2.5 transition-colors cursor-pointer"
                                  >
                                    <SlidersHorizontal className="w-3.5 h-3.5 text-blue-400" />
                                    <span>{txt("কম্প্যাক্ট ইনভয়েস (A4)", "Compact A4 Invoice")}</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveMenuId(null);
                                      handleOpenInvoiceModal(inv, "thermal");
                                    }}
                                    className="w-full px-3 py-2 text-left text-xs font-semibold text-slate-200 hover:bg-emerald-600/20 hover:text-emerald-300 flex items-center gap-2.5 transition-colors cursor-pointer"
                                  >
                                    <Receipt className="w-3.5 h-3.5 text-emerald-400" />
                                    <span>{txt("থার্মাল স্লিপ প্রিন্ট (POS)", "Print POS Thermal Slip")}</span>
                                  </button>
                                </div>

                                {canProcessReturn && (
                                  <div className="py-1">
                                    {inv.isReturned === "fully_returned" ? (
                                      <div className="px-3 py-1.5 text-[11px] text-slate-500 italic flex items-center gap-2">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
                                        <span>{txt("সম্পূর্ণ ফেরত সম্পন্ন", "Fully Returned")}</span>
                                      </div>
                                    ) : (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setActiveMenuId(null);
                                          setReturnModalInvoice(inv);
                                        }}
                                        className="w-full px-3 py-2 text-left text-xs font-semibold text-amber-300 hover:bg-amber-600/20 flex items-center gap-2.5 transition-colors cursor-pointer"
                                      >
                                        <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                                        <span>{txt("পণ্য ফেরত / রিটার্ন নিন", "Process Sales Return")}</span>
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}
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
                {txt(
                  `দেখাচ্ছে ${filteredInvoices.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} থেকে ${Math.min(currentPage * pageSize, filteredInvoices.length)} (মোট ${filteredInvoices.length} টি বিক্রয়)`,
                  `Showing ${filteredInvoices.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} to ${Math.min(currentPage * pageSize, filteredInvoices.length)} of ${filteredInvoices.length} sales`
                )}
              </span>
              <div className="h-3 w-px bg-slate-800 mx-2" />
              <select
                aria-label={txt("প্রতি পৃষ্ঠার রেকর্ড সংখ্যা", "Rows per page")}
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-slate-300 text-xs focus:outline-none"
              >
                <option value={10}>10 {txt("টি প্রতি পৃষ্ঠায়", "per page")}</option>
                <option value={25}>25 {txt("টি প্রতি পৃষ্ঠায়", "per page")}</option>
                <option value={50}>50 {txt("টি প্রতি পৃষ্ঠায়", "per page")}</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title={txt("পূর্ববর্তী পৃষ্ঠা", "Previous Page")}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="px-3 py-1 font-semibold text-white">
                {txt(`পৃষ্ঠা ${currentPage} / ${computedTotalPages}`, `Page ${currentPage} of ${computedTotalPages}`)}
              </span>

              <button
                onClick={() => setCurrentPage((p) => Math.min(computedTotalPages, p + 1))}
                disabled={currentPage >= computedTotalPages}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title={txt("পরবর্তী পৃষ্ঠা", "Next Page")}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </>
    ) : (
      /* Returns History Tab Content */
      <div className="space-y-6">
        {/* Returns KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                {txt("মোট রিটার্ন সংখ্যা", "Total Returns")}
              </span>
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <RotateCcw className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-white mt-2 font-mono">
              {returnsList.length}
            </p>
            <p className="text-[10px] text-slate-500 mt-1">
              {txt("পণ্য ফেরত ট্রানজেকশন", "Return transactions")}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                {txt("মোট রিফান্ডকৃত অর্থ", "Total Refunded")}
              </span>
              <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-rose-400 mt-2 font-mono">
              {formatCurrency(
                returnsList.reduce(
                  (acc, r) => acc + (Number(r.totalRefund ?? r.totalRefundAmount) || 0),
                  0
                )
              )}
            </p>
            <p className="text-[10px] text-slate-500 mt-1">
              {txt("ক্যাশ ও বকেয়া সমন্বয়", "Cash & due adjusted")}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                {txt("ফেরতকৃত মোট আইটেম", "Items Restocked")}
              </span>
              <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                <PackageMinus className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-purple-400 mt-2 font-mono">
              {returnsList.reduce(
                (acc, r) =>
                  acc +
                  (r.returnedItems?.reduce(
                    (iSum, i) => iSum + (Number(i.quantity) || 0),
                    0
                  ) || 0),
                0
              )}
            </p>
            <p className="text-[10px] text-slate-500 mt-1">
              {txt("স্টকে পুনঃসংযোজিত সংখ্যা", "Quantity returned to stock")}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                {txt("বকেয়া সমন্বয়", "Due Adjusted")}
              </span>
              <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-indigo-400 mt-2 font-mono">
              {formatCurrency(
                returnsList
                  .filter((r) => r.refundMethod === "due_adjust")
                  .reduce(
                    (acc, r) => acc + (Number(r.totalRefund ?? r.totalRefundAmount) || 0),
                    0
                  )
              )}
            </p>
            <p className="text-[10px] text-slate-500 mt-1">
              {txt("কাস্টমার লেজার অ্যাডজাস্ট", "Customer ledger adjusted")}
            </p>
          </div>
        </div>

        {/* Filter & Refresh Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={returnsSearchQuery}
              onChange={(e) => setReturnsSearchQuery(e.target.value)}
              placeholder={txt(
                "ইনভয়েস নং, কাস্টমার নাম বা ফোন...",
                "Search by invoice, customer name or phone..."
              )}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
            {returnsSearchQuery && (
              <button
                onClick={() => setReturnsSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={loadReturns}
              disabled={loadingReturns}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl flex items-center gap-2 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingReturns ? "animate-spin text-indigo-400" : ""}`} />
              <span>{txt("রিফ্রেশ", "Refresh")}</span>
            </button>
          </div>
        </div>

        {/* Returns Table */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/50 text-slate-400 uppercase text-[10px] tracking-wider font-semibold">
                  <th className="py-3 px-4">{txt("তারিখ ও সময়", "Date & Time")}</th>
                  <th className="py-3 px-4">{txt("ইনভয়েস নং", "Invoice #")}</th>
                  <th className="py-3 px-4">{txt("কাস্টমার", "Customer")}</th>
                  <th className="py-3 px-4">{txt("ফেরতকৃত পণ্য ও পরিমাণ", "Returned Items & Qty")}</th>
                  <th className="py-3 px-4 text-center">{txt("রিফান্ড মাধ্যম", "Refund Method")}</th>
                  <th className="py-3 px-4 text-right">{txt("মোট রিফান্ড", "Total Refund")}</th>
                  <th className="py-3 px-4 text-right">{txt("অ্যাকশন", "Actions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {loadingReturns ? (
                  <ShimmerTableRows rows={4} cols={7} />
                ) : filteredReturns.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500">
                      <RotateCcw className="w-8 h-8 text-slate-600 mx-auto mb-2 opacity-50" />
                      <p className="font-medium">
                        {txt("কোন রিটার্ন রেকর্ড পাওয়া যায়নি", "No return records found")}
                      </p>
                      <p className="text-[11px] text-slate-600 mt-1">
                        {txt(
                          "ইনভয়েস তালিকা থেকে 'পণ্য ফেরত / রিটার্ন নিন' ক্লিক করে নতুন রিটার্ন প্রক্রিয়া করুন।",
                          "Select 'Process Sales Return' from an invoice to record a return."
                        )}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredReturns.map((ret) => {
                    const methodBadge = () => {
                      const m = (ret.refundMethod || "cash").toLowerCase();
                      if (m === "due_adjust") {
                        return (
                          <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-[10px] font-bold">
                            {txt("বকেয়া সমন্বয়", "Due Adjust")}
                          </span>
                        );
                      }
                      if (m === "bkash") {
                        return (
                          <span className="px-2 py-0.5 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-400 text-[10px] font-bold">
                            {txt("বিকাশ", "bKash")}
                          </span>
                        );
                      }
                      if (m === "nagad") {
                        return (
                          <span className="px-2 py-0.5 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-[10px] font-bold">
                            {txt("নগদ (Nagad)", "Nagad")}
                          </span>
                        );
                      }
                      return (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">
                          {txt("ক্যাশ / নগদ", "Cash")}
                        </span>
                      );
                    };

                    const linkedInv = invoices.find(
                      (inv) => inv.id === ret.saleId || inv.invoiceNumber === ret.invoiceNumber
                    );

                    return (
                      <tr key={ret.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-3 px-4 font-mono text-slate-400 text-[11px] whitespace-nowrap">
                          {formatDate(ret.date ? String(ret.date) : ret.createdAt ? String(ret.createdAt) : "")}
                        </td>
                        <td className="py-3 px-4 font-bold text-white font-mono">
                          #{ret.invoiceNumber || ret.saleId?.slice(-6) || "INV"}
                        </td>
                        <td className="py-3 px-4 text-slate-300">
                          <p className="font-semibold text-white">
                            {ret.customerName || txt("সাধারণ খদ্দের (Walk-in)", "Walk-in Customer")}
                          </p>
                          {ret.customerPhone && (
                            <p className="text-[11px] text-slate-500 font-mono">
                              {ret.customerPhone}
                            </p>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="space-y-1 max-w-xs">
                            {ret.returnedItems?.map((item, idx) => {
                              const itemTotalRefund =
                                item.refundAmount != null
                                  ? Number(item.refundAmount)
                                  : Number(item.refundAmountPerUnit || 0) * item.quantity;
                              return (
                                <div
                                  key={idx}
                                  className="flex items-center justify-between gap-2 text-[11px] bg-slate-950/40 px-2 py-1 rounded-lg border border-slate-800/60"
                                >
                                  <span className="text-slate-200 truncate font-medium">
                                    {item.name || item.itemId}
                                  </span>
                                  <span className="shrink-0 text-amber-400 font-mono font-bold">
                                    × {item.quantity} ({formatCurrency(itemTotalRefund)})
                                  </span>
                                </div>
                              );
                            })}
                            {ret.reason && (
                              <p className="text-[10px] text-slate-500 italic mt-0.5">
                                {txt("কারণ:", "Reason:")} {ret.reason}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {methodBadge()}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-rose-400 text-sm">
                          -{formatCurrency(Number(ret.totalRefund ?? ret.totalRefundAmount ?? 0))}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {linkedInv ? (
                            <button
                              type="button"
                              onClick={() => handleOpenInvoiceModal(linkedInv, "a4")}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 text-xs font-semibold transition-colors cursor-pointer"
                              title={txt("মূল ইনভয়েস দেখুন", "View Original Invoice")}
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>{txt("ইনভয়েস", "Invoice")}</span>
                            </button>
                          ) : (
                            <span className="text-[11px] text-slate-600">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )}
  </main>

      {/* Return Process Modal */}
      {returnModalInvoice && (
        <ReturnProcessModal
          isOpen={Boolean(returnModalInvoice)}
          invoice={returnModalInvoice}
          onClose={() => setReturnModalInvoice(null)}
          onSuccess={(record) => {
            setReturnModalInvoice(null);
            const refundAmt = record?.totalRefund ?? record?.totalRefundAmount ?? 0;
            setReturnSuccessMsg(
              txt(
                `ইনভয়েস #${record?.invoiceNumber || returnModalInvoice.invoiceNumber} এর রিটার্ন সফল হয়েছে! রিফান্ড: ৳${refundAmt}`,
                `Return processed successfully for invoice #${record?.invoiceNumber || returnModalInvoice.invoiceNumber}! Refund: ৳${refundAmt}`
              )
            );
            loadSales(1, 100);
            loadReturns();
          }}
        />
      )}

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
                <span className="font-bold text-xs">{txt("এক্সিকিউটিভ বিক্রয় সারসংক্ষেপ রিপোর্ট", "Executive Sales Summary Report")}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow flex items-center gap-2 transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  <span>{txt("প্রিন্ট / PDF সংরক্ষণ", "Print / Save as PDF")}</span>
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
                        <p className="text-[11px] text-slate-700 font-semibold mt-0.5">
                          {txt("স্মার্ট ক্লাউড পিওএস ও সেলস লেজার অডিট", "Smart Cloud POS & Sales Ledger Audit")}
                        </p>
                        <p className="text-[11px] text-slate-600 mt-1">
                          {pdfShopAddress || txt("ঢাকা, বাংলাদেশ", "Dhaka, Bangladesh")}
                        </p>
                        <p className="text-[11px] text-slate-600">
                          {txt("ফোন: ", "Phone: ")}{pdfShopPhone || "+880 1700-000000"}
                        </p>
                        {pdfShopEmail && (
                          <p className="text-[10px] text-slate-500">
                            {txt("ইমেইল: ", "Email: ")}{pdfShopEmail}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="inline-block bg-slate-900 text-white font-bold px-3 py-1 text-[11px] rounded uppercase mb-1.5">
                        {txt("বিক্রয় সারসংক্ষেপ রিপোর্ট", "SALES SUMMARY REPORT")}
                      </span>
                      <p className="text-[11px] text-slate-700">
                        <span className="font-semibold text-slate-900">{txt("রিপোর্টের তারিখ:", "Report Date:")}</span>{" "}
                        {new Date().toLocaleDateString(txt("bn-BD", "en-GB"), {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                      <p className="text-[11px] text-slate-700 mt-1">
                        <span className="font-semibold text-slate-900">{txt("তৈরি করেছেন:", "Generated By:")}</span>{" "}
                        <span className="font-medium text-slate-800">{personName}</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* KPI Metrics */}
                <div className="grid grid-cols-4 gap-3">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold block">
                      {txt("মোট ইনভয়েস", "Total Invoices")}
                    </span>
                    <span className="text-xl font-bold text-slate-900 mt-0.5 block">
                      {filteredInvoices.length}
                    </span>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold block">
                      {txt("মোট বিক্রয়ের পরিমাণ", "Total Sales Volume")}
                    </span>
                    <span className="text-xl font-bold text-slate-900 mt-0.5 block">
                      {formatCurrency(totalSalesRevenue)}
                    </span>
                  </div>
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                    <span className="text-[10px] text-emerald-800 uppercase font-semibold block">
                      {txt("মোট আদায় (পরিশোধিত)", "Collected (Paid)")}
                    </span>
                    <span className="text-xl font-bold text-emerald-700 mt-0.5 block">
                      {formatCurrency(totalPaidAmount)}
                    </span>
                  </div>
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg">
                    <span className="text-[10px] text-rose-700 uppercase font-semibold block">
                      {txt("মোট বকেয়া (বাকি)", "Outstanding Due")}
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
                        <th className="py-2 px-3 text-center">{txt("ক্রমিক", "SL")}</th>
                        <th className="py-2 px-3">{txt("ইনভয়েস #", "Invoice #")}</th>
                        <th className="py-2 px-3">{txt("তারিখ", "Date")}</th>
                        <th className="py-2 px-3">{txt("কাস্টমার", "Customer")}</th>
                        <th className="py-2 px-3 text-right">{txt("মোট", "Total")}</th>
                        <th className="py-2 px-3 text-right">{txt("পরিশোধ", "Paid")}</th>
                        <th className="py-2 px-3 text-right">{txt("বাকি", "Due")}</th>
                        <th className="py-2 px-3 text-center">{txt("স্ট্যাটাস", "Status")}</th>
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
                          {txt("সর্বমোট:", "Grand Totals:")}
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
                      {txt("স্টোর ম্যানেজার স্বাক্ষর", "Store Manager Signature")}
                    </div>
                  </div>
                  <div>
                    <div className="border-t border-slate-400 mx-auto w-40 pt-1 font-semibold">
                      {txt("অডিটর / হিসাবরক্ষক স্বাক্ষর", "Auditor / Accountant Signature")}
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
