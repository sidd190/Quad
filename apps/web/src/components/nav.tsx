import { auth, signOut } from "@/auth";
import Link from "next/link";
import { QuadMark } from "./logo";

export async function Nav() {
  const session = await auth();
  if (!session?.user) return null;

  const isReviewer =
    session.user.role === "reviewer" || session.user.role === "admin";

  return (
    <nav className="flex items-center justify-between border-b border-border px-6 py-4">
      <Link href="/" className="flex items-center gap-2.5 text-ink">
        <QuadMark size={26} />
        <span className="text-sm font-bold tracking-tight">Quad</span>
      </Link>
      <div className="flex items-center gap-5 text-[.8125rem]">
        <Link
          href="/developers"
          className="text-muted transition-colors hover:text-ink"
        >
          Developers
        </Link>
        <Link
          href="/docs"
          className="text-muted transition-colors hover:text-ink"
        >
          Docs
        </Link>
        {isReviewer && (
          <Link
            href="/review"
            className="text-muted transition-colors hover:text-ink"
          >
            Review
          </Link>
        )}
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/" });
          }}
        >
          <button
            type="submit"
            className="text-muted transition-colors hover:text-danger"
          >
            Sign out
          </button>
        </form>
      </div>
    </nav>
  );
}
