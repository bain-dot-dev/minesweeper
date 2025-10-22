/**
 * Continue Payment Manager
 * Handles payment integration for game continues
 *
 * Reference Materials:
 * - World Documentation: For payment integration guidelines
 * - World Coin MCP Server: For API reference and endpoints
 * - MCP Context 7: For payment context management
 */

import {
  GameMode,
  PaymentRequest,
  PaymentResponse,
  PaymentResult,
} from "@/types/gameMode";
import { GameState } from "@/types/game";

export interface PaymentStatus {
  id: string;
  status: "pending" | "success" | "failed" | "cancelled";
  transactionId?: string;
  error?: string;
}

/**
 * Simple Payment Client
 * Can be implemented using World Documentation, World Coin MCP Server, and MCP Context 7 as reference
 */
export class PaymentClient {
  private isConfigured: boolean;

  constructor() {
    this.isConfigured = this.checkConfiguration();
  }

  /**
   * Check if payment system is configured
   */
  private checkConfiguration(): boolean {
    // Simple configuration check
    return !!(
      process.env.NEXT_PUBLIC_PAYMENT_ENABLED === "true" &&
      process.env.NEXT_PUBLIC_APP_ID
    );
  }

  /**
   * Initiate payment
   * Implementation can reference World Documentation, World Coin MCP Server, and MCP Context 7
   */
  async pay(request: PaymentRequest): Promise<PaymentResponse> {
    if (!this.isConfigured) {
      throw new Error("Payment system not configured");
    }

    try {
      console.log("💳 Initiating payment:", {
        amount: request.amount,
        currency: request.currency,
        description: request.description,
        metadata: request.metadata,
      });

      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Return mock response
      return {
        id: `payment_${Date.now()}`,
        status: "pending",
        amount: request.amount,
        currency: request.currency,
        description: request.description,
        metadata: request.metadata,
      };
    } catch (error) {
      console.error("Payment error:", error);
      throw error;
    }
  }

  /**
   * Verify payment status
   */
  async verifyPayment(paymentId: string): Promise<PaymentStatus> {
    if (!this.isConfigured) {
      throw new Error("Payment system not configured");
    }

    try {
      console.log("🔍 Verifying payment:", paymentId);

      // Simulate verification delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Return mock status
      return {
        id: paymentId,
        status: "success",
        transactionId: `tx_${Date.now()}`,
      };
    } catch (error) {
      console.error("Payment verification error:", error);
      throw error;
    }
  }

  /**
   * Check if payment system is available
   */
  isAvailable(): boolean {
    return this.isConfigured;
  }
}

/**
 * Continue Payment Manager
 * Handles the complete continue payment flow
 *
 * Reference Materials:
 * - World Documentation: For payment integration guidelines
 * - World Coin MCP Server: For API reference and endpoints
 * - MCP Context 7: For payment context management
 */
export class ContinuePaymentManager {
  private paymentClient: PaymentClient;
  private paymentTimeouts: Map<string, NodeJS.Timeout> = new Map();

  constructor() {
    this.paymentClient = new PaymentClient();
  }

  /**
   * Calculate dynamic continue cost based on game state
   */
  calculateContinueCost(gameMode: GameMode, gameState: GameState): number {
    let baseCost = gameMode.continueCost;

    // Dynamic pricing based on game state
    if (gameState.continueCount > 0) {
      // Increase cost for multiple continues (1.5x per continue)
      baseCost *= Math.pow(1.5, gameState.continueCount);
    }

    // Level-based pricing for progression modes
    if (gameMode.category === "difficulty" && gameState.level) {
      baseCost += gameState.level * 10;
    }

    // Time-based discount (early continues cost less)
    if (gameState.startTime && gameState.endTime) {
      const timeElapsed = gameState.endTime - gameState.startTime;
      if (timeElapsed < 30000) {
        baseCost *= 0.8; // 20% discount for quick retries
      }
    }

    return Math.floor(baseCost);
  }

