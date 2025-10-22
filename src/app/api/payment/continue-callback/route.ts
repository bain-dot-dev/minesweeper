/**
 * Payment Continue Callback API
 * Handles payment callbacks for continues
 *
 * Reference Materials:
 * - World Documentation: For payment integration guidelines
 * - World Coin MCP Server: For API reference and endpoints
 * - MCP Context 7: For payment context management
 */

import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log("💳 Payment callback received:", {
      paymentId: body.payment_id,
      status: body.status,
      transactionId: body.transaction_id,
      amount: body.amount,
      currency: body.currency,
      metadata: body.metadata,
    });

    // Validate payment data
    if (!body.payment_id || !body.status) {
      return NextResponse.json(
        { error: "Missing required payment data" },
        { status: 400 }
      );
    }

    // Process payment status
    const paymentId = body.payment_id;
    const status = body.status;
    const transactionId = body.transaction_id;
    const amount = body.amount;
    const currency = body.currency;
    const metadata = body.metadata || {};

    // Log payment for analytics
    console.log("📊 Payment processed:", {
      paymentId,
      status,
      transactionId,
      amount,
      currency,
      gameMode: metadata.gameMode,
      level: metadata.level,
      score: metadata.score,
      continueCount: metadata.continueCount,
      timestamp: new Date().toISOString(),
    });

    // Handle different payment statuses
    switch (status) {
      case "success":
        console.log("✅ Payment successful:", paymentId);
        // In a real implementation, this would:
        // 1. Update user's game state
        // 2. Grant continue benefits
        // 3. Update analytics
        // 4. Send confirmation to client
        // Reference: World Documentation, World Coin MCP Server, MCP Context 7

        return NextResponse.json({
          success: true,
          message: "Payment processed successfully",
          paymentId,
          transactionId,
        });

      case "failed":
        console.log("❌ Payment failed:", paymentId);
        return NextResponse.json({
          success: false,
          message: "Payment failed",
          paymentId,
        });

      case "cancelled":
        console.log("⚠️ Payment cancelled:", paymentId);
        return NextResponse.json({
          success: false,
          message: "Payment cancelled",
          paymentId,
        });

      default:
        console.log("❓ Unknown payment status:", status);
        return NextResponse.json({
          success: false,
          message: "Unknown payment status",
          paymentId,
        });
    }
  } catch (error) {
    console.error("💳 Payment callback error:", error);

    return NextResponse.json(
      {
        error: "Payment callback processing failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Handle GET requests for payment verification
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const paymentId = searchParams.get("payment_id");

  if (!paymentId) {
    return NextResponse.json(
      { error: "Missing payment_id parameter" },
      { status: 400 }
    );
  }

  try {
    // In a real implementation, this would:
    // 1. Query payment provider for status
    // 2. Verify payment authenticity
    // 3. Update payment status
    // Reference: World Documentation, World Coin MCP Server, MCP Context 7

    console.log("🔍 Verifying payment:", paymentId);

    // For now, return a mock response
    return NextResponse.json({
      paymentId,
      status: "success", // This would come from actual verification
      verified: true,
    });
  } catch (error) {
    console.error("💳 Payment verification error:", error);

    return NextResponse.json(
      {
        error: "Payment verification failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
