"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Boxes, Lock, Mail, ArrowRight, AlertCircle, Globe, Sun, Moon } from "lucide-react";
import { AuthService } from "@/lib/api/client";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";

export default function LoginPage() {
  const router = useRouter();
  const { locale, toggleLocale, txt } = useLanguage();
  const { isDark, toggleTheme } = useTheme();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await AuthService.login({ email, password });
      const userRole = (res.user?.role || "").toLowerCase();

      if (userRole === "superadmin") {
        router.push("/superadmin");
      } else {
        // "admin" or "manager" navigate to dashboard
        router.push("/dashboard");
      }
    } catch (err: any) {
      const serverMsg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        txt("ভুল ইমেইল বা পাসওয়ার্ড। অনুগ্রহ করে তথ্য যাচাই করুন।", "Invalid email or password. Please check your credentials.");
      setError(serverMsg);
    } finally {
      setLoading(false);
    }
  };

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
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-3 group">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/30 group-hover:scale-105 transition-transform">
              <Boxes className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Inventarioya</span>
          </Link>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            {txt("পুনরায় স্বাগতম", "Welcome Back")}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {txt(
              "আপনার শপ ইনভেন্টরি, পিওএস বিলিং ও অ্যানালিটিক্সে সাইন ইন করুন",
              "Sign in to access your store inventory, billing POS, and analytics"
            )}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl relative z-10 transition-colors">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                {txt("ইমেইল ঠিকানা", "Email Address")}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700/80 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                  placeholder="name@store.com"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {txt("পাসওয়ার্ড", "Password")}
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 font-medium"
                >
                  {txt("ভুলে গেছেন? (OTP)", "Forgot? (OTP)")}
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700/80 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {loading ? txt("সাইন ইন হচ্ছে...", "Signing in...") : txt("সাইন ইন করুন", "Sign In")}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-600 dark:text-slate-400">
            {txt("এখনও কোনো শপ অ্যাকাউন্ট নেই?", "Don't have a shop account yet?")}{" "}
            <Link
              href="/register"
              className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 font-bold"
            >
              {txt("নতুন শপ নিবন্ধন করুন", "Register New Shop")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