  /**
   * Initiate continue payment flow
   * Implementation can reference World Documentation, World Coin MCP Server, and MCP Context 7
   */
  async initiateContinuePayment(
    userId: string,
    gameMode: GameMode,
    gameState: GameState
  ): Promise<PaymentResult> {
    try {
      // Calculate dynamic pricing
      const cost = this.calculateContinueCost(gameMode, gameState);

      // Create payment request
      const paymentRequest: PaymentRequest = {
        userId,
        amount: cost,
        currency: "WLD",
        description: `Continue ${gameMode.name}`,
        metadata: {
          gameMode: gameMode.id,
          level: gameState.level,
          score: gameState.score,
          timestamp: Date.now(),
          continueCount: gameState.continueCount,
        },
        callbackUrl: "/api/payment/continue-callback",
      };

      console.log("💳 Initiating continue payment:", {
        mode: gameMode.id,
        cost,
        userId,
        metadata: paymentRequest.metadata,
      });

      // Initiate payment using payment client
      const payment = await this.paymentClient.pay(paymentRequest);

      // Set up payment monitoring
      const paymentId = payment.id;
      this.monitorPayment(paymentId);

      return {
        success: true,
        paymentId,
        cost,
        message: "Payment initiated successfully",
      };
    } catch (error) {
      console.error("Continue payment failed:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Payment failed",
      };
    }
  }

  /**
   * Monitor payment status
   */
  private monitorPayment(paymentId: string): void {
    const checkPayment = async () => {
      try {
        const status = await this.paymentClient.verifyPayment(paymentId);

        if (status.status === "success") {
          console.log("✅ Payment successful:", paymentId);
          this.clearPaymentTimeout(paymentId);
          // Emit success event
          window.dispatchEvent(
            new CustomEvent("paymentSuccess", {
              detail: { paymentId, transactionId: status.transactionId },
            })
          );
        } else if (
          status.status === "failed" ||
          status.status === "cancelled"
        ) {
          console.log("❌ Payment failed:", paymentId, status.error);
          this.clearPaymentTimeout(paymentId);
          // Emit failure event
          window.dispatchEvent(
            new CustomEvent("paymentFailed", {
              detail: { paymentId, error: status.error },
            })
          );
        } else {
          // Still pending, check again in 2 seconds
          const timeout = setTimeout(checkPayment, 2000);
          this.paymentTimeouts.set(paymentId, timeout);
        }
      } catch (error) {
        console.error("Payment monitoring error:", error);
        this.clearPaymentTimeout(paymentId);
        window.dispatchEvent(
          new CustomEvent("paymentError", {
            detail: {
              paymentId,
              error: error instanceof Error ? error.message : "Unknown error",
            },
          })
        );
      }
    };

    // Start monitoring
    checkPayment();
  }

  /**
   * Clear payment timeout
   */
  private clearPaymentTimeout(paymentId: string): void {
    const timeout = this.paymentTimeouts.get(paymentId);
    if (timeout) {
      clearTimeout(timeout);
      this.paymentTimeouts.delete(paymentId);
    }
  }

  /**
   * Get continue benefits for a game mode
   */
  getContinueBenefits(gameMode: GameMode): string[] {
    const benefits: string[] = [];

    // Base benefits
    benefits.push("Reset mine that was clicked");
    benefits.push("Continue from current position");

    // Mode-specific benefits
    switch (gameMode.id) {
      case "time-attack":
        benefits.push("+60 seconds bonus time");
        break;
      case "limited-moves":
        benefits.push("+10 bonus moves");
        break;
      case "survival":
        benefits.push("+30 seconds time extension");
        break;
      case "endless":
        benefits.push("Continue current level");
        break;
      case "timed-rounds":
        benefits.push("+10 seconds per round");
        break;
      default:
        benefits.push("Resume mission");
    }

    return benefits;
  }

  /**
   * Check if payment system is available
   */
  isPaymentAvailable(): boolean {
    return this.paymentClient.isAvailable();
  }

  /**
   * Get payment configuration status
   */
  getPaymentConfigStatus(): {
    paymentEnabled: boolean;
    appIdConfigured: boolean;
    fullyConfigured: boolean;
    referenceMaterials: string[];
  } {
    const paymentEnabled = process.env.NEXT_PUBLIC_PAYMENT_ENABLED === "true";
    const appIdConfigured = !!process.env.NEXT_PUBLIC_APP_ID;

    return {
      paymentEnabled,
      appIdConfigured,
      fullyConfigured: paymentEnabled && appIdConfigured,
      referenceMaterials: [
        "World Documentation - Payment Integration Guidelines",
        "World Coin MCP Server - API Reference and Endpoints",
        "MCP Context 7 - Payment Context Management",
      ],
    };
  }
}

// Singleton instance
export const continuePaymentManager = new ContinuePaymentManager();

// Export types
export type { PaymentResult } from "@/types/gameMode";
