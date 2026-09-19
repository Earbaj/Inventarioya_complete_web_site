"use client";

import { useState, useEffect, useCallback } from "react";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { AIService, AuthService, CustomerService } from "@/lib/api/client";
import {
  Customer,
  CustomerLedgerEntry,
  WhatsAppReminderResponse,
  AICustomerCreditScore,
} from "@/types";
import { formatCurrency, formatDate, downloadCsvFile } from "@/lib/utils";
import {
  Users,
  Search,
  Download,
  Sparkles,
  Phone,
  MapPin,
  Plus,
  Pencil,
  Trash2,
  Printer,
  BookOpen,
  FileText,
  AlertCircle,
  Calendar,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  X,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  DollarSign,
} from "lucide-react";

function WhatsAppIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86.174.086.275.072.376-.044.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.203c.043.072.043.419-.101.824z" />
      <path d="M12 2C6.477 2 2 6.477 2 12c0 1.891.523 3.662 1.434 5.178L2 22l4.954-1.399C8.423 21.493 10.153 22 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.2c-1.637 0-3.17-.468-4.476-1.28l-.321-.2-3.15.89.907-3.058-.216-.334C3.864 14.887 3.4 13.486 3.4 12c0-4.742 3.858-8.6 8.6-8.6 4.741 0 8.6 3.858 8.6 8.6 0 4.741-3.859 8.6-8.6 8.6z" />
    </svg>
  );
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(15);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // User auth & permissions
  const [user, setUser] = useState<any>(null);

  // Success / Error alerts
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showLedgerModal, setShowLedgerModal] = useState(false);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [selectedCustomerForPdf, setSelectedCustomerForPdf] = useState<Customer | null>(null);

  // Selected customer for action
  const [activeCustomer, setActiveCustomer] = useState<Customer | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    openingBalance: 0,
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Ledger state
  const [ledgerEntries, setLedgerEntries] = useState<CustomerLedgerEntry[]>([]);
  const [ledgerLoading, setLedgerLoading] = useState(false);
  const [ledgerStartDate, setLedgerStartDate] = useState("");
  const [ledgerEndDate, setLedgerEndDate] = useState("");
  const [ledgerPage, setLedgerPage] = useState(1);
  const [ledgerTotalPages, setLedgerTotalPages] = useState(1);
  const [ledgerSortOrder, setLedgerSortOrder] = useState<"asc" | "desc">("asc");

  // WhatsApp Reminder State
  const [reminderData, setReminderData] = useState<WhatsAppReminderResponse | null>(null);
  const [reminderLoading, setReminderLoading] = useState(false);
  const [reminderError, setReminderError] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedMessage, setCopiedMessage] = useState(false);

  // AI Credit Score
  const [selectedCustomerScore, setSelectedCustomerScore] = useState<AICustomerCreditScore | null>(null);
  const [evaluatingId, setEvaluatingId] = useState<string | null>(null);

  // Check permissions
  const canEditCustomers = user?.role === "admin" || user?.permissions?.canEditCustomers !== false;
  const canExportExcel = user?.role === "admin" || user?.permissions?.canExportExcel !== false;

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const loadCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await CustomerService.getCustomers({
        search: searchQuery,
        page,
        limit,
        sortBy,
        sortOrder,
      });
      setCustomers(res.data || []);
      if (res.meta) {
        setTotalPages(res.meta.totalPages || 1);
        setTotalCount(res.meta.total || (res.data ? res.data.length : 0));
      }
    } catch (err: any) {
      console.error("Failed to load customers", err);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, page, limit, sortBy, sortOrder]);

  useEffect(() => {
    setUser(AuthService.getCurrentUser());
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadCustomers();
    }, 250);
    return () => clearTimeout(timer);
  }, [loadCustomers]);

  // Outstanding due calculation from closing balance
  const getDueAmount = (c: Customer): number => {
    const closing = Number(c.closingBalance || 0);
    if (closing < 0) return Math.abs(closing);
    if (c.totalDue && Number(c.totalDue) > 0) return Number(c.totalDue);
    return 0;
  };

  const totalOutstandingDue = customers.reduce((sum, c) => sum + getDueAmount(c), 0);
  const customersWithDue = customers.filter((c) => getDueAmount(c) > 0).length;
  const clearedCustomers = customers.filter((c) => getDueAmount(c) === 0).length;

  // Open Add Modal
  const handleOpenAdd = () => {
    setFormData({ name: "", phone: "", address: "", openingBalance: 0 });
    setFormError(null);
    setShowAddModal(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (customer: Customer) => {
    setActiveCustomer(customer);
    setFormData({
      name: customer.name || "",
      phone: customer.phone || "",
      address: customer.address || "",
      openingBalance: Number(customer.openingBalance || 0),
    });
    setFormError(null);
    setShowEditModal(true);
  };

  // Open Delete Confirmation
  const handleOpenDelete = (customer: Customer) => {
    setActiveCustomer(customer);
    setShowDeleteModal(true);
  };

  // Submit Create Customer
  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) {
      setFormError("Please enter both Customer Name and Phone Number.");
      return;
    }

    setFormLoading(true);
    setFormError(null);

    try {
      await CustomerService.createCustomer({
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
        openingBalance: Number(formData.openingBalance || 0),
      });

      setShowAddModal(false);
      showToast("Customer registered successfully with opening balance!");
      loadCustomers();
    } catch (err: any) {
      setFormError(err.message || "Failed to create customer. Please check your inputs.");
    } finally {
      setFormLoading(false);
    }
  };

  // Submit Update Customer
  const handleUpdateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCustomer) return;
    if (!formData.name.trim() || !formData.phone.trim()) {
      setFormError("Please enter both Customer Name and Phone Number.");
      return;
    }

    setFormLoading(true);
    setFormError(null);

    try {
      await CustomerService.updateCustomer(activeCustomer.id, {
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
      });

      setShowEditModal(false);
      showToast("Customer updated successfully!");
      loadCustomers();
    } catch (err: any) {
      setFormError(err.message || "Failed to update customer.");
    } finally {
      setFormLoading(false);
    }
  };

  // Submit Soft Delete
  const handleDeleteCustomer = async () => {
    if (!activeCustomer) return;
    setFormLoading(true);
    try {
      await CustomerService.deleteCustomer(activeCustomer.id);
      setShowDeleteModal(false);
      showToast("Customer moved to trash (Soft deleted). Can be restored from Recycle Bin.");
      loadCustomers();
    } catch (err: any) {
      showToast(err.message || "Failed to delete customer.", "error");
    } finally {
      setFormLoading(false);
    }
  };

  // Open Ledger Statement History Modal
  const handleOpenLedger = async (customer: Customer) => {
    setActiveCustomer(customer);
    setShowLedgerModal(true);
    setLedgerPage(1);
    loadLedger(customer.id, 1, ledgerStartDate, ledgerEndDate, ledgerSortOrder);
  };

  const loadLedger = async (
    customerId: string,
    pg: number,
    start?: string,
    end?: string,
    order: "asc" | "desc" = "asc"
  ) => {
    setLedgerLoading(true);
    try {
      const res = await CustomerService.getCustomerLedger(customerId, {
        page: pg,
        limit: 15,
        startDate: start || undefined,
        endDate: end || undefined,
        sortBy: "date",
        sortOrder: order,
      });
      setLedgerEntries(res.data || []);
      if (res.meta) {
        setLedgerTotalPages(res.meta.totalPages || 1);
      }
    } catch (err: any) {
      console.error("Failed to load customer ledger", err);
    } finally {
      setLedgerLoading(false);
    }
  };

  // Open WhatsApp Due Reminder Modal
  const handleOpenWhatsAppReminder = async (customer: Customer) => {
    setActiveCustomer(customer);
    setShowWhatsAppModal(true);
    setReminderLoading(true);
    setReminderError(null);
    setCopiedLink(false);
    setCopiedMessage(false);

    try {
      const res = await CustomerService.getDueReminderLink(customer.id);
      setReminderData(res);
    } catch (err: any) {
      setReminderError(err.message || "Failed to generate WhatsApp reminder link.");
    } finally {
      setReminderLoading(false);
    }
  };

  // Export Customers CSV
  const handleExportCustomers = () => {
    const formatted = customers.map((c) => ({
      ID: c.id,
      Name: c.name,
      Phone: c.phone,
      Address: c.address || "N/A",
      OpeningBalance: c.openingBalance || "0.00",
      ClosingBalance: c.closingBalance || "0.00",
      DueAmount: getDueAmount(c),
      Status: getDueAmount(c) > 0 ? "DUE" : "CLEARED",
      CreatedDate: c.createdAt ? c.createdAt.split("T")[0] : "N/A",
    }));
    downloadCsvFile(formatted, `Inventarioya_Customers_${new Date().toISOString().split("T")[0]}`);
  };

  // Export Single Customer Ledger CSV
  const handleExportSingleLedger = () => {
    if (!activeCustomer || !ledgerEntries.length) return;
    const formatted = ledgerEntries.map((e) => ({
      Date: formatDate(e.date),
      Type: e.type.toUpperCase(),
      Description: e.description,
      Amount: e.amount,
      PreviousBalance: e.previousBalance,
      NewBalance: e.newBalance,
      ReferenceId: e.referenceId || "N/A",
    }));
    downloadCsvFile(
      formatted,
      `Ledger_${activeCustomer.name.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}`
    );
  };

  // AI Credit Risk Assessment
  const handleRunAICreditCheck = async (cust: Customer) => {
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
      <DashboardHeader title="Customer Ledgers & Due Management (কাস্টমার খাতা)" />

      <main className="p-4 sm:p-6 space-y-6 max-w-7xl">
        {/* Notification Banner */}
        {notification && (
          <div
            className={`p-4 rounded-xl flex items-center justify-between text-xs font-semibold ${
              notification.type === "success"
                ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-300"
                : "bg-rose-500/15 border border-rose-500/30 text-rose-300"
            }`}
          >
            <div className="flex items-center gap-2">
              {notification.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400" />
              )}
              <span>{notification.message}</span>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Top Summary Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span>Total Customers</span>
              <Users className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-2xl font-bold text-white mt-1">{totalCount}</div>
            <div className="text-[11px] text-slate-500 mt-1">Active customer profiles</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-rose-500/20 shadow-sm bg-gradient-to-br from-slate-900 to-rose-950/20">
            <div className="flex items-center justify-between text-rose-300 text-xs mb-1">
              <span>Total Outstanding Due</span>
              <DollarSign className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-2xl font-black text-rose-400 mt-1">
              {formatCurrency(totalOutstandingDue)}
            </div>
            <div className="text-[11px] text-rose-400/80 mt-1">
              মোট অপরিশোধিত বাকি
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-amber-500/20 shadow-sm">
            <div className="flex items-center justify-between text-amber-400 text-xs mb-1">
              <span>With Outstanding Due</span>
              <AlertCircle className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-bold text-amber-400 mt-1">{customersWithDue}</div>
            <div className="text-[11px] text-slate-500 mt-1">Pending payments</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-emerald-500/20 shadow-sm">
            <div className="flex items-center justify-between text-emerald-400 text-xs mb-1">
              <span>Cleared Accounts</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-emerald-400 mt-1">{clearedCustomers}</div>
            <div className="text-[11px] text-slate-500 mt-1">Zero due balance</div>
          </div>
        </div>

        {/* Search, Filter & Action Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex flex-1 items-center gap-2 max-w-lg">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                placeholder="Search customer by name or phone..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            {/* Sort Order Selector */}
            <select
              value={`${sortBy}_${sortOrder}`}
              onChange={(e) => {
                const [newSort, newOrder] = e.target.value.split("_");
                setSortBy(newSort);
                setSortOrder(newOrder as "asc" | "desc");
              }}
              className="bg-slate-900 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500"
            >
              <option value="createdAt_desc">Newest First</option>
              <option value="createdAt_asc">Oldest First</option>
              <option value="name_asc">Name (A-Z)</option>
              <option value="name_desc">Name (Z-A)</option>
              <option value="closingBalance_asc">Highest Due First</option>
            </select>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleOpenAdd}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors shrink-0 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Add Customer
            </button>

            <button
              onClick={() => {
                setSelectedCustomerForPdf(null);
                setShowPdfModal(true);
              }}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors shrink-0"
              title="Print Customer Ledger and Due Summary Report"
            >
              <Printer className="w-4 h-4 text-indigo-400" />
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
            <table className="w-full min-w-[850px] text-left text-xs">
              <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Phone</th>
                  <th className="py-3 px-4">Address</th>
                  <th className="py-3 px-4 text-right">Opening Balance</th>
                  <th className="py-3 px-4 text-right">Current Due (বাকি)</th>
                  <th className="py-3 px-4 text-center">AI Credit</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500">
                      <div className="inline-flex items-center gap-2">
                        <RefreshCw className="w-4 h-4 animate-spin text-indigo-400" />
                        Loading customers...
                      </div>
                    </td>
                  </tr>
                ) : customers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500">
                      <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      No customers found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  customers.map((cust) => {
                    const due = getDueAmount(cust);
                    const rawClosing = Number(cust.closingBalance || 0);

                    return (
                      <tr key={cust.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-semibold text-white">{cust.name}</div>
                          <div className="text-[10px] text-slate-500 font-mono">ID: {cust.id.slice(0, 10)}...</div>
                        </td>

                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5 text-slate-300 font-mono">
                            <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                            {cust.phone}
                          </div>
                        </td>

                        <td className="py-3 px-4 text-slate-400 max-w-[180px] truncate">
                          {cust.address ? (
                            <span className="flex items-center gap-1" title={cust.address}>
                              <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                              <span className="truncate">{cust.address}</span>
                            </span>
                          ) : (
                            <span className="text-slate-600 italic">None</span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-right font-medium text-slate-300">
                          {formatCurrency(cust.openingBalance || 0)}
                        </td>

                        <td className="py-3 px-4 text-right">
                          {due > 0 ? (
                            <div className="inline-flex flex-col items-end">
                              <span className="font-black text-rose-400 px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/20">
                                {formatCurrency(due)} Due
                              </span>
                              <span className="text-[10px] text-rose-400/80 font-medium">
                                বকেয়া পাওনা
                              </span>
                            </div>
                          ) : rawClosing > 0 ? (
                            <div className="inline-flex flex-col items-end">
                              <span className="font-bold text-sky-400 px-2 py-0.5 rounded bg-sky-500/10 border border-sky-500/20">
                                +{formatCurrency(rawClosing)} Advance
                              </span>
                              <span className="text-[10px] text-sky-400/80">অগ্রিম জমা</span>
                            </div>
                          ) : (
                            <span className="font-medium text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                              Cleared (৳0)
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => handleRunAICreditCheck(cust)}
                            disabled={evaluatingId === cust.id}
                            className="px-2 py-1 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 text-[11px] font-medium inline-flex items-center gap-1 transition-colors"
                            title="Analyze customer credit rating with Gemini AI"
                          >
                            <Sparkles className="w-3 h-3 text-purple-400" />
                            <span>
                              {evaluatingId === cust.id ? "Analyzing..." : "Score"}
                            </span>
                          </button>
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* View Ledger Statement Button */}
                            <button
                              onClick={() => handleOpenLedger(cust)}
                              className="px-2.5 py-1.5 rounded-lg bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border border-indigo-500/30 text-[11px] font-semibold inline-flex items-center gap-1.5 transition-colors"
                              title="View Customer Ledger Statement (হিসাব খাতা)"
                            >
                              <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                              Ledger
                            </button>

                            {/* WhatsApp Due Reminder Button */}
                            <button
                              onClick={() => handleOpenWhatsAppReminder(cust)}
                              className={`p-1.5 rounded-lg transition-colors border ${
                                due > 0
                                  ? "bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border-emerald-500/40"
                                  : "bg-slate-800 hover:bg-slate-700 text-slate-400 border-slate-700"
                              }`}
                              title={
                                due > 0
                                  ? `Send WhatsApp Due Reminder (${formatCurrency(due)})`
                                  : "Open WhatsApp Contact"
                              }
                            >
                              <WhatsAppIcon className="w-3.5 h-3.5 text-emerald-400" />
                            </button>

                            {/* Print Single Statement */}
                            <button
                              onClick={() => {
                                setSelectedCustomerForPdf(cust);
                                setShowPdfModal(true);
                              }}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                              title="Print Single Customer Statement"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>

                            {/* Edit Customer */}
                            {canEditCustomers && (
                              <button
                                onClick={() => handleOpenEdit(cust)}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                                title="Edit Customer Information"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {/* Soft Delete Customer */}
                            {canEditCustomers && (
                              <button
                                onClick={() => handleOpenDelete(cust)}
                                className="p-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 border border-rose-500/30 transition-colors"
                                title="Move Customer to Recycle Bin"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
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
          {totalPages > 1 && (
            <div className="px-4 py-3 bg-slate-950/60 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <div>
                Showing page <span className="font-semibold text-white">{page}</span> of{" "}
                <span className="font-semibold text-white">{totalPages}</span> ({totalCount} total customers)
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors inline-flex items-center gap-1"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  Prev
                </button>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors inline-flex items-center gap-1"
                >
                  Next
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ========================================================================= */}
      {/* 1. CREATE CUSTOMER MODAL (POST /api/customers)                            */}
      {/* ========================================================================= */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Register New Customer</h3>
                  <p className="text-[11px] text-slate-400">Add customer to ledger directory</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Free Tier Notice */}
            <div className="mb-4 p-3 rounded-xl bg-slate-950 border border-indigo-500/20 text-[11px] text-slate-300">
              <span className="font-semibold text-indigo-400">💡 Tip:</span> Registers a new customer and automatically logs an initial opening balance in the customer&apos;s ledger statement. Free Tier is limited to 1 active customer.
            </div>

            {formError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateCustomer} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Customer Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahim Traders"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Phone Number <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 01711223344"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Address (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mirpur-10, Dhaka"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Initial Opening Balance (৳)
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.openingBalance}
                  onChange={(e) => setFormData({ ...formData, openingBalance: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Logged as initial &apos;opening&apos; ledger balance statement entry.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors shadow-sm"
                >
                  {formLoading ? "Creating..." : "Save Customer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. EDIT CUSTOMER MODAL (PUT /api/customers/:id)                           */}
      {/* ========================================================================= */}
      {showEditModal && activeCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center">
                  <Pencil className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Edit Customer Profile</h3>
                  <p className="text-[11px] text-slate-400">{activeCustomer.name}</p>
                </div>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleUpdateCustomer} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Customer Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Phone Number <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors shadow-sm"
                >
                  {formLoading ? "Saving..." : "Update Customer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. SOFT DELETE MODAL (DELETE /api/customers/:id)                           */}
      {/* ========================================================================= */}
      {showDeleteModal && activeCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-rose-500/30 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Move Customer to Trash</h3>
                <p className="text-[11px] text-slate-400">Soft-delete customer record</p>
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-300 mb-6 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
              <p>
                Are you sure you want to delete{" "}
                <span className="font-bold text-white">{activeCustomer.name}</span>?
              </p>
              <p className="text-slate-400 text-[11px]">
                This will soft-delete the customer profile and its associated ledger statement records to the Recycle Bin. You can restore them anytime from the Recycle Bin.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteCustomer}
                disabled={formLoading}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition-colors"
              >
                {formLoading ? "Deleting..." : "Move to Trash"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. CUSTOMER LEDGER STATEMENT MODAL (GET /api/customers/:id/ledger)       */}
      {/* ========================================================================= */}
      {showLedgerModal && activeCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-6 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-5xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="bg-slate-950 border-b border-slate-800 px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span>{activeCustomer.name}</span>
                    <span className="text-xs font-normal text-slate-400 font-mono">({activeCustomer.phone})</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Customer Ledger Statement History (হিসাব খাতা ও লেনদেন বিবরণী)
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenWhatsAppReminder(activeCustomer)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
                >
                  <WhatsAppIcon className="w-3.5 h-3.5 text-emerald-400" />
                  Due Reminder
                </button>

                {canExportExcel && (
                  <button
                    onClick={handleExportSingleLedger}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-400" />
                    CSV
                  </button>
                )}

                <button
                  onClick={() => {
                    setSelectedCustomerForPdf(activeCustomer);
                    setShowPdfModal(true);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print
                </button>

                <button
                  onClick={() => setShowLedgerModal(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors ml-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Quick KPI Bar */}
            <div className="bg-slate-950/40 px-6 py-3 border-b border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">Opening Balance</span>
                <span className="font-bold text-white text-sm font-mono">
                  {formatCurrency(activeCustomer.openingBalance || 0)}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">Current Net Balance</span>
                <span className="font-bold text-white text-sm font-mono">
                  {formatCurrency(activeCustomer.closingBalance || 0)}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-rose-400 uppercase font-semibold block">Outstanding Due (বাকি)</span>
                <span className="font-black text-rose-400 text-sm font-mono">
                  {formatCurrency(getDueAmount(activeCustomer))}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">Address</span>
                <span className="text-slate-300 truncate block">
                  {activeCustomer.address || "No address specified"}
                </span>
              </div>
            </div>

            {/* Filters Row */}
            <div className="p-4 border-b border-slate-800 bg-slate-900/60 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-slate-400 text-[11px]">From:</span>
                  <input
                    type="date"
                    value={ledgerStartDate}
                    onChange={(e) => setLedgerStartDate(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-white text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400 text-[11px]">To:</span>
                  <input
                    type="date"
                    value={ledgerEndDate}
                    onChange={(e) => setLedgerEndDate(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-white text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <select
                  value={ledgerSortOrder}
                  onChange={(e) => {
                    const newOrder = e.target.value as "asc" | "desc";
                    setLedgerSortOrder(newOrder);
                    loadLedger(activeCustomer.id, 1, ledgerStartDate, ledgerEndDate, newOrder);
                  }}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-slate-300 text-xs focus:outline-none focus:border-indigo-500"
                >
                  <option value="asc">Date: Oldest First</option>
                  <option value="desc">Date: Newest First</option>
                </select>

                <button
                  onClick={() =>
                    loadLedger(activeCustomer.id, 1, ledgerStartDate, ledgerEndDate, ledgerSortOrder)
                  }
                  className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors font-medium"
                >
                  Filter
                </button>

                {(ledgerStartDate || ledgerEndDate) && (
                  <button
                    onClick={() => {
                      setLedgerStartDate("");
                      setLedgerEndDate("");
                      loadLedger(activeCustomer.id, 1, "", "", ledgerSortOrder);
                    }}
                    className="text-slate-400 hover:text-white text-[11px] underline"
                  >
                    Clear Filter
                  </button>
                )}
              </div>

              <div className="text-[11px] text-slate-400">
                Total Statements: <span className="font-semibold text-white">{ledgerEntries.length}</span>
              </div>
            </div>

            {/* Statement Table */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="rounded-xl border border-slate-800 overflow-hidden bg-slate-950/40">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/80 text-slate-400 uppercase font-semibold border-b border-slate-800">
                    <tr>
                      <th className="py-2.5 px-4">Date & Time</th>
                      <th className="py-2.5 px-4">Type</th>
                      <th className="py-2.5 px-4">Description / Reference</th>
                      <th className="py-2.5 px-4 text-right">Amount (৳)</th>
                      <th className="py-2.5 px-4 text-right">Prev Balance</th>
                      <th className="py-2.5 px-4 text-right">New Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {ledgerLoading ? (
                      <tr>
                        <td colSpan={6} className="py-10 text-center text-slate-500">
                          <RefreshCw className="w-4 h-4 animate-spin mx-auto mb-1 text-indigo-400" />
                          Loading ledger statements...
                        </td>
                      </tr>
                    ) : ledgerEntries.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-10 text-center text-slate-500">
                          <BookOpen className="w-6 h-6 mx-auto mb-2 opacity-30" />
                          No ledger statement records found for this customer.
                        </td>
                      </tr>
                    ) : (
                      ledgerEntries.map((entry) => {
                        const amountNum = Number(entry.amount || 0);
                        const isNegative = amountNum < 0;

                        return (
                          <tr key={entry.id} className="hover:bg-slate-800/30 transition-colors">
                            <td className="py-2.5 px-4 text-slate-300 font-mono text-[11px]">
                              {formatDate(entry.date)}
                            </td>

                            <td className="py-2.5 px-4">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                  entry.type === "opening"
                                    ? "bg-sky-500/20 text-sky-400 border border-sky-500/30"
                                    : entry.type === "sale"
                                    ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                                    : entry.type === "return"
                                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                    : "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                                }`}
                              >
                                {entry.type}
                              </span>
                            </td>

                            <td className="py-2.5 px-4 text-white font-medium max-w-sm">
                              <div>{entry.description}</div>
                              {entry.referenceId && (
                                <div className="text-[10px] text-slate-500 font-mono">
                                  Ref: {entry.referenceId.slice(0, 12)}...
                                </div>
                              )}
                            </td>

                            <td className="py-2.5 px-4 text-right font-mono font-bold">
                              <span className={isNegative ? "text-rose-400" : "text-emerald-400"}>
                                {isNegative ? "" : "+"}
                                {formatCurrency(entry.amount)}
                              </span>
                            </td>

                            <td className="py-2.5 px-4 text-right text-slate-400 font-mono">
                              {formatCurrency(entry.previousBalance)}
                            </td>

                            <td className="py-2.5 px-4 text-right font-mono font-bold text-white">
                              {formatCurrency(entry.newBalance)}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Ledger Pagination */}
            {ledgerTotalPages > 1 && (
              <div className="px-6 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 shrink-0">
                <div>
                  Page <span className="font-semibold text-white">{ledgerPage}</span> of{" "}
                  <span className="font-semibold text-white">{ledgerTotalPages}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    disabled={ledgerPage <= 1}
                    onClick={() => {
                      const newPg = Math.max(1, ledgerPage - 1);
                      setLedgerPage(newPg);
                      loadLedger(activeCustomer.id, newPg, ledgerStartDate, ledgerEndDate, ledgerSortOrder);
                    }}
                    className="px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-white disabled:opacity-40"
                  >
                    Prev
                  </button>
                  <button
                    disabled={ledgerPage >= ledgerTotalPages}
                    onClick={() => {
                      const newPg = Math.min(ledgerTotalPages, ledgerPage + 1);
                      setLedgerPage(newPg);
                      loadLedger(activeCustomer.id, newPg, ledgerStartDate, ledgerEndDate, ledgerSortOrder);
                    }}
                    className="px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-white disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. WHATSAPP DIRECT DUE REMINDER MODAL (/due-reminder-link)                */}
      {/* ========================================================================= */}
      {showWhatsAppModal && activeCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-emerald-500/40 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative">
            <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <WhatsAppIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">WhatsApp Payment Reminder</h3>
                  <p className="text-[11px] text-slate-400">Automated payment due reminder link</p>
                </div>
              </div>
              <button
                onClick={() => setShowWhatsAppModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {reminderLoading ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-emerald-400" />
                Generating WhatsApp direct link and reminder message...
              </div>
            ) : reminderError ? (
              <div className="p-4 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
                {reminderError}
              </div>
            ) : reminderData ? (
              <div className="space-y-4 text-xs">
                {/* Customer Meta */}
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-500 block">Customer:</span>
                    <span className="font-bold text-white text-xs">{reminderData.customerName}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Clean Phone:</span>
                    <span className="font-mono text-emerald-400 font-bold">+{reminderData.cleanPhone}</span>
                  </div>
                  <div className="col-span-2 pt-1 border-t border-slate-850 flex justify-between items-center">
                    <span className="text-slate-400">Current Outstanding Due:</span>
                    <span className="font-black text-rose-400 text-sm font-mono">
                      {formatCurrency(reminderData.dueAmount)}
                    </span>
                  </div>
                </div>

                {/* WhatsApp Chat Preview Bubble */}
                <div>
                  <span className="text-slate-400 font-medium block mb-1.5 text-[11px]">
                    Pre-filled WhatsApp Message Preview:
                  </span>
                  <div className="bg-[#0b141a] p-3.5 rounded-2xl border border-emerald-500/20 text-slate-200 whitespace-pre-wrap font-sans text-xs leading-relaxed relative shadow-inner">
                    <div className="bg-[#005c4b] text-white p-3 rounded-xl rounded-tl-none inline-block max-w-full text-xs shadow">
                      {reminderData.message}
                    </div>
                  </div>
                </div>

                {/* Actions: Send & Copy */}
                <div className="space-y-2 pt-2">
                  <a
                    href={reminderData.whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-950"
                  >
                    <WhatsAppIcon className="w-4 h-4" />
                    Open in WhatsApp Web / Mobile
                    <ExternalLink className="w-3.5 h-3.5 ml-1 opacity-70" />
                  </a>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(reminderData.message);
                        setCopiedMessage(true);
                        setTimeout(() => setCopiedMessage(false), 2500);
                      }}
                      className="py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      {copiedMessage ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedMessage ? "Copied Message!" : "Copy Message"}
                    </button>

                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(reminderData.whatsappUrl);
                        setCopiedLink(true);
                        setTimeout(() => setCopiedLink(false), 2500);
                      }}
                      className="py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedLink ? "Copied Link!" : "Copy Link"}
                    </button>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. AI CREDIT SCORE ASSESSMENT MODAL                                       */}
      {/* ========================================================================= */}
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

      {/* ========================================================================= */}
      {/* 7. CUSTOMER LEDGER & STATEMENT PRINT / PDF MODAL                         */}
      {/* ========================================================================= */}
      {showPdfModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-6 overflow-y-auto print:p-0 print:bg-white">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-4xl w-full max-h-[94vh] flex flex-col shadow-2xl overflow-hidden print:border-none print:shadow-none print:max-h-none print:w-full">
            {/* Top Action Bar */}
            <div className="bg-slate-950 border-b border-slate-800 px-5 py-3.5 flex items-center justify-between print:hidden shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                  <Printer className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    {selectedCustomerForPdf
                      ? "Customer Account Statement (PDF / Print)"
                      : "Customer Ledger & Due Report (PDF / Print)"}
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
                        Smart Cloud POS & Customer Ledger System
                      </p>
                      <p className="text-[10px] text-slate-500 mt-1">
                        Mirpur-10, Dhaka-1216 | Phone: +880 1819-000000 | Web: inventarioya.com
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="inline-block bg-slate-900 text-white font-bold px-3 py-1 text-[11px] rounded uppercase tracking-wider mb-1.5">
                        {selectedCustomerForPdf ? "CUSTOMER STATEMENT" : "LEDGER & DUE SUMMARY"}
                      </span>
                      <p className="text-[11px] text-slate-700">
                        <span className="font-semibold">Statement Date:</span>{" "}
                        {new Date().toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                      <p className="text-[10px] text-slate-500">
                        Generated By: {user?.name || user?.role || "Accounts Manager"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Single Customer Statement */}
                {selectedCustomerForPdf ? (
                  <div className="space-y-6">
                    {/* Customer Info Card */}
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase font-semibold block">
                          Customer Name
                        </span>
                        <span className="text-sm font-bold text-slate-900">
                          {selectedCustomerForPdf.name}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase font-semibold block">
                          Phone Number
                        </span>
                        <span className="text-sm font-medium text-slate-800 font-mono">
                          {selectedCustomerForPdf.phone}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase font-semibold block">
                          Address
                        </span>
                        <span className="text-sm font-medium text-slate-800">
                          {selectedCustomerForPdf.address || "N/A"}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase font-semibold block">
                          Customer ID
                        </span>
                        <span className="text-xs font-mono text-slate-600">
                          {selectedCustomerForPdf.id.slice(0, 14)}...
                        </span>
                      </div>
                    </div>

                    {/* Financial Summary */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="p-4 rounded-lg border border-slate-200 bg-white">
                        <span className="text-[11px] text-slate-600 font-medium block">
                          Initial Opening Balance
                        </span>
                        <span className="text-xl font-black text-slate-900 mt-1 block font-mono">
                          {formatCurrency(selectedCustomerForPdf.openingBalance || 0)}
                        </span>
                      </div>
                      <div className="p-4 rounded-lg border border-slate-200 bg-white">
                        <span className="text-[11px] text-slate-600 font-medium block">
                          Closing Net Balance
                        </span>
                        <span className="text-xl font-black text-slate-900 mt-1 block font-mono">
                          {formatCurrency(selectedCustomerForPdf.closingBalance || 0)}
                        </span>
                      </div>
                      <div
                        className={`p-4 rounded-lg border ${
                          getDueAmount(selectedCustomerForPdf) > 0
                            ? "border-rose-300 bg-rose-50"
                            : "border-emerald-300 bg-emerald-50"
                        }`}
                      >
                        <span className="text-[11px] font-medium block text-slate-700">
                          Outstanding Due (বাকি)
                        </span>
                        <span
                          className={`text-xl font-black mt-1 block font-mono ${
                            getDueAmount(selectedCustomerForPdf) > 0
                              ? "text-rose-600"
                              : "text-emerald-700"
                          }`}
                        >
                          {formatCurrency(getDueAmount(selectedCustomerForPdf))}
                        </span>
                      </div>
                    </div>

                    {/* Breakdown Summary */}
                    <div className="border border-slate-200 rounded-lg overflow-hidden">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold uppercase text-[10px]">
                          <tr>
                            <th className="py-2.5 px-4">Account Description / Particulars</th>
                            <th className="py-2.5 px-4 text-right">Debit / Due</th>
                            <th className="py-2.5 px-4 text-right">Credit / Paid</th>
                            <th className="py-2.5 px-4 text-right">Net Outstanding</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-800">
                          <tr>
                            <td className="py-3 px-4 font-medium">
                              Customer Ledger Account Statement & Settlements
                            </td>
                            <td className="py-3 px-4 text-right font-semibold text-rose-600">
                              {formatCurrency(getDueAmount(selectedCustomerForPdf))}
                            </td>
                            <td className="py-3 px-4 text-right text-emerald-700 font-semibold">
                              {formatCurrency(
                                Math.max(0, Number(selectedCustomerForPdf.openingBalance || 0))
                              )}
                            </td>
                            <td className="py-3 px-4 text-right font-black text-rose-600">
                              {formatCurrency(getDueAmount(selectedCustomerForPdf))}
                            </td>
                          </tr>
                        </tbody>
                        <tfoot className="bg-slate-50 font-bold border-t border-slate-200 text-slate-900">
                          <tr>
                            <td colSpan={3} className="py-2.5 px-4 text-right uppercase text-[10px] tracking-wider">
                              Total Due Balance Payable:
                            </td>
                            <td className="py-2.5 px-4 text-right text-sm text-rose-600">
                              {formatCurrency(getDueAmount(selectedCustomerForPdf))}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                ) : (
                  /* Bulk Customer Overview Report */
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                        <span className="text-[10px] text-slate-500 uppercase font-semibold block">
                          Total Customers
                        </span>
                        <span className="text-xl font-bold text-slate-900 mt-0.5 block">
                          {customers.length}
                        </span>
                      </div>
                      <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg">
                        <span className="text-[10px] text-rose-700 uppercase font-semibold block">
                          Total Due Balance
                        </span>
                        <span className="text-xl font-black text-rose-600 mt-0.5 block">
                          {formatCurrency(totalOutstandingDue)}
                        </span>
                      </div>
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                        <span className="text-[10px] text-amber-700 uppercase font-semibold block">
                          With Due Balance
                        </span>
                        <span className="text-xl font-bold text-amber-700 mt-0.5 block">
                          {customersWithDue}
                        </span>
                      </div>
                      <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                        <span className="text-[10px] text-emerald-700 uppercase font-semibold block">
                          Cleared Accounts
                        </span>
                        <span className="text-xl font-bold text-emerald-700 mt-0.5 block">
                          {clearedCustomers}
                        </span>
                      </div>
                    </div>

                    <div className="border border-slate-200 rounded-lg overflow-hidden">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead className="bg-slate-100 border-b border-slate-300 text-slate-800 font-bold uppercase text-[10px]">
                          <tr>
                            <th className="py-2.5 px-3 w-8">#</th>
                            <th className="py-2.5 px-3">Customer Name</th>
                            <th className="py-2.5 px-3">Phone</th>
                            <th className="py-2.5 px-3">Address</th>
                            <th className="py-2.5 px-3 text-right">Opening Bal</th>
                            <th className="py-2.5 px-3 text-right">Due (বাকি)</th>
                            <th className="py-2.5 px-3 text-center">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 text-slate-800">
                          {customers.map((cust, idx) => {
                            const due = getDueAmount(cust);
                            return (
                              <tr key={cust.id} className={idx % 2 === 1 ? "bg-slate-50/70" : ""}>
                                <td className="py-2 px-3 text-slate-500 font-mono text-[10px]">{idx + 1}</td>
                                <td className="py-2 px-3 font-semibold text-slate-900">{cust.name}</td>
                                <td className="py-2 px-3 text-slate-600 font-mono text-[11px]">{cust.phone}</td>
                                <td className="py-2 px-3 text-slate-500">{cust.address || "N/A"}</td>
                                <td className="py-2 px-3 text-right font-mono">
                                  {formatCurrency(cust.openingBalance || 0)}
                                </td>
                                <td className="py-2 px-3 text-right font-bold font-mono">
                                  {due > 0 ? (
                                    <span className="text-rose-600">{formatCurrency(due)}</span>
                                  ) : (
                                    <span className="text-emerald-600 font-normal">৳0</span>
                                  )}
                                </td>
                                <td className="py-2 px-3 text-center">
                                  <span
                                    className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                                      due > 0
                                        ? "bg-rose-100 text-rose-800"
                                        : "bg-emerald-100 text-emerald-800"
                                    }`}
                                  >
                                    {due > 0 ? "DUE" : "CLEARED"}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                        <tfoot className="bg-slate-100 border-t-2 border-slate-300 font-bold text-slate-900">
                          <tr>
                            <td colSpan={5} className="py-2.5 px-3 text-right uppercase text-[10px] tracking-wider">
                              Total Outstanding Due:
                            </td>
                            <td className="py-2.5 px-3 text-right text-rose-600">
                              {formatCurrency(totalOutstandingDue)}
                            </td>
                            <td className="py-2.5 px-3 text-right text-[10px] text-slate-500 font-normal">
                              {customers.length} listed
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
                      <p className="text-[10px] font-semibold text-slate-700 uppercase tracking-wider">
                        Prepared By (Accounts)
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="w-44 border-b border-slate-400 mb-1"></div>
                      <p className="text-[10px] font-semibold text-slate-700 uppercase tracking-wider">
                        Authorized Signatory & Seal
                      </p>
                    </div>
                  </div>
                  <div className="text-center border-t border-dashed border-slate-200 pt-3">
                    <p className="text-[9px] text-slate-400">
                      System-generated customer ledger & statement from Inventarioya Cloud POS.
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
