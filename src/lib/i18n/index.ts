"use client";

import { useAppStore, type Language } from '@/lib/store';
import en from './translations/en.json';
import es from './translations/es.json';

// Type for translations
type Translations = typeof en;

const translations: Record<Language, Translations> = {
  en,
  es,
};

// Helper to get nested value from object using dot notation
function getNestedValue(obj: Record<string, unknown>, path: string): string {
  const value = path.split('.').reduce<unknown>((acc, part) => {
    if (acc && typeof acc === 'object' && part in acc) {
      return (acc as Record<string, unknown>)[part];
    }
    return undefined;
  }, obj);

  return typeof value === 'string' ? value : path;
}

// Main translation hook
export function useTranslation() {
  const language = useAppStore((state) => state.language);

  const t = (key: string, params?: Record<string, string | number>): string => {
    let value = getNestedValue(translations[language] as unknown as Record<string, unknown>, key);

    // Replace parameters like {{count}} with actual values
    if (params) {
      Object.entries(params).forEach(([paramKey, paramValue]) => {
        value = value.replace(new RegExp(`\\{\\{${paramKey}\\}\\}`, 'g'), String(paramValue));
      });
    }

    return value;
  };

  return { t, language };
}

// Get translation without hook (for outside components)
export function getTranslation(language: Language, key: string): string {
  return getNestedValue(translations[language] as unknown as Record<string, unknown>, key);
}

// Export language type for convenience
export type { Language };
