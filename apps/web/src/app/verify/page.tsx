"use client";

import { useState, useActionState } from "react";
import {
  requestOtp,
  submitOtp,
  uploadIdCard,
  type VerifyState,
} from "./actions";
import { QuadMark } from "@/components/logo";

const initialState: VerifyState = {};

export default function VerifyPage() {
  const [mode, setMode] = useState<"otp" | "upload">("otp");
  const [otpSent, setOtpSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [otpState, otpAction, otpPending] = useActionState(
    submitOtp,
    initialState
  );
  const [uploadState, uploadAction, uploadPending] = useActionState(
    uploadIdCard,
    initialState
  );

  async function handleSendOtp() {
    setSending(true);
    const result = await requestOtp();
    setSending(false);
    if (result.otpSent) setOtpSent(true);
    if (result.error) alert(result.error);
  }

  return (
    <div className="flex min-h-dvh items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="animate-in flex flex-col items-center">
          <QuadMark size={44} />
          <h1 className="mt-5 text-2xl font-extrabold">Verify your identity</h1>
          <p className="mt-1 text-sm text-muted">
            Prove you&apos;re a student to unlock campus services.
          </p>
        </div>

        <div className="animate-in-d1 mt-8 flex rounded-lg border border-border p-1">
          <button
            onClick={() => setMode("otp")}
            className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
              mode === "otp"
                ? "bg-surface text-ink shadow-sm"
                : "text-muted hover:text-ink"
            }`}
          >
            College email
          </button>
          <button
            onClick={() => setMode("upload")}
            className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
              mode === "upload"
                ? "bg-surface text-ink shadow-sm"
                : "text-muted hover:text-ink"
            }`}
          >
            ID card upload
          </button>
        </div>

        {mode === "otp" ? (
          <div className="animate-in-d2 mt-6 flex flex-col gap-4">
            {!otpSent ? (
              <>
                <p className="text-sm leading-relaxed text-muted">
                  We&apos;ll send a 6-digit code to your registered college
                  email address.
                </p>
                <button
                  onClick={handleSendOtp}
                  disabled={sending}
                  className="btn-primary"
                >
                  {sending ? "Sending…" : "Send verification code"}
                </button>
              </>
            ) : (
              <form action={otpAction} className="flex flex-col gap-4">
                {otpState.error && (
                  <div className="rounded-lg bg-danger/8 px-4 py-3 text-sm text-danger">
                    {otpState.error}
                  </div>
                )}
                <div className="field">
                  <label htmlFor="otp-code" className="field-label">
                    Verification code
                  </label>
                  <input
                    id="otp-code"
                    name="code"
                    placeholder="000000"
                    maxLength={6}
                    pattern="[0-9]{6}"
                    required
                    className="!text-center !text-2xl !tracking-[.5em] !font-mono"
                  />
                </div>
                <button
                  type="submit"
                  disabled={otpPending}
                  className="btn-primary"
                >
                  {otpPending ? "Verifying…" : "Verify code"}
                </button>
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={sending}
                  className="text-sm text-muted transition-colors hover:text-accent"
                >
                  Resend code
                </button>
              </form>
            )}
          </div>
        ) : (
          <form
            action={uploadAction}
            className="animate-in-d2 mt-6 flex flex-col gap-4"
          >
            {uploadState.error && (
              <div className="rounded-lg bg-danger/8 px-4 py-3 text-sm text-danger">
                {uploadState.error}
              </div>
            )}
            <p className="text-sm leading-relaxed text-muted">
              Upload a photo of your college ID card. A reviewer will verify
              your identity manually.
            </p>
            <label className="flex cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-dashed border-border px-4 py-10 text-sm text-muted transition-colors hover:border-accent/50 hover:bg-surface">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              <span className="font-medium">
                Click to upload or drag and drop
              </span>
              <span className="text-xs">JPEG, PNG, or WebP</span>
              <input
                name="idCard"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                required
                className="hidden"
              />
            </label>
            <button
              type="submit"
              disabled={uploadPending}
              className="btn-primary"
            >
              {uploadPending ? "Uploading…" : "Submit for review"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
