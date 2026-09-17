"use client";

import Link from "next/link";
import { useState } from "react";
import { Boxes, Menu, X, ArrowRight, Smartphone, Sparkles } from "lucide-react";

export function LandingNavbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition-transform">
            <Boxes className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-200 to-indigo-400">
            Inventarioya
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 font-medium">
            Cloud POS & AI
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
          <Link href="/#features" className="hover:text-white transition-colors">Features</Link>
          <Link href="/#pos" className="hover:text-white transition-colors">Cloud POS</Link>
          <Link href="/#ai" className="hover:text-white transition-colors flex items-center gap-1.5 text-indigo-400">
            <Sparkles className="w-4 h-4" />
            Gemini AI
          </Link>
          <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
          <a
            href="https://play.google.com/store/apps/details?id=com.earbaj.inventarioya&pcampaignid=web_share"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-emerald-300 transition-colors flex items-center gap-1 text-emerald-400"
          >
            <Smartphone className="w-4 h-4" />
            Play Store App
          </a>
        </nav>

        {/* CTA Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/login"
            className="px-4 py-2 text-sm font-medium text-slate-200 hover:text-white hover:bg-slate-800/80 rounded-lg transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-md shadow-indigo-600/30 transition-all flex items-center gap-1.5"
          >
            Start Free Trial
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden bg-slate-900 border-b border-slate-800 px-4 py-5 space-y-3">
          <Link href="/#features" onClick={() => setIsOpen(false)} className="block text-slate-300 py-1.5">Features</Link>
          <Link href="/#pos" onClick={() => setIsOpen(false)} className="block text-slate-300 py-1.5">Cloud POS</Link>
          <Link href="/#ai" onClick={() => setIsOpen(false)} className="block text-indigo-400 py-1.5">Gemini AI Intelligence</Link>
          <Link href="/pricing" onClick={() => setIsOpen(false)} className="block text-slate-300 py-1.5">Pricing</Link>
          <a
            href="https://play.google.com/store/apps/details?id=com.earbaj.inventarioya&pcampaignid=web_share"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-1 text-emerald-400 py-1.5"
          >
            <Smartphone className="w-4 h-4" />
            Download Android App
          </a>
          <div className="pt-4 border-t border-slate-800 flex flex-col gap-2">
            <Link href="/login" className="w-full text-center py-2.5 rounded-lg text-slate-200 bg-slate-800 text-sm font-medium">Sign In</Link>
            <Link href="/register" className="w-full text-center py-2.5 rounded-lg text-white bg-indigo-600 text-sm font-medium">Start Free Trial</Link>
          </div>
        </div>
      )}
    </header>
  );
}
