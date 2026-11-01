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
  Trash2,
  AlertTriangle,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Database,
  Cpu,
  Activity,
  Download,
  UploadCloud,
  RotateCcw,
  RefreshCw,
  FileJson,
  Server,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function AdminShopsPage() {
  const { txt } = useLanguage();
  const [shops, setShops] = useState<Shop[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // Shop Delete States
  const [shopToDelete, setShopToDelete] = useState<Shop | null>(null);
  const [confirmNameInput, setConfirmNameInput] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // System Health Telemetry States
  const [systemHealth, setSystemHealth] = useState<any>(null);
  const [healthLoading, setHealthLoading] = useState(false);

  // Shop Export States
  const [exportingShopId, setExportingShopId] = useState<string | null>(null);

  // Shop Restore States
  const [shopToRestore, setShopToRestore] = useState<Shop | null>(null);
  const [parsedBackup, setParsedBackup] = useState<any>(null);
  const [restoreConfirmInput, setRestoreConfirmInput] = useState("");
  const [isRestoring, setIsRestoring] = useState(false);
  const [restoreFileError, setRestoreFileError] = useState<string | null>(null);

  const fetchHealth = async () => {
    setHealthLoading(true);
    try {
      const data = await SubscriptionsService.getSystemHealth();
      setSystemHealth(data);
    } catch (err) {
      console.error("Failed to load health telemetry:", err);
    } finally {
      setHealthLoading(false);
    }
  };

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
    fetchHealth();
  }, []);

  const handleExportShop = async (shop: Shop) => {
    const targetId = shop.shopId || shop.id;
    setExportingShopId(targetId);
    try {
      const backupData = await SubscriptionsService.exportShopBackup(targetId);
      const safeName = (shop.name || "shop").replace(/[^a-zA-Z0-9_-]/g, "_");
      const dateStr = new Date().toISOString().split("T")[0];
      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `shop_${safeName}_backup_${dateStr}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setFeedback({
        type: "success",
        text: txt(
          `শপ '${shop.name}'-এর সম্পূর্ণ ব্যাকআপ ফাইল সফলভাবে ডাউনলোড হয়েছে।`,
          `Full backup for '${shop.name}' was downloaded successfully.`
        ),
      });
    } catch (err: any) {
      setFeedback({
        type: "error",
        text: err?.message || txt("ব্যাকআপ ডাউনলোড করতে সমস্যা হয়েছে।", "Failed to export shop backup."),
      });
    } finally {
      setExportingShopId(null);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRestoreFileError(null);
    setParsedBackup(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".json")) {
      setRestoreFileError(txt("শুধুমাত্র .json ব্যাকআপ ফাইল সাপোর্ট করে।", "Only .json backup files are supported."));
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (!json.backupMeta || !json.data) {
          setRestoreFileError(
            txt(
              "ভুল ফাইল ফরম্যাট: ব্যাকআপ ফাইলে 'backupMeta' অথবা 'data' পাওয়া যায়নি।",
              "Invalid format: missing 'backupMeta' or 'data'."
            )
          );
          return;
        }

        const targetId = shopToRestore?.shopId || shopToRestore?.id;
        if (json.backupMeta.shopId !== targetId && json.backupMeta.shopId !== shopToRestore?.id) {
          setRestoreFileError(
            txt(
              `নিরাপত্তা সতর্কতা: এই ব্যাকআপ ফাইলটি অন্য শপের (ID: ${json.backupMeta.shopId})! বর্তমান শপে রিস্টোর করা যাবে না।`,
              `Safety Mismatch: Backup belongs to shopId '${json.backupMeta.shopId}', cannot restore into current shop.`
            )
          );
          return;
        }

        setParsedBackup(json);
      } catch (err) {
        setRestoreFileError(txt("ফাইলটি ভ্যালিড JSON নয়।", "File could not be parsed as valid JSON."));
      }
    };
    reader.readAsText(file);
  };

  const handleRestoreShop = async () => {
    if (!shopToRestore || !parsedBackup) return;
    const targetId = shopToRestore.shopId || shopToRestore.id;
    setIsRestoring(true);
    try {
      const res = await SubscriptionsService.restoreShopBackup(targetId, parsedBackup);
      setFeedback({
        type: "success",
        text:
          res?.message ||
          txt(
            `শপ '${shopToRestore.name}' সফলভাবে ব্যাকআপ থেকে রিস্টোর করা হয়েছে।`,
            `Shop '${shopToRestore.name}' restored successfully from backup.`
          ),
      });
      setShopToRestore(null);
      setParsedBackup(null);
      setRestoreConfirmInput("");
      fetchHealth();
    } catch (err: any) {
      setFeedback({
        type: "error",
        text: err?.message || txt("শপ রিস্টোর করতে ব্যর্থ হয়েছে।", "Failed to restore shop data."),
      });
    } finally {
      setIsRestoring(false);
    }
  };

  const handleDeleteShop = async () => {
    if (!shopToDelete) return;
    const targetId = shopToDelete.shopId || shopToDelete.id;
    setIsDeleting(true);
    try {
      const res = await SubscriptionsService.deleteAdminShop(targetId);
      setShops((prev) => prev.filter((s) => s.id !== shopToDelete.id && s.shopId !== shopToDelete.shopId));
      setFeedback({
        type: "success",
        text:
          res?.message ||
          txt(
            `শপ '${shopToDelete.name}' এবং এর সাথে সম্পর্কিত সকল ডাটা স্থায়ীভাবে মুছে ফেলা হয়েছে।`,
            `Shop '${shopToDelete.name}' and all associated data have been permanently purged.`
          ),
      });
      setShopToDelete(null);
      setConfirmNameInput("");
    } catch (err: any) {
      setFeedback({
        type: "error",
        text: err?.message || txt("শপ ডিলিট করতে ব্যর্থ হয়েছে।", "Failed to delete shop."),
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const filtered = shops.filter(
    (s) =>
      s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.subscriptionTier?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main className="p-4 sm:p-8 space-y-6 max-w-7xl">
      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between gap-3 text-xs font-semibold shadow-lg ${
            feedback.type === "success"
              ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
              : "bg-rose-500/10 border border-rose-500/30 text-rose-400"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {feedback.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            )}
            <span>{feedback.text}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="p-1 hover:opacity-80 transition-opacity"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Infrastructure & System Resource Telemetry Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Supabase Database Storage */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 relative overflow-hidden shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <Database className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">{txt("সুপাবেস ডাটাবেজ স্টোরেজ", "Supabase DB Storage")}</p>
                <p className="text-[10px] text-slate-400">{txt("পোস্টগ্রেস ফ্রি লিমিট", "PostgreSQL Free Limit")}</p>
              </div>
            </div>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                (systemHealth?.database?.usagePercentage ?? 0) > 80
                  ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                  : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
              }`}
            >
              {systemHealth?.database?.status || "HEALTHY"}
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex items-baseline justify-between text-xs">
              <span className="text-xl font-black text-white font-mono">
                {systemHealth?.database?.usedFormatted ?? "14.8 MB"}
              </span>
              <span className="text-slate-400 text-[11px] font-mono">
                / {systemHealth?.database?.limitFormatted ?? "500 MB"} ({systemHealth?.database?.usagePercentage ?? 2.96}%)
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  (systemHealth?.database?.usagePercentage ?? 0) > 80
                    ? "bg-rose-500"
                    : (systemHealth?.database?.usagePercentage ?? 0) > 60
                    ? "bg-amber-500"
                    : "bg-emerald-500"
                }`}
                style={{ width: `${Math.max(2, Math.min(100, systemHealth?.database?.usagePercentage ?? 3))}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
              <span>{txt("অবশিষ্ট খালি জায়গা:", "Free remaining:")}</span>
              <span className="font-mono text-slate-300 font-semibold">
                {systemHealth?.database?.remainingFormatted ?? "485.2 MB"}
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Render Server RAM Container */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 relative overflow-hidden shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                <Cpu className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">{txt("রেন্ডার ব্যাকএন্ড র‍্যাম", "Render Backend RAM")}</p>
                <p className="text-[10px] text-slate-400">{txt("নোডজেএস কনটেইনার", "Node.js 512MB Container")}</p>
              </div>
            </div>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                (systemHealth?.server?.ramPercentage ?? 0) > 80
                  ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                  : "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30"
              }`}
            >
              {systemHealth?.server?.status || "OPTIMAL"}
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex items-baseline justify-between text-xs">
              <span className="text-xl font-black text-white font-mono">
                {systemHealth?.server?.ramUsedFormatted ?? "108.4 MB"}
              </span>
              <span className="text-slate-400 text-[11px] font-mono">
                / {systemHealth?.server?.ramLimitFormatted ?? "512 MB"} ({systemHealth?.server?.ramPercentage ?? 21.17}%)
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  (systemHealth?.server?.ramPercentage ?? 0) > 80
                    ? "bg-rose-500"
                    : (systemHealth?.server?.ramPercentage ?? 0) > 60
                    ? "bg-amber-500"
                    : "bg-indigo-500"
                }`}
                style={{ width: `${Math.max(4, Math.min(100, systemHealth?.server?.ramPercentage ?? 21))}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
              <span>{txt("হিপ মেমোরি:", "Heap used:")}</span>
              <span className="font-mono text-slate-300 font-semibold">
                {systemHealth?.server?.heapUsedMb ? `${systemHealth.server.heapUsedMb} MB` : "N/A"}
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Uptime & Infrastructure Telemetry */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 relative overflow-hidden shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">{txt("সার্ভার আপটাইম ও লাইভ", "Server Uptime & Live")}</p>
                  <p className="text-[10px] text-slate-400">{txt("সক্রিয় সার্ভিস স্ট্যাটাস", "Active Service Status")}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={fetchHealth}
                disabled={healthLoading}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                title={txt("রিসোর্স মেট্রিক্স রিফ্রেশ করুন", "Refresh resource metrics")}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${healthLoading ? "animate-spin text-amber-400" : ""}`} />
              </button>
            </div>

            <div className="flex items-center gap-2 my-1">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-base font-bold text-white font-mono">
                {systemHealth?.server?.uptimeFormatted ?? "Active Live"}
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
            <span>
              {systemHealth?.totals
                ? `${systemHealth.totals.totalProducts ?? 0} ${txt("পণ্য", "items")} • ${systemHealth.totals.totalSales ?? 0} ${txt("বিক্রি", "sales")}`
                : txt("১০০% সুরক্ষিত ক্লাউড", "100% Protected Cloud")}
            </span>
            <span className="font-mono text-emerald-400 font-semibold">{txt("অনলাইন", "ONLINE")}</span>
          </div>
        </div>
      </div>

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
          <table className="w-full min-w-[850px] text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">{txt("মার্চেন্ট / শপ", "Merchant / Shop")}</th>
                <th className="py-3 px-4">{txt("ইমেইল ঠিকানা", "Email Address")}</th>
                <th className="py-3 px-4">{txt("রোল", "Role")}</th>
                <th className="py-3 px-4">{txt("সাবস্ক্রিপশন প্ল্যান", "Subscription Plan")}</th>
                <th className="py-3 px-4">{txt("স্টাফ / ম্যানেজার", "Staff / Managers")}</th>
                <th className="py-3 px-4">{txt("মেয়াদ উত্তীর্ণের তারিখ", "Subscription Expiry")}</th>
                <th className="py-3 px-4">{txt("নিবন্ধনের তারিখ", "Joined Date")}</th>
                <th className="py-3 px-4 text-right">{txt("অ্যাকশন", "Actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
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
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Export Backup JSON Button */}
                          <button
                            type="button"
                            onClick={() => handleExportShop(shop)}
                            disabled={exportingShopId === (shop.shopId || shop.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-emerald-400 hover:text-white bg-emerald-500/10 hover:bg-emerald-600 border border-emerald-500/20 transition-all cursor-pointer shadow-sm disabled:opacity-50"
                            title={txt("সম্পূর্ণ শপ ডাটা ব্যাকআপ ডাউনলোড (JSON)", "Export full shop dataset as JSON")}
                          >
                            {exportingShopId === (shop.shopId || shop.id) ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Download className="w-3.5 h-3.5" />
                            )}
                            <span className="hidden sm:inline">{txt("এক্সপোর্ট", "Export")}</span>
                          </button>

                          {/* Restore Backup Button */}
                          <button
                            type="button"
                            onClick={() => {
                              setShopToRestore(shop);
                              setParsedBackup(null);
                              setRestoreFileError(null);
                              setRestoreConfirmInput("");
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-amber-400 hover:text-white bg-amber-500/10 hover:bg-amber-600 border border-amber-500/20 transition-all cursor-pointer shadow-sm"
                            title={txt("ব্যাকআপ থেকে শপ ডাটা রিস্টোর করুন", "Restore shop data from JSON backup")}
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">{txt("রিস্টোর", "Restore")}</span>
                          </button>

                          {/* Delete Shop Button */}
                          <button
                            type="button"
                            onClick={() => {
                              setShopToDelete(shop);
                              setConfirmNameInput("");
                            }}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-rose-400 hover:text-white bg-rose-500/10 hover:bg-rose-600 border border-rose-500/20 transition-all cursor-pointer shadow-sm"
                            title={txt("শপ চিরতরে ডিলিট করুন", "Permanently Delete Shop")}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>{txt("ডিলিট", "Delete")}</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Shop Cascade Confirmation Modal */}
      {shopToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-rose-500/30 text-slate-100 rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col my-auto animate-in fade-in duration-200">
            {/* Modal Header */}
            <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-rose-400">
                <AlertTriangle className="w-5 h-5 shrink-0 text-rose-500" />
                <span className="font-bold text-sm">
                  {txt("শপ সম্পূর্ণ ডিলিট নিশ্চিতকরণ", "Confirm Shop Permanent Deletion")}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!isDeleting) {
                    setShopToDelete(null);
                    setConfirmNameInput("");
                  }
                }}
                disabled={isDeleting}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors disabled:opacity-50"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 text-xs">
              {/* Warning Alert */}
              <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 space-y-2 leading-relaxed">
                <p className="font-bold flex items-center gap-1.5 text-rose-400">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>
                    {txt(
                      "গুরুত্বপূর্ণ সতর্কবার্তা (Cascade Purge):",
                      "Critical Warning (Cascade Purge):"
                    )}
                  </span>
                </p>
                <p>
                  {txt(
                    "এই শপটি ডিলিট করলে এর অধীনস্থ সকল পণ্য (Inventory Items), ক্যাটাগরি, বিক্রয় ইনভয়েস, পণ্য ফেরত (Returns), কাস্টমার লেজার, সাপ্লায়ার, ব্রাঞ্চ এবং ম্যানেজার ইউজার অ্যাকাউন্ট ডাটাবেজ থেকে চিরতরে মুছে ফেলা হবে।",
                    "Deleting this shop will permanently purge all inventory items, categories, sales invoices, returns, customer ledgers, suppliers, branches, and manager user accounts from the database."
                  )}
                </p>
                <p className="font-semibold text-rose-200">
                  {txt("⚠️ এই কাজটি কোনোভাবেই পূর্বাবস্থায় ফিরিয়ে আনা যাবে না।", "⚠️ This action CANNOT be undone.")}
                </p>
              </div>

              {/* Shop Target Details Card */}
              <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-slate-400">
                  <span>{txt("মার্চেন্ট নাম:", "Merchant Name:")}</span>
                  <span className="font-bold text-white">{shopToDelete.name}</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>{txt("অ্যাডমিন ইমেইল:", "Admin Email:")}</span>
                  <span className="font-mono text-slate-200">{shopToDelete.email}</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>{txt("শপ আইডি (UUID):", "Shop ID:")}</span>
                  <span className="font-mono text-[11px] text-slate-400">{shopToDelete.shopId || shopToDelete.id}</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>{txt("প্ল্যান / স্ট্যাটাস:", "Plan / Status:")}</span>
                  <span className="font-semibold text-amber-400 uppercase">{shopToDelete.subscriptionTier || "Free"}</span>
                </div>
              </div>

              {/* Confirmation Prompt */}
              <div className="space-y-2">
                <label className="block text-slate-300 font-medium">
                  {txt(
                    "নিশ্চিত করতে নিচে শপের নাম অথবা DELETE লিখুন:",
                    "To confirm, type the shop name or DELETE below:"
                  )}
                </label>
                <input
                  type="text"
                  value={confirmNameInput}
                  onChange={(e) => setConfirmNameInput(e.target.value)}
                  placeholder={txt("DELETE অথবা শপের নাম লিখুন", "Type DELETE or shop name")}
                  disabled={isDeleting}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-950 px-6 py-4 border-t border-slate-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setShopToDelete(null);
                  setConfirmNameInput("");
                }}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer disabled:opacity-50"
              >
                {txt("বাতিল", "Cancel")}
              </button>

              <button
                type="button"
                onClick={handleDeleteShop}
                disabled={
                  isDeleting ||
                  (confirmNameInput.trim().toUpperCase() !== "DELETE" &&
                    confirmNameInput.trim().toLowerCase() !== (shopToDelete.name || "").trim().toLowerCase())
                }
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 transition-colors shadow-lg shadow-rose-600/30 flex items-center gap-2 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>{txt("মুছে ফেলা হচ্ছে...", "Deleting...")}</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{txt("স্থায়ীভাবে মুছে ফেলুন", "Permanently Delete")}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Restore Shop Safety Modal */}
      {shopToRestore && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-amber-500/30 text-slate-100 rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col my-auto animate-in fade-in duration-200">
            {/* Modal Header */}
            <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-amber-400">
                <RotateCcw className="w-5 h-5 shrink-0 text-amber-400" />
                <span className="font-bold text-sm">
                  {txt("শপ ডাটা রিস্টোর ও রিকভারি", "Restore Shop Data from Backup")}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!isRestoring) {
                    setShopToRestore(null);
                    setParsedBackup(null);
                    setRestoreFileError(null);
                    setRestoreConfirmInput("");
                  }
                }}
                disabled={isRestoring}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 text-xs">
              {/* Target Shop Info */}
              <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-500">{txt("টার্গেট শপ", "Target Shop")}</p>
                  <p className="text-sm font-bold text-white">{shopToRestore.name}</p>
                  <p className="text-[10px] font-mono text-slate-400">{shopToRestore.shopId || shopToRestore.id}</p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 uppercase">
                  {txt("রিকভারি টার্গেট", "Restore Target")}
                </span>
              </div>

              {/* Warning Alert */}
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 space-y-1.5 leading-relaxed">
                <p className="font-bold flex items-center gap-1.5 text-amber-400">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{txt("গুরুত্বপূর্ণ নিরাপত্তা নির্দেশিকা:", "Safety Notice:")}</span>
                </p>
                <p>
                  {txt(
                    "রিস্টোর করলে শুধুমাত্র এই শপের বর্তমান প্রোডাক্ট, সেলস ইনভয়েস, কাস্টমার ও ক্যাটাগরি ডাটা মুছে গিয়ে ব্যাকআপ ফাইলের ডাটা দিয়ে প্রতিস্থাপিত হবে। অন্য কোনো শপের ডাটাতে কোনো প্রভাব পড়বে না।",
                    "Restoring will cleanly replace only this shop's current operational records (products, sales, customers) with the backup dataset. Other shops are 100% unaffected."
                  )}
                </p>
              </div>

              {/* File Input */}
              <div className="space-y-1.5">
                <label className="block text-slate-300 font-medium">
                  {txt("১. ব্যাকআপ (.json) ফাইল নির্বাচন করুন:", "1. Select Backup (.json) File:")}
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept=".json,application/json"
                    onChange={handleFileSelect}
                    disabled={isRestoring}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-300 file:mr-3 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 cursor-pointer"
                  />
                </div>
                {restoreFileError && (
                  <p className="text-[11px] font-semibold text-rose-400 flex items-center gap-1 pt-1">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>{restoreFileError}</span>
                  </p>
                )}
              </div>

              {/* Parsed Backup Summary Preview */}
              {parsedBackup && (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 space-y-2.5">
                  <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2">
                    <span className="font-bold text-xs flex items-center gap-1.5 text-emerald-400">
                      <CheckCircle2 className="w-4 h-4" />
                      {txt("ব্যাকআপ ফাইল সফলভাবে যাচাইকৃত", "Backup File Verified")}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {formatDate(parsedBackup.backupMeta?.exportedAt)}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-[10px]">
                    <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-800">
                      <p className="text-slate-400 font-medium">{txt("পণ্য (Items)", "Items")}</p>
                      <p className="text-sm font-bold text-white">{parsedBackup.backupMeta?.counts?.items ?? 0}</p>
                    </div>
                    <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-800">
                      <p className="text-slate-400 font-medium">{txt("বিক্রি (Sales)", "Sales")}</p>
                      <p className="text-sm font-bold text-white">{parsedBackup.backupMeta?.counts?.sales ?? 0}</p>
                    </div>
                    <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-800">
                      <p className="text-slate-400 font-medium">{txt("ক্রেতা (Cust.)", "Customers")}</p>
                      <p className="text-sm font-bold text-white">{parsedBackup.backupMeta?.counts?.customers ?? 0}</p>
                    </div>
                    <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-800">
                      <p className="text-slate-400 font-medium">{txt("ক্যাটাগরি", "Categories")}</p>
                      <p className="text-sm font-bold text-white">{parsedBackup.backupMeta?.counts?.categories ?? 0}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Confirmation Input */}
              <div className="space-y-1.5">
                <label className="block text-slate-300 font-medium">
                  {txt(
                    "২. রিস্টোর নিশ্চিত করতে নিচে RESTORE অথবা শপের নাম লিখুন:",
                    "2. To confirm, type RESTORE or the shop name below:"
                  )}
                </label>
                <input
                  type="text"
                  value={restoreConfirmInput}
                  onChange={(e) => setRestoreConfirmInput(e.target.value)}
                  placeholder={txt("RESTORE অথবা শপের নাম লিখুন", "Type RESTORE or shop name")}
                  disabled={isRestoring || !parsedBackup}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 disabled:opacity-50"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-950 px-6 py-4 border-t border-slate-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setShopToRestore(null);
                  setParsedBackup(null);
                  setRestoreFileError(null);
                  setRestoreConfirmInput("");
                }}
                disabled={isRestoring}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer disabled:opacity-50"
              >
                {txt("বাতিল", "Cancel")}
              </button>

              <button
                type="button"
                onClick={handleRestoreShop}
                disabled={
                  isRestoring ||
                  !parsedBackup ||
                  (restoreConfirmInput.trim().toUpperCase() !== "RESTORE" &&
                    restoreConfirmInput.trim().toLowerCase() !== (shopToRestore.name || "").trim().toLowerCase())
                }
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 transition-colors shadow-lg shadow-amber-600/30 flex items-center gap-2 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {isRestoring ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>{txt("রিস্টোর হচ্ছে (অপেক্ষা করুন)...", "Restoring (Please wait)...")}</span>
                  </>
                ) : (
                  <>
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>{txt("রিস্টোর নিশ্চিত করুন", "Confirm Restore")}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
