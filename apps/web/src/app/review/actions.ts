"use server";

import { updateUserAttributes, listUsersByAttribute } from "@/lib/keycloak-admin";
import { revalidatePath } from "next/cache";

export interface PendingUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  university: string;
  enrollmentNumber: string;
  idCardFilename: string;
}

export async function getPendingReviews(): Promise<PendingUser[]> {
  const users = await listUsersByAttribute(
    "verification_status",
    "pending_review"
  );

  return users.map((u) => ({
    id: u.id,
    email: u.email,
    firstName: u.firstName,
    lastName: u.lastName,
    university: u.attributes?.university?.[0] ?? "",
    enrollmentNumber: u.attributes?.enrollment_number?.[0] ?? "",
    idCardFilename: u.attributes?.id_card_filename?.[0] ?? "",
  }));
}

export async function approveUser(formData: FormData): Promise<void> {
  const userId = formData.get("userId") as string;
  await updateUserAttributes(userId, {
    verification_status: ["verified"],
  });
  revalidatePath("/review");
}

export async function rejectUser(formData: FormData): Promise<void> {
  const userId = formData.get("userId") as string;
  const reason = formData.get("reason") as string;
  await updateUserAttributes(userId, {
    verification_status: ["rejected"],
    rejection_reason: [reason || "ID card could not be verified."],
  });
  revalidatePath("/review");
}
