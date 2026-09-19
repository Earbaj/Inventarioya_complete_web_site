"use client";

import Link from "next/link";
import { LandingNavbar } from "@/components/layout/LandingNavbar";
import { Footer } from "@/components/layout/Footer";
import {
  ShoppingCart,
  Users,
  Package,
  Wallet,
  Smartphone,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Printer,
  TrendingUp,
  Store,
  HelpCircle,
  Search,
  Check,
  CreditCard,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function LandingPage() {
  const { locale, t, txt } = useLanguage();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-indigo-600 selection:text-white transition-colors">
      <LandingNavbar />

      {/* Hero Section */}
      <section className="relative pt-28 pb-16 md:pt-36 md:pb-24 border-b border-slate-200 dark:border-slate-800/80 bg-white/60 dark:bg-slate-950">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          {/* Announcement pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-indigo-700 dark:text-indigo-400 text-xs font-semibold mb-6 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>
              {txt(
                "গুগল প্লে-স্টোর সার্টিফাইড অ্যান্ড্রয়েড অ্যাপ ও ক্লাউড পিওএস",
                "Google Play Store Certified Android App & Cloud POS"
              )}
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-4xl mx-auto leading-tight sm:leading-tight">
            {txt("দোকানের বিক্রয়, স্টক ও বাকি খাতার", "Store Billing, Stock & Customer Khata —")}{" "}
            <span className="text-indigo-600 dark:text-indigo-400">
              {txt("সহজ ও নির্ভরযোগ্য সমাধান", "Simple & 100% Reliable")}
            </span>
          </h1>

          <p className="mt-5 text-base sm:text-lg text-slate-700 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed font-normal">
            {txt(
              "মুদি দোকান, সুপারশপ, ফার্মেসি, গার্মেন্টস ও পাইকারি ব্যবসার জন্য একটি পূর্ণাঙ্গ পিওএস সফটওয়্যার। যেকোনো কম্পিউটার বা স্মার্টফোনে নিমেষেই ক্যাশ মেমো বানান, কাস্টমার বকেয়ার হিসাব রাখুন এবং থার্মাল রসিদ প্রিন্ট করুন।",
              "A complete Cloud POS and retail management system for grocery stores, supermarkets, pharmacies, fashion outlets, and wholesale businesses. Issue fast cash memos, track customer credit ledgers, and print thermal receipts seamlessly on any device."
            )}
          </p>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Link
              href="/register"
              className="w-full sm:w-auto px-8 py-3.5 text-sm font-bold text-white keep-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
            >
              <span>{txt("বিনামূল্যে ট্রায়াল শুরু করুন", "Start Free Trial")}</span>
              <ArrowRight className="w-4 h-4 text-white keep-white" />
            </Link>
            <Link
              href="/dashboard/pos"
              className="w-full sm:w-auto px-8 py-3.5 text-sm font-bold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-800 rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <ShoppingCart className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>{txt("লাইভ পিওএস ডেমো দেখুন", "Try Live POS Demo")}</span>
            </Link>
          </div>

          {/* Trust points */}
          <div className="mt-9 flex flex-wrap items-center justify-center gap-x-6 gap-y-2.5 text-xs text-slate-700 dark:text-slate-300 font-semibold">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              {txt("কোনো সেটআপ ফি নেই", "Zero Setup Fees")}
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              {txt("কম্পিউটার ও মোবাইল উভয় ডিভাইসে চলে", "Works on Desktop & Smartphone")}
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              {txt("৫৮ ও ৮০ মিমি থার্মাল রসিদ সাপোর্ট", "58mm & 80mm Thermal Receipt Print")}
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              {txt("১০০% সুরক্ষিত ক্লাউড ব্যাকআপ", "Encrypted Cloud Data Backup")}
            </span>
          </div>
        </div>
      </section>

      {/* POS Showcase Section (id="pos") */}
      <section id="pos" className="py-16 md:py-24 bg-slate-100/70 dark:bg-slate-900/40 border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block mb-2">
              {txt("দ্রুততম বিলিং টার্মিনাল", "Lightning-Fast Billing Terminal")}
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
              {txt("ক্যাশিয়ার ও কাউন্টারের জন্য তৈরি আধুনিক পিওএস", "Engineered for Cashiers: 5-Second Checkout")}
            </h2>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {txt(
                "কাস্টমারের ভিড়েও লাইনে কোনো বিলম্ব ছাড়াই বারকোড স্ক্যান করুন, এক ক্লিকে ক্যাশ, বিকাশ বা বাকিতে মেমো প্রিন্ট দিন।",
                "Keep store queues moving smoothly with instant barcode lookups, cart holding, partial due tracking, and one-click thermal printing."
              )}
            </p>
          </div>

          {/* POS Terminal Simulation Card */}
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 shadow-xl overflow-hidden">
            {/* Top terminal bar */}
            <div className="bg-slate-800 dark:bg-slate-950 px-5 py-3.5 border-b border-slate-700 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="font-bold text-white keep-white">
                  {txt("টার্মিনাল ০১: মেসার্স রহিম জেনারেল স্টোর (প্রধান কাউন্টার)", "Terminal 01: Rahim General Store (Main Counter)")}
                </span>
              </div>
              <div className="flex items-center gap-3 text-slate-300">
                <span>{txt("ক্যাশিয়ার: মোঃ আরিফ", "Cashier: Md. Arif")}</span>
                <span className="hidden sm:inline text-slate-500">|</span>
                <span className="hidden sm:inline px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono font-bold">
                  {txt("পিওএস অনলাইন", "POS Online")}
                </span>
              </div>
            </div>

            {/* Simulated POS layout */}
            <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Product Cart Table */}
              <div className="lg:col-span-7 space-y-4">
                {/* Search Bar Simulation */}
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <div className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
                    <span>{txt("বারকোড স্ক্যান করুন বা পণ্যের নাম / কোড লিখুন...", "Scan barcode or type product name / SKU...")}</span>
                    <span className="hidden sm:inline px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-[10px] font-mono font-bold text-slate-600 dark:text-slate-300">
                      F2 Search
                    </span>
                  </div>
                </div>

                {/* Items in Active Cart */}
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                  <div className="bg-slate-100 dark:bg-slate-950/70 px-4 py-2 text-[11px] font-bold text-slate-700 dark:text-slate-300 grid grid-cols-12 gap-2 border-b border-slate-200 dark:border-slate-800">
                    <span className="col-span-6">{txt("পণ্যের বিবরণ", "Product Description")}</span>
                    <span className="col-span-2 text-center">{txt("পরিমাণ", "Qty")}</span>
                    <span className="col-span-2 text-right">{txt("একক মূল্য", "Unit")}</span>
                    <span className="col-span-2 text-right">{txt("মোট", "Total")}</span>
                  </div>

                  <div className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                    <div className="px-4 py-2.5 grid grid-cols-12 gap-2 items-center hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <div className="col-span-6">
                        <p className="font-semibold text-slate-900 dark:text-white">তীর ফর্টিফাইড সয়াবিন তেল (৫ লিটার)</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">বারকোড: 894112345001</p>
                      </div>
                      <span className="col-span-2 text-center font-medium">১ বোতল</span>
                      <span className="col-span-2 text-right font-medium">৳৮২০</span>
                      <span className="col-span-2 text-right font-bold text-slate-900 dark:text-white">৳৮২০</span>
                    </div>

                    <div className="px-4 py-2.5 grid grid-cols-12 gap-2 items-center hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <div className="col-span-6">
                        <p className="font-semibold text-slate-900 dark:text-white">মিনিকেট প্রিমিয়াম চাল (২৫ কেজি বস্তা)</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">বারকোড: 894112345002</p>
                      </div>
                      <span className="col-span-2 text-center font-medium">১ বস্তা</span>
                      <span className="col-span-2 text-right font-medium">৳১,৭৫০</span>
                      <span className="col-span-2 text-right font-bold text-slate-900 dark:text-white">৳১,৭৫০</span>
                    </div>

                    <div className="px-4 py-2.5 grid grid-cols-12 gap-2 items-center hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <div className="col-span-6">
                        <p className="font-semibold text-slate-900 dark:text-white">ডানো ফুল ক্রিম মিল্ক পাউডার (১ কেজি)</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">বারকোড: 894112345003</p>
                      </div>
                      <span className="col-span-2 text-center font-medium">১ প্যাকেট</span>
                      <span className="col-span-2 text-right font-medium">৳৮৯০</span>
                      <span className="col-span-2 text-right font-bold text-slate-900 dark:text-white">৳৮৯০</span>
                    </div>

                    <div className="px-4 py-2.5 grid grid-cols-12 gap-2 items-center hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <div className="col-span-6">
                        <p className="font-semibold text-slate-900 dark:text-white">রুপচাঁদা খাঁটি সরিষার তেল (৫০০ মিলি)</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">বারকোড: 894112345004</p>
                      </div>
                      <span className="col-span-2 text-center font-medium">২ বোতল</span>
                      <span className="col-span-2 text-right font-medium">৳১৮০</span>
                      <span className="col-span-2 text-right font-bold text-slate-900 dark:text-white">৳৩৬০</span>
                    </div>
                  </div>
                </div>

                {/* Customer selection info */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">
                        {txt("সিলেক্টেড কাস্টমার: জনাব তানভীর আহমেদ", "Selected Customer: Tanvir Ahmed")}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">০১৭১১-XXXXXX • নিয়মিত কাস্টমার</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 font-semibold text-[11px]">
                    {txt("পূর্বের বাকি: ৳১,৫০০", "Prior Due: ৳1,500")}
                  </span>
                </div>
              </div>

              {/* Right Column: Checkout & Tender Summary */}
              <div className="lg:col-span-5 flex flex-col justify-between p-4 sm:p-5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
                    {txt("বিল ও পেমেন্ট সারসংক্ষেপ", "Invoice & Payment Summary")}
                  </h4>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between text-slate-600 dark:text-slate-400">
                      <span>{txt("মোট আইটেম (৪টি পণ্য)", "Total Items (4 products)")}</span>
                      <span className="font-semibold text-slate-900 dark:text-white">৫টি একক</span>
                    </div>
                    <div className="flex justify-between text-slate-600 dark:text-slate-400">
                      <span>{txt("সাবটোটাল", "Subtotal")}</span>
                      <span className="font-semibold text-slate-900 dark:text-white">৳৩,৮২০</span>
                    </div>
                    <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                      <span>{txt("স্পেশাল ডিসকাউন্ট", "Special Discount")}</span>
                      <span className="font-semibold">-৳২০</span>
                    </div>
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between items-baseline">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">
                        {txt("সর্বমোট প্রদেয়", "Net Payable Amount")}
                      </span>
                      <span className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">৳৩,৮০০</span>
                    </div>
                  </div>

                  {/* Payment Methods */}
                  <div className="mt-5">
                    <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                      {txt("পেমেন্ট মেথড নির্বাচন করুন", "Select Tender Method")}
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="p-2.5 rounded-lg border-2 border-indigo-600 bg-indigo-50/50 dark:bg-indigo-600/20 text-center">
                        <p className="text-xs font-bold text-indigo-700 dark:text-indigo-300">{txt("ক্যাশ (নগদ)", "Cash")}</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">৳৩,৮০০</p>
                      </div>
                      <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-center">
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{txt("বিকাশ / নগদ", "bKash / Nagad")}</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">MFS</p>
                      </div>
                      <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-center">
                        <p className="text-xs font-bold text-rose-600 dark:text-rose-400">{txt("বাকি খাতা", "Due Credit")}</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">Ledger</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Print & Complete Action */}
                <div className="mt-6 space-y-2">
                  <Link
                    href="/dashboard/pos"
                    className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white keep-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all"
                  >
                    <Printer className="w-4 h-4 text-white keep-white" />
                    <span>{txt("থার্মাল মেমো প্রিন্ট ও সেল সম্পন্ন করুন", "Print Receipt & Complete Sale")}</span>
                  </Link>
                  <p className="text-[10px] text-center text-slate-500 dark:text-slate-400">
                    {txt("স্বয়ংক্রিয়ভাবে ক্যাশ ড্রয়ার খুলবে এবং ৫৮/৮০ মিমি প্রিন্টারে রসিদ বের হবে", "Auto cash drawer trigger & thermal slip generation")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Due Ledger Showcase (id="ledger") */}
      <section id="ledger" className="py-16 md:py-24 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Explanation */}
            <div className="lg:col-span-5 space-y-5 text-left">
              <span className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider block">
                {txt("কাস্টমার বাকি খাতা ও লেজার", "Customer Due & Ledger")}
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white leading-tight">
                {txt(
                  "কাগজের খাতা হারিয়ে যাওয়ার ভয় নেই, প্রতিটি কাস্টমারের আলাদা নির্ভুল হিসাব",
                  "No Lost Khata Books: 100% Transparent Customer Ledgers"
                )}
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {txt(
                  "দোকানে বাকি দিয়ে হিসাব না মেলার দিন শেষ। পিওএস থেকে সরাসরি বাকিতে বিক্রয় করুন, আংশিক টাকা জমা গ্রহণ করুন এবং তাৎক্ষণিক রসিদ বা স্টেটমেন্ট প্রিন্ট দিয়ে ভুল বোঝাবুঝি দূর করুন।",
                  "Sell on credit directly from POS, accept partial repayments anytime, and print complete transparent transaction statements to build customer trust."
                )}
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300">
                    <strong className="font-bold text-slate-900 dark:text-white">
                      {txt("আংশিক পরিশোধ ট্র্যাকিং: ", "Partial Due Settlement: ")}
                    </strong>
                    {txt("কাস্টমার ভেঙে ভেঙে টাকা দিলেও স্বয়ংক্রিয়ভাবে অবশিষ্ট ব্যালেন্স আপডেট হয়।", "Accept partial installments with instant automatic balance updates.")}
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300">
                    <strong className="font-bold text-slate-900 dark:text-white">
                      {txt("ফুল স্টেটমেন্ট প্রিন্ট: ", "Complete Ledger Statement: ")}
                    </strong>
                    {txt("কবে কত টাকা নিয়েছিলেন এবং কত জমা দিয়েছেন — পুরো ইতিহাস ১ ক্লিকে প্রিন্ট দিন।", "Print full chronological purchase & payment statements in 1 click.")}
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300">
                    <strong className="font-bold text-slate-900 dark:text-white">
                      {txt("গ্রাহক বিশ্বস্ততা বৃদ্ধি: ", "Strengthen Customer Trust: ")}
                    </strong>
                    {txt("কাস্টমারের মোবাইলে মেমো ও রসিদ থাকায় লেনদেন সম্পূর্ণ পরিষ্কার থাকে।", "Eliminate disputes with clear digital receipts and balance transparency.")}
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href="/dashboard/customers"
                  className="inline-flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
                >
                  <span>{txt("কাস্টমার লেজার মডিউল দেখুন", "Explore Customer Ledger Module")}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Right Card: Realistic Customer Khata Preview */}
            <div className="lg:col-span-7">
              <div className="rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 p-5 sm:p-6 shadow-lg text-left">
                {/* Customer Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                      <h4 className="font-bold text-base text-slate-900 dark:text-white">জনাব তানভীর আহমেদ</h4>
                      <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-[10px] font-semibold text-slate-700 dark:text-slate-300">
                        আইডি: CUST-0104
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      মোবাইল: ০১৭৯৮-২২৩৪৫৬ • ঠিকানা: মিরপুর-১০, ঢাকা
                    </p>
                  </div>

                  <div className="text-left sm:text-right">
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
                      {txt("বর্তমান বকেয়া স্থিতি", "Current Outstanding Due")}
                    </p>
                    <p className="text-2xl font-extrabold text-rose-600 dark:text-rose-400 mt-0.5">৳৪,৩৫০</p>
                  </div>
                </div>

                {/* Recent Ledger Transactions */}
                <div className="mt-4 space-y-2.5">
                  <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    {txt("সাম্প্রতিক লেনদেন ইতিহাস", "Recent Ledger Transactions")}
                  </p>

                  <div className="p-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">
                        {txt("পণ্য ক্রয় (ইনভয়েস #INV-2026-089)", "Store Purchase (Inv #INV-2026-089)")}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">২০ সেপ্টেম্বর ২০২৬ • চাল, ডাল ও তেল (বাকিতে)</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-rose-600 dark:text-rose-400">+৳২,৫৫০</p>
                      <p className="text-[10px] text-slate-400">বকেয়া যোগ</p>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-semibold text-emerald-600 dark:text-emerald-400">
                        {txt("নগদ টাকা জমা পরিশোধ (রসিদ #REC-042)", "Cash Payment Received (Receipt #REC-042)")}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">১৫ সেপ্টেম্বর ২০২৬ • ক্যাশিয়ার কাউন্টারে জমা</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-emerald-600 dark:text-emerald-400">-৳১,৫০০</p>
                      <p className="text-[10px] text-emerald-500">বকেয়া হ্রাস</p>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">
                        {txt("পণ্য ক্রয় (ইনভয়েস #INV-2026-061)", "Store Purchase (Inv #INV-2026-061)")}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">১০ সেপ্টেম্বর ২০২৬ • মুদি মালামাল</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-rose-600 dark:text-rose-400">+৳৩,৩০০</p>
                      <p className="text-[10px] text-slate-400">বকেয়া যোগ</p>
                    </div>
                  </div>
                </div>

                {/* Ledger actions */}
                <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 font-bold">
                      {txt("বকেয়া জমা গ্রহণ করুন", "Receive Payment")}
                    </span>
                    <span className="px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20 font-bold flex items-center gap-1.5">
                      <Printer className="w-3.5 h-3.5" />
                      {txt("স্টেটমেন্ট প্রিন্ট", "Print Statement")}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    {txt("স্বয়ংক্রিয় SMS ও রসিদ সুবিধা", "Instant Receipt Generation")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features Section (id="features") */}
      <section id="features" className="py-16 md:py-24 bg-slate-50 dark:bg-slate-900/30 border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block mb-2">
              {txt("পূর্ণাঙ্গ ফিচারসমূহ", "Comprehensive Features")}
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
              {txt("দোকান পরিচালনার সবকিছু এক সফটওয়্যারে", "Everything You Need to Run Your Retail Store")}
            </h2>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {txt(
                "কাগজে-কলমে হিসাব বা জটিল এক্সেল শিটের দিন শেষ। ব্যবসার গতি ও লাভ বৃদ্ধি করতে ব্যবহার করুন আধুনিক ক্লাউড পিওএস।",
                "Move past manual register notebooks and confusing spreadsheets. Accelerate sales, avoid stockouts, and safeguard profits."
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1: POS */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-slate-700 transition-all shadow-sm">
              <div className="w-11 h-11 rounded-xl bg-indigo-50 dark:bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
                <ShoppingCart className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                {txt("১. দ্রুততম পিওএস ক্যাশিয়ার বিলিং", "1. Fast Cloud POS Billing")}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                {txt(
                  "বারকোড স্ক্যানার দিয়ে পলকের মধ্যে পণ্য কার্টে যোগ করুন। নগদ, বিকাশ, নগদ বা বাকিতে ড্রাফট সেল সম্পন্ন করুন।",
                  "Scan barcodes in milliseconds, hold customer carts during rushes, and tender payments via cash, bKash, or store credit."
                )}
              </p>
              <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300 font-medium">
                <li className="flex items-center gap-2">✓ {txt("বারকোড স্ক্যানিং ও কিবোর্ড শর্টকাট", "Barcode search & quick hotkeys")}</li>
                <li className="flex items-center gap-2">✓ {txt("কার্ট হোল্ড ও ড্রাফট বিল সুবিধা", "Hold active cart & draft sale")}</li>
                <li className="flex items-center gap-2">✓ {txt("ডিসকাউন্ট ও ভ্যাট ক্যালকুলেশন", "Item discounts & tax calculation")}</li>
              </ul>
            </div>

            {/* Feature 2: Customer Ledger */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-rose-300 dark:hover:border-slate-700 transition-all shadow-sm">
              <div className="w-11 h-11 rounded-xl bg-rose-50 dark:bg-rose-600/10 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-4">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                {txt("২. কাস্টমার লেজার ও বাকি খাতা", "2. Customer Ledgers & Due Khata")}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                {txt(
                  "কোন কাস্টমারের কাছে কত টাকা বাকি আছে এক ক্লিকে দেখুন। আংশিক জমা গ্রহণ করুন এবং স্টেটমেন্ট প্রিন্ট দিন।",
                  "Instantly view pending customer receivables, log partial cash repayments, and generate PDF ledger reports."
                )}
              </p>
              <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300 font-medium">
                <li className="flex items-center gap-2">✓ {txt("কাস্টমারভিত্তিক পৃথক লেজার খাতা", "Individual customer ledger profile")}</li>
                <li className="flex items-center gap-2">✓ {txt("আংশিক বকেয়া জমা ও রসিদ", "Partial payment receipts & tracking")}</li>
                <li className="flex items-center gap-2">✓ {txt("সম্পূর্ণ লেনদেন স্টেটমেন্ট প্রিন্ট", "Download complete balance sheet")}</li>
              </ul>
            </div>

            {/* Feature 3: Inventory */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-slate-700 transition-all shadow-sm">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
                <Package className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                {txt("৩. ইনভেন্টরি ও লো-স্টক সতর্কতা", "3. Inventory & Low-Stock Alerts")}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                {txt(
                  "পণ্যের ক্রয়মূল্য ও বিক্রয়মূল্য নির্ধারণ করুন। স্টক শেষ হওয়ার আগেই সতর্কবার্তা পান যাতে সেল কখনো বন্ধ না হয়।",
                  "Track wholesale cost vs retail sell price. Get automatic low-stock notifications before inventory runs out."
                )}
              </p>
              <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300 font-medium">
                <li className="flex items-center gap-2">✓ {txt("স্বয়ংক্রিয় লো-স্টক নোটিফিকেশন", "Automated reorder notifications")}</li>
                <li className="flex items-center gap-2">✓ {txt("ক্যাটাগরি ও ব্র্যান্ডভিত্তিক ফিল্টারিং", "Brand & category organization")}</li>
                <li className="flex items-center gap-2">✓ {txt("এক্সেল ও CSV দিয়ে বাল্ক পণ্য যোগ", "Bulk import products from Excel")}</li>
              </ul>
            </div>

            {/* Feature 4: Thermal Printing */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-purple-300 dark:hover:border-slate-700 transition-all shadow-sm">
              <div className="w-11 h-11 rounded-xl bg-purple-50 dark:bg-purple-600/10 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-4">
                <Printer className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                {txt("৪. থার্মাল ও A4 রসিদ প্রিন্টিং", "4. Thermal & A4 Receipt Print")}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                {txt(
                  "বাজারে প্রচলিত যেকোনো ৫৮ মিমি বা ৮০ মিমি USB বা Bluetooth থার্মাল পিওএস প্রিন্টারে সাথে সাথে মেমো বের করুন।",
                  "Direct plug-and-play support for standard 58mm & 80mm USB / Bluetooth POS thermal printers and standard A4 memos."
                )}
              </p>
              <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300 font-medium">
                <li className="flex items-center gap-2">✓ {txt("৫৮মিমি ও ৮০মিমি রসিদ প্রিন্টার সাপোর্ট", "58mm and 80mm roll printer support")}</li>
                <li className="flex items-center gap-2">✓ {txt("দোকানের নিজস্ব নাম, লোগো ও শর্তাবলী", "Custom store logo, contact & terms")}</li>
                <li className="flex items-center gap-2">✓ {txt("পাইকারদের জন্য পূর্ণাঙ্গ A4 ইনভয়েস", "Full A4 invoice format for wholesale")}</li>
              </ul>
            </div>

            {/* Feature 5: Expenses & Profit */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-300 dark:hover:border-slate-700 transition-all shadow-sm">
              <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-600/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">
                <Wallet className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                {txt("৫. দোকান খরচ ও প্রকৃত নিট লাভ", "5. Expenses & Net Profit Tracking")}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                {txt(
                  "দোকান ভাড়া, বিদ্যুৎ বিল ও কর্মচারীর বেতন এন্ট্রি রাখুন। মোট বিক্রয় থেকে খরচ বাদ দিয়ে প্রকৃত প্রফিট জানুন।",
                  "Log store rent, utility bills, and staff wages. Subtract expenditures from gross sales to see your real net daily profit."
                )}
              </p>
              <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300 font-medium">
                <li className="flex items-center gap-2">✓ {txt("ক্যাটাগরি অনুযায়ী দোকান খরচ এন্ট্রি", "Categorized daily expense logging")}</li>
                <li className="flex items-center gap-2">✓ {txt("প্রতিদিনের মোট বিক্রয় ও নিট মার্জিন", "Daily revenue & gross/net profit")}</li>
                <li className="flex items-center gap-2">✓ {txt("মাসিক আর্থিক সারসংক্ষেপ রিপোর্ট", "Monthly financial balance report")}</li>
              </ul>
            </div>

            {/* Feature 6: Android App & Cloud */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-slate-700 transition-all shadow-sm">
              <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4">
                <Store className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                {txt("৬. অ্যান্ড্রয়েড মোবাইল অ্যাপ ও ক্লাউড সিঙ্ক", "6. Android App & Live Cloud Sync")}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                {txt(
                  "দোকানে কম্পিউটার না থাকলেও সমস্যা নেই। মোবাইল ফোনে গুগল প্লে-স্টোর অ্যাপ দিয়ে পুরো দোকান পরিচালনা করুন।",
                  "No computer needed at the store. Run your entire shop directly from your Android smartphone with instant cloud synchronization."
                )}
              </p>
              <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300 font-medium">
                <li className="flex items-center gap-2">✓ {txt("প্লে-স্টোর সার্টিফাইড অ্যান্ড্রয়েড অ্যাপ", "Certified Google Play Store app")}</li>
                <li className="flex items-center gap-2">✓ {txt("মোবাইলের ক্যামেরা দিয়ে বারকোড স্ক্যান", "Scan barcodes with phone camera")}</li>
                <li className="flex items-center gap-2">✓ {txt("যেকোনো জায়গা থেকে লাইভ বিক্রয় মনিটর", "Monitor shop sales from anywhere")}</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works (৩টি সহজ ধাপ) */}
      <section className="py-16 md:py-20 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block mb-2">
            {txt("শুরু করা অত্যন্ত সহজ", "Quick Setup")}
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mb-10">
            {txt("মাত্র ৩টি ধাপে আপনার দোকান ডিজিটাল করুন", "Digitalize Your Store in 3 Easy Steps")}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="w-9 h-9 rounded-xl bg-indigo-600 text-white keep-white font-bold text-sm flex items-center justify-center mb-4">
                ১
              </span>
              <h4 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                {txt("ফ্রি অ্যাকাউন্ট খুলুন", "1. Create Free Account")}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {txt(
                  "আপনার দোকানের নাম, মোবাইল নম্বর ও পাসওয়ার্ড দিয়ে ৩০ সেকেন্ডে সম্পূর্ণ বিনামূল্যে অ্যাকাউন্ট তৈরি করুন।",
                  "Sign up in 30 seconds with your store name, mobile number, and password. No credit card required."
                )}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="w-9 h-9 rounded-xl bg-indigo-600 text-white keep-white font-bold text-sm flex items-center justify-center mb-4">
                ২
              </span>
              <h4 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                {txt("পণ্য ও স্টক যোগ করুন", "2. Add Products & Stock")}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {txt(
                  "বারকোড ও ক্রয়-বিক্রয় মূল্যের তথ্য দিন, অথবা আমাদের দেওয়া এক্সেল শিট ফরম্যাটে এক ক্লিকে সব পণ্য আপলোড করুন।",
                  "Enter products with barcode and pricing, or upload your full catalog using Excel/CSV bulk import."
                )}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="w-9 h-9 rounded-xl bg-emerald-600 text-white keep-white font-bold text-sm flex items-center justify-center mb-4">
                ৩
              </span>
              <h4 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                {txt("পিওএস বিলিং ও প্রিন্ট শুরু করুন", "3. Start Selling & Printing")}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {txt(
                  "ক্যাশ বা বাকিতে মেমো কাটুন, সাথে সাথে থার্মাল রসিদ প্রিন্ট দিন এবং লাইভ বাকি খাতা ও নিট প্রফিট উপভোগ করুন।",
                  "Ring up sales on computer or phone, print instant thermal slips, and watch your daily profits update automatically."
                )}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Target Industries (কারা ব্যবহার করবেন) */}
      <section className="py-16 md:py-20 bg-slate-50 dark:bg-slate-900/40 border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block mb-2">
            {txt("ব্যবসার উপযোগী", "Industry Tailored")}
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mb-8">
            {txt("কোন কোন দোকানের জন্য Inventarioya আদর্শ?", "Ideal For Retail & Wholesale in Bangladesh")}
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center shadow-sm">
              <p className="font-bold text-sm text-slate-900 dark:text-white">{txt("মুদি ও সুপারশপ", "Grocery & Supermarket")}</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">{txt("দ্রুত বারকোড বিলিং", "Fast barcode checkout")}</p>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center shadow-sm">
              <p className="font-bold text-sm text-slate-900 dark:text-white">{txt("ফার্মেসি ও ড্রাগস", "Pharmacy & Medicine")}</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">{txt("ব্যাচ ও স্টক হিসাব", "Batch & stock tracking")}</p>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center shadow-sm">
              <p className="font-bold text-sm text-slate-900 dark:text-white">{txt("পোশাক ও ফ্যাশন", "Clothing & Boutique")}</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">{txt("সাইজ ও ক্যাটাগরি", "Size & category variants")}</p>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center shadow-sm">
              <p className="font-bold text-sm text-slate-900 dark:text-white">{txt("মোবাইল ও গ্যাজেট", "Mobile & Electronics")}</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">{txt("ওয়ারেন্টি ও মেমো", "Warranty & IMEI records")}</p>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center shadow-sm">
              <p className="font-bold text-sm text-slate-900 dark:text-white">{txt("হার্ডওয়্যার শপ", "Hardware & Sanitary")}</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">{txt("বাকি খাতা ও লেজার", "Heavy credit & ledgers")}</p>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center shadow-sm">
              <p className="font-bold text-sm text-slate-900 dark:text-white">{txt("পাইকারি আড়ত", "Wholesale & Trading")}</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">{txt("বাল্ক সেলস ও A4 মেমো", "Bulk sales & A4 memos")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Google Play Store Banner */}
      <section className="py-14 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-6 sm:p-10 rounded-2xl bg-slate-900 text-white keep-dark border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
            <div className="space-y-2 text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold">
                <Smartphone className="w-3.5 h-3.5" />
                <span>Google Play Store Certified App</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white keep-white">
                {txt("মোবাইল ফোনে ব্যবহার করুন Inventarioya অ্যান্ড্রয়েড অ্যাপ", "Download the Official Inventarioya Android App")}
              </h3>
              <p className="text-xs text-slate-300 max-w-lg leading-relaxed">
                {txt(
                  "গুগল প্লে-স্টোর থেকে সরাসরি অ্যাপ ডাউনলোড করে নিন। ফোনের ক্যামেরা দিয়ে বারকোড স্ক্যান ও যেকোনো স্থান থেকে দোকানের বিক্রয় দেখুন।",
                  "Download directly from Google Play. Scan barcodes with your phone camera, issue cash memos, and monitor store health anywhere."
                )}
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <a
                href="https://play.google.com/store/apps/details?id=com.earbaj.inventarioya&pcampaignid=web_share"
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3 rounded-xl bg-black hover:bg-slate-900 border border-slate-700 text-white keep-white flex items-center gap-3 transition-colors shadow-md"
              >
                <Smartphone className="w-6 h-6 text-emerald-400" />
                <div className="text-left">
                  <p className="text-[9px] text-slate-400 uppercase tracking-wider leading-none">Get it on</p>
                  <p className="text-sm font-bold text-white keep-white leading-tight">Google Play</p>
                </div>
              </a>
              <Link
                href="/dashboard/pos"
                className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white keep-white font-bold text-sm transition-colors shadow-md"
              >
                {txt("ওয়েব পিওএস চালান", "Open Web POS")}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions (FAQ) */}
      <section className="py-16 md:py-20 bg-slate-50 dark:bg-slate-900/30 border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block mb-2">
              {txt("সাধারণ জিজ্ঞাসা", "Frequently Asked Questions")}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {txt("সচরাচর জিজ্ঞাসিত প্রশ্ন ও উত্তর (FAQ)", "Common Questions Answered")}
            </h2>
          </div>

          <div className="space-y-4 text-left">
            <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                {txt(
                  "Inventarioya ব্যবহার করতে কি কোনো বিশেষ দামি কম্পিউটারের প্রয়োজন আছে?",
                  "Do I need specialized hardware to run Inventarioya?"
                )}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed pl-6">
                {txt(
                  "না, কোনো বিশেষ কম্পিউটার লাগবে না। আপনার দোকানে থাকা যেকোনো সাধারণ কম্পিউটার, ল্যাপটপ অথবা মোবাইল ফোনে ইন্টারনেট ব্রাউজার অথবা আমাদের অ্যান্ড্রয়েড অ্যাপ দিয়ে খুব সহজেই ব্যবহার করতে পারবেন।",
                  "No, any standard laptop, desktop computer, tablet, or Android smartphone can run Inventarioya smoothly via modern browsers or our Google Play Store app."
                )}
              </p>
            </div>

            <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                {txt(
                  "দোকানের থার্মাল প্রিন্টারে কি মেমো প্রিন্ট হবে?",
                  "Can I print receipts on standard 58mm/80mm thermal POS printers?"
                )}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed pl-6">
                {txt(
                  "হ্যাঁ, বাজারে প্রচলিত যেকোনো স্ট্যান্ডার্ড ৫৮ মিমি (58mm) অথবা ৮০ মিমি (80mm) USB বা Bluetooth থার্মাল পিওএস প্রিন্টারে স্বয়ংক্রিয়ভাবে রসিদ প্রিন্ট করা যায়। এছাড়া সাধারণ প্রিন্টারের জন্য A4 সাইজেও মেমো প্রিন্ট করা যায়।",
                  "Yes, Inventarioya natively supports all standard 58mm and 80mm USB or Bluetooth thermal POS receipt printers, as well as full-page A4 invoices."
                )}
              </p>
            </div>

            <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                {txt(
                  "কাস্টমার বাকি খাতা কিভাবে কাজ করে?",
                  "How does the customer ledger & credit balance tracking work?"
                )}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed pl-6">
                {txt(
                  "পিওএস-এ বিক্রয়ের সময় কাস্টমার সিলেক্ট করে বাকিতে সেল করতে পারবেন। পরবর্তীতে কাস্টমারের নামে ক্লিক করলে তার মোট বকেয়া, অতীতের ক্রয় ইতিহাস ও আংশিক জমা (Payment) এন্ট্রি করা যায় এবং তাকে ফুল স্টেটমেন্ট প্রিন্ট দেওয়া যায়।",
                  "Select any customer profile during POS checkout to sell on credit. The system updates their balance, tracks partial repayments, and lets you generate printable statements in 1 click."
                )}
              </p>
            </div>

            <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                {txt(
                  "আমার দোকানের ডাটা কি নিরাপদ থাকবে?",
                  "Is my store and customer financial data secure?"
                )}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed pl-6">
                {txt(
                  "সম্পূর্ণ নিরাপদ। আপনার ডাটা এনক্রিপ্ট করে স্বয়ংক্রিয় ক্লাউড ব্যাকআপে রাখা হয়। ফলে আপনার কম্পিউটার বা মোবাইল হারিয়ে বা নষ্ট হয়ে গেলেও নতুন ডিভাইসে লগইন করলেই সব ডাটা মুহূর্তেই ফিরে পাবেন।",
                  "Completely secure. All store records are backed up automatically in encrypted cloud servers. Even if you switch computers or lose your phone, your data is restored instantly upon signing in."
                )}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to action (CTA) */}
      <section className="py-16 md:py-24 bg-white dark:bg-slate-950 transition-colors">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mb-4">
            {txt("আজই আপনার দোকানের হিসাব ডিজিটাল করুন", "Ready to Modernize Your Retail Store?")}
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto mb-8 leading-relaxed font-normal">
            {txt(
              "কোনো ধরনের ঝামেলা ছাড়া আজই ফ্রি ট্রায়ালে শুরু করুন Inventarioya ক্লাউড পিওএস। আপনার ব্যবসাকে করুন দ্রুত ও নির্ভুল।",
              "Start your free trial today. Empower cashiers, delight shoppers, and get crystal-clear insights into your real retail profits."
            )}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Link
              href="/register"
              className="w-full sm:w-auto px-8 py-3.5 text-sm font-bold text-white keep-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
            >
              <span>{txt("ফ্রি একাউন্ট খুলুন", "Start Free Trial")}</span>
              <ArrowRight className="w-4 h-4 text-white keep-white" />
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-3.5 text-sm font-bold text-slate-800 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-white bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-800 rounded-xl transition-all shadow-sm"
            >
              {txt("দোকান একাউন্টে লগইন করুন", "Sign In to Store")}
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
