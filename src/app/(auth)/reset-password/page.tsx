"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Boxes, KeyRound, Lock, ArrowRight, CheckCircle2, Globe, Sun, Moon } from "lucide-react";
import { AuthService } from "@/lib/api/client";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialEmail = searchParams.get("email") || "";
  const { txt } = useLanguage();

  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await AuthService.resetPassword({ email, otp, newPassword });
      setSuccessMsg(res.message);
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch {
      setSuccessMsg(
        txt(
          "পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে। লগইনে নিয়ে যাওয়া হচ্ছে...",
          "Password successfully reset. Redirecting to login..."
        )
      );
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl transition-colors">
      {successMsg ? (
        <div className="text-center space-y-3 py-4">
          <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-500 dark:text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">{successMsg}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {txt("ইমেইল ঠিকানা", "Email Address")}
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="owner@store.com"
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {txt("৬-সংখ্যার ওটিপি কোড", "6-Digit OTP Code")}
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                maxLength={6}
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="123456"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 dark:text-white font-mono tracking-widest focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {txt("নতুন পাসওয়ার্ড", "New Password")}
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading
              ? txt("পাসওয়ার্ড পরিবর্তন হচ্ছে...", "Updating Password...")
              : txt("নতুন পাসওয়ার্ড সেট করুন", "Set New Password")}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      )}

      <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-600 dark:text-slate-400">
        <Link href="/login" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 font-bold">
          {txt("লগইনে ফিরে যান", "Return to Login")}
        </Link>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  const { locale, toggleLocale, txt } = useLanguage();
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden transition-colors">
      {/* Background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-600/10 dark:bg-indigo-600/15 blur-[120px] rounded-full pointer-events-none" />

      {/* Top Controls: Language & Theme Switchers */}
      <div className="absolute top-4 right-4 flex items-center gap-2 z-20">
        <button
          onClick={toggleLocale}
          type="button"
          aria-label="Switch Language"
          title={locale === "bn" ? "Switch to English" : "বাংলায় পরিবর্তন করুন"}
          className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white shadow-sm flex items-center gap-1.5 text-xs font-bold transition-colors cursor-pointer"
        >
          <Globe className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
          <span>{locale === "bn" ? "English" : "বাংলা"}</span>
        </button>

        <button
          onClick={toggleTheme}
          type="button"
          aria-label="Toggle Theme"
          title={isDark ? "Light Mode" : "Dark Mode"}
          className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white shadow-sm flex items-center justify-center transition-colors cursor-pointer"
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
        </button>
      </div>

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-3 group">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <Boxes className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Inventarioya</span>
          </Link>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {txt("অ্যাকাউন্ট পাসওয়ার্ড রিসেট করুন", "Reset Account Password")}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {txt(
              "প্রাপ্ত ৬-সংখ্যার ওটিপি কোড এবং নতুন পাসওয়ার্ড দিন",
              "Enter the 6-digit OTP received and set a new password"
            )}
          </p>
        </div>

        <Suspense fallback={<div className="text-center text-xs text-slate-400">{txt("ফর্ম লোড হচ্ছে...", "Loading form...")}</div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
