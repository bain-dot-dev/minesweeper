"use client";

import { Page } from "@/components/PageLayout";
import { AuthButton } from "../components/AuthButton";
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

export default function Home() {
  const [username, setUsername] = useState("");
  const [verificationState, setVerificationState] = useState<
    "idle" | "pending" | "success" | "error"
  >("idle");
  const [error, setError] = useState<string | null>(null);
  const { isInstalled } = useMiniKit();
  const router = useRouter();

  // Get environment variables
  const appId = process.env.NEXT_PUBLIC_APP_ID || "";
  const actionId = process.env.NEXT_PUBLIC_ACTION || "";

  const verifyWithServer = useCallback(
    async (payload: ISuccessResult, username: string) => {
      const response = await fetch("/api/verify-proof", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          payload,
          action: actionId,
          signal: username,
        }),
      });
      const data = await response.json();
      if (!data?.verifyRes?.success) {
        throw new Error("Unable to validate proof. Please try again.");
      }
    },
    [actionId]
  );

  const handleWorldIDVerification = useCallback(async () => {
    if (!isInstalled) {
      setError("World App is not available");
      return;
    }

    if (!username.trim()) {
      setError("Please enter a username");
      return;
    }

    if (!actionId) {
      setError("Action ID not configured");
      return;
    }

    setVerificationState("pending");
    setError(null);

    try {
      const result = await MiniKit.commandsAsync.verify({
        action: actionId,
        signal: username,
        verification_level: VerificationLevel.Orb,
      });

      const payload = result?.finalPayload;
      if (!payload || payload.status !== "success") {
        throw new Error("World ID verification did not complete.");
      }

      await verifyWithServer(payload, username);
      setVerificationState("success");
      router.push(`/home?username=${encodeURIComponent(username)}`);
    } catch (error) {
      console.error("Verification error:", error);
      setError(error instanceof Error ? error.message : "Verification failed");
      setVerificationState("error");
    }
  }, [actionId, username, isInstalled, router, verifyWithServer]);

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
      setVerificationState("pending");
      setError(null);

      try {
        await verifyWithServer(result, username);
        setVerificationState("success");
        router.push(`/home?username=${encodeURIComponent(username)}`);
      } catch (error) {
        console.error("IDKit verification error:", error);
        setError(
          error instanceof Error ? error.message : "Verification failed"
        );
        setVerificationState("error");
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
          <div className="w-full max-w-md space-y-6">
            {/* Primary Authentication - Wallet Auth */}
            <div className="text-center">
              <h2 className="text-lg font-semibold mb-2">Quick Login</h2>
              <p className="text-sm text-gray-600 mb-4">
                Use your World App wallet to authenticate
              </p>
              <AuthButton />
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">or</span>
              </div>
            </div>

            {/* Secondary Authentication - MiniKit World ID Verification */}
            <div className="space-y-4">
              <div className="text-center">
                <h2 className="text-lg font-semibold mb-2">Verify Identity</h2>
                <p className="text-sm text-gray-600 mb-4">
                  Use World ID to verify you&apos;re human (MiniKit)
                </p>
              </div>

              <div>
                <input
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={handleUsernameChange}
                  disabled={verificationState === "pending"}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>

              <LiveFeedback
                label={{
                  failed: error || "Verification failed",
                  pending: "Verifying your identity...",
                  success: "Verification successful!",
                }}
                state={
                  verificationState === "pending"
                    ? "pending"
                    : verificationState === "success"
                    ? "success"
                    : verificationState === "error"
                    ? "failed"
                    : undefined
                }
              >
                <Button
                  onClick={handleWorldIDVerification}
                  disabled={verificationState === "pending" || !username.trim()}
                  size="lg"
                  variant="secondary"
                  className="w-full"
                >
                  {verificationState === "pending"
                    ? "Verifying..."
                    : "Verify with World ID (MiniKit)"}
                </Button>
              </LiveFeedback>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-md space-y-6">
            {/* Browser Authentication - IDKit World ID Verification */}
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
                disabled={verificationState === "pending"}
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
                      verificationState === "pending"
                        ? "pending"
                        : verificationState === "success"
                        ? "success"
                        : verificationState === "error"
                        ? "failed"
                        : undefined
                    }
                  >
                    <Button
                      onClick={open}
                      disabled={
                        verificationState === "pending" || !username.trim()
                      }
                      size="lg"
                      variant="primary"
                      className="w-full"
                    >
                      {verificationState === "pending"
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
