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

  if (!res.ok) throw new Error("Failed to get admin token");
  const data = await res.json();
  return data.access_token;
}

export interface KeycloakUser {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  enabled: boolean;
  emailVerified: boolean;
  attributes: Record<string, string[]>;
}

export async function createUser(opts: {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  university: string;
  enrollmentNumber: string;
}): Promise<{ success: true } | { success: false; error: string }> {
  const token = await getAdminToken();

  const res = await fetch(`${ADMIN_URL}/admin/realms/${REALM}/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
    body: JSON.stringify({
      username: opts.email,
      email: opts.email,
      firstName: opts.firstName,
      lastName: opts.lastName,
      enabled: true,
      emailVerified: false,
      attributes: {
        university: [opts.university],
        enrollment_number: [opts.enrollmentNumber],
        verification_status: ["unverified"],
      },
      credentials: [
        {
          type: "password",
          value: opts.password,
          temporary: false,
        },
      ],
    }),
  });

  if (res.status === 409) {
    return { success: false, error: "A user with this email already exists." };
  }

  if (!res.ok) {
    const body = await res.text();
    return { success: false, error: body || "Failed to create user." };
  }

  return { success: true };
}

export async function getUserById(
  userId: string
): Promise<KeycloakUser | null> {
  const token = await getAdminToken();

  const res = await fetch(
    `${ADMIN_URL}/admin/realms/${REALM}/users/${userId}`,
    {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    }
  );

  if (!res.ok) return null;
  return res.json();
}

export async function updateUserAttributes(
  userId: string,
  attributes: Record<string, string[]>
): Promise<boolean> {
  const token = await getAdminToken();
  const user = await getUserById(userId);
  if (!user) return false;

  const merged = { ...user.attributes, ...attributes };

  const res = await fetch(
    `${ADMIN_URL}/admin/realms/${REALM}/users/${userId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
      body: JSON.stringify({
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        enabled: user.enabled,
        emailVerified: user.emailVerified,
        attributes: merged,
      }),
    }
  );

  if (!res.ok) {
    console.error(
      "Failed to update user attributes:",
      res.status,
      await res.text()
    );
  }

  return res.ok;
}

export async function listUsersByAttribute(
  attr: string,
  value: string
): Promise<KeycloakUser[]> {
  const token = await getAdminToken();

  const res = await fetch(
    `${ADMIN_URL}/admin/realms/${REALM}/users?q=${attr}:${value}&max=100`,
    {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    }
  );

  if (!res.ok) return [];
  return res.json();
}

export async function setupRealmProtocolMappers(): Promise<void> {
  const token = await getAdminToken();

  const mappers = [
    {
      name: "student_verified",
      protocol: "openid-connect",
      protocolMapper: "oidc-usermodel-attribute-mapper",
      config: {
        "user.attribute": "verification_status",
        "claim.name": "student_verified",
        "jsonType.label": "String",
        "id.token.claim": "true",
        "access.token.claim": "true",
        "userinfo.token.claim": "true",
      },
    },
    {
      name: "university",
      protocol: "openid-connect",
      protocolMapper: "oidc-usermodel-attribute-mapper",
      config: {
        "user.attribute": "university",
        "claim.name": "institution",
        "jsonType.label": "String",
        "id.token.claim": "true",
        "access.token.claim": "true",
        "userinfo.token.claim": "true",
      },
    },
    {
      name: "enrollment_number",
      protocol: "openid-connect",
      protocolMapper: "oidc-usermodel-attribute-mapper",
      config: {
        "user.attribute": "enrollment_number",
        "claim.name": "enrollment_number",
        "jsonType.label": "String",
        "id.token.claim": "false",
        "access.token.claim": "false",
        "userinfo.token.claim": "true",
      },
    },
  ];

  const scopesRes = await fetch(
    `${ADMIN_URL}/admin/realms/${REALM}/client-scopes`,
    {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    }
  );
  const scopes: { id: string; name: string }[] = await scopesRes.json();
  const profileScope = scopes.find((s) => s.name === "profile");
  if (!profileScope) return;

  for (const mapper of mappers) {
    await fetch(
      `${ADMIN_URL}/admin/realms/${REALM}/client-scopes/${profileScope.id}/protocol-mappers/models`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
        body: JSON.stringify(mapper),
      }
    );
  }
}
