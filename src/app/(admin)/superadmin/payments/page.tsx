"use client";

import { useState, useEffect } from "react";
import { SubscriptionsService } from "@/lib/api/client";
import { ManualPaymentSubmission } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { CreditCard, Check, X, CheckCircle2, Clock } from "lucide-react";

export default function AdminPendingPaymentsPage() {
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
      setStatusMsg("Payment approved and plan activated!");
      setTimeout(() => setStatusMsg(""), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleReject = async (id: string) => {
    if (!confirm("Are you sure you want to reject this payment submission?")) return;
    try {
      await SubscriptionsService.rejectPayment(id);
      setPayments(payments.filter((p) => p.id !== id));
      setStatusMsg("Payment submission rejected.");
      setTimeout(() => setStatusMsg(""), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <main className="p-8 space-y-6 max-w-7xl">
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">
          Pending Subscription Payment Verifications
        </h1>
        <p className="text-xs text-slate-400">
          Review manual mobile banking transaction submissions (bKash / Nagad / Rocket)
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
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Shop Name</th>
                <th className="py-3 px-4">Package Requested</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Payment Method</th>
                <th className="py-3 px-4">Transaction ID (TrxID)</th>
                <th className="py-3 px-4">Sender Phone</th>
                <th className="py-3 px-4">Submitted At</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    No pending payment verifications in queue.
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
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold inline-flex items-center gap-1 shadow transition-colors"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(p.id!)}
                        className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold inline-flex items-center gap-1 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                        Reject
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
