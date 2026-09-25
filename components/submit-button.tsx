"use client";

import { useFormStatus } from "react-dom";
import { LoaderCircle } from "lucide-react";

export function SubmitButton({ children, pendingLabel }: { children: React.ReactNode; pendingLabel: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="button button-primary w-full" disabled={pending}>
      {pending ? <LoaderCircle aria-hidden="true" className="animate-spin" size={17} /> : null}
      {pending ? pendingLabel : children}
    </button>
  );
}
