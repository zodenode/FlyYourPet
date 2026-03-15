import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Rescue & Sponsor — FlyMy.Pet",
  description:
    "Help rescued animals find new homes in Europe. Sponsor a pet relocation or volunteer as a flight companion.",
};

const BOT_URL =
  process.env.NEXT_PUBLIC_TELEGRAM_BOT_URL || "https://t.me/FlyMyPetBot";

const RESCUE_CATS = [
  {
    name: "Luna",
    age: "2 years",
    story: "Found abandoned in Dubai Marina. Healthy and vaccinated, looking for a forever home in Europe.",
    needed: "€650",
  },
  {
    name: "Simba",
    age: "1 year",
    story: "Rescued from a construction site in Abu Dhabi. Gentle and playful, ready to travel.",
    needed: "€800",
  },
  {
    name: "Misha",
    age: "3 years",
    story: "Surrendered by a family moving out of UAE. Sweet-natured and great with children.",
    needed: "€550",
  },
];

export default function RescuePage() {
  return (
    <>
      <section className="bg-gradient-to-br from-navy-900 to-navy-800 text-white py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold">
            Rescue & Sponsor
          </h1>
          <p className="mt-4 text-lg text-navy-200 max-w-2xl mx-auto">
            Help abandoned animals in the UAE find loving homes in Europe. Every
            contribution makes a difference.
          </p>
        </div>
      </section>

      {/* How sponsorship works */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-bold text-navy-900 text-center mb-12">
            How Sponsorship Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-brand-50 flex items-center justify-center text-3xl mx-auto mb-4">
                🐱
              </div>
              <h3 className="font-semibold text-navy-900">Choose a Rescue</h3>
              <p className="mt-2 text-sm text-gray-500">
                Browse rescue animals waiting for relocation to loving homes in
                Europe.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-brand-50 flex items-center justify-center text-3xl mx-auto mb-4">
                💝
              </div>
              <h3 className="font-semibold text-navy-900">Sponsor Transport</h3>
              <p className="mt-2 text-sm text-gray-500">
                Your donation covers vet checks, documents, and flight costs for
                a rescued animal.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-brand-50 flex items-center justify-center text-3xl mx-auto mb-4">
                🏠
              </div>
              <h3 className="font-semibold text-navy-900">They Find a Home</h3>
              <p className="mt-2 text-sm text-gray-500">
                The animal is relocated and matched with an adopting family at
                the destination.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured rescues */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-bold text-navy-900 text-center mb-4">
            Animals Needing Sponsors
          </h2>
          <p className="text-center text-gray-500 mb-12">
            These rescued cats are waiting for someone to help them reach their
            new home.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {RESCUE_CATS.map((cat) => (
              <div
                key={cat.name}
                className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm"
              >
                <div className="h-48 bg-gradient-to-br from-brand-100 to-brand-50 flex items-center justify-center">
                  <span className="text-7xl">🐱</span>
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-navy-900">
                      {cat.name}
                    </h3>
                    <span className="text-sm text-gray-400">{cat.age}</span>
                  </div>
                  <p className="mt-3 text-sm text-gray-600 leading-relaxed">
                    {cat.story}
                  </p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-sm font-semibold text-navy-900">
                      Transport cost: {cat.needed}
                    </span>
                  </div>
                  <a
                    href={BOT_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 block text-center px-6 py-2.5 bg-brand-500 text-white font-semibold rounded-full hover:bg-brand-600 transition-colors text-sm"
                  >
                    Sponsor {cat.name}
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Volunteer section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl font-bold text-navy-900">
            Volunteer as a Flight Companion
          </h2>
          <p className="mt-4 text-gray-500 max-w-2xl mx-auto">
            Flying from the UAE to Europe? You can help a rescue animal travel
            by volunteering as a flight companion. It&apos;s free, simple, and
            incredibly rewarding.
          </p>
          <a
            href={BOT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex items-center gap-2 px-8 py-4 bg-navy-900 text-white font-semibold rounded-full hover:bg-navy-800 transition-colors"
          >
            Register as Volunteer
          </a>
        </div>
      </section>
    </>
  );
}
