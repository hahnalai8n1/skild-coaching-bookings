"use client";

import { AlertTriangle } from "lucide-react";

export default function DashboardError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="grid min-h-screen place-items-center bg-[#f7f8fc] px-5">
      <div className="max-w-md text-center">
        <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-[#fff0f1] text-[#a43d47]"><AlertTriangle size={22} /></span>
        <h1 className="mt-5 text-2xl font-black tracking-[-0.035em] text-[#20253d]">Sessions could not be loaded</h1>
        <p className="mt-3 text-sm leading-6 text-[#747b8f]">Check your connection and try again. Your existing session data has not been changed.</p>
        <button type="button" onClick={reset} className="button button-primary mt-6">Try again</button>
      </div>
    </main>
  );
}
