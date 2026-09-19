"use client";

import { useState, useEffect } from "react";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { TrashService } from "@/lib/api/client";
import { TrashItem } from "@/types";
import { formatDate } from "@/lib/utils";
import { Trash2, RotateCcw, ShieldAlert, Sparkles, AlertCircle, CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function TrashPage() {
  const { txt } = useLanguage();
  const [trashItems, setTrashItems] = useState<TrashItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState("");
  const [cleanupDays, setCleanupDays] = useState(90);

  useEffect(() => {
    async function loadTrash() {
      try {
        const data = await TrashService.getTrash();
        setTrashItems(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadTrash();
  }, []);

  const handleRestore = async (item: TrashItem) => {
    try {
      await TrashService.restoreItem(item.entityType, item.id);
      setTrashItems(trashItems.filter((i) => i.id !== item.id));
      setStatusMessage(txt(`"${item.name}" সফলভাবে পুনরুদ্ধার করা হয়েছে।`, `Restored ${item.name} successfully.`));
      setTimeout(() => setStatusMessage(""), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePermanentDelete = async (item: TrashItem) => {
    if (
      !confirm(
        txt(
          `আপনি কি নিশ্চিত যে আপনি স্থায়ীভাবে "${item.name}" মুছে ফেলতে চান? এটি আর ফিরিয়ে আনা যাবে না।`,
          `Are you sure you want to permanently delete "${item.name}"? This action cannot be undone.`
        )
      )
    ) {
      return;
    }
    try {
      await TrashService.permanentDelete(item.entityType, item.id);
      setTrashItems(trashItems.filter((i) => i.id !== item.id));
      setStatusMessage(txt(`স্থায়ীভাবে মুছে ফেলা হয়েছে: ${item.name}`, `Permanently deleted ${item.name}.`));
      setTimeout(() => setStatusMessage(""), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleEmptyTrash = async () => {
    if (!confirm(txt("আপনি কি নিশ্চিত যে সম্পূর্ণ রিসাইকেল বিন স্থায়ীভাবে খালি করতে চান?", "Are you sure you want to permanently empty the entire Recycle Bin?"))) {
      return;
    }
    try {
      await TrashService.emptyTrash();
      setTrashItems([]);
      setStatusMessage(txt("রিসাইকেল বিন সম্পূর্ণ খালি করা হয়েছে।", "Recycle bin emptied completely."));
      setTimeout(() => setStatusMessage(""), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCleanupAuditLogs = async () => {
    if (!confirm(txt(`${cleanupDays} দিনের পুরোনো সিস্টেম অডিট লগ মুছে ফেলতে চান?`, `Purge system audit logs older than ${cleanupDays} days?`))) return;
    try {
      const res = await TrashService.cleanupAuditLogs(cleanupDays);
      setStatusMessage(res.message || txt(`অডিট লগ সফলভাবে মুছে ফেলা হয়েছে।`, `Audit logs older than ${cleanupDays} days cleaned.`));
      setTimeout(() => setStatusMessage(""), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <DashboardHeader title={txt("রিসাইকেল বিন ও ডেটা পুনরুদ্ধার", "Recycle Bin & Data Retention Recovery")} />

      <main className="p-4 sm:p-6 space-y-6 max-w-7xl">
        {statusMessage && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Action Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold dark:text-white text-slate-900">{txt("মুছে ফেলা আইটেমসমূহ", "Soft-Deleted Items")}</h3>
            <p className="text-xs dark:text-slate-400 text-slate-500">
              {txt("ভুলবশত মুছে ফেলা পণ্য, খরচ বা ক্যাটাগরি ৩০ দিনের মধ্যে পুনরুদ্ধার করুন", "Recover accidentally deleted products, expenses, or categories within 30 days")}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleEmptyTrash}
              disabled={trashItems.length === 0}
              className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 disabled:opacity-40 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              {txt("বিন খালি করুন", "Empty All Trash")}
            </button>
          </div>
        </div>

        {/* Trash Items Table */}
        <div className="rounded-2xl dark:bg-slate-900 bg-white border dark:border-slate-800 border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px] text-left text-xs">
              <thead className="dark:bg-slate-950/60 bg-slate-50 dark:text-slate-400 text-slate-500 uppercase tracking-wider font-semibold border-b dark:border-slate-800 border-slate-200">
                <tr>
                  <th className="py-3 px-4">{txt("আইটেমের ধরন", "Entity Type")}</th>
                  <th className="py-3 px-4">{txt("নাম", "Item Name")}</th>
                  <th className="py-3 px-4">{txt("বিবরণ", "Metadata / Details")}</th>
                  <th className="py-3 px-4">{txt("মুছে ফেলার তারিখ", "Deleted At")}</th>
                  <th className="py-3 px-4">{txt("মুছেছেন", "Deleted By")}</th>
                  <th className="py-3 px-4 text-right">{txt("অ্যাকশন", "Actions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y dark:divide-slate-800 divide-slate-100">
                {trashItems.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500">
                      {txt("রিসাইকেল বিন বর্তমানে খালি।", "Recycle Bin is currently empty.")}
                    </td>
                  </tr>
                ) : (
                  trashItems.map((item) => (
                    <tr key={item.id} className="dark:hover:bg-slate-800/40 hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase dark:bg-slate-800 bg-slate-100 dark:text-slate-300 text-slate-700">
                          {item.entityType}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-semibold dark:text-white text-slate-900">{item.name}</td>
                      <td className="py-3 px-4 dark:text-slate-400 text-slate-500">{item.details || "-"}</td>
                      <td className="py-3 px-4 dark:text-slate-400 text-slate-500">{formatDate(item.deletedAt)}</td>
                      <td className="py-3 px-4 dark:text-slate-300 text-slate-700">{item.deletedBy || "Admin"}</td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <button
                          onClick={() => handleRestore(item)}
                          className="px-2.5 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-medium inline-flex items-center gap-1 transition-colors"
                        >
                          <RotateCcw className="w-3 h-3" />
                          {txt("পুনরুদ্ধার", "Restore")}
                        </button>
                        <button
                          onClick={() => handlePermanentDelete(item)}
                          className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-medium inline-flex items-center gap-1 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          {txt("মুছুন", "Purge")}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Audit Log Cleanup Section */}
        <div className="rounded-2xl dark:bg-slate-900 bg-white border dark:border-slate-800 border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 dark:text-amber-400 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold dark:text-white text-slate-900">{txt("সিস্টেম অডিট লগ ডেটা নীতি", "System Audit Log Retention")}</h4>
              <p className="text-xs dark:text-slate-400 text-slate-500">
                {txt("পুরোনো অডিট লগ মুছে ডেটাবেজ স্টোরেজ অপ্টিমাইজ করুন", "Purge historical audit logs and optimize database storage")}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mt-4 pt-4 border-t dark:border-slate-800 border-slate-100">
            <div className="flex items-center gap-2 text-xs">
              <span className="dark:text-slate-300 text-slate-700">{txt("এর চেয়ে পুরোনো লগ মুছুন:", "Clean logs older than:")}</span>
              <select
                aria-label="Retention Period"
                value={cleanupDays}
                onChange={(e) => setCleanupDays(Number(e.target.value))}
                className="dark:bg-slate-950 bg-slate-50 border dark:border-slate-800 border-slate-300 rounded-lg px-3 py-1.5 dark:text-white text-slate-900 text-xs focus:outline-none"
              >
                <option value={30}>{txt("৩০ দিন", "30 Days")}</option>
                <option value={60}>{txt("৬০ দিন", "60 Days")}</option>
                <option value={90}>{txt("৯০ দিন (সুপারিশকৃত)", "90 Days (Recommended)")}</option>
                <option value={180}>{txt("১৮০ দিন", "180 Days")}</option>
              </select>
            </div>

            <button
              onClick={handleCleanupAuditLogs}
              className="px-4 py-1.5 dark:bg-slate-800 bg-slate-100 hover:dark:bg-slate-700 hover:bg-slate-200 dark:text-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
            >
              {txt("অডিট লগ পরিষ্কার করুন", "Run Audit Log Cleanup")}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
