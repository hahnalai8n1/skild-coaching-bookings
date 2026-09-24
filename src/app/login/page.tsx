import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-sm flex-col justify-center px-4 py-8">
      <h1 className="mb-6 text-xl font-semibold">Sign in</h1>
      <LoginForm />
    </main>
  );
}
