import { prisma } from "@/lib/prisma";
import { RELOCATION_STATUSES } from "@/lib/constants";
import { notFound } from "next/navigation";
import Link from "next/link";
import { StatusUpdateForm } from "./StatusUpdateForm";

export const dynamic = "force-dynamic";

export default async function RelocationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const relocation = await prisma.relocation.findUnique({
    where: { id },
    include: {
      pet: {
        include: {
          owner: true,
          documents: true,
        },
      },
      flight: { include: { volunteer: true } },
    },
  });

  if (!relocation) notFound();

  const statusInfo = RELOCATION_STATUSES.find(
    (s) => s.value === relocation.status
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/relocations"
          className="text-slate-400 hover:text-slate-600 text-sm"
        >
          ← Back
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">
          Relocation Detail
        </h1>
        <span
          className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${statusInfo?.color || "bg-slate-100"}`}
        >
          {statusInfo?.label || relocation.status}
        </span>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Owner */}
          <Card title="Owner Details" icon={"\u{1F464}"}>
            <dl className="grid sm:grid-cols-2 gap-4 text-sm">
              <Field label="Name" value={relocation.pet.owner.name} />
              <Field label="Phone" value={relocation.pet.owner.phone} />
              <Field label="Email" value={relocation.pet.owner.email} />
              <Field label="From" value={relocation.pet.owner.origin ?? relocation.origin} />
              <Field label="Telegram ID" value={relocation.pet.owner.telegramId} />
            </dl>
          </Card>

          {/* Pet */}
          <Card title="Pet Details" icon={"\u{1F43E}"}>
            <dl className="grid sm:grid-cols-2 gap-4 text-sm">
              <Field label="Type" value={relocation.pet.type} />
              <Field label="Breed" value={relocation.pet.breed} />
              <Field label="Age" value={relocation.pet.age} />
              <Field label="Weight" value={relocation.pet.weight ? `${relocation.pet.weight} kg` : null} />
              <Field label="Microchip" value={relocation.pet.microchip} />
            </dl>
          </Card>

          {/* Travel */}
          <Card title="Travel Details" icon={"\u2708\uFE0F"}>
            <dl className="grid sm:grid-cols-2 gap-4 text-sm">
              <Field label="Origin" value={relocation.origin} />
              <Field label="Destination" value={relocation.destination} />
              <Field
                label="Travel Date"
                value={relocation.travelDate ? new Date(relocation.travelDate).toLocaleDateString() : null}
              />
              <Field label="Flexible Dates" value={relocation.flexDates ? "Yes" : "No"} />
              <Field label="Package" value={relocation.package} />
            </dl>
          </Card>

          {/* Documents */}
          <Card title={`Documents (${relocation.pet.documents.length})`} icon={"\u{1F4C4}"}>
            {relocation.pet.documents.length > 0 ? (
              <div className="space-y-3">
                {relocation.pet.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                  >
                    <div>
                      <span className="text-sm font-medium text-slate-900 capitalize">
                        {doc.type.replace(/_/g, " ")}
                      </span>
                      <span className="ml-2 text-xs text-slate-400">
                        {new Date(doc.uploadedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full ${doc.approved ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}
                    >
                      {doc.approved ? "Approved" : "Pending"}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400">No documents uploaded yet.</p>
            )}
          </Card>

          {/* Flight */}
          {relocation.flight && (
            <Card title="Flight Details" icon={"\u{1F6EB}"}>
              <dl className="grid sm:grid-cols-2 gap-4 text-sm">
                <Field label="Route" value={relocation.flight.route} />
                <Field label="Date" value={new Date(relocation.flight.date).toLocaleDateString()} />
                <Field label="Airline" value={relocation.flight.airline} />
                <Field label="Volunteer" value={relocation.flight.volunteer?.name} />
              </dl>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <StatusUpdateForm
            relocationId={relocation.id}
            currentStatus={relocation.status}
            currentNotes={relocation.notes}
          />

          <Card title="Timeline">
            <div className="space-y-3 text-sm">
              <TimelineItem label="Created" date={relocation.createdAt} />
              <TimelineItem label="Last Updated" date={relocation.updatedAt} />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Card({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
        {icon && <span>{icon}</span>}
        {title}
      </h2>
      {children}
    </div>
  );
}

function Field({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div>
      <dt className="text-slate-400 text-xs uppercase tracking-wider">{label}</dt>
      <dd className="mt-1 font-medium text-slate-900">{value || "—"}</dd>
    </div>
  );
}

function TimelineItem({ label, date }: { label: string; date: Date }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-2 h-2 rounded-full bg-sky-500" />
      <span className="text-slate-600">{label}</span>
      <span className="text-slate-400 ml-auto text-xs">
        {new Date(date).toLocaleString()}
      </span>
    </div>
  );
}
