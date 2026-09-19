"use client";

import { useState, useEffect } from "react";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { BranchesService } from "@/lib/api/client";
import { Branch } from "@/types";
import { Building2, Plus, Phone, MapPin, CheckCircle2, X } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function BranchesPage() {
  const { txt } = useLanguage();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newBranch, setNewBranch] = useState<Partial<Branch>>({
    name: "",
    address: "",
    phone: "",
    managerName: "",
  });

  useEffect(() => {
    async function loadBranches() {
      try {
        const data = await BranchesService.getBranches();
        setBranches(data);
      } catch (err) {
        console.error(err);
      }
    }
    loadBranches();
  }, []);

  const handleCreateBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await BranchesService.createBranch(newBranch);
      setBranches([...branches, created]);
      setShowAddModal(false);
      setNewBranch({ name: "", address: "", phone: "", managerName: "" });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <DashboardHeader title={txt("আউটলেট ও শাখা ব্যবস্থাপনা", "Store Outlets & Branch Management")} />

      <main className="p-4 sm:p-6 space-y-6 max-w-7xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-white">{txt("আপনার শপ ও আউটলেটসমূহ", "Your Physical Outlets")}</h3>
            <p className="text-xs text-slate-400">{txt("প্রতিটি শাখার রেজিস্টার ও স্টক নিয়ন্ত্রণ করুন", "Manage registers and localized inventories per branch")}</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="w-full sm:w-auto justify-center px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            {txt("নতুন ব্রাঞ্চ যোগ করুন", "Add New Branch")}
          </button>
        </div>

        {/* Branches Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {branches.length === 0 ? (
            <div className="col-span-full py-12 text-center text-slate-500">
              {txt("কোনো শাখা পাওয়া যায়নি।", "No branch outlets found.")}
            </div>
          ) : (
            branches.map((br) => (
              <div
                key={br.id}
                className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between relative overflow-hidden"
              >
                {br.isMainBranch && (
                  <div className="absolute top-3 right-3 px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                    {txt("প্রধান শাখা", "FLAGSHIP")}
                  </div>
                )}

                <div>
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-3">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-bold text-white mb-1">{br.name}</h4>
                  <div className="space-y-1.5 text-xs text-slate-400 mt-3">
                    <p className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      <span>{br.address}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-500" />
                      <span>{br.phone}</span>
                    </p>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-500">{txt("ম্যানেজার:", "Manager:")}</span>
                  <span className="text-white font-medium">{br.managerName || txt("অ্যাডমিন কর্তৃক নির্ধারিত", "Assigned by Admin")}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Add Branch Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white">{txt("নতুন শাখা আউটলেট তৈরি করুন", "Create New Branch Outlet")}</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateBranch} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">{txt("শাখার নাম", "Branch Name")}</label>
                <input
                  type="text"
                  required
                  value={newBranch.name}
                  onChange={(e) => setNewBranch({ ...newBranch, name: e.target.value })}
                  placeholder={txt("যেমন: উত্তরা সেক্টর ৭ হাব", "e.g. Uttara Sector 7 Hub")}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">{txt("শাখার ঠিকানা", "Branch Address")}</label>
                <input
                  type="text"
                  required
                  value={newBranch.address}
                  onChange={(e) => setNewBranch({ ...newBranch, address: e.target.value })}
                  placeholder={txt("যেমন: সোনারগাঁও জনপদ রোড, উত্তরা", "e.g. Sonargaon Janapath Road, Uttara")}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">{txt("যোগাযোগের ফোন নম্বর", "Contact Phone")}</label>
                <input
                  type="tel"
                  required
                  value={newBranch.phone}
                  onChange={(e) => setNewBranch({ ...newBranch, phone: e.target.value })}
                  placeholder="+880 1711-..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">{txt("শাখা ম্যানেজারের নাম", "Branch Manager Name")}</label>
                <input
                  type="text"
                  value={newBranch.managerName}
                  onChange={(e) => setNewBranch({ ...newBranch, managerName: e.target.value })}
                  placeholder={txt("যেমন: শাকিল খান", "e.g. Shakil Khan")}
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
                  {txt("শাখা সংরক্ষণ করুন", "Save Branch")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
