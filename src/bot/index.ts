import { Telegraf } from "telegraf";
import { prisma } from "@/lib/prisma";
import {
  handleMessage,
  handleDocument,
  handlePhoto,
  handleCallback,
  handleContact,
} from "./handlers";
import { t, resolveLocale, type Locale } from "./i18n";

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
  // #region agent log
  fetch("http://127.0.0.1:7573/ingest/6eab789b-828a-4324-a49e-e5cb18f727f9", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Debug-Session-Id": "8a4225",
    },
    body: JSON.stringify({
      sessionId: "8a4225",
      location: "bot/index.ts:start:entry",
      message: "/start handler entered",
      data: { telegramId: String(ctx.from.id) },
      timestamp: Date.now(),
      hypothesisId: "H1",
    }),
  }).catch(() => {});
  // #endregion

  const telegramId = String(ctx.from.id);
  const name = [ctx.from.first_name, ctx.from.last_name]
    .filter(Boolean)
    .join(" ");

  let user;
  try {
    user = await prisma.user.findUnique({ where: { telegramId } });

    if (!user) {
      user = await prisma.user.create({
        data: { telegramId, name },
      });
    }

    let state = await prisma.onboardState.findUnique({
      where: { userId: user.id },
    });

    if (!state) {
      state = await prisma.onboardState.create({
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
    // #region agent log
    fetch(
      "http://127.0.0.1:7573/ingest/6eab789b-828a-4324-a49e-e5cb18f727f9",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Debug-Session-Id": "8a4225",
        },
        body: JSON.stringify({
          sessionId: "8a4225",
          location: "bot/index.ts:start:dbError",
          message: "DB error in /start",
          data: {
            err: dbErr instanceof Error ? dbErr.message : String(dbErr),
          },
          timestamp: Date.now(),
          hypothesisId: "H3",
        }),
      }
    ).catch(() => {});
    // #endregion
    throw dbErr;
  }

  // #region agent log
  fetch("http://127.0.0.1:7573/ingest/6eab789b-828a-4324-a49e-e5cb18f727f9", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Debug-Session-Id": "8a4225",
    },
    body: JSON.stringify({
      sessionId: "8a4225",
      location: "bot/index.ts:start:beforeReply",
      message: "About to send welcome reply",
      data: {},
      timestamp: Date.now(),
      hypothesisId: "H1",
    }),
  }).catch(() => {});
  // #endregion

  const locale = resolveLocale(ctx.from?.language_code);
  try {
    await ctx.reply(t(locale, "bot.welcome"), { parse_mode: "HTML" });
  } catch (replyErr) {
    // #region agent log
    fetch(
      "http://127.0.0.1:7573/ingest/6eab789b-828a-4324-a49e-e5cb18f727f9",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Debug-Session-Id": "8a4225",
        },
        body: JSON.stringify({
          sessionId: "8a4225",
          location: "bot/index.ts:start:replyError",
          message: "Reply error in /start (likely MarkdownV2 parse)",
          data: {
            err: replyErr instanceof Error ? replyErr.message : String(replyErr),
          },
          timestamp: Date.now(),
          hypothesisId: "H2",
        }),
      }
    ).catch(() => {});
    // #endregion
    throw replyErr;
  }

  // #region agent log
  fetch("http://127.0.0.1:7573/ingest/6eab789b-828a-4324-a49e-e5cb18f727f9", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Debug-Session-Id": "8a4225",
    },
    body: JSON.stringify({
      sessionId: "8a4225",
      location: "bot/index.ts:start:afterReply",
      message: "Welcome reply sent successfully",
      data: {},
      timestamp: Date.now(),
      hypothesisId: "H1",
    }),
  }).catch(() => {});
  // #endregion
});

bot.command("status", async (ctx) => {
  const telegramId = String(ctx.from.id);
  const user = await prisma.user.findUnique({
    where: { telegramId },
    include: {
      pets: {
        include: {
          relocations: { orderBy: { createdAt: "desc" }, take: 1 },
        },
      },
    },
  });

  const locale = resolveLocale(ctx.from?.language_code);
  if (!user || user.pets.length === 0) {
    await ctx.reply(t(locale, "bot.noRelocations"), { parse_mode: "HTML" });
    return;
  }

  const lines = user.pets.flatMap((pet) =>
    pet.relocations.map(
      (r) =>
        `🐱 <b>${pet.breed || "Cat"}</b> — ${r.origin} → ${r.destination}\n` +
        `<i>Status:</i> ${formatStatus(r.status, locale)}`
    )
  );

  const header = t(locale, "bot.yourRelocations");
  await ctx.reply(`${header}\n\n${lines.join("\n\n")}`, { parse_mode: "HTML" });
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

function formatStatus(status: string, locale: Locale): string {
  const keys: Record<string, string> = {
    submitted: "bot.statusSubmitted",
    documents_pending: "bot.statusDocumentsPending",
    vet_verification: "bot.statusVetVerification",
    flight_matching: "bot.statusFlightMatching",
    confirmed: "bot.statusConfirmed",
    in_transit: "bot.statusInTransit",
    delivered: "bot.statusDelivered",
    cancelled: "bot.statusCancelled",
  };
  const key = keys[status];
  return key ? t(locale, key) : status;
}

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
