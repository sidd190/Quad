import { NextRequest } from "next/server";
import {
  consumeAuthCode,
  getClient,
  verifyPkce,
  signTokens,
} from "@/lib/oauth";
import { getUserById } from "@/lib/keycloak-admin";
import { rateLimit, getClientIpFromRequest } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const ip = getClientIpFromRequest(req);
  if (!rateLimit(`token:${ip}`, 30, 60 * 1000)) {
    return Response.json(
      { error: "rate_limit_exceeded" },
      { status: 429, headers: { "Retry-After": "60" } }
    );
  }

  const body = await req.formData();
  const grantType = body.get("grant_type") as string;
  const code = body.get("code") as string;
  const redirectUri = body.get("redirect_uri") as string;
  const clientId = body.get("client_id") as string;
  const clientSecret = body.get("client_secret") as string | null;
  const codeVerifier = body.get("code_verifier") as string | null;

  if (grantType !== "authorization_code") {
    return Response.json(
      { error: "unsupported_grant_type" },
      { status: 400 }
    );
  }

  const authCode = consumeAuthCode(code);
  if (!authCode) {
    return Response.json(
      { error: "invalid_grant", error_description: "Invalid or expired code" },
      { status: 400 }
    );
  }

  if (authCode.clientId !== clientId || authCode.redirectUri !== redirectUri) {
    return Response.json(
      { error: "invalid_grant", error_description: "client_id or redirect_uri mismatch" },
      { status: 400 }
    );
  }

  const client = await getClient(clientId);
  if (!client) {
    return Response.json({ error: "invalid_client" }, { status: 400 });
  }

  if (client.clientSecret && client.clientSecret !== clientSecret) {
    return Response.json({ error: "invalid_client" }, { status: 401 });
  }

  if (authCode.codeChallenge && codeVerifier) {
    const valid = await verifyPkce(
      codeVerifier,
      authCode.codeChallenge,
      authCode.codeChallengeMethod ?? "plain"
    );
    if (!valid) {
      return Response.json(
        { error: "invalid_grant", error_description: "PKCE verification failed" },
        { status: 400 }
      );
    }
  }

  const kcUser = await getUserById(authCode.userId);
  const verificationStatus =
    kcUser?.attributes?.verification_status?.[0] ?? "unverified";
  const university = kcUser?.attributes?.university?.[0] ?? "";
  const enrollmentNumber = kcUser?.attributes?.enrollment_number?.[0];

  const scopeSet = new Set(authCode.scope.split(" "));
  const claims: Record<string, unknown> = {};

  if (scopeSet.has("campus") || scopeSet.has("profile")) {
    claims.institution = university;
    claims.student_verified = verificationStatus === "verified";
  }

  if (scopeSet.has("enrollment") && enrollmentNumber) {
    claims.enrollment_number = enrollmentNumber;
  }

  const tokens = await signTokens({
    sub: authCode.userId,
    email: authCode.userEmail,
    name: authCode.userName,
    clientId,
    scope: authCode.scope,
    claims,
  });

  return Response.json(tokens, {
    headers: { "Cache-Control": "no-store" },
  });
}
