// src/utils/monitoring.ts

import { articleLoadTime, errorCounter } from "@/lib/metrics/server";

export async function monitoredFetch<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const path = new URL(url).pathname;
  const timer = articleLoadTime.startTimer({
    article_id: path.split("/").pop() || "unknown",
    path: path,
    status: "pending"
  });

  try {
    const response = await fetch(url, options);
    const data = await response.json();

    if (!response.ok) {
      timer({ status: "error" });
      throw new Error(data.error || "Network response was not ok");
    }

    timer({ status: "success" });
    return data;
  } catch (error) {
    errorCounter.inc({
      type: "fetch_error",
      code: "ERROR",
      path: path,
      article_id: path.split("/").pop() || "unknown"
    });
    throw error;
  }
}
