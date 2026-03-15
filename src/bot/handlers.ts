import { Context } from "telegraf";
import { prisma } from "@/lib/prisma";
import { OnboardStep } from "@prisma/client";
import { KEYBOARDS, contactRequestKeyboard, removeKeyboard } from "./keyboards";
import { TELEGRAM_SUPPORT_USERNAME } from "@/lib/constants";
import { t, resolveLocale, type Locale } from "./i18n";

type TextContext = Context & { message: { text: string } };
type DocContext = Context & {
  message: { document: { file_id: string; file_name?: string } };
};
type PhotoContext = Context & {
  message: { photo: Array<{ file_id: string; width: number; height: number }> };
};
type CallbackContext = Context & { callbackQuery: { data: string; message?: { message_id: number } } };

/** HTML parse mode for all bot messages */
const PARSE_MODE = "HTML" as const;

const STEP_KEYS: Record<
  OnboardStep,
  {
    field?: string;
    table?: string;
    next: OnboardStep;
    promptKey: string;
    customPromptKey?: string;
    validate?: (v: string) => boolean;
    errorMsgKey?: string;
  }
> = {
  start: { next: "owner_name", promptKey: "bot.stepOwnerName" },
  owner_name: {
    field: "name",
    table: "user",
    next: "owner_phone",
    promptKey: "bot.stepOwnerPhone",
  },
  owner_phone: {
    field: "phone",
    table: "user",
    next: "owner_email",
    promptKey: "bot.stepOwnerEmail",
    validate: (v) => /^\+?[\d\s-()]{7,}$/.test(v.trim()),
    errorMsgKey: "bot.errorInvalidPhone",
  },
  owner_email: {
    field: "email",
    table: "user",
    next: "owner_city",
    promptKey: "bot.stepOwnerCity",
    validate: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()),
    errorMsgKey: "bot.errorInvalidEmail",
  },
  owner_city: {
    field: "city",
    table: "user",
    next: "pet_type",
    promptKey: "bot.stepOwnerCity",
    customPromptKey: "bot.stepOwnerCityCustom",
  },
  pet_type: {
    field: "type",
    table: "pet",
    next: "pet_breed",
    promptKey: "bot.stepPetType",
  },
  pet_breed: {
    field: "breed",
    table: "pet",
    next: "pet_age",
    promptKey: "bot.stepPetBreed",
    customPromptKey: "bot.stepPetBreedCustom",
  },
  pet_age: {
    field: "age",
    table: "pet",
    next: "pet_weight",
    promptKey: "bot.stepPetAge",
  },
  pet_weight: {
    field: "weight",
    table: "pet",
    next: "pet_microchip",
    promptKey: "bot.stepPetWeight",
  },
  pet_microchip: {
    field: "microchip",
    table: "pet",
    next: "travel_origin",
    promptKey: "bot.stepPetMicrochip",
    customPromptKey: "bot.stepPetMicrochipCustom",
  },
  travel_origin: {
    field: "origin",
    table: "relocation",
    next: "travel_destination",
    promptKey: "bot.stepTravelOrigin",
    customPromptKey: "bot.stepTravelOriginCustom",
  },
  travel_destination: {
    field: "destination",
    table: "relocation",
    next: "travel_date",
    promptKey: "bot.stepTravelDestination",
  },
  travel_date: {
    field: "travelDate",
    table: "relocation",
    next: "travel_flex",
    promptKey: "bot.stepTravelDate",
    customPromptKey: "bot.stepTravelDateCustom",
  },
  travel_flex: {
    field: "flexDates",
    table: "relocation",
    next: "documents",
    promptKey: "bot.stepTravelFlex",
  },
  documents: { next: "complete", promptKey: "bot.stepDocuments" },
  complete: { next: "complete", promptKey: "" },
};

