"use client";

import Link from "next/link";
import { LandingNavbar } from "@/components/layout/LandingNavbar";
import { Footer } from "@/components/layout/Footer";
import {
  Boxes,
  ShoppingCart,
  Receipt,
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
  FileSpreadsheet,
  HelpCircle,
  Clock,
  Sparkles,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function LandingPage() {
  const { locale, t } = useLanguage();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-indigo-600 selection:text-white transition-colors">
      <LandingNavbar />

      {/* Hero Section */}
      <section className="relative pt-28 pb-16 md:pt-36 md:pb-24 border-b border-slate-200 dark:border-slate-800/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          {/* Announcement pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-indigo-700 dark:text-indigo-400 text-xs font-semibold mb-6 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{t("landing.badge")}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-4xl mx-auto leading-tight sm:leading-tight">
            {t("landing.heroTitle")}{" "}
            <span className="text-indigo-600 dark:text-indigo-400">{t("landing.heroTitleHighlight")}</span>
          </h1>

          <p className="mt-5 text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal">
            {t("landing.heroSubtitle")}
          </p>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Link
              href="/register"
              className="w-full sm:w-auto px-8 py-3.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
            >
              {t("landing.startFree")}
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/dashboard/pos"
              className="w-full sm:w-auto px-8 py-3.5 text-sm font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <ShoppingCart className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              {t("landing.testPos")}
            </Link>
          </div>

          {/* Trust points */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-slate-600 dark:text-slate-400 font-medium">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> {t("landing.trustSetup")}
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> {t("landing.trustDevices")}
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> {t("landing.trustThermal")}
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> {t("landing.trustCloud")}
            </span>
          </div>

          {/* Product Snapshot Card */}
          <div className="mt-12 max-w-4xl mx-auto rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl dark:shadow-2xl p-4 sm:p-6 text-left">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 mb-4 border-b border-slate-200 dark:border-slate-800 gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <p className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    {t("landing.snapshotTitle")}
                  </p>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{t("landing.snapshotSubtitle")}</p>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-600/20 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30 font-medium">
                  POS & Ledger Active
                </span>
              </div>
            </div>

            {/* Metric widgets */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{t("landing.todaySalesLabel")}</p>
                <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">৳২৪,৫৫০</p>
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">
                  {locale === "bn" ? "↑ ১৮টি ইনভয়েস সফল" : "↑ 18 Invoices cleared"}
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{t("landing.cashCollectionLabel")}</p>
                <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">৳১৮,৩৫০</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {locale === "bn" ? "ক্যাশ: ৳১২,২০০ • বিকাশ: ৳৬,১৫০" : "Cash: ৳12,200 • bKash: ৳6,150"}
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{t("landing.totalDueLabel")}</p>
                <p className="text-xl font-bold text-rose-600 dark:text-rose-400 mt-1">৳৬,২০০</p>
                <p className="text-[10px] text-rose-600 dark:text-rose-300 mt-0.5">
                  {locale === "bn" ? "৪ জন কাস্টমারের বকেয়া" : "4 Pending customer dues"}
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{t("landing.lowStockLabel")}</p>
                <p className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-1">
                  {locale === "bn" ? "৩টি পণ্য" : "3 Items"}
                </p>
                <p className="text-[10px] text-amber-600 dark:text-amber-300 mt-0.5">
                  {locale === "bn" ? "পুনরায় অর্ডার করা প্রয়োজন" : "Reorder stock warning"}
                </p>
              </div>
            </div>

            {/* Quick POS simulation banner */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <Printer className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {locale === "bn" ? "থার্মাল প্রিন্ট ও এসএমএস সুবিধা" : "Thermal Receipts & Invoicing"}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {locale === "bn"
                      ? "কাস্টমারকে তাৎক্ষণিক ক্যাশ মেমো বা বকেয়া স্টেটমেন্ট প্রিন্ট করে দিন"
                      : "Print instant 56mm/80mm receipts and customer balance statements"}
                  </p>
                </div>
              </div>
              <Link
                href="/dashboard/pos"
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-semibold inline-flex items-center gap-1 shrink-0"
              >
                {locale === "bn" ? "পিওএস ট্রাই করুন" : "Try POS"} <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features Section */}
      <section id="features" className="py-16 md:py-24 bg-white dark:bg-slate-950 transition-colors">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block mb-2">
              {t("landing.featuresTitle")}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {t("landing.featuresSubtitle")}
            </h2>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {t("landing.featuresDescription")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1: POS */}
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-slate-700 transition-all shadow-sm">
              <div className="w-11 h-11 rounded-xl bg-indigo-100 dark:bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
                <ShoppingCart className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                {t("landing.f1Title")}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                {t("landing.f1Desc")}
              </p>
              <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                <li className="flex items-center gap-2">✓ {locale === "bn" ? "বারকোড স্ক্যানিং ও সার্চ" : "Barcode search & scan"}</li>
                <li className="flex items-center gap-2">✓ {locale === "bn" ? "ড্রাফট ও কার্ট হোল্ড সুবিধা" : "Hold cart & draft sales"}</li>
                <li className="flex items-center gap-2">✓ {locale === "bn" ? "মাল্টিপল পেমেন্ট মেথড" : "Multi-tender payments"}</li>
              </ul>
            </div>

            {/* Feature 2: Customer Ledger */}
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-rose-300 dark:hover:border-slate-700 transition-all shadow-sm">
              <div className="w-11 h-11 rounded-xl bg-rose-100 dark:bg-rose-600/10 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-4">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                {t("landing.f2Title")}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                {t("landing.f2Desc")}
              </p>
              <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                <li className="flex items-center gap-2">✓ {locale === "bn" ? "প্রতিটি কাস্টমারের আলাদা লেজার" : "Individual customer ledgers"}</li>
                <li className="flex items-center gap-2">✓ {locale === "bn" ? "বকেয়া পরিশোধের রসিদ" : "Payment receipts & partial dues"}</li>
                <li className="flex items-center gap-2">✓ {locale === "bn" ? "ফুল হিস্ট্রি ও স্টেটমেন্ট ডাউনলোড" : "PDF statement downloads"}</li>
              </ul>
            </div>

            {/* Feature 3: Inventory */}
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-slate-700 transition-all shadow-sm">
              <div className="w-11 h-11 rounded-xl bg-emerald-100 dark:bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
                <Package className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                {t("landing.f3Title")}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                {t("landing.f3Desc")}
              </p>
              <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                <li className="flex items-center gap-2">✓ {locale === "bn" ? "অটোমেটিক লো-স্টক সতর্কতা" : "Automated low-stock alerts"}</li>
                <li className="flex items-center gap-2">✓ {locale === "bn" ? "ক্যাটাগরি ও ব্র্যান্ড ট্র্যাকিং" : "Category & brand tracking"}</li>
                <li className="flex items-center gap-2">✓ {locale === "bn" ? "এক্সেল/CSV ফাইল আপলোড" : "CSV & Excel catalog upload"}</li>
              </ul>
            </div>

            {/* Feature 4: Thermal Printing */}
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-purple-300 dark:hover:border-slate-700 transition-all shadow-sm">
              <div className="w-11 h-11 rounded-xl bg-purple-100 dark:bg-purple-600/10 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-4">
                <Printer className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                {t("landing.f4Title")}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                {t("landing.f4Desc")}
              </p>
              <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                <li className="flex items-center gap-2">✓ {locale === "bn" ? "৫৮মিমি ও ৮০মিমি সাপোর্ট" : "56mm & 80mm thermal support"}</li>
                <li className="flex items-center gap-2">✓ {locale === "bn" ? "দোকানের কাস্টম লোগো ও হেডার" : "Custom shop logo & header"}</li>
                <li className="flex items-center gap-2">✓ {locale === "bn" ? "A4 প্রফেশনাল মেমো প্রিন্ট" : "Full-size A4 invoice print"}</li>
              </ul>
            </div>

            {/* Feature 5: Expenses & Profit */}
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-300 dark:hover:border-slate-700 transition-all shadow-sm">
              <div className="w-11 h-11 rounded-xl bg-amber-100 dark:bg-amber-600/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">
                <Wallet className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                {t("landing.f5Title")}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                {t("landing.f5Desc")}
              </p>
              <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                <li className="flex items-center gap-2">✓ {locale === "bn" ? "ক্যাটাগরি অনুযায়ী দোকান খরচ" : "Expense categorized logging"}</li>
                <li className="flex items-center gap-2">✓ {locale === "bn" ? "দৈনিক নিট প্রফিট ও মার্জিন" : "Daily net profit & margin"}</li>
                <li className="flex items-center gap-2">✓ {locale === "bn" ? "আর্থিক সারসংক্ষেপ রিপোর্ট" : "Financial summary reports"}</li>
              </ul>
            </div>

            {/* Feature 6: Mobile & Branches */}
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-slate-700 transition-all shadow-sm">
              <div className="w-11 h-11 rounded-xl bg-blue-100 dark:bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4">
                <Store className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                {t("landing.f6Title")}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                {t("landing.f6Desc")}
              </p>
              <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                <li className="flex items-center gap-2">✓ {locale === "bn" ? "অ্যান্ড্রয়েড মোবাইল অ্যাপ" : "Official Android Mobile App"}</li>
                <li className="flex items-center gap-2">✓ {locale === "bn" ? "মাল্টি-ব্রাঞ্চ স্টক কন্ট্রোল" : "Multi-branch stock sync"}</li>
                <li className="flex items-center gap-2">✓ {locale === "bn" ? "রিয়েল-টাইম ক্লাউড সিঙ্কিং" : "Instant real-time sync"}</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works (৩টি সহজ ধাপ) */}
      <section className="py-16 md:py-20 bg-slate-100/60 dark:bg-slate-900/40 border-t border-slate-200 dark:border-slate-800/80 transition-colors">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block mb-2">
            {t("landing.howItWorksTitle")}
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mb-12">
            {t("landing.howItWorksSub")}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-bold text-sm flex items-center justify-center mb-4">
                1
              </span>
              <h4 className="text-base font-bold text-slate-900 dark:text-white mb-1.5">{t("landing.step1Title")}</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {t("landing.step1Desc")}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-bold text-sm flex items-center justify-center mb-4">
                2
              </span>
              <h4 className="text-base font-bold text-slate-900 dark:text-white mb-1.5">{t("landing.step2Title")}</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {t("landing.step2Desc")}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="w-8 h-8 rounded-lg bg-emerald-600 text-white font-bold text-sm flex items-center justify-center mb-4">
                3
              </span>
              <h4 className="text-base font-bold text-slate-900 dark:text-white mb-1.5">{t("landing.step3Title")}</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {t("landing.step3Desc")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Target Industries (কারা ব্যবহার করবেন) */}
      <section className="py-16 md:py-20 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800/80 transition-colors">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block mb-2">
            {t("landing.targetTitle")}
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mb-8">
            {t("landing.targetSub")}
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center shadow-sm">
              <p className="font-bold text-sm text-slate-900 dark:text-white">{t("landing.grocery")}</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">{t("landing.grocerySub")}</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center shadow-sm">
              <p className="font-bold text-sm text-slate-900 dark:text-white">{t("landing.clothing")}</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">{t("landing.clothingSub")}</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center shadow-sm">
              <p className="font-bold text-sm text-slate-900 dark:text-white">{t("landing.gadgets")}</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">{t("landing.gadgetsSub")}</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center shadow-sm">
              <p className="font-bold text-sm text-slate-900 dark:text-white">{t("landing.pharmacy")}</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">{t("landing.pharmacySub")}</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center shadow-sm">
              <p className="font-bold text-sm text-slate-900 dark:text-white">{t("landing.hardware")}</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">{t("landing.hardwareSub")}</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center shadow-sm">
              <p className="font-bold text-sm text-slate-900 dark:text-white">{t("landing.wholesale")}</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">{t("landing.wholesaleSub")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Google Play Store Banner */}
      <section className="py-14 bg-slate-100/60 dark:bg-slate-900/60 border-t border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-6 sm:p-10 rounded-2xl bg-white dark:bg-gradient-to-r dark:from-slate-900 dark:to-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
            <div className="space-y-2 text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
                <Smartphone className="w-3.5 h-3.5" />
                <span>Google Play Store Certified App</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                {t("landing.mobileAppTitle")}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 max-w-lg leading-relaxed">
                {t("landing.mobileAppDesc")}
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <a
                href="https://play.google.com/store/apps/details?id=com.earbaj.inventarioya&pcampaignid=web_share"
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white flex items-center gap-3 transition-colors shadow-md"
              >
                <Smartphone className="w-5 h-5 text-emerald-400" />
                <div className="text-left">
                  <p className="text-[9px] text-slate-400 uppercase tracking-wider leading-none">Get it on</p>
                  <p className="text-sm font-bold text-white leading-tight">Google Play</p>
                </div>
              </a>
              <Link
                href="/dashboard/pos"
                className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-colors shadow-md"
              >
                {t("landing.useWebPos")}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions (FAQ) */}
      <section className="py-16 md:py-20 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800/80 transition-colors">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block mb-2">
              {t("landing.faqTitle")}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {t("landing.faqSub")}
            </h2>
          </div>

          <div className="space-y-4 text-left">
            <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                {locale === "bn"
                  ? "Inventarioya ব্যবহার করতে কি কোনো বিশেষ কম্পিউটারের প্রয়োজন আছে?"
                  : "Do I need any specialized hardware or computers to run Inventarioya?"}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed pl-6">
                {locale === "bn"
                  ? "না, কোনো বিশেষ কম্পিউটার লাগবে না। আপনার দোকানে থাকা যেকোনো সাধারণ কম্পিউটার, ল্যাপটপ অথবা মোবাইল ফোনে ইন্টারনেট ব্রাউজার অথবা আমাদের অ্যান্ড্রয়েড অ্যাপ দিয়ে খুব সহজেই ব্যবহার করতে পারবেন।"
                  : "No, any standard laptop, desktop computer, tablet, or Android smartphone can run Inventarioya smoothly via modern browsers or our Google Play Store app."}
              </p>
            </div>

            <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                {locale === "bn"
                  ? "দোকানের থার্মাল প্রিন্টারে কি মেমো প্রিন্ট হবে?"
                  : "Can I print receipts on standard 56mm/80mm thermal POS printers?"}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed pl-6">
                {locale === "bn"
                  ? "হ্যাঁ, বাজারে প্রচলিত যেকোনো স্ট্যান্ডার্ড ৫৮ মিমি (58mm) অথবা ৮০ মিমি (80mm) USB বা Bluetooth থার্মাল পিওএস প্রিন্টারে স্বয়ংক্রিয়ভাবে রসিদ প্রিন্ট করা যায়। এছাড়া সাধারণ প্রিন্টারের জন্য A4 সাইজেও মেমো প্রিন্ট করা যায়।"
                  : "Yes, Inventarioya natively supports all standard 56mm and 80mm USB or Bluetooth thermal POS receipt printers, as well as full-page A4 invoices."}
              </p>
            </div>

            <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                {locale === "bn"
                  ? "কাস্টমার বাকি খাতা কিভাবে কাজ করে?"
                  : "How does the customer ledger & credit balance tracking work?"}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed pl-6">
                {locale === "bn"
                  ? "পিওএস-এ বিক্রয়ের সময় কাস্টমার সিলেক্ট করে বাকিতে সেল করতে পারবেন। পরবর্তীতে কাস্টমারের নামে ক্লিক করলে তার মোট বকেয়া, অতীতের ক্রয় ইতিহাস ও আংশিক জমা (Payment) এন্ট্রি করা যায় এবং তাকে ফুল স্টেটমেন্ট প্রিন্ট দেওয়া যায়।"
                  : "Select any customer profile during POS checkout to sell on credit. The system updates their balance, tracks partial repayments, and lets you generate printable statements in 1 click."}
              </p>
            </div>

            <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                {locale === "bn"
                  ? "আমার দোকানের ডাটা কি নিরাপদ থাকবে?"
                  : "Is my store and customer financial data secure?"}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed pl-6">
                {locale === "bn"
                  ? "সম্পূর্ণ নিরাপদ। আপনার ডাটা এনক্রিপ্ট করে স্বয়ংক্রিয় ক্লাউড ব্যাকআপে রাখা হয়। ফলে আপনার কম্পিউটার বা মোবাইল হারিয়ে বা নষ্ট হয়ে গেলেও নতুন ডিভাইসে লগইন করলেই সব ডাটা মুহূর্তেই ফিরে পাবেন।"
                  : "Completely secure. All store records are backed up automatically in encrypted cloud servers. Even if you switch computers or lose your phone, your data is restored instantly upon signing in."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to action (CTA) */}
      <section className="py-16 md:py-20 bg-slate-100/80 dark:bg-slate-900/60 border-t border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mb-4">
            {t("landing.ctaTitle")}
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto mb-8 leading-relaxed font-normal">
            {t("landing.ctaSub")}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Link
              href="/register"
              className="w-full sm:w-auto px-8 py-3.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
            >
              {t("landing.registerShop")}
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-3.5 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl transition-all shadow-sm"
            >
              {t("landing.loginShop")}
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
