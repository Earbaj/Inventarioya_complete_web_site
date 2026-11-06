import { useMemo } from "react";
import { Invoice, Branch } from "@/types";

export interface UseSalesFiltersParams {
  invoices: Invoice[];
  searchQuery: string;
  statusFilter: string;
  dateFilter: string;
  branchFilter: string;
  branches: Branch[];
}

/**
 * বিক্রয় তালিকা ফিল্টারিং ও যোগফল গণনার কাস্টম হুক (Sales Filter Hook)
 * সার্চ কোয়েরি, ব্রাঞ্চ, স্ট্যাটাস এবং ডেট রেঞ্জ অনুযায়ী ইনভয়েস ফিল্টার করে এবং মোট রেভিনিউ হিসাব করে।
 */
export function useSalesFilters({
  invoices,
  searchQuery,
  statusFilter,
  dateFilter,
  branchFilter,
  branches,
}: UseSalesFiltersParams) {
  // ফিল্টারকৃত বিক্রয় ইনভয়েস তালিকা
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

      // ব্রাঞ্চ ফিল্টার পরীক্ষা
      let matchesBranch = true;
      if (branchFilter !== "ALL") {
        const branchObj = branches.find((b) => b.id === branchFilter);
        const isMain =
          branchObj?.isMainBranch || branchFilter === "br_001" || branchFilter === "main";
        const branchName = branchObj ? branchObj.name.toLowerCase() : "";
        const invBranchId = inv.branchId || "";
        const invBranchName = (inv.branchName || "").toLowerCase();

        if (isMain) {
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

      // তারিখ ফিল্টার পরীক্ষা
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

  // মোট রেভিনিউ, পেইড ও বাকি হিসাব
  const totalSalesRevenue = useMemo(
    () => filteredInvoices.reduce((sum, inv) => sum + Number(inv.grandTotal || 0), 0),
    [filteredInvoices]
  );

  const totalPaidAmount = useMemo(
    () => filteredInvoices.reduce((sum, inv) => sum + Number(inv.paidAmount || 0), 0),
    [filteredInvoices]
  );

  const totalDueAmount = useMemo(
    () => filteredInvoices.reduce((sum, inv) => sum + Number(inv.dueAmount || 0), 0),
    [filteredInvoices]
  );

  return {
    filteredInvoices,
    totalSalesRevenue,
    totalPaidAmount,
    totalDueAmount,
  };
}
