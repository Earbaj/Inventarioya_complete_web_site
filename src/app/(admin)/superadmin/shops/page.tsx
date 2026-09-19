"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { SubscriptionsService } from "@/lib/api/client";
import { Shop } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Building2,
  Search,
  Mail,
  Shield,
  Crown,
  Calendar,
  Users,
  ChevronLeft,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function AdminShopsPage() {
  const { txt } = useLanguage();
  const [shops, setShops] = useState<Shop[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadShops() {
      try {
        console.log("Fetching /api/admin/shops...");
        const data = await SubscriptionsService.getAdminShops();
        console.log("🏪 [Admin Shops Received]:", data);
        setShops(data);
      } catch (err) {
        console.error("Failed to load admin shops:", err);
      } finally {
        setLoading(false);
      }
    }
    loadShops();
  }, []);

  const filtered = shops.filter(
    (s) =>
      s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.subscriptionTier?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main className="p-4 sm:p-8 space-y-6 max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/superadmin"
              className="text-xs text-slate-400 hover:text-white inline-flex items-center gap-1 transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              {txt("ওভারভিউতে ফিরে যান", "Back to Overview")}
            </Link>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            {txt("নিবন্ধিত মার্চেন্ট ডিরেক্টরি", "Registered Merchant Directory")}
          </h1>
          <p className="text-xs text-slate-400">
            {txt("Inventarioya প্ল্যাটফর্মে নিবন্ধিত সকল মার্চেন্ট স্টোর", "All merchant stores registered on the Inventarioya platform")} ({shops.length} {txt("টি", "total")})
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={txt("নাম, ইমেইল বা টিয়ার দিয়ে খুঁজুন...", "Search by name, email, or tier...")}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Shops Table */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[750px] text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">{txt("মার্চেন্ট / শপ", "Merchant / Shop")}</th>
                <th className="py-3 px-4">{txt("ইমেইল ঠিকানা", "Email Address")}</th>
                <th className="py-3 px-4">{txt("রোল", "Role")}</th>
                <th className="py-3 px-4">{txt("সাবস্ক্রিপশন প্ল্যান", "Subscription Plan")}</th>
                <th className="py-3 px-4">{txt("স্টাফ / ম্যানেজার", "Staff / Managers")}</th>
                <th className="py-3 px-4">{txt("মেয়াদ উত্তীর্ণের তারিখ", "Subscription Expiry")}</th>
                <th className="py-3 px-4">{txt("নিবন্ধনের তারিখ", "Joined Date")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    {txt("কোনো নিবন্ধিত শপ পাওয়া যায়নি।", "No registered shops found.")}
                  </td>
                </tr>
              ) : (
                filtered.map((shop) => {
                  const isPremium =
                    (shop.subscriptionTier || "").toLowerCase() === "premium";

                  return (
                    <tr key={shop.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0">
                            {shop.name ? shop.name.charAt(0).toUpperCase() : "S"}
                          </div>
                          <div>
                            <p className="font-bold text-white">{shop.name || txt("নামবিহীন শপ", "Unnamed Shop")}</p>
                            <p className="text-[10px] font-mono text-slate-500 truncate max-w-[120px]">
                              {shop.shopId || shop.id}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-300">{shop.email}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300 uppercase">
                          {shop.role || "admin"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {isPremium ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            <Crown className="w-3 h-3" />
                            {txt("প্রিমিয়াম", "PREMIUM")}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-400 border border-slate-700">
                            {txt("ফ্রি টিয়ার", "FREE TIER")}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-300">
                        <div className="inline-flex items-center gap-1">
                          <Users className="w-3 h-3 text-slate-500" />
                          <span>{shop.managerCount ?? 0} {txt("ম্যানেজার", "Managers")}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-400">
                        {shop.subscriptionExpiresAt ? (
                          <span className="text-emerald-400 font-medium">
                            {formatDate(shop.subscriptionExpiresAt)}
                          </span>
                        ) : (
                          <span className="text-slate-500">{txt("মেয়াদহীন (ফ্রি)", "No Expiration (Free)")}</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-400">
                        {formatDate(shop.createdAt)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
