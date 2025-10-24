import { NextRequest, NextResponse } from "next/server";
import { withApiErrorHandler } from "@/lib/error_logging/server-handlers";

async function handler(request: NextRequest) {
  // Simulate some processing that might fail
  const { searchParams } = new URL(request.url);
  const shouldFail = searchParams.get("fail") === "true";

  if (shouldFail) {
    throw new Error("Simulated API error for testing error logging");
  }

  return NextResponse.json({
    message: "API route working correctly",
    timestamp: new Date().toISOString(),
  });
}

export const GET = withApiErrorHandler(handler);
