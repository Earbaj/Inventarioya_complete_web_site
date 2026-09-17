"use client";

import { useState, useEffect } from "react";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { SubscriptionsService } from "@/lib/api/client";
import { SubscriptionPackage, PaymentInfo, ManualPaymentSubmission } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { CreditCard, Check, Sparkles, Send, Clock, CheckCircle2, AlertCircle } from "lucide-react";

export default function SubscriptionsPage() {
  const [packages, setPackages] = useState<SubscriptionPackage[]>([]);
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null);
  const [myPayments, setMyPayments] = useState<ManualPaymentSubmission[]>([]);
  const [selectedPkgId, setSelectedPkgId] = useState<string>("pkg_pro");

  // Submission Form State
  const [amount, setAmount] = useState<number>(2499);
  const [paymentMethod, setPaymentMethod] = useState<"BKASH" | "NAGAD" | "ROCKET" | "BANK">("BKASH");
  const [transactionId, setTransactionId] = useState("");
  const [senderPhone, setSenderPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const [pkgs, pInfo, myP] = await Promise.all([
          SubscriptionsService.getPackages(),
          SubscriptionsService.getPaymentInfo(),
          SubscriptionsService.getMyPayments(),
        ]);
        setPackages(pkgs);
        setPaymentInfo(pInfo);
        setMyPayments(myP);
      } catch (err) {
        console.error(err);
      }
    }
    loadData();
  }, []);

  const handlePackageSelect = (pkg: SubscriptionPackage) => {
    setSelectedPkgId(pkg.id);
    setAmount(pkg.price);
  };

  const handleSubmitManualPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transactionId) return;

    setIsSubmitting(true);
    try {
      const selectedPkg = packages.find((p) => p.id === selectedPkgId);
      const payload: ManualPaymentSubmission = {
        packageId: selectedPkgId,
        packageName: selectedPkg?.name || "Business Growth",
        amount,
        paymentMethod,
        transactionId,
        senderPhone,
        status: "pending",
        submittedAt: new Date().toISOString(),
      };
      await SubscriptionsService.submitManualPayment(payload);
      setMyPayments([payload, ...myPayments]);
      setStatusMessage("Payment submitted successfully! SuperAdmin will verify within 15-30 minutes.");
      setTransactionId("");
      setSenderPhone("");
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <DashboardHeader title="Shop Subscription & Cloud Tier" />

      <main className="p-4 sm:p-6 space-y-6 sm:space-y-8 max-w-7xl">
        {/* Current Active Plan Card */}
        <div className="rounded-3xl bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-900 border border-indigo-500/40 p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
              ACTIVE PLAN
            </span>
            <h2 className="text-2xl font-extrabold text-white mt-1">Business Growth Plan</h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Validity: Next renewal on October 1, 2026 • 3 Store Branches • AI Analytics Enabled
            </p>
          </div>
          <div className="text-left sm:text-right">
            <p className="text-xl font-bold text-white">৳2,499 / mo</p>
            <p className="text-[11px] text-emerald-400 font-medium">Automatic Backups Active</p>
          </div>
        </div>

        {/* Available Packages */}
        <div>
          <h3 className="text-sm font-bold text-white mb-3">Upgrade or Renew Package</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {packages.map((pkg) => {
              const isSelected = selectedPkgId === pkg.id;
              return (
                <div
                  key={pkg.id}
                  onClick={() => handlePackageSelect(pkg)}
                  className={`p-6 rounded-2xl cursor-pointer transition-all border flex flex-col justify-between ${
                    isSelected
                      ? "bg-indigo-950/40 border-indigo-500 shadow-lg shadow-indigo-500/10"
                      : "bg-slate-900 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-bold text-white">{pkg.name}</h4>
                      {pkg.isPopular && (
                        <span className="text-[9px] px-2 py-0.5 rounded bg-indigo-500 text-white font-bold">
                          POPULAR
                        </span>
                      )}
                    </div>
                    <p className="text-2xl font-extrabold text-white mb-4">
                      {formatCurrency(pkg.price)}
                      <span className="text-xs text-slate-400 font-normal">/{pkg.billingPeriod}</span>
                    </p>

                    <div className="space-y-2 text-xs text-slate-300 mb-6">
                      {pkg.features.map((feat, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    className={`w-full py-2 rounded-xl text-xs font-bold transition-colors ${
                      isSelected
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                    }`}
                  >
                    {isSelected ? "Selected for Payment" : "Choose Plan"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Manual Payment Submission Form */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Payment Details */}
          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6">
            <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-400" />
              Manual Payment Verification
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Send money to any of our official merchant channels and submit the Transaction ID.
            </p>

            {paymentInfo && (
              <div className="space-y-3 mb-6">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center text-xs">
                  <span className="text-pink-400 font-bold">bKash Merchant:</span>
                  <span className="text-white font-mono font-bold">{paymentInfo.bkashNumber}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center text-xs">
                  <span className="text-orange-400 font-bold">Nagad Merchant:</span>
                  <span className="text-white font-mono font-bold">{paymentInfo.nagadNumber}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center text-xs">
                  <span className="text-purple-400 font-bold">Rocket Personal:</span>
                  <span className="text-white font-mono font-bold">{paymentInfo.rocketNumber}</span>
                </div>
              </div>
            )}

            {statusMessage && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{statusMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmitManualPayment} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Payment Method</label>
                  <select
                    aria-label="Payment Method"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="BKASH">bKash</option>
                    <option value="NAGAD">Nagad</option>
                    <option value="ROCKET">Rocket</option>
                    <option value="BANK">Bank Transfer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Amount (৳)</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Transaction ID (TrxID)
                </label>
                <input
                  type="text"
                  required
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder="e.g. 9K8L2M1N4P"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono uppercase tracking-wider focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Sender Mobile Number</label>
                <input
                  type="text"
                  required
                  value={senderPhone}
                  onChange={(e) => setSenderPhone(e.target.value)}
                  placeholder="01711-..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2"
              >
                <Send className="w-3.5 h-3.5" />
                {isSubmitting ? "Submitting Verification..." : "Submit Payment for Verification"}
              </button>
            </form>
          </div>

          {/* Payment History */}
          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 flex flex-col">
            <h3 className="text-sm font-bold text-white mb-1">Your Submission History</h3>
            <p className="text-xs text-slate-400 mb-4">Past subscription renewal submissions</p>

            <div className="flex-1 overflow-y-auto space-y-3">
              {myPayments.map((p, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div>
                    <p className="font-semibold text-white">{p.packageName || "Subscription"}</p>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                      TrxID: {p.transactionId} • {p.paymentMethod}
                    </p>
                    <p className="text-[10px] text-slate-500">{formatDate(p.submittedAt)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-white">{formatCurrency(p.amount)}</p>
                    <span
                      className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                        p.status === "approved"
                          ? "bg-emerald-500/20 text-emerald-400"
                          : p.status === "rejected"
                          ? "bg-rose-500/20 text-rose-400"
                          : "bg-amber-500/20 text-amber-400"
                      }`}
                    >
                      {p.status?.toUpperCase() || "PENDING"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
