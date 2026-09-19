"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface SidebarContextType {
  // Mobile drawer
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
  // Desktop visibility (true = shown, false = hidden)
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  // Desktop collapsed mode (true = icon-only w-20, false = full w-64)
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  // Main toggle action (used by header menu button)
  toggle: () => void;
  // Toggle collapse / expand (w-64 <-> w-20)
  toggleCollapse: () => void;
}

const SidebarContext = createContext<SidebarContextType>({
  isMobileOpen: false,
  setIsMobileOpen: () => {},
  isOpen: true,
  setIsOpen: () => {},
  isCollapsed: false,
  setIsCollapsed: () => {},
  toggle: () => {},
  toggleCollapse: () => {},
});

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    try {
      const savedOpen = localStorage.getItem("inventarioya_sidebar_open");
      if (savedOpen !== null) {
        setIsOpen(savedOpen === "true");
      }
      const savedCollapsed = localStorage.getItem("inventarioya_sidebar_collapsed");
      if (savedCollapsed !== null) {
        setIsCollapsed(savedCollapsed === "true");
      }
    } catch {
      // Ignore localStorage errors in SSR or restricted environments
    }
  }, []);

  const handleSetIsOpen = (open: boolean) => {
    setIsOpen(open);
    try {
      localStorage.setItem("inventarioya_sidebar_open", String(open));
    } catch {}
  };

  const handleSetIsCollapsed = (collapsed: boolean) => {
    setIsCollapsed(collapsed);
    try {
      localStorage.setItem("inventarioya_sidebar_collapsed", String(collapsed));
    } catch {}
  };

  const toggle = () => {
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setIsMobileOpen((prev) => !prev);
    } else {
      handleSetIsOpen(!isOpen);
    }
  };

  const toggleCollapse = () => {
    handleSetIsCollapsed(!isCollapsed);
  };

  return (
    <SidebarContext.Provider
      value={{
        isMobileOpen,
        setIsMobileOpen,
        isOpen,
        setIsOpen: handleSetIsOpen,
        isCollapsed,
        setIsCollapsed: handleSetIsCollapsed,
        toggle,
        toggleCollapse,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export const useSidebar = () => useContext(SidebarContext);
