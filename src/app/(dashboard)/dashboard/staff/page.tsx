"use client";

import { useState, useEffect } from "react";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { StaffService, BranchesService } from "@/lib/api/client";
import { StaffMember, Branch } from "@/types";
import {
  Users,
  Plus,
  ShieldCheck,
  Trash2,
  X,
  Check,
  Eye,
  EyeOff,
  Building2,
  RefreshCw,
  AlertCircle,
  Key,
  Mail,
  Phone,
  User,
} from "lucide-react";

const allAvailablePermissions = [
  {
    key: "canViewBuyPrice",
    label: "View Purchases / Costs",
    description: "Allow viewing product purchase prices and wholesale costs in inventory",
  },
  {
    key: "canEditCustomers",
    label: "Edit Customer",
    description: "Permission to modify customer profiles, phone numbers, and balances",
  },
  {
    key: "canProcessReturn",
    label: "Process Returns and refund",
    description: "Permission to authorize sales returns, item exchanges, and cash refunds",
  },
  {
    key: "canExportExcel",
    label: "Export Excell reports",
    description: "Permission to download sales, inventory, and financial Excel spreadsheets",
  },
];

export default function StaffPage() {
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals & form state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPermissionsStaff, setEditingPermissionsStaff] = useState<StaffMember | null>(null);
  const [activePermissions, setActivePermissions] = useState<string[]>([]);

  // Password visibility toggle
  const [showPassword, setShowPassword] = useState(false);

  // Form submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // New staff form: Name, Email, Password, Phone, Role, Branch
  const [newStaff, setNewStaff] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    role: "manager",
    branchId: "",
    branchName: "",
  });

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [staffData, branchData] = await Promise.all([
          StaffService.getStaff(),
          BranchesService.getBranches(),
        ]);
        setStaffList(staffData);
        setBranches(branchData);
      } catch (err) {
        console.error("Failed to load staff/branches data", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaff.password || newStaff.password.length < 6) {
      setActionError("Password must be at least 6 characters long.");
      return;
    }

    setIsSubmitting(true);
    setActionError(null);

    try {
      const created = await StaffService.createStaff(newStaff);
      setStaffList([created, ...staffList]);
      setShowAddModal(false);
      setNewStaff({
        name: "",
        email: "",
        password: "",
        phone: "",
        role: "manager",
        branchId: "",
        branchName: "",
      });
      setShowPassword(false);
    } catch (err: any) {
      console.error("Failed to create staff member", err);
      setActionError(err.message || "Failed to create staff member.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenPermissions = (staff: StaffMember) => {
    setEditingPermissionsStaff(staff);
    const activeKeys: string[] = [];
    allAvailablePermissions.forEach((p) => {
      if (Array.isArray(staff.permissions)) {
        if (staff.permissions.includes(p.key)) activeKeys.push(p.key);
      } else if (staff.permissionsObj && (staff.permissionsObj as any)[p.key]) {
        activeKeys.push(p.key);
      } else if ((staff.permissions as any)?.[p.key]) {
        activeKeys.push(p.key);
      }
    });
    setActivePermissions(activeKeys);
  };

  const togglePermission = (permKey: string) => {
    setActivePermissions((prev) =>
      prev.includes(permKey) ? prev.filter((p) => p !== permKey) : [...prev, permKey]
    );
  };

  const handleSavePermissions = async () => {
    if (!editingPermissionsStaff) return;
    setIsSubmitting(true);
    try {
      const permObj: Record<string, boolean> = {
        canViewBuyPrice: activePermissions.includes("canViewBuyPrice"),
        canEditCustomers: activePermissions.includes("canEditCustomers"),
        canProcessReturn: activePermissions.includes("canProcessReturn"),
        canExportExcel: activePermissions.includes("canExportExcel"),
      };

      await StaffService.updatePermissions(editingPermissionsStaff.id, permObj);
      setStaffList((prev) =>
        prev.map((s) =>
          s.id === editingPermissionsStaff.id
            ? {
                ...s,
                permissions: activePermissions,
                permissionsObj: permObj,
              }
            : s
        )
      );
      setEditingPermissionsStaff(null);
    } catch (err: any) {
      console.error("Failed to save permissions", err);
      alert(err.message || "Failed to save permissions.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteStaff = async (id: string) => {
    if (!confirm("Remove this staff member from your shop?")) return;
    try {
      await StaffService.deleteStaff(id);
      setStaffList(staffList.filter((s) => s.id !== id));
    } catch (err: any) {
      console.error("Failed to delete staff", err);
      alert(err.message || "Failed to delete staff member.");
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <DashboardHeader title="Staff Accounts & Granular Permissions" />

      <main className="p-4 sm:p-6 space-y-6 max-w-7xl w-full mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-400" />
              <span>Active Shop Employees ({staffList.length})</span>
            </h3>
            <p className="text-xs text-slate-400">Manage cashiers, managers, branch assignments, and access privileges</p>
          </div>
          <button
            onClick={() => {
              setActionError(null);
              setShowAddModal(true);
            }}
            className="w-full sm:w-auto justify-center px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Staff Member</span>
          </button>
        </div>

        {/* Staff Table */}
        <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px] text-left text-xs">
              <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Name</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Contact</th>
                  <th className="py-3.5 px-4">Assigned Branch</th>
                  <th className="py-3.5 px-4">Permissions</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {staffList.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500">
                      {isLoading ? "Loading staff members..." : "No staff members recorded yet."}
                    </td>
                  </tr>
                ) : (
                  staffList.map((member) => (
                    <tr key={member.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-white">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold text-xs uppercase">
                            {member.name ? member.name.charAt(0) : "U"}
                          </div>
                          <span>{member.name}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                          {member.role}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-300">
                        <p>{member.phone || "—"}</p>
                        <p className="text-[11px] text-slate-500">{member.email}</p>
                      </td>
                      <td className="py-3.5 px-4 text-slate-300">
                        <span className="inline-flex items-center gap-1.5 text-slate-300">
                          <Building2 className="w-3.5 h-3.5 text-slate-500" />
                          <span>{member.branchName || "All Branches"}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        {(() => {
                          const activeCount = allAvailablePermissions.filter((p) => {
                            if (Array.isArray(member.permissions)) {
                              return member.permissions.includes(p.key);
                            }
                            if (member.permissionsObj) {
                              return Boolean((member.permissionsObj as any)[p.key]);
                            }
                            return Boolean((member.permissions as any)?.[p.key]);
                          }).length;

                          return (
                            <button
                              onClick={() => handleOpenPermissions(member)}
                              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium inline-flex items-center gap-1.5 transition-colors border border-slate-700/60"
                            >
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                              <span>{activeCount} of 4 Permissions</span>
                            </button>
                          );
                        })()}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleDeleteStaff(member.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                          title="Delete staff"
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

      {/* Permissions Matrix Modal */}
      {editingPermissionsStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Permissions: {editingPermissionsStaff.name}</span>
                </h3>
                <p className="text-[11px] text-slate-400">Configure the 4 core permissions for this employee</p>
              </div>
              <button
                onClick={() => setEditingPermissionsStaff(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center justify-between text-[11px] text-slate-400 px-1 py-1.5 border-y border-slate-800/80 mb-3">
              <span>{activePermissions.length} of 4 Selected</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActivePermissions(allAvailablePermissions.map((p) => p.key))}
                  className="text-indigo-400 hover:underline font-medium"
                >
                  Select All
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => setActivePermissions([])}
                  className="text-slate-400 hover:underline font-medium"
                >
                  Clear All
                </button>
              </div>
            </div>

            <div className="space-y-2.5 my-3 max-h-80 overflow-y-auto pr-1">
              {allAvailablePermissions.map((perm) => {
                const isSelected = activePermissions.includes(perm.key);
                return (
                  <div
                    key={perm.key}
                    onClick={() => togglePermission(perm.key)}
                    className={`p-3 rounded-xl border cursor-pointer flex items-start justify-between gap-3 transition-colors ${
                      isSelected
                        ? "bg-indigo-950/40 border-indigo-500/60 text-white shadow-sm"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    <div>
                      <span className="text-xs font-bold text-white block">{perm.label}</span>
                      <span className="text-[11px] text-slate-400 block mt-0.5 leading-snug">
                        {perm.description}
                      </span>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                        isSelected ? "bg-indigo-600 text-white" : "border border-slate-700 bg-slate-900"
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-3 flex justify-end gap-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setEditingPermissionsStaff(null)}
                className="px-3.5 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleSavePermissions}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md flex items-center gap-1.5 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>Save Permissions</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Staff Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl my-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Create Staff Member</h3>
                  <p className="text-[11px] text-slate-400">Add credentials and assign store branch</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {actionError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{actionError}</span>
              </div>
            )}

            <form onSubmit={handleCreateStaff} className="space-y-3.5 text-xs">
              {/* Name */}
              <div>
                <label className="block text-slate-300 font-medium mb-1">Full Name *</label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={newStaff.name}
                    onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                    placeholder="e.g. Tasnim Anjum"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-slate-300 font-medium mb-1">Email Address *</label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={newStaff.email}
                    onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                    placeholder="staff@store.com"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Account Password * <span className="text-slate-500 font-normal">(min 6 characters)</span>
                </label>
                <div className="relative">
                  <Key className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    value={newStaff.password}
                    onChange={(e) => setNewStaff({ ...newStaff, password: e.target.value })}
                    placeholder="Enter secure password"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-10 py-2 text-white focus:outline-none focus:border-indigo-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Phone & Role */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Phone Number *</label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      value={newStaff.phone}
                      onChange={(e) => setNewStaff({ ...newStaff, phone: e.target.value })}
                      placeholder="+880 1711-..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Role *</label>
                  <select
                    aria-label="Staff Role"
                    value={newStaff.role}
                    onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                    <option value="cashier">Cashier</option>
                  </select>
                </div>
              </div>

              {/* Branch Selection */}
              <div>
                <label className="block text-slate-300 font-medium mb-1">Assigned Branch Outlet</label>
                <div className="relative">
                  <Building2 className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select
                    aria-label="Assigned Branch"
                    value={newStaff.branchId}
                    onChange={(e) => {
                      const selected = branches.find((b) => b.id === e.target.value);
                      setNewStaff({
                        ...newStaff,
                        branchId: e.target.value,
                        branchName: selected?.name || "",
                      });
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">All Branches / Main Outlet</option>
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} {b.address ? `(${b.address})` : ""}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 flex justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-md flex items-center gap-1.5 disabled:opacity-50 transition-all"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Create Staff Member</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
