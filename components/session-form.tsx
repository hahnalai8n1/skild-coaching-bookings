"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { CalendarClock, Clock3, MapPin, NotebookPen } from "lucide-react";
import { createSessionAction, updateSessionAction } from "@/app/actions/sessions";
import { INITIAL_ACTION_STATE, type CoachingSession } from "@/lib/types";
import { useIsClient } from "@/lib/use-is-client";
import { SubmitButton } from "./submit-button";

type SessionFormProps =
  | { mode: "create"; session?: never }
  | { mode: "edit"; session: CoachingSession };

function toLocalInput(iso?: string) {
  if (!iso) return "";
  const date = new Date(iso);
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function toUtcIso(localValue: string) {
  if (!localValue) return "";
  const date = new Date(localValue);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString();
}

export function SessionForm({ mode, session }: SessionFormProps) {
  const action = mode === "create" ? createSessionAction : updateSessionAction.bind(null, session.id);
  const [state, formAction] = useActionState(action, INITIAL_ACTION_STATE);
  // The saved UTC instants are converted to the viewer's local time, which is only
  // known in the browser. Until the coach edits a field, derive it after hydration.
  const isClient = useIsClient();
  const [startsAtEdited, setStartsAtLocal] = useState<string | null>(null);
  const [endsAtEdited, setEndsAtLocal] = useState<string | null>(null);
  const startsAtLocal = startsAtEdited ?? (isClient ? toLocalInput(session?.starts_at) : "");
  const endsAtLocal = endsAtEdited ?? (isClient ? toLocalInput(session?.ends_at) : "");

  return (
    <form action={formAction} className="space-y-6" noValidate>
      <input type="hidden" name="startsAtUtc" value={toUtcIso(startsAtLocal)} />
      <input type="hidden" name="endsAtUtc" value={toUtcIso(endsAtLocal)} />

      {state.status === "error" ? (
        <div className="error-banner" role="alert">
          {state.message}
        </div>
      ) : null}

      <div className="field-group">
        <label htmlFor="title">Session title</label>
        <div className="input-with-icon">
          <NotebookPen aria-hidden="true" size={18} />
          <input
            id="title"
            name="title"
            defaultValue={state.values?.title ?? session?.title}
            placeholder="e.g. Private skills session"
            maxLength={80}
            autoFocus
            required
          />
        </div>
        <FieldError messages={state.fieldErrors?.title} />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="field-group">
          <label htmlFor="startsAtLocal">Starts</label>
          <div className="input-with-icon">
            <CalendarClock aria-hidden="true" size={18} />
            <input
              id="startsAtLocal"
              type="datetime-local"
              value={startsAtLocal}
              onChange={(event) => setStartsAtLocal(event.target.value)}
              required
            />
          </div>
          <FieldError messages={state.fieldErrors?.startsAt} />
        </div>

        <div className="field-group">
          <label htmlFor="endsAtLocal">Ends</label>
          <div className="input-with-icon">
            <Clock3 aria-hidden="true" size={18} />
            <input
              id="endsAtLocal"
              type="datetime-local"
              value={endsAtLocal}
              onChange={(event) => setEndsAtLocal(event.target.value)}
              min={startsAtLocal}
              required
            />
          </div>
          <FieldError messages={state.fieldErrors?.endsAt} />
        </div>
      </div>

      <p className="-mt-2 text-xs leading-5 text-[#7a8195]">
        Enter times in your current timezone. Coachdesk stores them as UTC and shows each viewer their local time.
      </p>

      <div className="field-group">
        <label htmlFor="location">Location <span className="font-normal text-[#969caf]">Optional</span></label>
        <div className="input-with-icon">
          <MapPin aria-hidden="true" size={18} />
          <input id="location" name="location" defaultValue={state.values?.location ?? session?.location ?? ""} placeholder="Court, field or meeting link" maxLength={120} />
        </div>
        <FieldError messages={state.fieldErrors?.location} />
      </div>

      <div className="field-group">
        <label htmlFor="notes">Coach notes <span className="font-normal text-[#969caf]">Optional</span></label>
        <textarea
          id="notes"
          name="notes"
          defaultValue={state.values?.notes ?? session?.notes ?? ""}
          placeholder="Preparation, focus areas or anything you need to remember…"
          rows={5}
          maxLength={1000}
        />
        <FieldError messages={state.fieldErrors?.notes} />
      </div>

      <div className="flex flex-col-reverse gap-3 border-t border-[#e5e8f2] pt-6 sm:flex-row sm:justify-end">
        <Link href="/dashboard" className="button button-secondary">Cancel</Link>
        <div className="sm:min-w-40">
          <SubmitButton pendingLabel={mode === "create" ? "Creating…" : "Saving…"}>
            {mode === "create" ? "Create session" : "Save changes"}
          </SubmitButton>
        </div>
      </div>
    </form>
  );
}

function FieldError({ messages }: { messages?: string[] }) {
  return messages?.[0] ? <p className="field-error">{messages[0]}</p> : null;
}