/** Send next step prompt with keyboard (if applicable) */
async function sendNextPrompt(
  ctx: Context,
  userId: string,
  nextStep: OnboardStep,
  locale: Locale,
  opts?: { removeReplyKeyboard?: boolean }
) {
  const state = await prisma.onboardState.findUnique({
    where: { userId },
    include: { user: { include: { pets: true } } },
  });
  const petType = state?.petId
    ? (await prisma.pet.findUnique({ where: { id: state.petId } }))?.type
    : "cat";

  const config = STEP_KEYS[nextStep];
  const prompt = config.promptKey ? t(locale, config.promptKey) : "";
  if (!prompt) return;

  const keyboard = KEYBOARDS.forStep(nextStep, petType, locale);
  const replyOpts: Parameters<Context["reply"]>[1] = {
    parse_mode: PARSE_MODE,
  };

  if (opts?.removeReplyKeyboard) {
    replyOpts.reply_markup = removeKeyboard().reply_markup;
  } else if (nextStep === "owner_phone") {
    replyOpts.reply_markup = contactRequestKeyboard(locale).reply_markup;
  } else if (keyboard) {
    replyOpts.reply_markup = keyboard.reply_markup;
  }

  await ctx.reply(prompt, replyOpts);
}

/** Handle button callback (inline keyboard) */
export async function handleCallback(ctx: CallbackContext) {
  const data = ctx.callbackQuery.data;
  const telegramId = String(ctx.from!.id);
  const locale = resolveLocale(ctx.from?.language_code);

  await ctx.answerCbQuery().catch(() => {});

  const user = await prisma.user.findUnique({ where: { telegramId } });
  if (!user) return;

  const state = await prisma.onboardState.findUnique({
    where: { userId: user.id },
  });
  if (!state) return;

  if (state.step === "complete") return;

  // Documents: Done
  if (data === "doc:done") {
    if (state.step === "documents" && state.relocationId) {
      await finishOnboarding(ctx as Context, user.id, state.relocationId, locale);
    }
    return;
  }

  // Step selection: s:step:value
  const match = data.match(/^s:([^:]+):(.+)$/);
  if (!match) return;

  const [, step, value] = match as [string, OnboardStep, string];

  if (step !== state.step) return;

  const stepConfig = STEP_KEYS[step];

  // Values that require custom text input - don't advance, ask for text
  if (["other", "custom", "type"].includes(value)) {
    const customPromptKey = stepConfig.customPromptKey;
    if (customPromptKey) {
      await ctx.reply(t(locale, customPromptKey), { parse_mode: PARSE_MODE });
    }
    return;
  }

  // Resolve display value for storage
  let storageValue: string | null = value;
  if (step === "pet_microchip" && value === "none") storageValue = null;
  if (step === "travel_flex") {
    await saveValueAndAdvance(ctx as Context, user, state, step, value === "yes", locale);
    return;
  }
  if (step === "travel_date" && !["ASAP", "this_month", "next_month"].includes(value)) {
    return; // shouldn't happen
  }
  // travel_date: store ASAP/this_month/next_month in notes, travelDate stays null
  if (step === "travel_date") {
    await saveValueAndAdvance(ctx as Context, user, state, step, null, locale, value);
    return;
  }

  await saveValueAndAdvance(ctx as Context, user, state, step, storageValue, locale);
}

