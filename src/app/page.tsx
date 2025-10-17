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

  // ✅ CORRECT: Wallet Authentication for login (primary flow)
  const handleWalletAuth = useCallback(async () => {
    if (!isInstalled) {
      setError("World App is not available");
      return;
    }

    setAuthState("pending");
    setError(null);

    try {
      // Step 1: Get a secure nonce from the backend
      const nonceResponse = await fetch("/api/nonce");
      const { nonce } = await nonceResponse.json();

      // Step 2: Use wallet authentication with the nonce
      const { finalPayload } = await MiniKit.commandsAsync.walletAuth({
        nonce: nonce,
        expirationTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        notBefore: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        statement: "Authenticate with World App to play Minesweeper",
      });

      if (finalPayload.status === "success") {
        // Step 3: Verify the SIWE message with the backend
        const verificationResponse = await fetch("/api/complete-siwe", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            payload: finalPayload,
            nonce,
          }),
        });

        const verificationResult = await verificationResponse.json();

        if (
          verificationResult.status === "success" &&
          verificationResult.isValid
        ) {
          // Step 4: Get additional user information using MiniKit helper functions
          const userInfo = {
            walletAddress: verificationResult.user.walletAddress,
            username: username || "Anonymous",
            profilePictureUrl: undefined as string | undefined,
          };

          try {
            // Try to get user info by wallet address
            const userByAddress = await MiniKit.getUserByAddress(
              verificationResult.user.walletAddress
            );
            if (userByAddress) {
              // Only use MiniKit username if user didn't provide one
              if (!username) {
                userInfo.username = userByAddress.username || userInfo.username;
              }
              userInfo.profilePictureUrl = userByAddress.profilePictureUrl;
            }
          } catch (error) {
            console.log("Could not fetch additional user info:", error);
            // Continue with basic info if helper function fails
          }

          // Step 5: Sign in with the verified user data
          console.log("🔐 Signing in with user data:", userInfo);
          const signInResult = await signIn("credentials", {
            walletAddress: userInfo.walletAddress,
            username: userInfo.username,
            profilePictureUrl: userInfo.profilePictureUrl,
            redirectTo: "/home",
          });

          console.log("🔐 Sign in result:", signInResult);
          setAuthState("success");
        } else {
          throw new Error(verificationResult.message || "Verification failed");
        }
      } else {
        throw new Error("Wallet authentication failed");
      }
    } catch (error) {
      console.error("Wallet auth error:", error);
      setError(
        error instanceof Error ? error.message : "Authentication failed"
      );
      setAuthState("error");
    }
  }, [isInstalled, router, username]);

  // ✅ CORRECT: World ID Verification for specific actions (optional)
  const handleWorldIDVerification = useCallback(async () => {
    if (!isInstalled) {
      setError("World App is not available");
      return;
    }

    if (!actionId) {
      setError("Action ID not configured");
      return;
    }

    setAuthState("pending");
    setError(null);

    try {
      // Use verification for specific actions, not login
      const result = await MiniKit.commandsAsync.verify({
        action: actionId,
        signal: username || "minesweeper-action",
        verification_level: VerificationLevel.Orb,
      });

      const payload = result?.finalPayload;
      if (!payload || payload.status !== "success") {
        throw new Error("World ID verification did not complete.");
      }

      // Verify with server
      await verifyWithServer(payload, username || "minesweeper-action");

      setAuthState("success");
      // Note: This is for verification only, not authentication
      console.log("World ID verification successful for action:", actionId);
    } catch (error) {
      console.error("Verification error:", error);
      setError(error instanceof Error ? error.message : "Verification failed");
      setAuthState("error");
    }
  }, [actionId, username, isInstalled, verifyWithServer]);

  const handleUsernameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setUsername(e.target.value);
      setError(null);
    },
    []
  );

  // IDKit success handler for browser verification
  const handleIDKitSuccess = useCallback(
    async (result: ISuccessResult) => {
      setAuthState("pending");
      setError(null);

      try {
        await verifyWithServer(result, username);

        // Sign in with the verified user
        console.log("🔐 IDKit signing in with username:", username);
        await signIn("credentials", {
          username,
          verified: "true",
          redirectTo: "/home",
        });

        setAuthState("success");
      } catch (error) {
        console.error("IDKit verification error:", error);
        setError(
          error instanceof Error ? error.message : "Verification failed"
        );
        setAuthState("error");
      }
    },
    [username, router, verifyWithServer]
  );

  return (
    <Page>
      <Page.Main className="flex flex-col items-center justify-center gap-6 p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Minesweeper Game</h1>
          <p className="text-gray-600">Authenticate to play</p>
        </div>

        {isInstalled ? (
          <div className="w-full max-w-md space-y-4">
            {/* World App users: Wallet auth (primary) + optional verification */}
            <div className="text-center">
              <h2 className="text-lg font-semibold mb-2">Connect Wallet</h2>
              <p className="text-sm text-gray-600 mb-4">
                Use wallet authentication to play (recommended)
              </p>
            </div>

            <div>
              <input
                type="text"
                placeholder="Enter your username (optional)"
                value={username}
                onChange={handleUsernameChange}
                disabled={authState === "pending"}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">
                Username is optional - your wallet will provide your identity
              </p>
            </div>

            <LiveFeedback
              label={{
                failed: error || "Authentication failed",
                pending: "Authenticating...",
                success: "Authentication successful!",
              }}
              state={
                authState === "pending"
                  ? "pending"
                  : authState === "success"
                  ? "success"
                  : authState === "error"
                  ? "failed"
                  : undefined
              }
            >
              <Button
                onClick={handleWalletAuth}
                disabled={authState === "pending"}
                size="lg"
                variant="primary"
                className="w-full"
              >
                {authState === "pending"
                  ? "Authenticating..."
                  : "Connect Wallet"}
              </Button>
            </LiveFeedback>

            {/* Optional World ID Verification for specific actions */}
            {actionId && (
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="text-center mb-3">
                  <h3 className="text-sm font-medium text-gray-700">
                    Optional Verification
                  </h3>
                  <p className="text-xs text-gray-500">
                    Verify for specific actions
                  </p>
                </div>
                <Button
                  onClick={handleWorldIDVerification}
                  disabled={authState === "pending"}
                  size="sm"
                  variant="secondary"
                  className="w-full"
                >
                  Verify World ID (Optional)
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="w-full max-w-md space-y-6">
            {/* Browser users: World ID Kit QR code */}
            <div className="text-center">
              <h2 className="text-lg font-semibold mb-2">Verify Identity</h2>
              <p className="text-sm text-gray-600 mb-4">
                Use World ID to verify you&apos;re human (Browser)
              </p>
            </div>

            <div>
              <input
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={handleUsernameChange}
                disabled={authState === "pending"}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>

            {/* IDKit Widget for Browser Verification */}
            {appId && actionId && username.trim() && (
              <IDKitWidget
                app_id={appId as `app_${string}`}
                action={actionId}
                signal={username}
                onSuccess={handleIDKitSuccess}
                verification_level={IDKitVerificationLevel.Orb}
              >
                {({ open }) => (
                  <LiveFeedback
                    label={{
                      failed: error || "Verification failed",
                      pending: "Verifying your identity...",
                      success: "Verification successful!",
                    }}
                    state={
                      authState === "pending"
                        ? "pending"
                        : authState === "success"
                        ? "success"
                        : authState === "error"
                        ? "failed"
                        : undefined
                    }
                  >
                    <Button
                      onClick={open}
                      disabled={authState === "pending" || !username.trim()}
                      size="lg"
                      variant="primary"
                      className="w-full"
                    >
                      {authState === "pending"
                        ? "Verifying..."
                        : "Verify with World ID (Browser)"}
                    </Button>
                  </LiveFeedback>
                )}
              </IDKitWidget>
            )}

            {/* Fallback message if no app ID configured */}
            {(!appId || !actionId) && (
              <div className="text-center text-sm text-gray-500">
                <p>World ID verification not configured.</p>
                <p>Please set NEXT_PUBLIC_APP_ID and NEXT_PUBLIC_ACTION</p>
              </div>
            )}
          </div>
        )}
      </Page.Main>
    </Page>
  );
}
