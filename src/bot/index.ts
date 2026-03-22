import { existsSync } from "fs";
import { join } from "path";
import { Input, Telegraf } from "telegraf";
import { prisma } from "@/lib/prisma";
import {
  handleMessage,
  handleDocument,
  handlePhoto,
  handleCallback,
  handleContact,
  replyWithRelocationStatus,
} from "./handlers";
import { startScreenKeyboard } from "./keyboards";
import { t, resolveLocale } from "./i18n";

const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) {
  throw new Error("TELEGRAM_BOT_TOKEN is required");
}

const bot = new Telegraf(token);
const BOT_NAME = "Fly My Pet";

/** Configure bot profile on startup */
async function configureBotProfile() {
  try {
    await bot.telegram.setMyName(BOT_NAME);
    console.log(`✅ Bot name set to "${BOT_NAME}"`);
  } catch (err) {
    console.warn("Could not set bot name:", err);
  }
}

bot.start(async (ctx) => {
  const telegramId = String(ctx.from.id);
  const name = [ctx.from.first_name, ctx.from.last_name]
    .filter(Boolean)
    .join(" ");

  try {
    let user = await prisma.user.findUnique({ where: { telegramId } });

    if (!user) {
      user = await prisma.user.create({
        data: { telegramId, name },
      });
    }

    let state = await prisma.onboardState.findUnique({
      where: { userId: user.id },
    });

    if (!state) {
      await prisma.onboardState.create({
        data: { userId: user.id, step: "owner_name" },
      });
    } else {
      await prisma.onboardState.update({
        where: { userId: user.id },
        data: {
          step: "owner_name",
          petId: null,
          relocationId: null,
          docCount: 0,
        },
      });
    }
  } catch (dbErr) {
    throw dbErr;
  }

  const locale = resolveLocale(ctx.from?.language_code);
  const welcomePath = join(process.cwd(), "public", "bot-welcome.png");
  const keyboard = startScreenKeyboard(locale);

  if (existsSync(welcomePath)) {
    await ctx.replyWithPhoto(Input.fromLocalFile(welcomePath), {
      caption: t(locale, "bot.welcomeTagline"),
      parse_mode: "HTML",
      reply_markup: keyboard.reply_markup,
    });
  } else {
    await ctx.reply(t(locale, "bot.welcomeTagline"), {
      parse_mode: "HTML",
      reply_markup: keyboard.reply_markup,
    });
  }

  await ctx.reply(t(locale, "bot.welcomeFollowUp"), { parse_mode: "HTML" });
});

bot.command("status", async (ctx) => {
  const locale = resolveLocale(ctx.from?.language_code);
  await replyWithRelocationStatus(ctx, locale);
});

bot.command("volunteer", async (ctx) => {
  const locale = resolveLocale(ctx.from?.language_code);
  await ctx.reply(t(locale, "bot.volunteer"), { parse_mode: "HTML" });
});

bot.command("sponsor", async (ctx) => {
  const locale = resolveLocale(ctx.from?.language_code);
  await ctx.reply(t(locale, "bot.sponsor"), { parse_mode: "HTML" });
});

bot.on("callback_query", async (ctx) => {
  await handleCallback(ctx as Parameters<typeof handleCallback>[0]);
});

bot.on("contact", async (ctx) => {
  await handleContact(ctx as Parameters<typeof handleContact>[0]);
});

bot.on("document", async (ctx) => {
  await handleDocument(ctx);
});

bot.on("photo", async (ctx) => {
  await handlePhoto(ctx);
});

bot.on("text", async (ctx) => {
  if (ctx.message.text.startsWith("/")) return;
  await handleMessage(ctx);
});

bot.catch((err) => {
  console.error("Bot error:", err);
});

// Run in polling mode when executed directly
if (require.main === module) {
  console.log(`🤖 ${BOT_NAME} bot starting in polling mode...`);
  bot.launch().then(async () => {
    await configureBotProfile();
    console.log("✅ Bot is running");
  });
  process.once("SIGINT", () => bot.stop("SIGINT"));
  process.once("SIGTERM", () => bot.stop("SIGTERM"));
}

// Configure bot profile when module loads (works for both polling and webhook)
void configureBotProfile();

export { bot };