async function saveValueAndAdvance(
  ctx: Context,
  user: { id: string },
  state: { petId: string | null; relocationId: string | null },
  step: OnboardStep,
  value: unknown,
  locale: Locale,
  notesValue?: string
) {
  const stepConfig = STEP_KEYS[step];

  if (stepConfig.table === "user" && stepConfig.field) {
    await prisma.user.update({
      where: { id: user.id },
      data: { [stepConfig.field]: value },
    });
  }

  if (stepConfig.table === "pet" && stepConfig.field) {
    let petId = state.petId;
    if (!petId) {
      const pet = await prisma.pet.create({
        data: { ownerId: user.id, type: String(value).toLowerCase() },
      });
      petId = pet.id;
      await prisma.onboardState.update({
        where: { userId: user.id },
        data: { petId },
      });
    } else {
      await prisma.pet.update({
        where: { id: petId },
        data: {
          [stepConfig.field]:
            stepConfig.field === "microchip" && value === null ? null : value,
        },
      });
    }
  }

  if (stepConfig.table === "relocation" && stepConfig.field) {
    let relocationId = state.relocationId;
    if (!relocationId) {
      const reloc = await prisma.relocation.create({
        data: {
          petId: state.petId!,
          origin: String(value),
          destination: "",
          status: "submitted",
        },
      });
      relocationId = reloc.id;
      await prisma.onboardState.update({
        where: { userId: user.id },
        data: { relocationId },
      });
    } else {
      const updateData: Record<string, unknown> = {};
      if (stepConfig.field === "travelDate" && notesValue) {
        updateData.notes = notesValue;
        updateData.travelDate = null;
      } else {
        updateData[stepConfig.field!] =
          stepConfig.field === "flexDates" ? Boolean(value) : value;
      }
      await prisma.relocation.update({
        where: { id: relocationId },
        data: updateData,
      });
    }
  }

  const nextStep = stepConfig.next;
  await prisma.onboardState.update({
    where: { userId: user.id },
    data: { step: nextStep },
  });

  await sendNextPrompt(ctx, user.id, nextStep, locale, {
    removeReplyKeyboard: step === "owner_phone",
  });
}

/** Escape hatch: user wants human help. Triggers on help, urgent, human, etc. */
const HELP_TRIGGERS = [
  "help",
  "urgent",
  "human",
  "talk to someone",
  "speak to someone",
  "need help",
  "contact support",
  "support",
];

function isHelpRequest(text: string): boolean {
  const normalized = text.trim().toLowerCase();
  return HELP_TRIGGERS.some((t) => normalized === t || normalized.includes(t));
}

function getSupportEscapeHatchMessage(locale: Locale): string {
  const base = t(locale, "bot.helpEscapeHatch");
  if (TELEGRAM_SUPPORT_USERNAME) {
    const username = TELEGRAM_SUPPORT_USERNAME.replace(/^@/, "");
    return base + t(locale, "bot.helpEscapeHatchDirect", { username });
  }
  return base;
}

