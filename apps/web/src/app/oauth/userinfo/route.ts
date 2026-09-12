import { NextRequest } from "next/server";
import { verifyAccessToken } from "@/lib/oauth";
import { getUserById } from "@/lib/keycloak-admin";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return Response.json({ error: "invalid_token" }, { status: 401 });
  }

  const token = authHeader.slice(7);
  const payload = await verifyAccessToken(token);
  if (!payload?.sub) {
    return Response.json({ error: "invalid_token" }, { status: 401 });
  }

  const kcUser = await getUserById(payload.sub as string);
  if (!kcUser) {
    return Response.json({ error: "invalid_token" }, { status: 401 });
  }

  const scopeSet = new Set(((payload.scope as string) ?? "").split(" "));

  const info: Record<string, unknown> = {
    sub: payload.sub,
  };

  if (scopeSet.has("profile") || scopeSet.has("openid")) {
    info.name = `${kcUser.firstName} ${kcUser.lastName}`;
    info.email = kcUser.email;
  }

  if (scopeSet.has("campus") || scopeSet.has("profile")) {
    info.institution = kcUser.attributes?.university?.[0] ?? "";
    info.student_verified =
      kcUser.attributes?.verification_status?.[0] === "verified";
  }

  if (scopeSet.has("enrollment")) {
    info.enrollment_number =
      kcUser.attributes?.enrollment_number?.[0] ?? "";
  }

  return Response.json(info);
}
