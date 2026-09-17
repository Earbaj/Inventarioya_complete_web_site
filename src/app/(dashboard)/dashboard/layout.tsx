"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { AuthService } from "@/lib/api/client";
import { SidebarProvider } from "@/context/SidebarContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    const user = AuthService.getCurrentUser();
    if (!user) {
      router.push("/login");
    } else if (user.role?.toLowerCase() === "superadmin") {
      router.push("/superadmin");
    }
  }, [router]);

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-slate-950 flex text-slate-100 relative">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
          {children}
        </div>
      </div>
    </SidebarProvider>
  );
}
