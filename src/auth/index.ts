import NextAuth, { type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";

declare module "next-auth" {
  interface User {
    username: string;
    verified: boolean;
  }

  interface Session {
    user: {
      username: string;
      verified: boolean;
    } & DefaultSession["user"];
  }
}

// Simplified auth configuration for World ID verification only
export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      name: "World ID Verification",
      credentials: {
        username: { label: "Username", type: "text" },
        verified: { label: "Verified", type: "text" },
      },
      authorize: async (credentials) => {
        const { username, verified } = credentials as {
          username?: string;
          verified?: string;
        };

        if (!username || verified !== "true") {
          return null;
        }

        return {
          id: username,
          username,
          verified: true,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id;
        token.username = user.username;
        token.verified = user.verified;
      }

      return token;
    },
    session: async ({ session, token }) => {
      if (token.userId) {
        session.user.id = token.userId as string;
        session.user.username = token.username as string;
        session.user.verified = token.verified as boolean;
      }

      return session;
    },
  },
});
