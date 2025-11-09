// src/lib/metrics/client.ts
export const recordMetric = async (
  type: string,
  data: Record<string, string | number>
) => {
  try {
    await fetch("/api/metrics/collect", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        type,
        data
      })
    });
  } catch (error) {
    console.error("Failed to record metric:", error);
  }
};
