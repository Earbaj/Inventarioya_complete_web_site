"use client";

import { useState, useEffect } from "react";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { TrashService } from "@/lib/api/client";
import { TrashItem } from "@/types";
import { formatDate } from "@/lib/utils";
import { Trash2, RotateCcw, ShieldAlert, Sparkles, AlertCircle, CheckCircle2 } from "lucide-react";

export default function TrashPage() {
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
      setStatusMessage(`Restored ${item.name} successfully.`);
      setTimeout(() => setStatusMessage(""), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePermanentDelete = async (item: TrashItem) => {
    if (!confirm(`Are you sure you want to permanently delete "${item.name}"? This action cannot be undone.`)) {
      return;
    }
    try {
      await TrashService.permanentDelete(item.entityType, item.id);
      setTrashItems(trashItems.filter((i) => i.id !== item.id));
      setStatusMessage(`Permanently deleted ${item.name}.`);
      setTimeout(() => setStatusMessage(""), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleEmptyTrash = async () => {
    if (!confirm("Are you sure you want to permanently empty the entire Recycle Bin?")) {
      return;
    }
    try {
      await TrashService.emptyTrash();
      setTrashItems([]);
      setStatusMessage("Recycle bin emptied completely.");
      setTimeout(() => setStatusMessage(""), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCleanupAuditLogs = async () => {
    if (!confirm(`Purge system audit logs older than ${cleanupDays} days?`)) return;
    try {
      const res = await TrashService.cleanupAuditLogs(cleanupDays);
      setStatusMessage(res.message || `Audit logs older than ${cleanupDays} days cleaned.`);
      setTimeout(() => setStatusMessage(""), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <DashboardHeader title="Recycle Bin & Data Retention Recovery" />

      <main className="p-6 space-y-6 max-w-7xl">
        {statusMessage && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Action Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-white">Soft-Deleted Items</h3>
            <p className="text-xs text-slate-400">
              Recover accidentally deleted products, expenses, or categories within 30 days
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleEmptyTrash}
              disabled={trashItems.length === 0}
              className="px-4 py-2 bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-500/30 disabled:opacity-40 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Empty All Trash
            </button>
          </div>
        </div>

        {/* Trash Items Table */}
        <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Entity Type</th>
                  <th className="py-3 px-4">Item Name</th>
                  <th className="py-3 px-4">Metadata / Details</th>
                  <th className="py-3 px-4">Deleted At</th>
                  <th className="py-3 px-4">Deleted By</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {trashItems.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500">
                      Recycle Bin is currently empty.
                    </td>
                  </tr>
                ) : (
                  trashItems.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-800 text-slate-300">
                          {item.entityType}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-white">{item.name}</td>
                      <td className="py-3 px-4 text-slate-400">{item.details || "-"}</td>
                      <td className="py-3 px-4 text-slate-400">{formatDate(item.deletedAt)}</td>
                      <td className="py-3 px-4 text-slate-300">{item.deletedBy || "Admin"}</td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <button
                          onClick={() => handleRestore(item)}
                          className="px-2.5 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 text-xs font-medium inline-flex items-center gap-1 transition-colors"
                        >
                          <RotateCcw className="w-3 h-3" />
                          Restore
                        </button>
                        <button
                          onClick={() => handlePermanentDelete(item)}
                          className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-medium inline-flex items-center gap-1 transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                          Purge
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
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">System Audit Log Retention</h4>
              <p className="text-xs text-slate-400">
                Purge historical audit logs and optimize database storage
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mt-4 pt-4 border-t border-slate-800">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-300">Clean logs older than:</span>
              <select
                aria-label="Retention Period"
                value={cleanupDays}
                onChange={(e) => setCleanupDays(Number(e.target.value))}
                className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-white text-xs focus:outline-none"
              >
                <option value={30}>30 Days</option>
                <option value={60}>60 Days</option>
                <option value={90}>90 Days (Recommended)</option>
                <option value={180}>180 Days</option>
              </select>
            </div>

            <button
              onClick={handleCleanupAuditLogs}
              className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-colors"
            >
              Run Audit Log Cleanup
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
