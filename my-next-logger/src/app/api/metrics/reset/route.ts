// src/app/api/metrics/reset/route.ts
import { resetMetrics } from "@/lib/metrics/edge";
import { NextResponse } from "next/server";

export async function POST() {
  resetMetrics();
  return NextResponse.json({
    message: "Metrics reset",
    timestamp: Date.now()
  });
}
