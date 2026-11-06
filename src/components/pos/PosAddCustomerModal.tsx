"use client";

import React from "react";
import { useLanguage } from "@/context/LanguageContext";
import { User, X, Plus, Loader2 } from "lucide-react";

export interface PosAddCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  newCustomerForm: {
    name: string;
    phone: string;
    address: string;
    openingBalance: number;
  };
  setNewCustomerForm: React.Dispatch<
    React.SetStateAction<{
      name: string;
      phone: string;
      address: string;
      openingBalance: number;
    }>
  >;
  isCreatingCustomer: boolean;
  onCreateCustomer: (e: React.FormEvent) => void;
}

/**
 * পিওএস নতুন কাস্টমার দ্রুত যোগ করার মোডাল (POS Quick Add Customer Modal)
 * নতুন কাস্টমারের নাম, ফোন, ঠিকানা ও প্রারম্ভিক বকেয়া ব্যালেন্স দ্রুত ইনপুট নিয়ে সেভ করে।
 */
export function PosAddCustomerModal({
  isOpen,
  onClose,
  newCustomerForm,
  setNewCustomerForm,
  isCreatingCustomer,
  onCreateCustomer,
}: PosAddCustomerModalProps) {
  const { txt } = useLanguage();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-5 sm:p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-white">
              {txt("নতুন কাস্টমার যোগ করুন", "Add New Customer")}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={onCreateCustomer} className="space-y-3 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1">
              {txt("কাস্টমারের পুরো নাম *", "Customer Full Name *")}
            </label>
            <input
              type="text"
              required
              value={newCustomerForm.name}
              onChange={(e) =>
                setNewCustomerForm({ ...newCustomerForm, name: e.target.value })
              }
              placeholder={txt("যেমন: রহিম চৌধুরী", "e.g. Rahim Chowdhury")}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">
              {txt("মোবাইল নম্বর *", "Phone Number *")}
            </label>
            <input
              type="text"
              required
              value={newCustomerForm.phone}
              onChange={(e) =>
                setNewCustomerForm({ ...newCustomerForm, phone: e.target.value })
              }
              placeholder={txt("যেমন: 01712345678", "e.g. 01712345678")}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">
              {txt("ঠিকানা (ঐচ্ছিক)", "Address (Optional)")}
            </label>
            <input
              type="text"
              value={newCustomerForm.address}
              onChange={(e) =>
                setNewCustomerForm({ ...newCustomerForm, address: e.target.value })
              }
              placeholder={txt("যেমন: মিরপুর, ঢাকা", "e.g. Mirpur, Dhaka")}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">
              {txt("পূর্বের বকেয়া ব্যালেন্স (৳)", "Opening Due Balance (৳)")}
            </label>
            <input
              type="number"
              value={newCustomerForm.openingBalance}
              onChange={(e) =>
                setNewCustomerForm({
                  ...newCustomerForm,
                  openingBalance: Number(e.target.value),
                })
              }
              placeholder="0"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-semibold text-xs transition-colors cursor-pointer"
            >
              {txt("বাতিল", "Cancel")}
            </button>
            <button
              type="submit"
              disabled={isCreatingCustomer}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold shadow-md text-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              {isCreatingCustomer ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Plus className="w-3.5 h-3.5" />
              )}
              {txt("সংরক্ষণ ও নির্বাচন করুন", "Save & Select")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
