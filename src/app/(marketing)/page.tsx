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

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-600 selection:text-white">
      <LandingNavbar />

      {/* Hero Section */}
      <section className="relative pt-28 pb-16 md:pt-36 md:pb-24 border-b border-slate-800/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          {/* Announcement pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-6">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Google Play Store-এ এভেইলেবল • Android App & Web Sync</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight sm:leading-tight">
            দোকানের দ্রুত বিক্রয়, ইনভেন্টরি ও বাকি খাতা —{" "}
            <span className="text-indigo-400">সম্পূর্ণ নির্ভুল ও সহজ</span>
          </h1>

          <p className="mt-5 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            খুচরা দোকান ও সুপারশপের জন্য একটি কমপ্লিট ক্লাউড পিওএস (POS) সফটওয়্যার। বারকোড স্ক্যানিং, ৫৬/৮০ মিমি থার্মাল রসিদ প্রিন্ট, কাস্টমার বকেয়া খাতা এবং দৈনিক লাভ-ক্ষতির পূর্ণাঙ্গ হিসাব রাখুন যেকোনো কম্পিউটার বা স্মার্টফোনে।
          </p>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Link
              href="/register"
              className="w-full sm:w-auto px-8 py-3.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
            >
              বিনামূল্যে শুরু করুন (Start Free)
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/dashboard/pos"
              className="w-full sm:w-auto px-8 py-3.5 text-sm font-semibold text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <ShoppingCart className="w-4 h-4 text-emerald-400" />
              লাইভ পিওএস ডেমো দেখুন
            </Link>
          </div>

          {/* Trust points */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> কোনো সেটআপ ফি নেই
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> মোবাইল ও কম্পিউটার উভয় ডিভাইসে চলে
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> থার্মাল প্রিন্টারে সাথে সাথে রসিদ
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> ১০০% নিরাপদ ক্লাউড ব্যাকআপ
            </span>
          </div>

          {/* Product Snapshot Card */}
          <div className="mt-12 max-w-4xl mx-auto rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-4 sm:p-6 text-left">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 mb-4 border-b border-slate-800 gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  <p className="text-xs font-bold text-white uppercase tracking-wider">
                    লাইভ ড্যাশবোর্ড ওভারভিউ
                  </p>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">রিয়েল-টাইম সেলস ও বাকি খাতার বর্তমান স্থিতি</p>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="px-2.5 py-1 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 font-medium">
                  POS & Ledger Active
                </span>
              </div>
            </div>

            {/* Metric widgets */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <p className="text-[11px] text-slate-400">আজকের মোট বিক্রয়</p>
                <p className="text-xl font-bold text-white mt-1">৳২৪,৫৫০</p>
                <p className="text-[10px] text-emerald-400 mt-0.5">↑ ১৮টি ইনভয়েস সফল</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <p className="text-[11px] text-slate-400">নগদ ও বিকাশ কালেকশন</p>
                <p className="text-xl font-bold text-emerald-400 mt-1">৳১৮,৩৫০</p>
                <p className="text-[10px] text-slate-400 mt-0.5">ক্যাশ: ৳১২,২০০ • বিকাশ: ৳৬,১৫০</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <p className="text-[11px] text-slate-400">সর্বমোট বাকি (Due)</p>
                <p className="text-xl font-bold text-rose-400 mt-1">৳৬,২০০</p>
                <p className="text-[10px] text-rose-300 mt-0.5">৪ জন কাস্টমারের বকেয়া</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <p className="text-[11px] text-slate-400">লো-স্টক অ্যালার্ট</p>
                <p className="text-xl font-bold text-amber-400 mt-1">৩টি পণ্য</p>
                <p className="text-[10px] text-amber-300 mt-0.5">পুনরায় অর্ডার করা প্রয়োজন</p>
              </div>
            </div>

            {/* Quick POS simulation banner */}
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <Printer className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-semibold text-white">থার্মাল প্রিন্ট ও এসএমএস সুবিধা</p>
                  <p className="text-[11px] text-slate-400">কাস্টমারকে তাৎক্ষণিক ক্যাশ মেমো বা বকেয়া স্টেটমেন্ট প্রিন্ট করে দিন</p>
                </div>
              </div>
              <Link
                href="/dashboard/pos"
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold inline-flex items-center gap-1 shrink-0"
              >
                পিওএস ট্রাই করুন <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features Section */}
      <section id="features" className="py-16 md:py-24 bg-slate-950">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider block mb-2">
              শক্তিশালী ফিচারসমূহ
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              দোকান পরিচালনার সবকিছু এক সফটওয়্যারে
            </h2>
            <p className="mt-3 text-sm text-slate-400 leading-relaxed">
              কাগজে-কলমে হিসাব রাখা বন্ধ করে ব্যবসার সম্পূর্ণ হিসাব নিয়ে আসুন আপনার হাতের মুঠোয়।
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1: POS */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all">
              <div className="w-11 h-11 rounded-xl bg-indigo-600/10 text-indigo-400 flex items-center justify-center mb-4">
                <ShoppingCart className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">
                ১. দ্রুত পিওএস ক্যাশিয়ার বিলিং
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                বারকোড স্ক্যানার দিয়ে পলকের মধ্যে পণ্য কার্টে যোগ করুন। ডিসকাউন্ট, ভ্যাট এবং ক্যাশ/বিকাশ/নগদ/কার্ডে এক ক্লিকেই সেলস সম্পন্ন করুন।
              </p>
              <ul className="space-y-1.5 text-xs text-slate-300">
                <li className="flex items-center gap-2">✓ বারকোড স্ক্যানিং ও সার্চ</li>
                <li className="flex items-center gap-2">✓ ড্রাফট ও কার্ট হোল্ড সুবিধা</li>
                <li className="flex items-center gap-2">✓ মাল্টিপল পেমেন্ট মেথড</li>
              </ul>
            </div>

            {/* Feature 2: Customer Ledger */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all">
              <div className="w-11 h-11 rounded-xl bg-rose-600/10 text-rose-400 flex items-center justify-center mb-4">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">
                ২. কাস্টমার লেজার ও বাকি খাতা
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                কোন কাস্টমারের কাছে কত টাকা বাকি আছে এক ক্লিকে দেখুন। আংশিক জমা (Partial Payment) গ্রহণ এবং রসিদ বা স্টেটমেন্ট প্রিন্ট করুন।
              </p>
              <ul className="space-y-1.5 text-xs text-slate-300">
                <li className="flex items-center gap-2">✓ প্রতিটি কাস্টমারের আলাদা লেজার</li>
                <li className="flex items-center gap-2">✓ বকেয়া পরিশোধের রসিদ</li>
                <li className="flex items-center gap-2">✓ ফুল হিস্ট্রি ও স্টেটমেন্ট ডাউনলোড</li>
              </ul>
            </div>

            {/* Feature 3: Inventory */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all">
              <div className="w-11 h-11 rounded-xl bg-emerald-600/10 text-emerald-400 flex items-center justify-center mb-4">
                <Package className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">
                ৩. ইনভেন্টরি ও লো-স্টক অ্যালার্ট
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                পণ্যের ক্রয়মূল্য ও বিক্রয়মূল্য নির্ধারণ করুন। পণ্য শেষ হওয়ার আগেই লো-স্টক অ্যালার্ট পেয়ে যাবেন যাতে বিক্রয় কোনোভাবেই বন্ধ না থাকে।
              </p>
              <ul className="space-y-1.5 text-xs text-slate-300">
                <li className="flex items-center gap-2">✓ অটোমেটিক লো-স্টক সতর্কতা</li>
                <li className="flex items-center gap-2">✓ ক্যাটাগরি ও ব্র্যান্ড ট্র্যাকিং</li>
                <li className="flex items-center gap-2">✓ এক্সেল/CSV ফাইল আপলোড</li>
              </ul>
            </div>

            {/* Feature 4: Thermal Printing */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all">
              <div className="w-11 h-11 rounded-xl bg-purple-600/10 text-purple-400 flex items-center justify-center mb-4">
                <Printer className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">
                ৪. থার্মাল ও A4 মেমো প্রিন্টিং
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                দোকানের যেকোনো ৫৮মিমি বা ৮০মিমি পিওএস থার্মাল প্রিন্টারে সাথে সাথে রসিদ প্রিন্ট দিন। দোকানের নাম, মোবাইল নম্বর ও কাস্টমার বকেয়া রসিদেই প্রিন্ট হবে।
              </p>
              <ul className="space-y-1.5 text-xs text-slate-300">
                <li className="flex items-center gap-2">✓ ৫৮মিমি ও ৮০মিমি সাপোর্ট</li>
                <li className="flex items-center gap-2">✓ দোকানের কাস্টম লোগো ও হেডার</li>
                <li className="flex items-center gap-2">✓ A4 প্রফেশনাল মেমো প্রিন্ট</li>
              </ul>
            </div>

            {/* Feature 5: Expenses & Profit */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all">
              <div className="w-11 h-11 rounded-xl bg-amber-600/10 text-amber-400 flex items-center justify-center mb-4">
                <Wallet className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">
                ৫. দোকান খরচ ও লাভ-ক্ষতি
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                দোকান ভাড়া, বিদ্যুৎ বিল, কর্মচারীর বেতন ইত্যাদি খরচের হিসাব রাখুন। মোট বিক্রয় থেকে খরচ বাদ দিয়ে প্রতিদিনের প্রকৃত নিট লাভ জানুন।
              </p>
              <ul className="space-y-1.5 text-xs text-slate-300">
                <li className="flex items-center gap-2">✓ ক্যাটাগরি অনুযায়ী দোকান খরচ</li>
                <li className="flex items-center gap-2">✓ দৈনিক নিট প্রফিট ও মার্জিন</li>
                <li className="flex items-center gap-2">✓ আর্থিক সারসংক্ষেপ রিপোর্ট</li>
              </ul>
            </div>

            {/* Feature 6: Mobile & Branches */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all">
              <div className="w-11 h-11 rounded-xl bg-blue-600/10 text-blue-400 flex items-center justify-center mb-4">
                <Store className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">
                ৬. একাধিক শাখা ও মোবাইল অ্যাপ
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                একাধিক শাখা থাকলে একটি অ্যাকাউন্ট থেকেই সব শোরুম মনিটর করুন। স্মার্টফোনে প্লে-স্টোর অ্যাপ ইনস্টল করে যেকোনো জায়গা থেকে লাইভ বিক্রয় দেখুন।
              </p>
              <ul className="space-y-1.5 text-xs text-slate-300">
                <li className="flex items-center gap-2">✓ অ্যান্ড্রয়েড মোবাইল অ্যাপ</li>
                <li className="flex items-center gap-2">✓ মাল্টি-ব্রাঞ্চ স্টক কন্ট্রোল</li>
                <li className="flex items-center gap-2">✓ রিয়েল-টাইম ক্লাউড সিঙ্কিং</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works (৩টি সহজ ধাপ) */}
      <section className="py-16 md:py-20 bg-slate-900/40 border-t border-slate-800/80">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider block mb-2">
            শুরু করা অত্যন্ত সহজ
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-12">
            মাত্র ৩টি ধাপে আপনার দোকান ডিজিটাল করুন
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-bold text-sm flex items-center justify-center mb-4">
                ১
              </span>
              <h4 className="text-base font-bold text-white mb-1.5">অ্যাকাউন্ট খুলুন</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                আপনার দোকানের নাম, মোবাইল নম্বর ও পাসওয়ার্ড দিয়ে ৩০ সেকেন্ডে সম্পূর্ণ ফ্রি অ্যাকাউন্ট তৈরি করুন।
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-bold text-sm flex items-center justify-center mb-4">
                ২
              </span>
              <h4 className="text-base font-bold text-white mb-1.5">পণ্য ও দাম যোগ করুন</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                বারকোডসহ পণ্যের ক্রয়মূল্য ও বিক্রয়মূল্য এন্ট্রি করুন, অথবা এক্সেল ফাইলের মাধ্যমে একসাথে আপলোড করুন।
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="w-8 h-8 rounded-lg bg-emerald-600 text-white font-bold text-sm flex items-center justify-center mb-4">
                ৩
              </span>
              <h4 className="text-base font-bold text-white mb-1.5">বিক্রয় ও প্রিন্ট শুরু করুন</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                ক্যাশ বা বাকিতে বিক্রয় করুন, থার্মাল রসিদ প্রিন্ট দিন এবং লাইভ প্রফিট ও বাকি খাতার রিপোর্ট উপভোগ করুন।
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Target Industries (কারা ব্যবহার করবেন) */}
      <section className="py-16 md:py-20 bg-slate-950 border-t border-slate-800/80">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider block mb-2">
            ব্যবসার উপযোগী
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-8">
            কোন কোন ব্যবসার জন্য Inventarioya পারফেক্ট?
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center">
              <p className="font-bold text-sm text-white">মুদি ও সুপারশপ</p>
              <p className="text-[11px] text-slate-400 mt-1">দ্রুত বারকোড বিলিং</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center">
              <p className="font-bold text-sm text-white">ফ্যাশন ও ক্লথিং</p>
              <p className="text-[11px] text-slate-400 mt-1">সাইজ ও ক্যাটাগরি</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center">
              <p className="font-bold text-sm text-white">মোবাইল ও গ্যাজেট</p>
              <p className="text-[11px] text-slate-400 mt-1">আইটেম ওয়ারেন্টি ট্র্যাকিং</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center">
              <p className="font-bold text-sm text-white">ফার্মেসি ও হেলথ</p>
              <p className="text-[11px] text-slate-400 mt-1">ব্যাচ ও স্টক হিসাব</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center">
              <p className="font-bold text-sm text-white">হার্ডওয়্যার ও পেইন্টস</p>
              <p className="text-[11px] text-slate-400 mt-1">বাকি খাতা ও লেজার</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center">
              <p className="font-bold text-sm text-white">পাইকারি ও ডিস্ট্রিবিউটর</p>
              <p className="text-[11px] text-slate-400 mt-1">বাল্ক সেলস ও সাপ্লায়ার</p>
            </div>
          </div>
        </div>
      </section>

      {/* Google Play Store Banner */}
      <section className="py-14 bg-slate-900/60 border-t border-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-6 sm:p-10 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-950 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold">
                <Smartphone className="w-3.5 h-3.5" />
                <span>Google Play Store Certified App</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white">
                স্মার্টফোনে ব্যবহার করুন Inventarioya মোবাইল অ্যাপ
              </h3>
              <p className="text-xs text-slate-400 max-w-lg leading-relaxed">
                প্লে-স্টোর থেকে সরাসরি অ্যান্ড্রয়েড অ্যাপ ডাউনলোড করুন। ফোনের ক্যামেরা দিয়ে বারকোড স্ক্যান এবং কাস্টমার বাকি খাতার রিয়েল-টাইম তথ্য জানুন যেকোনো স্থান থেকে।
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <a
                href="https://play.google.com/store/apps/details?id=com.earbaj.inventarioya&pcampaignid=web_share"
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3 rounded-xl bg-slate-950 hover:bg-slate-900 border border-slate-700 text-white flex items-center gap-3 transition-colors shadow-lg"
              >
                <Smartphone className="w-5 h-5 text-emerald-400" />
                <div className="text-left">
                  <p className="text-[9px] text-slate-400 uppercase tracking-wider leading-none">Get it on</p>
                  <p className="text-sm font-bold text-white leading-tight">Google Play</p>
                </div>
              </a>
              <Link
                href="/dashboard/pos"
                className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-colors"
              >
                ওয়েব পিওএস চালান
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions (FAQ) */}
      <section className="py-16 md:py-20 bg-slate-950 border-t border-slate-800/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider block mb-2">
              সাধারণ জিজ্ঞাসা
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              সচরাচর জিজ্ঞাসিত প্রশ্ন ও উত্তর (FAQ)
            </h2>
          </div>

          <div className="space-y-4 text-left">
            <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
              <h4 className="font-bold text-sm text-white mb-2 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-indigo-400 shrink-0" />
                Inventarioya ব্যবহার করতে কি কোনো বিশেষ কম্পিউটারের প্রয়োজন আছে?
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed pl-6">
                না, কোনো বিশেষ কম্পিউটার লাগবে না। আপনার দোকানে থাকা যেকোনো সাধারণ কম্পিউটার, ল্যাপটপ অথবা মোবাইল ফোনে ইন্টারনেট ব্রাউজার অথবা আমাদের অ্যান্ড্রয়েড অ্যাপ দিয়ে খুব সহজেই ব্যবহার করতে পারবেন।
              </p>
            </div>

            <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
              <h4 className="font-bold text-sm text-white mb-2 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-indigo-400 shrink-0" />
                দোকানের থার্মাল প্রিন্টারে কি মেমো প্রিন্ট হবে?
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed pl-6">
                হ্যাঁ, বাজারে প্রচলিত যেকোনো স্ট্যান্ডার্ড ৫৮ মিমি (58mm) অথবা ৮০ মিমি (80mm) USB বা Bluetooth থার্মাল পিওএস প্রিন্টারে স্বয়ংক্রিয়ভাবে রসিদ প্রিন্ট করা যায়। এছাড়া সাধারণ প্রিন্টারের জন্য A4 সাইজেও মেমো প্রিন্ট করা যায়।
              </p>
            </div>

            <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
              <h4 className="font-bold text-sm text-white mb-2 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-indigo-400 shrink-0" />
                কাস্টমার বাকি খাতা কিভাবে কাজ করে?
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed pl-6">
                পিওএস-এ বিক্রয়ের সময় কাস্টমার সিলেক্ট করে বাকিতে সেল করতে পারবেন। পরবর্তীতে কাস্টমারের নামে ক্লিক করলে তার মোট বকেয়া, অতীতের ক্রয় ইতিহাস ও আংশিক জমা (Payment) এন্ট্রি করা যায় এবং তাকে ফুল স্টেটমেন্ট প্রিন্ট দেওয়া যায়।
              </p>
            </div>

            <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
              <h4 className="font-bold text-sm text-white mb-2 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-indigo-400 shrink-0" />
                আমার দোকানের ডাটা কি নিরাপদ থাকবে?
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed pl-6">
                সম্পূর্ণ নিরাপদ। আপনার ডাটা এনক্রিপ্ট করে স্বয়ংক্রিয় ক্লাউড ব্যাকআপে রাখা হয়। ফলে আপনার কম্পিউটার বা মোবাইল হারিয়ে বা নষ্ট হয়ে গেলেও নতুন ডিভাইসে লগইন করলেই সব ডাটা মুহূর্তেই ফিরে পাবেন।
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to action (CTA) */}
      <section className="py-16 md:py-20 bg-slate-900/60 border-t border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white mb-4">
            আজই আপনার দোকানের হিসাব ডিজিটাল করুন
          </h2>
          <p className="text-sm text-slate-400 max-w-xl mx-auto mb-8 leading-relaxed">
            কোনো ধরনের ঝামেলা ছাড়া আজই ফ্রি ট্রায়ালে শুরু করুন Inventarioya ক্লাউড পিওএস। আপনার ব্যবসাকে করুন দ্রুত ও নির্ভুল।
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Link
              href="/register"
              className="w-full sm:w-auto px-8 py-3.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
            >
              ফ্রি অ্যাকাউন্ট খুলুন
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-3.5 text-sm font-semibold text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl transition-all"
            >
              দোকান লগইন
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
