"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
  ShieldAlert,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { AuthService } from "@/lib/api/client";

const mainNavItems = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Point of Sale (POS)", href: "/dashboard/pos", icon: ShoppingCart, highlight: true },
  { name: "Sales & Invoices", href: "/dashboard/sales", icon: ReceiptText },
  { name: "Inventory Catalog", href: "/dashboard/inventory", icon: Package },
  { name: "Categories", href: "/dashboard/categories", icon: Layers },
  { name: "Suppliers & POs", href: "/dashboard/suppliers", icon: Truck },
  { name: "Shop Expenses", href: "/dashboard/expenses", icon: Wallet },
  { name: "Store Branches", href: "/dashboard/branches", icon: Building2 },
  { name: "Staff & Roles", href: "/dashboard/staff", icon: Users },
  { name: "Customer Ledgers", href: "/dashboard/customers", icon: Users },
];

const intelligenceNavItems = [
  { name: "Gemini AI Advisor", href: "/dashboard/ai-advisor", icon: BrainCircuit, aiBadge: true },
  { name: "Recycle Bin", href: "/dashboard/trash", icon: Trash2 },
  { name: "Subscription & Billing", href: "/dashboard/subscriptions", icon: CreditCard },
  { name: "Shop Settings", href: "/dashboard/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-screen sticky top-0">
      {/* Brand Header */}
      <div className="h-16 px-6 border-b border-slate-800 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-600/30">
            <Boxes className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-bold text-base tracking-tight text-white block">Inventarioya</span>
            <span className="text-[10px] text-indigo-400 font-medium tracking-wider uppercase block">Retail Hub</span>
          </div>
        </Link>
      </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        <div>
          <span className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-2">
            Operations
          </span>
          <nav className="space-y-1">
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-sm"
                      : item.highlight
                      ? "text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </div>
                  {item.highlight && !isActive && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-400">
                      LIVE POS
                    </span>
                  )}
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
            {intelligenceNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${item.aiBadge ? "text-purple-400" : ""}`} />
                    <span>{item.name}</span>
                  </div>
                  {item.aiBadge && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-500/20 text-purple-300">
                      AI
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* SuperAdmin Link */}
        <div className="pt-2 border-t border-slate-800">
          <Link
            href="/superadmin"
            className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-amber-400 hover:bg-amber-500/10 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <ShieldAlert className="w-4 h-4" />
              <span>SuperAdmin Portal</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Footer User Info & Logout */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/40">
        <div className="flex items-center justify-between px-2 py-1">
          <div className="truncate">
            <p className="text-xs font-semibold text-slate-200 truncate">Dhaka Superstore</p>
            <p className="text-[10px] text-emerald-400 font-medium">Business Growth (Active)</p>
          </div>
          <button
            onClick={() => AuthService.logout()}
            title="Sign Out"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
