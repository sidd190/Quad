import { setupRealmProtocolMappers } from "@/lib/keycloak-admin";

const ADMIN_URL = process.env.KEYCLOAK_ADMIN_URL!;
const REALM = process.env.KEYCLOAK_REALM!;

async function getAdminToken(): Promise<string> {
  const res = await fetch(
    `${ADMIN_URL}/realms/master/protocol/openid-connect/token`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: "admin-cli",
        grant_type: "password",
        username: process.env.KEYCLOAK_ADMIN_USERNAME!,
        password: process.env.KEYCLOAK_ADMIN_PASSWORD!,
      }),
      cache: "no-store",
    }
  );
  const data = await res.json();
  return data.access_token;
}

async function setupUserProfile(): Promise<void> {
  const token = await getAdminToken();

  const res = await fetch(
    `${ADMIN_URL}/admin/realms/${REALM}/users/profile`,
    {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    }
  );
  const profile = await res.json();

  const customAttrs = [
    {
      name: "university",
      displayName: "University",
      permissions: { view: ["admin", "user"], edit: ["admin"] },
      validations: {},
    },
    {
      name: "enrollment_number",
      displayName: "Enrollment Number",
      permissions: { view: ["admin", "user"], edit: ["admin"] },
      validations: {},
    },
    {
      name: "verification_status",
      displayName: "Verification Status",
      permissions: { view: ["admin", "user"], edit: ["admin"] },
      validations: {},
    },
    {
      name: "verification_method",
      displayName: "Verification Method",
      permissions: { view: ["admin"], edit: ["admin"] },
      validations: {},
    },
    {
      name: "id_card_filename",
      displayName: "ID Card Filename",
      permissions: { view: ["admin"], edit: ["admin"] },
      validations: {},
    },
    {
      name: "rejection_reason",
      displayName: "Rejection Reason",
      permissions: { view: ["admin", "user"], edit: ["admin"] },
      validations: {},
    },
    {
      name: "role",
      displayName: "Role",
      permissions: { view: ["admin", "user"], edit: ["admin"] },
      validations: {},
    },
  ];

  const existingNames = new Set(
    (profile.attributes ?? []).map((a: { name: string }) => a.name)
  );

  for (const attr of customAttrs) {
    if (!existingNames.has(attr.name)) {
      profile.attributes.push(attr);
    }
  }

  const putRes = await fetch(
    `${ADMIN_URL}/admin/realms/${REALM}/users/profile`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
      body: JSON.stringify(profile),
    }
  );

  if (!putRes.ok) {
    const body = await putRes.text();
    throw new Error(`Failed to update user profile: ${putRes.status} ${body}`);
  }
}

export async function POST() {
  try {
    await setupUserProfile();
    await setupRealmProtocolMappers();
    return Response.json({
      ok: true,
      message: "User profile attributes and protocol mappers configured.",
    });
  } catch (e) {
    return Response.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
