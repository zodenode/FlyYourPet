import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "How It Works — FlyMy.Pet",
  description:
    "Learn how FlyMy.Pet coordinates your pet's relocation from the UAE to Europe in four simple steps.",
};

const BOT_URL =
  process.env.NEXT_PUBLIC_TELEGRAM_BOT_URL || "https://t.me/FlyMyPetBot";

const DETAILED_STEPS = [
  {
    num: "01",
    title: "Submit Pet Details via Telegram",
    icon: "💬",
    description:
      "Open our Telegram bot and answer a few quick questions about yourself and your pet. We'll collect your contact details, pet breed, age, weight, and microchip number — all through a friendly chat interface.",
    details: [
      "Owner name, phone, email, and city",
      "Pet type, breed, age, and weight",
      "Microchip number for identification",
    ],
  },
  {
    num: "02",
    title: "Upload Travel Documents",
    icon: "📄",
    description:
      "Send your pet's documents directly through Telegram. We'll review each document and let you know if anything is missing or needs updating before travel.",
    details: [
      "Vaccination card (up to date)",
      "Rabies certificate (valid titer test)",
      "Pet passport (if available)",
      "Owner identification document",
    ],
  },
  {
    num: "03",
    title: "We Coordinate Vet Checks & Flights",
    icon: "✈️",
    description:
      "Our team takes over from here. We schedule vet appointments, ensure all health certificates are in order, and find the best flight for your pet based on your preferred dates and destination.",
    details: [
      "Pre-travel veterinary examination",
      "Health certificate preparation",
      "Flight booking with pet-friendly airlines",
      "Airport handling coordination",
    ],
  },
  {
    num: "04",
    title: "Your Pet Arrives Safely",
    icon: "🏠",
    description:
      "Track every stage of your pet's journey through Telegram notifications. From departure to arrival, you'll know exactly where your pet is and when to expect them.",
    details: [
      "Real-time status updates via Telegram",
      "Departure and arrival notifications",
      "Destination airport coordination",
      "Safe handover to you or your contact",
    ],
  },
];

const FAQS = [
  {
    q: "How long does a typical relocation take?",
    a: "Most relocations from the UAE to Europe take 2–4 weeks from initial submission to arrival. This includes document review, vet visits, and flight booking.",
  },
  {
    q: "What pets do you currently support?",
    a: "We currently specialize in cat relocations. Dog relocations and other pets will be available soon.",
  },
  {
    q: "Which countries can I relocate to?",
    a: "We currently support relocations to Spain, Portugal, Romania, and Russia. More destinations are being added.",
  },
  {
    q: "Do I need a pet passport?",
    a: "A pet passport is helpful but not always required. Our team will guide you on the specific documents needed for your destination country.",
  },
  {
    q: "How are documents reviewed?",
    a: "You upload documents directly through Telegram. Our team reviews them and notifies you if anything is missing or needs updating.",
  },
];

export default function HowItWorksPage() {
  return (
    <>
      <section className="bg-gradient-to-br from-navy-900 to-navy-800 text-white py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold">How It Works</h1>
          <p className="mt-4 text-lg text-navy-200 max-w-2xl mx-auto">
            From your first Telegram message to your pet&apos;s safe arrival —
            here&apos;s everything that happens along the way.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="space-y-16">
            {DETAILED_STEPS.map((step, i) => (
              <div
                key={step.num}
                className={`flex flex-col md:flex-row gap-8 items-start ${
                  i % 2 === 1 ? "md:flex-row-reverse" : ""
                }`}
              >
                <div className="flex-shrink-0 w-20 h-20 rounded-2xl bg-brand-50 flex items-center justify-center text-4xl">
                  {step.icon}
                </div>
                <div className="flex-1">
                  <span className="text-xs font-bold text-brand-500 tracking-wider uppercase">
                    Step {step.num}
                  </span>
                  <h2 className="text-2xl font-bold text-navy-900 mt-1">
                    {step.title}
                  </h2>
                  <p className="mt-3 text-gray-600 leading-relaxed">
                    {step.description}
                  </p>
                  <ul className="mt-4 space-y-2">
                    {step.details.map((detail) => (
                      <li
                        key={detail}
                        className="flex items-start gap-2 text-sm text-gray-500"
                      >
                        <span className="text-brand-500 mt-0.5">✓</span>
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-bold text-navy-900 text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {FAQS.map((faq) => (
              <div
                key={faq.q}
                className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm"
              >
                <h3 className="font-semibold text-navy-900">{faq.q}</h3>
                <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl font-bold text-navy-900">
            Ready to Get Started?
          </h2>
          <p className="mt-3 text-gray-500">
            Open our Telegram bot and we&apos;ll guide you through in minutes.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={BOT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-brand-500 text-white font-semibold rounded-full hover:bg-brand-600 transition-all shadow-lg shadow-brand-500/25"
            >
              Start on Telegram
            </a>
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center px-8 py-4 border border-gray-200 text-navy-900 font-semibold rounded-full hover:bg-gray-50 transition-colors"
            >
              View Pricing
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
