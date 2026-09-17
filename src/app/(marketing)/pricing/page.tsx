"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LandingNavbar } from "@/components/layout/LandingNavbar";
import { Footer } from "@/components/layout/Footer";
import { SubscriptionsService } from "@/lib/api/client";
import { SubscriptionPackage, PaymentInfo } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { Check, Sparkles, Building, CreditCard, ShieldCheck, ArrowRight } from "lucide-react";

export default function PricingPage() {
  const [packages, setPackages] = useState<SubscriptionPackage[]>([]);
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [pkgs, pInfo] = await Promise.all([
          SubscriptionsService.getPackages(),
          SubscriptionsService.getPaymentInfo(),
        ]);
        setPackages(pkgs);
        setPaymentInfo(pInfo);
      } catch (err) {
        console.error("Failed to load pricing packages", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-600 selection:text-white">
      <LandingNavbar />

      <main className="pt-32 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold">
            Simple & Transparent Pricing
          </span>
          <h1 className="mt-4 text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Choose the Perfect Plan for Your Business
          </h1>
          <p className="mt-3 text-slate-400 text-sm sm:text-base">
            All plans include full cloud synchronization with the Android mobile app, unlimited invoices, and automated data backups.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className={`rounded-3xl p-8 transition-all relative flex flex-col justify-between ${
                pkg.isPopular
                  ? "bg-gradient-to-b from-indigo-950/80 to-slate-900 border-2 border-indigo-500 shadow-2xl shadow-indigo-500/20"
                  : "bg-slate-900/60 border border-slate-800"
              }`}
            >
              {pkg.isPopular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-indigo-600 text-white text-xs font-bold tracking-wide shadow-md flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  MOST POPULAR
                </div>
              )}

              <div>
                <h3 className="text-xl font-bold text-white mb-1">{pkg.name}</h3>
                <p className="text-xs text-slate-400 mb-6">
                  {pkg.maxBranches} Branch{pkg.maxBranches > 1 ? "es" : ""} • Up to {pkg.maxStaff} Staff
                </p>

                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-extrabold text-white">
                    {formatCurrency(pkg.price)}
                  </span>
                  <span className="text-xs text-slate-400">/{pkg.billingPeriod}</span>
                </div>

                <div className="space-y-3 pt-6 border-t border-slate-800 text-xs text-slate-300 mb-8">
                  {pkg.features.map((feat, i) => (
                    <div key={i} className="flex items-center gap-2.5">
                      <div className="w-4 h-4 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3" />
                      </div>
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Link
                href={`/dashboard/subscriptions?packageId=${pkg.id}`}
                className={`w-full py-3 rounded-xl text-xs font-bold text-center transition-all flex items-center justify-center gap-1.5 ${
                  pkg.isPopular
                    ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30"
                    : "bg-slate-800 hover:bg-slate-700 text-slate-200"
                }`}
              >
                Choose {pkg.name}
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ))}
        </div>

        {/* Merchant Payment Details Guide */}
        {paymentInfo && (
          <div className="rounded-3xl bg-slate-900 border border-slate-800 p-8 sm:p-10 max-w-4xl mx-auto shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Local Payment Gateway & Merchant Numbers</h3>
                <p className="text-xs text-slate-400">Accepted methods: bKash, Nagad, Rocket, and Bank Transfer</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <p className="text-xs font-semibold text-pink-400 uppercase">bKash Merchant</p>
                <p className="text-sm font-bold text-white mt-1 font-mono">{paymentInfo.bkashNumber}</p>
                <span className="text-[10px] text-slate-500">Use 'Make Payment'</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <p className="text-xs font-semibold text-orange-400 uppercase">Nagad Merchant</p>
                <p className="text-sm font-bold text-white mt-1 font-mono">{paymentInfo.nagadNumber}</p>
                <span className="text-[10px] text-slate-500">Merchant Payment</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <p className="text-xs font-semibold text-purple-400 uppercase">Rocket Personal</p>
                <p className="text-sm font-bold text-white mt-1 font-mono">{paymentInfo.rocketNumber}</p>
                <span className="text-[10px] text-slate-500">Send Money</span>
              </div>
            </div>

            {paymentInfo.bankAccount && (
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 mb-6 text-xs space-y-1">
                <p className="font-bold text-white">Bank Account Transfer Details:</p>
                <p className="text-slate-300">Bank: <span className="text-white font-medium">{paymentInfo.bankAccount.bankName}</span></p>
                <p className="text-slate-300">Account Name: <span className="text-white font-medium">{paymentInfo.bankAccount.accountName}</span></p>
                <p className="text-slate-300">A/C Number: <span className="text-white font-mono font-medium">{paymentInfo.bankAccount.accountNumber}</span> ({paymentInfo.bankAccount.branchName})</p>
              </div>
            )}

            <div className="space-y-1.5 text-xs text-slate-400">
              {paymentInfo.instructionNotes?.map((note, idx) => (
                <p key={idx} className="flex items-start gap-2">
                  <span className="text-indigo-400 font-bold">•</span>
                  <span>{note}</span>
                </p>
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
