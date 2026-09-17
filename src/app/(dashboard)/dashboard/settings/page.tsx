"use client";

import { useState, useEffect } from "react";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { AuthService } from "@/lib/api/client";
import { User } from "@/types";
import { Settings, UserCheck, ShieldAlert, Trash2, Mail, Phone, Building, Save } from "lucide-react";

export default function SettingsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  useEffect(() => {
    async function loadMe() {
      try {
        const u = await AuthService.getMe();
        setUser(u);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadMe();
  }, []);

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "DELETE MY ACCOUNT") return;
    try {
      await AuthService.deleteAccount();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <DashboardHeader title="Shop Settings & Owner Profile" />

      <main className="p-6 space-y-6 max-w-4xl">
        {/* Profile Card */}
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white text-lg font-bold">
              {user?.name ? user.name[0] : "R"}
            </div>
            <div>
              <h3 className="text-base font-bold text-white">{user?.name || "Shop Administrator"}</h3>
              <p className="text-xs text-indigo-400 font-semibold uppercase">{user?.role || "Owner"}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-800 text-xs">
            <div>
              <label className="text-slate-400 block mb-1">Email Address</label>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-medium">
                {user?.email || "owner@inventarioya.com"}
              </div>
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Contact Phone</label>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-medium">
                {user?.phone || "+880 1711-223344"}
              </div>
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Shop / Business</label>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-medium">
                {user?.shopName || "Dhaka Mega Superstore"}
              </div>
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Cloud Sync</label>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-emerald-400 font-medium">
                Active (Flutter Mobile + Web)
              </div>
            </div>
          </div>
        </div>

        {/* Danger Zone: Account Deletion */}
        <div className="rounded-2xl bg-rose-950/20 border border-rose-500/30 p-6">
          <div className="flex items-center gap-3 mb-2">
            <ShieldAlert className="w-5 h-5 text-rose-400" />
            <h3 className="text-sm font-bold text-rose-300">Danger Zone: Permanent Account Deletion</h3>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed mb-4">
            Deleting your account is irreversible. All branches, POS checkout history, customer ledgers, and inventory catalog will be permanently purged from the servers.
          </p>

          <button
            onClick={() => setShowDeleteModal(true)}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow transition-colors flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete Account (DELETE /api/auth/me)
          </button>
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-rose-500/50 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-sm font-bold text-white mb-2">Confirm Account Destruction</h3>
            <p className="text-xs text-slate-300 mb-4">
              Please type <span className="text-rose-400 font-mono font-bold">DELETE MY ACCOUNT</span> below to proceed with immediate purge.
            </p>

            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="DELETE MY ACCOUNT"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono mb-4 focus:outline-none focus:border-rose-500"
            />

            <div className="flex justify-end gap-2 text-xs">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmText("");
                }}
                className="px-3.5 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== "DELETE MY ACCOUNT"}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-white font-bold transition-all"
              >
                Permanently Destroy Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
