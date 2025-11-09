// app/api/test-data/alert/route.ts
import { NextRequest, NextResponse } from "next/server";
import { AlertProcessor } from "@/lib/alerts/processor";

export async function POST(request: NextRequest) {
  try {
    // Simulace alertu
    const testAlert = {
      status: "firing",
      labels: {
        alertname: "Test High Latency",
        severity: "warning"
      },
      annotations: {
        description: "Test alert for high latency",
        summary: "Latency is high"
      },
      value: "0.75"
    };

    await AlertProcessor.processAlert(testAlert);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to create test alert" },
      { status: 500 }
    );
  }
}
