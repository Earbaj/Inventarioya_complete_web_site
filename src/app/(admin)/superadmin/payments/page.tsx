"use client";

import { useState, useEffect } from "react";
import { SubscriptionsService } from "@/lib/api/client";
import { ManualPaymentSubmission } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { CreditCard, Check, X, CheckCircle2, Clock } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function AdminPendingPaymentsPage() {
  const { txt } = useLanguage();
  const [payments, setPayments] = useState<ManualPaymentSubmission[]>([]);
  const [statusMsg, setStatusMsg] = useState("");

  useEffect(() => {
    async function loadPending() {
      try {
        const data = await SubscriptionsService.getPendingPayments();
        setPayments(data);
      } catch (err) {
        console.error(err);
      }
    }
    loadPending();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      await SubscriptionsService.approvePayment(id);
      setPayments(payments.filter((p) => p.id !== id));
      setStatusMsg(txt("পেমেন্ট অনুমোদিত ও প্ল্যান সক্রিয় করা হয়েছে!", "Payment approved and plan activated!"));
      setTimeout(() => setStatusMsg(""), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleReject = async (id: string) => {
    if (!confirm(txt("আপনি কি নিশ্চিতভাবে এই পেমেন্ট বাতিল করতে চান?", "Are you sure you want to reject this payment submission?"))) return;
    try {
      await SubscriptionsService.rejectPayment(id);
      setPayments(payments.filter((p) => p.id !== id));
      setStatusMsg(txt("পেমেন্ট সাবমিশন বাতিল করা হয়েছে।", "Payment submission rejected."));
      setTimeout(() => setStatusMsg(""), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <main className="p-4 sm:p-8 space-y-6 max-w-7xl">
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

      {statusMsg && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* Queue Table */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[750px] text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">{txt("শপের নাম", "Shop Name")}</th>
                <th className="py-3 px-4">{txt("আবেদিত প্যাকেজ", "Package Requested")}</th>
                <th className="py-3 px-4">{txt("পরিমাণ", "Amount")}</th>
                <th className="py-3 px-4">{txt("পেমেন্ট মাধ্যম", "Payment Method")}</th>
                <th className="py-3 px-4">{txt("ট্রানজ্যাকশন আইডি (TrxID)", "Transaction ID (TrxID)")}</th>
                <th className="py-3 px-4">{txt("প্রেরকের ফোন নম্বর", "Sender Phone")}</th>
                <th className="py-3 px-4">{txt("আবেদনের সময়", "Submitted At")}</th>
                <th className="py-3 px-4 text-right">{txt("অ্যাকশন", "Actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    {txt("কিউতে কোনো পেন্ডিং পেমেন্ট ভেরিফিকেশন নেই।", "No pending payment verifications in queue.")}
                  </td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-bold text-white">{p.shopName}</td>
                    <td className="py-3 px-4 text-indigo-400 font-semibold">{p.packageName}</td>
                    <td className="py-3 px-4 font-extrabold text-white">
                      {formatCurrency(p.amount)}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">
                        {p.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-amber-400 tracking-wider">
                      {p.transactionId}
                    </td>
                    <td className="py-3 px-4 text-slate-300">{p.senderPhone || "-"}</td>
                    <td className="py-3 px-4 text-slate-400">{formatDate(p.submittedAt)}</td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => handleApprove(p.id!)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold inline-flex items-center gap-1 shadow transition-colors cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        {txt("অনুমোদন", "Approve")}
                      </button>
                      <button
                        onClick={() => handleReject(p.id!)}
                        className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold inline-flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                        {txt("বাতিল", "Reject")}
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
  );
}
