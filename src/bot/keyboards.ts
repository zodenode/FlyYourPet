import { Markup } from "telegraf";
import type { OnboardStep } from "@prisma/client";
import { t, type Locale } from "./i18n";

/** Build inline keyboard for step selection. Callback format: s:step:value */
function stepButtons(
  step: OnboardStep,
  options: Array<{ labelKey?: string; label?: string; value: string }>,
  locale: Locale,
  cols = 2
) {
  const rows: Array<Array<{ text: string; callback_data: string }>> = [];
  for (let i = 0; i < options.length; i += cols) {
    rows.push(
      options.slice(i, i + cols).map((o) => ({
        text: o.labelKey ? t(locale, o.labelKey) : o.label!,
        callback_data: `s:${step}:${o.value}`,
      }))
    );
  }
  return Markup.inlineKeyboard(rows);
}

export const KEYBOARDS = {
  /** UAE cities for origin */
  origin: (locale: Locale) =>
    stepButtons(
      "travel_origin",
      [
        { label: "🇦🇪 Dubai", value: "Dubai" },
        { label: "🇦🇪 Abu Dhabi", value: "Abu Dhabi" },
        { label: "🇦🇪 Sharjah", value: "Sharjah" },
        { label: "🇦🇪 Other", value: "other" },
      ],
      locale
    ),

  /** Destination countries */
  destination: (locale: Locale) =>
    stepButtons(
      "travel_destination",
      [
        { label: "🇪🇸 Spain", value: "Spain" },
        { label: "🇵🇹 Portugal", value: "Portugal" },
        { label: "🇷🇴 Romania", value: "Romania" },
        { label: "🇷🇺 Russia", value: "Russia" },
      ],
      locale
    ),

  /** Pet type */
  petType: (locale: Locale) =>
    stepButtons(
      "pet_type",
      [
        { label: "🐱 Cat", value: "cat" },
        { label: "🐕 Dog", value: "dog" },
      ],
      locale
    ),

  /** Common cat/dog breeds */
  petBreed: (petType: string, locale: Locale) =>
    stepButtons(
      "pet_breed",
      petType === "dog"
        ? [
            { label: "Golden Retriever", value: "Golden Retriever" },
            { label: "Labrador", value: "Labrador" },
            { label: "German Shepherd", value: "German Shepherd" },
            { label: "Husky", value: "Husky" },
            { label: "Mixed", value: "Mixed" },
            { label: "Other", value: "Other" },
          ]
        : [
            { label: "Persian", value: "Persian" },
            { label: "Siamese", value: "Siamese" },
            { label: "British Shorthair", value: "British Shorthair" },
            { label: "Maine Coon", value: "Maine Coon" },
            { label: "Mixed", value: "Mixed" },
            { label: "Other", value: "Other" },
          ],
      locale
    ),

  /** Age ranges */
  petAge: (locale: Locale) =>
    stepButtons(
      "pet_age",
      [
        { label: "< 1 year", value: "<1 year" },
        { label: "1–3 years", value: "1-3 years" },
        { label: "3–5 years", value: "3-5 years" },
        { label: "5+ years", value: "5+ years" },
      ],
      locale
    ),

  /** Weight ranges (kg) */
  petWeight: (locale: Locale) =>
    stepButtons(
      "pet_weight",
      [
        { label: "< 3 kg", value: "<3" },
        { label: "3–5 kg", value: "3-5" },
        { label: "5–8 kg", value: "5-8" },
        { label: "8+ kg", value: "8+" },
      ],
      locale
    ),

  /** Microchip: has or not */
  petMicrochip: (locale: Locale) =>
    stepButtons(
      "pet_microchip",
      [
        { labelKey: "bot.keyboardTypeMicrochip", value: "type" },
        { labelKey: "bot.keyboardNoMicrochip", value: "none" },
      ],
      locale
    ),

  /** Dates flexible */
  travelFlex: (locale: Locale) =>
    stepButtons(
      "travel_flex",
      [
        { labelKey: "bot.keyboardYes", value: "yes" },
        { labelKey: "bot.keyboardNo", value: "no" },
      ],
      locale
    ),

  /** Quick date options */
  travelDate: (locale: Locale) =>
    stepButtons(
      "travel_date",
      [
        { labelKey: "bot.keyboardAsap", value: "ASAP" },
        { labelKey: "bot.keyboardThisMonth", value: "this_month" },
        { labelKey: "bot.keyboardNextMonth", value: "next_month" },
        { labelKey: "bot.keyboardTypeDate", value: "custom" },
      ],
      locale
    ),

  /** Owner city */
  ownerCity: (locale: Locale) =>
    stepButtons(
      "owner_city",
      [
        { label: "🇦🇪 Dubai", value: "Dubai" },
        { label: "🇦🇪 Abu Dhabi", value: "Abu Dhabi" },
        { label: "🇦🇪 Sharjah", value: "Sharjah" },
        { label: "🇦🇪 Other", value: "other" },
      ],
      locale
    ),

  /** Documents: Done button */
  docDone: (locale: Locale) =>
    Markup.inlineKeyboard([
      [
        Markup.button.callback(
          t(locale, "bot.keyboardDoneUploading"),
          "doc:done"
        ),
      ],
    ]),

  /** Get keyboard for a step (some need state, e.g. pet_breed needs pet type) */
  forStep: (step: OnboardStep, petType?: string, locale?: Locale) => {
    const loc = locale ?? ("en" as Locale);
    switch (step) {
      case "owner_city":
        return KEYBOARDS.ownerCity(loc);
      case "pet_type":
        return KEYBOARDS.petType(loc);
      case "pet_breed":
        return KEYBOARDS.petBreed(petType || "cat", loc);
      case "pet_age":
        return KEYBOARDS.petAge(loc);
      case "pet_weight":
        return KEYBOARDS.petWeight(loc);
      case "pet_microchip":
        return KEYBOARDS.petMicrochip(loc);
      case "travel_origin":
        return KEYBOARDS.origin(loc);
      case "travel_destination":
        return KEYBOARDS.destination(loc);
      case "travel_date":
        return KEYBOARDS.travelDate(loc);
      case "travel_flex":
        return KEYBOARDS.travelFlex(loc);
      case "documents":
        return KEYBOARDS.docDone(loc);
      default:
        return undefined;
    }
  },

  /** Document type selection when uploading */
  docType: (locale: Locale) =>
    Markup.inlineKeyboard([
      [
        Markup.button.callback(
          t(locale, "bot.keyboardVaccination"),
          "doc:type:vaccination_card"
        ),
        Markup.button.callback(
          t(locale, "bot.keyboardRabiesCert"),
          "doc:type:rabies_certificate"
        ),
      ],
      [
        Markup.button.callback(
          t(locale, "bot.keyboardPetPassport"),
          "doc:type:pet_passport"
        ),
        Markup.button.callback(
          t(locale, "bot.keyboardOwnerId"),
          "doc:type:owner_id"
        ),
      ],
    ]),
} as const;

/** Reply keyboard with "Share Contact" for phone - one-time use */
export function contactRequestKeyboard(locale: Locale = "en") {
  return Markup.keyboard([
    [Markup.button.contactRequest(t(locale, "bot.keyboardSharePhone"))],
    [Markup.button.text(t(locale, "bot.keyboardTypePhone"))],
  ])
    .oneTime()
    .resize();
}

/** Remove reply keyboard after we got what we needed */
export function removeKeyboard() {
  return Markup.removeKeyboard();
}
