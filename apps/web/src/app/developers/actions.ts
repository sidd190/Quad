"use server";

import { auth } from "@/auth";
import { registerClient, listClientsByUser, type OAuthClient } from "@/lib/oauth";

export type RegisterAppState = {
  error?: string;
  client?: OAuthClient;
};

export async function registerApp(
  _prev: RegisterAppState,
  formData: FormData
): Promise<RegisterAppState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not signed in." };

  const name = formData.get("name") as string;
  const redirectUri = formData.get("redirectUri") as string;

  if (!name || !redirectUri) {
    return { error: "App name and redirect URI are required." };
  }

  try {
    new URL(redirectUri);
  } catch {
    return { error: "Invalid redirect URI." };
  }

  const client = await registerClient({
    name,
    redirectUris: [redirectUri],
    createdBy: session.user.id,
  });

  return { client };
}

export async function getMyApps(): Promise<OAuthClient[]> {
  const session = await auth();
  if (!session?.user?.id) return [];
  return await listClientsByUser(session.user.id);
}
