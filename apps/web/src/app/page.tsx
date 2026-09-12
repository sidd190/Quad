import { auth } from "@/auth";
import { getUserById } from "@/lib/keycloak-admin";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Nav } from "@/components/nav";
import { QuadAnimatedMark, QuadMark } from "@/components/logo";

function Landing() {
  return (
    <div className="flex min-h-dvh flex-col">
      <nav className="flex items-center justify-between px-6 py-5 sm:px-10">
        <QuadMark size={28} />
        <div className="flex items-center gap-6 text-[.8125rem]">
          <Link
            href="/docs"
            className="text-muted transition-colors hover:text-ink"
          >
            Docs
          </Link>
          <Link
            href="/developers"
            className="text-muted transition-colors hover:text-ink"
          >
            Developers
          </Link>
          <Link
            href="/login"
            className="rounded-full border border-ink/15 px-4 py-1.5 font-medium text-ink transition-colors hover:bg-ink/5"
          >
            Sign in
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex flex-1 flex-col items-center justify-center px-6 pb-24 pt-8">
        <div className="animate-in flex flex-col items-center text-center">
          <QuadAnimatedMark size={120} />
          <div className="mt-3 flex items-center gap-2 text-[.6875rem] font-semibold tracking-[.18em] text-muted uppercase">
            <span className="pulse-dot" />
            Identity connected
          </div>
        </div>

        <h1 className="animate-in-d1 mt-12 max-w-xl text-center text-[2.75rem] leading-[1.1] font-extrabold sm:text-[3.5rem]">
          Campus identity,
          <br />
          <span className="text-accent">verified once.</span>
        </h1>

        <p className="animate-in-d2 mt-5 max-w-md text-center text-lg leading-relaxed text-muted">
          Students prove their identity one time, then sign in to any campus
          app with a single click.
        </p>

        <div className="animate-in-d3 mt-10 flex gap-3">
          <Link
            href="/register"
            className="rounded-full bg-accent px-7 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-accent-hover hover:shadow-md"
          >
            Get started
          </Link>
          <Link
            href="/login"
            className="rounded-full border border-ink/15 px-7 py-3 text-sm font-semibold text-ink transition-colors hover:bg-ink/5"
          >
            Sign in
          </Link>
        </div>
      </main>

      {/* How it works */}
      <section className="border-t border-border bg-surface/50 px-6 py-24 sm:px-10">
        <div className="mx-auto max-w-3xl">
          <p className="section-label mb-10 text-center">How it works</p>
          <div className="grid gap-10 sm:grid-cols-3 sm:gap-8">
            {[
              {
                step: "01",
                title: "Create your account",
                desc: "Sign up with your college email, name, and enrollment number.",
              },
              {
                step: "02",
                title: "Verify your identity",
                desc: "Prove you're a student via college email OTP or ID card review.",
              },
              {
                step: "03",
                title: "Sign in everywhere",
                desc: "Any campus app using Quad can trust who you are. One click.",
              },
            ].map((item) => (
              <div key={item.step} className="flex flex-col gap-3">
                <span className="text-2xl font-extrabold text-accent/30">
                  {item.step}
                </span>
                <h3 className="text-lg font-bold">{item.title}</h3>
                <p className="text-[.9375rem] leading-relaxed text-muted">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Quad */}
      <section className="border-t border-border px-6 py-24 sm:px-10">
        <div className="mx-auto max-w-3xl">
          <p className="section-label mb-4 text-center">Why Quad</p>
          <h2 className="mb-14 text-center text-2xl font-bold sm:text-3xl">
            Identity shouldn&apos;t be fragmented.
          </h2>
          <div className="grid gap-5 sm:grid-cols-2">
            {[
              {
                title: "One login, every app",
                desc: "Students shouldn't need a new account for every club app, event page, or campus tool. Verify once, use everywhere.",
              },
              {
                title: "Real identity, not just email",
                desc: "Quad verifies you're actually a student through college email or ID card review. Apps get a trust signal, not just a login.",
              },
              {
                title: "You control what's shared",
                desc: "Every app shows a consent screen. You see exactly what data is requested and can deny access anytime.",
              },
              {
                title: "Open source, self-hostable",
                desc: "Run Quad on your campus infra. No vendor lock-in, no data leaving your network. Docker Compose and you're live.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-border p-6"
              >
                <h3 className="text-[1.0625rem] font-bold">{item.title}</h3>
                <p className="mt-2 text-[.9375rem] leading-relaxed text-muted">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For developers */}
      <section className="border-t border-border bg-surface/50 px-6 py-24 sm:px-10">
        <div className="mx-auto max-w-3xl">
          <div className="flex flex-col items-center text-center">
            <p className="section-label mb-4">For developers</p>
            <h2 className="text-2xl font-bold sm:text-3xl">
              Building a campus app?
            </h2>
            <p className="mt-4 max-w-lg text-lg leading-relaxed text-muted">
              Add &ldquo;Sign in with Quad&rdquo; in minutes. Standard OpenID
              Connect. Works with any language or framework.
            </p>
            <div className="mt-8 flex gap-5">
              <Link
                href="/docs#developers"
                className="font-semibold text-accent transition-colors hover:text-accent-hover"
              >
                Read the docs &rarr;
              </Link>
              <Link
                href="/developers"
                className="font-semibold text-accent transition-colors hover:text-accent-hover"
              >
                Register an app &rarr;
              </Link>
            </div>
          </div>

          <div className="mt-12 overflow-x-auto rounded-2xl border border-border bg-paper p-6 font-mono text-[.8125rem] leading-loose text-muted">
            <p className="font-semibold text-ink">
              # 1. Redirect user to authorize
            </p>
            <p>
              GET /oauth/authorize?response_type=code&amp;client_id=YOUR_ID
            </p>
            <p>
              &nbsp;&nbsp;&amp;redirect_uri=https://app.com/callback&amp;scope=openid+campus
            </p>
            <br />
            <p className="font-semibold text-ink">
              # 2. Exchange code for tokens
            </p>
            <p>POST /oauth/token</p>
            <p>
              &nbsp;&nbsp;grant_type=authorization_code&amp;code=AUTH_CODE&amp;client_id=YOUR_ID
            </p>
            <br />
            <p className="font-semibold text-ink">
              # 3. Verified identity in the response
            </p>
            <p>
              {`{ "sub": "...", "email": "...", "student_verified": true, "institution": "GGSIPU" }`}
            </p>
          </div>
        </div>
      </section>

      <footer className="border-t border-border px-6 py-8 text-center text-xs tracking-wide text-muted">
        Quad · open-source campus identity
      </footer>
    </div>
  );
}

async function Dashboard() {
  const session = (await auth())!;
  const kcUser = await getUserById(session.user.id);
  const status =
    kcUser?.attributes?.verification_status?.[0] ?? "unverified";

  if (status !== "verified" && status !== "pending_review") {
    redirect("/verify");
  }

  const university = kcUser?.attributes?.university?.[0];
  const enrollment = kcUser?.attributes?.enrollment_number?.[0];

  return (
    <div className="min-h-dvh">
      <Nav />
      <main className="mx-auto max-w-2xl px-6 py-14">
        {/* Identity card */}
        <div className="animate-in rounded-2xl border border-border p-8">
          <div className="flex items-start gap-5">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-accent/10 text-xl font-bold text-accent">
              {session.user.name?.[0]?.toUpperCase() ?? "?"}
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl font-bold">{session.user.name}</h1>
              <p className="mt-0.5 text-sm text-muted">
                {session.user.email}
              </p>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
                {university && <span>{university}</span>}
                {enrollment && (
                  <span className="font-mono text-xs">{enrollment}</span>
                )}
              </div>
            </div>
            <span
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                status === "verified"
                  ? "bg-success/10 text-success"
                  : "bg-accent/10 text-accent"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  status === "verified" ? "bg-success" : "bg-accent"
                }`}
              />
              {status === "verified" ? "Verified" : "Pending"}
            </span>
          </div>
        </div>

        {/* Quick actions */}
        <div className="animate-in-d1 mt-6 grid gap-4 sm:grid-cols-2">
          <Link
            href="/developers"
            className="group rounded-2xl border border-border p-6 transition-colors hover:border-accent/30 hover:bg-surface"
          >
            <h3 className="text-[1.0625rem] font-bold group-hover:text-accent">
              Developer portal
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">
              Register apps and get OAuth credentials
            </p>
          </Link>
          <Link
            href="/docs"
            className="group rounded-2xl border border-border p-6 transition-colors hover:border-accent/30 hover:bg-surface"
          >
            <h3 className="text-[1.0625rem] font-bold group-hover:text-accent">
              Documentation
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">
              Integration guide and API reference
            </p>
          </Link>
        </div>

        {/* What is Quad */}
        <div className="animate-in-d2 mt-12">
          <p className="section-label">Your verified identity</p>
          <p className="mt-3 text-[.9375rem] leading-relaxed text-muted">
            Your Quad account is your campus identity. When an app shows
            &ldquo;Sign in with Quad&rdquo;, you&apos;ll see what it&apos;s
            requesting and can approve or deny. Your enrollment number is
            only shared if you allow it.
          </p>
        </div>

        {/* For developers CTA */}
        <div className="animate-in-d3 mt-8 rounded-2xl bg-surface p-6">
          <h3 className="font-bold">Building something?</h3>
          <p className="mt-1.5 text-sm leading-relaxed text-muted">
            Add &ldquo;Sign in with Quad&rdquo; to your app with standard
            OIDC. Register on the{" "}
            <Link
              href="/developers"
              className="font-medium text-accent hover:text-accent-hover"
            >
              developer portal
            </Link>{" "}
            to get started, or read the{" "}
            <Link
              href="/docs#developers"
              className="font-medium text-accent hover:text-accent-hover"
            >
              developer docs
            </Link>
            .
          </p>
        </div>
      </main>
    </div>
  );
}

export default async function Home() {
  const session = await auth();
  if (!session?.user) return <Landing />;
  return <Dashboard />;
}
