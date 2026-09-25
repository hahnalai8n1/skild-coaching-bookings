"use client";

import { useTransition } from "react";
import { cancelSession } from "./actions";

export function CancelButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        if (!confirm("Cancel this session?")) return;
        startTransition(() => {
          cancelSession(id);
        });
      }}
      className="text-sm text-red-600 underline disabled:opacity-50"
    >
      {isPending ? "Cancelling…" : "Cancel"}
    </button>
  );
}
