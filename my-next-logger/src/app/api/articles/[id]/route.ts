// src/app/api/articles/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { recordMetric } from "@/lib/metrics/edge";
import { DBMetrics } from "@/lib/db";
import { ArticleRepository } from "@/lib/repositories/article";
import logger from "@/logger";

export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
): Promise<NextResponse> {
  const { id } = context.params;
  const startTime = performance.now();

  try {
    // Použití repository s DB metrikami
    const article = await DBMetrics.measureQuery("fetch_article", () =>
      ArticleRepository.findById(id)
    );

    if (!article) {
      return NextResponse.json(
        { success: false, error: "Article not found" },
        { status: 404 }
      );
    }

    // Inkrementace počítadla zobrazení
    await DBMetrics.measureQuery("increment_views", () =>
      ArticleRepository.incrementViews(id)
    );

    recordMetric("blog_article_views_total", 1, {
      article_id: id,
      category: article.category
    });

    recordMetric(
      "blog_performance_seconds",
      (performance.now() - startTime) / 1000,
      { operation: "article_fetch" }
    );

    return NextResponse.json({
      success: true,
      data: article
    });
  } catch (error) {
    recordMetric("blog_errors_total", 1, {
      type: "article_fetch_error",
      article_id: id
    });

    return NextResponse.json(
      { success: false, error: "Failed to fetch article" },
      { status: 500 }
    );
  }
}
