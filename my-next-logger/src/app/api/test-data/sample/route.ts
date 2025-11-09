// src/app/api/test-data/sample/route.ts
import { NextResponse } from "next/server";
import { recordMetric } from "@/lib/metrics/edge";
import {
  ArticleViewLabels,
  CommentLabels,
  ErrorLabels
} from "@/lib/metrics/types";
import logger from "@/logger";

export async function GET() {
  logger.info("test");
  logger.info("test");
  logger.info("test");
  logger.info("test");
  logger.info("test");
  logger.warn("test");
  logger.error("test");

  try {
    // Generujeme fixní data pro test s správnými typy
    const testData = [
      {
        name: "blog_article_views_total" as const,
        labels: { category: "tech", article_id: "1" } as ArticleViewLabels,
        value: 5
      },
      {
        name: "blog_article_views_total" as const,
        labels: { category: "news", article_id: "2" } as ArticleViewLabels,
        value: 3
      },
      {
        name: "blog_comments_total" as const,
        labels: { status: "published", article_id: "1" } as CommentLabels,
        value: 2
      },
      {
        name: "blog_errors_total" as const,
        labels: { type: "article_fetch_error", article_id: "1" } as ErrorLabels,
        value: 1
      }
    ];

    // Zaznamenáme všechna testovací data
    testData.forEach(({ name, labels, value }) => {
      recordMetric(name, value, labels);
    });

    const metricsState = await fetch("http://localhost:3000/api/metrics").then(
      (r) => r.text()
    );

    return NextResponse.json({
      success: true,
      message: "Sample data generated",
      metricsState
    });
  } catch (error) {
    console.error("Error generating sample data:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
