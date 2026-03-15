export const TELEGRAM_BOT_URL =
  process.env.NEXT_PUBLIC_TELEGRAM_BOT_URL || "https://t.me/FlyMyPetBot";

/**
 * Human support contact for the escape hatch (help/urgent).
 * Use a real person's Telegram @username, NOT a bot.
 * Users message this account directly when they need immediate assistance.
 */
export const TELEGRAM_SUPPORT_USERNAME =
  process.env.TELEGRAM_SUPPORT_USERNAME || "";

export const SUPPORTED_DESTINATIONS = [
  "Spain",
  "Portugal",
  "Romania",
  "Russia",
] as const;

export const SUPPORTED_ORIGINS = ["Dubai", "Abu Dhabi", "Sharjah"] as const;

export const RELOCATION_STATUSES = [
  { value: "submitted", label: "Submitted", color: "bg-blue-100 text-blue-800" },
  { value: "documents_pending", label: "Documents Pending", color: "bg-yellow-100 text-yellow-800" },
  { value: "vet_verification", label: "Vet Verification", color: "bg-orange-100 text-orange-800" },
  { value: "flight_matching", label: "Flight Matching", color: "bg-purple-100 text-purple-800" },
  { value: "confirmed", label: "Confirmed", color: "bg-indigo-100 text-indigo-800" },
  { value: "in_transit", label: "In Transit", color: "bg-cyan-100 text-cyan-800" },
  { value: "delivered", label: "Delivered", color: "bg-green-100 text-green-800" },
  { value: "cancelled", label: "Cancelled", color: "bg-red-100 text-red-800" },
] as const;

export const PRICING = [
  {
    name: "Basic Coordination",
    range: "€900 – €1,500",
    features: [
      "Document guidance",
      "Vet appointment coordination",
      "Flight booking assistance",
      "Basic support via Telegram",
    ],
  },
  {
    name: "Full Relocation",
    range: "€2,000 – €3,500",
    features: [
      "End-to-end coordination",
      "Document preparation & review",
      "Vet visits arranged",
      "Flight booking & handling",
      "Destination airport pickup",
      "Priority Telegram support",
    ],
    popular: true,
  },
  {
    name: "Rescue Relocation",
    range: "€500 – €1,200",
    features: [
      "Subsidized rescue transport",
      "Shelter coordination",
      "Document preparation",
      "Volunteer flight matching",
      "Adoption support",
    ],
  },
] as const;
