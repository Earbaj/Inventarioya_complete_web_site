"use client";

import { useState, useEffect } from "react";
import { SubscriptionsService } from "@/lib/api/client";
import { Shop } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { Building2, Search, Phone, Mail, MapPin, Eye, CheckCircle2 } from "lucide-react";

export default function AdminShopsPage() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);

  useEffect(() => {
    async function loadShops() {
      try {
        const data = await SubscriptionsService.getAdminShops();
        setShops(data);
      } catch (err) {
        console.error(err);
      }
    }
    loadShops();
  }, []);

  const filtered = shops.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.ownerName && s.ownerName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <main className="p-8 space-y-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Registered Merchant Shops</h1>
          <p className="text-xs text-slate-400">Manage all businesses using the Inventarioya platform</p>
        </div>

        <div className="relative w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search shops or owners..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Shops Table */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Shop Name</th>
                <th className="py-3 px-4">Owner Name</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Plan</th>
                <th className="py-3 px-4">Branches</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filtered.map((shop) => (
                <tr key={shop.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-bold text-white">{shop.name}</td>
                  <td className="py-3 px-4 text-slate-300">{shop.ownerName}</td>
                  <td className="py-3 px-4 text-slate-400">
                    <p>{shop.phone}</p>
                    <p className="text-[10px] text-slate-500">{shop.email}</p>
                  </td>
                  <td className="py-3 px-4 text-slate-400">{shop.address || "-"}</td>
                  <td className="py-3 px-4 font-medium text-indigo-400">
                    {shop.subscriptionPlan || "Starter"}
                  </td>
                  <td className="py-3 px-4 text-slate-300">{shop.branchesCount || 1} Outlets</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        shop.subscriptionStatus === "active"
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-amber-500/20 text-amber-400"
                      }`}
                    >
                      {shop.subscriptionStatus?.toUpperCase() || "ACTIVE"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
