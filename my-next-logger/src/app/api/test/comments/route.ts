import { recordLatency, recordMetric } from "@/lib/metrics/edge";
import { CommentRepository } from "@/lib/repositories/test/comment";
import logger from "@/logger";
import { NextRequest, NextResponse } from "next/server";

// app/api/test/comments/route.ts
export async function GET(request: NextRequest) {
  const startTime = performance.now();
  const OPERATION = "comments_list"; // Konzistentní název operace

  try {
    const articleId = "test-article-id";
    const comments = await CommentRepository.findAll(articleId);

    const duration = (performance.now() - startTime) / 1000;

    // Zaznamenáme metriku
    recordMetric("blog_performance_seconds", duration, {
      operation: OPERATION
    });

    logger.info("Test comments fetched", {
      count: comments.length,
      duration,
      operation: OPERATION
    });

    return NextResponse.json({
      success: true,
      data: comments
    });
  } catch (error) {
    recordMetric("blog_errors_total", 1, {
      operation: OPERATION
    });

    logger.error(`Failed to fetch test comments`, {
      error: error instanceof Error ? error.message : "Unknown error",
      operation: OPERATION
    });

    return NextResponse.json(
      { success: false, error: "Failed to fetch comments" },
      { status: 500 }
    );
  } finally {
    recordLatency(OPERATION, startTime);
  }
}
