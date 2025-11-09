// src/utils/metrics.ts

import { errorCounter } from "@/lib/metrics/server";
import { ApplicationError } from "./errors";

export function recordError(error: Error, type: string): void {
  errorCounter.inc({
    type,
    code: error instanceof ApplicationError ? error.code : "UNKNOWN"
  });
}

export function startTimer(metric: any, labels: Record<string, string>) {
  const end = metric.startTimer(labels);
  return {
    end,
    error: () => {
      end();
      recordError(new Error("Timer ended with error"), "timer_error");
    }
  };
}
