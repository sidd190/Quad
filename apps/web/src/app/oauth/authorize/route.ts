import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { getClient, createAuthCode, hasConsent, saveConsent } from "@/lib/oauth";

async function handleAuthorize(
  params: {
    clientId: string;
    redirectUri: string;
    responseType: string;
    scope: string;
    state: string | null;
    codeChallenge: string | null;
    codeChallengeMethod: string;
  },
  skipConsent: boolean
) {
  const { clientId, redirectUri, responseType, scope, state, codeChallenge, codeChallengeMethod } = params;

  if (responseType !== "code") {
    return Response.json({ error: "unsupported_response_type" }, { status: 400 });
  }

  if (!clientId || !redirectUri) {
    return Response.json(
      { error: "invalid_request", error_description: "client_id and redirect_uri are required" },
      { status: 400 }
    );
  }

  const client = await getClient(clientId);
  if (!client) {
    return Response.json({ error: "invalid_client", error_description: "Unknown client_id" }, { status: 400 });
  }

  if (!client.redirectUris.includes(redirectUri)) {
    return Response.json(
      { error: "invalid_request", error_description: "redirect_uri not registered" },
      { status: 400 }
    );
  }

  const session = await auth();
  if (!session?.user?.id) {
    const loginUrl = new URL("/login", process.env.QUAD_ISSUER ?? "http://localhost:3000");
    const authorizeUrl = new URL("/oauth/authorize", loginUrl.origin);
    authorizeUrl.searchParams.set("client_id", clientId);
    authorizeUrl.searchParams.set("redirect_uri", redirectUri);
    authorizeUrl.searchParams.set("response_type", responseType);
    authorizeUrl.searchParams.set("scope", scope);
    if (state) authorizeUrl.searchParams.set("state", state);
    if (codeChallenge) {
      authorizeUrl.searchParams.set("code_challenge", codeChallenge);
      authorizeUrl.searchParams.set("code_challenge_method", codeChallengeMethod);
    }
    loginUrl.searchParams.set("callbackUrl", authorizeUrl.toString());
    return Response.redirect(loginUrl.toString());
  }

  const scopes = scope.split(" ");
  const alreadyConsented = await hasConsent(session.user.id, clientId, scopes);

  if (!alreadyConsented && !skipConsent) {
    const consentUrl = new URL("/oauth/consent", process.env.QUAD_ISSUER ?? "http://localhost:3000");
    consentUrl.searchParams.set("client_id", clientId);
    consentUrl.searchParams.set("redirect_uri", redirectUri);
    consentUrl.searchParams.set("response_type", responseType);
    consentUrl.searchParams.set("scope", scope);
    if (state) consentUrl.searchParams.set("state", state);
    if (codeChallenge) {
      consentUrl.searchParams.set("code_challenge", codeChallenge);
      consentUrl.searchParams.set("code_challenge_method", codeChallengeMethod);
    }
    return Response.redirect(consentUrl.toString());
  }

  if (skipConsent && !alreadyConsented) {
    await saveConsent(session.user.id, clientId, scopes);
  }

  const code = createAuthCode({
    clientId,
    redirectUri,
    userId: session.user.id,
    userEmail: session.user.email ?? "",
    userName: session.user.name ?? "",
    scope,
    codeChallenge: codeChallenge ?? undefined,
    codeChallengeMethod: codeChallenge ? codeChallengeMethod : undefined,
  });

  const callback = new URL(redirectUri);
  callback.searchParams.set("code", code);
  if (state) callback.searchParams.set("state", state);

  return Response.redirect(callback.toString());
}

export async function GET(req: NextRequest) {
  const url = req.nextUrl;
  return handleAuthorize(
    {
      clientId: url.searchParams.get("client_id") ?? "",
      redirectUri: url.searchParams.get("redirect_uri") ?? "",
      responseType: url.searchParams.get("response_type") ?? "",
      scope: url.searchParams.get("scope") ?? "openid",
      state: url.searchParams.get("state"),
      codeChallenge: url.searchParams.get("code_challenge"),
      codeChallengeMethod: url.searchParams.get("code_challenge_method") ?? "plain",
    },
    false
  );
}

export async function POST(req: NextRequest) {
  const body = await req.formData();
  const decision = body.get("consent_decision") as string;
  const redirectUri = body.get("redirect_uri") as string;
  const state = body.get("state") as string | null;

  if (decision === "deny") {
    const callback = new URL(redirectUri);
    callback.searchParams.set("error", "access_denied");
    if (state) callback.searchParams.set("state", state);
    return Response.redirect(callback.toString());
  }

  return handleAuthorize(
    {
      clientId: body.get("client_id") as string,
      redirectUri,
      responseType: body.get("response_type") as string,
      scope: (body.get("scope") as string) ?? "openid",
      state,
      codeChallenge: body.get("code_challenge") as string | null,
      codeChallengeMethod: (body.get("code_challenge_method") as string) ?? "plain",
    },
    true
  );
}
