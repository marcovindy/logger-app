// src/app/api/test-data/generate/route.ts
import { NextResponse } from "next/server";
import { recordMetric, debugMetrics } from "@/lib/metrics/edge";

function getRandomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const categories = ["tech", "news", "lifestyle"];
const statuses = ["published", "spam", "pending"];
const errorTypes = ["article_fetch_error", "comment_error", "validation_error"];

export async function GET() {
  try {
    // Article views
    const category = categories[getRandomInt(0, categories.length - 1)];
    const articleId = getRandomInt(1, 5).toString();

    console.log("Recording article view metric...");
    recordMetric("blog_article_views_total", 1, {
      category,
      article_id: articleId
    });

    // Comments
    const status = statuses[getRandomInt(0, statuses.length - 1)];
    console.log("Recording comment metric...");
    recordMetric("blog_comments_total", 1, {
      status,
      article_id: articleId
    });

    // Errors
    if (Math.random() < 0.3) {
      const errorType = errorTypes[getRandomInt(0, errorTypes.length - 1)];
      console.log("Recording error metric...");
      recordMetric("blog_errors_total", 1, {
        type: errorType,
        article_id: articleId
      });
    }

    // Debug výpis
    console.log("Current metrics state:");
    debugMetrics();

    return NextResponse.json({
      success: true,
      message: "Test data generated",
      metricsState: await fetch("http://localhost:3000/api/metrics").then((r) =>
        r.text()
      )
    });
  } catch (error) {
    console.error("Error generating test data:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
