import { auth } from "@/auth";
import Link from "next/link";
import { QuadMark } from "@/components/logo";
import { Nav } from "@/components/nav";

function Code({ children }: { children: React.ReactNode }) {
  return (
    <code className="rounded-md bg-surface px-1.5 py-0.5 font-mono text-[.8125rem]">
      {children}
    </code>
  );
}

function Block({ children }: { children: string }) {
  return (
    <pre className="overflow-x-auto rounded-2xl border border-border bg-surface p-5 font-mono text-[.8125rem] leading-loose text-muted">
      {children}
    </pre>
  );
}

export default async function DocsPage() {
  const session = await auth();

  return (
    <div className="min-h-dvh">
      {session?.user ? (
        <Nav />
      ) : (
        <nav className="flex items-center justify-between border-b border-border px-6 py-5 sm:px-10">
          <Link href="/" className="flex items-center gap-2.5 text-ink">
            <QuadMark size={26} />
            <span className="text-sm font-bold tracking-tight">Quad</span>
          </Link>
          <div className="flex items-center gap-6 text-[.8125rem]">
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
      )}

      <main className="mx-auto max-w-2xl px-6 py-14">
        <h1 className="animate-in text-3xl font-extrabold sm:text-4xl">
          Documentation
        </h1>
        <p className="animate-in-d1 mt-3 text-lg text-muted">
          Quick guides for students and developers.
        </p>

        {/* Navigation pills */}
        <div className="animate-in-d2 mt-8 flex gap-3">
          <a
            href="#students"
            className="rounded-full border border-ink/15 px-5 py-2 text-sm font-medium transition-colors hover:bg-ink/5"
          >
            For students
          </a>
          <a
            href="#developers"
            className="rounded-full border border-ink/15 px-5 py-2 text-sm font-medium transition-colors hover:bg-ink/5"
          >
            For developers
          </a>
        </div>

        {/* For Students */}
        <section id="students" className="animate-in-d2 mt-16 scroll-mt-8">
          <p className="section-label">For students</p>
          <h2 className="mt-2 text-2xl font-bold">
            Three steps, you&apos;re in.
          </h2>
          <div className="mt-8 flex flex-col gap-6 text-[.9375rem] leading-relaxed text-muted [&_strong]:font-semibold [&_strong]:text-ink">
            <p>
              <strong>1. Create an account</strong> with your college email,
              name, university, and enrollment number.
            </p>
            <p>
              <strong>2. Verify your identity</strong> by college email
              OTP (instant) or upload your ID card for manual review.
            </p>
            <p>
              <strong>3. Sign in everywhere.</strong> When a campus app shows
              &ldquo;Sign in with Quad&rdquo;, click it. You&apos;ll see a
              consent screen showing what the app wants to access, then
              you&apos;re in.
            </p>
            <div className="rounded-2xl border border-border p-5 text-sm">
              <p className="font-bold text-ink">Privacy note</p>
              <p className="mt-1.5 leading-relaxed">
                You control what each app can see. Your enrollment number is
                never shared unless you explicitly allow it. You can deny any
                app access at any time.
              </p>
            </div>
          </div>
        </section>

        {/* For Developers */}
        <section id="developers" className="mt-20 scroll-mt-8">
          <p className="section-label">For developers</p>
          <h2 className="mt-2 text-2xl font-bold">
            Integrate in minutes.
          </h2>

          {/* Quickstart */}
          <div className="mt-8 flex flex-col gap-5 text-[.9375rem] leading-relaxed text-muted [&_strong]:font-semibold [&_strong]:text-ink">
            <p>
              <strong>1. Register your app</strong> on the{" "}
              <Link
                href="/developers"
                className="font-medium text-accent hover:text-accent-hover"
              >
                developer portal
              </Link>
              . You&apos;ll get a <Code>client_id</Code> and{" "}
              <Code>client_secret</Code>.
            </p>
            <p>
              <strong>2. Redirect users to authorize:</strong>
            </p>
            <Block>{`GET /oauth/authorize
  ?response_type=code
  &client_id=YOUR_CLIENT_ID
  &redirect_uri=https://yourapp.com/callback
  &scope=openid profile campus
  &state=RANDOM_STRING`}</Block>
            <p>
              <strong>3. Exchange the code for tokens:</strong>
            </p>
            <Block>{`POST /oauth/token
Content-Type: application/x-www-form-urlencoded

grant_type=authorization_code
&code=AUTH_CODE
&client_id=YOUR_CLIENT_ID
&client_secret=YOUR_CLIENT_SECRET
&redirect_uri=https://yourapp.com/callback`}</Block>
            <p>
              <strong>4. Read user info</strong> from the{" "}
              <Code>id_token</Code> JWT or call the userinfo endpoint:
            </p>
            <Block>{`GET /oauth/userinfo
Authorization: Bearer ACCESS_TOKEN`}</Block>
          </div>

          {/* Endpoints */}
          <h3 className="mt-14 text-lg font-bold">API endpoints</h3>
          <div className="mt-4 overflow-x-auto rounded-2xl border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface/50 text-left text-xs font-semibold text-muted">
                  <th className="px-5 py-3">Endpoint</th>
                  <th className="px-5 py-3">Method</th>
                  <th className="px-5 py-3">Description</th>
                </tr>
              </thead>
              <tbody className="[&_td]:px-5 [&_td]:py-3">
                <tr className="border-b border-border/50">
                  <td><Code>/.well-known/openid-configuration</Code></td>
                  <td>GET</td>
                  <td className="text-muted">Discovery document</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td><Code>/oauth/authorize</Code></td>
                  <td>GET</td>
                  <td className="text-muted">Start auth flow</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td><Code>/oauth/token</Code></td>
                  <td>POST</td>
                  <td className="text-muted">Exchange code for tokens</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td><Code>/oauth/userinfo</Code></td>
                  <td>GET</td>
                  <td className="text-muted">User claims (Bearer token)</td>
                </tr>
                <tr>
                  <td><Code>/oauth/jwks</Code></td>
                  <td>GET</td>
                  <td className="text-muted">JWK Set for verification</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Scopes */}
          <h3 className="mt-14 text-lg font-bold">Scopes &amp; claims</h3>
          <div className="mt-4 overflow-x-auto rounded-2xl border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface/50 text-left text-xs font-semibold text-muted">
                  <th className="px-5 py-3">Scope</th>
                  <th className="px-5 py-3">Claims</th>
                  <th className="px-5 py-3">Notes</th>
                </tr>
              </thead>
              <tbody className="[&_td]:px-5 [&_td]:py-3">
                <tr className="border-b border-border/50">
                  <td><Code>openid</Code></td>
                  <td><Code>sub</Code>, <Code>email</Code>, <Code>name</Code></td>
                  <td className="text-muted">Required</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td><Code>profile</Code></td>
                  <td><Code>institution</Code>, <Code>student_verified</Code></td>
                  <td className="text-muted">University + status</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td><Code>campus</Code></td>
                  <td><Code>institution</Code>, <Code>student_verified</Code></td>
                  <td className="text-muted">Alias for profile</td>
                </tr>
                <tr>
                  <td><Code>enrollment</Code></td>
                  <td><Code>enrollment_number</Code></td>
                  <td className="text-muted">Student ID (privileged)</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* PKCE note */}
          <div className="mt-10 rounded-2xl border border-border p-5 text-sm text-muted">
            <p className="font-bold text-ink">PKCE for public clients</p>
            <p className="mt-1.5 leading-relaxed">
              SPAs and mobile apps that can&apos;t store a secret should use
              PKCE. Add <Code>code_challenge</Code> (S256) to the authorize
              request, and <Code>code_verifier</Code> to the token request.
              Both <Code>S256</Code> and <Code>plain</Code> methods are
              supported.
            </p>
          </div>
        </section>

        <footer className="mt-20 border-t border-border pt-8 text-sm text-muted">
          Quad is open-source.{" "}
          <Link href="/" className="font-medium text-accent hover:text-accent-hover">
            Back to home &rarr;
          </Link>
        </footer>
      </main>
    </div>
  );
}