export async function handleMessage(ctx: TextContext) {
  const telegramId = String(ctx.from!.id);
  const text = ctx.message.text.trim();
  const locale = resolveLocale(ctx.from?.language_code);

  const user = await prisma.user.findUnique({ where: { telegramId } });
  if (!user) {
    await ctx.reply(t(locale, "bot.errorUseStart"), {
      parse_mode: PARSE_MODE,
    });
    return;
  }

  const state = await prisma.onboardState.findUnique({
    where: { userId: user.id },
  });
  if (!state) {
    await ctx.reply(t(locale, "bot.errorUseStart"), {
      parse_mode: PARSE_MODE,
    });
    return;
  }

  // Escape hatch: user requested human help
  if (isHelpRequest(text)) {
    await ctx.reply(getSupportEscapeHatchMessage(locale), {
      parse_mode: PARSE_MODE,
    });
    return;
  }

  if (state.step === "complete") {
    await ctx.reply(t(locale, "bot.relocationSubmitted"), {
      parse_mode: PARSE_MODE,
    });
    return;
  }

  if (state.step === "documents") {
    if (text.toLowerCase() === "done") {
      await finishOnboarding(ctx as Context, user.id, state.relocationId!, locale);
      return;
    }
    await ctx.reply(t(locale, "bot.uploadDocument"), {
      parse_mode: PARSE_MODE,
      reply_markup: KEYBOARDS.docDone(locale).reply_markup,
    });
    return;
  }

  // "I'll type it instead" for phone - wait for them to type the number
  if (state.step === "owner_phone" && /type|type it/i.test(text)) {
    await ctx.reply(t(locale, "bot.typePhoneNumber"), {
      parse_mode: PARSE_MODE,
      reply_markup: removeKeyboard().reply_markup,
    });
    return;
  }

  const stepConfig = STEP_KEYS[state.step];
  if (!stepConfig) return;

  if (stepConfig.validate && !stepConfig.validate(text)) {
    const errorMsg = stepConfig.errorMsgKey
      ? t(locale, stepConfig.errorMsgKey)
      : t(locale, "bot.errorInvalidInput");
    await ctx.reply(errorMsg, { parse_mode: PARSE_MODE });
    return;
  }

  // Save the data
  if (stepConfig.table === "user" && stepConfig.field) {
    await prisma.user.update({
      where: { id: user.id },
      data: { [stepConfig.field]: text },
    });
  }

  if (stepConfig.table === "pet" && stepConfig.field) {
    let petId = state.petId;
    if (!petId) {
      const pet = await prisma.pet.create({
        data: { ownerId: user.id, type: text.toLowerCase() },
      });
      petId = pet.id;
      await prisma.onboardState.update({
        where: { userId: user.id },
        data: { petId },
      });
    } else {
      await prisma.pet.update({
        where: { id: petId },
        data: {
          [stepConfig.field]:
            stepConfig.field === "microchip" && text.toLowerCase() === "none"
              ? null
              : text,
        },
      });
    }
  }

  if (stepConfig.table === "relocation" && stepConfig.field) {
    let relocationId = state.relocationId;
    if (!relocationId) {
      const reloc = await prisma.relocation.create({
        data: {
          petId: state.petId!,
          origin: text,
          destination: "",
          status: "submitted",
        },
      });
      relocationId = reloc.id;
      await prisma.onboardState.update({
        where: { userId: user.id },
        data: { relocationId },
      });
    } else {
      let value: unknown = text;
      if (stepConfig.field === "flexDates") {
        value = ["yes", "y", "да"].includes(text.toLowerCase());
        await prisma.relocation.update({
          where: { id: relocationId },
          data: { flexDates: value as boolean },
        });
      } else if (stepConfig.field === "travelDate") {
        const parsed = parseTravelDate(text);
        await prisma.relocation.update({
          where: { id: relocationId },
          data: parsed
            ? { travelDate: parsed, notes: null }
            : { travelDate: null, notes: text },
        });
      } else if (stepConfig.field === "origin" || stepConfig.field === "destination") {
        await prisma.relocation.update({
          where: { id: relocationId },
          data: { [stepConfig.field]: text },
        });
      }
    }
  }

  const nextStep = stepConfig.next;
  await prisma.onboardState.update({
    where: { userId: user.id },
    data: { step: nextStep },
  });

  await sendNextPrompt(ctx as Context, user.id, nextStep, locale, {
    removeReplyKeyboard: state.step === "owner_phone",
  });
}

export async function handleContact(ctx: Context & { message: { contact: { phone_number: string } } }) {
  const telegramId = String(ctx.from!.id);
  const locale = resolveLocale(ctx.from?.language_code);
  const phone = ctx.message.contact.phone_number;
  const formatted = phone.startsWith("+") ? phone : `+${phone}`;

  const user = await prisma.user.findUnique({ where: { telegramId } });
  if (!user) return;

  const state = await prisma.onboardState.findUnique({
    where: { userId: user.id },
  });
  if (!state || state.step !== "owner_phone") {
    await ctx.reply(t(locale, "bot.errorUseStartShort"), {
      parse_mode: PARSE_MODE,
    });
    return;
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { phone: formatted },
  });

  await prisma.onboardState.update({
    where: { userId: user.id },
    data: { step: "owner_email" },
  });

  await sendNextPrompt(ctx, user.id, "owner_email", locale, {
    removeReplyKeyboard: true,
  });
}

