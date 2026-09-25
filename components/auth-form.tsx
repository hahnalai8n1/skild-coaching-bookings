"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signInAction, signUpAction } from "@/app/actions/auth";
import { INITIAL_ACTION_STATE } from "@/lib/types";
import { SubmitButton } from "./submit-button";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const action = mode === "login" ? signInAction : signUpAction;
  const [state, formAction] = useActionState(action, INITIAL_ACTION_STATE);
  const isLogin = mode === "login";

  return (
    <form action={formAction} className="space-y-5" noValidate>
      {state.status === "error" ? (
        <div className="error-banner" role="alert">
          {state.message}
        </div>
      ) : null}

      <div className="field-group">
        <label htmlFor="email">Email address</label>
        <input id="email" name="email" type="email" defaultValue={state.values?.email} autoComplete="email" placeholder="coach@example.com" required />
        <FieldError messages={state.fieldErrors?.email} />
      </div>

      <div className="field-group">
        <div className="flex items-center justify-between gap-4">
          <label htmlFor="password">Password</label>
          {isLogin ? <span className="text-xs font-medium text-[#767d93]">8+ characters</span> : null}
        </div>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete={isLogin ? "current-password" : "new-password"}
          placeholder="Enter your password"
          minLength={8}
          required
        />
        <FieldError messages={state.fieldErrors?.password} />
      </div>

      <SubmitButton pendingLabel={isLogin ? "Signing in…" : "Creating account…"}>
        {isLogin ? "Sign in" : "Create coach account"}
      </SubmitButton>

      <p className="text-center text-sm text-[#6b7285]">
        {isLogin ? "New to Coachdesk?" : "Already have an account?"}{" "}
        <Link className="font-bold text-[#174f9e] hover:underline" href={isLogin ? "/signup" : "/login"}>
          {isLogin ? "Create an account" : "Sign in"}
        </Link>
      </p>
    </form>
  );
}

function FieldError({ messages }: { messages?: string[] }) {
  return messages?.[0] ? <p className="field-error">{messages[0]}</p> : null;
}
