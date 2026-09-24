"use client";

import { useActionState } from "react";
import { createSession, updateSession, type SessionFormState } from "./actions";
import type { CoachingSession } from "@/types/database.types";

const initialState: SessionFormState = { error: null };

type Props =
  | { mode: "create"; session?: undefined }
  | { mode: "edit"; session: CoachingSession };

export function SessionForm({ mode, session }: Props) {
  const action =
    mode === "create" ? createSession : updateSession.bind(null, session.id);
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <Field label="Title" name="title" defaultValue={session?.title} required />

      <div className="grid grid-cols-3 gap-3">
        <Field
          label="Date"
          name="session_date"
          type="date"
          defaultValue={session?.session_date}
          required
        />
        <Field
          label="Start"
          name="start_time"
          type="time"
          defaultValue={session?.start_time?.slice(0, 5)}
          required
        />
        <Field
          label="End"
          name="end_time"
          type="time"
          defaultValue={session?.end_time?.slice(0, 5)}
          required
        />
      </div>

      <Field label="Location" name="location" defaultValue={session?.location ?? ""} />

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
          Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          defaultValue={session?.notes ?? ""}
          rows={3}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
      </div>

      {state.error && (
        <p role="alert" className="text-sm text-red-600">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {pending ? "Saving…" : mode === "create" ? "Create session" : "Save changes"}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  defaultValue,
  required,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        defaultValue={defaultValue}
        required={required}
        className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
      />
    </div>
  );
}
