import Link from "next/link";
import { QuadMark } from "@/components/logo";

export default function VerifiedPage() {
  return (
    <div className="flex min-h-dvh items-center justify-center px-6">
      <div className="animate-in flex max-w-sm flex-col items-center text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--success)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h1 className="mt-5 text-2xl font-bold">Identity verified</h1>
        <p className="mt-2 text-muted">
          You&apos;re verified as a student. You can now sign in to any campus
          app that uses Quad.
        </p>
        <Link
          href="/"
          className="mt-8 rounded-full bg-ink px-8 py-2.5 text-sm font-medium text-paper transition-opacity hover:opacity-90"
        >
          Continue
        </Link>
      </div>
    </div>
  );
}
