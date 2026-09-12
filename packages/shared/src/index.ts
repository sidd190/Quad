export type VerificationMethod = "college_email" | "manual_id";

export type VerificationStatus =
  | "unverified"
  | "pending_review"
  | "verified"
  | "rejected";

export interface StudentClaims {
  sub: string;
  name: string;
  institution: string;
  student_verified: boolean;
  verification_method: VerificationMethod;
}
