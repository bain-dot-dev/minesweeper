# Authentication Flow Guide - World ID + Wallet Authentication

This guide explains the comprehensive authentication system used in the minesweeper project, which combines World ID verification with wallet authentication and SIWE (Sign-In with Ethereum). This system can be adapted for other projects requiring secure, decentralized authentication.

## Overview

The authentication system uses three main components:

1. **World ID Verification** - For proving human identity
2. **Wallet Authentication** - For connecting crypto wallets
3. **SIWE (Sign-In with Ethereum)** - For secure message signing
4. **NextAuth.js** - For session management

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Routes     │    │   Backend       │
│                 │    │                  │    │                 │
│ • World ID      │───▶│ • /api/nonce     │    │ • NextAuth      │
│ • Wallet Auth   │    │ • /api/verify-   │    │ • JWT Sessions  │
│ • SIWE Signing  │    │   proof          │    │ • Middleware    │
│                 │    │ • /api/complete- │    │                 │
│                 │    │   siwe           │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## Dependencies

```json
{
  "@worldcoin/idkit": "^2.4.2",
  "@worldcoin/mini-apps-ui-kit-react": "^1.0.2",
  "@worldcoin/minikit-js": "latest",
  "@worldcoin/minikit-react": "latest",
  "next-auth": "^5.0.0-beta.25"
}
```

## Step-by-Step Implementation

### 1. Environment Variables

Create a `.env.local` file with:

```env
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_ID=app_your_world_id_app_id
NEXT_PUBLIC_ACTION=your_action_id
```

### 2. NextAuth Configuration (`src/auth/index.ts`)

```typescript
import NextAuth, { type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";

// Extend NextAuth types
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
```

### 3. API Routes

#### Nonce Generation (`src/app/api/nonce/route.ts`)

```typescript
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  // Generate a secure nonce
  const nonce = crypto.randomUUID().replace(/-/g, "");

  // Store the nonce in a secure cookie
  const cookieStore = await cookies();
  cookieStore.set("siwe", nonce, {
    secure: true,
    httpOnly: true,
    sameSite: "strict",
    maxAge: 60 * 5, // 5 minutes
  });

  return NextResponse.json({ nonce });
}
```

#### World ID Proof Verification (`src/app/api/verify-proof/route.ts`)

```typescript
import {
  ISuccessResult,
  IVerifyResponse,
  verifyCloudProof,
} from "@worldcoin/minikit-js";
import { NextRequest, NextResponse } from "next/server";

interface IRequestPayload {
  payload: ISuccessResult;
  action: string;
  signal: string | undefined;
}

export async function POST(req: NextRequest) {
  const { payload, action, signal } = (await req.json()) as IRequestPayload;
  const app_id = process.env.NEXT_PUBLIC_APP_ID as `app_${string}`;

  const verifyRes = (await verifyCloudProof(
    payload,
    app_id,
    action,
    signal
  )) as IVerifyResponse;

  if (verifyRes.success) {
    return NextResponse.json({ verifyRes, status: 200 });
  } else {
    return NextResponse.json({ verifyRes, status: 400 });
  }
}
```

#### SIWE Completion (`src/app/api/complete-siwe/route.ts`)

```typescript
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import {
  MiniAppWalletAuthSuccessPayload,
  verifySiweMessage,
} from "@worldcoin/minikit-js";

interface IRequestPayload {
  payload: MiniAppWalletAuthSuccessPayload;
  nonce: string;
}

export const POST = async (req: NextRequest) => {
  try {
    const { payload, nonce } = (await req.json()) as IRequestPayload;

    // Verify the nonce matches what we stored
    const cookieStore = await cookies();
    const storedNonce = cookieStore.get("siwe")?.value;
    if (nonce !== storedNonce) {
      return NextResponse.json({
        status: "error",
        isValid: false,
        message: "Invalid nonce",
      });
    }

    // Verify the SIWE message
    const validMessage = await verifySiweMessage(payload, nonce);

    if (validMessage.isValid) {
      // Clear the nonce after successful verification
      cookieStore.delete("siwe");

      return NextResponse.json({
        status: "success",
        isValid: true,
        user: {
          walletAddress: payload.address,
        },
      });
    } else {
      return NextResponse.json({
        status: "error",
        isValid: false,
        message: "Invalid signature",
      });
    }
  } catch (error: unknown) {
    console.error("SIWE verification error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Verification failed";
    return NextResponse.json({
      status: "error",
      isValid: false,
      message: errorMessage,
    });
  }
};
```

### 4. Middleware (`middleware.ts`)

```typescript
export { auth as middleware } from "@/auth";
```

### 5. Frontend Implementation

#### Main Authentication Component

