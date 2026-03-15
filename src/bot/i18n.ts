/**
 * Bot i18n — loads translations based on Telegram user's language_code.
 * Supports: en, ru, es, pt, ar, id, hi, zh (fallback to en).
 */

import en from "@/messages/en.json";
import ru from "@/messages/ru.json";
import es from "@/messages/es.json";
import pt from "@/messages/pt.json";
import ar from "@/messages/ar.json";
import id from "@/messages/id.json";
import hi from "@/messages/hi.json";
import zh from "@/messages/zh.json";

export const SUPPORTED_LOCALES = [
  "en",
  "ru",
  "es",
  "pt",
  "ar",
  "id",
  "hi",
  "zh",
] as const;

export type Locale = (typeof SUPPORTED_LOCALES)[number];

const MESSAGES: Record<Locale, Record<string, unknown>> = {
  en: en as Record<string, unknown>,
  ru: ru as Record<string, unknown>,
  es: es as Record<string, unknown>,
  pt: pt as Record<string, unknown>,
  ar: ar as Record<string, unknown>,
  id: id as Record<string, unknown>,
  hi: hi as Record<string, unknown>,
  zh: zh as Record<string, unknown>,
};

function getMessages(locale: Locale): Record<string, unknown> {
  return MESSAGES[locale] ?? MESSAGES.en;
}

/**
 * Resolve locale from Telegram language_code (e.g. "ru", "pt-BR" -> "pt")
 */
export function resolveLocale(languageCode?: string): Locale {
  if (!languageCode) return "en";
  const base = languageCode.split("-")[0].toLowerCase();
  if (SUPPORTED_LOCALES.includes(base as Locale)) return base as Locale;
  return "en";
}

/**
 * Get a nested value from an object by dot path (e.g. "bot.welcome")
 */
function getNested(obj: Record<string, unknown>, path: string): string | undefined {
  const parts = path.split(".");
  let current: unknown = obj;
  for (const part of parts) {
    if (current == null || typeof current !== "object") return undefined;
    current = (current as Record<string, unknown>)[part];
  }
  return typeof current === "string" ? current : undefined;
}

/**
 * Replace placeholders like {username} or {docType} in a string
 */
function interpolate(
  str: string,
  vars: Record<string, string | number>
): string {
  return str.replace(/\{(\w+)\}/g, (_, key) => {
    const v = vars[key];
    return v !== undefined ? String(v) : `{${key}}`;
  });
}

/**
 * Get translated string for the bot. Uses locale from Telegram user.
 * Example: t("en", "bot.welcome") or t("ru", "bot.stepOwnerName", {})
 */
export function t(
  locale: Locale,
  key: string,
  vars: Record<string, string | number> = {}
): string {
  const messages = getMessages(locale);
  const value = getNested(messages as Record<string, unknown>, key);
  const fallback = getNested(MESSAGES.en as Record<string, unknown>, key);
  const str = value ?? fallback ?? key;
  return interpolate(str, vars);
}
