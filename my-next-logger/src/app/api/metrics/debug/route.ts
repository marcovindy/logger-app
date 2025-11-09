// src/app/api/metrics/debug/route.ts
import { NextResponse } from "next/server";
import { debugMetrics } from "@/lib/metrics/edge";

export async function GET() {
  debugMetrics();
  return NextResponse.json({
    message: "Check server console for metrics debug info",
    timestamp: Date.now()
  });
}
