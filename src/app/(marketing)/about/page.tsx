"use client";

import Link from "next/link";
import { LandingNavbar } from "@/components/layout/LandingNavbar";
import { Footer } from "@/components/layout/Footer";
import { Boxes, Smartphone, Sparkles, ShoppingCart, ShieldCheck } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function AboutPage() {
  const { txt } = useLanguage();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-indigo-600 selection:text-white transition-colors">
      <LandingNavbar />
      <main className="pt-32 pb-20 max-w-4xl mx-auto px-4 sm:px-6">
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white mb-6">
          {txt("Inventarioya সম্পর্কে", "About Inventarioya")}
        </h1>
        <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed mb-6">
          {txt(
            "Inventarioya হলো আধুনিক রিটেইল স্টোর, সুপারশপ, মুদি দোকান ও ফ্যাশন বুটিকের জন্য বিশেষভাবে তৈরি অল-ইন-ওয়ান ক্লাউড পয়েন্ট অব সেল (POS), মাল্টি-ব্রাঞ্চ ইনভেন্টরি ও জেমিনি এআই অ্যানালিটিক্স প্ল্যাটফর্ম।",
            "Inventarioya is an all-in-one Cloud Point of Sale (POS), Multi-branch Retail Inventory, and Gemini AI Analytics platform engineered specifically for modern stores, supermarkets, grocery chains, and boutiques."
          )}
        </p>
        <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed mb-8">
          {txt(
            "গুগল প্লে-স্টোরের নেটিভ অ্যান্ড্রয়েড মোবাইল অ্যাপ এবং সুপারফাস্ট নেক্সট.জেএস ওয়েব অ্যাপের সমন্বয়ে দোকান মালিক এবং ক্যাশিয়াররা পান রিয়েল-টাইম ক্লাউড সিঙ্ক, দ্রুতগতির বারকোড স্ক্যানিং ও স্টক শেষ হওয়ার আগাম পূর্বাভাস।",
            "With seamless native mobile app integration on Google Play Store and a blazing-fast Next.js web application, store owners and cashiers experience real-time synchronization, barcode rapid checkouts, and automated inventory depletion forecasting."
          )}
        </p>
        <div className="pt-4">
          <Link
            href="/dashboard/pos"
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg transition-colors inline-flex items-center gap-2 cursor-pointer"
          >
            <ShoppingCart className="w-4 h-4" />
            {txt("পিওএস ক্যাশ রেজিস্টার চালু করুন", "Launch POS Cash Register")}
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
