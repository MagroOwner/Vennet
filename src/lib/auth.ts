import { compare } from "bcryptjs";
import { eq } from "drizzle-orm";
import type { NextAuthOptions, Session } from "next-auth";
import { getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { db } from "@/lib/db";
import { roles, users } from "@/lib/db/schema";
import type { Role } from "@/lib/types";

const providers: NextAuthOptions["providers"] = [
  CredentialsProvider({
    name: "Email and password",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      const email = credentials?.email?.trim().toLowerCase();
      const password = credentials?.password;
      if (!email || !password) return null;

      const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
      if (!user || !user.passwordHash || user.disabled) return null;
      if (!(await compare(password, user.passwordHash))) return null;

      return { id: user.id, email: user.email, name: user.displayName };
    },
  }),
];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    })
  );
}

const SESSION_MAX_AGE = 60 * 60 * 24 * 30;
const isProduction = process.env.NODE_ENV === "production";

export const authOptions: NextAuthOptions = {
  providers,
  // Users remain signed in for 30 days unless they sign out or clear browser data.
  session: { strategy: "jwt", maxAge: SESSION_MAX_AGE, updateAge: 60 * 60 * 24 },
  jwt: { maxAge: SESSION_MAX_AGE },
  useSecureCookies: isProduction,
  cookies: {
    sessionToken: {
      name: isProduction ? "__Secure-vennet.session-token" : "vennet.session-token",
      options: { httpOnly: true, sameSite: "lax", path: "/", secure: isProduction, maxAge: SESSION_MAX_AGE },
    },
  },
  pages: { signIn: "/login" },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider !== "google") return true;
      const email = user.email?.trim().toLowerCase();
      if (!email) return false;

      const [existing] = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);
      if (existing) {
        if (existing.disabled) return false;
        user.id = existing.id;
        return true;
      }
      const [created] = await db
        .insert(users)
        .values({ email, displayName: user.name ?? "", image: user.image ?? null, emailVerified: new Date() })
        .returning();
      await db.insert(roles).values({ userId: created.id, role: "user" }).onConflictDoNothing();
      user.id = created.id;
      return true;
    },
    async jwt({ token, user }) {
      if (user?.id) {
        token.uid = user.id;
      }
      if (typeof token.uid === "string") {
        const [row] = await db
          .select({ role: roles.role })
          .from(roles)
          .where(eq(roles.userId, token.uid))
          .limit(1);
        token.role = row?.role ?? "user";
      }
      return token;
    },
    async session({ session, token }) {
      if (typeof token.uid === "string") {
        session.user.id = token.uid;
        session.user.role = (token.role as Role | undefined) ?? "user";
      }
      return session;
    },
  },
};

export function auth(): Promise<Session | null> {
  return getServerSession(authOptions);
}

export class AuthError extends Error {}
export class PermissionError extends Error {}

export async function requireAuth(): Promise<{ userId: string; role: Role }> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new AuthError("You must be signed in.");
  }
  return { userId: session.user.id, role: session.user.role };
}

export async function requireRole(allowed: Role[]): Promise<{ userId: string; role: Role }> {
  const current = await requireAuth();
  if (!allowed.includes(current.role)) {
    throw new PermissionError("Insufficient permissions.");
  }
  return current;
}

export const requireAdmin = () => requireRole(["admin"]);
export const requireModerator = () => requireRole(["admin", "moderator"]);
