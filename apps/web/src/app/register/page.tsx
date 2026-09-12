"use client";

import { useActionState } from "react";
import { register, type RegisterState } from "./actions";
import Link from "next/link";
import { QuadMark } from "@/components/logo";

const initialState: RegisterState = {};

export default function RegisterPage() {
  const [state, formAction, pending] = useActionState(register, initialState);

  return (
    <div className="flex min-h-dvh items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="animate-in flex flex-col items-center">
          <QuadMark size={44} />
          <h1 className="mt-5 text-2xl font-extrabold">Create your account</h1>
          <p className="mt-1 text-sm text-muted">
            Verify once, use everywhere.
          </p>
        </div>

        {state.error && (
          <div className="animate-in mt-6 rounded-lg bg-danger/8 px-4 py-3 text-sm text-danger">
            {state.error}
          </div>
        )}

        <form action={formAction} className="animate-in-d1 mt-8 flex flex-col gap-4">
          <div className="flex gap-3">
            <div className="field flex-1">
              <label htmlFor="reg-first" className="field-label">
                First name
              </label>
              <input
                id="reg-first"
                name="firstName"
                required
                autoComplete="given-name"
              />
            </div>
            <div className="field flex-1">
              <label htmlFor="reg-last" className="field-label">
                Last name
              </label>
              <input
                id="reg-last"
                name="lastName"
                required
                autoComplete="family-name"
              />
            </div>
          </div>
          <div className="field">
            <label htmlFor="reg-email" className="field-label">
              College email
            </label>
            <input
              id="reg-email"
              name="email"
              type="email"
              placeholder="you@college.edu"
              required
              autoComplete="email"
            />
          </div>
          <div className="field">
            <label htmlFor="reg-university" className="field-label">
              University
            </label>
            <input
              id="reg-university"
              name="university"
              placeholder="e.g. GGSIPU"
              required
            />
          </div>
          <div className="field">
            <label htmlFor="reg-enrollment" className="field-label">
              Enrollment number
            </label>
            <input
              id="reg-enrollment"
              name="enrollmentNumber"
              required
            />
          </div>
          <div className="field">
            <label htmlFor="reg-password" className="field-label">
              Password
            </label>
            <input
              id="reg-password"
              name="password"
              type="password"
              placeholder="Min 8 characters"
              required
              minLength={8}
              autoComplete="new-password"
            />
          </div>
          <button type="submit" disabled={pending} className="btn-primary mt-2">
            {pending ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="animate-in-d2 mt-8 text-center text-sm text-muted">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-accent">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
