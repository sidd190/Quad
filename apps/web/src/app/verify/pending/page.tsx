import Link from "next/link";

export default function PendingPage() {
  return (
    <div className="flex min-h-dvh items-center justify-center px-6">
      <div className="animate-in flex max-w-sm flex-col items-center text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/10">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--accent)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        </div>
        <h1 className="mt-5 text-2xl font-bold">Verification pending</h1>
        <p className="mt-2 text-muted">
          Your ID card has been submitted. A reviewer will check it shortly.
          You&apos;ll be able to use campus services once approved.
        </p>
        <Link
          href="/"
          className="mt-8 text-sm font-medium text-accent hover:text-accent-hover"
        >
          Back to home &rarr;
        </Link>
      </div>
    </div>
  );
}
