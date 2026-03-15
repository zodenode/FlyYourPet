"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Heart,
  ShieldCheck,
  Plane,
  FileText,
  CheckCircle,
  ChevronDown,
  Star,
  Quote,
  Globe,
  ArrowRight,
  ClipboardList,
  Clock,
  MapPin,
} from "lucide-react";
import { ScrollMarquee } from "@/components/ScrollMarquee";

const TELEGRAM_BOT_URL =
  process.env.NEXT_PUBLIC_TELEGRAM_BOT_URL || "https://t.me/FlyMyPetBot";

const fadeIn = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" as const },
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 },
  },
};

const STEPS = [
  {
    icon: <Send size={32} />,
    title: "1. Connect",
    desc: "Start a chat with @FlyMyPetBot. Answer a few questions about your pet.",
  },
  {
    icon: <FileText size={32} />,
    title: "2. Upload",
    desc: "Snap photos of vaccination cards and passports directly into the chat.",
  },
  {
    icon: <ShieldCheck size={32} />,
    title: "3. Coordinate",
    desc: "Our human admins review docs, book vet checks, and arrange IATA crates.",
  },
  {
    icon: <Plane size={32} />,
    title: "4. Fly Safely",
    desc: "Get real-time tracking updates until your pet is safely in your arms.",
  },
];

const MATRIX_ROWS = [
  {
    country: "\u{1F1EA}\u{1F1F8} Spain (EU)",
    chip: "ISO 11784/11785",
    rabies: "21 days wait",
    titre: "Sample 30 days post-vax + 3 Mo. wait",
    cert: "EU Annex IV",
  },
  {
    country: "\u{1F1F5}\u{1F1F9} Portugal (EU)",
    chip: "ISO 11784/11785",
    rabies: "21 days wait",
    titre: "Sample 30 days post-vax + 3 Mo. wait",
    cert: "EU Annex IV",
  },
  {
    country: "\u{1F1F7}\u{1F1F4} Romania (EU)",
    chip: "ISO 11784/11785",
    rabies: "21 days wait",
    titre: "Sample 30 days post-vax + 3 Mo. wait",
    cert: "EU Annex IV",
  },
  {
    country: "\u{1F1F7}\u{1F1FA} Russia",
    chip: "ISO 11784/11785",
    rabies: "21 days wait",
    titre: "Not Required*",
    cert: "Form No. 1 / Form 5a",
  },
];

const AIRLINES = [
  {
    name: "Etihad",
    desc: "Allows pets in-cabin (cats/small dogs up to 8kg) on select routes from AUH. Highly recommended.",
  },
  {
    name: "Emirates",
    desc: "Pets must travel as manifested cargo or checked baggage from DXB. No in-cabin options currently.",
  },
  {
    name: "KLM / Lufthansa",
    desc: "Excellent European carriers with robust live animal desks. Good for Spain/Portugal connections.",
  },
];

const PRICING_TIERS = [
  {
    title: "Basic Coordination",
    price: "\u20AC900 \u2013 \u20AC1500",
    desc: "For owners who want to fly with their pets as excess baggage.",
    features: [
      "Document review",
      "Vet check booking",
      "Export permit generation",
    ],
  },
  {
    title: "Full Relocation",
    price: "\u20AC2000 \u2013 \u20AC3500",
    desc: "End-to-end management for pets flying manifested cargo.",
    features: [
      "Door-to-door transport",
      "Customs clearance",
      "IATA crate provided",
      "Flight booking",
    ],
    popular: true,
  },
  {
    title: "Rescue Sponsorship",
    price: "\u20AC500 \u2013 \u20AC1200",
    desc: "Discounted rates for registered rescuers moving abandoned animals.",
    features: [
      "Flight buddy matching",
      "At-cost cargo rates",
      "Priority processing",
    ],
  },
];

const RESCUE_PETS = [
  { name: "Luna", route: "DXB \u2192 LIS", progress: 80, image: "/rescue/luna.png" },
  { name: "Max", route: "AUH \u2192 MAD", progress: 45, image: "/rescue/max.png" },
  { name: "Bella", route: "DXB \u2192 OTP", progress: 10, image: "/rescue/bella.png" },
  { name: "Oliver", route: "DXB \u2192 LED", progress: 95, image: "/rescue/oliver.png" },
];

