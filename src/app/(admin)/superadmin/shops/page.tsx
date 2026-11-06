"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { SubscriptionsService } from "@/lib/api/client";
import { Shop } from "@/types";
import {
  Search,
  ChevronLeft,
  X,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { SystemHealthCards } from "@/components/superadmin/SystemHealthCards";
import { ShopTable } from "@/components/superadmin/ShopTable";
import { DeleteShopModal } from "@/components/superadmin/DeleteShopModal";
import { RestoreShopModal } from "@/components/superadmin/RestoreShopModal";

/**
 * সুপার অ্যাডমিন শপ ডিরেক্টরি ও সিস্টেম হেলথ ম্যানেজমেন্ট পেজ
 * (SuperAdmin Registered Merchant Directory & System Health)
 */
export default function AdminShopsPage() {
  const { txt } = useLanguage();
  const [shops, setShops] = useState<Shop[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // Feedback Notification State
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // System Health Telemetry States
  const [systemHealth, setSystemHealth] = useState<any>(null);
  const [healthLoading, setHealthLoading] = useState(false);

  // Shop Export States
  const [exportingShopId, setExportingShopId] = useState<string | null>(null);

  // Shop Delete States
  const [shopToDelete, setShopToDelete] = useState<Shop | null>(null);
  const [confirmNameInput, setConfirmNameInput] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // Shop Restore States
  const [shopToRestore, setShopToRestore] = useState<Shop | null>(null);
  const [parsedBackup, setParsedBackup] = useState<any>(null);
  const [restoreConfirmInput, setRestoreConfirmInput] = useState("");
  const [isRestoring, setIsRestoring] = useState(false);
  const [restoreFileError, setRestoreFileError] = useState<string | null>(null);

  // 1. Fetch live system health metrics (Supabase DB + Render RAM)
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

  // 2. Fetch registered shops list on mount
  useEffect(() => {
    async function loadShops() {
      try {
        const data = await SubscriptionsService.getAdminShops();
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

  // 3. Handle Shop Permanent Purge / Deletion
  const handleDeleteShop = async () => {
    if (!shopToDelete) return;
    const targetId = shopToDelete.shopId || shopToDelete.id;
    setIsDeleting(true);
    try {
      const res = await SubscriptionsService.deleteAdminShop(targetId);
      setShops((prev) =>
        prev.filter((s) => s.id !== shopToDelete.id && s.shopId !== shopToDelete.shopId)
      );
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
      fetchHealth();
    } catch (err: any) {
      setFeedback({
        type: "error",
        text: err?.message || txt("শপ ডিলিট করতে ব্যর্থ হয়েছে।", "Failed to delete shop."),
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // 4. Handle Full Shop Backup JSON Download
  const handleExportShop = async (shop: Shop) => {
    const targetId = shop.shopId || shop.id;
    setExportingShopId(targetId);
    try {
      const backupData = await SubscriptionsService.exportShopBackup(targetId);
      const safeName = (shop.name || "shop").replace(/[^a-zA-Z0-9_-]/g, "_");
      const dateStr = new Date().toISOString().split("T")[0];
      const blob = new Blob([JSON.stringify(backupData, null, 2)], {
        type: "application/json",
      });
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
        text:
          err?.message ||
          txt("ব্যাকআপ ডাউনলোড করতে সমস্যা হয়েছে।", "Failed to export shop backup."),
      });
    } finally {
      setExportingShopId(null);
    }
  };

  // 5. Handle Backup File Selection & Client-Side Verification
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRestoreFileError(null);
    setParsedBackup(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".json")) {
      setRestoreFileError(
        txt("শুধুমাত্র .json ব্যাকআপ ফাইল সাপোর্ট করে।", "Only .json backup files are supported.")
      );
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

  // 6. Handle Atomic Batch-Chunked Restore
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
            className="p-1 hover:opacity-80 transition-opacity cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Infrastructure & System Resource Telemetry Cards */}
      <SystemHealthCards
        systemHealth={systemHealth}
        healthLoading={healthLoading}
        onRefresh={fetchHealth}
      />

      {/* Header & Search */}
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
            {txt(
              "Inventarioya প্ল্যাটফর্মে নিবন্ধিত সকল মার্চেন্ট স্টোর",
              "All merchant stores registered on the Inventarioya platform"
            )}{" "}
            ({shops.length} {txt("টি", "total")})
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={txt(
              "নাম, ইমেইল বা টিয়ার দিয়ে খুঁজুন...",
              "Search by name, email, or tier..."
            )}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Merchant Shops Table Component */}
      <ShopTable
        filteredShops={filtered}
        exportingShopId={exportingShopId}
        onExportShop={handleExportShop}
        onRestoreClick={(shop) => {
          setShopToRestore(shop);
          setParsedBackup(null);
          setRestoreFileError(null);
          setRestoreConfirmInput("");
        }}
        onDeleteClick={(shop) => {
          setShopToDelete(shop);
          setConfirmNameInput("");
        }}
      />

      {/* Delete Shop Cascade Confirmation Modal Component */}
      {shopToDelete && (
        <DeleteShopModal
          shopToDelete={shopToDelete}
          onClose={() => {
            if (!isDeleting) {
              setShopToDelete(null);
              setConfirmNameInput("");
            }
          }}
          onConfirmDelete={handleDeleteShop}
          confirmNameInput={confirmNameInput}
          setConfirmNameInput={setConfirmNameInput}
          isDeleting={isDeleting}
        />
      )}

      {/* Restore Shop Safety Modal Component */}
      {shopToRestore && (
        <RestoreShopModal
          shopToRestore={shopToRestore}
          onClose={() => {
            if (!isRestoring) {
              setShopToRestore(null);
              setParsedBackup(null);
              setRestoreFileError(null);
              setRestoreConfirmInput("");
            }
          }}
          onFileSelect={handleFileSelect}
          restoreFileError={restoreFileError}
          parsedBackup={parsedBackup}
          restoreConfirmInput={restoreConfirmInput}
          setRestoreConfirmInput={setRestoreConfirmInput}
          onConfirmRestore={handleRestoreShop}
          isRestoring={isRestoring}
        />
      )}
    </main>
  );
}
