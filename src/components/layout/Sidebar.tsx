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
} from "lucide-react";
import { AuthService } from "@/lib/api/client";
import { User } from "@/types";
import { useSidebar } from "@/context/SidebarContext";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isOpen, setIsOpen } = useSidebar();
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
    const diff = Math.ceil((new Date(user.subscriptionExpiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (diff > 0) daysRemaining = diff;
  }

  // Free Tier Restricted Feature Keys
  const isFeatureRestrictedByPlan = (href: string) => {
    if (!isFreeTier) return false;
    const restrictedHrefs = [
      "/dashboard/ai-advisor",
      "/dashboard/suppliers",
      "/dashboard/expenses",
      "/dashboard/staff",
      "/dashboard/customers",
      "/dashboard/categories",
    ];
    return restrictedHrefs.includes(href);
  };

  // Nav definitions
  const allOperations = [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { name: "Point of Sale (POS)", href: "/dashboard/pos", icon: ShoppingCart, highlight: true },
    { name: "Sales & Invoices", href: "/dashboard/sales", icon: ReceiptText },
    { name: "Inventory Catalog", href: "/dashboard/inventory", icon: Package },
    { name: "Categories", href: "/dashboard/categories", icon: Layers, proOnly: true },
    { name: "Suppliers & POs", href: "/dashboard/suppliers", icon: Truck, proOnly: true, adminOnly: true },
    { name: "Shop Expenses", href: "/dashboard/expenses", icon: Wallet, proOnly: true, adminOnly: true },
    { name: "Store Branches", href: "/dashboard/branches", icon: Building2, adminOnly: true },
    { name: "Staff & Roles", href: "/dashboard/staff", icon: Users, proOnly: true, adminOnly: true },
    { name: "Customer Ledgers", href: "/dashboard/customers", icon: Users, proOnly: true },
  ];

  const allIntelligence = [
    { name: "Gemini AI Advisor", href: "/dashboard/ai-advisor", icon: BrainCircuit, aiBadge: true, proOnly: true, adminOnly: true },
    { name: "Recycle Bin", href: "/dashboard/trash", icon: Trash2, adminOnly: true },
    { name: "Subscription & Billing", href: "/dashboard/subscriptions", icon: CreditCard, adminOnly: true },
    { name: "Shop Settings", href: "/dashboard/settings", icon: Settings },
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
    setIsOpen(false);
    if (isLocked) {
      e.preventDefault();
      router.push("/dashboard/subscriptions?upgrade=required");
    }
  };

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-screen transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-5 border-b border-slate-800 flex items-center justify-between">
          <Link
            href="/dashboard"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2.5"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-600/30">
              <Boxes className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-white block">Inventarioya</span>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-indigo-400 font-medium tracking-wider uppercase">
                  {role}
                </span>
                <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${isFreeTier ? "bg-slate-800 text-slate-400" : "bg-emerald-500/20 text-emerald-400"}`}>
                  {tier}
                  {daysRemaining !== null && ` • ${daysRemaining}d left`}
                </span>
              </div>
            </div>
          </Link>

          {/* Close button for mobile */}
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        <div>
          <span className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-2">
            Operations
          </span>
          <nav className="space-y-1">
            {visibleOperations.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              const isLocked = isFeatureRestrictedByPlan(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={(e) => handleNavClick(e, item.href, isLocked)}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    isLocked
                      ? "opacity-60 text-slate-400 hover:bg-slate-800/40 hover:opacity-80"
                      : isActive
                      ? "bg-indigo-600 text-white shadow-sm"
                      : item.highlight
                      ? "text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{item.name}</span>
                  </div>

                  {isLocked ? (
                    <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      <Lock className="w-2.5 h-2.5" />
                      PRO
                    </span>
                  ) : item.highlight && !isActive ? (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-400">
                      LIVE
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </nav>
        </div>

        <div>
          <span className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-2">
            Intelligence & System
          </span>
          <nav className="space-y-1">
            {visibleIntelligence.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              const isLocked = isFeatureRestrictedByPlan(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={(e) => handleNavClick(e, item.href, isLocked)}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    isLocked
                      ? "opacity-60 text-slate-400 hover:bg-slate-800/40 hover:opacity-80"
                      : isActive
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon className={`w-4 h-4 shrink-0 ${item.aiBadge && !isLocked ? "text-purple-400" : ""}`} />
                    <span className="truncate">{item.name}</span>
                  </div>

                  {isLocked ? (
                    <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      <Lock className="w-2.5 h-2.5" />
                      PRO
                    </span>
                  ) : item.aiBadge ? (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-500/20 text-purple-300">
                      AI
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Footer User Info & Logout */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/40">
        <div className="flex items-center justify-between px-2 py-1">
          <div className="truncate">
            <p className="text-xs font-semibold text-slate-200 truncate">
              {user?.name || "Earbaj"}
            </p>
            <p className="text-[10px] text-slate-400 truncate">
              {user?.email || "user@admin.com"}
            </p>
          </div>
          <button
            onClick={() => AuthService.logout()}
            title="Sign Out"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
    </>
  );
}
