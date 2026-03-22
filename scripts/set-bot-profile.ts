/**
 * Set the Telegram bot's profile photo. Run once after creating the bot.
 *
 * Requires: Bot API 9.4+ (Feb 2026) for setMyProfilePhoto.
 * Uses public/bot-avatar.png - convert to JPG if the API rejects PNG.
 * The /start greeting uses public/bot-welcome.png (replace with your hero art).
 *
 * Usage:
 *   npm run bot:profile
 */

import "dotenv/config";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) {
  console.error("❌ TELEGRAM_BOT_TOKEN is required in .env");
  process.exit(1);
}

const api = `https://api.telegram.org/bot${token}`;

const avatarPath = join(process.cwd(), "public", "bot-avatar.png");
if (!existsSync(avatarPath)) {
  console.error("❌ Avatar not found at public/bot-avatar.png");
  process.exit(1);
}


// InputProfilePhotoStatic requires: type + photo (attach://fieldname)
async function setProfilePhotoSimple() {
  const photoBuffer = readFileSync(avatarPath);
  const blob = new Blob([photoBuffer], { type: "image/png" });

  const formData = new FormData();
  formData.append("photo", JSON.stringify({ type: "static", photo: "attach://avatar" }));
  formData.append("avatar", blob, "bot-avatar.png");

  const res = await fetch(`${api}/setMyProfilePhoto`, {
    method: "POST",
    body: formData,
  });

  const data = (await res.json()) as { ok: boolean; description?: string };
  if (!data.ok) {
    console.error("❌ setMyProfilePhoto failed:", data.description);
    console.error("   (Bot API 9.4+ required. You can also set the photo manually via @BotFather)");
    process.exit(1);
  }

  console.log("✅ Bot profile photo updated!");
}

void setProfilePhotoSimple();
