"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Cpu,
  Shield,
  TestTube,
  FileCheck,
  AlertCircle,
  Plane,
  Send,
  ChevronDown,
  Filter,
  Check,
  X,
  Info,
  ExternalLink,
  BookOpen,
} from "lucide-react";
import {
  COUNTRIES,
  REGIONS,
  type CountryReq,
  type RequirementLevel,
} from "@/data/country-requirements";

const TELEGRAM_BOT_URL =
  process.env.NEXT_PUBLIC_TELEGRAM_BOT_URL || "https://t.me/FlyMyPetBot";

const EU_RULES_URL =
  "https://food.ec.europa.eu/animals/movement-pets/eu-legislation/entry-union_en";

const fadeIn = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

const stagger = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

function ReqBadge({
  level,
  label,
  icon: Icon,
}: {
  level: RequirementLevel;
  label: string;
  icon: React.ElementType;
}) {
  const styles: Record<RequirementLevel, string> = {
    required: "bg-emerald-100 text-emerald-800 border-emerald-200",
    recommended: "bg-sky-100 text-sky-800 border-sky-200",
    optional: "bg-slate-100 text-slate-600 border-slate-200",
    no: "bg-slate-50 text-slate-400 border-slate-100",
    varies: "bg-amber-100 text-amber-800 border-amber-200",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${styles[level]}`}
      title={label}
    >
      {level === "required" && <Check size={12} />}
      {level === "no" && <X size={12} />}
      {level === "varies" && <Info size={12} />}
      {label}
    </span>
  );
}

export default function RequirementsPage() {
  const [search, setSearch] = useState("");
  const [region, setRegion] = useState("All");
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let list = COUNTRIES;
    if (region !== "All") list = list.filter((c) => c.region === region);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.region.toLowerCase().includes(q) ||
          c.cert.toLowerCase().includes(q)
      );
    }
    return list;
  }, [search, region]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-800 overflow-x-hidden">
      {/* Hero */}
      <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-sky-500 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-amber-500 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-block bg-white/10 backdrop-blur px-4 py-1.5 rounded-full text-sm font-medium text-sky-200 mb-6"
          >
            UAE → 57+ Destinations
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-6xl font-extrabold text-white leading-tight"
          >
            Cat Import Requirements
            <br />
            <span className="text-sky-400">by Destination</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 text-lg text-slate-300 max-w-2xl"
          >
            Detailed regulations for relocating cats from the UAE. Microchip,
            rabies, titre test, quarantine, and certificate requirements for 57+
            countries.
          </motion.p>
        </div>
      </section>

      {/* UAE Export Baseline */}
      <section className="py-16 px-6 -mt-8">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 p-8 md:p-10"
          >
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center">
                <Plane size={24} className="text-amber-600" />
              </div>
              UAE Export Baseline (All Destinations)
            </h2>
            <p className="text-slate-600 mb-6">
              Every cat leaving the UAE must meet these minimum requirements
              before departure:
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  icon: Cpu,
                  label: "Microchip",
                  value: "ISO 11784/11785, 15-digit",
                  color: "bg-violet-50 text-violet-700",
                },
                {
                  icon: Shield,
                  label: "Rabies Vaccination",
                  value: "21 days–12 months before travel",
                  color: "bg-emerald-50 text-emerald-700",
                },
                {
                  icon: FileCheck,
                  label: "Health Certificate",
                  value: "EHC 3926 within 24–48h of departure",
                  color: "bg-sky-50 text-sky-700",
                },
                {
                  icon: AlertCircle,
                  label: "Parasite Treatment",
                  value: "Internal + external within 14 days",
                  color: "bg-amber-50 text-amber-700",
                },
              ].map((item) => (
                <motion.div
                  key={item.label}
                  variants={fadeIn}
                  className={`rounded-2xl p-4 ${item.color} border border-current/20`}
                >
                  <item.icon size={20} className="mb-2 opacity-80" />
                  <div className="font-semibold text-sm">{item.label}</div>
                  <div className="text-sm opacity-90 mt-1">{item.value}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Legend */}
      <section className="py-8 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-wrap gap-4 justify-center text-sm"
          >
            <span className="font-medium text-slate-500">Legend:</span>
            <ReqBadge level="required" label="Required" icon={Check} />
            <ReqBadge level="recommended" label="Recommended" icon={Check} />
            <ReqBadge level="optional" label="Optional / Alternative" icon={Info} />
            <ReqBadge level="no" label="Not Required" icon={X} />
            <ReqBadge level="varies" label="Varies by Situation" icon={Info} />
          </motion.div>
        </div>
      </section>

      {/* Search & Filter */}
      <section className="py-6 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <div className="relative flex-1">
              <Search
                size={20}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Search country or certificate..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter size={20} className="text-slate-500 shrink-0" />
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500"
              >
                {REGIONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Key EU Rules Callout */}
      <section className="py-6 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-sky-200 bg-sky-50/80 p-6 md:p-8"
          >
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <BookOpen size={20} className="text-sky-600" />
              Key EU Rules (All EU Countries + UK, Norway, Switzerland)
            </h3>
            <p className="text-slate-700 text-sm mb-4">
              Pets from the UAE (an &quot;unlisted third country&quot;) must
              comply with the following titre test requirements before entry into
              any EU Member State:
            </p>
            <ul className="space-y-2 text-sm text-slate-600 mb-4">
              <li className="flex items-start gap-2">
                <span className="text-sky-500 font-bold">1.</span>
                <span>
                  <strong>Rabies vaccine:</strong> At least 21 days before
                  entry; pet must be 12+ weeks old at vaccination.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-sky-500 font-bold">2.</span>
                <span>
                  <strong>Blood draw:</strong> At least 30 days after rabies
                  vaccination.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-sky-500 font-bold">3.</span>
                <span>
                  <strong>90-day wait:</strong> A 3-month waiting period from the
                  date of the blood draw is mandatory before EU entry.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-sky-500 font-bold">4.</span>
                <span>
                  <strong>Titre level:</strong> Minimum ≥0.5 IU/ml; must be
                  performed in an EU-approved laboratory.
                </span>
              </li>
            </ul>
            <p className="text-sm text-slate-600 mb-4">
              Plan <strong>3–4 months total</strong> from vaccination to travel.
              Finland, Ireland, Malta, Norway, and the UK also require tapeworm
              treatment for dogs 24–120 hours before entry.
            </p>
            <a
              href={EU_RULES_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium text-sky-600 hover:text-sky-700"
            >
              <ExternalLink size={14} />
              Verify on EC Food Safety
            </a>
          </motion.div>
        </div>
      </section>

      {/* Country Cards */}
      <section className="py-12 px-6 pb-24">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="grid gap-4"
          >
            <AnimatePresence mode="popLayout">
              {filtered.length === 0 ? (
                <motion.div
                  layout
                  className="text-center py-16 text-slate-500"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  No countries match your search. Try a different filter.
                </motion.div>
              ) : (
                filtered.map((country) => (
                  <motion.div
                    key={country.id}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                    className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md hover:border-slate-300 transition-all"
                  >
                    <button
                      onClick={() =>
                        setExpanded(expanded === country.id ? null : country.id)
                      }
                      className="w-full px-6 py-4 flex items-center gap-4 text-left"
                    >
                      <span className="text-3xl">{country.flag}</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-slate-900">
                          {country.name}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          {country.region} • {country.cert}
                        </div>
                      </div>
                      <div className="hidden sm:flex gap-2 flex-wrap justify-end">
                        <ReqBadge
                          level={country.microchip}
                          label="Chip"
                          icon={Cpu}
                        />
                        <ReqBadge
                          level={country.rabies}
                          label="Rabies"
                          icon={Shield}
                        />
                        <ReqBadge
                          level={country.titre}
                          label="Titre"
                          icon={TestTube}
                        />
                        <span
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${
                            country.quarantine === "None"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                          }`}
                        >
                          {country.quarantine}
                        </span>
                      </div>
                      <ChevronDown
                        size={20}
                        className={`text-slate-400 transition-transform ${
                          expanded === country.id ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    <AnimatePresence>
                      {expanded === country.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          className="overflow-hidden border-t border-slate-100"
                        >
                          <div className="px-6 py-5 bg-slate-50/50 space-y-5">
                            {country.timeline && (
                              <div className="rounded-xl bg-sky-50 border border-sky-200 px-4 py-3">
                                <div className="text-xs font-semibold text-sky-700 uppercase tracking-wider mb-1">
                                  Typical timeline
                                </div>
                                <p className="text-sm font-medium text-slate-800">
                                  {country.timeline}
                                </p>
                              </div>
                            )}
                            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                              <div>
                                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                                  Microchip
                                </div>
                                <ReqBadge
                                  level={country.microchip}
                                  label={
                                    country.microchip === "required"
                                      ? "ISO 11784/11785"
                                      : country.microchip
                                  }
                                  icon={Cpu}
                                />
                              </div>
                              <div>
                                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                                  Rabies
                                </div>
                                <ReqBadge
                                  level={country.rabies}
                                  label={country.rabies}
                                  icon={Shield}
                                />
                                {country.rabiesDetails && (
                                  <p className="mt-2 text-xs text-slate-600">
                                    {country.rabiesDetails}
                                  </p>
                                )}
                              </div>
                              <div>
                                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                                  Titre Test (RNATT)
                                </div>
                                <ReqBadge
                                  level={country.titre}
                                  label={country.titre}
                                  icon={TestTube}
                                />
                                {country.titreDetails && (
                                  <p className="mt-2 text-xs text-slate-600">
                                    {country.titreDetails}
                                  </p>
                                )}
                              </div>
                              <div>
                                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                                  Quarantine
                                </div>
                                <span className="font-medium text-slate-700">
                                  {country.quarantine}
                                </span>
                              </div>
                            </div>
                            {country.tapewormDetails && (
                              <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3">
                                <div className="text-xs font-semibold text-amber-800 uppercase tracking-wider mb-1">
                                  Tapeworm (dogs only)
                                </div>
                                <p className="text-sm text-slate-700">
                                  {country.tapewormDetails}
                                </p>
                              </div>
                            )}
                            {country.notes && (
                              <div className="pt-4 border-t border-slate-200">
                                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                                  Notes
                                </div>
                                <p className="text-sm text-slate-600">
                                  {country.notes}
                                </p>
                              </div>
                            )}
                            {country.officialSource && (
                              <a
                                href={country.officialSource}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 text-xs font-medium text-sky-600 hover:text-sky-700"
                              >
                                <ExternalLink size={12} />
                                Verify with official authority
                              </a>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-slate-900">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Relocate Your Cat?
            </h2>
            <p className="text-slate-300 mb-8">
              We handle documents, vet checks, and flights. Start on Telegram and
              we&apos;ll guide you through every step.
            </p>
            <a
              href={TELEGRAM_BOT_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-full transition-all shadow-lg shadow-sky-500/30"
            >
              <Send size={20} />
              Start on Telegram
            </a>
          </motion.div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="py-8 px-6 bg-slate-800">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs text-slate-400">
            Regulations change frequently. This matrix is for general guidance
            only. Always verify current requirements with the destination
            country&apos;s official veterinary authority before travel. FlyMy.Pet
            is not liable for regulatory changes.
          </p>
        </div>
      </section>
    </div>
  );
}