const IMPORT_EXPORT_STEPS = {
  export: [
    {
      step: "1",
      title: "Microchip & Vaccination",
      desc: "Your pet must have an ISO-compliant microchip implanted before (or on the same day as) their rabies vaccination. The rabies vaccine must be given at least 21 days before travel.",
      timeline: "Day 1",
    },
    {
      step: "2",
      title: "Rabies Titre Test (RNATT)",
      desc: "A blood sample must be taken at least 30 days after vaccination and sent to an EU-approved lab. Results must show \u22650.5 IU/ml. A 3-month waiting period follows from the sample date (not required for Russia).",
      timeline: "Day 30 + 3 months wait",
    },
    {
      step: "3",
      title: "UAE Export Health Certificate",
      desc: "Visit a MOCCAE-approved veterinarian within 10 days of departure. They will issue a health certificate confirming your pet is fit to fly and free of infectious diseases.",
      timeline: "Within 10 days of flight",
    },
    {
      step: "4",
      title: "Export Permit from MOCCAE",
      desc: "Apply for the export permit through the UAE Ministry of Climate Change and Environment. We handle the application, submission, and follow-up on your behalf.",
      timeline: "3\u20135 business days",
    },
  ],
  import: [
    {
      step: "1",
      title: "EU Annex IV Health Certificate",
      desc: "For EU destinations, the export health certificate must be endorsed and converted to the EU Annex IV format by an official government veterinarian before departure.",
      timeline: "Same visit as export cert",
    },
    {
      step: "2",
      title: "Customs & Border Clearance",
      desc: "Upon arrival in the EU, your pet clears through a Border Inspection Post (BIP). Officials verify microchip, vaccination records, and the Annex IV certificate. We coordinate with ground agents to handle this.",
      timeline: "At arrival",
    },
    {
      step: "3",
      title: "Destination Country Registration",
      desc: "Some EU countries require you to register your pet with local authorities within a set period. We provide a post-arrival checklist specific to your destination country.",
      timeline: "Within 7\u201330 days of arrival",
    },
    {
      step: "4",
      title: "EU Pet Passport (Optional)",
      desc: "Once in the EU, you can obtain a pet passport from any licensed veterinarian. This simplifies future travel within EU member states and replaces the need for individual health certificates.",
      timeline: "Anytime after arrival",
    },
  ],
};

const TESTIMONIALS = [
  {
    name: "Sarah K.",
    location: "Dubai \u2192 Lisbon",
    pet: "Mochi (Persian Cat)",
    rating: 5,
    text: "I was terrified about relocating Mochi, especially with all the paperwork. The FlyMyPet team walked me through every single step on Telegram. Mochi arrived in Lisbon safe and calm. I cannot recommend them enough.",
    date: "February 2026",
  },
  {
    name: "James & Priya D.",
    location: "Abu Dhabi \u2192 Madrid",
    pet: "Bruno (Golden Retriever)",
    rating: 5,
    text: "We had two weeks to leave the UAE and thought it was impossible to bring Bruno. FlyMyPet expedited everything \u2014 the titre test, export permit, even the IATA crate. Bruno flew cargo with Etihad and was wagging his tail at Madrid airport.",
    date: "January 2026",
  },
  {
    name: "Olga M.",
    location: "Dubai \u2192 Bucharest",
    pet: "Simba & Nala (Rescue Cats)",
    rating: 5,
    text: "I adopted two street cats from Ras Al Khaimah and needed them in Romania. The rescue sponsorship rate was incredibly fair, and a flight buddy carried them in-cabin. Both cats adjusted beautifully to their new home.",
    date: "December 2025",
  },
  {
    name: "Tom W.",
    location: "Dubai \u2192 Porto",
    pet: "Biscuit (British Shorthair)",
    rating: 5,
    text: "The document review process alone saved me weeks of confusion. They caught a date error on my vaccination record that would have caused rejection at the border. Biscuit and I are happily settled in Porto now.",
    date: "November 2025",
  },
];

