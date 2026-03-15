import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "ru", "es", "pt", "ar", "id", "hi", "zh"],
  defaultLocale: "en",
  localePrefix: "as-needed",
});
