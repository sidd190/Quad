"use client";

import { useActionState, useEffect, useState } from "react";
import { registerApp, getMyApps, type RegisterAppState } from "./actions";
import type { OAuthClient } from "@/lib/oauth";
const initialState: RegisterAppState = {};

export default function DevelopersPage() {
  const [state, formAction, pending] = useActionState(
    registerApp,
    initialState
  );
  const [apps, setApps] = useState<OAuthClient[]>([]);
  const [issuer, setIssuer] = useState("");

  useEffect(() => {
    setIssuer(window.location.origin);
  }, []);

  useEffect(() => {
    getMyApps().then(setApps);
  }, [state.client]);

  return (
    <div>
      <main className="mx-auto max-w-2xl px-6 py-14">
        <div className="animate-in">
          <h1 className="text-2xl font-extrabold">Developer portal</h1>
          <p className="mt-1 text-sm text-muted">
            Register apps to integrate &ldquo;Sign in with Quad&rdquo;
          </p>
        </div>

        {state.client && (
          <div className="animate-in mt-8 rounded-xl border border-success/30 bg-success/5 p-6">
            <h2 className="font-bold text-success">App registered</h2>
            <p className="mt-1 text-xs text-muted">
              Save these credentials. The secret won&apos;t be shown again.
            </p>
            <div className="mt-4 flex flex-col gap-2 font-mono text-sm">
              <div>
                <span className="text-xs font-medium text-muted">Client ID</span>
                <p className="mt-0.5 select-all">{state.client.clientId}</p>
              </div>
              <div>
                <span className="text-xs font-medium text-muted">Secret</span>
                <p className="mt-0.5 select-all">{state.client.clientSecret}</p>
              </div>
            </div>
          </div>
        )}

        <div className="animate-in-d1 mt-8 rounded-xl border border-border p-6">
          <h2 className="font-bold">Register a new app</h2>

          {state.error && (
            <div className="mt-4 rounded-lg bg-danger/8 px-4 py-3 text-sm text-danger">
              {state.error}
            </div>
          )}

          <form action={formAction} className="mt-5 flex flex-col gap-4">
            <div className="field">
              <label htmlFor="dev-name" className="field-label">
                App name
              </label>
              <input
                id="dev-name"
                name="name"
                placeholder="e.g. CampusForms"
                required
              />
            </div>
            <div className="field">
              <label htmlFor="dev-redirect" className="field-label">
                Redirect URI
              </label>
              <input
                id="dev-redirect"
                name="redirectUri"
                placeholder="https://myapp.com/callback"
                required
              />
            </div>
            <button type="submit" disabled={pending} className="btn-primary mt-1">
              {pending ? "Registering…" : "Register app"}
            </button>
          </form>
        </div>

        {apps.length > 0 && (
          <div className="animate-in-d2 mt-6 rounded-xl border border-border p-6">
            <h2 className="font-bold">Your apps</h2>
            <div className="mt-4 flex flex-col gap-2">
              {apps.map((app) => (
                <div
                  key={app.clientId}
                  className="flex items-center justify-between rounded-lg border border-border px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-semibold">{app.name}</p>
                    <p className="mt-0.5 font-mono text-xs text-muted">
                      {app.clientId}
                    </p>
                  </div>
                  <p className="text-xs text-muted">{app.redirectUris[0]}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="animate-in-d3 mt-6 rounded-xl border border-border p-6">
          <h2 className="font-bold">Quick reference</h2>
          <div className="mt-4 overflow-x-auto rounded-lg border border-border bg-surface p-5 font-mono text-xs leading-loose text-muted">
            <p className="font-semibold text-ink">
              # Discovery
            </p>
            <p>{issuer}/.well-known/openid-configuration</p>
            <br />
            <p className="font-semibold text-ink"># Authorize</p>
            <p>
              GET {issuer}/oauth/authorize
            </p>
            <p>
              &nbsp; ?response_type=code&amp;client_id=...&amp;redirect_uri=...
            </p>
            <p>&nbsp; &amp;scope=openid+profile+campus&amp;state=RANDOM</p>
            <br />
            <p className="font-semibold text-ink"># Token exchange</p>
            <p>POST {issuer}/oauth/token</p>
            <p>
              &nbsp; grant_type=authorization_code&amp;code=...&amp;client_id=...
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
