import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Flights — FlyMy.Pet Admin",
  robots: "noindex, nofollow",
};

export default async function FlightsPage() {
  const flights = await prisma.flight.findMany({
    orderBy: { date: "desc" },
    include: {
      volunteer: true,
      _count: { select: { relocations: true } },
    },
    take: 100,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Flights</h1>
        <p className="text-sm text-slate-500 mt-1">{flights.length} total</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="text-left px-5 py-3 font-medium text-slate-500">Route</th>
                <th className="text-left px-5 py-3 font-medium text-slate-500">Date</th>
                <th className="text-left px-5 py-3 font-medium text-slate-500">Airline</th>
                <th className="text-left px-5 py-3 font-medium text-slate-500">Volunteer</th>
                <th className="text-left px-5 py-3 font-medium text-slate-500">Relocations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {flights.map((flight) => (
                <tr key={flight.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-4 font-medium text-slate-900">{flight.route}</td>
                  <td className="px-5 py-4 text-slate-600">{new Date(flight.date).toLocaleDateString()}</td>
                  <td className="px-5 py-4 text-slate-600">{flight.airline || "—"}</td>
                  <td className="px-5 py-4 text-slate-600">{flight.volunteer?.name || "—"}</td>
                  <td className="px-5 py-4 text-slate-600">{flight._count.relocations}</td>
                </tr>
              ))}
              {flights.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-16 text-center text-slate-400">
                    No flights added yet.
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
