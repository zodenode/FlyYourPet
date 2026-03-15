/**
 * Set the Telegram webhook URL. Run after starting ngrok or when deploying.
 *
 * Usage:
 *   npm run webhook:set                           # uses WEBHOOK_URL from .env
 *   npm run webhook:set -- https://abc.ngrok.io   # URL as argument (no /api/webhook needed)
 *   npm run webhook:get                           # check current webhook
 */

import "dotenv/config";

const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) {
  console.error("❌ TELEGRAM_BOT_TOKEN is required in .env");
  process.exit(1);
}

const baseUrl = process.argv[2] || process.env.WEBHOOK_URL;
const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
const api = `https://api.telegram.org/bot${token}`;

async function setWebhook() {
  if (!baseUrl) {
    console.error("❌ Webhook URL required.");
    console.error("   Add WEBHOOK_URL to .env, or run:");
    console.error('   npm run webhook:set -- https://YOUR_NGROK_OR_DOMAIN');
    process.exit(1);
  }

  const url = baseUrl.replace(/\/$/, "") + "/api/webhook";
  const body: { url: string; secret_token?: string } = { url };

  if (secret) {
    body.secret_token = secret;
    console.log("✓ Using TELEGRAM_WEBHOOK_SECRET from .env");
  } else {
    console.log("⚠ TELEGRAM_WEBHOOK_SECRET not set — webhook will accept all requests");
  }

  const res = await fetch(`${api}/setWebhook`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  if (!data.ok) {
    console.error("❌ setWebhook failed:", data.description);
    process.exit(1);
  }

  console.log("✅ Webhook set to:", url);
}

async function getWebhook() {
  const res = await fetch(`${api}/getWebhookInfo`);
  const data = await res.json();

  if (!data.ok) {
    console.error("❌ getWebhookInfo failed:", data.description);
    process.exit(1);
  }

  console.log("Current webhook URL:", data.result.url || "(not set)");
  if (data.result.has_custom_certificate) {
    console.log("Custom certificate: yes");
  }
}

const cmd = process.env.npm_lifecycle_event;
if (cmd === "webhook:get") {
  void getWebhook();
} else {
  void setWebhook();
}
