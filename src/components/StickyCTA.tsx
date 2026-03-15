"use client";

import { Send } from "lucide-react";

const TELEGRAM_BOT_URL =
  process.env.NEXT_PUBLIC_TELEGRAM_BOT_URL || "https://t.me/FlyMyPetBot";

/**
 * Sticky CTA for mobile — shown at bottom on small screens to keep conversion visible.
 */
export function StickyCTA() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 p-4 md:hidden pointer-events-none">
      <div className="pointer-events-auto max-w-md mx-auto">
        <a
          href={TELEGRAM_BOT_URL}
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white font-semibold shadow-lg shadow-sky-500/30 transition-colors"
        >
          <Send size={20} />
          Start on Telegram
        </a>
      </div>
    </div>
  );
}
