"use client";

import { Invoice } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Printer, X, Download } from "lucide-react";

interface ThermalReceiptProps {
  invoice: Invoice;
  onClose: () => void;
}

export function ThermalReceipt({ invoice, onClose }: ThermalReceiptProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white text-slate-900 rounded-xl shadow-2xl max-w-sm w-full overflow-hidden flex flex-col">
        {/* Action Header (hidden in print) */}
        <div className="bg-slate-900 text-white p-3.5 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <Printer className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold text-xs">Receipt Preview</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded-md shadow flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              Print (80mm)
            </button>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-white rounded-md transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Thermal Receipt Paper */}
        <div id="thermal-receipt" className="p-6 text-xs font-mono leading-relaxed bg-white">
          <div className="text-center pb-3 border-b border-dashed border-slate-400">
            <h2 className="text-sm font-bold tracking-wider uppercase">Dhaka Mega Superstore</h2>
            <p className="text-[10px] text-slate-600">Road 27, Dhanmondi, Dhaka-1209</p>
            <p className="text-[10px] text-slate-600">Tel: +880 1711-223344</p>
            <p className="text-[10px] text-slate-600">BIN: 001928472-0101</p>
            <p className="text-[10px] font-bold mt-1 bg-slate-100 py-0.5">RETAIL INVOICE</p>
          </div>

          <div className="py-2.5 border-b border-dashed border-slate-400 text-[10px] space-y-0.5">
            <div className="flex justify-between">
              <span>Invoice:</span>
              <span className="font-bold">{invoice.invoiceNumber}</span>
            </div>
            <div className="flex justify-between">
              <span>Date:</span>
              <span>{formatDate(invoice.createdAt)}</span>
            </div>
            <div className="flex justify-between">
              <span>Customer:</span>
              <span className="font-semibold">{invoice.customerName}</span>
            </div>
            {invoice.customerPhone && (
              <div className="flex justify-between">
                <span>Phone:</span>
                <span>{invoice.customerPhone}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Cashier:</span>
              <span>{invoice.cashierName}</span>
            </div>
          </div>

          {/* Items Table */}
          <div className="py-2 border-b border-dashed border-slate-400">
            <table className="w-full text-left text-[10px]">
              <thead>
                <tr className="border-b border-slate-300 font-bold">
                  <th className="py-1">Item</th>
                  <th className="py-1 text-center">Qty</th>
                  <th className="py-1 text-right">Rate</th>
                  <th className="py-1 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoice.items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="py-1 pr-1 font-sans text-[10px] font-medium leading-tight">
                      {item.productName}
                    </td>
                    <td className="py-1 text-center">{item.quantity}</td>
                    <td className="py-1 text-right">{item.price}</td>
                    <td className="py-1 text-right font-semibold">{item.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Bill Calculation Summary */}
          <div className="py-2 border-b border-dashed border-slate-400 space-y-1 text-[10px]">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>{formatCurrency(invoice.subtotal)}</span>
            </div>
            {invoice.discount > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>Discount:</span>
                <span>-{formatCurrency(invoice.discount)}</span>
              </div>
            )}
            {invoice.tax > 0 && (
              <div className="flex justify-between">
                <span>Vat / Tax:</span>
                <span>{formatCurrency(invoice.tax)}</span>
              </div>
            )}
            <div className="flex justify-between text-xs font-bold pt-1 border-t border-slate-300">
              <span>Grand Total:</span>
              <span>{formatCurrency(invoice.grandTotal)}</span>
            </div>
            <div className="flex justify-between pt-0.5">
              <span>Paid ({invoice.paymentMethod}):</span>
              <span>{formatCurrency(invoice.paidAmount)}</span>
            </div>
            {invoice.dueAmount > 0 && (
              <div className="flex justify-between text-rose-600 font-bold">
                <span>Due Balance:</span>
                <span>{formatCurrency(invoice.dueAmount)}</span>
              </div>
            )}
          </div>

          {/* Footer note & Barcode */}
          <div className="text-center pt-3 space-y-1">
            <p className="text-[10px] font-bold">Thank you for shopping with us!</p>
            <p className="text-[9px] text-slate-500">Goods once sold cannot be returned without receipt.</p>
            <div className="pt-2 text-[8px] tracking-widest text-slate-400 uppercase">
              * {invoice.invoiceNumber} *
            </div>
            <p className="text-[8px] text-slate-400">Powered by Inventarioya Cloud POS</p>
          </div>
        </div>
      </div>
    </div>
  );
}
