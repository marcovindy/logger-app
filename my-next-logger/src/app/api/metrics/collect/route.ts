// src/app/api/metrics/collect/route.ts
import { NextResponse } from "next/server";
import { recordMetric } from "@/lib/metrics/edge";
import { MetricName, MetricLabels } from "@/lib/metrics/types";

interface CollectRequest {
  type: MetricName;
  value?: number;
  labels: MetricLabels;
}

export async function POST(request: Request) {
  try {
    const data: CollectRequest = await request.json();

    console.log("Collecting metric:", data);

    if (!data.type || !data.labels) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    recordMetric(data.type, data.value || 1, data.labels);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error collecting metrics:", error);
    return NextResponse.json(
      { success: false, error: "Failed to collect metrics" },
      { status: 500 }
    );
  }
}
