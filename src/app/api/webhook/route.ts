import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  // #region agent log
  fetch("http://127.0.0.1:7573/ingest/6eab789b-828a-4324-a49e-e5cb18f727f9", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Debug-Session-Id": "8a4225",
    },
    body: JSON.stringify({
      sessionId: "8a4225",
      location: "webhook/route.ts:POST",
      message: "Webhook request received",
      data: {
        hasSecret: !!req.headers.get("x-telegram-bot-api-secret-token"),
        envSecretSet: !!process.env.TELEGRAM_WEBHOOK_SECRET,
      },
      timestamp: Date.now(),
      hypothesisId: "H1",
    }),
  }).catch(() => {});
  // #endregion

  const secret = req.headers.get("x-telegram-bot-api-secret-token");
  if (
    process.env.TELEGRAM_WEBHOOK_SECRET &&
    secret !== process.env.TELEGRAM_WEBHOOK_SECRET
  ) {
    // #region agent log
    fetch("http://127.0.0.1:7573/ingest/6eab789b-828a-4324-a49e-e5cb18f727f9", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Debug-Session-Id": "8a4225",
      },
      body: JSON.stringify({
        sessionId: "8a4225",
        location: "webhook/route.ts:401",
        message: "Webhook rejected: secret mismatch",
        data: {},
        timestamp: Date.now(),
        hypothesisId: "H4",
      }),
    }).catch(() => {});
    // #endregion
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const updateType = body?.message?.text
      ? "text"
      : body?.message?.document
        ? "document"
        : body?.callback_query
          ? "callback"
          : body?.message?.contact
            ? "contact"
            : "other";
    const isStart =
      updateType === "text" && body?.message?.text?.startsWith("/start");

    // #region agent log
    fetch("http://127.0.0.1:7573/ingest/6eab789b-828a-4324-a49e-e5cb18f727f9", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Debug-Session-Id": "8a4225",
      },
      body: JSON.stringify({
        sessionId: "8a4225",
        location: "webhook/route.ts:beforeHandle",
        message: "Update received, dispatching to bot",
        data: { updateType, isStart, hasUpdateId: !!body?.update_id },
        timestamp: Date.now(),
        hypothesisId: "H1",
      }),
    }).catch(() => {});
    // #endregion

    const { bot } = await import("@/bot/index");
    await bot.handleUpdate(body);

    // #region agent log
    fetch("http://127.0.0.1:7573/ingest/6eab789b-828a-4324-a49e-e5cb18f727f9", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Debug-Session-Id": "8a4225",
      },
      body: JSON.stringify({
        sessionId: "8a4225",
        location: "webhook/route.ts:afterHandle",
        message: "Bot handleUpdate completed",
        data: { isStart },
        timestamp: Date.now(),
        hypothesisId: "H1",
      }),
    }).catch(() => {});
    // #endregion

    return NextResponse.json({ ok: true });
  } catch (error) {
    // #region agent log
    fetch("http://127.0.0.1:7573/ingest/6eab789b-828a-4324-a49e-e5cb18f727f9", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Debug-Session-Id": "8a4225",
      },
      body: JSON.stringify({
        sessionId: "8a4225",
        location: "webhook/route.ts:catch",
        message: "Webhook error",
        data: {
          errorMsg: error instanceof Error ? error.message : String(error),
          errorName: error instanceof Error ? error.name : undefined,
        },
        timestamp: Date.now(),
        hypothesisId: "H2,H3",
      }),
    }).catch(() => {});
    // #endregion
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ status: "FlyMy.Pet webhook is active" });
}
