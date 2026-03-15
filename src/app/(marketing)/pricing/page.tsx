import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing — FlyMy.Pet",
  description:
    "Transparent pricing for pet relocation from UAE to Europe. Basic coordination, full relocation, and rescue options.",
};

const BOT_URL =
  process.env.NEXT_PUBLIC_TELEGRAM_BOT_URL || "https://t.me/FlyMyPetBot";

const PLANS = [
  {
    name: "Basic Coordination",
    range: "€900 – €1,500",
    description: "We guide you through the process and help coordinate the key steps.",
    features: [
      "Step-by-step document guidance",
      "Vet appointment coordination",
      "Flight booking assistance",
      "Telegram support during business hours",
      "Status updates via Telegram",
    ],
    cta: "Get Started",
  },
  {
    name: "Full Relocation",
    range: "€2,000 – €3,500",
    description: "Complete end-to-end service — we handle everything from start to finish.",
    features: [
      "Everything in Basic, plus:",
      "Full document preparation & review",
      "Vet visits scheduled and managed",
      "Flight booking & airport handling",
      "Destination airport pickup arranged",
      "Priority 7-day Telegram support",
      "Real-time transit tracking",
    ],
    popular: true,
    cta: "Get Started",
  },
  {
    name: "Rescue Relocation",
    range: "€500 – €1,200",
    description: "Subsidized relocation for rescued and abandoned animals.",
    features: [
      "Shelter & rescue coordination",
      "Document preparation",
      "Volunteer flight matching",
      "Adoption partner support",
      "Sponsored transport options",
    ],
    cta: "Inquire",
  },
];

export default function PricingPage() {
  return (
    <>
      <section className="bg-gradient-to-br from-navy-900 to-navy-800 text-white py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold">
            Simple, Transparent Pricing
          </h1>
          <p className="mt-4 text-lg text-navy-200 max-w-2xl mx-auto">
            Choose the level of support that works for you. Final pricing
            depends on destination, pet size, and specific requirements.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-3 gap-8">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl p-8 border ${
                  plan.popular
                    ? "border-brand-500 shadow-xl shadow-brand-500/10 ring-2 ring-brand-500"
                    : "border-gray-200 shadow-sm"
                } bg-white flex flex-col`}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-500 text-white text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wider">
                    Most Popular
                  </span>
                )}
                <h2 className="text-xl font-bold text-navy-900">
                  {plan.name}
                </h2>
                <div className="mt-4 text-3xl font-bold text-navy-900">
                  {plan.range}
                </div>
                <p className="mt-3 text-sm text-gray-500 leading-relaxed">
                  {plan.description}
                </p>
                <ul className="mt-6 space-y-3 flex-1">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2 text-sm text-gray-600"
                    >
                      <span className="text-brand-500 mt-0.5 flex-shrink-0">
                        ✓
                      </span>
                      {feature}
                    </li>
                  ))}
                </ul>
                <a
                  href={BOT_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`mt-8 block text-center px-6 py-3 rounded-full font-semibold transition-colors ${
                    plan.popular
                      ? "bg-brand-500 text-white hover:bg-brand-600 shadow-lg shadow-brand-500/25"
                      : "bg-gray-100 text-navy-900 hover:bg-gray-200"
                  }`}
                >
                  {plan.cta}
                </a>
              </div>
            ))}
          </div>

          <div className="mt-16 max-w-2xl mx-auto text-center">
            <p className="text-sm text-gray-400">
              All prices are estimates. Final pricing is provided after reviewing
              your specific requirements. Payment is handled securely via
              Stripe. Contact us on Telegram for a personalized quote.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
