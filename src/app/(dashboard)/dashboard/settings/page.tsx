"use client";

import { useState, useEffect } from "react";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { AuthService } from "@/lib/api/client";
import { User, UpdateProfilePayload } from "@/types";
import {
  ShieldAlert,
  Trash2,
  Mail,
  Phone,
  Building,
  Save,
  MapPin,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Store,
  RefreshCw,
  ShieldCheck,
  Sun,
  Moon,
  Laptop,
  Globe,
} from "lucide-react";
import Link from "next/link";
import { useTheme } from "@/context/ThemeContext";
import { useLanguage } from "@/context/LanguageContext";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { locale, setLocale, t } = useLanguage();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Form states for PUT /api/auth/profile
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [logoUrl, setLogoUrl] = useState("");

  // Feedback states
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Delete account modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  // Image load error fallback state
  const [logoError, setLogoError] = useState(false);

  useEffect(() => {
    async function loadMe() {
      try {
        const u = await AuthService.getMe();
        setUser(u);
        setName(u?.name || u?.shopName || "");
        setPhone(u?.phone || "");
        setAddress(u?.address || "");
        setLogoUrl(u?.logoUrl || "");
      } catch (err) {
        console.error("Failed to load user profile:", err);
      } finally {
        setLoading(false);
      }
    }
    loadMe();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setErrorMessage("Shop Name is required.");
      return;
    }

    setIsSaving(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const payload: UpdateProfilePayload = {
        name: name.trim(),
        phone: phone.trim() || undefined,
        address: address.trim() || undefined,
        logoUrl: logoUrl.trim() || undefined,
      };

      const res = await AuthService.updateProfile(payload);
      const updatedUser = res.user || {
        ...user,
        ...payload,
      };

      const finalUser = {
        ...user,
        ...updatedUser,
        name: payload.name,
        shopName: payload.name,
        ownerName:
          user?.ownerName ||
          (user?.name &&
          user.name !== payload.name &&
          !user.name.toLowerCase().includes("shop") &&
          !user.name.toLowerCase().includes("store")
            ? user.name
            : undefined) ||
          (user?.email ? user.email.split("@")[0] : undefined),
        phone: payload.phone ?? user?.phone,
        address: payload.address ?? user?.address,
        logoUrl: payload.logoUrl ?? user?.logoUrl,
      };

      setUser(finalUser);
      setSuccessMessage(res.message || "Shop profile updated successfully! (দোকানের তথ্য সফলভাবে আপডেট করা হয়েছে)");
      setLogoError(false);

      // Dispatch event so other components (e.g. sidebar, dashboard, print templates) can refresh
      if (typeof window !== "undefined") {
        localStorage.setItem("inventarioya_user", JSON.stringify(finalUser));
        window.dispatchEvent(new Event("storage"));
      }
    } catch (err: any) {
      setErrorMessage(
        err.message || "Failed to update profile. Please check your network and try again."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetForm = () => {
    if (user) {
      setName(user.name || user.shopName || "");
      setPhone(user.phone || "");
      setAddress(user.address || "");
      setLogoUrl(user.logoUrl || "");
      setLogoError(false);
      setSuccessMessage("");
      setErrorMessage("");
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "DELETE MY ACCOUNT") return;
    try {
      await AuthService.deleteAccount();
    } catch (err) {
      console.error("Failed to delete account:", err);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <DashboardHeader title="Shop Settings & Owner Profile (শপ সেটিংস ও প্রোফাইল)" />

      <main className="p-4 sm:p-6 space-y-6 max-w-5xl">
        {/* Profile Overview Header Card */}
        <div className="rounded-3xl bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-900 border border-indigo-500/30 p-5 sm:p-6 shadow-xl relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 relative z-10">
            <div className="flex items-center gap-4">
              <div className="relative">
                {logoUrl && !logoError ? (
                  <img
                    src={logoUrl}
                    alt="Shop Logo"
                    onError={() => setLogoError(true)}
                    className="w-16 h-16 rounded-2xl object-cover bg-slate-950 border-2 border-indigo-500/50 shadow-md"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-indigo-600/30">
                    {name ? name[0].toUpperCase() : user?.name ? user.name[0].toUpperCase() : "S"}
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center">
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                    {name || user?.name || "Shop Administrator"}
                  </h2>
                  <span
                    className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border ${
                      user?.subscriptionTier === "premium"
                        ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                        : "bg-indigo-500/20 text-indigo-300 border-indigo-500/30"
                    }`}
                  >
                    {user?.subscriptionTier === "premium" ? "PREMIUM" : "FREE TIER"}
                  </span>
                </div>

                <p className="text-xs text-slate-300 mt-0.5 flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-indigo-400 uppercase tracking-wider">
                    {user?.role || "Owner"}
                  </span>
                  <span>•</span>
                  <span className="text-slate-400">{user?.email || "owner@inventarioya.com"}</span>
                  {phone && (
                    <>
                      <span>•</span>
                      <span className="text-slate-400 font-mono">{phone}</span>
                    </>
                  )}
                </p>

                {address && (
                  <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-indigo-400 shrink-0" />
                    <span>{address}</span>
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
              <Link
                href="/dashboard/subscriptions"
                className="px-3.5 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 text-xs font-semibold transition-all flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>Subscription Plan</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Update Shop Details Form */}
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 sm:p-6 shadow-lg">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Store className="w-4 h-4 text-indigo-400" />
                Update Shop & Profile Information (শপের তথ্য পরিবর্তন)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Update your business name, contact phone, store address, and receipt logo URL.
              </p>
            </div>

            <span className="text-[10px] font-mono text-slate-500 hidden sm:inline-block">
              PUT /api/auth/profile
            </span>
          </div>

          {successMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
              <div className="flex-1 font-medium">{successMessage}</div>
            </div>
          )}

          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <div className="flex-1 font-medium">{errorMessage}</div>
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Shop Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-indigo-400" />
                  Shop / Business Name (দোকান বা শপের নাম) <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rahim Super Store"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  This name appears on invoices, receipts, and customer ledgers.
                </span>
              </div>

              {/* Contact Phone */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-indigo-400" />
                  Contact Phone (যোগাযোগের ফোন নম্বর)
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 01700000000"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Customer support phone printed on POS customer receipts.
                </span>
              </div>

              {/* Shop Physical Address */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                  Shop Address (দোকানের ঠিকানা)
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. Shop 42, Level 2, Mirpur-10, Dhaka"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Physical location printed at the header of sales invoices.
                </span>
              </div>

              {/* Logo URL */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-indigo-400" />
                  Shop Logo URL (লোগো ছবির লিঙ্ক)
                </label>
                <input
                  type="url"
                  value={logoUrl}
                  onChange={(e) => {
                    setLogoUrl(e.target.value);
                    setLogoError(false);
                  }}
                  placeholder="https://example.com/logo.png"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Public direct image URL (PNG/JPG) for branding receipts.
                </span>
              </div>
            </div>

            {/* Read-Only Account Identifiers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-800/80">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                  Account Login Email (অ্যাকাউন্ট ইমেইল)
                </label>
                <div className="w-full bg-slate-950/60 border border-slate-800/70 rounded-xl px-3.5 py-2.5 text-xs text-slate-400 flex items-center justify-between">
                  <span>{user?.email || "owner@inventarioya.com"}</span>
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                    Read-Only
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
                  Account Role & Permissions
                </label>
                <div className="w-full bg-slate-950/60 border border-slate-800/70 rounded-xl px-3.5 py-2.5 text-xs text-slate-400 flex items-center justify-between">
                  <span className="capitalize font-semibold text-indigo-300">
                    {user?.role || "Owner"} Account
                  </span>
                  <span className="text-[10px] text-emerald-400 font-medium">
                    Full Admin Control
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={handleResetForm}
                disabled={isSaving}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 text-xs font-semibold transition-colors flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset (পূর্বাবস্থায় ফেরান)</span>
              </button>

              <button
                type="submit"
                disabled={isSaving || !name.trim()}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-600/30 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? "Saving changes..." : "Save Shop Profile (পরিবর্তন সেভ করুন)"}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Theme & Visual Appearance Section */}
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 sm:p-6 shadow-lg">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sun className="w-4 h-4 text-amber-400" />
                Theme & Visual Appearance (থিম ও ভিজ্যুয়াল স্টাইল)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Choose between Dark mode, Light (White) mode, or sync with your operating system preference.
              </p>
            </div>
            <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-slate-800 text-indigo-400 font-semibold border border-slate-700">
              Active: {theme.toUpperCase()}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {/* Dark Mode Option */}
            <button
              type="button"
              onClick={() => setTheme("dark")}
              className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between relative overflow-hidden group ${
                theme === "dark"
                  ? "bg-indigo-600/10 border-indigo-500 shadow-md shadow-indigo-500/10 ring-1 ring-indigo-500"
                  : "bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition-transform">
                  <Moon className="w-5 h-5 text-indigo-400" />
                </div>
                {theme === "dark" && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-indigo-400 bg-indigo-500/20 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3 h-3" /> Selected
                  </span>
                )}
              </div>
              <div>
                <p className="text-xs font-bold text-white">Dark Mode (ডার্ক মোড)</p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Deep slate & dark contrast, comfortable for long hours.
                </p>
              </div>
            </button>

            {/* Light Mode Option */}
            <button
              type="button"
              onClick={() => setTheme("light")}
              className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between relative overflow-hidden group ${
                theme === "light"
                  ? "bg-indigo-600/10 border-indigo-500 shadow-md shadow-indigo-500/10 ring-1 ring-indigo-500"
                  : "bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 group-hover:scale-105 transition-transform">
                  <Sun className="w-5 h-5 text-amber-500" />
                </div>
                {theme === "light" && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-indigo-400 bg-indigo-500/20 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3 h-3" /> Selected
                  </span>
                )}
              </div>
              <div>
                <p className="text-xs font-bold text-white">Light Mode (হোয়াইট মোড)</p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Crisp white surfaces, clean high-contrast daytime view.
                </p>
              </div>
            </button>

            {/* System Default Option */}
            <button
              type="button"
              onClick={() => setTheme("system")}
              className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between relative overflow-hidden group ${
                theme === "system"
                  ? "bg-indigo-600/10 border-indigo-500 shadow-md shadow-indigo-500/10 ring-1 ring-indigo-500"
                  : "bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 group-hover:scale-105 transition-transform">
                  <Laptop className="w-5 h-5 text-slate-300" />
                </div>
                {theme === "system" && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-indigo-400 bg-indigo-500/20 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3 h-3" /> Selected
                  </span>
                )}
              </div>
              <div>
                <p className="text-xs font-bold text-white">System (সিস্টেম অনুসারী)</p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Automatically synchronize with your device setting.
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Language Preferences */}
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 sm:p-6 shadow-lg">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Globe className="w-4 h-4 text-indigo-400" />
                {t("settings.langTitle")}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {t("settings.langSub")}
              </p>
            </div>
            <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-slate-800 text-indigo-400 font-semibold border border-slate-700">
              {t("settings.langActive")}: {locale === "bn" ? "বাংলা (BN)" : "English (EN)"}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Bangla Option */}
            <button
              type="button"
              onClick={() => setLocale("bn")}
              className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between relative overflow-hidden group cursor-pointer ${
                locale === "bn"
                  ? "bg-indigo-600/10 border-indigo-500 shadow-md shadow-indigo-500/10 ring-1 ring-indigo-500"
                  : "bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-sm group-hover:scale-105 transition-transform">
                  বাং
                </div>
                {locale === "bn" && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-indigo-400 bg-indigo-500/20 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3 h-3" /> নির্বাচিত (Selected)
                  </span>
                )}
              </div>
              <div>
                <p className="text-xs font-bold text-white">বাংলা (Bengali)</p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  দোকানের হিসাব, বিলিং, কাস্টমার খাতা ও রিপোর্ট সম্পূর্ণ বাংলায় পরিচালনা করুন।
                </p>
              </div>
            </button>

            {/* English Option */}
            <button
              type="button"
              onClick={() => setLocale("en")}
              className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between relative overflow-hidden group cursor-pointer ${
                locale === "en"
                  ? "bg-indigo-600/10 border-indigo-500 shadow-md shadow-indigo-500/10 ring-1 ring-indigo-500"
                  : "bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold text-xs group-hover:scale-105 transition-transform">
                  EN
                </div>
                {locale === "en" && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-indigo-400 bg-indigo-500/20 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3 h-3" /> Selected
                  </span>
                )}
              </div>
              <div>
                <p className="text-xs font-bold text-white">English (ইংরেজি)</p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Manage POS billing, customer ledgers, and inventory in international English.
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Danger Zone: Account Deletion */}
        <div className="rounded-2xl bg-rose-950/20 border border-rose-500/30 p-5 sm:p-6">
          <div className="flex items-center gap-3 mb-2">
            <ShieldAlert className="w-5 h-5 text-rose-400" />
            <h3 className="text-sm font-bold text-rose-300">Danger Zone: Permanent Account Deletion</h3>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed mb-4">
            Deleting your account is irreversible. All branches, POS checkout history, customer ledgers, and inventory catalog will be permanently purged from the servers.
          </p>

          <button
            onClick={() => setShowDeleteModal(true)}
            className="w-full sm:w-auto justify-center px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow transition-colors flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete Account (DELETE /api/auth/me)
          </button>
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-rose-500/50 rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
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
