import { updateUserAttributes } from "./keycloak-admin";
import { sendOtpEmail } from "./email";

function generateOtp(): string {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return String(array[0] % 1000000).padStart(6, "0");
}

const g = globalThis as Record<string, unknown>;
if (!g.__quad_otps) g.__quad_otps = new Map<string, { code: string; expires: number }>();
const otpStore = g.__quad_otps as Map<string, { code: string; expires: number }>;

export async function sendOtp(userId: string, email: string): Promise<boolean> {
  const otp = generateOtp();
  otpStore.set(userId, { code: otp, expires: Date.now() + 10 * 60 * 1000 });
  await sendOtpEmail(email, otp);
  return true;
}

export async function verifyOtp(
  userId: string,
  code: string
): Promise<{ valid: boolean; error?: string }> {
  const entry = otpStore.get(userId);

  if (!entry) {
    return { valid: false, error: "No OTP requested. Send a new code." };
  }

  if (Date.now() > entry.expires) {
    otpStore.delete(userId);
    return { valid: false, error: "Code expired. Send a new one." };
  }

  if (entry.code !== code) {
    return { valid: false, error: "Incorrect code." };
  }

  otpStore.delete(userId);

  await updateUserAttributes(userId, {
    verification_status: ["verified"],
    verification_method: ["college_email"],
  });

  return { valid: true };
}
