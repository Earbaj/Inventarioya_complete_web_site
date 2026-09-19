"use client";

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from "react";
import { dictionary, Locale } from "@/locales/dictionary";

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
  t: (path: string, fallback?: string) => string;
  txt: (bn: string, en: string) => string;
  isBangla: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LOCALE_STORAGE_KEY = "inventarioya_locale";

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("bn");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem(LOCALE_STORAGE_KEY) as Locale | null;
      if (stored === "en" || stored === "bn") {
        setLocaleState(stored);
        document.documentElement.lang = stored;
      } else {
        // Default to Bangla
        setLocaleState("bn");
        document.documentElement.lang = "bn";
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  const handleSetLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, newLocale);
      document.documentElement.lang = newLocale;
    } catch {}
  }, []);

  const toggleLocale = useCallback(() => {
    handleSetLocale(locale === "bn" ? "en" : "bn");
  }, [locale, handleSetLocale]);

  // Dot-notation translation accessor: e.g. t("nav.pos")
  const t = useCallback(
    (path: string, fallback?: string): string => {
      const keys = path.split(".");
      let current: any = dictionary[locale];

      for (const key of keys) {
        if (current && typeof current === "object" && key in current) {
          current = current[key];
        } else {
          // Fallback to English dictionary if not found in current locale
          let enFallback: any = dictionary.en;
          for (const enKey of keys) {
            if (enFallback && typeof enFallback === "object" && enKey in enFallback) {
              enFallback = enFallback[enKey];
            } else {
              enFallback = null;
              break;
            }
          }
          return enFallback || fallback || path;
        }
      }

      return typeof current === "string" ? current : fallback || path;
    },
    [locale]
  );

  // Quick inline bilingual helper: txt("বাংলা", "English")
  const txt = useCallback(
    (bn: string, en: string): string => {
      return locale === "bn" ? bn : en;
    },
    [locale]
  );

  const contextValue = useMemo(
    () => ({
      locale,
      setLocale: handleSetLocale,
      toggleLocale,
      t,
      txt,
      isBangla: locale === "bn",
    }),
    [locale, handleSetLocale, toggleLocale, t, txt]
  );

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
