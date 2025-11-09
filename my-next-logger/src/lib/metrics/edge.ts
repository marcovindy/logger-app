// src/lib/metrics/edge.ts
import {
  BaseMetricName,
  HistogramSuffix,
  MetricData,
  MetricLabels,
  MetricName
} from "./types";

// ⬇️ Globální store v rámci procesu
if (!(globalThis as any).__metricsStore) {
  (globalThis as any).__metricsStore = {};
}
const sharedMetrics: MetricData = (globalThis as any).__metricsStore;

export class MetricsStore {
  private static instance: MetricsStore;
  private metrics: MetricData;

  private histogramBuckets = [
    0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5
  ];

  private constructor() {
    this.metrics = sharedMetrics;
  }

  public static getInstance(): MetricsStore {
    if (!MetricsStore.instance) {
      MetricsStore.instance = new MetricsStore();
    }
    return MetricsStore.instance;
  }

  private getMetricKeyWithSuffix(
    baseName: BaseMetricName,
    suffix: HistogramSuffix,
    labels: MetricLabels
  ): string {
    const name = `${baseName}${suffix}` as MetricName;
    const labelString = Object.entries(labels)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}="${v}"`)
      .join(",");
    return `${name}{${labelString}}`;
  }

  public observeHistogram(
    name: BaseMetricName,
    value: number,
    labels: MetricLabels
  ) {
    const baseLabels = { ...labels };

    // Increment buckets
    this.histogramBuckets.forEach((bucket) => {
      if (value <= bucket) {
        const bucketLabels = { ...baseLabels, le: bucket.toString() };
        const bucketKey = this.getMetricKeyWithSuffix(
          name,
          "_bucket",
          bucketLabels
        );
        if (!this.metrics[bucketKey]) {
          this.metrics[bucketKey] = { value: 0, timestamp: Date.now() };
        }
        this.metrics[bucketKey].value += 1;
      }
    });

    // Record sum
    const sumKey = this.getMetricKeyWithSuffix(name, "_sum", baseLabels);
    if (!this.metrics[sumKey]) {
      this.metrics[sumKey] = { value: 0, timestamp: Date.now() };
    }
    this.metrics[sumKey].value += value;

    // Record count
    const countKey = this.getMetricKeyWithSuffix(name, "_count", baseLabels);
    if (!this.metrics[countKey]) {
      this.metrics[countKey] = { value: 0, timestamp: Date.now() };
    }
    this.metrics[countKey].value += 1;
  }

  public increment(name: MetricName, value: number = 1, labels: MetricLabels) {
    const key = this.getMetricKey(name, labels);
    if (!this.metrics[key]) {
      this.metrics[key] = { value: 0, timestamp: Date.now() };
    }
    this.metrics[key].value += value;
    this.metrics[key].timestamp = Date.now();
    console.log(`Incremented ${key} to ${this.metrics[key].value}`);
  }

  private getMetricKey(name: MetricName, labels: MetricLabels): string {
    const labelString = Object.entries(labels)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}="${v}"`)
      .join(",");
    return `${name}{${labelString}}`;
  }

  public getMetricsString(): string {
    const lines: string[] = [];

    // Counter metrics
    const counterMetrics = [
      "blog_article_views_total",
      "blog_comments_total",
      "blog_errors_total",
      "blog_db_queries_total"
    ];

    // Histogram metrics
    const histogramMetrics = [
      "blog_performance_seconds",
      "blog_db_query_duration_seconds"
    ];

    // Process counter metrics
    counterMetrics.forEach((name) => {
      lines.push(`# TYPE ${name} counter`);
      Object.entries(this.metrics)
        .filter(([key]) => key.startsWith(name))
        .forEach(([key, data]) => {
          lines.push(`${key} ${data.value}`);
        });
    });

    // Process histogram metrics
    histogramMetrics.forEach((name) => {
      lines.push(`# TYPE ${name} histogram`);

      // Get all metrics for this histogram
      const metrics = Object.entries(this.metrics).filter(([key]) =>
        key.startsWith(name)
      );

      // Group by label set (excluding 'le')
      const groupedMetrics = new Map<string, any>();
      metrics.forEach(([key, data]) => {
        const match = key.match(/\{(.+)\}/);
        if (match) {
          const labels = match[1]
            .split(",")
            .filter((l) => !l.startsWith("le="))
            .join(",");
          if (!groupedMetrics.has(labels)) {
            groupedMetrics.set(labels, {
              buckets: new Map(),
              sum: 0,
              count: 0
            });
          }
          if (key.includes("_bucket")) {
            const leMatch = key.match(/le="([^"]+)"/);
            if (leMatch) {
              groupedMetrics.get(labels).buckets.set(leMatch[1], data.value);
            }
          } else if (key.includes("_sum")) {
            groupedMetrics.get(labels).sum = data.value;
          } else if (key.includes("_count")) {
            groupedMetrics.get(labels).count = data.value;
          }
        }
      });

      // Output each group
      groupedMetrics.forEach((data, labels) => {
        this.histogramBuckets.forEach((bucket) => {
          lines.push(
            `${name}_bucket{${labels},le="${bucket}"} ${
              data.buckets.get(bucket.toString()) || 0
            }`
          );
        });
        lines.push(`${name}_sum{${labels}} ${data.sum}`);
        lines.push(`${name}_count{${labels}} ${data.count}`);
      });
    });

    lines.push("# TYPE blog_db_query_duration_seconds histogram");
    lines.push("# TYPE blog_db_queries_total counter");
    return lines.join("\n") + "\n";
  }

  public reset() {
    for (const key in this.metrics) {
      delete this.metrics[key];
    }
    console.log("Metrics reset.");
  }

  public debug() {
    console.log("Current metrics state:", this.metrics);
  }
}

export const recordMetric = (
  name: MetricName,
  value: number = 1,
  labels: MetricLabels
) => {
  MetricsStore.getInstance().increment(name, value, labels);
};

export const getMetricsString = () => {
  return MetricsStore.getInstance().getMetricsString();
};

export const resetMetrics = () => {
  MetricsStore.getInstance().reset();
};

export const debugMetrics = () => {
  MetricsStore.getInstance().debug();
};

export const recordLatency = (operation: string, startTime: number) => {
  const duration = (performance.now() - startTime) / 1000;
  MetricsStore.getInstance().observeHistogram(
    "blog_performance_seconds",
    duration,
    { operation }
  );
};

export const recordDBMetric = (operation: string, duration: number) => {
  console.log(`Recording DB metric: ${operation}, duration: ${duration}`);

  // Histogram for duration
  MetricsStore.getInstance().observeHistogram(
    "blog_db_query_duration_seconds",
    duration,
    { operation }
  );

  // Counter for number of requests
  MetricsStore.getInstance().increment("blog_db_queries_total", 1, {
    operation,
    status: duration > 0 ? "success" : "error"
  });
};
