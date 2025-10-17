import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  // Generate a secure nonce - at least 8 alphanumeric characters
  const nonce = crypto.randomUUID().replace(/-/g, "");

  // Store the nonce in a secure cookie that cannot be tampered with by the client
  const cookieStore = await cookies();
  cookieStore.set("siwe", nonce, {
    secure: true,
    httpOnly: true,
    sameSite: "strict",
    maxAge: 60 * 5, // 5 minutes
  });

  return NextResponse.json({ nonce });
}
