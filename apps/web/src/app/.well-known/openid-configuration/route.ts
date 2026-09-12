import { getIssuer } from "@/lib/oauth";

export async function GET() {
  const issuer = getIssuer();

  return Response.json({
    issuer,
    authorization_endpoint: `${issuer}/oauth/authorize`,
    token_endpoint: `${issuer}/oauth/token`,
    userinfo_endpoint: `${issuer}/oauth/userinfo`,
    jwks_uri: `${issuer}/oauth/jwks`,
    response_types_supported: ["code"],
    subject_types_supported: ["public"],
    id_token_signing_alg_values_supported: ["RS256"],
    scopes_supported: ["openid", "profile", "campus", "enrollment"],
    token_endpoint_auth_methods_supported: ["client_secret_post"],
    claims_supported: [
      "sub",
      "email",
      "name",
      "institution",
      "student_verified",
      "enrollment_number",
    ],
    code_challenge_methods_supported: ["S256", "plain"],
    grant_types_supported: ["authorization_code"],
  });
}
