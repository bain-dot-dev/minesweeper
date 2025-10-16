import NextAuth, { type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";

declare module "next-auth" {
  interface User {
    walletAddress?: string;
    username?: string;
    profilePictureUrl?: string;
    permissions?: {
      notifications: boolean;
      contacts: boolean;
    };
    optedIntoOptionalAnalytics?: boolean;
    worldAppVersion?: number;
    deviceOS?: string;
  }

  interface Session {
    user: {
      walletAddress?: string;
      username?: string;
      profilePictureUrl?: string;
      permissions?: {
        notifications: boolean;
        contacts: boolean;
      };
      optedIntoOptionalAnalytics?: boolean;
      worldAppVersion?: number;
      deviceOS?: string;
    } & DefaultSession["user"];
  }
}

// Auth configuration for wallet authentication and World ID verification
export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      name: "Wallet Authentication",
      credentials: {
        walletAddress: { label: "Wallet Address", type: "text" },
        username: { label: "Username", type: "text" },
        profilePictureUrl: { label: "Profile Picture URL", type: "text" },
        permissions: { label: "Permissions", type: "text" },
        optedIntoOptionalAnalytics: { label: "Analytics Opt-in", type: "text" },
        worldAppVersion: { label: "World App Version", type: "text" },
        deviceOS: { label: "Device OS", type: "text" },
      },
      authorize: async (credentials) => {
        const {
          walletAddress,
          username,
          profilePictureUrl,
          permissions,
          optedIntoOptionalAnalytics,
          worldAppVersion,
          deviceOS,
        } = credentials as {
          walletAddress?: string;
          username?: string;
          profilePictureUrl?: string;
          permissions?: string;
          optedIntoOptionalAnalytics?: string;
          worldAppVersion?: string;
          deviceOS?: string;
        };

        if (!walletAddress) {
          return null;
        }

        return {
          id: walletAddress,
          walletAddress,
          username,
          profilePictureUrl,
          permissions: permissions ? JSON.parse(permissions) : undefined,
          optedIntoOptionalAnalytics: optedIntoOptionalAnalytics === "true",
          worldAppVersion: worldAppVersion
            ? parseInt(worldAppVersion)
            : undefined,
          deviceOS,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id;
        token.walletAddress = user.walletAddress;
        token.username = user.username;
        token.profilePictureUrl = user.profilePictureUrl;
        token.permissions = user.permissions;
        token.optedIntoOptionalAnalytics = user.optedIntoOptionalAnalytics;
        token.worldAppVersion = user.worldAppVersion;
        token.deviceOS = user.deviceOS;
      }

      return token;
    },
    session: async ({ session, token }) => {
      if (token.userId) {
        session.user.id = token.userId as string;
        session.user.walletAddress = token.walletAddress as string;
        session.user.username = token.username as string;
        session.user.profilePictureUrl = token.profilePictureUrl as string;
        session.user.permissions = token.permissions as {
          notifications: boolean;
          contacts: boolean;
        };
        session.user.optedIntoOptionalAnalytics =
          token.optedIntoOptionalAnalytics as boolean;
        session.user.worldAppVersion = token.worldAppVersion as number;
        session.user.deviceOS = token.deviceOS as string;
      }

      return session;
    },
  },
});
