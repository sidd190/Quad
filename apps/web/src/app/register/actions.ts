"use server";

import { createUser } from "@/lib/keycloak-admin";
import { redirect } from "next/navigation";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export type RegisterState = {
  error?: string;
  success?: boolean;
};

export async function register(
  _prev: RegisterState,
  formData: FormData
): Promise<RegisterState> {
  const ip = await getClientIp();
  if (!rateLimit(`register:${ip}`, 5, 60 * 60 * 1000)) {
    return { error: "Too many registration attempts. Try again later." };
  }

  const email = formData.get("email") as string;
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const password = formData.get("password") as string;
  const university = formData.get("university") as string;
  const enrollmentNumber = formData.get("enrollmentNumber") as string;

  if (!email || !firstName || !lastName || !password || !university || !enrollmentNumber) {
    return { error: "All fields are required." };
  }

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  const result = await createUser({
    email,
    firstName,
    lastName,
    password,
    university,
    enrollmentNumber,
  });

  if (!result.success) {
    return { error: result.error };
  }

  redirect("/?registered=true");
}
