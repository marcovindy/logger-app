// src/app/api/metrics/route.ts
import { NextResponse } from "next/server";
import { getMetricsString } from "@/lib/metrics/edge";

export const runtime = "nodejs";

export async function GET() {
  const metricsString = getMetricsString();
  console.log("Serving metrics:", metricsString);

  return new NextResponse(metricsString, {
    headers: {
      "Content-Type": "text/plain"
    }
  });
}
