import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Customers — FlyMy.Pet Admin",
  robots: "noindex, nofollow",
};

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const params = await searchParams;
  const query = params.q || "";
  const page = parseInt(params.page || "1", 10);
  const limit = 25;

  const where = query
    ? {
        OR: [
          { name: { contains: query, mode: "insensitive" as const } },
          { email: { contains: query, mode: "insensitive" as const } },
          { phone: { contains: query, mode: "insensitive" as const } },
          { telegramId: { contains: query, mode: "insensitive" as const } },
          { origin: { contains: query, mode: "insensitive" as const } },
        ],
      }
    : {};

  const [customers, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        pets: {
          include: {
            documents: { select: { id: true } },
            relocations: {
              take: 1,
              orderBy: { createdAt: "desc" },
              select: { status: true, origin: true, destination: true },
            },
          },
        },
        onboardState: { select: { step: true } },
      },
    }),
    prisma.user.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Customers</h1>
          <p className="text-sm text-slate-500 mt-1">
            {total} customer{total !== 1 ? "s" : ""} captured via Telegram
          </p>
        </div>

        <form className="flex gap-2">
          <input
            name="q"
            type="text"
            placeholder="Search name, email, phone, TG ID..."
            defaultValue={query}
            className="w-64 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors"
          >
            Search
          </button>
          {query && (
            <a
              href="/admin/customers"
              className="px-4 py-2 text-sm text-slate-500 hover:text-slate-700 flex items-center"
            >
              Clear
            </a>
          )}
        </form>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="text-left px-5 py-3 font-medium text-slate-500">Customer</th>
                <th className="text-left px-5 py-3 font-medium text-slate-500">Contact</th>
                <th className="text-left px-5 py-3 font-medium text-slate-500">From</th>
                <th className="text-left px-5 py-3 font-medium text-slate-500">Telegram ID</th>
                <th className="text-left px-5 py-3 font-medium text-slate-500">Pets</th>
                <th className="text-left px-5 py-3 font-medium text-slate-500">Docs</th>
                <th className="text-left px-5 py-3 font-medium text-slate-500">Relocation</th>
                <th className="text-left px-5 py-3 font-medium text-slate-500">Onboard Step</th>
                <th className="text-left px-5 py-3 font-medium text-slate-500">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {customers.map((c) => {
                const docCount = c.pets.reduce(
                  (sum, p) => sum + p.documents.length,
                  0
                );
                const latestReloc = c.pets[0]?.relocations[0];
                return (
                  <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center text-xs font-bold shrink-0">
                          {c.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-slate-900">{c.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="text-slate-700">{c.email || "—"}</div>
                      <div className="text-xs text-slate-400">{c.phone || ""}</div>
                    </td>
                    <td className="px-5 py-4 text-slate-600">{c.origin || "—"}</td>
                    <td className="px-5 py-4">
                      <code className="text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                        {c.telegramId || "—"}
                      </code>
                    </td>
                    <td className="px-5 py-4 text-slate-600">{c.pets.length}</td>
                    <td className="px-5 py-4">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${docCount > 0 ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-400"}`}>
                        {docCount}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {latestReloc ? (
                        <div>
                          <div className="text-xs text-slate-700">
                            {latestReloc.origin} → {latestReloc.destination}
                          </div>
                          <StatusBadge status={latestReloc.status} />
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        c.onboardState?.step === "complete"
                          ? "bg-emerald-50 text-emerald-700"
                          : c.onboardState
                            ? "bg-sky-50 text-sky-700"
                            : "bg-slate-100 text-slate-400"
                      }`}>
                        {c.onboardState?.step || "—"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-400">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                );
              })}
              {customers.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-5 py-16 text-center text-slate-400">
                    {query
                      ? "No customers matching your search."
                      : "No customers yet. They appear when users message the Telegram bot."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="px-5 py-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Page {page} of {totalPages} ({total} total)
            </span>
            <div className="flex gap-2">
              {page > 1 && (
                <Link
                  href={`/admin/customers?page=${page - 1}${query ? `&q=${query}` : ""}`}
                  className="px-3 py-1.5 text-xs bg-slate-100 rounded-lg hover:bg-slate-200 text-slate-700"
                >
                  Previous
                </Link>
              )}
              {page < totalPages && (
                <Link
                  href={`/admin/customers?page=${page + 1}${query ? `&q=${query}` : ""}`}
                  className="px-3 py-1.5 text-xs bg-slate-100 rounded-lg hover:bg-slate-200 text-slate-700"
                >
                  Next
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    submitted: "bg-blue-50 text-blue-700",
    documents_pending: "bg-amber-50 text-amber-700",
    vet_verification: "bg-orange-50 text-orange-700",
    flight_matching: "bg-violet-50 text-violet-700",
    confirmed: "bg-indigo-50 text-indigo-700",
    in_transit: "bg-cyan-50 text-cyan-700",
    delivered: "bg-emerald-50 text-emerald-700",
    cancelled: "bg-red-50 text-red-700",
  };
  return (
    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${colors[status] || "bg-slate-100 text-slate-600"}`}>
      {status.replace(/_/g, " ")}
    </span>
  );
}
