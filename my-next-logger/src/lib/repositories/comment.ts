// src/lib/repositories/comment.ts
import prisma, { DBMetrics } from "@/lib/db";
import type { Comment } from "@prisma/client";

export class CommentRepository {
  static async findByArticleId(articleId: string) {
    return DBMetrics.measureQuery("comment_findByArticleId", () =>
      prisma.comment.findMany({
        where: { articleId },
        orderBy: { createdAt: "desc" }
      })
    );
  }

  static async create(
    data: Pick<Comment, "content" | "articleId" | "authorId">
  ) {
    return DBMetrics.measureQuery("comment_create", () =>
      prisma.comment.create({
        data: {
          ...data,
          status: "published"
        }
      })
    );
  }

  static async updateStatus(id: string, status: string) {
    return DBMetrics.measureQuery("comment_updateStatus", () =>
      prisma.comment.update({
        where: { id },
        data: { status }
      })
    );
  }
}
