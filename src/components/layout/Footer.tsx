"use client";

import Link from "next/link";
import { Boxes, Shield, Mail, Phone } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { GooglePlayIcon } from "@/components/ui/GooglePlayIcon";

export function Footer() {
  const { locale, t } = useLanguage();

  return (
    <footer className="bg-slate-950 border-t border-slate-800 text-slate-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-600/30">
              <Boxes className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-white tracking-tight">
              {t("common.appName")}
            </span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            {t("footer.about")}
          </p>
          <a
            href="https://play.google.com/store/apps/details?id=com.earbaj.inventarioya&pcampaignid=web_share"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-black border border-slate-800 hover:border-slate-700 text-white shadow-md transition-all group w-fit"
          >
            <GooglePlayIcon className="w-5 h-5 shrink-0" />
            <div className="text-left">
              <p className="text-[9px] uppercase tracking-wider text-slate-400 font-bold leading-none">GET IT ON</p>
              <p className="text-xs font-extrabold text-white leading-tight">Google Play</p>
            </div>
          </a>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-3 text-sm">{t("footer.modulesTitle")}</h4>
          <ul className="space-y-2 text-xs">
            <li><Link href="/dashboard/pos" className="hover:text-indigo-400 transition-colors">{t("nav.pos")}</Link></li>
            <li><Link href="/dashboard/customers" className="hover:text-indigo-400 transition-colors">{t("nav.customers")}</Link></li>
            <li><Link href="/dashboard/inventory" className="hover:text-indigo-400 transition-colors">{t("nav.inventory")}</Link></li>
            <li><Link href="/dashboard/expenses" className="hover:text-indigo-400 transition-colors">{t("nav.expenses")}</Link></li>
            <li><Link href="/dashboard/sales" className="hover:text-indigo-400 transition-colors">{t("nav.sales")}</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-3 text-sm">{t("footer.linksTitle")}</h4>
          <ul className="space-y-2 text-xs">
            <li><Link href="/login" className="hover:text-indigo-400 transition-colors">{t("common.signIn")}</Link></li>
            <li><Link href="/register" className="hover:text-indigo-400 transition-colors">{t("common.freeTrial")}</Link></li>
            <li><Link href="/pricing" className="hover:text-indigo-400 transition-colors">{locale === "bn" ? "সাবস্ক্রিপশন প্যাকেজ" : "Pricing Plans"}</Link></li>
            <li><Link href="/dashboard/settings" className="hover:text-indigo-400 transition-colors">{t("nav.settings")}</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-3 text-sm">{t("footer.supportTitle")}</h4>
          <p className="text-xs text-slate-400 mb-3 leading-relaxed">
            {t("footer.supportDesc")}
          </p>
          <div className="space-y-2.5 text-xs text-slate-300">
            <a
              href="mailto:earbajsaria3@gmail.com"
              className="flex items-center gap-2 hover:text-white transition-colors"
            >
              <Mail className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span>earbajsaria3@gmail.com</span>
            </a>
            <a
              href="tel:+8801832999277"
              className="flex items-center gap-2 hover:text-white transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span>+8801832999277</span>
            </a>
            <div className="flex items-center gap-2 text-emerald-400 pt-1">
              <Shield className="w-3.5 h-3.5 shrink-0" />
              <span>{t("footer.cloudBackup")}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-900 py-6 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} {t("footer.copyright")}
      </div>
    </footer>
  );
}
