"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { login, type LoginState } from "./actions";
import Link from "next/link";
import { Suspense } from "react";
import { QuadMark } from "@/components/logo";

const initialState: LoginState = {};

function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";
  const [state, formAction, pending] = useActionState(login, initialState);

  return (
    <div className="flex min-h-dvh items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="animate-in flex flex-col items-center">
          <QuadMark size={44} />
          <h1 className="mt-5 text-2xl font-extrabold">Sign in</h1>
          <p className="mt-1 text-sm text-muted">
            Welcome back to Quad.
          </p>
        </div>

        {state.error && (
          <div className="animate-in mt-6 rounded-lg bg-danger/8 px-4 py-3 text-sm text-danger">
            {state.error}
          </div>
        )}

        <form action={formAction} className="animate-in-d1 mt-8 flex flex-col gap-4">
          <input type="hidden" name="callbackUrl" value={callbackUrl} />
          <div className="field">
            <label htmlFor="login-email" className="field-label">
              Email
            </label>
            <input
              id="login-email"
              name="email"
              type="email"
              placeholder="you@college.edu"
              required
              autoComplete="email"
            />
          </div>
          <div className="field">
            <label htmlFor="login-password" className="field-label">
              Password
            </label>
            <input
              id="login-password"
              name="password"
              type="password"
              placeholder="Your password"
              required
              autoComplete="current-password"
            />
          </div>
          <button type="submit" disabled={pending} className="btn-primary mt-2">
            {pending ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="animate-in-d2 mt-8 text-center text-sm text-muted">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-semibold text-accent">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