```typescript
"use client";

import { Page } from "@/components/PageLayout";
import { Button, LiveFeedback } from "@worldcoin/mini-apps-ui-kit-react";
import { MiniKit, VerificationLevel } from "@worldcoin/minikit-js";
import { useMiniKit } from "@worldcoin/minikit-js/minikit-provider";
import {
  IDKitWidget,
  ISuccessResult,
  VerificationLevel as IDKitVerificationLevel,
} from "@worldcoin/idkit";
import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function Home() {
  const [username, setUsername] = useState("");
  const [authState, setAuthState] = useState<
    "idle" | "pending" | "success" | "error"
  >("idle");
  const [error, setError] = useState<string | null>(null);
  const { isInstalled } = useMiniKit();
  const router = useRouter();

  // Get environment variables
  const appId = process.env.NEXT_PUBLIC_APP_ID || "";
  const actionId = process.env.NEXT_PUBLIC_ACTION || "";

  const verifyWithServer = useCallback(
    async (payload: ISuccessResult, signal: string) => {
      const response = await fetch("/api/verify-proof", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          payload,
          action: actionId,
          signal,
        }),
      });
      const data = await response.json();
      if (!data?.verifyRes?.success) {
        throw new Error("Unable to validate proof. Please try again.");
      }
    },
    [actionId]
  );

  // Wallet Authentication for login
  const handleWalletAuth = useCallback(async () => {
    if (!isInstalled) {
      setError("MiniKit is not installed. Please install it first.");
      return;
    }

    setAuthState("pending");
    setError(null);

    try {
      // Get nonce from server
      const nonceResponse = await fetch("/api/nonce");
      const { nonce } = await nonceResponse.json();

      // Request wallet authentication
      const authResult = await MiniKit.requestWalletAuth({
        nonce,
        message: `Sign in to Minesweeper\n\nNonce: ${nonce}`,
      });

      if (authResult.success) {
        // Verify SIWE message
        const verifyResponse = await fetch("/api/complete-siwe", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            payload: authResult.payload,
            nonce,
          }),
        });

        const verifyData = await verifyResponse.json();

        if (verifyData.isValid) {
          // Get user info from MiniKit
          const userInfo = await MiniKit.getUserByAddress(
            authResult.payload.address
          );

          // Sign in with NextAuth
          const result = await signIn("credentials", {
            walletAddress: authResult.payload.address,
            username: userInfo?.username || "Anonymous",
            profilePictureUrl: userInfo?.profilePictureUrl,
            permissions: JSON.stringify(userInfo?.permissions || {}),
            optedIntoOptionalAnalytics:
              userInfo?.optedIntoOptionalAnalytics?.toString() || "false",
            worldAppVersion: userInfo?.worldAppVersion?.toString(),
            deviceOS: userInfo?.deviceOS,
            redirect: false,
          });

          if (result?.ok) {
            setAuthState("success");
            router.push("/home");
          } else {
            setError("Authentication failed. Please try again.");
            setAuthState("error");
          }
        } else {
          setError("Invalid signature. Please try again.");
          setAuthState("error");
        }
      } else {
        setError("Wallet authentication failed. Please try again.");
        setAuthState("error");
      }
    } catch (err) {
      console.error("Wallet auth error:", err);
      setError(err instanceof Error ? err.message : "Authentication failed");
      setAuthState("error");
    }
  }, [isInstalled, router]);

  return (
    <Page>
      <Page.Header>
        <h1>Minesweeper Authentication</h1>
      </Page.Header>
      <Page.Main>
        <div className="space-y-4">
          <Button
            onClick={handleWalletAuth}
            disabled={authState === "pending"}
            className="w-full"
          >
            {authState === "pending" ? "Authenticating..." : "Connect Wallet"}
          </Button>

          {error && <LiveFeedback variant="error">{error}</LiveFeedback>}

          {authState === "success" && (
            <LiveFeedback variant="success">
              Authentication successful! Redirecting...
            </LiveFeedback>
          )}
        </div>
      </Page.Main>
    </Page>
  );
}
```

#### Protected Route Layout

```typescript
import { auth } from "@/auth";
import { Page } from "@/components/PageLayout";

export default async function TabsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // If the user is not authenticated, redirect to the login page
  if (!session) {
    redirect("/");
  }

  return <Page>{children}</Page>;
}
```

## Authentication Flow

1. **User visits the app** → Redirected to login page if not authenticated
2. **User clicks "Connect Wallet"** → MiniKit wallet authentication starts
3. **Server generates nonce** → Stored in secure HTTP-only cookie
4. **User signs message** → SIWE message with nonce
5. **Server verifies signature** → Using World ID verification
6. **User info retrieved** → From MiniKit API
7. **NextAuth session created** → JWT token with user data
8. **User redirected** → To protected area

## Security Features

- **Nonce-based protection** against replay attacks
- **HTTP-only cookies** for secure nonce storage
- **Server-side verification** of all signatures
- **JWT tokens** for stateless session management
- **Type-safe** authentication with TypeScript

## Usage in Other Projects

To adapt this authentication system for other projects:

1. **Copy the auth configuration** from `src/auth/index.ts`
2. **Implement the API routes** for nonce, verification, and SIWE
3. **Set up environment variables** for World ID and NextAuth
4. **Install required dependencies** from package.json
5. **Implement frontend components** using MiniKit and IDKit
6. **Add middleware** for route protection
7. **Customize user data** in the NextAuth configuration

## Key Benefits

- **Decentralized** - No central authority required
- **Privacy-preserving** - Uses zero-knowledge proofs
- **Secure** - Multiple layers of verification
- **User-friendly** - Simple wallet connection
- **Scalable** - Works with any Ethereum-compatible wallet

This authentication system provides a robust foundation for building decentralized applications with strong identity verification and wallet integration.