const FAQS = [
  {
    q: "How long does the entire relocation process take?",
    a: "Most relocations from the UAE to Europe take 3\u20134 months from start to finish. The main bottleneck is the rabies titre test, which requires a 3-month waiting period after the blood sample is taken. If your pet already has a valid titre result, the timeline can be as short as 2\u20133 weeks.",
  },
  {
    q: "Which pets do you currently support?",
    a: "We specialize in cats and dogs. Cats are our most common relocations, but we have extensive experience with dogs of all sizes, including brachycephalic (flat-nosed) breeds that require special airline accommodations. Exotic pets and birds require separate arrangements \u2014 reach out to discuss.",
  },
  {
    q: "Can my pet fly in the cabin with me?",
    a: "Yes, on certain airlines and routes. Etihad allows cats and small dogs (up to 8 kg including carrier) in-cabin on select flights from Abu Dhabi. For larger pets or Emirates flights, pets travel as manifested cargo in a climate-controlled, pressurized hold. We\u2019ll recommend the best option for your pet\u2019s size and breed.",
  },
  {
    q: "What is a rabies titre test and does my pet need one?",
    a: "The Rabies Neutralising Antibody Titre Test (RNATT) is a blood test that proves your pet has sufficient antibodies against rabies (\u22650.5 IU/ml). It\u2019s required by all EU countries for pets coming from the UAE (classified as an \u2018unlisted third country\u2019). Russia does not require it. The blood sample must be taken at least 30 days after vaccination and sent to an EU-approved laboratory.",
  },
  {
    q: "What documents will I need?",
    a: "At minimum: proof of ISO microchip implantation, rabies vaccination certificate, titre test results from an approved lab, a health certificate from a MOCCAE-approved vet, the UAE export permit, and an EU Annex IV certificate for EU destinations. Our team reviews every document before submission to avoid delays or rejections.",
  },
  {
    q: "What happens if a document is rejected or has errors?",
    a: "We review all documents before they\u2019re submitted to any authority. If an issue is found, we notify you immediately via Telegram with clear instructions on what needs to be corrected. Common issues include date discrepancies, missing vet stamps, or microchip numbers not matching \u2014 all easy to fix when caught early.",
  },
  {
    q: "Do you handle customs clearance at the destination?",
    a: "Yes. For Full Relocation packages, we coordinate with licensed ground agents at the destination airport to handle Border Inspection Post (BIP) clearance, customs paperwork, and pet collection. You\u2019ll receive real-time updates through Telegram as your pet clears each checkpoint.",
  },
  {
    q: "Is it safe for my pet to fly as cargo?",
    a: "Absolutely. Pets travelling as manifested cargo fly in the same pressurized, temperature-controlled hold used by airlines for their own live animal programs. IATA-approved crates ensure your pet has adequate ventilation, space, and security. We only work with airlines that have strong live animal track records.",
  },
  {
    q: "Can I track my pet during the journey?",
    a: "Yes. We provide real-time updates at every stage \u2014 from vet check-in, to airport drop-off, to boarding confirmation, to arrival and customs clearance. All updates are sent directly to your Telegram chat so you\u2019re never left wondering.",
  },
  {
    q: "What if I need to relocate urgently?",
    a: "We offer expedited processing for urgent cases. If your pet already has a valid titre test result, we can often complete the remaining steps in 1\u20132 weeks. Contact us on Telegram and mention \u2018urgent relocation\u2019 so we can assess your timeline immediately.",
  },
];

