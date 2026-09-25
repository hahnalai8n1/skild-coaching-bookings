"use client";

import { useState, useTransition } from "react";
import { Ban, LoaderCircle } from "lucide-react";
import { cancelSessionAction } from "@/app/actions/sessions";

export function CancelSessionButton({ sessionId }: { sessionId: string }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string>();

  function cancelSession() {
    if (!window.confirm("Cancel this session? It will remain in your history.")) return;
    setError(undefined);
    startTransition(async () => {
      const result = await cancelSessionAction(sessionId);
      setError(result.error);
    });
  }

  return (
    <div>
      <button type="button" className="session-action text-[#a43d47]" onClick={cancelSession} disabled={isPending}>
        {isPending ? <LoaderCircle className="animate-spin" size={15} /> : <Ban size={15} />}
        {isPending ? "Cancelling…" : "Cancel"}
      </button>
      {error ? <p className="mt-2 text-xs text-[#a43d47]" role="alert">{error}</p> : null}
    </div>
  );
}
