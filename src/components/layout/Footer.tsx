import Link from "next/link";
import { Boxes, Heart, Smartphone } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-800/80 text-slate-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <Boxes className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-white">Inventarioya</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Next-generation enterprise retail management, fast cloud POS, multi-branch inventory, and predictive Gemini AI analytics.
          </p>
          <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg w-fit">
            <Smartphone className="w-4 h-4" />
            <span>Published on Google Play Store</span>
          </div>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-3 text-sm">Platform Modules</h4>
          <ul className="space-y-2 text-xs">
            <li><Link href="/dashboard/pos" className="hover:text-indigo-400">High-Speed Cloud POS</Link></li>
            <li><Link href="/dashboard/inventory" className="hover:text-indigo-400">Inventory & Barcodes</Link></li>
            <li><Link href="/dashboard/ai-advisor" className="hover:text-indigo-400">Gemini AI Demand Forecast</Link></li>
            <li><Link href="/dashboard/suppliers" className="hover:text-indigo-400">Purchase Orders & Vendors</Link></li>
            <li><Link href="/dashboard/expenses" className="hover:text-indigo-400">Expense & Profit Ledger</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-3 text-sm">Portals & Quick Links</h4>
          <ul className="space-y-2 text-xs">
            <li><Link href="/login" className="hover:text-indigo-400">Shop Admin Login</Link></li>
            <li><Link href="/register" className="hover:text-indigo-400">Register Shop Owner</Link></li>
            <li><Link href="/pricing" className="hover:text-indigo-400">Subscription Plans</Link></li>
            <li><Link href="/superadmin" className="hover:text-indigo-400">SuperAdmin Gateway</Link></li>
            <li><Link href="/dashboard/trash" className="hover:text-indigo-400">Data Recovery Bin</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-3 text-sm">Support & Billing</h4>
          <p className="text-xs text-slate-400 mb-2">
            Integrated with bKash, Nagad, Rocket, and Bank transfer for automatic or manual invoice verification.
          </p>
          <p className="text-xs text-slate-400">
            Backend API: <span className="text-indigo-400 font-mono">inventory-web-backend-c0fu.onrender.com</span>
          </p>
        </div>
      </div>

      <div className="border-t border-slate-900 py-6 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} Inventarioya Inc. All rights reserved. Built with modern Next.js & Flutter Backend.
      </div>
    </footer>
  );
}
