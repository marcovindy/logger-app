// scripts/test/simulate-traffic.ts
import logger from "@/logger";

async function simulateTraffic() {
  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  logger.info("Starting traffic simulation");

  try {
    for (let i = 0; i < 10; i++) {
      // Zvýšit load factor
      await fetch("http://localhost:3000/api/test/simulate-load", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "increase" })
      });

      // Více requestů v každém cyklu
      for (let j = 0; j < 5; j++) {
        // Paralelní requesty
        await Promise.all(
          Array(10)
            .fill(null)
            .map(async () => {
              const response = await fetch(
                "http://localhost:3000/api/test/comments"
              );
              return response.json();
            })
        );

        // Krátká pauza mezi batchi
        await delay(200);
      }

      logger.info(`Simulation cycle ${i + 1} completed`, {
        loadFactor: i + 1.5
      });

      // Kratší delay mezi cykly
      await delay(500);
    }
  } catch (error) {
    logger.error("Simulation failed", {
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
}

simulateTraffic();
