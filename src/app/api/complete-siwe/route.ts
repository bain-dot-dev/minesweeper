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

    // Verify the SIWE message using the official verification function
    const validMessage = await verifySiweMessage(payload, nonce);

    if (validMessage.isValid) {
      // Clear the nonce after successful verification
      cookieStore.delete("siwe");

      return NextResponse.json({
        status: "success",
        isValid: true,
        user: {
          walletAddress: payload.address,
          // Note: username and profilePictureUrl are not part of the standard SIWE payload
          // They would need to be retrieved separately using MiniKit.getUserByAddress()
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
