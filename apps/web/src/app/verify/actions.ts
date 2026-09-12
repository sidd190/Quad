"use server";

import { auth } from "@/auth";
import { sendOtp, verifyOtp } from "@/lib/otp";
import { updateUserAttributes } from "@/lib/keycloak-admin";
import { redirect } from "next/navigation";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export type VerifyState = {
  error?: string;
  otpSent?: boolean;
};

export async function requestOtp(): Promise<VerifyState> {
  const session = await auth();
  if (!session?.user?.id || !session?.user?.email) {
    return { error: "Not signed in." };
  }

  const ip = await getClientIp();
  if (!rateLimit(`otp-send:${session.user.id}:${ip}`, 5, 60 * 60 * 1000)) {
    return { error: "Too many OTP requests. Try again later." };
  }

  const sent = await sendOtp(session.user.id, session.user.email);
  if (!sent) return { error: "Failed to send OTP. Try again." };

  return { otpSent: true };
}

export async function submitOtp(
  _prev: VerifyState,
  formData: FormData
): Promise<VerifyState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not signed in." };

  if (!rateLimit(`otp-verify:${session.user.id}`, 10, 15 * 60 * 1000)) {
    return { error: "Too many attempts. Try again in 15 minutes.", otpSent: true };
  }

  const code = formData.get("code") as string;
  if (!code || code.length !== 6) {
    return { error: "Enter the 6-digit code.", otpSent: true };
  }

  const result = await verifyOtp(session.user.id, code);
  if (!result.valid) {
    return { error: result.error, otpSent: true };
  }

  redirect("/verify/success");
}

export async function uploadIdCard(
  _prev: VerifyState,
  formData: FormData
): Promise<VerifyState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not signed in." };

  const file = formData.get("idCard") as File;
  if (!file || file.size === 0) {
    return { error: "Please select your ID card image." };
  }

  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    return { error: "File too large. Maximum 5MB." };
  }

  const allowed = ["image/jpeg", "image/png", "image/webp"];
  if (!allowed.includes(file.type)) {
    return { error: "Only JPEG, PNG, or WebP images are accepted." };
  }

  const uploadDir = join(process.cwd(), "uploads", "id-cards");
  await mkdir(uploadDir, { recursive: true });

  const ext = file.name.split(".").pop();
  const filename = `${session.user.id}.${ext}`;
  const bytes = new Uint8Array(await file.arrayBuffer());
  await writeFile(join(uploadDir, filename), bytes);

  await updateUserAttributes(session.user.id, {
    verification_status: ["pending_review"],
    verification_method: ["manual_id"],
    id_card_filename: [filename],
  });

  redirect("/verify/pending");
}
