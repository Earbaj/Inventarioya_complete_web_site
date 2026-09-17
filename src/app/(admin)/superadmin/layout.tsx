"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShieldAlert,
  LayoutDashboard,
  Building2,
  CreditCard,
  ArrowLeft,
  LogOut,
  Boxes,
} from "lucide-react";
import { AuthService } from "@/lib/api/client";

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    setUser(AuthService.getCurrentUser());
  }, []);

  const navItems = [
    { name: "Platform Metrics", href: "/superadmin", icon: LayoutDashboard },
    { name: "Registered Shops", href: "/superadmin/shops", icon: Building2 },
    { name: "Pending Approvals", href: "/superadmin/payments", icon: CreditCard },
  ];

  return (
    <div className="min-h-screen bg-slate-950 flex text-slate-100">
      {/* SuperAdmin Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-amber-500/20 flex flex-col h-screen sticky top-0">
        <div className="h-16 px-6 border-b border-amber-500/20 flex items-center justify-between">
          <Link href="/superadmin" className="flex items-center gap-2.5">
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
        </div>

        <div className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
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

        {/* Sidebar Footer with Return to Dashboard & Logout */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/40 space-y-2">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-indigo-400 hover:bg-slate-800/60 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Shop Dashboard</span>
          </Link>

          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between px-2">
            <div className="truncate">
              <p className="text-xs font-bold text-white truncate">
                {user?.name || "SuperAdmin"}
              </p>
              <p className="text-[10px] text-amber-400 font-mono truncate">
                {user?.email || "Platform Root"}
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

      {/* Main Content Area with Header Bar */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* Top Header Bar */}
        <header className="h-14 border-b border-slate-800 bg-slate-900/50 backdrop-blur px-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-semibold text-slate-300">
              Platform Backend Online (v1.0.0)
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
              <span className="font-medium text-slate-200">{user?.name || "SuperAdmin"}</span>
              <span>·</span>
              <span className="text-amber-400 font-mono text-[11px]">
                {user?.email || "Platform Root"}
              </span>
            </div>

            <button
              onClick={() => AuthService.logout()}
              className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </header>

        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}
