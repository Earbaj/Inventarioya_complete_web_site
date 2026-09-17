import Link from "next/link";
import { LandingNavbar } from "@/components/layout/LandingNavbar";
import { Footer } from "@/components/layout/Footer";
import { Boxes, Smartphone, Sparkles, ShoppingCart, ShieldCheck } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-600 selection:text-white">
      <LandingNavbar />
      <main className="pt-32 pb-20 max-w-4xl mx-auto px-4 sm:px-6">
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white mb-6">About Inventarioya</h1>
        <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6">
          Inventarioya is an all-in-one Cloud Point of Sale (POS), Multi-branch Retail Inventory, and Gemini AI Analytics platform engineered specifically for modern stores, supermarkets, grocery chains, and boutiques.
        </p>
        <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-8">
          With seamless native mobile app integration on Google Play Store and a blazing-fast Next.js web application, store owners and cashiers experience real-time synchronization, barcode rapid checkouts, and automated inventory depletion forecasting.
        </p>
        <div className="pt-4">
          <Link
            href="/dashboard/pos"
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg transition-colors inline-flex items-center gap-2"
          >
            <ShoppingCart className="w-4 h-4" />
            Launch POS Cash Register
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
