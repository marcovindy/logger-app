// app/api/alerts/test/route.ts
import { NextRequest, NextResponse } from "next/server";
import logger from "@/logger";

export async function POST(request: NextRequest) {
  logger.info("Test webhook received", {
    method: request.method,
    headers: Object.fromEntries(request.headers)
  });

  return NextResponse.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    message: "Webhook endpoint is working"
  });
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    status: "ok",
    message: "Webhook endpoint is working"
  });
}
