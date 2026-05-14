export const dynamic = "force-dynamic";

import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),

    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: {},
        password: {},
      },

      async authorize(credentials) {
        try {
          const email = credentials?.email?.trim().toLowerCase();
          const password = credentials?.password?.trim();

          if (!email || !password) return null;

          const user = await prisma.user.findUnique({
            where: { email },
          });

          if (!user || !user.password) {
            console.log("AUTH FAIL: user not found");
            return null;
          }

          const valid = await bcrypt.compare(password, user.password);

          if (!valid) {
            console.log("AUTH FAIL: password mismatch");
            return null;
          }

          return {
            id: user.id,
            name: user.name || "",
            email: user.email,
            image: user.image || "",
            dbId: user.id,
          };
        } catch (error) {
          console.log("AUTHORIZE ERROR:", error);
          return null;
        }
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      if (!user.email) return false;

      const cleanEmail = user.email.trim().toLowerCase();

      let existing = await prisma.user.findUnique({
        where: { email: cleanEmail },
      });

      if (!existing && account?.provider === "google") {
        existing = await prisma.user.create({
          data: {
            email: cleanEmail,
            name: user.name || "",
            image: user.image || "",
            provider: "google",
          },
        });
      }

      if (!existing) return false;

      (user as any).dbId = existing.id;

      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).dbId || (user as any).id;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id as string;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.image = token.picture;
      }

      return session;
    },
  },

  pages: {
    signIn: "/login",
  },

  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };