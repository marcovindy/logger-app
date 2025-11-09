// app/api/test/simulate-logs/route.ts
import { NextRequest, NextResponse } from "next/server";
import logger from "@/logger";

let isSimulationRunning = false;
let simulationInterval: NodeJS.Timeout | null = null;

const users = ["user1", "user2", "user3"];
const articles = ["article1", "article2", "article3"];
const actions = ["view", "edit", "comment", "share"];

function getRandomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

async function generateLog() {
  const userId = getRandomItem(users);
  const articleId = getRandomItem(articles);
  const action = getRandomItem(actions);

  // INFO log
  logger.info("User activity logged", {
    event: `article_${action}`,
    userId,
    articleId,
    timestamp: new Date(),
    metadata: {
      platform: "web",
      sessionId: crypto.randomUUID()
    }
  });

  // WARNING log (30% šance)
  if (Math.random() < 0.3) {
    logger.warn("Performance warning", {
      operation: `article_${action}`,
      duration: "500ms",
      threshold: "200ms",
      userId
    });
  }

  // ERROR log (10% šance)
  if (Math.random() < 0.1) {
    logger.error("Operation failed", {
      operation: `article_${action}`,
      userId,
      articleId,
      error: "Simulated error",
      errorCode: "SIM_001"
    });
  }

  // DEBUG log
  logger.debug("Operation details", {
    userId,
    articleId,
    action,
    processingTime: Math.random() * 100,
    timestamp: new Date()
  });
}

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();

    switch (action) {
      case "start":
        if (isSimulationRunning) {
          return NextResponse.json({
            success: false,
            message: "Simulation is already running"
          });
        }

        isSimulationRunning = true;
        simulationInterval = setInterval(generateLog, 1000);

        logger.info("Log simulation started", {
          timestamp: new Date(),
          interval: "1s"
        });

        return NextResponse.json({
          success: true,
          message: "Simulation started"
        });

      case "stop":
        if (!isSimulationRunning) {
          return NextResponse.json({
            success: false,
            message: "Simulation is not running"
          });
        }

        if (simulationInterval) {
          clearInterval(simulationInterval);
        }
        isSimulationRunning = false;

        logger.info("Log simulation stopped", {
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
