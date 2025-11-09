// src/lib/metrics/db.ts
import { MetricsStore, recordDBMetric, recordMetric } from "@/lib/metrics/edge";

export class DBMetrics {
  static async measureQuery<T>(
    operation: string,
    queryFn: () => Promise<T>
  ): Promise<T> {
    const startTime = performance.now();
    try {
      const result = await queryFn();
      const duration = (performance.now() - startTime) / 1000;

      recordDBMetric(operation, duration);

      MetricsStore.getInstance().increment("blog_db_operations_count", 1, {
        operation,
        status: "success"
      });

      MetricsStore.getInstance().observeHistogram(
        "blog_db_query_duration_seconds",
        duration,
        { operation }
      );

      return result;
    } catch (error) {
      recordMetric("blog_db_queries_total", 1, {
        operation,
        status: "error"
      });
      throw error;
    }
  }
}
