import { handlers } from "@/auth";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const googleAuthReady = Boolean(
  process.env.AUTH_SECRET && process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET,
);

export async function GET(request: NextRequest) {
  if (!googleAuthReady) {
    return NextResponse.redirect(new URL("/account?setup=required", request.url));
  }
  return handlers.GET(request);
}

export async function POST(request: NextRequest) {
  if (!googleAuthReady) {
    return NextResponse.json(
      { message: "Google OAuth is not configured." },
      { status: 503 },
    );
  }
  return handlers.POST(request);
}
