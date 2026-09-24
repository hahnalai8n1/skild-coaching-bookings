import { SessionForm } from "../session-form";

export default function NewSessionPage() {
  return (
    <main className="mx-auto max-w-lg px-4 py-8">
      <h1 className="mb-6 text-xl font-semibold">New session</h1>
      <SessionForm mode="create" />
    </main>
  );
}
