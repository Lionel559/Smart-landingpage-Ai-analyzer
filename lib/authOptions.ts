import { NextAuthOptions } from "next-auth";
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
        const email = credentials?.email?.trim().toLowerCase();
        const password = credentials?.password?.trim();

        if (!email || !password) return null;

        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user || !user.password) return null;

        const valid = await bcrypt.compare(password, user.password);

        if (!valid) return null;

        return {
          id: user.id,
          name: user.name || "",
          email: user.email,
          image: user.image || "",
          dbId: user.id,
        } as any;
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
      }

      return session;
    },
  },

  pages: {
    signIn: "/login",
  },

  secret: process.env.NEXTAUTH_SECRET,
};