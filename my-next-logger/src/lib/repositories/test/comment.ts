// lib/repositories/test/comment.ts
import prisma, { DBMetrics } from "@/lib/db";
import { loadFactor } from "@/app/api/test/simulate-load/route";
import { recordLatency, recordMetric } from "@/lib/metrics/edge";
import type { Comment } from "@prisma/client";

export class CommentRepository {
  // lib/repositories/test/comment.ts
  static async findAll(articleId: string) {
    const OPERATION = "comments_list"; // Stejný název jako v endpointu
    const startTime = performance.now();

    try {
      await new Promise((resolve) => setTimeout(resolve, 50 * loadFactor));

      const result = await DBMetrics.measureQuery(OPERATION, () =>
        prisma.comment.findMany({
          where: { articleId },
          orderBy: { createdAt: "desc" }
        })
      );

      const duration = (performance.now() - startTime) / 1000;
      recordMetric("blog_performance_seconds", duration, {
        operation: OPERATION
      });

      return result;
    } catch (error) {
      recordMetric("blog_errors_total", 1, {
        operation: OPERATION
      });
      throw error;
    } finally {
      recordLatency(OPERATION, startTime);
    }
  }

  static async create(
    data: Pick<Comment, "content" | "articleId" | "authorId">
  ) {
    const startTime = performance.now();

    try {
      await new Promise((resolve) => setTimeout(resolve, 30 * loadFactor));

      const result = await DBMetrics.measureQuery("comment_create", () =>
        prisma.comment.create({
          data: {
            ...data,
            status: "published"
          }
        })
      );

      const duration = (performance.now() - startTime) / 1000;
      recordMetric("blog_performance_seconds", duration, {
        operation: "comment_create"
      });

      return result;
    } catch (error) {
      recordMetric("blog_errors_total", 1, {
        operation: "comment_create"
      });
      throw error;
    } finally {
      recordLatency("comment_create", startTime);
    }
  }
}
