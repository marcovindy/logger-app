// src/lib/metrics/server.ts
import client from "prom-client";

export const register = new client.Registry();

export const requestCounter = new client.Counter({
  name: "app_requests_total",
  help: "Total number of requests",
  labelNames: ["method", "path", "status"],
  registers: [register]
});

export const articleViews = new client.Counter({
  name: "blog_article_views_total",
  help: "Počet zobrazení článků",
  labelNames: ["article_id", "category"],
  registers: [register]
});

export const articleLoadTime = new client.Histogram({
  name: "blog_article_load_seconds",
  help: "Doba načítání článků",
  labelNames: ["article_id", "path", "status"],
  buckets: [0.1, 0.3, 0.5, 1, 2],
  registers: [register]
});

export const commentMetrics = new client.Counter({
  name: "blog_comments_total",
  help: "Počet komentářů",
  labelNames: ["article_id", "status"],
  registers: [register]
});

export const errorCounter = new client.Counter({
  name: "blog_errors_total",
  help: "Počet chyb",
  labelNames: ["type", "code", "path", "article_id"],
  registers: [register]
});

// Performance metriky
export const performanceMetrics = new client.Histogram({
  name: "blog_performance",
  help: "Performance metrics",
  labelNames: ["operation"],
  buckets: [0.1, 0.5, 1, 2, 5],
  registers: [register]
});

// DB metriky
export const dbQueryDuration = new client.Histogram({
  name: "blog_db_query_duration_seconds",
  help: "Duration of database queries",
  labelNames: ["operation"],
  buckets: [0.1, 0.3, 0.5, 1, 2],
  registers: [register]
});

export const dbQueries = new client.Counter({
  name: "blog_db_queries_total",
  help: "Total number of database queries",
  labelNames: ["operation", "status"],
  registers: [register]
});

export const recordMetric = (
  name: string,
  value: number,
  labels: Record<string, string>
) => {
  switch (name) {
    case "blog_db_query_duration_seconds":
      dbQueryDuration.observe(labels, value);
      break;
    case "blog_db_queries_total":
      dbQueries.inc(labels);
      break;
  }
};
