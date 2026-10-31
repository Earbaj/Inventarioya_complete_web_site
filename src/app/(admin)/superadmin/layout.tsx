"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ShieldAlert,
  LayoutDashboard,
  Building2,
  CreditCard,
  LogOut,
  Menu,
  X,
  Globe,
} from "lucide-react";
import { AuthService } from "@/lib/api/client";
import { useLanguage } from "@/context/LanguageContext";

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { locale, toggleLocale, txt } = useLanguage();
  const [user, setUser] = useState<any>(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    const token = AuthService.getToken();
    const currentUser = AuthService.getCurrentUser();

    if (!token || !currentUser) {
      setIsAuthenticated(false);
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    if (currentUser.role?.toLowerCase() !== "superadmin") {
      setIsAuthenticated(false);
      router.replace("/dashboard");
      return;
    }

    // Keep edge/middleware cookie in sync
    if (typeof document !== "undefined" && !document.cookie.includes("inventarioya_auth_token=")) {
      document.cookie = `inventarioya_auth_token=${token}; path=/; max-age=604800; SameSite=Lax`;
    }

    setUser(currentUser);
    setIsAuthenticated(true);
  }, [router, pathname]);

  if (!isAuthenticated) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-950 text-white">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-xs text-slate-400 font-medium tracking-wide">
          {locale === "bn" ? "সুপার অ্যাডমিন অ্যাক্সেস যাচাই করা হচ্ছে..." : "Verifying SuperAdmin access..."}
        </p>
      </div>
    );
  }

  const navItems = [
    { name: txt("প্ল্যাটফর্ম মেট্রিক্স", "Platform Metrics"), href: "/superadmin", icon: LayoutDashboard },
    { name: txt("নিবন্ধিত শপসমূহ", "Registered Shops"), href: "/superadmin/shops", icon: Building2 },
    { name: txt("পেন্ডিং অনুমোদন", "Pending Approvals"), href: "/superadmin/payments", icon: CreditCard },
  ];

  return (
    <div className="h-screen w-full overflow-hidden bg-slate-950 flex text-slate-100 relative">
      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setIsMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* SuperAdmin Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-amber-500/20 flex flex-col h-[100dvh] max-h-[100dvh] shrink-0 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isMobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
      >
        <div className="h-16 shrink-0 px-5 border-b border-amber-500/20 flex items-center justify-between">
          <Link
            href="/superadmin"
            onClick={() => setIsMobileOpen(false)}
            className="flex items-center gap-2.5"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-600 flex items-center justify-center shadow-lg shadow-amber-600/30">
              <ShieldAlert className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-sm tracking-tight text-white block">SuperAdmin</span>
              <span className="text-[10px] text-amber-400 font-medium tracking-wider uppercase block">
                Platform Console
              </span>
            </div>
          </Link>

          {/* Close button on mobile */}
          <button
            onClick={() => setIsMobileOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto px-3 py-4 space-y-1 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? "bg-amber-600 text-white shadow"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>

        {/* Sidebar Footer with Logout & Lang Switcher */}
        <div className="shrink-0 p-3 pb-8 sm:pb-3 border-t border-slate-800 bg-slate-950/80">
          <div className="flex items-center justify-between px-2 py-1">
            <div className="truncate pr-1">
              <p className="text-xs font-bold text-white truncate">
                {user?.name || "SuperAdmin"}
              </p>
              <p className="text-[10px] text-amber-400 font-mono truncate">
                {user?.email || "Platform Root"}
              </p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={toggleLocale}
                title={locale === "bn" ? "Switch to English" : "বাংলায় পরিবর্তন করুন"}
                className="px-1.5 py-1 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800 text-[10px] font-bold transition-colors cursor-pointer"
              >
                {locale === "bn" ? "EN" : "বাং"}
              </button>
              <button
                onClick={() => AuthService.logout()}
                title={txt("লগআউট", "Sign Out")}
                className="px-2 py-1 rounded-lg text-slate-300 hover:text-rose-400 hover:bg-rose-500/10 border border-slate-700/60 transition-colors cursor-pointer flex items-center gap-1"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-400" />
                <span className="text-[11px] font-semibold text-rose-400 sm:hidden">{locale === "bn" ? "লগআউট" : "Exit"}</span>
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area with Header Bar */}
      <div className="flex-1 flex flex-col h-screen min-w-0 overflow-y-auto overflow-x-hidden">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 h-14 shrink-0 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md px-3 sm:px-8 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Mobile Hamburger */}
            <button
              onClick={() => setIsMobileOpen(true)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden transition-colors cursor-pointer"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <span className="text-xs font-semibold text-slate-300 truncate max-w-[120px] xs:max-w-none">
                {txt("প্ল্যাটফর্ম ব্যাকএন্ড সচল", "Platform Backend Online")}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto no-scrollbar py-1 shrink min-w-0 pr-1">
            <button
              onClick={toggleLocale}
              title={locale === "bn" ? "Switch to English" : "বাংলায় পরিবর্তন করুন"}
              className="px-2.5 py-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-amber-400 border border-slate-700 transition-all flex items-center gap-1 text-xs font-bold shrink-0 shadow-sm cursor-pointer whitespace-nowrap"
            >
              <Globe className="w-3.5 h-3.5 text-amber-500" />
              <span>{locale === "bn" ? "EN" : "বাং"}</span>
            </button>

            <div className="flex items-center gap-1.5 text-xs text-slate-400 shrink-0 bg-slate-800/60 px-2.5 py-1 rounded-lg border border-slate-700/60 whitespace-nowrap">
              <span className="font-medium text-slate-200">{user?.name || "SuperAdmin"}</span>
              <span className="text-slate-600 hidden xs:inline">•</span>
              <span className="text-amber-400 font-mono text-[11px] hidden xs:inline">
                {user?.email || "Platform Root"}
              </span>
            </div>

            <button
              onClick={() => AuthService.logout()}
              className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 whitespace-nowrap"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{txt("লগআউট", "Sign Out")}</span>
            </button>
          </div>
        </header>

        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}
