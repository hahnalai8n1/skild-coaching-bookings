import { SignupForm } from "./signup-form";

export default function SignupPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-sm flex-col justify-center px-4 py-8">
      <h1 className="mb-6 text-xl font-semibold">Create your coach account</h1>
      <SignupForm />
    </main>
  );
}
