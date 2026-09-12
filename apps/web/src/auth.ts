import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { getUserById } from "./lib/keycloak-admin";

declare module "next-auth" {
  interface User {
    verificationStatus?: string;
    university?: string;
    role?: string;
  }
  interface Session {
    user: User & {
      id: string;
      verificationStatus?: string;
      university?: string;
      role?: string;
    };
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        const res = await fetch(
          `${process.env.KEYCLOAK_ADMIN_URL}/realms/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/token`,
          {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
              client_id: process.env.AUTH_KEYCLOAK_ID!,
              grant_type: "password",
              username: credentials.email as string,
              password: credentials.password as string,
            }),
          }
        );

        if (!res.ok) return null;

        const tokens = await res.json();
        const payload = JSON.parse(
          Buffer.from(tokens.access_token.split(".")[1], "base64url").toString()
        );

        const kcUser = await getUserById(payload.sub);

        return {
          id: payload.sub,
          name: payload.name ?? payload.preferred_username,
          email: payload.email,
          verificationStatus:
            kcUser?.attributes?.verification_status?.[0] ?? "unverified",
          university: kcUser?.attributes?.university?.[0],
          role: kcUser?.attributes?.role?.[0],
        };
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.verificationStatus = user.verificationStatus;
        token.university = user.university;
        token.role = user.role;
        token.lastRefresh = Date.now();
      }

      const lastRefresh = (token.lastRefresh as number) ?? 0;
      if (Date.now() - lastRefresh > 15_000) {
        const kcUser = await getUserById(token.id as string);
        if (kcUser) {
          token.verificationStatus =
            kcUser.attributes?.verification_status?.[0] ?? "unverified";
          token.role = kcUser.attributes?.role?.[0];
        }
        token.lastRefresh = Date.now();
      }

      return token;
    },
    session({ session, token }) {
      session.user.id = token.id as string;
      session.user.verificationStatus = token.verificationStatus as string;
      session.user.university = token.university as string;
      session.user.role = token.role as string | undefined;
      return session;
    },
  },
});
