import { Invoice } from "@/types";

/**
 * ডেমো প্রিভিউ ডাটা (Sample Dummy Invoice Data)
 * ইউজার যেন প্রিন্ট বা সেভ করার আগেই বিভিন্ন ফরম্যাট পরীক্ষা করতে পারেন।
 */
export const dummyInvoice: Invoice = {
  id: "demo-inv-001",
  invoiceNumber: "INV-20261101-0082",
  customerName: "আব্দুর রহিম (Rahim Traders)",
  customerPhone: "01712-345678",
  cashierName: "মোঃ ইমরান হোসেন",
  createdAt: new Date().toISOString(),
  date: new Date().toISOString(),
  branchName: "ঢাকা প্রধান শাখা (Main Branch)",
  subtotal: 3000,
  discount: 600,
  tax: 0,
  grandTotal: 2400,
  paidAmount: 2400,
  dueAmount: 0,
  paymentMethod: "CASH",
  status: "PAID",
  items: [
    {
      itemId: "d1",
      name: "প্রিমিয়াম বাসমতি চাল (Basmati Rice 5kg)",
      quantity: 2,
      unitPrice: 650,
      discount: 0,
      totalPrice: 1300,
    },
    {
      itemId: "d2",
      name: "সয়াবিন তেল বোতল (Pure Soybean Oil 5L)",
      quantity: 1,
      unitPrice: 950,
      discount: 0,
      totalPrice: 950,
    },
    {
      itemId: "d3",
      name: "স্পেশাল মসলা গুঁড়া প্যাক (Mixed Spices 500g)",
      quantity: 3,
      unitPrice: 250,
      discount: 0,
      totalPrice: 750,
    },
  ],
};
