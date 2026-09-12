import { auth } from "@/auth";
import { getClient } from "@/lib/oauth";
import { redirect } from "next/navigation";
import { QuadMark } from "@/components/logo";

const SCOPE_INFO: Record<string, { label: string; desc: string }> = {
  openid: { label: "Identity", desc: "Your user ID" },
  profile: { label: "Profile", desc: "Your name and email address" },
  campus: { label: "Campus info", desc: "Your university and verification status" },
  enrollment: { label: "Enrollment number", desc: "Your student enrollment ID" },
};

export default async function ConsentPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const params = await searchParams;
  const {
    client_id,
    redirect_uri,
    response_type,
    scope,
    state,
    code_challenge,
    code_challenge_method,
  } = params;

  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const client = await getClient(client_id);
  if (!client || !client.redirectUris.includes(redirect_uri)) {
    return (
      <div className="flex min-h-dvh items-center justify-center px-6">
        <div className="text-center">
          <h1 className="text-xl font-bold text-danger">Invalid request</h1>
          <p className="mt-2 text-sm text-muted">
            Unknown application or redirect URI.
          </p>
        </div>
      </div>
    );
  }

  const scopes = (scope ?? "openid").split(" ");

  return (
    <div className="flex min-h-dvh items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="animate-in flex flex-col items-center">
          <QuadMark size={40} />
          <h1 className="mt-4 text-xl font-extrabold">Sign in with Quad</h1>
          <p className="mt-1 text-sm text-muted">as {session.user.email}</p>
        </div>

        <div className="animate-in-d1 mt-8 rounded-xl border border-border p-6">
          <p className="text-sm">
            <span className="font-bold">{client.name}</span>
            <span className="text-muted"> wants to access:</span>
          </p>

          <div className="mt-4 flex flex-col gap-2">
            {scopes.map((s) => {
              const info = SCOPE_INFO[s];
              if (!info) return null;
              return (
                <div
                  key={s}
                  className="flex items-start gap-3 rounded-lg bg-surface px-3 py-2.5"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--success)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mt-0.5 shrink-0"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <div>
                    <p className="text-sm font-semibold">{info.label}</p>
                    <p className="text-xs text-muted">{info.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <form
          action="/oauth/authorize"
          method="POST"
          className="animate-in-d2 mt-6 flex flex-col gap-2.5"
        >
          <input type="hidden" name="client_id" value={client_id} />
          <input type="hidden" name="redirect_uri" value={redirect_uri} />
          <input type="hidden" name="response_type" value={response_type ?? "code"} />
          <input type="hidden" name="scope" value={scope ?? "openid"} />
          {state && <input type="hidden" name="state" value={state} />}
          {code_challenge && (
            <>
              <input type="hidden" name="code_challenge" value={code_challenge} />
              <input type="hidden" name="code_challenge_method" value={code_challenge_method ?? "plain"} />
            </>
          )}

          <button
            type="submit"
            name="consent_decision"
            value="approve"
            className="btn-accent"
          >
            Allow
          </button>
          <button
            type="submit"
            name="consent_decision"
            value="deny"
            className="rounded-[.625rem] border border-border py-[.6875rem] text-sm font-semibold text-muted transition-colors hover:text-ink"
          >
            Deny
          </button>
        </form>

        <p className="animate-in-d3 mt-4 text-center text-xs text-muted">
          {client.name} will receive the information listed above.
        </p>
      </div>
    </div>
  );
}
