"use client";

import React from "react";
import { useLanguage } from "@/context/LanguageContext";
import { FileSpreadsheet, Upload, X } from "lucide-react";

export interface CsvImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedFile: File | null;
  setSelectedFile: (file: File | null) => void;
  importStatus: string;
  canViewBuyPrice: boolean;
  onImportCsv: (e: React.FormEvent) => void;
}

/**
 * বাল্ক CSV ইনভেন্টরি ইমপোর্ট মোডাল (Bulk CSV Inventory Import Modal)
 * CSV ফাইল আপলোড করে এক ক্লিকে শত শত পণ্য ইনভেন্টরিতে ইমপোর্ট করার সুবিধা দেয়।
 */
export function CsvImportModal({
  isOpen,
  onClose,
  selectedFile,
  setSelectedFile,
  importStatus,
  canViewBuyPrice,
  onImportCsv,
}: CsvImportModalProps) {
  const { txt } = useLanguage();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl max-h-[90vh] overflow-y-auto my-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-bold text-white">
              {txt("একসাথে বাল্ক CSV ইনভেন্টরি ইমপোর্ট", "Bulk CSV Inventory Import")}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-400 mb-4">
          {txt(
            "এমন একটি .csv ফাইল আপলোড করুন যাতে কলাম থাকবে: ",
            "Upload a .csv file containing columns: "
          )}
          <span className="text-white font-mono">
            name, sku{canViewBuyPrice ? ", costPrice" : ""}, sellingPrice, stockQuantity, unit
          </span>
          .
        </p>

        <form onSubmit={onImportCsv} className="space-y-4">
          <div className="border-2 border-dashed border-slate-700 rounded-xl p-6 text-center hover:border-indigo-500 transition-colors">
            <input
              type="file"
              accept=".csv"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              className="hidden"
              id="csv-file-input"
            />
            <label htmlFor="csv-file-input" className="cursor-pointer">
              <Upload className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
              <span className="text-xs text-white font-medium block">
                {selectedFile
                  ? selectedFile.name
                  : txt("কম্পিউটার থেকে CSV ফাইল নির্বাচন করুন", "Select CSV File from computer")}
              </span>
              <span className="text-[10px] text-slate-500 mt-1 block">
                {txt("সর্বোচ্চ সাইজ: ৫ মেগাবাইট", "Max size: 5MB")}
              </span>
            </label>
          </div>

          {importStatus && (
            <p className="text-xs text-emerald-400 text-center font-medium">{importStatus}</p>
          )}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-semibold cursor-pointer"
            >
              {txt("বাতিল", "Cancel")}
            </button>
            <button
              type="submit"
              disabled={!selectedFile}
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white text-xs font-bold shadow-md cursor-pointer disabled:cursor-not-allowed"
            >
              {txt("আপলোড ও ইমপোর্ট করুন", "Upload & Import")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