export default function FlyMyPetLanding() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-800 overflow-x-hidden">
      {/* NAVIGATION */}
      <nav className="fixed w-full bg-white/80 backdrop-blur-md z-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{"\u{1F43E}"}</span>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              FlyMy.Pet
            </span>
          </div>
          <div className="hidden md:flex gap-6 text-sm font-medium text-slate-600">
            <a
              href="#how-it-works"
              className="hover:text-sky-600 transition-colors"
            >
              How It Works
            </a>
            <a
              href="#import-export"
              className="hover:text-sky-600 transition-colors"
            >
              Import & Export
            </a>
            <a
              href="#pricing"
              className="hover:text-sky-600 transition-colors"
            >
              Pricing
            </a>
            <a
              href="#testimonials"
              className="hover:text-sky-600 transition-colors"
            >
              Testimonials
            </a>
            <a
              href="#faq"
              className="hover:text-sky-600 transition-colors"
            >
              FAQ
            </a>
          </div>
          <a
            href={TELEGRAM_BOT_URL}
            target="_blank"
            rel="noreferrer"
            className="bg-sky-500 hover:bg-sky-600 text-white px-5 py-2.5 rounded-full text-sm font-semibold flex items-center gap-2 transition-all shadow-md shadow-sky-500/20"
          >
            <Send size={16} />
            Start on Telegram
          </a>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="pt-32 pb-20 px-6 md:pt-48 md:pb-32 max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="space-y-6"
        >
          <motion.div
            variants={fadeIn}
            className="inline-block bg-sky-100 text-sky-700 px-4 py-1.5 rounded-full text-sm font-medium mb-2"
          >
            GCC Crisis Support &amp; Relocation
          </motion.div>
          <motion.h1
            variants={fadeIn}
            className="text-5xl md:text-6xl font-extrabold leading-tight text-slate-900"
          >
            Move Your Pet From UAE To Europe{" "}
            <span className="text-sky-500">Safely.</span>
          </motion.h1>
          <motion.p
            variants={fadeIn}
            className="text-lg text-slate-600 max-w-lg leading-relaxed"
          >
            Expert guidance for UAE expats and rescue sponsors. Document-ready,
            IATA compliant, and seamlessly managed through our Telegram
            Concierge.
          </motion.p>
          <motion.div
            variants={fadeIn}
            className="flex flex-col sm:flex-row gap-4 pt-4"
          >
            <a
              href={TELEGRAM_BOT_URL}
              target="_blank"
              rel="noreferrer"
              className="bg-sky-500 hover:bg-sky-600 text-white px-8 py-4 rounded-full font-semibold flex justify-center items-center gap-2 transition-all shadow-lg shadow-sky-500/30"
            >
              <Send size={20} />
              Start Pet Relocation
            </a>
            <a
              href="#pricing"
              className="bg-white border-2 border-slate-200 hover:border-slate-300 text-slate-700 px-8 py-4 rounded-full font-semibold flex justify-center items-center transition-all"
            >
              Get an Estimate
            </a>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="relative h-[400px] bg-gradient-to-tr from-sky-200 to-amber-100 rounded-[3rem] overflow-hidden flex items-center justify-center shadow-2xl"
        >
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20" />
          <div className="relative z-10 text-center space-y-4">
            <div className="text-8xl">
              {"\u{1F415}"} {"\u{1F408}"} {"\u2708\uFE0F"}
            </div>
            <div className="bg-white/80 backdrop-blur px-6 py-3 rounded-2xl shadow-sm text-sm font-semibold text-slate-700">
              DXB {"\u2192"} MAD / LIS / OTP
            </div>
          </div>
        </motion.div>
      </section>

      {/* ROUTES MARQUEE — Continuous scroll */}
      <section className="py-8 bg-white border-y border-slate-100">
        <ScrollMarquee duration={40} pauseOnHover className="py-2">
          {[
            "DXB → MAD",
            "AUH → LIS",
            "DXB → OTP",
            "SHJ → BCN",
            "Document Ready",
            "IATA Compliant",
            "24/7 Telegram Support",
            "MOCCAE Approved",
            "EU Annex IV",
            "Pet Relocation Simplified",
          ].map((item) => (
            <span
              key={item}
              className="text-slate-500 font-medium text-sm md:text-base whitespace-nowrap px-6 py-2 rounded-full bg-slate-50 border border-slate-100"
            >
              {item}
            </span>
          ))}
        </ScrollMarquee>
      </section>

      {/* STATS MARQUEE — Sandy Paws–inspired value props */}
      <section className="py-6 bg-sky-50/50 border-b border-sky-100">
        <ScrollMarquee duration={35} direction="right" pauseOnHover>
          {[
            { label: "Ethical dealings", sub: "with animals" },
            { label: "10,000+", sub: "Relocated" },
            { label: "Better price", sub: "transparent" },
            { label: "More personal", sub: "approach" },
            { label: "Beautiful", sub: "creatures" },
            { label: "IATA", sub: "compliant" },
            { label: "MOCCAE", sub: "certified" },
          ].map((item) => (
            <div
              key={item.label}
              className="flex flex-col items-center shrink-0 px-10"
            >
              <span className="text-slate-800 font-bold text-lg md:text-xl">
                {item.label}
              </span>
              <span className="text-sky-600 text-xs font-medium">{item.sub}</span>
            </div>
          ))}
        </ScrollMarquee>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="py-24 bg-white px-6">
        <div className="max-w-7xl mx-auto text-center">
          <motion.h2
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="text-3xl font-bold mb-16 text-slate-900"
          >
            How The Telegram Concierge Works
          </motion.h2>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-4 gap-8"
          >
            {STEPS.map((step, index) => (
              <motion.div
                key={index}
                variants={fadeIn}
                className="flex flex-col items-center p-6 bg-slate-50 rounded-3xl text-center"
              >
                <div className="w-16 h-16 bg-sky-100 text-sky-600 rounded-2xl flex items-center justify-center mb-6">
                  {step.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  {step.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* MATRIX & AIRLINES */}
      <section id="matrix" className="py-24 bg-slate-900 text-white px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12 text-center md:text-left">
            <h2 className="text-3xl font-bold mb-4">
              Requirement &amp; Airline Matrix
            </h2>
            <p className="text-slate-400 max-w-2xl">
              The UAE is considered an &ldquo;unlisted third country&rdquo; by
              the EU. Strict timelines apply. Here is what you need to know.
            </p>
          </div>

          <div className="bg-slate-800 rounded-3xl overflow-hidden shadow-2xl border border-slate-700">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-800 border-b border-slate-700 text-slate-300">
                  <tr>
                    <th className="p-6 font-semibold">Destination</th>
                    <th className="p-6 font-semibold">Microchip</th>
                    <th className="p-6 font-semibold">Rabies Vacc.</th>
                    <th className="p-6 font-semibold">RNATT (Titre Test)</th>
                    <th className="p-6 font-semibold">Health Cert.</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {MATRIX_ROWS.map((row, i) => (
                    <tr
                      key={i}
                      className="hover:bg-slate-700/50 transition-colors"
                    >
                      <td className="p-6 font-medium">{row.country}</td>
                      <td className="p-6 text-slate-400">{row.chip}</td>
                      <td className="p-6 text-slate-400">{row.rabies}</td>
                      <td className="p-6 text-slate-400">{row.titre}</td>
                      <td className="p-6 text-slate-400">{row.cert}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-12 flex justify-center">
            <a
              href="/requirements"
              className="inline-flex items-center gap-2 px-6 py-3 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-full transition-all shadow-lg shadow-sky-500/30"
            >
              <Globe size={18} />
              View Full 57+ Country Requirements
            </a>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            {AIRLINES.map((airline) => (
              <div
                key={airline.name}
                className="bg-slate-800 p-6 rounded-2xl border border-slate-700"
              >
                <h4 className="font-bold text-lg mb-2 flex items-center gap-2">
                  {"\u2708\uFE0F"} {airline.name}
                </h4>
                <p className="text-sm text-slate-400">{airline.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* IMPORT & EXPORT DETAILS */}
      <section id="import-export" className="py-24 bg-[#F8FAFC] px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 bg-sky-100 text-sky-700 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
              <Globe size={16} />
              UAE to Europe
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Import &amp; Export Process
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Relocating a pet from the UAE to Europe involves two sides:
              exporting from the UAE and importing into your destination country.
              Here is the full breakdown.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Export Side */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="bg-slate-900 text-white px-8 py-5 flex items-center gap-3">
                  <div className="w-10 h-10 bg-sky-500 rounded-xl flex items-center justify-center">
                    <ClipboardList size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">UAE Export Requirements</h3>
                    <p className="text-slate-400 text-sm">What you need before departure</p>
                  </div>
                </div>
                <div className="divide-y divide-slate-100">
                  {IMPORT_EXPORT_STEPS.export.map((item) => (
                    <div key={item.step} className="px-8 py-6 flex gap-5">
                      <div className="w-10 h-10 bg-sky-50 text-sky-600 rounded-xl flex items-center justify-center font-bold text-sm shrink-0">
                        {item.step}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-4">
                          <h4 className="font-semibold text-slate-900">{item.title}</h4>
                          <span className="text-xs bg-slate-100 text-slate-500 px-2.5 py-1 rounded-full whitespace-nowrap flex items-center gap-1">
                            <Clock size={10} />
                            {item.timeline}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Import Side */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="bg-slate-900 text-white px-8 py-5 flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">EU Import Requirements</h3>
                    <p className="text-slate-400 text-sm">What happens at the destination</p>
                  </div>
                </div>
                <div className="divide-y divide-slate-100">
                  {IMPORT_EXPORT_STEPS.import.map((item) => (
                    <div key={item.step} className="px-8 py-6 flex gap-5">
                      <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center font-bold text-sm shrink-0">
                        {item.step}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-4">
                          <h4 className="font-semibold text-slate-900">{item.title}</h4>
                          <span className="text-xs bg-slate-100 text-slate-500 px-2.5 py-1 rounded-full whitespace-nowrap flex items-center gap-1">
                            <Clock size={10} />
                            {item.timeline}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="mt-12 bg-sky-50 border border-sky-100 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6"
          >
            <div>
              <h3 className="font-bold text-slate-900 text-lg mb-1">
                Not sure where to start?
              </h3>
              <p className="text-slate-600 text-sm">
                Send us your pet&apos;s vaccination records on Telegram and we&apos;ll
                tell you exactly what steps remain and how long it will take.
              </p>
            </div>
            <a
              href={TELEGRAM_BOT_URL}
              target="_blank"
              rel="noreferrer"
              className="bg-sky-500 hover:bg-sky-600 text-white px-6 py-3 rounded-full font-semibold flex items-center gap-2 transition-all shadow-md shadow-sky-500/20 whitespace-nowrap"
            >
              Get a Free Assessment
              <ArrowRight size={16} />
            </a>
          </motion.div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="py-24 bg-white px-6">
        <div className="max-w-7xl mx-auto">
          <motion.h2
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="text-3xl font-bold mb-16 text-center text-slate-900"
          >
            Transparent Pricing
          </motion.h2>

          <div className="grid md:grid-cols-3 gap-8">
            {PRICING_TIERS.map((tier, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`bg-white rounded-3xl p-8 border ${
                  tier.popular
                    ? "border-sky-500 shadow-xl shadow-sky-500/10"
                    : "border-slate-200 shadow-sm"
                } flex flex-col`}
              >
                <h3 className="text-2xl font-bold mb-2">{tier.title}</h3>
                <div className="text-sky-600 font-bold text-xl mb-4">
                  {tier.price}
                </div>
                <p className="text-slate-600 text-sm mb-8">{tier.desc}</p>
                <ul className="space-y-3 mb-8 flex-1">
                  {tier.features.map((feat, j) => (
                    <li
                      key={j}
                      className="flex items-start gap-3 text-sm text-slate-700"
                    >
                      <CheckCircle
                        size={18}
                        className="text-sky-500 shrink-0"
                      />
                      {feat}
                    </li>
                  ))}
                </ul>
                <a
                  href={TELEGRAM_BOT_URL}
                  target="_blank"
                  rel="noreferrer"
                  className={`w-full py-3 rounded-full font-semibold text-center transition-all block ${
                    tier.popular
                      ? "bg-sky-500 text-white hover:bg-sky-600"
                      : "bg-slate-100 text-slate-800 hover:bg-slate-200"
                  }`}
                >
                  Select Tier
                </a>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIAL MARQUEE — Continuous scroll quotes */}
      <section className="py-12 bg-slate-900 overflow-hidden">
        <ScrollMarquee duration={50} pauseOnHover>
          {[
            "Moving is stressful as it is — pet relocations should not be.",
            "FlyMyPet walked me through every single step on Telegram.",
            "Mochi arrived in Lisbon safe and calm. Cannot recommend enough.",
            "They expedited everything — titre test, export permit, IATA crate.",
            "Bruno flew cargo with Etihad and was wagging at Madrid airport.",
            "The document review process alone saved me weeks of confusion.",
            "Both cats adjusted beautifully to their new home in Romania.",
            "We had two weeks to leave the UAE. FlyMyPet made it possible.",
          ].map((quote) => (
            <div
              key={quote}
              className="shrink-0 flex items-center gap-4 px-8"
            >
              <Quote size={28} className="text-sky-500/60 shrink-0" />
              <p className="text-slate-300 text-sm md:text-base italic max-w-md">
                &ldquo;{quote}&rdquo;
              </p>
            </div>
          ))}
        </ScrollMarquee>
      </section>

      {/* RESCUE SPONSORSHIP */}
      <section
        id="rescue"
        className="py-24 bg-amber-50 px-6 border-y border-amber-100"
      >
        <div className="max-w-7xl mx-auto text-center">
          <Heart size={48} className="text-rose-400 mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-4 text-slate-900">
            Help Solve the GCC Pet Crisis
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto mb-12">
            Hundreds of abandoned pets in the UAE have adoptive homes waiting in
            Europe, but they lack the funds for flights. You can sponsor a
            &ldquo;flight buddy&rdquo; directly.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            {RESCUE_PETS.map((pet, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-4 shadow-sm border border-amber-100"
              >
                <div className="w-full h-32 bg-slate-100 rounded-xl mb-4 overflow-hidden">
                  <img
                    src={pet.image}
                    alt={pet.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex justify-between items-end mb-2">
                  <div className="text-left">
                    <h4 className="font-bold text-slate-900">{pet.name}</h4>
                    <p className="text-xs text-slate-500">{pet.route}</p>
                  </div>
                  <span className="text-xs font-bold text-sky-600">
                    {pet.progress}%
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div
                    className="bg-sky-500 h-2 rounded-full"
                    style={{ width: `${pet.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <a
            href={`${TELEGRAM_BOT_URL}?start=sponsor`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex bg-rose-500 hover:bg-rose-600 text-white px-8 py-4 rounded-full font-semibold items-center gap-2 transition-all shadow-lg shadow-rose-500/30"
          >
            <Heart size={20} />
            Support a Rescue on Telegram
          </a>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="testimonials" className="py-24 bg-white px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Trusted by Pet Owners Across the UAE
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Real stories from families who successfully relocated their pets
              to Europe with our help.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-2 gap-8"
          >
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={i}
                variants={fadeIn}
                className="bg-slate-50 rounded-3xl p-8 relative"
              >
                <Quote
                  size={40}
                  className="text-sky-100 absolute top-6 right-6"
                />
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star
                      key={j}
                      size={16}
                      className="fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>
                <p className="text-slate-700 leading-relaxed mb-6 relative z-10">
                  &ldquo;{t.text}&rdquo;
                </p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-900">{t.name}</p>
                    <p className="text-sm text-slate-500">{t.pet}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-sky-600 flex items-center gap-1">
                      <Plane size={14} />
                      {t.location}
                    </p>
                    <p className="text-xs text-slate-400">{t.date}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 bg-slate-50 px-6">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-slate-600">
              Everything you need to know about relocating your pet from the UAE
              to Europe.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="space-y-3"
          >
            {FAQS.map((faq, i) => (
              <motion.div
                key={i}
                variants={fadeIn}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left gap-4"
                >
                  <span className="font-semibold text-slate-900">
                    {faq.q}
                  </span>
                  <ChevronDown
                    size={20}
                    className={`text-slate-400 shrink-0 transition-transform duration-300 ${
                      openFaq === i ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-5 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-4">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="mt-12 text-center"
          >
            <p className="text-slate-600 mb-4">
              Still have questions? We&apos;re happy to help.
            </p>
            <a
              href={TELEGRAM_BOT_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex bg-sky-500 hover:bg-sky-600 text-white px-6 py-3 rounded-full font-semibold items-center gap-2 transition-all shadow-md shadow-sky-500/20"
            >
              <Send size={16} />
              Ask Us on Telegram
            </a>
          </motion.div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-slate-400 py-12 px-6 text-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 text-white">
            <span className="text-xl">{"\u{1F43E}"}</span>
            <span className="text-lg font-bold tracking-tight">
              FlyMy.Pet
            </span>
          </div>
          <div className="text-center md:text-left">
            Licensed and operated by <strong>Yureka Media</strong>.
            <br />
            IATA Compliant Pet Relocation Network.
          </div>
          <div className="flex gap-4">
            <a
              href="#"
              className="hover:text-white transition-colors"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="hover:text-white transition-colors"
            >
              Terms of Service
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
