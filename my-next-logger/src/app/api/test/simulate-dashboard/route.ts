// app/api/test/simulate-dashboard/route.ts
import { NextRequest, NextResponse } from "next/server";
import logger from "@/logger";
import { recordLatency, recordMetric } from "@/lib/metrics/edge";
let isSimulationRunning = false;
let simulationInterval: NodeJS.Timeout | null = null;

const operations = [
  "article_create",
  "article_fetch",
  "articles_list",
  "comment_create",
  "comment_save",
  "comments_list"
];

function getRandomOperation() {
  return operations[Math.floor(Math.random() * operations.length)];
}

// app/api/test/simulate-dashboard/route.ts

async function generateMetricsAndLogs() {
  const operation = getRandomOperation();
  const timestamp = new Date();
  const startTime = performance.now();

  try {
    const baseLatency = Math.random() * 0.3;
    const spikeLatency = Math.random() < 0.2 ? Math.random() * 1.5 : 0;
    const latency = baseLatency + spikeLatency;

    // Error simulation (15% šance)
    if (Math.random() < 0.15) {
      const errorTypes = [
        "database_error",
        "validation_error",
        "timeout_error"
      ];
      const errorType =
        errorTypes[Math.floor(Math.random() * errorTypes.length)];

      recordMetric("blog_errors_total", 1, {
        operation,
        type: errorType
      });

      // Jednodušší struktura logu
      logger.error(
        `Operation failed | operation=${operation} | type=${errorType} | latency=${(
          latency * 1000
        ).toFixed(0)}ms | code=ERR_${Math.floor(Math.random() * 1000)}`
      );
    }

    // Slow operation warning
    if (latency > 0.5) {
      logger.warn(
        `Slow operation | operation=${operation} | duration=${(
          latency * 1000
        ).toFixed(0)}ms | threshold=500ms | load=${Math.floor(
          Math.random() * 100
        )}%`
      );
    }

    // Normal operation log
    logger.info(
      `Operation completed | operation=${operation} | duration=${(
        latency * 1000
      ).toFixed(0)}ms | success=true`
    );

    // Metriky
    recordMetric("blog_performance_seconds", latency, {
      operation
    });

    recordLatency(operation, startTime);
  } catch (error) {
    logger.error(
      `System error | operation=${operation} | error=${
        error instanceof Error ? error.message : "Unknown error"
      } | code=SYS_001`
    );

    recordMetric("blog_errors_total", 1, {
      operation,
      type: "system_error"
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();

    switch (action) {
      case "start":
        if (isSimulationRunning) {
          return NextResponse.json({
            success: false,
            message: "Simulation already running"
          });
        }

        isSimulationRunning = true;
        // Generujeme více dat častěji
        simulationInterval = setInterval(generateMetricsAndLogs, 200); // 5x za sekundu

        logger.info("Dashboard simulation started", {
          timestamp: new Date(),
          configuration: {
            interval: "200ms",
            operations: operations.join(", ")
          }
        });

        return NextResponse.json({
          success: true,
          message: "Simulation started"
        });

      case "stop":
        if (!isSimulationRunning) {
          return NextResponse.json({
            success: false,
            message: "Simulation not running"
          });
        }

        if (simulationInterval) {
          clearInterval(simulationInterval);
        }
        isSimulationRunning = false;

        logger.info("Dashboard simulation stopped", {
          timestamp: new Date()
        });

        return NextResponse.json({
          success: true,
          message: "Simulation stopped"
        });

      case "status":
        return NextResponse.json({
          success: true,
          isRunning: isSimulationRunning
        });

      default:
        return NextResponse.json(
          {
            success: false,
            message: "Invalid action"
          },
          { status: 400 }
        );
    }
  } catch (error) {
    logger.error("Simulation control failed", {
      error: error instanceof Error ? error.message : "Unknown error"
    });

    return NextResponse.json(
      { success: false, error: "Failed to control simulation" },
      { status: 500 }
    );
  }
}
