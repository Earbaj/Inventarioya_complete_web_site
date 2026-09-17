"use client";

import { useState, useEffect } from "react";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { SuppliersService } from "@/lib/api/client";
import { Supplier, PurchaseOrder } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Truck, Plus, FileText, Phone, Mail, MapPin, X, CheckCircle } from "lucide-react";

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [activeTab, setActiveTab] = useState<"suppliers" | "orders">("suppliers");
  const [showAddSupplier, setShowAddSupplier] = useState(false);
  const [showCreatePO, setShowCreatePO] = useState(false);

  // New Supplier Form
  const [newSup, setNewSup] = useState<Partial<Supplier>>({
    name: "",
    companyName: "",
    phone: "",
    email: "",
    address: "",
  });

  // New PO Form
  const [newPO, setNewPO] = useState({
    supplierId: "",
    supplierName: "",
    totalCost: 0,
    paidAmount: 0,
    itemsCount: 1,
  });

  useEffect(() => {
    async function loadData() {
      try {
        const [sups, pos] = await Promise.all([
          SuppliersService.getSuppliers(),
          SuppliersService.getPurchaseOrders(),
        ]);
        setSuppliers(sups);
        setPurchaseOrders(pos);
        if (sups.length > 0) {
          setNewPO((prev) => ({
            ...prev,
            supplierId: sups[0].id,
            supplierName: sups[0].companyName,
          }));
        }
      } catch (err) {
        console.error("Failed to load suppliers data", err);
      }
    }
    loadData();
  }, []);

  const handleAddSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await SuppliersService.createSupplier(newSup);
      setSuppliers([created, ...suppliers]);
      setShowAddSupplier(false);
      setNewSup({ name: "", companyName: "", phone: "", email: "", address: "" });
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreatePO = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await SuppliersService.createPurchaseOrder(newPO);
      setPurchaseOrders([created, ...purchaseOrders]);
      setShowCreatePO(false);
      setNewPO({
        supplierId: suppliers[0]?.id || "",
        supplierName: suppliers[0]?.companyName || "",
        totalCost: 0,
        paidAmount: 0,
        itemsCount: 1,
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <DashboardHeader title="Suppliers & Vendor Purchase Orders" />

      <main className="p-6 space-y-6 max-w-7xl">
        {/* Tab & Action Bar */}
        <div className="flex items-center justify-between">
          <div className="flex rounded-xl bg-slate-900 p-1 border border-slate-800 text-xs">
            <button
              onClick={() => setActiveTab("suppliers")}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                activeTab === "suppliers"
                  ? "bg-indigo-600 text-white shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Suppliers Directory ({suppliers.length})
            </button>
            <button
              onClick={() => setActiveTab("orders")}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                activeTab === "orders"
                  ? "bg-indigo-600 text-white shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Purchase Orders ({purchaseOrders.length})
            </button>
          </div>

          <div>
            {activeTab === "suppliers" ? (
              <button
                onClick={() => setShowAddSupplier(true)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 flex items-center gap-1.5 transition-all"
              >
                <Plus className="w-4 h-4" />
                New Supplier
              </button>
            ) : (
              <button
                onClick={() => setShowCreatePO(true)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-600/30 flex items-center gap-1.5 transition-all"
              >
                <Plus className="w-4 h-4" />
                New Purchase Order
              </button>
            )}
          </div>
        </div>

        {/* Suppliers List */}
        {activeTab === "suppliers" ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {suppliers.map((sup) => (
              <div
                key={sup.id}
                className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-indigo-400">{sup.companyName}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                      Vendor
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white mb-2">{sup.name}</h4>
                  <div className="space-y-1 text-xs text-slate-400">
                    <p className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-500" />
                      <span>{sup.phone}</span>
                    </p>
                    {sup.email && (
                      <p className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-slate-500" />
                        <span>{sup.email}</span>
                      </p>
                    )}
                    {sup.address && (
                      <p className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-500" />
                        <span>{sup.address}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Balance Due:</span>
                  <span
                    className={`font-bold ${
                      sup.totalBalanceDue > 0 ? "text-rose-400" : "text-emerald-400"
                    }`}
                  >
                    {formatCurrency(sup.totalBalanceDue)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Purchase Orders Table */
          <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">PO #</th>
                    <th className="py-3 px-4">Supplier / Vendor</th>
                    <th className="py-3 px-4">Order Date</th>
                    <th className="py-3 px-4">Items</th>
                    <th className="py-3 px-4">Total Cost</th>
                    <th className="py-3 px-4">Paid</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {purchaseOrders.map((po) => (
                    <tr key={po.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-indigo-400">
                        {po.poNumber}
                      </td>
                      <td className="py-3 px-4 font-semibold text-white">{po.supplierName}</td>
                      <td className="py-3 px-4 text-slate-400">{po.orderDate}</td>
                      <td className="py-3 px-4 text-slate-300">{po.itemsCount} SKUs</td>
                      <td className="py-3 px-4 font-bold text-white">
                        {formatCurrency(po.totalCost)}
                      </td>
                      <td className="py-3 px-4 text-emerald-400 font-semibold">
                        {formatCurrency(po.paidAmount)}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            po.status === "RECEIVED"
                              ? "bg-emerald-500/20 text-emerald-400"
                              : "bg-amber-500/20 text-amber-400"
                          }`}
                        >
                          {po.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Add Supplier Modal */}
      {showAddSupplier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white">Add New Supplier / Vendor</h3>
              <button
                onClick={() => setShowAddSupplier(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSupplier} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Company / Brand Name</label>
                <input
                  type="text"
                  required
                  value={newSup.companyName}
                  onChange={(e) => setNewSup({ ...newSup, companyName: e.target.value })}
                  placeholder="e.g. Square Consumer Products"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Contact Person Name</label>
                <input
                  type="text"
                  required
                  value={newSup.name}
                  onChange={(e) => setNewSup({ ...newSup, name: e.target.value })}
                  placeholder="e.g. Habib Rahman"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={newSup.phone}
                    onChange={(e) => setNewSup({ ...newSup, phone: e.target.value })}
                    placeholder="+880 1711-..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Email</label>
                  <input
                    type="email"
                    value={newSup.email}
                    onChange={(e) => setNewSup({ ...newSup, email: e.target.value })}
                    placeholder="rep@vendor.com"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Office Address</label>
                <input
                  type="text"
                  value={newSup.address}
                  onChange={(e) => setNewSup({ ...newSup, address: e.target.value })}
                  placeholder="e.g. Mohakhali, Dhaka"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddSupplier(false)}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-md"
                >
                  Save Supplier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Purchase Order Modal */}
      {showCreatePO && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white">Create Purchase Order (PO)</h3>
              <button onClick={() => setShowCreatePO(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreatePO} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Select Supplier</label>
                <select
                  aria-label="Select Supplier"
                  value={newPO.supplierId}
                  onChange={(e) => {
                    const sup = suppliers.find((s) => s.id === e.target.value);
                    setNewPO({
                      ...newPO,
                      supplierId: e.target.value,
                      supplierName: sup?.companyName || "",
                    });
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                >
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.companyName} ({s.name})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Total Bill Cost (৳)</label>
                  <input
                    type="number"
                    required
                    value={newPO.totalCost}
                    onChange={(e) => setNewPO({ ...newPO, totalCost: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Advance Paid (৳)</label>
                  <input
                    type="number"
                    required
                    value={newPO.paidAmount}
                    onChange={(e) => setNewPO({ ...newPO, paidAmount: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Number of Products / SKUs</label>
                <input
                  type="number"
                  min={1}
                  value={newPO.itemsCount}
                  onChange={(e) => setNewPO({ ...newPO, itemsCount: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreatePO(false)}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md"
                >
                  Issue Purchase Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
