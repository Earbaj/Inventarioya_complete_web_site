"use client";

import { useState, useEffect } from "react";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { StaffService } from "@/lib/api/client";
import { StaffMember } from "@/types";
import { Users, Plus, ShieldCheck, Trash2, Edit3, X, Check } from "lucide-react";

const allAvailablePermissions = [
  { key: "sales_create", label: "Create POS Bills & Checkout" },
  { key: "sales_read", label: "View Sales History & Reports" },
  { key: "print_receipt", label: "Print Thermal Receipts" },
  { key: "inventory_edit", label: "Modify Product Prices & Stock" },
  { key: "inventory_read", label: "View Product Catalog" },
  { key: "suppliers_manage", label: "Manage Vendors & Purchase Orders" },
  { key: "expenses_manage", label: "Record & Delete Shop Expenses" },
  { key: "trash_manage", label: "Access Recycle Bin & Restorations" },
];

export default function StaffPage() {
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPermissionsStaff, setEditingPermissionsStaff] = useState<StaffMember | null>(null);
  const [activePermissions, setActivePermissions] = useState<string[]>([]);

  // New staff form
  const [newStaff, setNewStaff] = useState<Partial<StaffMember>>({
    name: "",
    email: "",
    phone: "",
    role: "cashier",
    branchName: "Main Flagship Branch",
    permissions: ["sales_create", "sales_read", "print_receipt"],
  });

  useEffect(() => {
    async function loadStaff() {
      try {
        const data = await StaffService.getStaff();
        setStaffList(data);
      } catch (err) {
        console.error(err);
      }
    }
    loadStaff();
  }, []);

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await StaffService.createStaff(newStaff);
      setStaffList([...staffList, created]);
      setShowAddModal(false);
      setNewStaff({
        name: "",
        email: "",
        phone: "",
        role: "cashier",
        branchName: "Main Flagship Branch",
        permissions: ["sales_create", "sales_read", "print_receipt"],
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenPermissions = (staff: StaffMember) => {
    setEditingPermissionsStaff(staff);
    setActivePermissions(staff.permissions || []);
  };

  const togglePermission = (permKey: string) => {
    setActivePermissions((prev) =>
      prev.includes(permKey) ? prev.filter((p) => p !== permKey) : [...prev, permKey]
    );
  };

  const handleSavePermissions = async () => {
    if (!editingPermissionsStaff) return;
    try {
      await StaffService.updatePermissions(editingPermissionsStaff.id, activePermissions);
      setStaffList(
        staffList.map((s) =>
          s.id === editingPermissionsStaff.id ? { ...s, permissions: activePermissions } : s
        )
      );
      setEditingPermissionsStaff(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteStaff = async (id: string) => {
    if (!confirm("Remove this staff member from your shop?")) return;
    try {
      await StaffService.deleteStaff(id);
      setStaffList(staffList.filter((s) => s.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <DashboardHeader title="Staff Accounts & Granular Permissions" />

      <main className="p-6 space-y-6 max-w-7xl">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white">Active Shop Employees</h3>
            <p className="text-xs text-slate-400">Manage cashiers, shift managers, and access privileges</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Staff Member
          </button>
        </div>

        {/* Staff Table */}
        <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Assigned Branch</th>
                  <th className="py-3 px-4">Permissions</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {staffList.map((member) => (
                  <tr key={member.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-semibold text-white">{member.name}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        {member.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      <p>{member.phone}</p>
                      <p className="text-[10px] text-slate-500">{member.email}</p>
                    </td>
                    <td className="py-3 px-4 text-slate-300">{member.branchName || "All Branches"}</td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleOpenPermissions(member)}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium inline-flex items-center gap-1.5 transition-colors border border-slate-700/60"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{member.permissions?.length || 0} Permissions</span>
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleDeleteStaff(member.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                        title="Delete staff"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Permissions Matrix Modal */}
      {editingPermissionsStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-white">
                  Permissions: {editingPermissionsStaff.name}
                </h3>
                <p className="text-[11px] text-slate-400">Configure feature access for this role</p>
              </div>
              <button
                onClick={() => setEditingPermissionsStaff(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 my-4 max-h-72 overflow-y-auto pr-1">
              {allAvailablePermissions.map((perm) => {
                const isSelected = activePermissions.includes(perm.key);
                return (
                  <div
                    key={perm.key}
                    onClick={() => togglePermission(perm.key)}
                    className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between transition-colors ${
                      isSelected
                        ? "bg-indigo-950/40 border-indigo-500/60 text-white"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    <span className="text-xs font-medium">{perm.label}</span>
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center ${
                        isSelected ? "bg-indigo-600 text-white" : "border border-slate-700"
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setEditingPermissionsStaff(null)}
                className="px-3.5 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSavePermissions}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md"
              >
                Save Permissions
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Staff Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white">Create Staff Member</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateStaff} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newStaff.name}
                  onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                  placeholder="e.g. Tasnim Anjum"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={newStaff.email}
                  onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                  placeholder="staff@store.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Phone</label>
                  <input
                    type="tel"
                    required
                    value={newStaff.phone}
                    onChange={(e) => setNewStaff({ ...newStaff, phone: e.target.value })}
                    placeholder="+880 1711-..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Role</label>
                  <select
                    aria-label="Staff Role"
                    value={newStaff.role}
                    onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="cashier">Cashier</option>
                    <option value="manager">Manager</option>
                    <option value="staff">Staff</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-md"
                >
                  Save Staff
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
