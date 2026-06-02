'use client';

import type { ReactNode } from "react";
import { useEffect } from "react";
import { I18nextProvider } from "react-i18next";

import i18n from "@/lib/i18n";

const STORAGE_KEY = "florlen-language";

type SupportedLanguage = "en" | "vi";

const normalizeLanguage = (value?: string | null): SupportedLanguage => {
  if (value?.startsWith("vi")) return "vi";
  if (value?.startsWith("en")) return "en";
  return "vi";
};

export default function I18nProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const stored = typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null;
    const initial = normalizeLanguage(stored);

    if (i18n.language !== initial) {
      void i18n.changeLanguage(initial);
    }

    document.documentElement.lang = initial;
  }, []);

  useEffect(() => {
    const handleLanguageChanged = (lng: string) => {
      const normalized = normalizeLanguage(lng);
      document.documentElement.lang = normalized;

      if (typeof window !== "undefined") {
        window.localStorage.setItem(STORAGE_KEY, normalized);
      }
    };

    i18n.on("languageChanged", handleLanguageChanged);

    return () => {
      i18n.off("languageChanged", handleLanguageChanged);
    };
  }, []);

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
