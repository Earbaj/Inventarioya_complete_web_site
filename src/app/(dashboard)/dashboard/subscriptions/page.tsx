"use client";

import { useState, useEffect } from "react";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { SubscriptionsService, AuthService } from "@/lib/api/client";
import { SubscriptionPackage, PaymentInfo, ManualPaymentSubmission } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  CreditCard,
  Check,
  Sparkles,
  Send,
  CheckCircle2,
  AlertCircle,
  Copy,
  Building,
  Info,
} from "lucide-react";

export default function SubscriptionsPage() {
  const [packages, setPackages] = useState<SubscriptionPackage[]>([]);
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null);
  const [myPayments, setMyPayments] = useState<ManualPaymentSubmission[]>([]);
  const [selectedPkgId, setSelectedPkgId] = useState<string>("");
  const [user, setUser] = useState<any>(null);

  // Submission Form State
  const [amount, setAmount] = useState<number>(1000);
  const [paymentMethod, setPaymentMethod] = useState<"BKASH" | "NAGAD" | "ROCKET" | "BANK">("BKASH");
  const [transactionId, setTransactionId] = useState("");
  const [senderPhone, setSenderPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Clipboard copy state
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    setUser(AuthService.getCurrentUser());

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

        if (pkgs.length > 0) {
          const defaultPkg =
            pkgs.find((p) => p.id === "premium_monthly" || p.price > 0) || pkgs[0];
          setSelectedPkgId(defaultPkg.id);
          setAmount(defaultPkg.price);
        }
      } catch (err) {
        console.error("Failed to load subscription data", err);
      }
    }
    loadData();
  }, []);

  const handlePackageSelect = (pkg: SubscriptionPackage) => {
    setSelectedPkgId(pkg.id);
    setAmount(pkg.price);
  };

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSubmitManualPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transactionId.trim()) {
      setErrorMessage("Please enter the Transaction ID (TrxID).");
      return;
    }

    setIsSubmitting(true);
    setStatusMessage("");
    setErrorMessage("");

    try {
      const selectedPkg = packages.find((p) => p.id === selectedPkgId);
      const payload: ManualPaymentSubmission = {
        packageId: selectedPkgId || "premium_monthly",
        packageName: selectedPkg?.name || "Premium Subscription",
        amount: Number(amount),
        paymentMethod,
        transactionId: transactionId.trim().toUpperCase(),
        senderPhone: senderPhone.trim(),
        status: "pending",
        submittedAt: new Date().toISOString(),
      };

      await SubscriptionsService.submitManualPayment(payload);
      setMyPayments([payload, ...myPayments]);
      setStatusMessage(
        "Payment submitted successfully! SuperAdmin will verify your payment within 15-30 minutes."
      );
      setTransactionId("");
      setSenderPhone("");
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to submit payment verification. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentPlan = user?.shop?.subscriptionPackage || user?.subscriptionPlan || "Free Starter Plan";

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <DashboardHeader title="Shop Subscription & Cloud Tier" />

      <main className="p-4 sm:p-6 space-y-6 sm:space-y-8 max-w-7xl">
        {/* Current Active Plan Card */}
        <div className="rounded-3xl bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-900 border border-indigo-500/40 p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
              CURRENT PLAN
            </span>
            <h2 className="text-2xl font-extrabold text-white mt-1">{currentPlan}</h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Cloud synchronization active • Automated backups • Android Mobile POS integrated
            </p>
          </div>
          <div className="text-left sm:text-right">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Inventarioya Cloud
            </span>
            <p className="text-[11px] text-emerald-400 font-medium mt-1">✓ Cloud Database Connected</p>
          </div>
        </div>

        {/* Available Packages */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-white">Upgrade or Renew Package</h3>
            <span className="text-[11px] text-slate-400">Select a plan to pay & activate</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {packages.map((pkg) => {
              const isSelected = selectedPkgId === pkg.id;
              const featuresList =
                pkg.features && pkg.features.length > 0
                  ? pkg.features
                  : pkg.limits
                  ? [
                      pkg.limits.customers === "unlimited"
                        ? "Unlimited Customers (আনলিমিটেড কাস্টমার)"
                        : `Max ${pkg.limits.customers} Active Customer`,
                      pkg.limits.managers === "unlimited"
                        ? "Unlimited Staff & Managers"
                        : `Max ${pkg.limits.managers} Manager/Staff`,
                      pkg.limits.items === "unlimited"
                        ? "Unlimited Products & Inventory"
                        : `Max ${pkg.limits.items} Inventory Items`,
                      pkg.limits.sales === "unlimited"
                        ? "Unlimited POS Sales Invoices"
                        : `Max ${pkg.limits.sales} Sales Invoices`,
                      pkg.price > 0 ? "Multi-Branch Cloud Access" : "Basic POS & Receipts",
                      pkg.price > 0 ? "Priority WhatsApp Support" : "Standard Email Support",
                    ]
                  : [pkg.description || "All-Access Feature Pack"];

              return (
                <div
                  key={pkg.id}
                  onClick={() => handlePackageSelect(pkg)}
                  className={`p-6 rounded-2xl cursor-pointer transition-all border flex flex-col justify-between relative ${
                    isSelected
                      ? "bg-indigo-950/40 border-indigo-500 shadow-lg shadow-indigo-500/10"
                      : "bg-slate-900 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  {pkg.isPopular && (
                    <span className="absolute -top-2.5 right-6 text-[9px] px-2.5 py-0.5 rounded-full bg-indigo-600 text-white font-bold tracking-wider uppercase shadow">
                      MOST POPULAR
                    </span>
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-bold text-white">{pkg.name}</h4>
                    </div>

                    <p className="text-2xl font-extrabold text-white mb-2 font-mono">
                      {formatCurrency(pkg.price)}
                      <span className="text-xs text-slate-400 font-normal font-sans ml-1">
                        /{pkg.billingPeriod || (pkg.durationDays === 365 ? "year" : pkg.durationDays === 30 ? "month" : "starter")}
                      </span>
                    </p>

                    {pkg.description && (
                      <p className="text-[11px] text-slate-400 mb-4 line-clamp-2">
                        {pkg.description}
                      </p>
                    )}

                    <div className="space-y-2 text-xs text-slate-300 mb-6 pt-3 border-t border-slate-800/80">
                      {(featuresList || []).map((feat, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                          <span className="text-[11px] leading-snug">{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    className={`w-full py-2.5 rounded-xl text-xs font-bold transition-colors ${
                      isSelected
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                        : "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
                    }`}
                  >
                    {isSelected
                      ? pkg.price === 0
                        ? "Free Starter Active"
                        : "Selected for Payment"
                      : "Choose Plan"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Manual Payment Submission Form & Instructions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Payment Channels & Instructions */}
          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-5">
            <div>
              <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-400" />
                Payment Channels & Verification
              </h3>
              <p className="text-xs text-slate-400">
                Send subscription fee to any of our official channels and submit the Transaction ID (TrxID).
              </p>
            </div>

            {/* Official Accounts */}
            {paymentInfo && (
              <div className="space-y-3">
                {paymentInfo.bkashNumber && (
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center text-xs">
                    <div>
                      <span className="text-pink-400 font-bold block">bKash (Send Money / Merchant):</span>
                      <span className="text-white font-mono font-bold text-sm tracking-wide">
                        {paymentInfo.bkashNumber}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(paymentInfo.bkashNumber!, "bkash")}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold flex items-center gap-1 transition-colors"
                    >
                      <Copy className="w-3 h-3 text-pink-400" />
                      {copiedField === "bkash" ? "Copied!" : "Copy"}
                    </button>
                  </div>
                )}

                {paymentInfo.nagadNumber && (
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center text-xs">
                    <div>
                      <span className="text-orange-400 font-bold block">Nagad (Send Money / Merchant):</span>
                      <span className="text-white font-mono font-bold text-sm tracking-wide">
                        {paymentInfo.nagadNumber}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(paymentInfo.nagadNumber!, "nagad")}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold flex items-center gap-1 transition-colors"
                    >
                      <Copy className="w-3 h-3 text-orange-400" />
                      {copiedField === "nagad" ? "Copied!" : "Copy"}
                    </button>
                  </div>
                )}

                {(paymentInfo.bankDetails || paymentInfo.bankAccount) && (
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
                    <div className="flex items-center gap-1.5 text-sky-400 font-bold mb-1">
                      <Building className="w-3.5 h-3.5" />
                      Bank Account Details:
                    </div>
                    <div className="text-slate-300 grid grid-cols-2 gap-1 text-[11px]">
                      <div>
                        Bank:{" "}
                        <span className="text-white font-medium">
                          {paymentInfo.bankDetails?.bankName || paymentInfo.bankAccount?.bankName}
                        </span>
                      </div>
                      <div>
                        A/C Name:{" "}
                        <span className="text-white font-medium">
                          {paymentInfo.bankDetails?.accountName || paymentInfo.bankAccount?.accountName}
                        </span>
                      </div>
                      <div className="col-span-2">
                        A/C Number:{" "}
                        <span className="text-white font-mono font-bold">
                          {paymentInfo.bankDetails?.accountNumber || paymentInfo.bankAccount?.accountNumber}
                        </span>
                      </div>
                      <div>
                        Branch:{" "}
                        <span className="text-white font-medium">
                          {paymentInfo.bankDetails?.branch || paymentInfo.bankAccount?.branchName || "Main"}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Official Instructions */}
            {paymentInfo?.instructions && paymentInfo.instructions.length > 0 && (
              <div className="p-3.5 rounded-xl bg-indigo-950/20 border border-indigo-500/20 text-xs space-y-1.5">
                <div className="flex items-center gap-1.5 text-indigo-400 font-bold text-[11px]">
                  <Info className="w-3.5 h-3.5" />
                  পেমেন্ট নির্দেশিকা (Payment Instructions):
                </div>
                <div className="space-y-1 text-[11px] text-slate-300">
                  {paymentInfo.instructions.map((inst, i) => (
                    <div key={i} className="flex items-start gap-1.5">
                      <span className="text-indigo-400 font-bold">•</span>
                      <span>{inst}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Submission Form */}
          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
                <Send className="w-4 h-4 text-emerald-400" />
                Submit Verification Form
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                Enter your payment details for instant account approval.
              </p>

              {statusMessage && (
                <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>{statusMessage}</span>
                </div>
              )}

              {errorMessage && (
                <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmitManualPayment} className="space-y-3.5 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">
                      Payment Method <span className="text-rose-400">*</span>
                    </label>
                    <select
                      aria-label="Payment Method"
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500 font-medium"
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
                      required
                      value={amount}
                      onChange={(e) => setAmount(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold font-mono focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Transaction ID (TrxID) <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    placeholder="e.g. 9K8L2M1N4P"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono uppercase tracking-wider focus:outline-none focus:border-indigo-500"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Copy the TrxID received from your bKash/Nagad SMS
                  </span>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Sender Mobile Number <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={senderPhone}
                    onChange={(e) => setSenderPhone(e.target.value)}
                    placeholder="e.g. 01711223344"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 mt-4"
                >
                  <Send className="w-3.5 h-3.5" />
                  {isSubmitting ? "Submitting Verification..." : "Submit Payment for Verification"}
                </button>
              </form>
            </div>

            {/* Submission History Section */}
            <div className="mt-6 pt-5 border-t border-slate-800">
              <h4 className="text-xs font-bold text-white mb-2">Past Submission History</h4>
              {myPayments.length === 0 ? (
                <p className="text-[11px] text-slate-500 italic">No past manual submissions yet.</p>
              ) : (
                <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                  {myPayments.map((p, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div>
                        <p className="font-semibold text-white text-[11px]">
                          {p.packageName || "Subscription Renewal"}
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono">
                          TrxID: {p.transactionId} • {p.paymentMethod}
                        </p>
                        <p className="text-[9px] text-slate-500">{formatDate(p.submittedAt)}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-white font-mono text-[11px]">
                          {formatCurrency(p.amount)}
                        </p>
                        <span
                          className={`inline-block mt-0.5 px-2 py-0.2 rounded text-[9px] font-bold uppercase ${
                            p.status === "approved"
                              ? "bg-emerald-500/20 text-emerald-400"
                              : p.status === "rejected"
                              ? "bg-rose-500/20 text-rose-400"
                              : "bg-amber-500/20 text-amber-400"
                          }`}
                        >
                          {p.status || "PENDING"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
