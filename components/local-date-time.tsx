"use client";

import { useIsClient } from "@/lib/use-is-client";

export function LocalDateTime({ startsAt, endsAt }: { startsAt: string; endsAt: string }) {
  const isClient = useIsClient();

  // Formatting needs the viewer's timezone, which only the browser knows.
  if (!isClient) {
    return <span className="inline-block h-4 w-44 animate-pulse rounded bg-[#eceff6] align-middle" aria-hidden="true" />;
  }

  const start = new Date(startsAt);
  const end = new Date(endsAt);
  const date = new Intl.DateTimeFormat("en-AU", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: start.getFullYear() === new Date().getFullYear() ? undefined : "numeric",
  }).format(start);
  const time = new Intl.DateTimeFormat("en-AU", { hour: "numeric", minute: "2-digit" });
  const timezone = new Intl.DateTimeFormat("en-AU", { timeZoneName: "short" })
    .formatToParts(start)
    .find((part) => part.type === "timeZoneName")?.value;

  return (
    <time dateTime={startsAt}>
      {date} · {time.format(start)}–{time.format(end)} {timezone}
    </time>
  );
}
