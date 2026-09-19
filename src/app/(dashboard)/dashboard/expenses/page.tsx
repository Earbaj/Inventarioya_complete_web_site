"use client";

import { useState, useEffect } from "react";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { ExpensesService } from "@/lib/api/client";
import { Expense } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Wallet, Plus, Trash2, Calendar, Tag, X, DollarSign } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function ExpensesPage() {
  const { txt } = useLanguage();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newExp, setNewExp] = useState<Partial<Expense>>({
    title: "",
    category: "Rent",
    amount: 0,
    date: new Date().toISOString().split("T")[0],
    note: "",
  });

  useEffect(() => {
    async function loadExpenses() {
      try {
        const data = await ExpensesService.getExpenses();
        setExpenses(data);
      } catch (err) {
        console.error(err);
      }
    }
    loadExpenses();
  }, []);

  const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await ExpensesService.createExpense(newExp);
      setExpenses([created, ...expenses]);
      setShowAddModal(false);
      setNewExp({
        title: "",
        category: "Rent",
        amount: 0,
        date: new Date().toISOString().split("T")[0],
        note: "",
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(txt("আপনি কি নিশ্চিত যে এই খরচের রেকর্ড মুছে ফেলতে চান?", "Are you sure you want to delete this expense record?"))) return;
    try {
      await ExpensesService.deleteExpense(id);
      setExpenses(expenses.filter((e) => e.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <DashboardHeader title={txt("দোকানের খরচ ও পরিচালনা ব্যয়", "Shop Expenses & Operational Costs")} />

      <main className="p-4 sm:p-6 space-y-6 max-w-7xl">
        {/* KPI & Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">{txt("মোট রেকর্ডকৃত খরচ", "Total Recorded Expenses")}</p>
              <p className="text-xl font-extrabold text-white">{formatCurrency(totalExpense)}</p>
            </div>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            {txt("নতুন খরচ যোগ করুন", "Record New Expense")}
          </button>
        </div>

        {/* Expenses Table */}
        <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px] text-left text-xs">
              <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">{txt("তারিখ", "Date")}</th>
                  <th className="py-3 px-4">{txt("বিবরণ / উদ্দেশ্য", "Title / Purpose")}</th>
                  <th className="py-3 px-4">{txt("ক্যাটাগরি", "Category")}</th>
                  <th className="py-3 px-4">{txt("পরিমাণ", "Amount")}</th>
                  <th className="py-3 px-4">{txt("নোট / বিবরণ", "Notes")}</th>
                  <th className="py-3 px-4 text-right">{txt("অ্যাকশন", "Action")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {expenses.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500">
                      {txt("কোনো খরচের রেকর্ড পাওয়া যায়নি।", "No expenses recorded yet.")}
                    </td>
                  </tr>
                ) : (
                  expenses.map((exp) => (
                    <tr key={exp.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 text-slate-400">{exp.date}</td>
                      <td className="py-3 px-4 font-semibold text-white">{exp.title}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300">
                          {exp.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-rose-400">
                        {formatCurrency(exp.amount)}
                      </td>
                      <td className="py-3 px-4 text-slate-400 text-[11px]">{exp.note || "-"}</td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleDelete(exp.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                          title={txt("রেকর্ড মুছে ফেলুন", "Delete record")}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Add Expense Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-5 sm:p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white">{txt("দোকানের খরচ রেকর্ড করুন", "Record Shop Expense")}</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddExpense} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">{txt("খরচের নাম / শিরোনাম", "Expense Title")}</label>
                <input
                  type="text"
                  required
                  value={newExp.title}
                  onChange={(e) => setNewExp({ ...newExp, title: e.target.value })}
                  placeholder={txt("যেমন: দোকান বিদ্যুৎ বিল", "e.g. Shop Electricity Bill")}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">{txt("ক্যাটাগরি", "Category")}</label>
                  <select
                    aria-label={txt("খরচের ক্যাটাগরি", "Expense Category")}
                    value={newExp.category}
                    onChange={(e) => setNewExp({ ...newExp, category: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Rent">{txt("দোকান ভাড়া (Rent)", "Rent")}</option>
                    <option value="Salary">{txt("বেতন (Salary)", "Salary")}</option>
                    <option value="Utilities">{txt("বিদ্যুৎ ও ইউটিলিটি", "Utilities")}</option>
                    <option value="Inventory">{txt("পণ্য ক্রয় (Inventory)", "Inventory")}</option>
                    <option value="Marketing">{txt("বিজ্ঞাপন (Marketing)", "Marketing")}</option>
                    <option value="Maintenance">{txt("মেরামত ও রক্ষণাবেক্ষণ", "Maintenance")}</option>
                    <option value="Other">{txt("অন্যান্য (Other)", "Other")}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">{txt("পরিমাণ (৳)", "Amount (৳)")}</label>
                  <input
                    type="number"
                    required
                    value={newExp.amount}
                    onChange={(e) => setNewExp({ ...newExp, amount: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">{txt("খরচের তারিখ", "Expense Date")}</label>
                <input
                  type="date"
                  required
                  value={newExp.date}
                  onChange={(e) => setNewExp({ ...newExp, date: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">{txt("নোট / ভাউচার নং", "Notes / Voucher #")}</label>
                <input
                  type="text"
                  value={newExp.note}
                  onChange={(e) => setNewExp({ ...newExp, note: e.target.value })}
                  placeholder={txt("ঐচ্ছিক বিল বা মিটার রেফারেন্স", "Optional bill or meter reference")}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-semibold"
                >
                  {txt("বাতিল", "Cancel")}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-md"
                >
                  {txt("খরচ সংরক্ষণ করুন", "Save Expense")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
