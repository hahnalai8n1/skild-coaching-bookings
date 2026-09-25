import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Coachdesk", template: "%s · Coachdesk" },
  description: "A secure workspace for independent sports coaches to manage their sessions.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
