import Link from "next/link";
import { LandingNavbar } from "@/components/layout/LandingNavbar";
import { Footer } from "@/components/layout/Footer";
import {
  Boxes,
  ShoppingCart,
  BrainCircuit,
  Store,
  Receipt,
  FileSpreadsheet,
  CheckCircle2,
  ArrowRight,
  Smartphone,
  ShieldCheck,
  Zap,
  BarChart3,
  Sparkles,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-600 selection:text-white">
      <LandingNavbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
        {/* Glow Gradients */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-indigo-600/20 blur-[130px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-[300px] h-[300px] bg-purple-600/15 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          {/* Play store announcement badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-6 animate-pulse">
            <Smartphone className="w-3.5 h-3.5" />
            <span>Mobile App Live on Google Play Store</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span className="text-slate-400">Synchronized with Web POS</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-4xl mx-auto leading-tight sm:leading-none">
            Smart Cloud POS & <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400">
              Gemini AI Business Intelligence
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            স্মার্ট রিটেইল ও ইনভেন্টরি ম্যানেজমেন্ট। দ্রুত বিলিং, ৮৮মিমি থার্মাল রিসিট, মাল্টি-ব্রাঞ্চ স্টক কন্ট্রোল এবং জেমিনাই এআই ডিমান্ড প্রেডিকশন — মোবাইল অ্যাপ এবং ওয়েব পোর্টালে একযোগে।
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/dashboard/pos"
              className="w-full sm:w-auto px-8 py-3.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 group"
            >
              <ShoppingCart className="w-4 h-4" />
              Launch Web POS Terminal
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/dashboard"
              className="w-full sm:w-auto px-8 py-3.5 text-sm font-semibold text-slate-200 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <BarChart3 className="w-4 h-4 text-indigo-400" />
              Explore Dashboard
            </Link>
          </div>

          {/* Quick Metrics */}
          <div className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto pt-8 border-t border-slate-800/80">
            <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80">
              <p className="text-2xl font-bold text-white tracking-tight">0.3s</p>
              <p className="text-xs text-slate-400 mt-1">Barcode POS Checkout</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80">
              <p className="text-2xl font-bold text-emerald-400 tracking-tight">100%</p>
              <p className="text-xs text-slate-400 mt-1">Offline Demo Resilient</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80">
              <p className="text-2xl font-bold text-purple-400 tracking-tight">Gemini AI</p>
              <p className="text-xs text-slate-400 mt-1">Stock Forecasting</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80">
              <p className="text-2xl font-bold text-indigo-400 tracking-tight">Thermal</p>
              <p className="text-xs text-slate-400 mt-1">80mm/58mm Invoicing</p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Showcase Grid */}
      <section id="features" className="py-20 bg-slate-900/40 border-t border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-2">
              Everything Your Store Needs
            </h2>
            <p className="text-3xl font-extrabold text-white sm:text-4xl">
              Powering Modern Retail & Supermarkets
            </p>
            <p className="mt-3 text-slate-400 text-sm">
              From high-traffic cash registers to multi-location stock replenishment, Inventarioya covers the entire workflow.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <ShoppingCart className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Lightning Fast Cloud POS</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Barcode scanning, instant item search, cart hold, multi-tender payments (Cash, Card, bKash, Nagad), and customer ledger mapping.
              </p>
              <Link href="/dashboard/pos" className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300">
                Test Live POS <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-purple-500/50 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-purple-600/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <BrainCircuit className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Gemini AI Demand Intelligence</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Powered by Google Gemini: Predict product stockout dates, calculate customer credit risk ratings, and get weekly business profit advice.
              </p>
              <Link href="/dashboard/ai-advisor" className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-purple-400 hover:text-purple-300">
                View AI Advisor <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-emerald-600/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Receipt className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Thermal Print & Invoicing</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Instant 80mm & 58mm thermal receipt printing, custom store branding, barcode headers, itemized taxes, and digital invoice sharing.
              </p>
              <Link href="/dashboard/sales" className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 hover:text-emerald-300">
                Sales Ledger <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-blue-500/50 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Store className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Multi-Branch Outlets</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Manage flagship stores and suburban branches seamlessly from one master dashboard. Switch store contexts with one click.
              </p>
              <Link href="/dashboard/branches" className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-blue-400 hover:text-blue-300">
                Manage Branches <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Feature 5 */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-amber-600/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">CSV Bulk Import & Export</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Bulk upload thousands of inventory items in seconds via CSV. Export customer balances, sales logs, and financial ledgers effortlessly.
              </p>
              <Link href="/dashboard/inventory" className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-amber-400 hover:text-amber-300">
                Import CSV <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Feature 6 */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-rose-500/50 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-rose-600/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Trash Bin & Audit Recovery</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Accidental deletions are safe with our two-tier Recycle Bin. Restore soft-deleted products and purge obsolete audit logs safely.
              </p>
              <Link href="/dashboard/trash" className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-rose-400 hover:text-rose-300">
                Recycle Bin <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile App Download Section */}
      <section id="mobile-app" className="py-16 bg-gradient-to-b from-slate-900 to-slate-950 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-gradient-to-r from-indigo-900/60 via-purple-900/50 to-slate-900 border border-indigo-500/30 p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl">
            <div className="space-y-4 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold">
                <Smartphone className="w-3.5 h-3.5" />
                Google Play Store Certified
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                Download the Inventarioya Android App
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                আপনার স্মার্টফোনে সরাসরি প্লে-স্টোর থেকে ইনস্টল করুন। ক্যামেরা দিয়ে বারকোড স্ক্যান, অফলাইন ক্যাশিয়ার সেলস এবং এসএমএস নোটিফিকেশন সুবিধা এক অ্যাপে।
              </p>
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <a
                  href="https://play.google.com"
                  target="_blank"
                  rel="noreferrer"
                  className="px-5 py-3 rounded-xl bg-slate-950 hover:bg-slate-900 border border-slate-700 text-white flex items-center gap-3 shadow-lg transition-colors"
                >
                  <div className="w-6 h-6 text-emerald-400">
                    <Smartphone className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] text-slate-400 uppercase leading-none">Get it on</p>
                    <p className="text-sm font-bold leading-tight text-white">Google Play</p>
                  </div>
                </a>

                <Link
                  href="/dashboard/pos"
                  className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-colors"
                >
                  Or Use Web Terminal
                </Link>
              </div>
            </div>

            <div className="w-full md:w-80 bg-slate-950/80 border border-slate-800 p-6 rounded-2xl shadow-xl text-center space-y-3">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/40">
                <Boxes className="w-8 h-8" />
              </div>
              <h4 className="font-bold text-white text-base">Inventarioya Mobile</h4>
              <p className="text-xs text-slate-400">Flutter Engine v3.x • Realtime Sync</p>
              <div className="pt-2 border-t border-slate-800 text-[11px] text-emerald-400 flex items-center justify-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Play Store Verified Release
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
