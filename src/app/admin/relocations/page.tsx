import { prisma } from "@/lib/prisma";
import { RELOCATION_STATUSES } from "@/lib/constants";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Relocations — FlyMy.Pet Admin",
  robots: "noindex, nofollow",
};

export default async function RelocationsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; destination?: string; page?: string }>;
}) {
  const params = await searchParams;
  const status = params.status;
  const destination = params.destination;
  const page = parseInt(params.page || "1", 10);
  const limit = 20;

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (destination)
    where.destination = { contains: destination, mode: "insensitive" };

  const [relocations, total] = await Promise.all([
    prisma.relocation.findMany({
      where,
      include: {
        pet: {
          include: {
            owner: {
              select: { name: true, phone: true, email: true, telegramId: true },
            },
            documents: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.relocation.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Relocations</h1>
          <p className="text-sm text-slate-500 mt-1">{total} total</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <form className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">
              Status
            </label>
            <select
              name="status"
              defaultValue={status || ""}
              className="block w-44 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20"
            >
              <option value="">All statuses</option>
              {RELOCATION_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">
              Destination
            </label>
            <select
              name="destination"
              defaultValue={destination || ""}
              className="block w-40 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20"
            >
              <option value="">All destinations</option>
              <option value="Spain">Spain</option>
              <option value="Portugal">Portugal</option>
              <option value="Romania">Romania</option>
              <option value="Russia">Russia</option>
            </select>
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors"
          >
            Filter
          </button>
          {(status || destination) && (
            <a
              href="/admin/relocations"
              className="px-4 py-2 text-sm text-slate-500 hover:text-slate-700"
            >
              Clear
            </a>
          )}
        </form>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="text-left px-5 py-3 font-medium text-slate-500">Owner</th>
                <th className="text-left px-5 py-3 font-medium text-slate-500">Pet</th>
                <th className="text-left px-5 py-3 font-medium text-slate-500">Route</th>
                <th className="text-left px-5 py-3 font-medium text-slate-500">Status</th>
                <th className="text-left px-5 py-3 font-medium text-slate-500">Docs</th>
                <th className="text-left px-5 py-3 font-medium text-slate-500">Travel Date</th>
                <th className="text-left px-5 py-3 font-medium text-slate-500">Submitted</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {relocations.map((r) => {
                const statusInfo = RELOCATION_STATUSES.find(
                  (s) => s.value === r.status
                );
                return (
                  <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-medium text-slate-900">{r.pet.owner.name}</div>
                      <div className="text-slate-400 text-xs">
                        {r.pet.owner.email || r.pet.owner.phone || "—"}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {r.pet.breed || r.pet.type}
                      {r.pet.weight ? ` (${r.pet.weight}kg)` : ""}
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {r.origin} → {r.destination}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo?.color || "bg-slate-100"}`}
                      >
                        {statusInfo?.label || r.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {r.pet.documents.length}
                    </td>
                    <td className="px-5 py-4 text-slate-400">
                      {r.travelDate
                        ? new Date(r.travelDate).toLocaleDateString()
                        : "—"}
                      {r.flexDates && (
                        <span className="ml-1 text-xs text-sky-500 font-medium">flex</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-slate-400">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4">
                      <Link
                        href={`/admin/relocations/${r.id}`}
                        className="text-sky-600 hover:text-sky-700 font-medium text-xs"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                );
              })}
              {relocations.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-16 text-center text-slate-400">
                    No relocations found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="px-5 py-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-2">
              {page > 1 && (
                <Link
                  href={`/admin/relocations?page=${page - 1}${status ? `&status=${status}` : ""}${destination ? `&destination=${destination}` : ""}`}
                  className="px-3 py-1.5 text-xs bg-slate-100 rounded-lg hover:bg-slate-200 text-slate-700"
                >
                  Previous
                </Link>
              )}
              {page < totalPages && (
                <Link
                  href={`/admin/relocations?page=${page + 1}${status ? `&status=${status}` : ""}${destination ? `&destination=${destination}` : ""}`}
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
