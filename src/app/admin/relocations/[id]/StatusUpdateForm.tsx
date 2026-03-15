"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { RELOCATION_STATUSES } from "@/lib/constants";

export function StatusUpdateForm({
  relocationId,
  currentStatus,
  currentNotes,
}: {
  relocationId: string;
  currentStatus: string;
  currentNotes: string | null;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState(currentStatus);
  const [notes, setNotes] = useState(currentNotes || "");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");

    try {
      const res = await fetch(`/api/relocations/${relocationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, notes }),
      });

      if (!res.ok) throw new Error("Update failed");

      setMessage("Updated successfully!");
      startTransition(() => router.refresh());
    } catch {
      setMessage("Failed to update. Please try again.");
    }
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <h2 className="font-semibold text-slate-900 mb-4">Update Status</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">
            Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
          >
            {RELOCATION_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">
            Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
            placeholder="Internal notes..."
          />
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="w-full px-4 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50"
        >
          {isPending ? "Updating..." : "Save Changes"}
        </button>
        {message && (
          <p
            className={`text-xs text-center ${message.includes("success") ? "text-emerald-600" : "text-red-600"}`}
          >
            {message}
          </p>
        )}
      </form>
    </div>
  );
}
