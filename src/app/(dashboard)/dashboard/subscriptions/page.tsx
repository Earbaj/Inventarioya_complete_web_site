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
  Calendar,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function SubscriptionsPage() {
  const { txt } = useLanguage();
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
      setErrorMessage(txt("অনুগ্রহ করে ট্রানজেকশন আইডি (TrxID) লিখুন।", "Please enter the Transaction ID (TrxID)."));
      return;
    }
    if (!senderPhone.trim()) {
      setErrorMessage(txt("অনুগ্রহ করে প্রেরকের মোবাইল / অ্যাকাউন্ট নম্বর লিখুন।", "Please enter the Sender Mobile / Account Number."));
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
        txt(
          "পেমেন্ট যাচাইয়ের আবেদন সফলভাবে জমা দেওয়া হয়েছে! সুপারএডমিন ১৫-৩০ মিনিটের মধ্যে যাচাই করে প্ল্যান সক্রিয় করবেন।",
          "Payment verification submitted successfully! SuperAdmin will review and activate your plan within 15-30 minutes."
        )
      );
      setTransactionId("");
      setSenderPhone("");
    } catch (err: any) {
      setErrorMessage(err.message || txt("পেমেন্ট তথ্য জমা দিতে ব্যর্থ হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।", "Failed to submit payment verification. Please try again."));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Find latest active/approved payment if any
  const approvedPayment = [...myPayments]
    .filter((p) => p.status === "approved")
    .sort((a, b) => {
      const dateA = new Date(a.approvedAt || a.createdAt || 0).getTime();
      const dateB = new Date(b.approvedAt || b.createdAt || 0).getTime();
      return dateB - dateA;
    })[0];

  const activePackageId = approvedPayment?.packageId || (user?.subscriptionTier === "premium" ? "premium_monthly" : "free");
  const approvedPkg = packages.find((p) => p.id === activePackageId);
  const isPremiumActive = Boolean(approvedPayment) || (user?.subscriptionTier === "premium");

  // Calculate Expiry Date & Remaining Days
  let expiryDate: Date | null = null;
  let remainingDays: number | null = null;
  let isExpired = false;

  if (approvedPayment) {
    const baseDate = new Date(approvedPayment.approvedAt || approvedPayment.createdAt || approvedPayment.submittedAt || Date.now());
    let duration = approvedPkg?.durationDays;
    if (!duration || duration <= 0) {
      if (approvedPayment.packageId?.includes("year")) {
        duration = 365;
      } else {
        duration = 30; // default monthly
      }
    }
    expiryDate = new Date(baseDate.getTime() + duration * 24 * 60 * 60 * 1000);
  } else if (user?.subscriptionExpiresAt) {
    expiryDate = new Date(user.subscriptionExpiresAt);
  }

  if (expiryDate && isPremiumActive) {
    const now = new Date();
    const diffTime = expiryDate.getTime() - now.getTime();
    remainingDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (remainingDays < 0) {
      isExpired = true;
      remainingDays = 0;
    }
  }

  const planName =
    approvedPkg?.name ||
    (activePackageId === "premium_yearly"
      ? "Premium Yearly"
      : activePackageId === "premium_monthly"
      ? "Premium Monthly"
      : isPremiumActive
      ? "Premium Plan"
      : "Free Starter Plan");

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
      <DashboardHeader title={txt("দোকান সাবস্ক্রিপশন ও বিলিং", "Shop Subscription & Billing")} />

      <main className="p-4 sm:p-6 space-y-6 sm:space-y-8 max-w-7xl">
        {/* Current Active Plan Card with Days Remaining */}
        <div className="rounded-3xl bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-900 border border-indigo-500/40 p-5 sm:p-7 shadow-xl relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2.5">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border flex items-center gap-1.5 ${
                    isPremiumActive && !isExpired
                      ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
                      : isExpired
                      ? "bg-rose-500/15 border-rose-500/30 text-rose-400"
                      : "bg-indigo-500/15 border-indigo-500/30 text-indigo-300"
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isPremiumActive && !isExpired
                        ? "bg-emerald-400 animate-pulse"
                        : isExpired
                        ? "bg-rose-400"
                        : "bg-indigo-400"
                    }`}
                  />
                  {isPremiumActive && !isExpired
                    ? txt("সক্রিয় সাবস্ক্রিপশন (প্রিমিয়াম)", "ACTIVE SUBSCRIPTION (Premium)")
                    : isExpired
                    ? txt("মেয়াদোত্তীর্ণ প্ল্যান", "EXPIRED PLAN")
                    : txt("বর্তমান প্ল্যান", "CURRENT PLAN")}
                </span>

                {approvedPayment?.approvedAt && (
                  <span className="text-[11px] text-slate-400 font-mono">
                    {txt("সক্রিয়করণের তারিখ:", "Activated on")} {formatDate(approvedPayment.approvedAt)}
                  </span>
                )}
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2.5">
                    <span>{planName}</span>
                    {isPremiumActive && !isExpired && (
                      <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0" />
                    )}
                  </h2>

                  {/* Prominent Days Remaining Pill */}
                  {isPremiumActive && remainingDays !== null && (
                    <div
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold border shadow-sm ${
                        isExpired
                          ? "bg-rose-500/20 border-rose-500/40 text-rose-300"
                          : remainingDays <= 5
                          ? "bg-amber-500/20 border-amber-500/40 text-amber-300 animate-pulse"
                          : "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5 shrink-0" />
                      <span>
                        {isExpired
                          ? txt("মেয়াদ শেষ হয়েছে", "Plan Expired")
                          : txt(`আর ${remainingDays} দিন বাকি আছে`, `${remainingDays} Days Remaining`)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Expiry Date Display */}
                {isPremiumActive && expiryDate && (
                  <div className="flex items-center gap-2 text-xs text-slate-300 mt-2">
                    <Calendar className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span>
                      {txt("সাবস্ক্রিপশনের মেয়াদ শেষ হবে:", "Subscription expires on:")}{" "}
                      <strong className="text-white font-medium">
                        {formatDate(expiryDate.toISOString())}
                      </strong>
                      {!isExpired && remainingDays !== null && (
                        <span className="text-slate-400 ml-1.5 font-mono">
                          {txt(`(পরবর্তী ${remainingDays} দিন পর্যন্ত আনলিমিটেড ব্যবহার)`, `(Unlimited access for the next ${remainingDays} days)`)}
                        </span>
                      )}
                    </span>
                  </div>
                )}
              </div>

              <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                {isPremiumActive && !isExpired
                  ? txt(
                      "অল-অ্যাক্সেস প্রিমিয়াম সক্রিয় • আনলিমিটেড কাস্টমার, ইনভেন্টরি, কর্মী ও ইনভয়েস • মাল্টি-ব্রাঞ্চ ও ক্লাউড সিঙ্ক চালু",
                      "All-Access Premium Activated • Unlimited Customers, Inventory, Staff & Invoices • Multi-Branch & Android POS Sync Active"
                    )
                  : txt(
                      "ফ্রি স্টার্টার টিয়ার। সর্বোচ্চ ১টি কাস্টমার, ১টি ম্যানেজার, ৫টি আইটেম ও ৫টি বিক্রির সুবিধা। আনলিমিটেড সুবিধার জন্য প্রিমিয়ামে আপগ্রেড করুন।",
                      "Free Starter Tier. Up to 1 customer, 1 manager, 5 items, and 5 sales. Upgrade to Premium for unlimited access."
                    )}
              </p>
            </div>

            {/* Right Side Stats / Days Countdown Box */}
            <div className="flex sm:flex-col items-end sm:items-end justify-between w-full lg:w-auto pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-800 gap-3 shrink-0">
              {isPremiumActive && remainingDays !== null ? (
                <div className="flex items-center gap-3.5 bg-slate-950/80 border border-slate-800 px-4 py-3 rounded-2xl shadow-inner">
                  <div className="text-center min-w-[56px]">
                    <p
                      className={`text-3xl font-black font-mono leading-none ${
                        isExpired
                          ? "text-rose-400"
                          : remainingDays <= 5
                          ? "text-amber-400 animate-pulse"
                          : "text-emerald-400"
                      }`}
                    >
                      {remainingDays}
                    </p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">
                      {txt("দিন বাকি", remainingDays === 1 ? "Day Left" : "Days Left")}
                    </p>
                  </div>

                  <div className="h-8 w-px bg-slate-800" />

                  <div className="text-left sm:text-right">
                    <p className="text-sm font-bold text-white font-mono">
                      {approvedPayment ? formatCurrency(approvedPayment.amount) : "৳1,000"}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {txt(
                        `${approvedPkg?.durationDays || (activePackageId === "premium_yearly" ? 365 : 30)} দিনের প্ল্যান`,
                        `${approvedPkg?.durationDays || (activePackageId === "premium_yearly" ? 365 : 30)} Days Plan`
                      )}
                    </p>
                    <span className={`text-[10px] font-medium block mt-0.5 ${isExpired ? "text-rose-400" : "text-emerald-400"}`}>
                      {isExpired ? txt("মেয়াদ শেষ", "Expired") : txt("সক্রিয়", "Active")}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-left sm:text-right">
                  <p className="text-2xl font-black text-white font-mono">
                    ৳0
                    <span className="text-xs text-slate-400 font-normal font-sans ml-1">
                      {txt("/আজীবন", "/forever")}
                    </span>
                  </p>
                  <p className="text-[11px] text-indigo-400 font-medium mt-1">
                    {txt("ফ্রি স্টার্টার প্ল্যান সক্রিয়", "Free Starter Plan Active")}
                  </p>
                </div>
              )}

              <p className="text-[11px] text-emerald-400 font-medium flex items-center justify-start sm:justify-end gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>{txt("ক্লাউড কানেক্টেড", "Keeper POS Cloud Connected")}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Available Packages */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-base font-bold dark:text-white text-slate-900">{txt("প্যাকেজ আপগ্রেড বা নবায়ন করুন", "Upgrade or Renew Package")}</h3>
              <p className="text-xs dark:text-slate-400 text-slate-500">{txt("যাচাইকরণ ও সক্রিয়করণের জন্য যেকোনো একটি প্ল্যান নির্বাচন করুন", "Select any plan below to proceed with verification & activation")}</p>
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
                        ? txt("আনলিমিটেড কাস্টমার", "Unlimited Customers")
                        : txt(`সর্বোচ্চ ${pkg.limits.customers} জন কাস্টমার`, `Max ${pkg.limits.customers} Active Customer`),
                      pkg.limits.managers === "unlimited"
                        ? txt("আনলিমিটেড কর্মী ও ম্যানেজার", "Unlimited Staff & Managers")
                        : txt(`সর্বোচ্চ ${pkg.limits.managers} জন কর্মী`, `Max ${pkg.limits.managers} Manager/Staff`),
                      pkg.limits.items === "unlimited"
                        ? txt("আনলিমিটেড পণ্য ও স্টক", "Unlimited Products & Inventory")
                        : txt(`সর্বোচ্চ ${pkg.limits.items} টি পণ্য`, `Max ${pkg.limits.items} Inventory Items`),
                      pkg.limits.sales === "unlimited"
                        ? txt("আনলিমিটেড বিক্রয় ইনভয়েস", "Unlimited POS Sales Invoices")
                        : txt(`সর্বোচ্চ ${pkg.limits.sales} টি ইনভয়েস`, `Max ${pkg.limits.sales} Sales Invoices`),
                      pkg.price > 0 ? txt("মাল্টি-ব্রাঞ্চ ক্লাউড সুবিধা", "Multi-Branch Cloud Access") : txt("সাধারণ পিওএস ও রসিদ", "Basic POS & Receipts"),
                      pkg.price > 0 ? txt("অগ্রাধিকার হোয়াটসঅ্যাপ সাপোর্ট", "Priority WhatsApp Support") : txt("স্ট্যান্ডার্ড ইমেইল সাপোর্ট", "Standard Email Support"),
                    ]
                  : [pkg.description || txt("অল-অ্যাক্সেস ফিচার প্যাক", "All-Access Feature Pack")];

              return (
                <div
                  key={pkg.id}
                  onClick={() => handlePackageSelect(pkg)}
                  className={`p-6 rounded-2xl cursor-pointer transition-all border flex flex-col justify-between relative ${
                    isSelected
                      ? "dark:bg-indigo-950/40 bg-indigo-50/70 border-indigo-500 shadow-xl shadow-indigo-500/10 scale-[1.01]"
                      : "dark:bg-slate-900 bg-white dark:border-slate-800 border-slate-200 hover:dark:border-slate-700 hover:border-slate-300"
                  }`}
                >
                  {isPopular && (
                    <span className="absolute -top-2.5 right-6 text-[9px] px-2.5 py-0.5 rounded-full bg-indigo-600 text-white font-bold tracking-wider uppercase shadow flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      {txt("সর্বাধিক জনপ্রিয়", "MOST POPULAR")}
                    </span>
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-base font-bold dark:text-white text-slate-900">{pkg.name}</h4>
                    </div>

                    <p className="text-3xl font-extrabold dark:text-white text-slate-900 mb-2 font-mono">
                      {formatCurrency(pkg.price)}
                      <span className="text-xs dark:text-slate-400 text-slate-500 font-normal font-sans ml-1">
                        /{pkg.durationDays === 365 ? txt("৩৬৫ দিন", "365 days") : pkg.durationDays === 30 ? txt("৩০ দিন", "30 days") : txt("স্টার্টার", "starter")}
                      </span>
                    </p>

                    {pkg.description && (
                      <p className="text-xs dark:text-slate-300 text-slate-600 mb-4 dark:bg-slate-950/60 bg-slate-50 p-2.5 rounded-xl border dark:border-slate-800/80 border-slate-200">
                        {pkg.description}
                      </p>
                    )}

                    <div className="space-y-2 text-xs dark:text-slate-300 text-slate-700 mb-6 pt-2 border-t dark:border-slate-800/80 border-slate-100">
                      {(featuresList || []).map((feat, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <Check className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400 shrink-0 mt-0.5" />
                          <span className="text-[11px] leading-snug dark:text-slate-200 text-slate-700">{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    className={`w-full py-2.5 rounded-xl text-xs font-bold transition-colors ${
                      isSelected
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                        : "dark:bg-slate-800 bg-slate-100 dark:text-slate-300 text-slate-700 hover:dark:bg-slate-700 hover:bg-slate-200 hover:dark:text-white hover:text-slate-900"
                    }`}
                  >
                    {isSelected
                      ? pkg.price === 0
                        ? txt("স্টার্টার সক্রিয়", "Starter Active")
                        : txt("পেমেন্টের জন্য নির্বাচিত", "Selected for Payment")
                      : txt("প্ল্যান নির্বাচন করুন", "Choose Plan")}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Payment Verification & Submission Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Payment Channels & Official Guidelines */}
          <div className="rounded-2xl dark:bg-slate-900 bg-white border dark:border-slate-800 border-slate-200 p-6 space-y-5">
            <div>
              <h3 className="text-sm font-bold dark:text-white text-slate-900 mb-1 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-500" />
                {txt("পেমেন্ট চ্যানেল (অফিসিয়াল নম্বরসমূহ)", "Payment Channels (Official Numbers)")}
              </h3>
              <p className="text-xs dark:text-slate-400 text-slate-500">
                {txt("নিচের যেকোনো যাচাইকৃত নম্বরে সাবস্ক্রিপশন ফি পাঠান:", "Send subscription fee to any of our verified merchant/personal numbers below:")}
              </p>
            </div>

            {/* Official Mobile Accounts */}
            {paymentInfo && (
              <div className="space-y-3">
                {paymentInfo.bkashNumber && (
                  <div className="p-3.5 rounded-xl dark:bg-slate-950 bg-slate-50 border dark:border-slate-800 border-slate-200 flex justify-between items-center text-xs">
                    <div>
                      <span className="text-pink-600 dark:text-pink-400 font-bold block">{txt("বিকাশ (সেন্ড মানি / মার্চেন্ট):", "bKash (Send Money / Merchant):")}</span>
                      <span className="dark:text-white text-slate-900 font-mono font-bold text-sm tracking-wide">
                        {paymentInfo.bkashNumber}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(paymentInfo.bkashNumber!, "bkash")}
                      className="px-3 py-1.5 rounded-lg dark:bg-slate-800 bg-white hover:dark:bg-slate-700 hover:bg-slate-100 dark:text-slate-300 text-slate-700 border dark:border-transparent border-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5 text-pink-500" />
                      {copiedField === "bkash" ? txt("কপি হয়েছে!", "Copied!") : txt("কপি করুন", "Copy")}
                    </button>
                  </div>
                )}

                {paymentInfo.nagadNumber && (
                  <div className="p-3.5 rounded-xl dark:bg-slate-950 bg-slate-50 border dark:border-slate-800 border-slate-200 flex justify-between items-center text-xs">
                    <div>
                      <span className="text-orange-600 dark:text-orange-400 font-bold block">{txt("নগদ (সেন্ড মানি / মার্চেন্ট):", "Nagad (Send Money / Merchant):")}</span>
                      <span className="dark:text-white text-slate-900 font-mono font-bold text-sm tracking-wide">
                        {paymentInfo.nagadNumber}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(paymentInfo.nagadNumber!, "nagad")}
                      className="px-3 py-1.5 rounded-lg dark:bg-slate-800 bg-white hover:dark:bg-slate-700 hover:bg-slate-100 dark:text-slate-300 text-slate-700 border dark:border-transparent border-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5 text-orange-500" />
                      {copiedField === "nagad" ? txt("কপি হয়েছে!", "Copied!") : txt("কপি করুন", "Copy")}
                    </button>
                  </div>
                )}

                {/* Bank Details */}
                {(paymentInfo.bankDetails || paymentInfo.bankAccount) && (
                  <div className="p-3.5 rounded-xl dark:bg-slate-950 bg-slate-50 border dark:border-slate-800 border-slate-200 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-sky-600 dark:text-sky-400 font-bold">
                        <Building className="w-3.5 h-3.5" />
                        {txt("ব্যাংক একাউন্ট (ডাচ-বাংলা ব্যাংক):", "Bank Account (Dutch-Bangla Bank):")}
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
                        className="px-2.5 py-1 rounded-lg dark:bg-slate-800 bg-white hover:dark:bg-slate-700 hover:bg-slate-100 dark:text-slate-300 text-slate-700 border dark:border-transparent border-slate-300 text-[11px] font-semibold flex items-center gap-1 transition-colors"
                      >
                        <Copy className="w-3 h-3 text-sky-500" />
                        {copiedField === "bank" ? txt("কপি হয়েছে!", "Copied!") : txt("হিসাব নং কপি", "Copy A/C")}
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] dark:text-slate-300 text-slate-700 pt-1 border-t dark:border-slate-900 border-slate-200">
                      <div>
                        {txt("ব্যাংকের নাম:", "Bank Name:")}{" "}
                        <span className="dark:text-white text-slate-900 font-semibold block">
                          {paymentInfo.bankDetails?.bankName || paymentInfo.bankAccount?.bankName}
                        </span>
                      </div>
                      <div>
                        {txt("একাউন্টের নাম:", "Account Name:")}{" "}
                        <span className="dark:text-white text-slate-900 font-semibold block">
                          {paymentInfo.bankDetails?.accountName || paymentInfo.bankAccount?.accountName}
                        </span>
                      </div>
                      <div>
                        {txt("হিসাব নম্বর:", "Account Number:")}{" "}
                        <span className="dark:text-white text-slate-900 font-mono font-bold block text-xs text-sky-600 dark:text-sky-300">
                          {paymentInfo.bankDetails?.accountNumber || paymentInfo.bankAccount?.accountNumber}
                        </span>
                      </div>
                      <div>
                        {txt("শাখা:", "Branch:")}{" "}
                        <span className="dark:text-white text-slate-900 font-semibold block">
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
              <div className="p-4 rounded-xl dark:bg-indigo-950/20 bg-indigo-50/70 border border-indigo-500/25 text-xs space-y-2">
                <div className="flex items-center gap-1.5 text-indigo-700 dark:text-indigo-300 font-bold">
                  <Info className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                  {txt("পেমেন্ট নির্দেশিকা:", "Payment Instructions:")}
                </div>
                <div className="space-y-1.5 text-[11px] dark:text-slate-300 text-slate-700">
                  {paymentInfo.instructions.map((inst, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 text-[10px] font-bold">
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
          <div className="rounded-2xl dark:bg-slate-900 bg-white border dark:border-slate-800 border-slate-200 p-6 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold dark:text-white text-slate-900 mb-1 flex items-center gap-2">
                <Send className="w-4 h-4 text-emerald-500" />
                {txt("পেমেন্ট যাচাইকরণ ফর্ম", "Submit Verification Form")}
              </h3>
              <p className="text-xs dark:text-slate-400 text-slate-500 mb-4">
                {txt("পেমেন্টের তথ্য লিখুন। সুপারএডমিন ১৫-৩০ মিনিটের মধ্যে যাচাই করবেন।", "Enter your payment details below. SuperAdmin will verify within 15-30 minutes.")}
              </p>

              {statusMessage && (
                <div className="mb-4 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500 mt-0.5" />
                  <span>{statusMessage}</span>
                </div>
              )}

              {errorMessage && (
                <div className="mb-4 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmitManualPayment} className="space-y-3.5 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block dark:text-slate-300 text-slate-700 font-medium mb-1">
                      {txt("পেমেন্ট চ্যানেল *", "Payment Channel *")}
                    </label>
                    <select
                      aria-label="Payment Channel"
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full dark:bg-slate-950 bg-slate-50 border dark:border-slate-800 border-slate-300 rounded-xl px-3 py-2 dark:text-white text-slate-900 focus:outline-none focus:border-indigo-500 font-medium"
                    >
                      <option value="manual_bkash">bKash (বিকাশ)</option>
                      <option value="manual_nagad">Nagad (নগদ)</option>
                      <option value="manual_bank">Dutch Bangla Bank (ব্যাংক)</option>
                      <option value="manual_rocket">Rocket (রকেট)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block dark:text-slate-300 text-slate-700 font-medium mb-1">{txt("টাকার পরিমাণ (৳)", "Amount (৳)")}</label>
                    <input
                      type="number"
                      required
                      value={amount}
                      onChange={(e) => setAmount(Number(e.target.value))}
                      className="w-full dark:bg-slate-950 bg-slate-50 border dark:border-slate-800 border-slate-300 rounded-xl px-3 py-2 dark:text-white text-slate-900 font-bold font-mono focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block dark:text-slate-300 text-slate-700 font-medium mb-1">
                    {txt("ট্রানজেকশন আইডি (TrxID) *", "Transaction ID (TrxID) *")}
                  </label>
                  <input
                    type="text"
                    required
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    placeholder="e.g. FAHDKFHDKDJ"
                    className="w-full dark:bg-slate-950 bg-slate-50 border dark:border-slate-800 border-slate-300 rounded-xl px-3 py-2 dark:text-white text-slate-900 font-mono uppercase tracking-wider focus:outline-none focus:border-indigo-500"
                  />
                  <span className="text-[10px] dark:text-slate-500 text-slate-400 mt-1 block">
                    {txt("SMS-এ প্রাপ্ত লেনদেন আইডিটি (TrxID) এখানে লিখুন", "Enter TrxID received in SMS")}
                  </span>
                </div>

                <div>
                  <label className="block dark:text-slate-300 text-slate-700 font-medium mb-1">
                    {txt("প্রেরকের মোবাইল / একাউন্ট নম্বর *", "Sender Account / Mobile Number *")}
                  </label>
                  <input
                    type="text"
                    required
                    value={senderPhone}
                    onChange={(e) => setSenderPhone(e.target.value)}
                    placeholder="e.g. 01832999277"
                    className="w-full dark:bg-slate-950 bg-slate-50 border dark:border-slate-800 border-slate-300 rounded-xl px-3 py-2 dark:text-white text-slate-900 font-mono focus:outline-none focus:border-indigo-500"
                  />
                  <span className="text-[10px] dark:text-slate-500 text-slate-400 mt-1 block">
                    {txt("যে নম্বর থেকে টাকা পাঠিয়েছেন", "The account or mobile number you sent money from")}
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || amount <= 0}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 mt-4"
                >
                  <Send className="w-3.5 h-3.5" />
                  {isSubmitting ? txt("জমা দেওয়া হচ্ছে...", "Submitting...") : txt(`৳${amount} যাচাইয়ের জন্য জমা দিন`, `Submit ৳${amount} for Verification`)}
                </button>
              </form>
            </div>

            {/* Submission History Section */}
            <div className="mt-6 pt-5 border-t dark:border-slate-800 border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold dark:text-white text-slate-900">{txt("পূর্বের পেমেন্ট হিস্ট্রি", "Your Payment History")}</h4>
                <span className="text-[10px] dark:text-slate-400 text-slate-500">{txt(`${myPayments.length} টি রেকর্ড`, `${myPayments.length} records`)}</span>
              </div>

              {myPayments.length === 0 ? (
                <p className="text-[11px] text-slate-500 italic py-2">{txt("এখনও কোনো ম্যানুয়াল পেমেন্ট জমা দেওয়া হয়নি।", "No past manual submissions yet.")}</p>
              ) : (
                <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                  {myPayments.map((p, idx) => {
                    const trx = p.trxId || p.transactionId || "N/A";
                    const acc = p.accountNo || p.senderPhone || "N/A";
                    const isApproved = p.status === "approved";
                    const isRejected = p.status === "rejected";

                    let pDaysLeft: number | null = null;
                    if (isApproved) {
                      const pBase = new Date(p.approvedAt || p.createdAt || p.submittedAt || Date.now());
                      const pDuration = p.packageId === "premium_yearly" ? 365 : 30;
                      const pExp = new Date(pBase.getTime() + pDuration * 24 * 60 * 60 * 1000);
                      pDaysLeft = Math.ceil((pExp.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                    }

                    return (
                      <div
                        key={p.id || idx}
                        className="p-3 rounded-xl dark:bg-slate-950 bg-slate-50 border dark:border-slate-800/80 border-slate-200 flex items-center justify-between text-xs"
                      >
                        <div>
                          <p className="font-semibold dark:text-white text-slate-900 text-[11px] flex items-center gap-1.5 flex-wrap">
                            <span>
                              {p.packageName ||
                                (p.packageId === "premium_monthly"
                                  ? txt("প্রিমিয়াম মাসিক", "Premium Monthly")
                                  : p.packageId === "premium_yearly"
                                  ? txt("প্রিমিয়াম বাৎসরিক", "Premium Yearly")
                                  : txt("সাবস্ক্রিপশন", "Subscription"))}
                            </span>
                            <span className="text-[10px] font-normal dark:text-slate-400 text-slate-500 font-mono">
                              ({formatMethodLabel(p.paymentMethod)})
                            </span>
                            {isApproved && pDaysLeft !== null && (
                              <span
                                className={`text-[9px] px-1.5 py-0.2 rounded font-bold font-sans ${
                                  pDaysLeft > 0
                                    ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border border-emerald-500/25"
                                    : "dark:bg-slate-800 bg-slate-200 dark:text-slate-400 text-slate-600"
                                }`}
                              >
                                {pDaysLeft > 0 ? txt(`আর ${pDaysLeft} দিন বাকি`, `${pDaysLeft} days left`) : txt("মেয়াদ শেষ", "Expired")}
                              </span>
                            )}
                          </p>
                          <p className="text-[10px] dark:text-slate-400 text-slate-500 font-mono mt-0.5">
                            TrxID: <span className="dark:text-slate-200 text-slate-800 font-semibold">{trx}</span> • A/C: {acc}
                          </p>
                          <p className="text-[9px] dark:text-slate-500 text-slate-400">
                            {formatDate(p.createdAt || p.submittedAt)}
                            {p.approvedAt && ` • ${txt("অনুমোদিত:", "Approved:")} ${formatDate(p.approvedAt)}`}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="font-bold dark:text-white text-slate-900 font-mono text-xs">
                            {formatCurrency(p.amount)}
                          </p>
                          <span
                            className={`inline-block mt-1 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                              isApproved
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                                : isRejected
                                ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                                : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                            }`}
                          >
                            {isApproved ? txt("অনুমোদিত", "APPROVED") : isRejected ? txt("প্রত্যাখ্যাত", "REJECTED") : txt("অপেক্ষমাণ", "PENDING")}
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
