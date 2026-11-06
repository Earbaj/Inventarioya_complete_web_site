"use client";

import React from "react";
import { Customer } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";
import {
  User,
  ChevronDown,
  X,
  Plus,
  Search,
  Loader2,
  CheckCircle2,
} from "lucide-react";

export interface PosCustomerSelectProps {
  selectedCustomer: Customer | null;
  customerName: string;
  customers: Customer[];
  customerMeta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
  };
  customerSearch: string;
  setCustomerSearch: (val: string) => void;
  isCustomerDropdownOpen: boolean;
  setIsCustomerDropdownOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isLoadingCustomers: boolean;
  isLoadingMoreCustomers: boolean;
  onSelectCustomer: (cust: Customer | null) => void;
  onLoadMoreCustomers: () => void;
  onOpenAddCustomerModal: () => void;
}

/**
 * পিওএস কাস্টমার নির্বাচন ও সার্চ কম্বোবক্স (POS Customer Combobox)
 * ওয়াক-ইন এবং নিবন্ধিত কাস্টমার নির্বাচন, লেজার ব্যালেন্স ও দ্রুত নতুন কাস্টমার যোগ করার অপশন দেয়।
 */
export function PosCustomerSelect({
  selectedCustomer,
  customerName,
  customers,
  customerMeta,
  customerSearch,
  setCustomerSearch,
  isCustomerDropdownOpen,
  setIsCustomerDropdownOpen,
  isLoadingCustomers,
  isLoadingMoreCustomers,
  onSelectCustomer,
  onLoadMoreCustomers,
  onOpenAddCustomerModal,
}: PosCustomerSelectProps) {
  const { txt } = useLanguage();

  return (
    <div className="px-3 py-1.5 border-b border-slate-800 bg-slate-950/40 shrink-0 relative">
      <div className="flex items-center justify-between gap-1.5 text-[11px]">
        {/* কাস্টমার ট্রিগার বক্স */}
        <div
          onClick={() => setIsCustomerDropdownOpen((prev) => !prev)}
          className="flex-1 min-w-0 bg-slate-900/90 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 rounded-lg px-2.5 py-1 cursor-pointer transition-all flex items-center justify-between gap-2"
        >
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <User className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <div className="truncate flex items-center gap-1.5">
              <span className="font-semibold text-white text-xs truncate">
                {selectedCustomer
                  ? selectedCustomer.name
                  : customerName || txt("সাধারণ ক্রেতা (Walk-in)", "Walk-in Customer")}
              </span>
              {selectedCustomer && Number(selectedCustomer.closingBalance || 0) < 0 && (
                <span className="px-1 py-0.2 rounded text-[9px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 shrink-0">
                  {txt("বাকি:", "Due:")}{" "}
                  {formatCurrency(Math.abs(Number(selectedCustomer.closingBalance)))}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 text-slate-400 shrink-0">
            {selectedCustomer && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectCustomer(null);
                }}
                className="p-0.5 hover:text-white rounded hover:bg-slate-800 transition-colors cursor-pointer"
                title={txt("সাধারণ কাস্টমারে রিসেট করুন", "Reset to Walk-in Customer")}
              >
                <X className="w-3 h-3" />
              </button>
            )}
            <ChevronDown
              className={`w-3 h-3 transition-transform ${
                isCustomerDropdownOpen ? "rotate-180" : ""
              }`}
            />
          </div>
        </div>

        {/* নতুন কাস্টমার যোগ বাটন */}
        <button
          type="button"
          onClick={onOpenAddCustomerModal}
          className="p-1 px-2 text-[10px] bg-slate-900 hover:bg-slate-800 border border-slate-800 text-indigo-400 hover:text-indigo-300 font-semibold rounded-lg flex items-center gap-1 transition-colors shrink-0 cursor-pointer"
          title={txt("নতুন কাস্টমার নিবন্ধন করুন", "Register new customer")}
        >
          <Plus className="w-3 h-3" />
          <span className="hidden sm:inline">{txt("নতুন", "New")}</span>
        </button>
      </div>

      {/* সার্চযোগ্য ড্রপডাউন মেনু */}
      {isCustomerDropdownOpen && (
        <div className="absolute left-3 right-3 top-full mt-1.5 z-50 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-72">
          {/* সার্চ ইনপুট */}
          <div className="p-2 border-b border-slate-800 bg-slate-950/90">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                autoFocus
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                placeholder={txt(
                  "কাস্টমারের নাম বা ফোন নম্বর দিয়ে খুঁজুন...",
                  "Search customer by name or phone..."
                )}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-8 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              {isLoadingCustomers && (
                <Loader2 className="w-3.5 h-3.5 text-indigo-400 animate-spin absolute right-2.5 top-1/2 -translate-y-1/2" />
              )}
            </div>
          </div>

          {/* কাস্টমার তালিকা */}
          <div className="overflow-y-auto flex-1 divide-y divide-slate-800/60">
            {/* পিন করা ওয়াক-ইন কাস্টমার অপশন */}
            <div
              onClick={() => onSelectCustomer(null)}
              className={`px-3 py-2 hover:bg-slate-800/70 cursor-pointer flex items-center justify-between transition-colors ${
                !selectedCustomer ? "bg-indigo-950/40 border-l-2 border-indigo-500" : ""
              }`}
            >
              <div>
                <p className="text-xs font-semibold text-white flex items-center gap-1.5">
                  {txt("সাধারণ ক্রেতা (Walk-in)", "Walk-in Customer")}
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                    {txt("নগদ বিক্রয়", "Cash Sale")}
                  </span>
                </p>
                <p className="text-[10px] text-slate-400">
                  {txt("ডিফল্ট সাধারণ নগদ খরিদ্দার", "Default general walk-in buyer")}
                </p>
              </div>
              {!selectedCustomer && (
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              )}
            </div>

            {/* নিবন্ধিত কাস্টমার তালিকা */}
            {customers.map((c) => {
              const isSelected = selectedCustomer?.id === c.id;
              const dueNum = Number(c.closingBalance || 0);
              return (
                <div
                  key={c.id}
                  onClick={() => onSelectCustomer(c)}
                  className={`px-3 py-2 hover:bg-slate-800/70 cursor-pointer flex items-center justify-between transition-colors ${
                    isSelected ? "bg-indigo-950/40 border-l-2 border-indigo-500" : ""
                  }`}
                >
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-white truncate">{c.name}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{c.phone}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {dueNum < 0 ? (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-500/20 text-rose-400">
                        {txt("বাকি:", "Due:")} {formatCurrency(Math.abs(dueNum))}
                      </span>
                    ) : (
                      <span className="text-[9px] text-slate-500">{txt("বাকি নেই", "No Due")}</span>
                    )}
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />}
                  </div>
                </div>
              );
            })}

            {/* খালি সার্চ রেজাল্ট */}
            {customers.length === 0 && !isLoadingCustomers && (
              <div className="p-4 text-center text-slate-500 text-xs">
                {txt(
                  `"${customerSearch}" নামে কোনো কাস্টমার পাওয়া যায়নি`,
                  `No customer found for "${customerSearch}"`
                )}
              </div>
            )}

            {/* পেজিনেশন: আরও লোড করুন বাটন */}
            {customerMeta.hasNextPage && (
              <div className="p-2 text-center bg-slate-950/50">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onLoadMoreCustomers();
                  }}
                  disabled={isLoadingMoreCustomers}
                  className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 disabled:opacity-50 py-1 px-3 rounded hover:bg-slate-800 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                >
                  {isLoadingMoreCustomers ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" />
                      {txt("লোড হচ্ছে...", "Loading more...")}
                    </>
                  ) : (
                    txt(
                      `আরও লোড করুন (${customers.length} / ${customerMeta.total})`,
                      `Load more (${customers.length} of ${customerMeta.total})`
                    )
                  )}
                </button>
              </div>
            )}
          </div>

          {/* ফুটার সামারি ও নতুন কাস্টমার শর্টকাট */}
          <div className="p-2 border-t border-slate-800 bg-slate-950/90 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">
              {txt("মোট:", "Total:")} <strong className="text-white">{customerMeta.total}</strong>{" "}
              {txt("জন কাস্টমার", "customers")}
            </span>
            <button
              type="button"
              onClick={() => {
                setIsCustomerDropdownOpen(false);
                onOpenAddCustomerModal();
              }}
              className="text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3 h-3" /> {txt("নতুন", "New")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
