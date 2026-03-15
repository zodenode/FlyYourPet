import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Documents — FlyMy.Pet Admin",
  robots: "noindex, nofollow",
};

const DOC_TYPE_LABELS: Record<string, string> = {
  vaccination_card: "Vaccination Card",
  rabies_certificate: "Rabies Certificate",
  pet_passport: "Pet Passport",
  owner_id: "Owner ID",
  other: "Other",
};

export default async function DocumentsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; status?: string; page?: string }>;
}) {
  const params = await searchParams;
  const typeFilter = params.type;
  const statusFilter = params.status;
  const page = parseInt(params.page || "1", 10);
  const limit = 25;

  const where: Record<string, unknown> = {};
  if (typeFilter) where.type = typeFilter;
  if (statusFilter === "approved") where.approved = true;
  if (statusFilter === "pending") where.approved = false;

  const [documents, total, typeCounts] = await Promise.all([
    prisma.document.findMany({
      where,
      orderBy: { uploadedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        pet: {
          include: {
            owner: { select: { name: true, telegramId: true, email: true } },
          },
        },
      },
    }),
    prisma.document.count({ where }),
    prisma.document.groupBy({ by: ["type"], _count: true }),
  ]);

  const totalPages = Math.ceil(total / limit);
  const totalDocs = typeCounts.reduce((sum, t) => sum + t._count, 0);
  const pendingCount = await prisma.document.count({ where: { approved: false } });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Documents</h1>
          <p className="text-sm text-slate-500 mt-1">
            {totalDocs} document{totalDocs !== 1 ? "s" : ""} uploaded via Telegram
            {pendingCount > 0 && (
              <span className="ml-2 text-amber-600 font-medium">
                ({pendingCount} pending review)
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Type summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {Object.entries(DOC_TYPE_LABELS).map(([key, label]) => {
          const count = typeCounts.find((t) => t.type === key)?._count || 0;
          const isActive = typeFilter === key;
          return (
            <a
              key={key}
              href={isActive ? "/admin/documents" : `/admin/documents?type=${key}`}
              className={`rounded-xl p-4 text-center transition-colors border ${
                isActive
                  ? "bg-sky-50 border-sky-200 text-sky-800"
                  : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
            >
              <div className="text-2xl font-bold">{count}</div>
              <div className="text-xs mt-1 font-medium opacity-70">{label}</div>
            </a>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <FilterPill
          label="All"
          href="/admin/documents"
          active={!typeFilter && !statusFilter}
        />
        <FilterPill
          label="Pending Review"
          href="/admin/documents?status=pending"
          active={statusFilter === "pending"}
          accent
        />
        <FilterPill
          label="Approved"
          href="/admin/documents?status=approved"
          active={statusFilter === "approved"}
        />
      </div>

      {/* Document list */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="text-left px-5 py-3 font-medium text-slate-500">Document Type</th>
                <th className="text-left px-5 py-3 font-medium text-slate-500">Customer</th>
                <th className="text-left px-5 py-3 font-medium text-slate-500">Pet</th>
                <th className="text-left px-5 py-3 font-medium text-slate-500">File Reference</th>
                <th className="text-left px-5 py-3 font-medium text-slate-500">Status</th>
                <th className="text-left px-5 py-3 font-medium text-slate-500">Uploaded</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {documents.map((doc) => (
                <tr key={doc.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-base shrink-0">
                        {docIcon(doc.type)}
                      </div>
                      <span className="font-medium text-slate-900 capitalize">
                        {doc.type.replace(/_/g, " ")}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="text-slate-700">{doc.pet.owner.name}</div>
                    <div className="text-xs text-slate-400">
                      {doc.pet.owner.email || `TG: ${doc.pet.owner.telegramId}`}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-slate-600">
                    {doc.pet.breed || doc.pet.type}
                    {doc.pet.microchip && (
                      <div className="text-xs text-slate-400 font-mono">{doc.pet.microchip}</div>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <code className="text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-500 break-all">
                      {doc.fileId || doc.fileUrl}
                    </code>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        doc.approved
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {doc.approved ? "Approved" : "Pending"}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-xs text-slate-400">
                    {new Date(doc.uploadedAt).toLocaleDateString()}
                    <div>{new Date(doc.uploadedAt).toLocaleTimeString()}</div>
                  </td>
                  <td className="px-5 py-4">
                    <ApproveButton docId={doc.id} approved={doc.approved} />
                  </td>
                </tr>
              ))}
              {documents.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-16 text-center text-slate-400">
                    {typeFilter || statusFilter
                      ? "No documents matching your filters."
                      : "No documents uploaded yet. They appear when users send files via Telegram."}
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
                  href={buildPageUrl(page - 1, typeFilter, statusFilter)}
                  className="px-3 py-1.5 text-xs bg-slate-100 rounded-lg hover:bg-slate-200 text-slate-700"
                >
                  Previous
                </Link>
              )}
              {page < totalPages && (
                <Link
                  href={buildPageUrl(page + 1, typeFilter, statusFilter)}
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

function FilterPill({
  label,
  href,
  active,
  accent,
}: {
  label: string;
  href: string;
  active: boolean;
  accent?: boolean;
}) {
  return (
    <a
      href={href}
      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
        active
          ? accent
            ? "bg-amber-100 text-amber-800"
            : "bg-sky-100 text-sky-800"
          : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
      }`}
    >
      {label}
    </a>
  );
}

function ApproveButton({
  docId,
  approved,
}: {
  docId: string;
  approved: boolean;
}) {
  if (approved) return null;
  return (
    <form action={`/api/documents/${docId}/approve`} method="POST">
      <button
        type="submit"
        className="text-xs text-sky-600 hover:text-sky-800 font-medium"
      >
        Approve
      </button>
    </form>
  );
}

function docIcon(type: string): string {
  const icons: Record<string, string> = {
    vaccination_card: "\u{1F489}",
    rabies_certificate: "\u{1F9EA}",
    pet_passport: "\u{1F4D8}",
    owner_id: "\u{1FAAA}",
  };
  return icons[type] || "\u{1F4C4}";
}

function buildPageUrl(
  page: number,
  type?: string,
  status?: string
): string {
  const params = new URLSearchParams();
  params.set("page", String(page));
  if (type) params.set("type", type);
  if (status) params.set("status", status);
  return `/admin/documents?${params.toString()}`;
}
