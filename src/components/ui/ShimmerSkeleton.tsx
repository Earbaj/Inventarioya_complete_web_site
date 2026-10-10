"use client";

import React from "react";

interface ShimmerItemProps {
  className?: string;
  height?: string;
  width?: string;
  rounded?: string;
}

export function ShimmerItem({
  className = "",
  height,
  width,
  rounded = "rounded-lg",
}: ShimmerItemProps) {
  return (
    <div
      className={`relative overflow-hidden bg-slate-800/70 dark:bg-slate-800/70 ${rounded} ${className}`}
      style={{ height, width }}
    >
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/10 dark:via-white/10 to-transparent pointer-events-none" />
    </div>
  );
}

/**
 * Shimmer Table Row for Data Tables (Inventory, Sales, Customers, Expenses, etc.)
 */
export function ShimmerTableRow({
  cols = 6,
  colWidths,
  className = "",
}: {
  cols?: number;
  colWidths?: string[];
  className?: string;
}) {
  return (
    <tr className={`border-b border-slate-800/60 dark:border-slate-800/60 ${className}`}>
      {Array.from({ length: cols }).map((_, idx) => {
        const defaultWidth =
          idx === 0 ? "w-20" : idx === 1 ? "w-36" : idx === cols - 1 ? "w-16 ml-auto" : "w-24";
        const widthClass = colWidths && colWidths[idx] ? colWidths[idx] : defaultWidth;

        return (
          <td key={idx} className="py-4 px-4">
            <div
              className={`h-4 relative overflow-hidden bg-slate-800/70 dark:bg-slate-800/70 rounded-md ${widthClass}`}
            >
              <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/10 dark:via-white/10 to-transparent pointer-events-none" />
            </div>
          </td>
        );
      })}
    </tr>
  );
}

/**
 * Multiple Shimmer Table Rows for seamless table skeleton loading
 */
export function ShimmerTableRows({
  rows = 6,
  cols = 6,
  colWidths,
}: {
  rows?: number;
  cols?: number;
  colWidths?: string[];
}) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rIdx) => (
        <ShimmerTableRow key={rIdx} cols={cols} colWidths={colWidths} />
      ))}
    </>
  );
}

/**
 * Metric KPI Card Shimmer (Dashboard, Customers, Inventory summaries)
 */
export function ShimmerCard({ className = "" }: { className?: string }) {
  return (
    <div
      className={`p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm relative overflow-hidden ${className}`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="h-3 w-24 bg-slate-800/80 rounded relative overflow-hidden">
          <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
        </div>
        <div className="w-8 h-8 rounded-xl bg-slate-800/80 relative overflow-hidden">
          <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
        </div>
      </div>
      <div className="h-7 w-32 bg-slate-800/90 rounded-lg relative overflow-hidden mb-2">
        <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
      </div>
      <div className="h-2.5 w-20 bg-slate-800/60 rounded relative overflow-hidden">
        <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
      </div>
    </div>
  );
}

/**
 * Grid Card Shimmer (Categories, Branches, etc.)
 */
export function ShimmerGridCards({
  count = 6,
  className = "",
}: {
  count?: number;
  className?: string;
}) {
  return (
    <>
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className={`p-5 rounded-2xl bg-slate-900 border border-slate-800 relative overflow-hidden flex flex-col justify-between ${className}`}
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-slate-800/90 mb-3 relative overflow-hidden">
              <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
            </div>
            <div className="h-4 w-32 bg-slate-800/90 rounded mb-2 relative overflow-hidden">
              <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
            </div>
            <div className="h-3 w-44 bg-slate-800/60 rounded mb-4 relative overflow-hidden">
              <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
            </div>
          </div>
          <div className="h-3 w-20 bg-slate-800/50 rounded relative overflow-hidden pt-2 border-t border-slate-800/60">
            <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
          </div>
        </div>
      ))}
    </>
  );
}

/**
 * POS Product Grid Shimmer
 */
export function ShimmerPosProduct({ count = 8 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="p-3 rounded-xl border border-slate-800 bg-slate-900 flex flex-col justify-between h-28 relative overflow-hidden"
        >
          <div>
            <div className="h-3.5 w-24 bg-slate-800/90 rounded mb-2 relative overflow-hidden">
              <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
            </div>
            <div className="h-2.5 w-14 bg-slate-800/60 rounded relative overflow-hidden">
              <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
            </div>
          </div>
          <div className="flex items-center justify-between mt-3">
            <div className="h-4 w-14 bg-slate-800/90 rounded relative overflow-hidden">
              <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
            </div>
            <div className="h-3 w-10 bg-slate-800/60 rounded relative overflow-hidden">
              <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
            </div>
          </div>
        </div>
      ))}
    </>
  );
}
