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
  Clock,
  ShieldCheck,
} from "lucide-react";

export default function SubscriptionsPage() {
  const [packages, setPackages] = useState<SubscriptionPackage[]>([]);
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null);
  const [myPayments, setMyPayments] = useState<ManualPaymentSubmission[]>([]);
  const [selectedPkgId, setSelectedPkgId] = useState<string>("premium_monthly");
  const [user, setUser] = useState<any>(null);

  // Form State
  const [amount, setAmount] = useState<number>(1000);
  const [paymentMethod, setPaymentMethod] = useState<string>("manual_bkash");
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
    if (!senderPhone.trim()) {
      setErrorMessage("Please enter the Sender Mobile / Account Number.");
      return;
    }

    setIsSubmitting(true);
    setStatusMessage("");
    setErrorMessage("");

    try {
      const selectedPkg = packages.find((p) => p.id === selectedPkgId);
      const cleanTrx = transactionId.trim().toUpperCase();
      const cleanPhone = senderPhone.trim();

      const payload: ManualPaymentSubmission = {
        packageId: selectedPkgId || "premium_monthly",
        packageName: selectedPkg?.name || "Premium Monthly",
        amount: Number(amount),
        paymentMethod,
        trxId: cleanTrx,
        transactionId: cleanTrx,
        accountNo: cleanPhone,
        senderPhone: cleanPhone,
        status: "pending",
        submittedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };

      await SubscriptionsService.submitManualPayment(payload);
      setMyPayments([payload, ...myPayments]);
      setStatusMessage(
        "Payment verification submitted successfully! SuperAdmin will review and activate your plan within 15-30 minutes."
      );
      setTransactionId("");
      setSenderPhone("");
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to submit payment verification. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Find latest active/approved payment if any
  const approvedPayment = myPayments.find((p) => p.status === "approved");
  const approvedPkg = packages.find((p) => p.id === approvedPayment?.packageId);

  // Method formatter helper
  const formatMethodLabel = (method?: string) => {
    if (!method) return "Manual";
    if (method.includes("bkash")) return "bKash";
    if (method.includes("nagad")) return "Nagad";
    if (method.includes("rocket")) return "Rocket";
    if (method.includes("bank")) return "Bank Transfer";
    return method;
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <DashboardHeader title="Shop Subscription & Billing (সাবস্ক্রিপশন ও বিলিং)" />

      <main className="p-4 sm:p-6 space-y-6 sm:space-y-8 max-w-7xl">
        {/* Current Active Plan Card */}
        <div className="rounded-3xl bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-900 border border-indigo-500/40 p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                approvedPayment
                  ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
                  : "bg-indigo-500/15 border-indigo-500/30 text-indigo-300"
              }`}>
                {approvedPayment ? "ACTIVE SUBSCRIPTION" : "CURRENT PLAN"}
              </span>
              {approvedPayment?.approvedAt && (
                <span className="text-[10px] text-slate-400 font-mono">
                  Activated on {formatDate(approvedPayment.approvedAt)}
                </span>
              )}
            </div>

            <h2 className="text-2xl font-extrabold text-white mt-1.5 flex items-center gap-2">
              <span>{approvedPkg?.name || (approvedPayment ? "Premium Monthly" : "Free Starter Plan")}</span>
              {approvedPayment && <ShieldCheck className="w-5 h-5 text-emerald-400" />}
            </h2>

            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              {approvedPayment
                ? "All-Access Premium Activated • Unlimited Customers, Inventory, Staff & Invoices • Android POS Sync Active"
                : "ফ্রি স্টার্টার টিয়ার। সর্বোচ্চ ১টি কাস্টমার, ১টি ম্যানেজার, ৫টি আইটেম ও ৫টি বিক্রির সুবিধা। আনলিমিটেড সুবিধার জন্য প্রিমিয়ামে আপগ্রেড করুন।"}
            </p>
          </div>

          <div className="text-left sm:text-right shrink-0">
            <p className="text-2xl font-black text-white font-mono">
              {approvedPayment ? formatCurrency(approvedPayment.amount) : "৳0"}
              <span className="text-xs text-slate-400 font-normal font-sans ml-1">
                /{approvedPkg?.durationDays ? `${approvedPkg.durationDays} days` : "forever"}
              </span>
            </p>
            <p className="text-[11px] text-emerald-400 font-medium mt-1 flex items-center justify-start sm:justify-end gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Keeper POS Cloud Connected
            </p>
          </div>
        </div>

        {/* Available Packages */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-base font-bold text-white">Upgrade or Renew Package</h3>
              <p className="text-xs text-slate-400">Select any plan below to proceed with verification & activation</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {packages.map((pkg) => {
              const isSelected = selectedPkgId === pkg.id;
              const isPopular = pkg.id === "premium_monthly" || pkg.isPopular;

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
                      ? "bg-indigo-950/40 border-indigo-500 shadow-xl shadow-indigo-500/10 scale-[1.01]"
                      : "bg-slate-900 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  {isPopular && (
                    <span className="absolute -top-2.5 right-6 text-[9px] px-2.5 py-0.5 rounded-full bg-indigo-600 text-white font-bold tracking-wider uppercase shadow flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      MOST POPULAR
                    </span>
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-base font-bold text-white">{pkg.name}</h4>
                    </div>

                    <p className="text-3xl font-extrabold text-white mb-2 font-mono">
                      {formatCurrency(pkg.price)}
                      <span className="text-xs text-slate-400 font-normal font-sans ml-1">
                        /{pkg.durationDays === 365 ? "365 days" : pkg.durationDays === 30 ? "30 days" : "starter"}
                      </span>
                    </p>

                    {pkg.description && (
                      <p className="text-xs text-slate-300 mb-4 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                        {pkg.description}
                      </p>
                    )}

                    <div className="space-y-2 text-xs text-slate-300 mb-6 pt-2 border-t border-slate-800/80">
                      {(featuresList || []).map((feat, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                          <span className="text-[11px] leading-snug text-slate-200">{feat}</span>
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
                        ? "Starter Active"
                        : "Selected for Payment"
                      : "Choose Plan"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Payment Verification & Submission Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Payment Channels & Official Guidelines */}
          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-5">
            <div>
              <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-400" />
                Payment Channels (অফিসিয়াল পেমেন্ট নম্বর)
              </h3>
              <p className="text-xs text-slate-400">
                Send subscription fee to any of our verified merchant/personal numbers below:
              </p>
            </div>

            {/* Official Mobile Accounts */}
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
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5 text-pink-400" />
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
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5 text-orange-400" />
                      {copiedField === "nagad" ? "Copied!" : "Copy"}
                    </button>
                  </div>
                )}

                {/* Bank Details */}
                {(paymentInfo.bankDetails || paymentInfo.bankAccount) && (
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-sky-400 font-bold">
                        <Building className="w-3.5 h-3.5" />
                        Bank Account (ডাচ বাংলা ব্যাংক):
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          handleCopy(
                            paymentInfo.bankDetails?.accountNumber ||
                              paymentInfo.bankAccount?.accountNumber ||
                              "",
                            "bank"
                          )
                        }
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold flex items-center gap-1 transition-colors"
                      >
                        <Copy className="w-3 h-3 text-sky-400" />
                        {copiedField === "bank" ? "Copied!" : "Copy A/C"}
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300 pt-1 border-t border-slate-900">
                      <div>
                        Bank Name:{" "}
                        <span className="text-white font-semibold block">
                          {paymentInfo.bankDetails?.bankName || paymentInfo.bankAccount?.bankName}
                        </span>
                      </div>
                      <div>
                        Account Name:{" "}
                        <span className="text-white font-semibold block">
                          {paymentInfo.bankDetails?.accountName || paymentInfo.bankAccount?.accountName}
                        </span>
                      </div>
                      <div>
                        Account Number:{" "}
                        <span className="text-white font-mono font-bold block text-xs text-sky-300">
                          {paymentInfo.bankDetails?.accountNumber || paymentInfo.bankAccount?.accountNumber}
                        </span>
                      </div>
                      <div>
                        Branch:{" "}
                        <span className="text-white font-semibold block">
                          {paymentInfo.bankDetails?.branch || paymentInfo.bankAccount?.branchName || "Motijheel, Dhaka"}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Official 4-step Instructions */}
            {paymentInfo?.instructions && paymentInfo.instructions.length > 0 && (
              <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-500/25 text-xs space-y-2">
                <div className="flex items-center gap-1.5 text-indigo-300 font-bold">
                  <Info className="w-4 h-4 text-indigo-400" />
                  পেমেন্ট নির্দেশিকা (Official Instructions):
                </div>
                <div className="space-y-1.5 text-[11px] text-slate-300">
                  {paymentInfo.instructions.map((inst, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 text-[10px] font-bold">
                        {i + 1}
                      </span>
                      <span className="leading-snug">{inst}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Submission Form & Past Payments */}
          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
                <Send className="w-4 h-4 text-emerald-400" />
                Submit Verification Form (পেমেন্ট সাবমিশন)
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                Enter your payment details below. SuperAdmin will verify within 15-30 minutes.
              </p>

              {statusMessage && (
                <div className="mb-4 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
                  <span>{statusMessage}</span>
                </div>
              )}

              {errorMessage && (
                <div className="mb-4 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmitManualPayment} className="space-y-3.5 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">
                      Payment Channel <span className="text-rose-400">*</span>
                    </label>
                    <select
                      aria-label="Payment Channel"
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500 font-medium"
                    >
                      <option value="manual_bkash">bKash (বিকাশ)</option>
                      <option value="manual_nagad">Nagad (নগদ)</option>
                      <option value="manual_bank">Dutch Bangla Bank (ব্যাংক)</option>
                      <option value="manual_rocket">Rocket (রকেট)</option>
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
                    placeholder="e.g. FAHDKFHDKDJ"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono uppercase tracking-wider focus:outline-none focus:border-indigo-500"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    SMS-এ প্রাপ্ত লেনদেন আইডিটি (TrxID) এখানে লিখুন
                  </span>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Sender Account / Mobile Number <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={senderPhone}
                    onChange={(e) => setSenderPhone(e.target.value)}
                    placeholder="e.g. 01832999277"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    যে নম্বর থেকে টাকা পাঠিয়েছেন
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || amount <= 0}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 mt-4"
                >
                  <Send className="w-3.5 h-3.5" />
                  {isSubmitting ? "Submitting..." : `Submit ৳${amount} for Verification`}
                </button>
              </form>
            </div>

            {/* Submission History Section */}
            <div className="mt-6 pt-5 border-t border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold text-white">Your Payment History (পূর্বের পেমেন্ট হিস্ট্রি)</h4>
                <span className="text-[10px] text-slate-400">{myPayments.length} records</span>
              </div>

              {myPayments.length === 0 ? (
                <p className="text-[11px] text-slate-500 italic py-2">No past manual submissions yet.</p>
              ) : (
                <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                  {myPayments.map((p, idx) => {
                    const trx = p.trxId || p.transactionId || "N/A";
                    const acc = p.accountNo || p.senderPhone || "N/A";
                    const isApproved = p.status === "approved";
                    const isRejected = p.status === "rejected";

                    return (
                      <div
                        key={p.id || idx}
                        className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between text-xs"
                      >
                        <div>
                          <p className="font-semibold text-white text-[11px] flex items-center gap-1.5">
                            <span>
                              {p.packageName ||
                                (p.packageId === "premium_monthly"
                                  ? "Premium Monthly"
                                  : p.packageId === "premium_yearly"
                                  ? "Premium Yearly"
                                  : "Subscription")}
                            </span>
                            <span className="text-[10px] font-normal text-slate-400 font-mono">
                              ({formatMethodLabel(p.paymentMethod)})
                            </span>
                          </p>
                          <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                            TrxID: <span className="text-slate-200 font-semibold">{trx}</span> • A/C: {acc}
                          </p>
                          <p className="text-[9px] text-slate-500">
                            {formatDate(p.createdAt || p.submittedAt)}
                            {p.approvedAt && ` • Approved: ${formatDate(p.approvedAt)}`}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="font-bold text-white font-mono text-xs">
                            {formatCurrency(p.amount)}
                          </p>
                          <span
                            className={`inline-block mt-1 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                              isApproved
                                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                : isRejected
                                ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                                : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                            }`}
                          >
                            {p.status || "PENDING"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
