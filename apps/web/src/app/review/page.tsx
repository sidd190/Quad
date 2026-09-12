import { auth } from "@/auth";
import { getUserById } from "@/lib/keycloak-admin";
import { getPendingReviews, approveUser, rejectUser } from "./actions";
import { redirect } from "next/navigation";
import { Nav } from "@/components/nav";

export const dynamic = "force-dynamic";

export default async function ReviewPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const kcUser = await getUserById(session.user.id);
  const role = kcUser?.attributes?.role?.[0];

  if (role !== "reviewer" && role !== "admin") {
    return (
      <div className="min-h-dvh">
        <Nav />
        <div className="flex flex-col items-center px-6 py-24 text-center">
          <h1 className="text-xl font-extrabold">Access denied</h1>
          <p className="mt-2 text-sm text-muted">
            You need the reviewer role to access this page.
          </p>
        </div>
      </div>
    );
  }

  const pending = await getPendingReviews();

  return (
    <div className="min-h-dvh">
      <Nav />
      <main className="mx-auto max-w-3xl px-6 py-14">
        <div className="animate-in">
          <h1 className="text-2xl font-extrabold">Review dashboard</h1>
          <p className="mt-1 text-sm text-muted">
            {pending.length} pending review{pending.length !== 1 && "s"}
          </p>
        </div>

        {pending.length === 0 ? (
          <p className="mt-12 text-center text-sm text-muted">
            No pending reviews. Check back later.
          </p>
        ) : (
          <div className="mt-8 flex flex-col gap-4">
            {pending.map((user, i) => (
              <div
                key={user.id}
                className="animate-in rounded-xl border border-border p-6"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="font-bold">
                      {user.firstName} {user.lastName}
                    </h2>
                    <p className="mt-0.5 text-sm text-muted">{user.email}</p>
                  </div>
                  <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
                    Pending
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-xs font-medium text-muted">University</span>
                    <p className="mt-0.5 font-medium">{user.university || "-"}</p>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-muted">Enrollment</span>
                    <p className="mt-0.5 font-medium">
                      {user.enrollmentNumber || "-"}
                    </p>
                  </div>
                </div>

                {user.idCardFilename && (
                  <div className="mt-4">
                    <img
                      src={`/api/uploads/${user.idCardFilename}`}
                      alt="ID Card"
                      className="max-h-56 rounded-lg border border-border"
                    />
                  </div>
                )}

                <div className="mt-5 flex gap-3">
                  <form action={approveUser}>
                    <input type="hidden" name="userId" value={user.id} />
                    <button
                      type="submit"
                      className="rounded-lg bg-success px-5 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                    >
                      Approve
                    </button>
                  </form>
                  <form action={rejectUser} className="flex gap-2">
                    <input type="hidden" name="userId" value={user.id} />
                    <div className="field">
                      <input
                        name="reason"
                        placeholder="Rejection reason"
                      />
                    </div>
                    <button
                      type="submit"
                      className="rounded-lg bg-danger px-5 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                    >
                      Reject
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
