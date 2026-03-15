import { t, type Locale } from "@/bot/i18n";

const TELEGRAM_API = "https://api.telegram.org/bot";

const STATUS_KEYS: Record<string, string> = {
  documents_pending: "bot.notificationDocumentsPending",
  vet_verification: "bot.notificationVetVerification",
  flight_matching: "bot.notificationFlightMatching",
  confirmed: "bot.notificationConfirmed",
  in_transit: "bot.notificationInTransit",
  delivered: "bot.notificationDelivered",
  cancelled: "bot.notificationCancelled",
};

export async function sendStatusNotification(
  telegramId: string,
  status: string,
  petName: string,
  locale: Locale = "en"
) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    console.warn("TELEGRAM_BOT_TOKEN not set, skipping notification");
    return;
  }

  const key = STATUS_KEYS[status];
  if (!key) return;
  const statusMsg = t(locale, key);

  const message = `🐾 *FlyMy\\.Pet Update*\n\nPet: ${escapeMarkdown(petName)}\n\n${escapeMarkdown(statusMsg)}`;

  try {
    await fetch(`${TELEGRAM_API}${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: telegramId,
        text: message,
        parse_mode: "MarkdownV2",
      }),
    });
  } catch (error) {
    console.error("Failed to send Telegram notification:", error);
  }
}

function escapeMarkdown(text: string): string {
  return text.replace(/([_*[\]()~`>#+\-=|{}.!])/g, "\\$1");
}
