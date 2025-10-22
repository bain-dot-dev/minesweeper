/**
 * Continue Modal Component
 * Mission Impossible themed modal for continue payment
 */

"use client";

import { useState, useEffect } from "react";
import { GameMode } from "@/types/gameMode";
import { GameState } from "@/types/game";
import { continuePaymentManager, PaymentResult } from "@/lib/paymentManager";
import { cn } from "@/lib/utils";

interface ContinueModalProps {
  isOpen: boolean;
  gameMode: GameMode;
  gameState: GameState;
  onContinue: () => void;
  onQuit: () => void;
  onClose: () => void;
}

export function ContinueModal({
  isOpen,
  gameMode,
  gameState,
  onContinue,
  onQuit,
  onClose,
}: ContinueModalProps) {
  const [processing, setProcessing] = useState(false);
  const [cost, setCost] = useState(0);
  const [paymentResult, setPaymentResult] = useState<PaymentResult | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  // Calculate cost when modal opens
  useEffect(() => {
    if (isOpen) {
      const calculatedCost = continuePaymentManager.calculateContinueCost(
        gameMode,
        gameState
      );
      setCost(calculatedCost);
      setError(null);
      setPaymentResult(null);
    }
  }, [isOpen, gameMode, gameState]);

  // Listen for payment events
  useEffect(() => {
    const handlePaymentSuccess = (event: CustomEvent) => {
      console.log("✅ Payment success event received:", event.detail);
      setProcessing(false);
      setPaymentResult({ success: true, paymentId: event.detail.paymentId });

      // Auto-continue after successful payment
      setTimeout(() => {
        onContinue();
      }, 1000);
    };

    const handlePaymentFailed = (event: CustomEvent) => {
      console.log("❌ Payment failed event received:", event.detail);
      setProcessing(false);
      setError(event.detail.error || "Payment failed");
    };

    const handlePaymentError = (event: CustomEvent) => {
      console.log("⚠️ Payment error event received:", event.detail);
      setProcessing(false);
      setError(event.detail.error || "Payment error occurred");
    };

    window.addEventListener(
      "paymentSuccess",
      handlePaymentSuccess as EventListener
    );
    window.addEventListener(
      "paymentFailed",
      handlePaymentFailed as EventListener
    );
    window.addEventListener(
      "paymentError",
      handlePaymentError as EventListener
    );

    return () => {
      window.removeEventListener(
        "paymentSuccess",
        handlePaymentSuccess as EventListener
      );
      window.removeEventListener(
        "paymentFailed",
        handlePaymentFailed as EventListener
      );
      window.removeEventListener(
        "paymentError",
        handlePaymentError as EventListener
      );
    };
  }, [onContinue]);

  const handleContinue = async () => {
    if (processing) return;

    setProcessing(true);
    setError(null);

    try {
      // For demo purposes, simulate payment if not configured
      if (!continuePaymentManager.isPaymentAvailable()) {
        console.log("💳 Payment system not configured, simulating payment...");

        // Simulate payment delay
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Simulate success
        setPaymentResult({
          success: true,
          paymentId: "demo-payment-" + Date.now(),
        });
        setTimeout(() => {
          onContinue();
        }, 1000);
        return;
      }

      // Get user ID from session or generate demo ID
      const userId = "demo-user-" + Date.now();

      const result = await continuePaymentManager.initiateContinuePayment(
        userId,
        gameMode,
        gameState
      );

      if (!result.success) {
        setError(result.error || "Payment failed");
        setProcessing(false);
      }
      // If successful, the payment monitoring will handle the rest
    } catch (error) {
      console.error("Continue payment error:", error);
      setError(error instanceof Error ? error.message : "Payment failed");
      setProcessing(false);
    }
  };

  const handleQuit = () => {
    setProcessing(false);
    setError(null);
    setPaymentResult(null);
    onQuit();
  };

  const handleClose = () => {
    if (!processing) {
      setError(null);
      setPaymentResult(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  const benefits = continuePaymentManager.getContinueBenefits(gameMode);
  const configStatus = continuePaymentManager.getPaymentConfigStatus();

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-mi-dark-blue border-2 border-mi-cyber-green rounded-lg shadow-2xl shadow-mi-cyber-green/20 max-w-md w-full">
        {/* Header */}
        <div className="relative p-6 border-b border-mi-cyber-green/30">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-mi-cyber-green uppercase tracking-wider">
              Mission Failed
            </h2>
            <div className="h-1 w-16 mx-auto mt-2 bg-gradient-to-r from-transparent via-mi-electric-blue to-transparent" />
          </div>

          {/* Explosion effect */}
          <div className="absolute top-2 right-2 text-2xl animate-pulse">
            💥
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Mode Info */}
          <div className="text-center">
            <div className="text-3xl mb-2">{gameMode.icon}</div>
            <h3 className="text-lg font-semibold text-white">
              {gameMode.name}
            </h3>
            <p className="text-sm text-gray-400">{gameMode.description}</p>
          </div>

          {/* Cost Display */}
          <div className="text-center">
            <div className="bg-mi-dark-blue/50 border border-mi-cyber-green/30 rounded-lg p-4">
              <div className="text-3xl font-bold text-mi-cyber-green">
                {cost} WLD
              </div>
              <div className="text-sm text-gray-400 mt-1">World Coins</div>
              {gameState.continueCount > 0 && (
                <div className="text-xs text-mi-orange mt-1">
                  Continue #{gameState.continueCount + 1} (Cost increased)
                </div>
              )}
            </div>
          </div>

          {/* Benefits */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-mi-electric-blue uppercase tracking-wide">
              Continue Benefits:
            </h4>
            <div className="space-y-1">
              {benefits.map((benefit, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 text-sm text-gray-300"
                >
                  <span className="text-mi-cyber-green">✓</span>
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Status */}
          {configStatus.fullyConfigured ? (
            <div className="text-xs text-mi-cyber-green text-center">
              ✓ Payment system configured
            </div>
          ) : (
            <div className="text-xs text-mi-orange text-center">
              ⚠ Demo mode - Payment system not configured
            </div>
          )}

          {/* Reference Materials */}
          {configStatus.referenceMaterials &&
            configStatus.referenceMaterials.length > 0 && (
              <div className="text-xs text-gray-500 text-center">
                <div className="mb-1">Reference Materials:</div>
                {configStatus.referenceMaterials.map((ref, index) => (
                  <div key={index} className="text-xs">
                    • {ref}
                  </div>
                ))}
              </div>
            )}

          {/* Error Display */}
          {error && (
            <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3">
              <div className="text-red-400 text-sm">
                <strong>Payment Error:</strong> {error}
              </div>
            </div>
          )}

          {/* Success Display */}
          {paymentResult?.success && (
            <div className="bg-mi-cyber-green/20 border border-mi-cyber-green/50 rounded-lg p-3">
              <div className="text-mi-cyber-green text-sm text-center">
                ✅ Payment successful! Continuing mission...
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleContinue}
              disabled={processing || paymentResult?.success}
              className={cn(
                "flex-1 py-3 px-4 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2",
                processing || paymentResult?.success
                  ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                  : "bg-mi-cyber-green text-black hover:bg-mi-electric-blue hover:scale-105 shadow-lg shadow-mi-cyber-green/30"
              )}
            >
              {processing ? (
                <>
                  <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                  Processing...
                </>
              ) : paymentResult?.success ? (
                <>
                  <span>✓</span>
                  Payment Complete
                </>
              ) : (
                <>
                  <span>💳</span>
                  Pay & Continue
                </>
              )}
            </button>

            <button
              onClick={handleQuit}
              disabled={processing}
              className={cn(
                "px-4 py-3 rounded-lg font-semibold transition-all duration-200",
                processing
                  ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                  : "bg-mi-dark-blue/50 text-gray-300 hover:bg-mi-dark-blue hover:text-white border border-mi-cyber-green/30 hover:border-mi-cyber-green/50"
              )}
            >
              End Mission
            </button>
          </div>

          {/* Payment Info */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
              <span>🔒</span>
              <span>Secure payment system</span>
            </div>
            <div className="text-xs text-gray-600 mt-1">
              Implementation references: World Documentation, World Coin MCP
              Server, MCP Context 7
            </div>
          </div>
        </div>

        {/* Close Button */}
        {!processing && !paymentResult?.success && (
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
