"use client";

import { useState, useEffect } from "react";
import { SubscriptionsService } from "@/lib/api/client";
import { ManualPaymentSubmission, Shop, SubscriptionPackage } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  CreditCard,
  Check,
  X,
  CheckCircle2,
  Clock,
  Building2,
  Sparkles,
  RefreshCw,
  MoreVertical,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface ActionModalState {
  isOpen: boolean;
  status: "confirm_reject" | "processing" | "success" | "error";
  title: string;
  message: string;
  targetId?: string;
  actionType?: "approve" | "reject";
}

export default function AdminPendingPaymentsPage() {
  const { txt } = useLanguage();
  const [payments, setPayments] = useState<ManualPaymentSubmission[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [packages, setPackages] = useState<SubscriptionPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState("");
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [actionModal, setActionModal] = useState<ActionModalState | null>(null);

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

  // Auto-dismiss success popup after 3 seconds
  useEffect(() => {
    if (actionModal?.status === "success") {
      const timer = setTimeout(() => {
        setActionModal(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [actionModal?.status]);

  async function loadPending() {
    setLoading(true);
    try {
      const [pendingData, shopsData, packagesData] = await Promise.all([
        SubscriptionsService.getPendingPayments(),
        SubscriptionsService.getAdminShops().catch(() => []),
        SubscriptionsService.getPackages().catch(() => []),
      ]);
      setPayments(pendingData);
      setShops(shopsData);
      setPackages(packagesData);
    } catch (err) {
      console.error("Failed to load pending payments:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPending();
  }, []);

  const getDisplayShopName = (p: ManualPaymentSubmission) => {
    if (p.shopName && p.shopName.trim() !== "" && p.shopName !== "Unknown") {
      return p.shopName;
    }
    const matchId = p.shopId || (p as any).userId;
    if (matchId) {
      const matched = shops.find((s) => s.id === matchId || s.shopId === matchId || (s as any)._id === matchId);
      if (matched?.name) return matched.name;
    }
    if (p.senderPhone) return `${txt("দোকান", "Shop")} (${p.senderPhone})`;
    return txt("দোকানের নাম অনির্দিষ্ট", "Unknown Shop");
  };

  const getDisplayPackageName = (p: ManualPaymentSubmission) => {
    if (p.packageName && p.packageName.trim() !== "" && p.packageName !== "Unknown") {
      return p.packageName;
    }
    const pkgId = p.packageId || (p as any).package;
    if (pkgId) {
      const matched = packages.find((pkg) => pkg.id === pkgId);
      if (matched?.name) return matched.name;
      if (typeof pkgId === "string") {
        if (pkgId.includes("year")) return "Premium Yearly";
        if (pkgId.includes("month") || pkgId.includes("premium")) return "Premium Monthly";
        if (pkgId.includes("standard")) return "Standard Plan";
        if (pkgId.includes("free")) return "Free Starter";
        return pkgId.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
      }
    }
    return "Premium Plan";
  };

  const handleApprove = async (id: string) => {
    const item = payments.find((p) => p.id === id);
    const shopName = item ? getDisplayShopName(item) : "";

    setActionModal({
      isOpen: true,
      status: "processing",
      actionType: "approve",
      title: txt("পেমেন্ট অনুমোদন হচ্ছে...", "Processing Payment Approval..."),
      message: shopName
        ? txt(`${shopName}-এর সাবস্ক্রিপশন প্ল্যান সক্রিয় করা হচ্ছে, অনুগ্রহ করে কিছুক্ষণ অপেক্ষা করুন...`, `Activating subscription plan for ${shopName}, please wait...`)
        : txt("পেমেন্ট যাচাই ও সাবস্ক্রিপশন প্ল্যান সক্রিয় করা হচ্ছে, অনুগ্রহ করে অপেক্ষা করুন...", "Verifying payment and activating subscription plan, please wait..."),
    });

    try {
      await SubscriptionsService.approvePayment(id);
      setPayments((prev) => prev.filter((p) => p.id !== id));
      setActionModal({
        isOpen: true,
        status: "success",
        actionType: "approve",
        title: txt("পেমেন্ট অনুমোদিত হয়েছে!", "Payment Approved Successfully!"),
        message: shopName
          ? txt(`${shopName}-এর পেমেন্ট সফলভাবে যাচাই হয়েছে এবং প্ল্যান চালু হয়েছে।`, `Payment for ${shopName} has been verified and premium access is now activated.`)
          : txt("পেমেন্ট সফলভাবে অনুমোদিত হয়েছে ও মার্চেন্টের প্ল্যান সক্রিয় করা হয়েছে!", "Payment has been approved and merchant plan activated successfully!"),
      });
    } catch (err: any) {
      console.error("Failed to approve payment:", err);
      const errMsg =
        err?.response?.data?.message ||
        err?.message ||
        txt("অনুমোদন সম্পন্ন করা যায়নি। অনুগ্রহ করে ইন্টারনেট সংযোগ চেক করে পুনরায় চেষ্টা করুন।", "Failed to approve payment. Please check your connection and try again.");
      setActionModal({
        isOpen: true,
        status: "error",
        actionType: "approve",
        title: txt("অনুমোদন ব্যর্থ হয়েছে!", "Approval Failed!"),
        message: typeof errMsg === "string" ? errMsg : JSON.stringify(errMsg),
      });
    }
  };

  const promptReject = (id: string) => {
    const item = payments.find((p) => p.id === id);
    const shopName = item ? getDisplayShopName(item) : "";
    setActionModal({
      isOpen: true,
      status: "confirm_reject",
      actionType: "reject",
      targetId: id,
      title: txt("পেমেন্ট বাতিল করতে চান?", "Reject Payment Submission?"),
      message: shopName
        ? txt(`আপনি কি নিশ্চিত যে ${shopName}-এর পেমেন্ট অনুরোধটি বাতিল করবেন?`, `Are you sure you want to reject the payment request for ${shopName}?`)
        : txt("আপনি কি নিশ্চিত যে এই পেমেন্ট অনুরোধটি বাতিল করবেন?", "Are you sure you want to reject this payment submission?"),
    });
  };

  const executeReject = async (id: string) => {
    setActionModal({
      isOpen: true,
      status: "processing",
      actionType: "reject",
      title: txt("পেমেন্ট বাতিল করা হচ্ছে...", "Processing Payment Rejection..."),
      message: txt("অনুরোধটি বাতিল করা হচ্ছে, অনুগ্রহ করে অপেক্ষা করুন...", "Rejecting payment request, please wait..."),
    });

    try {
      await SubscriptionsService.rejectPayment(id);
      setPayments((prev) => prev.filter((p) => p.id !== id));
      setActionModal({
        isOpen: true,
        status: "success",
        actionType: "reject",
        title: txt("পেমেন্ট বাতিল করা হয়েছে!", "Payment Rejected Successfully!"),
        message: txt("পেমেন্ট অনুরোধটি বাতিল করা হয়েছে।", "The payment request has been rejected."),
      });
    } catch (err: any) {
      console.error("Failed to reject payment:", err);
      const errMsg =
        err?.response?.data?.message ||
        err?.message ||
        txt("বাতিল প্রক্রিয়া সম্পন্ন করা যায়নি।", "Failed to reject payment.");
      setActionModal({
        isOpen: true,
        status: "error",
        actionType: "reject",
        title: txt("বাতিল প্রক্রিয়া ব্যর্থ হয়েছে!", "Rejection Failed!"),
        message: typeof errMsg === "string" ? errMsg : JSON.stringify(errMsg),
      });
    }
  };

  return (
    <main className="p-4 sm:p-8 space-y-6 max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            {txt("পেন্ডিং সাবস্ক্রিপশন পেমেন্ট ভেরিফিকেশন", "Pending Subscription Payment Verifications")}
          </h1>
          <p className="text-xs text-slate-400">
            {txt(
              "ম্যানুয়াল মোবাইল ব্যাংকিং লেনদেন (বিকাশ / নগদ / রকেট) যাচাই করুন",
              "Review manual mobile banking transaction submissions (bKash / Nagad / Rocket)"
            )}
          </p>
        </div>
        <button
          onClick={loadPending}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold self-start transition-colors cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>{txt("রিফ্রেশ", "Refresh")}</span>
        </button>
      </div>

      {statusMsg && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* Queue Table */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
        <div className="overflow-x-auto min-h-[220px]">
          <table className="w-full min-w-[780px] text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">{txt("শপের নাম", "Shop Name")}</th>
                <th className="py-3 px-4">{txt("আবেদিত প্যাকেজ", "Package Requested")}</th>
                <th className="py-3 px-4">{txt("পরিমাণ", "Amount")}</th>
                <th className="py-3 px-4">{txt("পেমেন্ট মাধ্যম", "Payment Method")}</th>
                <th className="py-3 px-4">{txt("ট্রানজ্যাকশন আইডি (TrxID)", "Transaction ID (TrxID)")}</th>
                <th className="py-3 px-4">{txt("প্রেরকের ফোন নম্বর", "Sender Phone")}</th>
                <th className="py-3 px-4">{txt("আবেদনের সময়", "Submitted At")}</th>
                <th className="py-3 px-4 text-right w-16">{txt("অ্যাকশন", "Actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading && payments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    <div className="inline-flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-indigo-400" />
                      <span>{txt("পেন্ডিং পেমেন্ট লোড হচ্ছে...", "Loading pending payments...")}</span>
                    </div>
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    {txt("কিউতে কোনো পেন্ডিং পেমেন্ট ভেরিফিকেশন নেই।", "No pending payment verifications in queue.")}
                  </td>
                </tr>
              ) : (
                payments.map((p) => {
                  const displayShopName = getDisplayShopName(p);
                  const displayPackageName = getDisplayPackageName(p);

                  return (
                    <tr key={p.id || p.transactionId} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
                            <Building2 className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <span className="font-bold text-white block">
                              {displayShopName}
                            </span>
                            {p.shopId && (
                              <span className="text-[10px] text-slate-500 font-mono">
                                #{p.shopId.slice(-6)}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                          <Sparkles className="w-3 h-3" />
                          <span>{displayPackageName}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 font-extrabold text-white">
                        {formatCurrency(p.amount)}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 uppercase">
                          {p.paymentMethod?.replace("manual_", "")}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-amber-400 tracking-wider">
                        {p.transactionId || (p as any).trxId || "-"}
                      </td>
                      <td className="py-3 px-4 text-slate-300">
                        {p.senderPhone || (p as any).accountNo || "-"}
                      </td>
                      <td className="py-3 px-4 text-slate-400">
                        {formatDate(p.submittedAt || (p as any).createdAt)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="relative inline-block text-left action-menu-container">
                          <button
                            type="button"
                            onClick={() => setActiveMenuId(activeMenuId === p.id ? null : (p.id || ""))}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                            title={txt("অপশন", "Actions")}
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {activeMenuId === p.id && (
                            <div className="absolute right-0 top-full mt-1 w-36 rounded-xl bg-slate-900 border border-slate-700/80 shadow-2xl z-50 py-1 overflow-hidden backdrop-blur-md">
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveMenuId(null);
                                  handleApprove(p.id!);
                                }}
                                className="w-full px-3 py-2 text-left text-xs font-semibold text-emerald-400 hover:bg-emerald-500/10 flex items-center gap-2 transition-colors cursor-pointer"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>{txt("অনুমোদন", "Approve")}</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveMenuId(null);
                                  promptReject(p.id!);
                                }}
                                className="w-full px-3 py-2 text-left text-xs font-semibold text-rose-400 hover:bg-rose-500/10 flex items-center gap-2 transition-colors cursor-pointer"
                              >
                                <X className="w-3.5 h-3.5" />
                                <span>{txt("বাতিল", "Reject")}</span>
                              </button>
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
      </div>

      {/* Action Feedback & Confirmation Modal */}
      {actionModal?.isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl relative">
            {/* Close button (when not actively processing) */}
            {actionModal.status !== "processing" && (
              <button
                type="button"
                onClick={() => setActionModal(null)}
                className="absolute top-3.5 right-3.5 text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {/* Status Icon */}
            <div className="flex justify-center mb-3">
              {actionModal.status === "processing" && (
                <div className="w-12 h-12 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
                </div>
              )}
              {actionModal.status === "success" && (
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                </div>
              )}
              {actionModal.status === "error" && (
                <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-rose-400" />
                </div>
              )}
              {actionModal.status === "confirm_reject" && (
                <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-amber-400" />
                </div>
              )}
            </div>

            {/* Title & Message */}
            <h3 className="text-base font-bold text-white mb-1.5">{actionModal.title}</h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-5">{actionModal.message}</p>

            {/* Action Buttons */}
            {actionModal.status === "confirm_reject" ? (
              <div className="flex items-center gap-2 justify-center">
                <button
                  type="button"
                  onClick={() => setActionModal(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
                >
                  {txt("ফিরে যান", "Cancel")}
                </button>
                <button
                  type="button"
                  onClick={() => actionModal.targetId && executeReject(actionModal.targetId)}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors shadow-sm cursor-pointer"
                >
                  {txt("হ্যাঁ, বাতিল করুন", "Yes, Reject")}
                </button>
              </div>
            ) : actionModal.status === "processing" ? (
              <div className="inline-flex items-center gap-1.5 text-xs text-indigo-400 font-medium bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>{txt("অনুগ্রহ করে অপেক্ষা করুন...", "Please wait...")}</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setActionModal(null)}
                className={`w-full py-2.5 rounded-xl text-xs font-bold transition-colors shadow-sm cursor-pointer ${
                  actionModal.status === "success"
                    ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                    : "bg-rose-600 hover:bg-rose-500 text-white"
                }`}
              >
                {actionModal.status === "success" ? txt("ঠিক আছে", "Done") : txt("বন্ধ করুন", "Close")}
              </button>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
