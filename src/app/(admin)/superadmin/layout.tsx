"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShieldAlert,
  LayoutDashboard,
  Building2,
  CreditCard,
  ArrowLeft,
  Boxes,
} from "lucide-react";

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

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

        <div className="p-4 border-t border-slate-800">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-indigo-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Shop Dashboard</span>
          </Link>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">{children}</div>
    </div>
  );
}