export async function handleDocument(ctx: DocContext) {
  const telegramId = String(ctx.from!.id);
  const locale = resolveLocale(ctx.from?.language_code);
  const user = await prisma.user.findUnique({ where: { telegramId } });
  if (!user) return;

  const state = await prisma.onboardState.findUnique({
    where: { userId: user.id },
  });
  if (!state || state.step !== "documents" || !state.petId) {
    await ctx.reply(t(locale, "bot.notExpectingDocument"), {
      parse_mode: PARSE_MODE,
    });
    return;
  }

  const fileId = ctx.message.document.file_id;
  const fileName = ctx.message.document.file_name || "";
  const docType = guessDocType(fileName, state.docCount);

  await prisma.document.create({
    data: {
      petId: state.petId,
      fileId,
      fileUrl: `tg://file/${fileId}`,
      type: docType,
    },
  });

  const newCount = state.docCount + 1;
  await prisma.onboardState.update({
    where: { userId: user.id },
    data: { docCount: newCount },
  });

  const docLabel = docType.replace(/_/g, " ");
  await ctx.reply(
    t(locale, "bot.documentReceived", { docType: docLabel, docCount: newCount }),
    {
      parse_mode: PARSE_MODE,
      reply_markup: KEYBOARDS.docDone(locale).reply_markup,
    }
  );
}

export async function handlePhoto(ctx: PhotoContext) {
  const telegramId = String(ctx.from!.id);
  const locale = resolveLocale(ctx.from?.language_code);
  const user = await prisma.user.findUnique({ where: { telegramId } });
  if (!user) return;

  const state = await prisma.onboardState.findUnique({
    where: { userId: user.id },
  });
  if (!state || state.step !== "documents" || !state.petId) {
    await ctx.reply(t(locale, "bot.notExpectingPhoto"), {
      parse_mode: PARSE_MODE,
    });
    return;
  }

  const photo = ctx.message.photo;
  const fileId = photo[photo.length - 1].file_id;
  const docType = guessDocType("", state.docCount);

  await prisma.document.create({
    data: {
      petId: state.petId,
      fileId,
      fileUrl: `tg://file/${fileId}`,
      type: docType,
    },
  });

  const newCount = state.docCount + 1;
  await prisma.onboardState.update({
    where: { userId: user.id },
    data: { docCount: newCount },
  });

  const docLabel = docType.replace(/_/g, " ");
  await ctx.reply(
    t(locale, "bot.photoReceived", { docType: docLabel, docCount: newCount }),
    {
      parse_mode: PARSE_MODE,
      reply_markup: KEYBOARDS.docDone(locale).reply_markup,
    }
  );
}

async function finishOnboarding(
  ctx: Context,
  userId: string,
  relocationId: string,
  locale: Locale
) {
  await prisma.relocation.update({
    where: { id: relocationId },
    data: { status: "documents_pending" },
  });

  await prisma.onboardState.update({
    where: { userId },
    data: { step: "complete" },
  });

  const username = TELEGRAM_SUPPORT_USERNAME?.replace(/^@/, "") ?? "";
  const supportLine = TELEGRAM_SUPPORT_USERNAME
    ? t(locale, "bot.completeSupport", { username })
    : t(locale, "bot.completeSupportAlt");

  const msg =
    t(locale, "bot.completeTitle") +
    t(locale, "bot.completeBody") +
    supportLine +
    t(locale, "bot.completeThanks");

  await ctx.reply(msg, { parse_mode: PARSE_MODE });
}

function parseTravelDate(text: string): Date | null {
  const trimmed = text.trim();
  const iso = /^\d{4}-\d{2}-\d{2}$/.exec(trimmed);
  if (iso) {
    const d = new Date(trimmed);
    return isNaN(d.getTime()) ? null : d;
  }
  return null;
}

function guessDocType(
  fileName: string,
  index: number
): "vaccination_card" | "rabies_certificate" | "pet_passport" | "owner_id" | "other" {
  const lower = fileName.toLowerCase();
  if (lower.includes("vacc") || lower.includes("vax")) return "vaccination_card";
  if (lower.includes("rabies")) return "rabies_certificate";
  if (lower.includes("passport")) return "pet_passport";
  if (lower.includes("id") || lower.includes("identity")) return "owner_id";

  const byIndex = [
    "vaccination_card",
    "rabies_certificate",
    "pet_passport",
    "owner_id",
  ] as const;
  return byIndex[index] || "other";
}
