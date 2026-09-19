import Link from "next/link";
import { Boxes, Smartphone, Headphones, Shield, Mail, Phone } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-800 text-slate-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-600/30">
              <Boxes className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-white tracking-tight">Inventarioya</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            স্মার্ট রিটেইল পিওএস, ইনভেন্টরি এবং বাকি খাতা ম্যানেজমেন্ট সফটওয়্যার। দোকানে দ্রুত বিক্রয়, থার্মাল রসিদ প্রিন্ট এবং রিয়েল-টাইম ক্লাউড সিঙ্ক।
          </p>
          <a
            href="https://play.google.com/store/apps/details?id=com.earbaj.inventarioya&pcampaignid=web_share"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 px-3 py-1.5 rounded-lg w-fit transition-colors"
          >
            <Smartphone className="w-4 h-4" />
            <span>Google Play Store App</span>
          </a>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-3 text-sm">ফিচার ও মডিউল</h4>
          <ul className="space-y-2 text-xs">
            <li><Link href="/dashboard/pos" className="hover:text-indigo-400 transition-colors">পয়েন্ট অফ সেল (Fast POS)</Link></li>
            <li><Link href="/dashboard/customers" className="hover:text-indigo-400 transition-colors">কাস্টমার বাকি খাতা (Ledger)</Link></li>
            <li><Link href="/dashboard/inventory" className="hover:text-indigo-400 transition-colors">ইনভেন্টরি ও স্টক অ্যালার্ট</Link></li>
            <li><Link href="/dashboard/expenses" className="hover:text-indigo-400 transition-colors">দোকান খরচ ও লাভ-ক্ষতি</Link></li>
            <li><Link href="/dashboard/sales" className="hover:text-indigo-400 transition-colors">সেলস হিস্ট্রি ও ইনভয়েস</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-3 text-sm">প্রয়োজনীয় লিংক</h4>
          <ul className="space-y-2 text-xs">
            <li><Link href="/login" className="hover:text-indigo-400 transition-colors">দোকান লগইন (Login)</Link></li>
            <li><Link href="/register" className="hover:text-indigo-400 transition-colors">ফ্রি একাউন্ট রেজিস্ট্রেশন</Link></li>
            <li><Link href="/pricing" className="hover:text-indigo-400 transition-colors">সাবস্ক্রিপশন প্যাকেজ</Link></li>
            <li><Link href="/dashboard/settings" className="hover:text-indigo-400 transition-colors">দোকান সেটিংস</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-3 text-sm">হেল্প ও সাপোর্ট</h4>
          <p className="text-xs text-slate-400 mb-3 leading-relaxed">
            যেকোনো সহায়তায় আমাদের কাস্টমার সাপোর্ট টিম প্রস্তুত রয়েছে।
          </p>
          <div className="space-y-2 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-indigo-400" />
              <span>support@inventarioya.com</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-indigo-400" />
              <span>+880 1819-000000</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-400 pt-1">
              <Shield className="w-3.5 h-3.5" />
              <span>১০০% নিরাপদ ক্লাউড ব্যাকআপ</span>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-900 py-6 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} Inventarioya. সর্বস্বত্ব সংরক্ষিত। Smart Retail POS & Business Ledger System.
      </div>
    </footer>
  );
}
