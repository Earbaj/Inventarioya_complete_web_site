"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Boxes,
  LayoutDashboard,
  ShoppingCart,
  ReceiptText,
  Package,
  Layers,
  Truck,
  Wallet,
  Building2,
  Users,
  BrainCircuit,
  Trash2,
  CreditCard,
  Settings,
  LogOut,
  Lock,
  Sparkles,
  X,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
  PanelLeftClose,
  Globe,
} from "lucide-react";
import { AuthService } from "@/lib/api/client";
import { User } from "@/types";
import { useSidebar } from "@/context/SidebarContext";
import { useTheme } from "@/context/ThemeContext";
import { useLanguage } from "@/context/LanguageContext";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const {
    isMobileOpen,
    setIsMobileOpen,
    isOpen,
    setIsOpen,
    isCollapsed,
    toggleCollapse,
  } = useSidebar();
  const { isDark, toggleTheme } = useTheme();
  const { locale, toggleLocale, t } = useLanguage();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const u = AuthService.getCurrentUser();
    setUser(u);
  }, []);

  const role = (user?.role || "admin").toLowerCase();
  const tier = (user?.subscriptionTier || "free").toLowerCase();
  const isFreeTier = tier === "free";
  const isManager = role === "manager";

  // Sidebar subscription remaining days
  let daysRemaining: number | null = null;
  if (!isFreeTier && user?.subscriptionExpiresAt) {
    const diff = Math.ceil(
      (new Date(user.subscriptionExpiresAt).getTime() - Date.now()) /
        (1000 * 60 * 60 * 24)
    );
    if (diff > 0) daysRemaining = diff;
  }

  // Free Tier Restricted Feature Keys
  const isFeatureRestrictedByPlan = (href: string) => {
    if (!isFreeTier) return false;
    const restrictedHrefs = [
      "/dashboard/ai-advisor",
      "/dashboard/categories",
      "/dashboard/suppliers",
      "/dashboard/expenses",
      "/dashboard/branches",
      "/dashboard/trash",
    ];
    return restrictedHrefs.includes(href);
  };

  // Nav definitions with localization
  const allOperations = [
    { name: t("nav.overview"), href: "/dashboard", icon: LayoutDashboard },
    { name: t("nav.pos"), href: "/dashboard/pos", icon: ShoppingCart, highlight: true },
    { name: t("nav.sales"), href: "/dashboard/sales", icon: ReceiptText },
    { name: t("nav.inventory"), href: "/dashboard/inventory", icon: Package },
    { name: t("nav.categories"), href: "/dashboard/categories", icon: Layers, proOnly: true },
    { name: t("nav.suppliers"), href: "/dashboard/suppliers", icon: Truck, proOnly: true, adminOnly: true },
    { name: t("nav.expenses"), href: "/dashboard/expenses", icon: Wallet, proOnly: true, adminOnly: true },
    { name: t("nav.branches"), href: "/dashboard/branches", icon: Building2, proOnly: true, adminOnly: true },
    { name: t("nav.staff"), href: "/dashboard/staff", icon: Users, adminOnly: true },
    { name: t("nav.customers"), href: "/dashboard/customers", icon: Users },
  ];

  const allIntelligence = [
    { name: t("nav.aiAdvisor"), href: "/dashboard/ai-advisor", icon: BrainCircuit, aiBadge: true, proOnly: true, adminOnly: true },
    { name: t("nav.trash"), href: "/dashboard/trash", icon: Trash2, proOnly: true, adminOnly: true },
    { name: t("nav.subscriptions"), href: "/dashboard/subscriptions", icon: CreditCard, adminOnly: true },
    { name: t("nav.settings"), href: "/dashboard/settings", icon: Settings },
  ];

  // Filter based on role (Manager vs Admin)
  const visibleOperations = allOperations.filter((item) => {
    if (isManager && item.adminOnly) return false;
    return true;
  });

  const visibleIntelligence = allIntelligence.filter((item) => {
    if (isManager && item.adminOnly) return false;
    return true;
  });

  const handleNavClick = (e: React.MouseEvent, href: string, isLocked: boolean) => {
    setIsMobileOpen(false);
    if (isLocked) {
      e.preventDefault();
      router.push("/dashboard/subscriptions?upgrade=required");
    }
  };

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setIsMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 bg-slate-900 border-r border-slate-800 flex flex-col h-screen transition-all duration-300 ease-in-out lg:static lg:translate-x-0 ${
          // Mobile open/close
          isMobileOpen
            ? "translate-x-0 shadow-2xl w-64"
            : "-translate-x-full lg:translate-x-0"
        } ${
          // Desktop hide / expand / mini-collapse
          !isOpen
            ? "lg:w-0 lg:overflow-hidden lg:border-r-0 lg:p-0 lg:opacity-0 lg:pointer-events-none"
            : isCollapsed
            ? "lg:w-[72px] lg:opacity-100"
            : "lg:w-64 lg:opacity-100"
        }`}
      >
        {/* Brand Header */}
        <div
          className={`h-16 border-b border-slate-800 flex items-center transition-all ${
            isCollapsed ? "justify-center px-2" : "justify-between px-4 sm:px-5"
          }`}
        >
          {isCollapsed ? (
            <div className="flex flex-col items-center gap-1">
              <Link
                href="/dashboard"
                className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-600/30 hover:scale-105 transition-transform"
                title="Inventarioya Dashboard"
              >
                <Boxes className="w-5 h-5 text-white" />
              </Link>
            </div>
          ) : (
            <>
              <Link
                href="/dashboard"
                onClick={() => setIsMobileOpen(false)}
                className="flex items-center gap-2.5 truncate"
              >
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-600/30 shrink-0">
                  <Boxes className="w-5 h-5 text-white" />
                </div>
                <div className="truncate">
                  <span className="font-bold text-base tracking-tight text-white block truncate">
                    {t("common.appName")}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-indigo-400 font-medium tracking-wider uppercase">
                      {role === "admin"
                        ? locale === "bn"
                          ? "অ্যাডমিন"
                          : "Admin"
                        : locale === "bn"
                        ? "ম্যানেজার"
                        : "Manager"}
                    </span>
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                        isFreeTier
                          ? "bg-slate-800 text-slate-400"
                          : "bg-emerald-500/20 text-emerald-400"
                      }`}
                    >
                      {tier === "free"
                        ? locale === "bn"
                          ? "ফ্রি"
                          : "Free"
                        : locale === "bn"
                        ? "প্রিমিয়াম"
                        : "Premium"}
                      {daysRemaining !== null &&
                        ` • ${daysRemaining}${locale === "bn" ? " দিন" : "d"}`}
                    </span>
                  </div>
                </div>
              </Link>

              {/* Action buttons: Desktop collapse/hide + Mobile close */}
              <div className="flex items-center gap-1 shrink-0">
                {/* Desktop Collapse to Mini Button */}
                <button
                  onClick={toggleCollapse}
                  className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                  title={t("nav.collapseSidebar")}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {/* Desktop Full Hide Button */}
                <button
                  onClick={() => setIsOpen(false)}
                  className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
                  title={t("nav.hideSidebar")}
                >
                  <PanelLeftClose className="w-4 h-4" />
                </button>

                {/* Mobile Close Button */}
                <button
                  onClick={() => setIsMobileOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden transition-colors cursor-pointer"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </>
          )}
        </div>

        {/* Nav List */}
        <div
          className={`flex-1 overflow-y-auto space-y-4 py-4 ${
            isCollapsed ? "px-2" : "px-3"
          }`}
        >
          <div>
            {!isCollapsed && (
              <span className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-2">
                {t("nav.operations")}
              </span>
            )}
            <nav className="space-y-1">
              {visibleOperations.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                const isLocked = isFeatureRestrictedByPlan(item.href);

                return (
                  <div key={item.href} className="relative group">
                    <Link
                      href={item.href}
                      onClick={(e) => handleNavClick(e, item.href, isLocked)}
                      className={`flex items-center rounded-lg text-xs font-medium transition-all ${
                        isCollapsed
                          ? "justify-center p-2.5"
                          : "justify-between px-3 py-2"
                      } ${
                        isLocked
                          ? "opacity-60 text-slate-400 hover:bg-slate-800/40 hover:opacity-80"
                          : isActive
                          ? "bg-indigo-600 text-white shadow-sm"
                          : item.highlight
                          ? "text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300"
                          : "text-slate-300 hover:bg-slate-800 hover:text-white"
                      }`}
                    >
                      <div
                        className={`flex items-center gap-2.5 ${
                          isCollapsed ? "justify-center" : "truncate"
                        }`}
                      >
                        <Icon className="w-4 h-4 shrink-0" />
                        {!isCollapsed && <span className="truncate">{item.name}</span>}
                      </div>

                      {!isCollapsed && (
                        isLocked ? (
                          <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            <Lock className="w-2.5 h-2.5" />
                            PRO
                          </span>
                        ) : item.highlight && !isActive ? (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-400">
                            LIVE
                          </span>
                        ) : null
                      )}
                    </Link>

                    {/* Floating Tooltip in Collapsed Mode */}
                    {isCollapsed && (
                      <div className="fixed left-[76px] hidden group-hover:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs font-medium shadow-2xl z-50 pointer-events-none whitespace-nowrap">
                        <span>{item.name}</span>
                        {isLocked && (
                          <span className="text-[9px] text-amber-400 font-bold bg-amber-500/20 px-1 py-0.5 rounded">
                            PRO
                          </span>
                        )}
                        {item.highlight && !isActive && (
                          <span className="text-[9px] text-emerald-400 font-bold bg-emerald-500/20 px-1 py-0.5 rounded">
                            LIVE
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
          </div>

          <div>
            {isCollapsed ? (
              <div className="my-2 border-t border-slate-800/80 mx-2" />
            ) : (
              <span className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-2">
                {t("nav.intelligence")}
              </span>
            )}
            <nav className="space-y-1">
              {visibleIntelligence.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                const isLocked = isFeatureRestrictedByPlan(item.href);

                return (
                  <div key={item.href} className="relative group">
                    <Link
                      href={item.href}
                      onClick={(e) => handleNavClick(e, item.href, isLocked)}
                      className={`flex items-center rounded-lg text-xs font-medium transition-all ${
                        isCollapsed
                          ? "justify-center p-2.5"
                          : "justify-between px-3 py-2"
                      } ${
                        isLocked
                          ? "opacity-60 text-slate-400 hover:bg-slate-800/40 hover:opacity-80"
                          : isActive
                          ? "bg-indigo-600 text-white shadow-sm"
                          : "text-slate-300 hover:bg-slate-800 hover:text-white"
                      }`}
                    >
                      <div
                        className={`flex items-center gap-2.5 ${
                          isCollapsed ? "justify-center" : "truncate"
                        }`}
                      >
                        <Icon
                          className={`w-4 h-4 shrink-0 ${
                            item.aiBadge && !isLocked ? "text-purple-400" : ""
                          }`}
                        />
                        {!isCollapsed && <span className="truncate">{item.name}</span>}
                      </div>

                      {!isCollapsed && (
                        isLocked ? (
                          <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            <Lock className="w-2.5 h-2.5" />
                            PRO
                          </span>
                        ) : item.aiBadge ? (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-500/20 text-purple-300">
                            AI
                          </span>
                        ) : null
                      )}
                    </Link>

                    {/* Floating Tooltip in Collapsed Mode */}
                    {isCollapsed && (
                      <div className="fixed left-[76px] hidden group-hover:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs font-medium shadow-2xl z-50 pointer-events-none whitespace-nowrap">
                        <span>{item.name}</span>
                        {isLocked && (
                          <span className="text-[9px] text-amber-400 font-bold bg-amber-500/20 px-1 py-0.5 rounded">
                            PRO
                          </span>
                        )}
                        {item.aiBadge && (
                          <span className="text-[9px] text-purple-300 font-bold bg-purple-500/20 px-1 py-0.5 rounded">
                            AI
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Footer User Info, Theme Toggle & Logout */}
        <div
          className={`border-t border-slate-800 bg-slate-950/40 transition-all ${
            isCollapsed ? "p-2" : "p-3"
          }`}
        >
          {isCollapsed ? (
            <div className="flex flex-col items-center gap-1.5">
              {/* User Initial Avatar */}
              <div
                className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold text-xs uppercase cursor-pointer"
                title={`${user?.name || "User"} (${user?.email || ""})`}
              >
                {(user?.name || "U")[0]}
              </div>

              {/* Language Switcher Button */}
              <button
                onClick={toggleLocale}
                title={t("header.switchLanguage")}
                className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-slate-800 transition-colors text-[10px] font-bold cursor-pointer"
              >
                {locale === "bn" ? "EN" : "বাং"}
              </button>

              {/* Theme Toggle Button */}
              <button
                onClick={toggleTheme}
                title={isDark ? t("header.lightMode") : t("header.darkMode")}
                aria-label="Toggle Theme"
                className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 dark:hover:text-amber-300 hover:bg-slate-800 transition-colors cursor-pointer"
              >
                {isDark ? (
                  <Sun className="w-4 h-4 text-amber-400" />
                ) : (
                  <Moon className="w-4 h-4 text-indigo-600" />
                )}
              </button>

              {/* Expand Drawer Button */}
              <button
                onClick={toggleCollapse}
                title={t("nav.expandSidebar")}
                aria-label="Expand side drawer"
                className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              {/* Logout Button */}
              <button
                onClick={() => AuthService.logout()}
                title={t("common.signOut")}
                aria-label="Sign Out"
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between px-2 py-1">
              <div className="truncate pr-2">
                <p className="text-xs font-semibold text-slate-200 truncate">
                  {user?.name || "Earbaj"}
                </p>
                <p className="text-[10px] text-slate-400 truncate">
                  {user?.email || "user@admin.com"}
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {/* Language Switcher */}
                <button
                  onClick={toggleLocale}
                  title={t("header.switchLanguage")}
                  className="px-1.5 py-1 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-slate-800 transition-colors text-[10px] font-bold cursor-pointer"
                >
                  {locale === "bn" ? "EN" : "বাং"}
                </button>
                <button
                  onClick={toggleTheme}
                  title={isDark ? t("header.lightMode") : t("header.darkMode")}
                  aria-label="Toggle Theme"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 dark:hover:text-amber-300 hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  {isDark ? (
                    <Sun className="w-4 h-4 text-amber-400" />
                  ) : (
                    <Moon className="w-4 h-4 text-indigo-600" />
                  )}
                </button>
                <button
                  onClick={() => AuthService.logout()}
                  title={t("common.signOut")}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
