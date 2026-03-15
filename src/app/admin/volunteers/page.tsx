import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Volunteers — FlyMy.Pet Admin",
  robots: "noindex, nofollow",
};

export default async function VolunteersPage() {
  const volunteers = await prisma.volunteer.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { flights: true } },
    },
    take: 100,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Volunteers</h1>
        <p className="text-sm text-slate-500 mt-1">{volunteers.length} total</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="text-left px-5 py-3 font-medium text-slate-500">Name</th>
                <th className="text-left px-5 py-3 font-medium text-slate-500">Phone</th>
                <th className="text-left px-5 py-3 font-medium text-slate-500">Email</th>
                <th className="text-left px-5 py-3 font-medium text-slate-500">Telegram</th>
                <th className="text-left px-5 py-3 font-medium text-slate-500">Flights</th>
                <th className="text-left px-5 py-3 font-medium text-slate-500">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {volunteers.map((vol) => (
                <tr key={vol.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-4 font-medium text-slate-900">{vol.name}</td>
                  <td className="px-5 py-4 text-slate-600">{vol.phone || "—"}</td>
                  <td className="px-5 py-4 text-slate-600">{vol.email || "—"}</td>
                  <td className="px-5 py-4">
                    <code className="text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                      {vol.telegramId || "—"}
                    </code>
                  </td>
                  <td className="px-5 py-4 text-slate-600">{vol._count.flights}</td>
                  <td className="px-5 py-4 text-xs text-slate-400">
                    {new Date(vol.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {volunteers.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center text-slate-400">
                    No volunteers registered yet. They can register via the /volunteer command on Telegram.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
