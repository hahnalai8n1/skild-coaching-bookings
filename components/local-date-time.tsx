"use client";

export function LocalDateTime({ startsAt, endsAt }: { startsAt: string; endsAt: string }) {
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
    <span suppressHydrationWarning>
      {date} · {time.format(start)}–{time.format(end)} {timezone}
    </span>
  );
}
