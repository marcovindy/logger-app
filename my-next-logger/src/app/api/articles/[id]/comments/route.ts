// src/app/api/articles/[id]/comments/route.ts
import { NextRequest, NextResponse } from "next/server";
import { recordLatency, recordMetric } from "@/lib/metrics/edge";
import { DBMetrics } from "@/lib/db";
import { CommentRepository } from "@/lib/repositories/comment";
import { SpamService } from "@/lib/services/spam";
import type { CommentRequest } from "@/types/types";
import { PerformanceLabels } from "@/lib/metrics/types";

export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
): Promise<NextResponse> {
  const startTime = performance.now();

  try {
    const comments = await DBMetrics.measureQuery("fetch_comments", () =>
      CommentRepository.findByArticleId(context.params.id)
    );

    return NextResponse.json({
      success: true,
      data: comments
    });
  } catch (error) {
    recordMetric("blog_errors_total", 1, {
      type: "comments_fetch_error",
      article_id: context.params.id
    });

    return NextResponse.json(
      { success: false, error: "Failed to fetch comments" },
      { status: 500 }
    );
  } finally {
    recordLatency("comments_list", startTime);
  }
}

export async function POST(
  request: NextRequest,
  context: { params: { id: string } }
): Promise<NextResponse> {
  const { id } = context.params;
  const startTime = performance.now();

  try {
    const commentData: CommentRequest = await request.json();
    const isSpam = await SpamService.checkSpam(commentData);

    if (isSpam) {
      recordMetric("blog_comments_total", 1, {
        article_id: id,
        status: "spam"
      });
      return NextResponse.json(
        { success: false, error: "Comment marked as spam" },
        { status: 400 }
      );
    }

    const savedComment = await DBMetrics.measureQuery("save_comment", () =>
      CommentRepository.create({
        content: commentData.content,
        articleId: id,
        authorId: commentData.authorId
      })
    );

    recordMetric("blog_comments_total", 1, {
      article_id: id,
      status: "published"
    });

    // Pro performance metriky použijeme správný typ
    recordMetric(
      "blog_performance_seconds",
      (performance.now() - startTime) / 1000,
      { operation: "comment_save" } as PerformanceLabels
    );

    return NextResponse.json({
      success: true,
      data: savedComment
    });
  } catch (error) {
    recordMetric("blog_errors_total", 1, {
      type: "comment_save_error",
      article_id: id
    });

    return NextResponse.json(
      { success: false, error: "Failed to save comment" },
      { status: 500 }
    );
  } finally {
    recordLatency("comment_create", startTime);
  }
}
