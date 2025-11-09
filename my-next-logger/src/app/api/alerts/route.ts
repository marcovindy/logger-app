// app/api/alerts/route.ts
import { NextRequest, NextResponse } from "next/server";
import logger from "@/logger";

interface AlertWebhook {
  receiver: string;
  status: "firing" | "resolved";
  alerts: {
    status: "firing" | "resolved";
    labels: {
      alertname: string;
      severity: string;
      [key: string]: string;
    };
    annotations: {
      description: string;
      summary: string;
      [key: string]: string;
    };
    startsAt: string;
    endsAt: string;
    value: string;
  }[];
  groupLabels: Record<string, string>;
  commonLabels: Record<string, string>;
  commonAnnotations: Record<string, string>;
}

// app/api/alerts/route.ts
import { AlertProcessor } from "@/lib/alerts/processor";

export async function POST(request: NextRequest) {
  try {
    const alertData: AlertWebhook = await request.json();

    for (const alert of alertData.alerts) {
      await AlertProcessor.processAlert(alert);
    }

    logger.info("Processed alert webhook", {
      alertCount: alertData.alerts.length,
      status: alertData.status
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error("Error processing alert webhook", {
      error: error instanceof Error ? error.message : "Unknown error"
    });

    return NextResponse.json(
      { success: false, error: "Failed to process alert" },
      { status: 500 }
    );
  }
}
