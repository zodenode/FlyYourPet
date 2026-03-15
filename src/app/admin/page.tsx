import { prisma } from "@/lib/prisma";
import { RELOCATION_STATUSES } from "@/lib/constants";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Dashboard — FlyMy.Pet Admin",
  robots: "noindex, nofollow",
};

export default async function AdminDashboard() {
  const [
    totalUsers,
    totalPets,
    totalRelocations,
    totalDocuments,
    statusCounts,
    recentCustomers,
    recentDocuments,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.pet.count(),
    prisma.relocation.count(),
    prisma.document.count(),
    prisma.relocation.groupBy({ by: ["status"], _count: true }),
    prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        pets: { include: { relocations: { take: 1, orderBy: { createdAt: "desc" } } } },
        onboardState: true,
      },
    }),
    prisma.document.findMany({
      take: 5,
      orderBy: { uploadedAt: "desc" },
      include: { pet: { include: { owner: { select: { name: true } } } } },
    }),
  ]);

  const activeCount = statusCounts
    .filter((s) => !["delivered", "cancelled"].includes(s.status))
    .reduce((sum, s) => sum + s._count, 0);

  const deliveredCount =
    statusCounts.find((s) => s.status === "delivered")?._count || 0;

  const statusMap = Object.fromEntries(
    statusCounts.map((s) => [s.status, s._count])
  );

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat label="Customers" value={totalUsers} sub="from Telegram" accent="bg-sky-50 text-sky-700" />
        <Stat label="Pets Registered" value={totalPets} sub="via onboarding" accent="bg-amber-50 text-amber-700" />
        <Stat label="Active Relocations" value={activeCount} sub={`${deliveredCount} delivered`} accent="bg-emerald-50 text-emerald-700" />
        <Stat label="Documents" value={totalDocuments} sub="uploaded" accent="bg-violet-50 text-violet-700" />
      </div>

      {/* Status pipeline */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="font-semibold text-slate-900 mb-4">Relocation Pipeline</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {RELOCATION_STATUSES.map((s) => (
            <div key={s.value} className="text-center">
              <div className="text-2xl font-bold text-slate-900">{statusMap[s.value] || 0}</div>
              <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold mt-1 ${s.color}`}>
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent customers */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">Recent Customers</h2>
            <Link href="/admin/customers" className="text-xs text-sky-600 hover:text-sky-700 font-medium">
              View all →
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {recentCustomers.map((u) => {
              const reloc = u.pets[0]?.relocations[0];
              return (
                <div key={u.id} className="px-5 py-3 flex items-center gap-4">
                  <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-500 shrink-0">
                    {u.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-slate-900 text-sm truncate">{u.name}</div>
                    <div className="text-xs text-slate-400 truncate">
                      {u.email || u.phone || `TG: ${u.telegramId}`}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    {reloc ? (
                      <span className="text-[10px] font-medium text-slate-500">
                        {reloc.origin} → {reloc.destination}
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400">
                        {u.onboardState ? `Step: ${u.onboardState.step}` : "New"}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
            {recentCustomers.length === 0 && (
              <div className="px-5 py-10 text-center text-sm text-slate-400">
                No customers yet. They appear here when users message the Telegram bot.
              </div>
            )}
          </div>
        </div>

        {/* Recent documents */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">Recent Documents</h2>
            <Link href="/admin/documents" className="text-xs text-sky-600 hover:text-sky-700 font-medium">
              View all →
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {recentDocuments.map((d) => (
              <div key={d.id} className="px-5 py-3 flex items-center gap-4">
                <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-lg shrink-0">
                  {"\u{1F4C4}"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-slate-900 text-sm capitalize truncate">
                    {d.type.replace(/_/g, " ")}
                  </div>
                  <div className="text-xs text-slate-400 truncate">
                    {d.pet.owner.name} — {d.pet.breed || d.pet.type}
                  </div>
                </div>
                <div className="shrink-0">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${d.approved ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                    {d.approved ? "Approved" : "Pending"}
                  </span>
                </div>
              </div>
            ))}
            {recentDocuments.length === 0 && (
              <div className="px-5 py-10 text-center text-sm text-slate-400">
                No documents yet. They appear here when users upload files via Telegram.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: number;
  sub: string;
  accent: string;
}) {
  return (
    <div className={`rounded-xl p-5 ${accent}`}>
      <div className="text-sm font-medium opacity-80">{label}</div>
      <div className="text-3xl font-bold mt-1">{value}</div>
      <div className="text-xs opacity-60 mt-1">{sub}</div>
    </div>
  );
}
